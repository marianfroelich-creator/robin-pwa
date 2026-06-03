// Vercel serverless function — returns Google Calendar events for a date or month.
//
// GET /api/calendar-events?date=YYYY-MM-DD       → events for a single day
// GET /api/calendar-events?year=YYYY&month=M     → events for a month (1-indexed)
//
// Reads g_refresh cookie, refreshes access token, queries the user's primary
// calendar via Google Calendar API v3. Returns a flat array; clients filter
// + format in local time.
//
// Required env vars: COOKIE_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

import crypto from "crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}
function safeEqualHex(a, b) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1));
  }
  return out;
}
function readSignedCookie(raw, secret) {
  if (!raw) return null;
  const [value, sig] = raw.split(".");
  if (!value || !sig) return null;
  if (!safeEqualHex(sign(value, secret), sig)) return null;
  return Buffer.from(value, "base64url").toString("utf8");
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieSecret = process.env.COOKIE_SECRET;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!cookieSecret || !clientId || !clientSecret) {
    return res.status(500).json({ error: "server config missing" });
  }
  const refreshToken = readSignedCookie(cookies.g_refresh, cookieSecret);
  if (!refreshToken) return res.status(401).json({ error: "not connected" });

  // Resolve the time range. We pad by ±1 day so that timezone differences
  // between server (UTC) and client never drop edge-of-day events.
  let timeMin, timeMax;
  const { date, year, month } = req.query;
  if (date) {
    const base = new Date(`${date}T00:00:00Z`);
    if (isNaN(base.getTime())) return res.status(400).json({ error: "bad date" });
    const start = new Date(base.getTime() - 24 * 60 * 60 * 1000);
    const end = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000);
    timeMin = start.toISOString();
    timeMax = end.toISOString();
  } else if (year && month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (!y || !m || m < 1 || m > 12) return res.status(400).json({ error: "bad year/month" });
    const start = new Date(Date.UTC(y, m - 1, 1));
    start.setUTCDate(start.getUTCDate() - 1);
    const end = new Date(Date.UTC(y, m, 1));
    end.setUTCDate(end.getUTCDate() + 1);
    timeMin = start.toISOString();
    timeMax = end.toISOString();
  } else {
    return res.status(400).json({ error: "missing date or year+month" });
  }

  try {
    const tr = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const td = await tr.json();
    if (!tr.ok || !td.access_token) {
      return res.status(401).json({ error: "refresh failed", detail: td.error_description || td.error });
    }
    const accessToken = td.access_token;

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
      `?timeMin=${encodeURIComponent(timeMin)}` +
      `&timeMax=${encodeURIComponent(timeMax)}` +
      `&singleEvents=true&orderBy=startTime&maxResults=250`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ error: "calendar fetch failed", detail: errText.slice(0, 240) });
    }
    const d = await r.json();
    const events = (d.items || []).map(ev => ({
      id: ev.id,
      title: ev.summary || "(no title)",
      start: ev.start?.dateTime || ev.start?.date || "",
      end:   ev.end?.dateTime   || ev.end?.date   || "",
      allDay: !ev.start?.dateTime,
      location: ev.location || null,
      htmlLink: ev.htmlLink || null,    // deep-link to view/edit in Google Calendar
    }));
    return res.status(200).json({ events });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

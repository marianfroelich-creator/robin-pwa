// Vercel serverless function — produces a short morning briefing paragraph
// synthesized from the user's calendar + flagged inbox + onboarding profile.
//
// 200 { briefing: "Good morning. ..." }
// 401 if not signed in
//
// Required env vars: COOKIE_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ANTHROPIC_API_KEY

import crypto from "crypto";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const MAIL_LIMIT = 40;       // candidate unread to consider
const CAL_LOOKAHEAD_HOURS = 24;

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

async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error(d.error_description || d.error || "refresh failed");
  return d.access_token;
}

async function fetchTodayEvents(accessToken) {
  const now = new Date();
  const start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + CAL_LOOKAHEAD_HOURS * 60 * 60 * 1000);
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
    `?timeMin=${encodeURIComponent(start.toISOString())}` +
    `&timeMax=${encodeURIComponent(end.toISOString())}` +
    `&singleEvents=true&orderBy=startTime&maxResults=50`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) return [];
  const d = await r.json();
  // Keep only events on today's local date AND still upcoming (end > now,
  // so the briefing reflects what's still ahead). All-day events stay all day.
  const todayStr = now.toDateString();
  return (d.items || []).filter(ev => {
    const startIso = ev.start?.dateTime || ev.start?.date;
    if (!startIso) return false;
    const dt = ev.start?.dateTime ? new Date(startIso) : new Date(startIso + "T00:00:00");
    if (dt.toDateString() !== todayStr) return false;
    // Only filter timed events; let all-day stay visible all day.
    if (ev.start?.dateTime) {
      const endIso = ev.end?.dateTime || ev.start?.dateTime;
      if (new Date(endIso) <= now) return false;
    }
    return true;
  }).map(ev => ({
    title: ev.summary || "(no title)",
    time: ev.start?.dateTime
      ? new Date(ev.start.dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "all day",
  }));
}

async function fetchTopMail(accessToken) {
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent("is:unread newer_than:7d")}&maxResults=${MAIL_LIMIT}`;
  const lr = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!lr.ok) return [];
  const ld = await lr.json();
  const ids = (ld.messages || []).map(m => m.id).slice(0, MAIL_LIMIT);
  if (ids.length === 0) return [];

  return Promise.all(ids.map(async id => {
    const mr = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const md = await mr.json();
    const headers = md.payload?.headers || [];
    const get = name => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
    const rawFrom = get("From");
    const fromName = rawFrom.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || rawFrom;
    return { from: fromName, subject: get("Subject"), snippet: md.snippet || "" };
  }));
}

function timeBucket(hour) {
  if (hour >= 5  && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late night";
}

function buildPrompt({ firstName, profile, events, mail, hour, weekday }) {
  const eventList = events.length
    ? events.map(e => `- ${e.time} — ${e.title}`).join("\n")
    : "(none)";
  const mailList = mail.length
    ? mail.slice(0, MAIL_LIMIT).map((m, i) => `[${i}] From: ${m.from} | Subject: ${m.subject} | Snippet: ${m.snippet.slice(0, 160)}`).join("\n")
    : "(none)";
  const name = firstName ? `, ${firstName}` : "";
  const bucket = timeBucket(hour);

  return `You are Robin — a warm, dry, competent personal assistant. Like a sharp friend who's tapped into culture and has dry wit. You handle things and occasionally say something that makes the user smile. You never crack jokes. You never sound like a corporate bot.

Robin's canonical voice (match this register):
- "I'm all over it."
- "Say it and I'll sort it."
- "I got you."
- "On it boss."
- "Already done."
- "Already handled."
- "Heads up. Call dad in 5."
- "Holy free afternoon." (when there's a win)

Don't write "How may I assist you?" / "Sure!" / "Of course!" — that's not Robin.

Now write the user's briefing — 2 to 4 short sentences, conversational, spoken aloud. No bullet points, no formatting.

User local time: ${hour}:00 — ${bucket}
User local day: ${weekday}

Open with a short, time-aware greeting in Robin's voice. VARY the greeting — don't always say "Good morning." Some examples (use these for register, don't copy verbatim):
- morning: "Morning${name}." / "Heads up${name}." / "Up and at 'em${name}." / "Today's stacked${name}."
- afternoon: "Hey${name}." / "Quick update." / "Catching you up." / "Holy free afternoon${name}." (only if the day is genuinely light)
- evening: "Wrapping up${name}." / "Quick recap." / "Almost done${name}."
- late night: "You up${name}? I don't sleep either." / "Quick one${name}."

Use the first name lightly — don't repeat it within the briefing.

What this user said they care about:
FAMILY (always flag mail from these people): ${profile.family || "(no preference)"}
OTHER PEOPLE: ${profile.people || "(no preference)"}
WORK: ${profile.work || "(no preference)"}
INBOX TYPES (bills, late payments, expired cards, waiting on me, etc.): ${profile.inbox || "(no preference)"}

Today's calendar:
${eventList}

Recent unread inbox (last 7d):
${mailList}

Rules:
- Weave events naturally. Don't list mechanically.
- For email, summarize what the sender wants or why it matters — natural-language summaries, NOT raw subject lines or preheaders. e.g. "Sarah's pinging you about Friday's dinner" not "Subject: dinner Friday?"
- Mention emails that match the user's stated priorities.
- If nothing notable, say so dryly — no manufactured urgency.
- Never invent events or emails. If empty, reflect that.
- Avoid em-dashes. Avoid awkward verbatim quoting.
- Don't open the same way twice — the user reloads several times a day.

Return only the briefing text — no quotes, no preamble, no markdown.`;
}

async function callClaude(apiKey, prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || `Claude HTTP ${r.status}`);
  return (data.content?.[0]?.text || "").trim();
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieSecret = process.env.COOKIE_SECRET;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!cookieSecret || !clientId || !clientSecret || !anthropicKey) {
    return res.status(500).json({ error: "server config missing" });
  }
  const refreshToken = readSignedCookie(cookies.g_refresh, cookieSecret);
  if (!refreshToken) return res.status(401).json({ error: "not connected" });

  // Profile (may be missing if user skipped all three turns)
  let profile = { family: "", people: "", work: "", inbox: "" };
  const rawProfile = readSignedCookie(cookies.g_profile, cookieSecret);
  if (rawProfile) {
    try { profile = { ...profile, ...JSON.parse(rawProfile) }; } catch {}
  }

  // First name for the greeting
  let firstName = "";
  const rawUser = readSignedCookie(cookies.g_user, cookieSecret);
  if (rawUser) {
    try {
      const u = JSON.parse(rawUser);
      firstName = u.given_name || (u.name || "").split(" ")[0] || "";
    } catch {}
  }

  // Client passes its local hour and weekday so the greeting is time-of-day-aware
  // regardless of server timezone. Fall back to UTC if absent.
  const nowUtc = new Date();
  const hour = Number.isFinite(parseInt(req.query?.hour, 10))
    ? Math.max(0, Math.min(23, parseInt(req.query.hour, 10)))
    : nowUtc.getUTCHours();
  const weekday = (req.query?.weekday && /^[A-Za-z]+$/.test(req.query.weekday))
    ? req.query.weekday
    : nowUtc.toLocaleDateString("en-US", { weekday: "long" });

  try {
    const accessToken = await refreshAccessToken(refreshToken, clientId, clientSecret);
    const [events, mail] = await Promise.all([
      fetchTodayEvents(accessToken),
      fetchTopMail(accessToken),
    ]);
    const briefing = await callClaude(anthropicKey, buildPrompt({ firstName, profile, events, mail, hour, weekday }));
    return res.status(200).json({
      briefing,
      eventCount: events.length,
      mailCount: mail.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

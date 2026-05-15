// Vercel serverless function — returns the top 3 "hottest" Gmail messages
// based on the user's onboarding profile (signed g_profile cookie).
//
// Flow:
//   1. Read g_refresh + g_profile cookies (both signed).
//   2. Exchange refresh token for a short-lived access token.
//   3. Pull the last ~50 unread message metadata from Gmail.
//   4. Send (from, subject, snippet) + the user's profile to Claude Haiku,
//      ask it to pick the top 3 with a one-line rationale.
//   5. Return ranked results to the client.
//
// If the profile is empty (user skipped onboarding), fall back to Gmail's
// own importance flag so the card has something to show.
//
// Required env vars: COOKIE_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ANTHROPIC_API_KEY

import crypto from "crypto";

const CANDIDATE_LIMIT = 50;        // how many recent unreads to consider
const TOP_N = 3;                   // how many to surface
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

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

async function listIds(accessToken, query, max) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${max}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`Gmail list failed: ${r.status}`);
  const d = await r.json();
  return (d.messages || []).map(m => m.id);
}

async function fetchMetadata(accessToken, id) {
  const r = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const md = await r.json();
  const headers = md.payload?.headers || [];
  const get = name => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
  const rawFrom = get("From");
  const fromName = rawFrom.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || rawFrom;
  return {
    id,
    from: fromName,
    subject: get("Subject"),
    snippet: md.snippet || "",
  };
}

function buildRankingPrompt(profile, candidates) {
  const lines = candidates.map((m, i) =>
    `[${i}] From: ${m.from} | Subject: ${m.subject} | Snippet: ${m.snippet.slice(0, 200)}`
  ).join("\n");

  return `You are Robin, a personal assistant helping the user focus on inbox items that matter most to them.

Here is what the user told you to watch for:
FAMILY (always flag mail from these people): ${profile.family || "(no preference stated)"}
OTHER PEOPLE (friends, kids' school, coworkers, etc.): ${profile.people || "(no preference stated)"}
WORK & PROJECTS: ${profile.work || "(no preference stated)"}
INBOX TYPES (bills, late payments, expired cards, things waiting on a reply, etc.): ${profile.inbox || "(no preference stated)"}

Here are the user's most recent unread emails:
${lines}

You are Robin — dry, competent, never performative. Like a sharp friend with a point of view. Don't perform humor. Just say the thing.

Pick the top ${TOP_N} that best match what the user said they care about, ranked most important first. Be strict — only include emails that genuinely match the user's stated priorities. If fewer than ${TOP_N} match, return fewer.

Respond with ONLY a JSON array, no other text, no markdown fences. Each item must have:
- "index": the [number] of the email
- "summary": one short sentence in Robin's voice paraphrasing what the email is actually about. NEVER quote the subject line verbatim. NEVER use a preheader. Translate it into plain language. Examples: "Sarah's pinging you about Friday's dinner." / "Chase says your card expires next month." / "Acme client wants a status update on the brand work."
- "why": a tiny tag (under 40 chars) for WHY this matters to this user, referencing the matching priority. Examples: "From your dad" / "Late payment" / "Active client"

Example response:
[{"index":3,"summary":"Your dad's checking in about Saturday lunch.","why":"From your dad"},{"index":7,"summary":"Chase flagged a card expiring next month.","why":"Late payment / cards"},{"index":12,"summary":"Acme wants a status update on the brand work.","why":"Active client"}]`;
}

async function rankWithClaude(profile, candidates, apiKey) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: buildRankingPrompt(profile, candidates) }],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Claude error: ${data.error?.message || r.status}`);
  const text = data.content?.[0]?.text || "[]";
  // Tolerate accidental code fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  let picks;
  try {
    picks = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned non-JSON: ${cleaned.slice(0, 200)}`);
  }
  if (!Array.isArray(picks)) return [];
  return picks
    .filter(p => Number.isInteger(p.index) && p.index >= 0 && p.index < candidates.length)
    .slice(0, TOP_N)
    .map(p => ({
      ...candidates[p.index],
      summary: (p.summary || "").toString().slice(0, 200),
      why: (p.why || "").toString().slice(0, 60),
    }));
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieSecret = process.env.COOKIE_SECRET;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!cookieSecret || !clientId || !clientSecret) {
    return res.status(500).json({ error: "server config missing" });
  }

  const refreshToken = readSignedCookie(cookies.g_refresh, cookieSecret);
  if (!refreshToken) return res.status(401).json({ error: "not connected" });

  const profileJson = readSignedCookie(cookies.g_profile, cookieSecret);
  let profile = { family: "", people: "", work: "", inbox: "" };
  if (profileJson) {
    try { profile = { ...profile, ...JSON.parse(profileJson) }; } catch {}
  }
  const profileEmpty = !profile.family && !profile.people && !profile.work && !profile.inbox;

  try {
    // Refresh access token
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

    // Fallback path: no profile yet → use Gmail's own importance flag.
    if (profileEmpty || !anthropicKey) {
      const ids = await listIds(accessToken, "is:important is:unread", TOP_N);
      if (ids.length === 0) return res.status(200).json({ messages: [], unranked: true });
      const detail = await Promise.all(ids.map(id => fetchMetadata(accessToken, id)));
      return res.status(200).json({ messages: detail, unranked: true });
    }

    // Profile-aware path: pull recent unread, let Claude rank.
    const ids = await listIds(accessToken, "is:unread newer_than:14d", CANDIDATE_LIMIT);
    if (ids.length === 0) return res.status(200).json({ messages: [] });

    const candidates = await Promise.all(ids.map(id => fetchMetadata(accessToken, id)));
    const ranked = await rankWithClaude(profile, candidates, anthropicKey);
    return res.status(200).json({ messages: ranked });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

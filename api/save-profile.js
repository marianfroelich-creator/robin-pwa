// Vercel serverless function — stores the "what Robin watches for" profile.
//
// Accepts POST { people, work, practical } and writes a signed HttpOnly
// cookie (g_profile) that api/gmail-important.js reads when ranking mail.
//
// Required env vars:
//   COOKIE_SECRET

import crypto from "crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

const MAX_FIELD = 1000;
const truncate = v => (v || "").toString().slice(0, MAX_FIELD).trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    return res.status(500).json({ error: "server missing COOKIE_SECRET" });
  }

  const profile = {
    family: truncate(req.body?.family),
    people: truncate(req.body?.people),
    work: truncate(req.body?.work),
    inbox: truncate(req.body?.inbox),
  };

  const value = Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
  const sig = sign(value, cookieSecret);

  res.setHeader(
    "Set-Cookie",
    `g_profile=${value}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`
  );
  return res.status(200).json({ ok: true });
}

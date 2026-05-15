// Vercel serverless function — returns the signed-in Google user's profile.
//
// Reads the g_user cookie set during OAuth callback. Returns:
//   200 { name, firstName, email, picture }
//   401 { error: "not connected" }

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
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) return res.status(500).json({ error: "server config missing" });

  const cookies = parseCookies(req.headers.cookie);
  const rawUser = readSignedCookie(cookies.g_user, cookieSecret);
  if (!rawUser) return res.status(401).json({ error: "not connected" });

  let profile;
  try { profile = JSON.parse(rawUser); }
  catch { return res.status(500).json({ error: "bad profile cookie" }); }

  const firstName = profile.given_name || (profile.name || "").split(" ")[0] || "";
  return res.status(200).json({
    name: profile.name || "",
    firstName,
    email: profile.email || "",
    picture: profile.picture || "",
  });
}

// Vercel serverless function — Google OAuth redirect target.
// Exchanges the auth code for tokens and stores the refresh token in an
// HttpOnly signed cookie. No database required (single-user prototype).
//
// Required env vars:
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   COOKIE_SECRET

import crypto from "crypto";

const REDIRECT_URI = "https://robin-pwa.vercel.app/api/google-auth-callback";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
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

export default async function handler(req, res) {
  const { code, state, error } = req.query || {};
  if (error) return res.status(400).send(`Google returned: ${error}`);
  if (!code) return res.status(400).send("Missing code");

  const cookies = parseCookies(req.headers.cookie);
  if (!state || !cookies.g_oauth_state || cookies.g_oauth_state !== state) {
    return res.status(400).send("State mismatch — try signing in again.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!clientId || !clientSecret || !cookieSecret) {
    return res.status(500).send("Server missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / COOKIE_SECRET.");
  }

  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const data = await r.json();
    if (!r.ok || !data.refresh_token) {
      const hint = !data.refresh_token
        ? " (no refresh_token returned — revoke the app at myaccount.google.com/permissions and try again)"
        : "";
      return res.status(500).send(`Token exchange failed: ${data.error_description || data.error || "unknown"}${hint}`);
    }

    const value = Buffer.from(data.refresh_token, "utf8").toString("base64url");
    const sig = sign(value, cookieSecret);

    // Fetch the user's basic profile (name + picture + email) and stash it
    // alongside the refresh token in its own signed cookie so the client can
    // greet by first name and show the avatar without another OAuth round trip.
    let userCookie = null;
    if (data.access_token) {
      try {
        const ur = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (ur.ok) {
          const ud = await ur.json();
          const profile = {
            name: ud.name || "",
            given_name: ud.given_name || "",
            email: ud.email || "",
            picture: ud.picture || "",
          };
          const uVal = Buffer.from(JSON.stringify(profile), "utf8").toString("base64url");
          const uSig = sign(uVal, cookieSecret);
          userCookie = `g_user=${uVal}.${uSig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 180}`;
        }
      } catch { /* not fatal — proceed without profile */ }
    }

    const cookies = [
      `g_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      `g_refresh=${value}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 180}`,
    ];
    if (userCookie) cookies.push(userCookie);
    res.setHeader("Set-Cookie", cookies);
    res.writeHead(302, { Location: "/?google=connected" });
    res.end();
  } catch (err) {
    return res.status(500).send(`Token exchange error: ${err?.message || err}`);
  }
}

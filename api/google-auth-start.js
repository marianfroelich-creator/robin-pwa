// Vercel serverless function — starts the Google OAuth flow.
// Redirects the user to Google's consent screen with gmail.readonly scope.
//
// Required env vars (set in Vercel → Settings → Environment Variables):
//   GOOGLE_CLIENT_ID       — from Google Cloud Console → Credentials
//   COOKIE_SECRET          — random 32+ char string (used to sign the state cookie)
//
// The redirect URI below must be registered in Google Cloud Console under
// the OAuth 2.0 Client → Authorized redirect URIs.

import crypto from "crypto";

const REDIRECT_URI = "https://robin-pwa.vercel.app/api/google-auth-callback";
const SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).send("Server missing GOOGLE_CLIENT_ID. Add it in Vercel project settings.");
  }

  // CSRF: random state, stored in HttpOnly cookie, echoed back from Google
  const state = crypto.randomBytes(16).toString("hex");
  res.setHeader(
    "Set-Cookie",
    `g_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",   // get a refresh_token
    prompt: "consent",        // force refresh_token even on re-auth
    include_granted_scopes: "true",
    state,
  });

  res.writeHead(302, {
    Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
  res.end();
}

# Robin — PWA Preview

The Robin prototype, packaged so you can install it on your iPhone via "Add to Home Screen."

This now includes:
- A working chat (via a serverless proxy to Anthropic)
- Voice + text input that works on every screen with inputs (Home, Lists, List Detail, Calendar)
- Optional Apple Action Button hand-off (double-press → dictate → Robin captures it)

---

## What's in this folder

```
robin-pwa/
├── index.html
├── RobinApp.jsx
├── manifest.json
├── vercel.json
├── api/
│   └── claude.js               ← serverless proxy (gives chat the API key, server-side)
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
└── icon-512-maskable.png
```

---

## Three things to set up (about 15 minutes total)

### 1. Deploy to Vercel (5 minutes)

GitHub: go to **[github.com/new](https://github.com/new)**, create a private repo called `robin-pwa`, click "upload an existing file", drag everything from this folder in (including the `api` subfolder), commit.

Vercel: go to **[vercel.com/new](https://vercel.com/new)**, import the `robin-pwa` repo, leave all defaults, click Deploy. Wait ~30 seconds. Note the URL (e.g. `robin-pwa-xyz.vercel.app`).

### 2. Add your API key so chat works (3 minutes)

This is the same pattern as AssistMe — the key lives on the server, never in the code.

1. In Vercel, open the `robin-pwa` project.
2. Click **Settings** → **Environment Variables**.
3. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic key (starts with `sk-ant-`) — same key you used for AssistMe
   - **Environments:** check all three (Production, Preview, Development)
4. Click **Save**.
5. Go to the **Deployments** tab, click the three dots on the most recent deploy → **Redeploy**. (Env vars only take effect on a fresh deploy.)

Chat will now work.

### 3. Install on your iPhone (2 minutes)

Open the Vercel URL **in Safari** (Chrome on iOS can't install PWAs properly).

1. Tap the **Share** button (square with the arrow).
2. Tap **Add to Home Screen.**
3. Tap **Add.**

Robin lives on your home screen now. Tap it — full-screen, no Safari chrome.

---

## Setting up the Action Button (optional, ~5 minutes)

For iPhone 15 Pro / 15 Pro Max / 16 Pro and newer. Double-press the side button → dictate → Robin captures it as a todo.

(If you don't have an Action Button, you can still trigger the Shortcut from the Shortcuts app, the Lock Screen, or set it up as a Back Tap gesture — same Shortcut, different launch point.)

**Step 1 — Build the Shortcut**

Open the **Shortcuts** app on your iPhone. Tap **+** in the top right to create a new shortcut. Name it `Tell Robin`.

Add these three actions in order (search for them in the action library at the bottom):

1. **Dictate Text** — leave language as English, leave "Stop Listening" as "After Pause"
2. **URL Encode** — tap the input field, set it to the result of "Dictated Text"
3. **Open URLs** — set the URL to `https://YOUR-ROBIN-URL.vercel.app/?add=[URL Encoded Text]` (the `[URL Encoded Text]` part is inserted by tapping the variable chip; the rest you type)

Tap **Done.**

Quick test: tap the Shortcut to run it, speak something like "Pick up Mira at 4", and Robin should open with that line added to your todos plus a brief "Added: …" confirmation at the top.

**Step 2 — Assign to Action Button**

iPhone **Settings** → **Action Button** → swipe to **Shortcut** → tap **Choose a Shortcut** → pick **Tell Robin**.

Done. Press-and-hold the side button, speak your thought, release. Robin captures it.

---

## What works and what doesn't

**Works:**
- Every screen, the whole visual design, navigation
- Chat (via the serverless proxy)
- Voice mic on Home, Lists, List Detail, and Calendar — tap, speak, pause ~2 seconds, auto-commits
- Typing + Enter on the same four screens
- Briefing playback (text-to-speech)
- Live weather (Open-Meteo from your phone's location)
- Action Button hand-off (if set up)

**Limitations to know about:**
- The Action Button currently always adds to your **Today todos**. We can teach it to route to events/lists later once you've used it a week and seen the patterns.
- New lists and new events live in the app's memory only — they're gone if you close and reopen the PWA. (Persistence comes when we add Supabase, same as AssistMe.)

---

## Updating the prototype later

Edit `RobinApp.jsx` directly in the GitHub web UI, commit, Vercel auto-deploys in ~30 seconds, pull-to-refresh on your phone.

Updating the API proxy: edit `api/claude.js` the same way.

---

## A few troubleshooting notes

**Chat says "Server missing ANTHROPIC_API_KEY":** the env var wasn't added or you didn't redeploy after adding it. Repeat step 2 above.

**Voice mic does nothing on first tap:** iOS Safari asks for mic permission the first time. Tap **Allow** in the popup, then tap the mic again.

**The PWA opens in Safari instead of full-screen:** you opened a non-root URL (one with `?add=...` from the Shortcut). That's a known iOS quirk. The Shortcut still works — the text still gets added — it just renders inside Safari instead of in the PWA frame. Common fix: pull down to refresh once and Safari hands off to the PWA on next launch.

**Want chat to work offline / faster:** that's the path to a "real" PWA with a service worker. Not necessary for previewing the design. Happy to add later.

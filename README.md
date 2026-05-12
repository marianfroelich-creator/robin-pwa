# Robin — PWA Preview

A static-site packaging of the Robin prototype so you can install it on your iPhone via "Add to Home Screen."

This is **for previewing the design on a real device.** No backend, no database, no API keys. The chat screen won't reach Claude (CORS will block it from a static site), but every other screen works.

---

## What's in this folder

```
robin-pwa/
├── index.html                  ← entry point (loads React + Babel + RobinApp.jsx)
├── RobinApp.jsx                ← the prototype itself
├── manifest.json               ← tells iOS/Android the app name, colors, icons
├── vercel.json                 ← serves .jsx files correctly
├── apple-touch-icon.png        ← 180×180, used by iOS home screen
├── icon-192.png                ← 192×192, Android home screen
├── icon-512.png                ← 512×512, PWA standard
└── icon-512-maskable.png       ← 512×512 with safe padding (for round / squircle masks)
```

---

## Deploy in three steps (about 10 minutes)

### Step 1 — Create a new GitHub repo

Go to **[github.com/new](https://github.com/new)** (signed in as marianfroelich-creator).

- **Repository name:** `robin-pwa`
- **Visibility:** Private is fine. (Public is also fine — the PWA has no secrets.)
- Leave everything else unchecked.
- Click **Create repository.**

On the next page you'll see a "…or upload an existing file" link. Click it.

Drag every file from this `robin-pwa` folder into the upload area:

- `index.html`
- `RobinApp.jsx`
- `manifest.json`
- `vercel.json`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `icon-512-maskable.png`

Commit message: `Initial PWA upload.` Click **Commit changes.**

### Step 2 — Connect Vercel to the new repo

Go to **[vercel.com/new](https://vercel.com/new)** (signed in with your usual account).

- Find **robin-pwa** in the list of GitHub repos. Click **Import.**
- On the configure screen, **leave every setting at its default.** No framework preset, no build command, no environment variables.
- Click **Deploy.**

Wait ~30 seconds. Vercel will give you a URL like `robin-pwa-xyz.vercel.app`.

### Step 3 — Install on your iPhone

Open the Vercel URL **in Safari** (not Chrome — Chrome on iOS doesn't support home-screen install properly).

1. Tap the **Share** button (square with the arrow, bottom of the screen).
2. Scroll down. Tap **Add to Home Screen.**
3. The name will pre-fill as "Robin." Tap **Add.**

Robin now lives on your home screen. Tap the icon — it launches full-screen, no Safari address bar, no browser chrome. Feels like a real app.

---

## What works and what doesn't on the phone preview

**Works:**
- All visual design, navigation, screens
- Voice mic (on Home and List Detail) — Safari supports the Web Speech API
- Briefing playback (text-to-speech with a British voice)
- Weather (real, fetched from Open-Meteo via your phone's location)
- Adding to-dos, checking them off, navigating between screens

**Won't work on the static preview:**
- The Chat screen (calling Claude directly from a static page gets blocked by CORS). It'll just sit silent or show an error. This is expected — Nate's full deployment with the API proxy will fix it.

---

## Updating the prototype later

When you want to push a new version:

1. In the GitHub repo, click on `RobinApp.jsx`.
2. Click the pencil icon (top right) to edit.
3. Paste the new file contents over the old.
4. Scroll down, commit the change.

Vercel will auto-deploy within ~30 seconds. Pull-to-refresh on your phone and you'll see the update.

---

## A note on the chat feature

If you eventually want chat to work on the phone preview too, the cleanest path is:

1. Add a single Vercel serverless function at `/api/claude.js` that proxies requests to Anthropic with an API key stored as a Vercel environment variable.
2. Update `RobinApp.jsx` so the Chat screen posts to `/api/claude` instead of `https://api.anthropic.com/...` directly.

That's roughly the same pattern Nate set up for AssistMe, so the work is mostly portable. Worth doing later — not necessary for previewing the design.

# Working on Robin together 🐦

Plain-English guide for building Robin with a partner. No deep technical background assumed.

## The big picture

- The code lives on **GitHub**: https://github.com/marianfroelich-creator/robin-pwa
- The live public app is **https://robin-pwa.vercel.app** — only Marian publishes to it.
- Every change you propose gets its **own private preview link** that updates automatically.
  You don't deploy to the live app to show your work — you share a preview link.

**The golden rules**
1. Never put secret keys (anything starting with `sk-...`) into the code. They go in `.env.local`, which is never uploaded. (See "Running it on your computer".)
2. Only **Marian** publishes to the live public app. Anyone can make and preview changes.
3. Use your **own** Anthropic API key for local testing — never share or paste someone else's.

---

## One-time setup

### 1. Accept the invite
Check your email (or https://github.com/marianfroelich-creator/robin-pwa/invitations) and accept the GitHub invite. You now have **Write** access.

### 2. Install the two tools you need
- **Git** — https://git-scm.com/downloads
- **Node.js** (LTS version) — https://nodejs.org

### 3. Get the code onto your computer
Open Terminal and run:
```bash
git clone https://github.com/marianfroelich-creator/robin-pwa.git
cd robin-pwa
npm install
```

---

## The everyday workflow (this is the important part)

Each round of work is four steps:

```bash
# 1. Get the latest version everyone else has
git pull

# 2. Start a named workspace for your change (use any short name)
git checkout -b nate-new-login-screen

# 3. ...edit files... then save your change with a short note:
git add -A
git commit -m "New login screen layout"

# 4. Send it up to GitHub
git push -u origin nate-new-login-screen
```

After step 4, GitHub shows a button: **"Compare & pull request"** — click it, then **"Create pull request."**

### Where the preview link appears 👀
Within about a minute of opening the pull request, a **Vercel** bot posts a comment on it with a **"Visit Preview"** link. That link shows *your* version of the app, running live. It updates automatically every time you `git push` more changes to the same branch. Share it with Marian — you'll both refresh it to watch the change come together.

> The live public app at robin-pwa.vercel.app does **not** change during any of this. Only the preview does.

### Publishing for real
When you're both happy, **Marian** clicks **"Merge pull request"** on GitHub. That — and only that — updates the live public app.

---

## Running it on your computer (optional, for fast tinkering)

You don't need this to collaborate — the preview links above are enough. But if you want to see changes instantly on your own machine:

1. Get your **own** Anthropic API key at https://console.anthropic.com → API Keys.
2. In the project folder, create a file named `.env.local` containing:
   ```
   ANTHROPIC_API_KEY="sk-ant-...your-own-key..."
   ```
   This file is ignored by Git on purpose — it will never be uploaded or shared.
3. Run:
   ```bash
   npm install -g vercel   # one time
   vercel dev
   ```
   Open the address it prints (usually http://localhost:3000).

Note: some features (Google sign-in, saved data) rely on server keys you don't have locally — those parts work fully on the Vercel **preview links**, not necessarily on your local copy. For visual/UI work, local is great; for full end-to-end testing, use the preview link.

---

## Stuck? Quick fixes

| Problem | Fix |
|---|---|
| "I don't see the latest changes" | Run `git pull` |
| "Preview link asks me to log in to Vercel" | Tell Marian — preview protection may have been re-enabled |
| "The app says invalid authentication" | The Anthropic key is bad/missing — that's Marian's `scripts/verify-key.sh` check |
| Merge conflict scares you | Don't force it — ping Marian, conflicts are normal and fixable |

Welcome aboard. 🚀

# NexusMatch — Project Setup Guide

Everything you need to get this project running on a fresh Replit account, from scratch, with no agent help.

---

## Step 1 — Import the Project

1. Go to [replit.com](https://replit.com) and log in.
2. Click **+ Create Repl** → **Import from GitHub** (or upload the zip).
3. Once imported, open the **Shell** tab at the bottom.

---

## Step 2 — Install Dependencies

Run this in the Shell:

```bash
npm install
```

This installs all frontend and backend packages. It takes 1-2 minutes.

---

## Step 3 — Provision the Database

1. In the left sidebar, click the **Database** icon (or go to **Tools → Database**).
2. Click **Create Database** — Replit will provision a free PostgreSQL database automatically.
3. The `DATABASE_URL`, `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGPORT` variables are set automatically. You do not need to copy anything.

Then push the database schema:

```bash
npm run db:push
```

You should see `[✓] Changes applied` when it succeeds.

---

## Step 4 — Set Environment Variables (Secrets)

Go to **Tools → Secrets** in the left sidebar and add the following.

### Required (app won't start without these)

| Secret Key | Value | Where to get it |
|---|---|---|
| `SESSION_SECRET` | Any long random string | Run `openssl rand -base64 32` in the Shell |

### Required for Authentication (Google OAuth + Firebase Phone Auth)

| Secret Key | Value | Where to get it |
|---|---|---|
| `GOOGLE_CLIENT_ID` | `200246678955-...` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Your client secret | Same as above |
| `FIREBASE_PROJECT_ID` | `playlink-42bff` | [console.firebase.google.com](https://console.firebase.google.com) → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@....iam.gserviceaccount.com` | Firebase → Project Settings → Service Accounts → Generate New Private Key |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` | Same JSON file as above (copy the `private_key` field exactly, including `\n`) |
| `FIREBASE_WEB_API_KEY` | `AIzaSy...` | Firebase → Project Settings → General → Web API Key |
| `VITE_FIREBASE_WEB_API_KEY` | Same as above | Same |
| `VITE_FIREBASE_PROJECT_ID` | `playlink-42bff` | Same |
| `VITE_FIREBASE_APP_ID` | `1:584288019310:web:...` | Firebase → Project Settings → Your Apps → App ID |

### Required for Voice Channels (100ms)

| Secret Key | Value | Where to get it |
|---|---|---|
| `HMS_APP_ACCESS_KEY` | Your access key | [dashboard.100ms.live](https://dashboard.100ms.live) → Developer |
| `HMS_APP_SECRET` | Your secret | Same |
| `HMS_TEMPLATE_ID` | Your template ID | 100ms → Templates |

### Required for File Uploads (Cloudflare R2)

| Secret Key | Value | Where to get it |
|---|---|---|
| `R2_ACCOUNT_ID` | Your account ID | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 |
| `R2_ACCESS_KEY_ID` | R2 API token access key | Cloudflare → R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret | Same |
| `R2_BUCKET_NAME` | `gamematch-uploads` (or your bucket name) | Cloudflare → R2 → Create Bucket |
| `R2_PUBLIC_URL` | `https://pub-xxx.r2.dev` | Cloudflare → R2 → Bucket → Settings → Public Access |

### Optional (AdMob — only needed for Android/iOS)

| Secret Key | Value | Where to get it |
|---|---|---|
| `VITE_ADMOB_BANNER_ID` | `ca-app-pub-xxx/yyy` | [admob.google.com](https://admob.google.com) |
| `VITE_ADMOB_REWARDED_ID` | `ca-app-pub-xxx/zzz` | Same |

> **Tip:** If you just want to run the app without Google login, add a secret `AUTH_DISABLED` = `true`. This bypasses all authentication so you can test the UI freely. Remove it when you're ready to go live.

---

## Step 5 — Configure the Workflow

1. Go to **Tools → Workflows** (or click the play button area at the top).
2. If a workflow called **Start application** already exists, you're done.
3. If not, create one with this command:

```
npm run dev
```

Set the port to **5000** and output type to **Webview**.

---

## Step 6 — Run the App

Click the **Run** button (or start the **Start application** workflow).

The app will be live in the preview pane at port `5000`.

---

## Step 7 — Update Google OAuth Callback URL

When you import into a new Replit account, your app URL changes. Update the Google OAuth redirect URI:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. Click your OAuth 2.0 Client.
3. Under **Authorized redirect URIs**, add:
   ```
   https://<your-repl-dev-domain>/api/auth/google/callback
   ```
   Your dev domain looks like: `e7c8ee28-xxxx.sisko.replit.dev`
   You can find it in the Shell by running:
   ```bash
   echo $REPLIT_DEV_DOMAIN
   ```

---

## All Commands — Quick Reference

```bash
# Install all dependencies
npm install

# Push database schema (run after npm install, and after any schema changes)
npm run db:push

# Start development server (runs backend + frontend together on port 5000)
npm run dev

# Build for production
npm run build

# Start production server (after building)
npm run start

# Type check the codebase
npm run check

# Build Android/iOS app (requires Capacitor setup)
npm run cap:build

# Sync Capacitor (copies web build into Android/iOS folders)
npm run cap:sync
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `tsx: not found` | Run `npm install` first, then try again |
| `getaddrinfo ENOTFOUND` on startup | Database URL is broken — make sure the Replit Database is provisioned (Step 3) |
| `Firebase Admin SDK` warning on startup | Firebase secrets are missing — add them in Secrets (Step 4) |
| White screen / 401 errors | Add secret `AUTH_DISABLED=true` to skip login during testing |
| Google OAuth not working | Update the callback URL in Google Cloud Console (Step 7) |
| Voice channels not working | Add 100ms secrets (Step 4) |
| File uploads failing | Add Cloudflare R2 secrets (Step 4) |
| Local `main` branch is behind `origin/main` (Git panel shows different commits) | See **Git Sync Issue** section below |
| `error: cannot lock ref 'refs/remotes/origin/HEAD': Unable to create '...HEAD.lock': File exists` | See **Git Sync Issue** section below |

---

## Git Sync Issue — Syncing Local Branch with origin/main

When you import this project into a new Replit account, the Replit Git panel may show your local `main` branch as separate from `origin/main` (the remote on GitHub). Clicking `origin/main` in the branch dropdown does **not** switch to it — it's a read-only remote reference, not a local branch.

To make your local `main` match `origin/main` exactly, run these commands in the **Shell**:

**Step 1 — Remove stale git lock file (if you see a `.lock` error):**
```bash
rm -f /home/runner/workspace/.git/refs/remotes/origin/HEAD.lock
```

**Step 2 — Fetch and reset to the remote branch:**
```bash
git fetch origin
git reset --hard origin/main
```

This overwrites your local `main` with the full project history from GitHub. It is safe to run on a fresh import where no local work has been done yet.

> **Why does this happen?** When Replit creates a new project from GitHub, it sometimes creates a fresh local `main` branch with only an "Initial commit" instead of pulling the full remote history. The two branches then have unrelated histories, which is why a normal `git pull` fails.

---

## Tech Stack Summary

- **Frontend**: React + Vite (port 5000)
- **Backend**: Express.js (same port, served together)
- **Database**: PostgreSQL via Replit's built-in DB + Drizzle ORM
- **Auth**: Google OAuth (Passport.js) + Firebase Phone Auth + JWT
- **Voice**: 100ms SDK
- **Storage**: Cloudflare R2 (S3-compatible)
- **Mobile**: Capacitor (Android + iOS)
- **Ads**: AdMob (mobile only)

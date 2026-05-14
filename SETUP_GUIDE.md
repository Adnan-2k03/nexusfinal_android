# NexusMatch — Project Setup Guide

Everything you need to get this project running on a fresh Replit account, from scratch, with no agent help.

> **Run every command one at a time. Do not paste multiple commands together.**

---

## Step 0 — Sync Git (Do This First)

When Replit imports the project from GitHub, it sometimes creates a fresh local `main` branch that is behind the real remote. You must fix this before doing anything else.

Open the **Shell** tab and run these commands **one at a time**:

**If you see a lock file error (`...HEAD.lock: File exists`), run this first:**
```bash
rm -f /home/runner/workspace/.git/refs/remotes/origin/HEAD.lock
```

**Then fetch and reset to the real remote branch:**
```bash
git fetch origin
```
```bash
git reset --hard origin/main
```

This replaces your local branch with the full project history from GitHub. Safe to run on a fresh import.

> **Why is this needed?** Replit sometimes initialises a brand-new local `main` with only an "Initial commit" instead of pulling the full history from GitHub. The two branches have unrelated histories, so a normal `git pull` fails.

---

## Step 1 — Install Dependencies

Run this in the Shell. The `--include=dev` flag ensures **all** packages are installed, including build tools like Vite and TypeScript:

```bash
npm install --include=dev
```

This takes 1-3 minutes. You should see output ending with something like `added 900 packages`.

> **Important:** A plain `npm install` (without `--include=dev`) sometimes skips development dependencies in Replit, leaving Vite, TypeScript, drizzle-kit, and esbuild missing. Always use `--include=dev`.

---

## Step 2 — Provision the Database

1. In the left sidebar, click the **Database** icon (or go to **Tools → Database**).
2. Click **Create Database** — Replit provisions a free PostgreSQL database automatically.
3. The environment variables `DATABASE_URL`, `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, and `PGPORT` are set automatically. You do not need to copy anything.

Then push the database schema:

```bash
npm run db:push
```

You should see output confirming tables were created or already exist.

---

## Step 3 — Set Environment Variables (Secrets)

Go to **Tools → Secrets** in the left sidebar and add the following keys.

### Required — App won't start without these

| Secret Key | Value | Where to get it |
|---|---|---|
| `SESSION_SECRET` | Any long random string | Run `openssl rand -base64 32` in the Shell and copy the output |

### Required for Authentication (Google OAuth + Firebase Phone Auth)

| Secret Key | Value | Where to get it |
|---|---|---|
| `GOOGLE_CLIENT_ID` | `200246678955-...` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Your client secret | Same as above |
| `FIREBASE_PROJECT_ID` | `playlink-42bff` | [console.firebase.google.com](https://console.firebase.google.com) → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@....iam.gserviceaccount.com` | Firebase → Project Settings → Service Accounts → Generate New Private Key |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` | Same JSON file as above — copy the `private_key` field exactly, including all `\n` characters |
| `FIREBASE_WEB_API_KEY` | `AIzaSy...` | Firebase → Project Settings → General → Web API Key |
| `VITE_FIREBASE_WEB_API_KEY` | Same value as above | Same |
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

### Optional — AdMob (only needed for Android/iOS builds)

| Secret Key | Value | Where to get it |
|---|---|---|
| `VITE_ADMOB_BANNER_ID` | `ca-app-pub-xxx/yyy` | [admob.google.com](https://admob.google.com) |
| `VITE_ADMOB_REWARDED_ID` | `ca-app-pub-xxx/zzz` | Same |

> **Shortcut for testing:** Add `AUTH_DISABLED` = `true` as a secret to bypass all login and test the UI immediately. Remove it before going live.

---

## Step 4 — Configure and Start the Workflow

1. Click the **Run** button at the top of Replit — it should automatically start the app using `npm run dev`.
2. If no workflow is configured yet, go to **Tools → Workflows** and create one with:
   - **Command:** `npm run dev`
   - **Port:** `5000`
   - **Output type:** Webview

The app will be live in the Preview pane at port `5000`.

---

## Step 5 — Update Google OAuth Callback URL

When you import into a new Replit account, your app URL changes. You must update the Google OAuth redirect URI or login will fail.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. Click your OAuth 2.0 Client.
3. Under **Authorized redirect URIs**, add:
   ```
   https://<your-repl-dev-domain>/api/auth/google/callback
   ```
   Find your dev domain by running this in the Shell:
   ```bash
   echo $REPLIT_DEV_DOMAIN
   ```
   It looks like: `e7c8ee28-xxxx.sisko.replit.dev`

---

## All Commands — Quick Reference

Run each command **separately**, one at a time:

```bash
# Step 0 — Fix git sync (fresh import only)
git fetch origin
git reset --hard origin/main

# Step 1 — Install all dependencies (include dev tools)
npm install --include=dev

# Step 2 — Push database schema
npm run db:push

# Step 4 — Start development server (port 5000)
npm run dev
```

```bash
# Build for production (creates dist/ folder)
npm run build

# Start production server (requires build to have run first)
npm run start

# Type check the codebase
npm run check

# Build and sync Android/iOS (requires Capacitor setup)
npm run cap:build

# Sync Capacitor only (copies web build into Android/iOS folders)
npm run cap:sync
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `vite: not found` when running `npm run dev` | Run `npm install --include=dev` — devDependencies were skipped |
| `tsc: not found` when running `npm run check` | Run `npm install --include=dev` — TypeScript wasn't installed |
| `Cannot find module drizzle-kit/bin.cjs` | Run `npm install --include=dev` — drizzle-kit binary is missing |
| `Cannot find module dist/index.js` on `npm run start` | Run `npm run build` first to generate the dist folder |
| `Could not find installation of TypeScript` on `cap:sync` | Run `npm install --include=dev` — TypeScript wasn't installed |
| `tsx: not found` | Run `npm install --include=dev` first, then try again |
| `getaddrinfo ENOTFOUND` on startup | Database URL is broken — make sure the Replit Database is provisioned (Step 2) |
| `Firebase Admin SDK` warning on startup | Firebase secrets are missing — add them in Secrets (Step 3) |
| White screen / 401 errors | Add secret `AUTH_DISABLED=true` to skip login during testing |
| Google OAuth not working | Update the callback URL in Google Cloud Console (Step 5) |
| Voice channels not working | Add 100ms secrets (Step 3) |
| File uploads failing | Add Cloudflare R2 secrets (Step 3) |
| Local `main` branch is behind `origin/main` | See Step 0 above |
| `error: cannot lock ref '...HEAD.lock': File exists` | Run `rm -f /home/runner/workspace/.git/refs/remotes/origin/HEAD.lock` then retry |

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

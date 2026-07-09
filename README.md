# Personal OS — v2

A mobile-responsive personal operating system dashboard, built with React, Vite, and Tailwind CSS. Data is stored in Supabase (Postgres) behind a single account, with real-time sync — every signed-in device sees the same data live, no manual refresh needed.

## Sections

1. **Executive Dashboard** — high-level overview: goal progress, today's tasks, recent ideas, health snapshot.
2. **Goals & KPIs** — add/edit/delete goals with progress bars, categories, and deadlines.
3. **Weekly Planner** — Mon–Sun task board, navigate weeks, add/complete/delete tasks per day.
4. **Health Dashboard** — log sleep, weight, water, mood, exercise; sleep trend chart; log history.
5. **Weekly Executive Reviews** — wins, challenges, lessons, and next-week focus, one entry per week.
6. **Ideas Inbox** — quick capture with tags, status (new/considering/archived), search and filter.

Every section is reachable from the sidebar (desktop) or bottom nav (mobile), a global **Quick Add** button (sidebar, mobile header, floating action button) lets you capture a task, goal, idea, or health log from anywhere in one tap, and a **Voice Assistant** lets you do the same (plus ask questions about your data) by speaking.

## Project structure

```
src/
  lib/supabaseClient.js   The one Supabase client instance (reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
  context/
    AuthContext.jsx       Auth session state (useAuth()) — sign in / sign up / sign out
    DataContext.jsx       Single source of truth for all data (useData()) — fetch + realtime subscription + CRUD per table
  components/
    AuthGate.jsx          Sign-in/sign-up screen shown when logged out
    DataGate.jsx          Loading spinner until the first fetch of every table completes
    MigrationPrompt.jsx   One-time offer to import old localStorage data into the cloud account
    VoiceAssistant.jsx    Mic button UI — records speech, calls /api/voice-command, speaks the reply back via /api/text-to-speech
    Layout, Sidebar, BottomNav, QuickAddModal, BackupModal, PageHeader
  components/ui/          Reusable primitives: Card, Button, Badge, Modal, ProgressBar, FormField, EmptyState
  pages/                  One file per section (ExecutiveDashboard, GoalsKPIs, WeeklyPlanner, HealthDashboard, WeeklyReviews, IdeasInbox)
  utils/date.js           Week/date helpers
  nav.js                  Sidebar/bottom nav item config (add a new section here + a route in App.jsx)
api/voice-command.js      Vercel serverless function — the ONLY place the Anthropic API key is ever used
api/text-to-speech.js     Vercel serverless function — the ONLY place the Azure Speech key is ever used
supabase/schema.sql       Postgres tables + row-level security + realtime publication — run once in the Supabase SQL Editor
```

To add a new section later: create a page in `src/pages`, add a table + RLS policy in `supabase/schema.sql`, wire it into `DataContext` (copy the `useSyncedTable` pattern already used for the other five), add a nav entry in `src/nav.js`, and add a `<Route>` in `src/App.jsx`.

## One-time setup: create your Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**. Pick a name and a database password (save that password somewhere — you likely won't need it again, but it's your project's master password), and pick the region closest to you.
2. Wait ~2 minutes for it to finish provisioning.
3. In the project, go to the **SQL Editor** (left sidebar) → **New query** → paste in the entire contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the five tables, locks each row to its owning account, and turns on realtime sync.
4. Go to **Project Settings → API**. Copy the **Project URL** and the **`anon` `public` key** (not the `service_role` key — that one must never be used in this app or shared with anyone).
5. In this project folder, copy `.env.example` to a new file named `.env`, and paste in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   `.env` is already gitignored — it's just for this machine.
6. By default Supabase requires email confirmation for new accounts. Since this is a single-person tool, you can turn that off for convenience: **Authentication → Providers → Email → toggle off "Confirm email"** (or just click the confirmation link Supabase emails you the first time — either works).

## One-time setup: Voice Assistant (Anthropic API)

Optional — the app works fully without it, just without the mic button. Skip this if you don't want voice control.

1. Go to [console.anthropic.com](https://console.anthropic.com) → sign up. This is a separate, pay-per-use API account — not the same as a claude.ai subscription.
2. Add a payment method: **Settings → Billing**.
3. Create a key: **Settings → API Keys → Create Key**. Copy it — you won't be able to see it again.
4. This key is a true secret (unlike the Supabase anon key) — **never** put it in `.env` with a `VITE_` prefix, commit it, or paste it into a chat/AI tool. It only ever belongs in:
   - Your Vercel project's **Settings → Environment Variables**, as `ANTHROPIC_API_KEY` (used by [`api/voice-command.js`](api/voice-command.js), which runs server-side only).
   - Optionally your local `.env` (already gitignored) if you want to test the voice feature locally via `vercel dev` — plain `npm run dev` (Vite) doesn't run the `/api` serverless function at all.

The voice assistant uses Claude Haiku 4.5 — cheap enough that normal personal use costs a small fraction of a cent per command.

## One-time setup: New Zealand voice (Azure Speech)

Also optional — without this, spoken replies just use your browser's default system voice instead of a New Zealand one.

1. Go to [portal.azure.com](https://portal.azure.com) → sign up (Azure has a free tier; Speech's free tier is ~0.5 million characters/month, far more than personal use needs).
2. Create a resource: search **"Speech"** → **Speech service** → **Create**. Pick any region close to you (e.g. `australiaeast`) and the **Free F0** pricing tier.
3. Once created, go to **Keys and Endpoint** on that resource. Copy **KEY 1** and the **Location/Region** value (e.g. `australiaeast`).
4. Same rule as the Anthropic key — this is a true secret, never share it or commit it. It only belongs in:
   - Vercel → **Settings → Environment Variables**: `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.
   - Optionally your local `.env` for testing via `vercel dev`.

Uses the `en-NZ-MollyNeural` voice (used by [`api/text-to-speech.js`](api/text-to-speech.js)). If this isn't configured, or the request fails for any reason, the app quietly falls back to your browser's built-in voice rather than going silent.

## How to run it locally

**Prerequisite:** Node.js 18+ (this was built and tested with Node 24 / npm 11). Download from [nodejs.org](https://nodejs.org) if you don't have it — check with `node -v`.

From the project folder:

```bash
npm install
npm run dev
```

Open the URL it prints (usually **http://localhost:5173**), sign up with an email + password the first time, and you're in. Do the same sign-up (same email/password) on your phone's browser and both devices are now the same account, syncing live.

Other commands:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Deployment

The app is deployed on Vercel, connected to this GitHub repo — every push to `main` auto-deploys a new version within about a minute, with the previous deployment kept for instant rollback if something breaks. Vercel needs the same two `VITE_SUPABASE_*` variables as local `.env` (**Project Settings → Environment Variables**), plus `ANTHROPIC_API_KEY` if you want the voice assistant to work in production (see above).

Whenever the deployed URL changes (a new Vercel project, a custom domain, etc.), update Supabase's **Authentication → URL Configuration**: set **Site URL** to the new address and add `<url>/**` to **Redirect URLs** (keep `http://localhost:5173/**` too, for local dev).

## Install as an app (desktop + mobile icon)

The app is a PWA (`public/manifest.webmanifest` + `public/icons/`), so both desktop and mobile browsers can install it as a standalone app with a real icon instead of just a browser tab. Since it's deployed, **neither device needs your computer on** — point both at your Vercel URL.

### Desktop (Windows, Chrome or Edge)

1. Open your deployed URL in Chrome.
2. Click the **install icon** in the address bar (a monitor-with-arrow icon), or the ⋮ menu → **"Install Personal OS…"**.
3. Confirm — this creates a Start Menu entry and a Desktop shortcut that opens the app in its own window with the Personal OS icon.

### Mobile

1. Open your deployed URL in your phone's browser (any network — no longer tied to your home Wi-Fi).
2. **Android (Chrome):** ⋮ menu → **"Add to Home screen"**. **iOS (Safari):** Share button → **"Add to Home Screen"**.
3. A Personal OS icon appears on your home screen and opens full-screen (no browser chrome), already synced to your desktop.

### Local development (only needed when changing code)

`npm run dev` still works for iterating on the app locally (`http://localhost:5173`, and `vite.config.js`'s `host: true` also exposes it on your LAN at the printed `Network` URL) — but the `/api/voice-command` serverless function only runs on Vercel or via the Vercel CLI's `vercel dev`, not plain `vite`. [`start-personal-os.bat`](start-personal-os.bat) + its Windows Startup shortcut are optional now that the app is deployed; keep them only if you want a local copy running for development.

## Data & persistence

All data lives in your Supabase project's Postgres database, scoped to your account by row-level security — any signed-in device fetches the same rows and gets live updates the instant another device changes something (via Supabase Realtime), no refresh needed.

**Back up your data anyway (Export / Restore):** cloud-backed doesn't mean unbreakable — click **Backup & Restore** (bottom of the sidebar on desktop, or the small icon next to Quick Add on mobile) →
- **Export backup** downloads a `personal-os-backup-YYYY-MM-DD.json` file with everything. Save it to OneDrive, a USB drive, email — anywhere.
- **Restore from backup** loads one of those files back into your account, replacing whatever is currently there (asks for confirmation first).

**What clearing browser data now affects:** it only signs that device out (clears the local Supabase session token) — your data is untouched, since it never lived in `localStorage` in the first place. Just sign back in.

**If you're migrating from the old local-only version of this app:** the first time you sign in on a device that still has old data, you'll see an **"Import your previous data?"** prompt — accept it once to carry that data into your account (and it clears the old local copy so you won't see the prompt again on that device).

## Voice Assistant

Click **Voice Assistant** (sidebar on desktop, mic icon in the mobile header) and tap the mic to talk. It can:
- **Add things:** "Add a task to call the dentist tomorrow", "Add a goal to read 20 books this year, target 20", "Log today's sleep, 7 and a half hours".
- **Answer questions about your data:** "What's on my plate today?", "How's my marathon goal coming along?" — answered out loud via your device's text-to-speech.

Uses the browser's built-in speech *recognition* (listening), which is reliable in Chrome (desktop and Android) but not supported in Firefox and only partially in Safari. Every command goes through [`api/voice-command.js`](api/voice-command.js), which is the only place `ANTHROPIC_API_KEY` is ever read — it never reaches the browser. Requires the Anthropic API setup above; without it, the mic button will show a clear "not configured" error instead of the app breaking.

Spoken *replies* use a New Zealand voice (Azure Speech's `en-NZ-MollyNeural`) via [`api/text-to-speech.js`](api/text-to-speech.js) if the Azure setup above is done — otherwise it quietly falls back to your browser's default system voice.

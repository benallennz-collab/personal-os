# Personal OS — v2

A mobile-responsive personal operating system dashboard, built with React, Vite, and Tailwind CSS. Data is stored in Supabase (Postgres) behind a single account, with real-time sync — every signed-in device sees the same data live, no manual refresh needed.

## Sections

1. **Executive Dashboard** — high-level overview: goal progress, today's tasks, recent ideas, health snapshot.
2. **Goals & KPIs** — add/edit/delete goals with progress bars, categories, and deadlines.
3. **Weekly Planner** — Mon–Sun task board, navigate weeks, add/complete/delete tasks per day.
4. **Health Dashboard** — log sleep, weight, water, mood, exercise; sleep trend chart; log history.
5. **Weekly Executive Reviews** — wins, challenges, lessons, and next-week focus, one entry per week.
6. **Ideas Inbox** — quick capture with tags, status (new/considering/archived), search and filter.

Every section is reachable from the sidebar (desktop) or bottom nav (mobile), and a global **Quick Add** button (top of sidebar, mobile header, and floating action button) lets you capture a task, goal, idea, or health log from anywhere in one tap.

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
    Layout, Sidebar, BottomNav, QuickAddModal, BackupModal, PageHeader
  components/ui/          Reusable primitives: Card, Button, Badge, Modal, ProgressBar, FormField, EmptyState
  pages/                  One file per section (ExecutiveDashboard, GoalsKPIs, WeeklyPlanner, HealthDashboard, WeeklyReviews, IdeasInbox)
  utils/date.js           Week/date helpers
  nav.js                  Sidebar/bottom nav item config (add a new section here + a route in App.jsx)
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

## Install as an app (desktop + mobile icon)

The app is a PWA (`public/manifest.webmanifest` + `public/icons/`), so both desktop and mobile browsers can install it as a standalone app with a real icon instead of just a browser tab. The dev server (or a preview server) needs to be running for the icon to open anything — see the two options below.

### Desktop (Windows, Chrome or Edge)

1. `npm run dev` and open `http://localhost:5173`.
2. Click the **install icon** in the address bar (a monitor-with-arrow icon), or the ⋮ menu → **"Install Personal OS…"**.
3. Confirm — this creates a Start Menu entry and a Desktop shortcut that opens the app in its own window with the Personal OS icon.

**Avoid double launches at startup:** the installed PWA has its own separate "start at sign-in" toggle from the [`start-personal-os.bat`](start-personal-os.bat) Startup shortcut used below — if both are on, two things open at login. Keep only one enabled: either rely on the Startup shortcut (recommended, since it also starts the server), or, if you'd rather use Chrome's own toggle, open the installed app, click **⋮ → uninstall/app settings**, and turn off **"Start app when you sign in"** there so Chrome doesn't add its own duplicate entry to your Startup folder (`Win + R` → `shell:startup` to check what's actually in there if things ever look duplicated again).

### Mobile (phone on the same Wi-Fi)

`vite.config.js` sets `host: true`, so every `npm run dev` (including the one that runs automatically at Windows startup) listens on your LAN automatically — no extra flags needed.

1. Run `npm run dev` (or just let it start via the Startup shortcut) — the terminal prints both a `Local` and a `Network` URL, e.g. `http://192.168.1.23:5173/`.
2. On your phone (same Wi-Fi), open a browser to that `Network` address and sign in with the same account.
3. **Android (Chrome):** ⋮ menu → **"Add to Home screen"**. **iOS (Safari):** Share button → **"Add to Home Screen"**.
4. A Personal OS icon appears on your home screen and opens full-screen (no browser chrome), already synced to your desktop.

Your phone only needs your PC's dev server running the *first* time you load it there — after that it still needs the PC's server running every time, since there's no separately hosted deployment yet (see "Future considerations" in `CLAUDE.md`). Data itself, though, lives in Supabase, not on the PC.

## Data & persistence

All data lives in your Supabase project's Postgres database, scoped to your account by row-level security — any signed-in device fetches the same rows and gets live updates the instant another device changes something (via Supabase Realtime), no refresh needed.

**Back up your data anyway (Export / Restore):** cloud-backed doesn't mean unbreakable — click **Backup & Restore** (bottom of the sidebar on desktop, or the small icon next to Quick Add on mobile) →
- **Export backup** downloads a `personal-os-backup-YYYY-MM-DD.json` file with everything. Save it to OneDrive, a USB drive, email — anywhere.
- **Restore from backup** loads one of those files back into your account, replacing whatever is currently there (asks for confirmation first).

**What clearing browser data now affects:** it only signs that device out (clears the local Supabase session token) — your data is untouched, since it never lived in `localStorage` in the first place. Just sign back in.

**If you're migrating from the old local-only version of this app:** the first time you sign in on a device that still has old data, you'll see an **"Import your previous data?"** prompt — accept it once to carry that data into your account (and it clears the old local copy so you won't see the prompt again on that device).

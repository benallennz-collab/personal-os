# Personal OS

## What this is

Personal OS is a personal executive dashboard — a single web app for running your own life the way an executive runs a company: goals and KPIs, weekly planning, health tracking, weekly reviews, and a fast capture inbox for ideas. It's built as a React + Tailwind CSS single-page app, backed by Supabase for storage, auth, and real-time cross-device sync.

This is a **personal, single-user tool**, not a multi-tenant product — there's one account, and every device signed into it sees the same data live. The login screen exists solely to identify "this device" to that one account, not to support multiple users.

## Main modules

The app is organized around six sections, each a page under `src/pages/`:

| Section | File | Purpose |
|---|---|---|
| Executive Dashboard | `src/pages/ExecutiveDashboard.jsx` | At-a-glance overview: goal progress, today's tasks, recent ideas, health snapshot |
| Goals & KPIs | `src/pages/GoalsKPIs.jsx` | CRUD for goals with progress bars, categories, deadlines |
| Weekly Planner | `src/pages/WeeklyPlanner.jsx` | Mon–Sun task board with week navigation |
| Health Dashboard | `src/pages/HealthDashboard.jsx` | Sleep/weight/water/mood/exercise logging + trend chart |
| Weekly Executive Reviews | `src/pages/WeeklyReviews.jsx` | Wins / challenges / lessons / next-week-focus entries |
| Ideas Inbox | `src/pages/IdeasInbox.jsx` | Quick capture with tags, status, search, filter |

Supporting structure:

- `src/lib/supabaseClient.js` — the single Supabase client instance, configured from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars (see `.env.example`).
- `src/context/AuthContext.jsx` — Supabase auth session state (`useAuth()`): current user, sign in/up/out.
- `src/components/AuthGate.jsx` — shows a sign-in/sign-up screen when logged out, otherwise renders the app.
- `src/context/DataContext.jsx` — single source of truth for all app data (goals, tasks, healthLogs, reviews, ideas). Pages call its hook (`useData()`) rather than touching Supabase directly. Every table is loaded once on sign-in and then kept live via a Supabase Realtime subscription, so changes from any device appear on every other device without a refresh. Also exposes `exportAll()`/`importAll()` for the backup feature and a `loaded` flag.
- `src/components/DataGate.jsx` — shows a loading spinner until the initial fetch of all tables completes, so pages never flash an empty state before real data arrives.
- `src/components/MigrationPrompt.jsx` — one-time offer to import any leftover `pos.*` `localStorage` data (from the pre-Supabase version of this app) into the signed-in account; safe to remove once no user still has legacy local data.
- `src/components/VoiceAssistant.jsx` — mic button UI. Records speech via the browser's `SpeechRecognition` API, POSTs the transcript + Supabase access token to `/api/voice-command`, displays the reply and speaks it via `/api/text-to-speech` (falling back to the browser's built-in `SpeechSynthesis` if that isn't configured or fails).
- `api/voice-command.js` — Vercel serverless function. The **only** place `ANTHROPIC_API_KEY` is read; never expose it via a `VITE_`-prefixed var, which would bundle it into client-side JS. Verifies the caller's Supabase session, gives Claude (Haiku 4.5) a snapshot of the user's data plus `add_task`/`add_goal`/`add_idea`/`add_health_log` tools, and either inserts a row (tool call) or returns a spoken-language answer (plain text) — one simple Messages API call, no agent loop needed for this task.
- `api/text-to-speech.js` — Vercel serverless function. The **only** place `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` are read. Verifies the caller's Supabase session, then calls Azure Speech's REST API with the `en-NZ-MollyNeural` voice and streams back the synthesized audio.
- `supabase/schema.sql` — the Postgres schema (tables, row-level security policies scoped to `auth.uid()`, realtime publication). Run this in the Supabase SQL Editor when standing up a new project.
- `src/components/` — shell chrome: `Layout`, `Sidebar` (desktop), `BottomNav` (mobile), `QuickAddModal` (global capture), `BackupModal` (export/import a JSON backup — still useful even with cloud sync, as an offline safety net), `PageHeader`.
- `src/components/ui/` — reusable primitives: `Card`, `Button`, `Badge`, `Modal`, `ProgressBar`, `FormField`, `EmptyState`. Build new UI out of these before adding new one-off styles.
- `src/utils/` — `date.js` (week/date helpers).
- `src/nav.js` — the single list that drives both the sidebar and bottom nav.

**To add a new section:** create a page in `src/pages/`, add a Supabase table + RLS policy in `supabase/schema.sql`, wire it into `DataContext` following the existing `useSyncedTable` pattern, add an entry to `src/nav.js`, and add a `<Route>` in `src/App.jsx`.

## Coding standards

- Functional components with hooks only — no class components.
- No comments by default. Only add one when the *why* isn't obvious from the code itself (a workaround, a non-obvious constraint) — never comments that restate what the code does.
- Don't introduce new abstractions, dependencies, or config for a feature until the feature actually needs them. Prefer editing an existing file over creating a new one.
- All persisted data flows through `DataContext` / Supabase. Don't call `supabase` directly from a page or component — add the operation to `DataContext` first, matching the existing per-table shape (`add`/`update`/`remove`/`replaceAll`).
- Never commit `.env` (real credentials) — only `.env.example` with placeholders. The Supabase anon/public key is safe to expose in frontend code (that's what row-level security is for); the Supabase `service_role` key, `ANTHROPIC_API_KEY`, and `AZURE_SPEECH_KEY` are true secrets and must never appear in client-side code (any `VITE_`-prefixed var), this codebase, or a chat/AI tool — they only ever belong in the relevant `api/*.js` file's server-side `process.env` (set via Vercel's dashboard or a local, gitignored `.env`).
- Reuse the `src/components/ui/` primitives instead of writing new Tailwind markup for things like cards, buttons, modals, badges, or form fields.
- Keep pages self-contained: a page owns its own local UI state (modals, filters, form state) and reads/writes shared data only through `useData()`.

## Design style

- Clean, minimal "executive dashboard" aesthetic — light backgrounds (`slate-50`/white), generous whitespace, card-based layout (`rounded-2xl`, subtle border, soft shadow).
- One accent color: indigo/`brand` (`#4f46e5`, defined in `tailwind.config.js`), used for primary actions, active nav state, and progress bars. Status/category coloring uses the small `Badge` palette (`slate`, `brand`, `green`, `amber`, `red`, `blue`) — don't introduce ad hoc colors.
- Icons from `lucide-react` only, sized small (15–20px) and used sparingly (labels + icon, not icon-only unless space-constrained like the bottom nav).
- Mobile-first, fully responsive: sidebar navigation on desktop (`md:` and up), bottom nav + floating Quick Add button on mobile. Every new page should be checked at both a mobile width (~375px) and desktop width (~1280px).
- Quick Add is the one global, always-reachable action (sidebar, mobile header, and mobile FAB) — new "create" flows for a data type should generally be exposed there too, not just buried in their own page.

## Roadmap / phases

This project was built in phases, expanding scope deliberately rather than all at once:

- **Version 1 (superseded):** local-only, `localStorage`, no backend, no accounts, no cross-device sync.
- **Version 2 (current):** Supabase-backed. Real Postgres storage, email/password auth (single account), and live cross-device sync via Supabase Realtime — the `DataContext` seam from v1 made this swap possible without rewriting any page. `src/components/MigrationPrompt.jsx` carries existing v1 users' local data across automatically on first sign-in.
- **Future considerations:** anything beyond a single-account personal tool (multiple household members, sharing/permissions, offline-first conflict resolution) would be a deliberate, explicitly-requested next phase — don't build ahead for it.

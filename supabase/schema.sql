-- Personal OS — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses "if not exists" / "create or replace" where possible.

create extension if not exists "pgcrypto";

-- Goals & KPIs
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text,
  current numeric default 0,
  target numeric default 0,
  unit text,
  deadline text,
  inserted_at timestamptz not null default now()
);

-- Weekly Planner
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date text,
  done boolean not null default false,
  priority text not null default 'medium',
  inserted_at timestamptz not null default now()
);

-- Health Dashboard
create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text,
  sleep_hours numeric,
  weight numeric,
  water numeric,
  mood int,
  exercise boolean not null default false,
  notes text,
  inserted_at timestamptz not null default now()
);

-- Weekly Executive Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_of text,
  wins text,
  challenges text,
  lessons text,
  next_focus text,
  inserted_at timestamptz not null default now()
);

-- Ideas Inbox
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  tag text,
  status text not null default 'new',
  created_at text,
  inserted_at timestamptz not null default now()
);

-- Row Level Security: every user can only ever see/change their own rows.
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.health_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.ideas enable row level security;

drop policy if exists "own rows only" on public.goals;
create policy "own rows only" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.tasks;
create policy "own rows only" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.health_logs;
create policy "own rows only" on public.health_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.reviews;
create policy "own rows only" on public.reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.ideas;
create policy "own rows only" on public.ideas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime: let every device subscribe to live changes on these tables.
-- (Wrapped so re-running this script doesn't error if a table is already added.)
do $$
declare
  t text;
begin
  foreach t in array array['goals', 'tasks', 'health_logs', 'reviews', 'ideas'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

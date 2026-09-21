-- All tables from section 8 of the PRD. Policies are in 0002, functions in 0003.
-- Exists as the single starting schema for Safari Njema v2.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  swahili_level text not null default 'none' check (swahili_level in ('none', 'some', 'classes')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme_mode text not null default 'system' check (theme_mode in ('system', 'light', 'dark')),
  palette_key text not null default 'marigold',
  custom_accent text,
  sheng_enabled boolean not null default false
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'My trip to Kenya',
  start_date date,
  end_date date,
  trip_styles text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index trips_user_id_idx on public.trips (user_id);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  google_place_id text not null unique,
  name text not null,
  lat numeric not null,
  lng numeric not null,
  google_types text[] not null default '{}',
  place_type text not null,
  region text not null
);

create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id),
  visit_date date,
  activities text[] not null default '{}',
  position int not null default 0,
  lesson_status text not null default 'generating' check (lesson_status in ('generating', 'ready', 'failed')),
  created_at timestamptz not null default now()
);
create index trip_stops_trip_id_idx on public.trip_stops (trip_id);
create index trip_stops_user_id_idx on public.trip_stops (user_id);

create table public.phrases (
  id uuid primary key default gen_random_uuid(),
  swahili text not null,
  pronunciation text not null default '',
  english text not null,
  tags text[] not null default '{}',
  register text not null default 'standard' check (register in ('standard', 'sheng', 'coastal')),
  accepted_variants text[] not null default '{}',
  verified boolean not null default false,
  source text,
  audio_path text
);
create index phrases_tags_idx on public.phrases using gin (tags);

create table public.proverbs (
  id uuid primary key default gen_random_uuid(),
  swahili text not null,
  meaning text not null,
  themes text[] not null default '{}'
);

-- The shared lesson cache. One row per place, activity set and level.
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id),
  activities_key text not null default '',
  level text not null default 'none',
  content jsonb not null,
  generated_by text not null,
  created_at timestamptz not null default now()
);
create index lessons_cache_idx on public.lessons (place_id, activities_key, level);

create table public.user_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_stop_id uuid not null references public.trip_stops (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id),
  status text not null default 'ready' check (status in ('ready', 'started', 'completed')),
  current_step int not null default 0,
  score int,
  duration_seconds int,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index user_lessons_user_id_idx on public.user_lessons (user_id);
create index user_lessons_trip_stop_id_idx on public.user_lessons (trip_stop_id);

create table public.phrase_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  phrase_id uuid not null references public.phrases (id) on delete cascade,
  box int not null default 1,
  due_date date,
  times_correct int not null default 0,
  times_wrong int not null default 0,
  best_speaking_score numeric,
  used_in_real_life boolean not null default false,
  primary key (user_id, phrase_id)
);

create table public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phrase_id uuid not null references public.phrases (id) on delete cascade,
  transcript text,
  score numeric,
  passed boolean,
  method text check (method in ('auto', 'self')),
  created_at timestamptz not null default now()
);

create table public.phrase_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phrase_id uuid not null references public.phrases (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create table public.user_kangas (
  user_id uuid not null references auth.users (id) on delete cascade,
  user_lesson_id uuid not null references public.user_lessons (id) on delete cascade,
  proverb_id uuid not null references public.proverbs (id),
  earned_at timestamptz not null default now(),
  primary key (user_id, user_lesson_id)
);

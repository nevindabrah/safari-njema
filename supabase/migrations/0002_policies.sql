-- Row Level Security for every table. Users see only their own rows.
-- Shared content (phrases, proverbs, places, lessons) is readable by signed in users and written only by Edge Functions.

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.trips enable row level security;
alter table public.places enable row level security;
alter table public.trip_stops enable row level security;
alter table public.phrases enable row level security;
alter table public.proverbs enable row level security;
alter table public.lessons enable row level security;
alter table public.user_lessons enable row level security;
alter table public.phrase_progress enable row level security;
alter table public.speaking_attempts enable row level security;
alter table public.phrase_reports enable row level security;
alter table public.user_kangas enable row level security;

-- Own row tables.
create policy "own profile" on public.profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own settings" on public.user_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trips" on public.trips for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own stops" on public.trip_stops for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own lessons" on public.user_lessons for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on public.phrase_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own attempts" on public.speaking_attempts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reports" on public.phrase_reports for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own kangas" on public.user_kangas for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared content: read only for signed in users. The service role key bypasses RLS for writes.
create policy "read phrases" on public.phrases for select to authenticated using (true);
create policy "read proverbs" on public.proverbs for select to authenticated using (true);
create policy "read places" on public.places for select to authenticated using (true);
create policy "read lessons" on public.lessons for select to authenticated using (true);

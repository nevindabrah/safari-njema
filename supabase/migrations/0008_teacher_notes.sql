-- Notes on phrases from anyone who reads the phrasebook, and a teacher flag on profiles so a teacher can read and clear them.
-- Exists so a Swahili teacher's corrections land in one list on a page, instead of in an email that has to be typed back into the app.

alter table public.profiles add column is_teacher boolean not null default false;

create table public.phrase_notes (
  id uuid primary key default gen_random_uuid(),
  swahili text not null,
  note text not null check (length(note) between 1 and 1000),
  reviewer_name text check (reviewer_name is null or length(reviewer_name) <= 80),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);
create index phrase_notes_swahili_idx on public.phrase_notes (swahili, created_at);
alter table public.phrase_notes enable row level security;

create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_teacher from public.profiles where id = auth.uid()), false);
$$;
grant execute on function public.is_teacher() to authenticated;

create policy "anyone can leave a note" on public.phrase_notes for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
create policy "teachers read notes" on public.phrase_notes for select to authenticated
  using (public.is_teacher());
create policy "teachers mark notes handled" on public.phrase_notes for update to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
create policy "teachers remove notes" on public.phrase_notes for delete to authenticated
  using (public.is_teacher());

grant insert on public.phrase_notes to anon;

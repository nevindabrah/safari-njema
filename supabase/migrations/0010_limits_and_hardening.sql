-- Length limits on free text, a cap on anonymous notes, one lesson per person per stop, tighter search, and stop deletion for the owner or the person who added it.
-- Exists because the audit of 22 September 2026 found these gaps: a long value could break a screen, a script could flood the teacher's page, and any member could delete anyone's stop.

alter table public.trips add constraint trips_title_length check (length(title) between 1 and 80);
alter table public.places add constraint places_name_length check (length(name) between 1 and 120);
alter table public.profiles add constraint profiles_display_name_length check (display_name is null or length(display_name) <= 60);
alter table public.phrase_notes add constraint phrase_notes_swahili_length check (length(swahili) between 1 and 120);

create unique index user_lessons_one_per_stop on public.user_lessons (user_id, trip_stop_id);

create or replace function public.notes_in_last_hour()
returns bigint
language sql
security definer
stable
set search_path = public
as $$
  select count(*) from public.phrase_notes where created_at > now() - interval '1 hour';
$$;
grant execute on function public.notes_in_last_hour() to anon, authenticated;

drop policy "anyone can leave a note" on public.phrase_notes;
create policy "anyone can leave a note, within reason" on public.phrase_notes for insert to anon, authenticated
  with check ((user_id is null or user_id = auth.uid()) and public.notes_in_last_hour() < 200);

create or replace function public.search_usernames(p_query text)
returns table (id uuid, username text, display_name text)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.username, case when public.are_friends(auth.uid(), p.id) then p.display_name else null end
  from public.profiles p
  where auth.uid() is not null
    and p.username is not null
    and p.id <> auth.uid()
    and p.username like lower(regexp_replace(p_query, '[^A-Za-z0-9_]', '', 'g')) || '%'
    and length(regexp_replace(p_query, '[^A-Za-z0-9_]', '', 'g')) >= 3
  order by p.username
  limit 10;
$$;

drop policy "members remove stops" on public.trip_stops;
create policy "the owner or the person who added a stop removes it" on public.trip_stops for delete to authenticated
  using (auth.uid() = user_id or exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

create or replace function public.add_trip_stop(
  p_trip_id uuid,
  p_google_place_id text,
  p_name text,
  p_lat numeric,
  p_lng numeric,
  p_google_types text[],
  p_place_type text,
  p_region text,
  p_visit_date date,
  p_activities text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_place_id uuid;
  v_stop_id uuid;
  v_position int;
begin
  if not public.is_trip_member(p_trip_id) then
    raise exception 'Trip not found';
  end if;
  if p_name is null or length(p_name) not between 1 and 120 or length(p_google_place_id) > 200
     or p_lat not between -90 and 90 or p_lng not between -180 and 180
     or coalesce(array_length(p_activities, 1), 0) > 20 then
    raise exception 'That place cannot be added';
  end if;

  insert into public.places (google_place_id, name, lat, lng, google_types, place_type, region)
  values (p_google_place_id, p_name, p_lat, p_lng, p_google_types, p_place_type, p_region)
  on conflict (google_place_id) do update
    set name = excluded.name, lat = excluded.lat, lng = excluded.lng,
        google_types = excluded.google_types, place_type = excluded.place_type, region = excluded.region
  returning id into v_place_id;

  select coalesce(max(position), 0) + 1 into v_position from public.trip_stops where trip_id = p_trip_id;

  insert into public.trip_stops (trip_id, user_id, place_id, visit_date, activities, position, lesson_status)
  values (p_trip_id, auth.uid(), v_place_id, p_visit_date, coalesce(p_activities, '{}'), v_position, 'generating')
  returning id into v_stop_id;

  return v_stop_id;
end;
$$;

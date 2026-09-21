-- Two database functions: create profile rows for new users, and add a stop in one call.
-- add_trip_stop runs as the owner so users can upsert places without a write policy on that table.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  if not exists (select 1 from public.trips where id = p_trip_id and user_id = auth.uid()) then
    raise exception 'Trip not found';
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

grant execute on function public.add_trip_stop to authenticated;

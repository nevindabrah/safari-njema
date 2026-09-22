-- A stop on a shared trip can be marked "Just me": only the person who added it sees it, on the itinerary and on the map.
-- Exists because friends share whole trips, and someone may still want to plan an errand or a visit that is theirs alone.

alter table public.trip_stops
  add column private boolean not null default false;

drop policy "members see stops" on public.trip_stops;
create policy "members see stops, private ones only their owner" on public.trip_stops for select to authenticated
  using (public.is_trip_member(trip_id) and (not private or auth.uid() = user_id));

drop policy "members change stops" on public.trip_stops;
create policy "members change stops, but only the adder can make one private" on public.trip_stops for update to authenticated
  using (public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id) and (not private or auth.uid() = user_id));

drop function public.add_trip_stop(uuid, text, text, numeric, numeric, text[], text, text, date, text[]);

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
  p_activities text[],
  p_private boolean default false
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

  insert into public.trip_stops (trip_id, user_id, place_id, visit_date, activities, position, lesson_status, private)
  values (p_trip_id, auth.uid(), v_place_id, p_visit_date, coalesce(p_activities, '{}'), v_position, 'generating', coalesce(p_private, false))
  returning id into v_stop_id;

  return v_stop_id;
end;
$$;

grant execute on function public.add_trip_stop(uuid, text, text, numeric, numeric, text[], text, text, date, text[], boolean) to authenticated;

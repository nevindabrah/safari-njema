-- Usernames on profiles, log in by username, friend requests, and trips shared between friends.
-- Exists so students can find each other by username and plan one trip together. Every rule is Row Level Security or a security definer function that checks auth.uid().

alter table public.profiles
  add column username text unique check (username ~ '^[a-z0-9_]{3,20}$');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := lower(new.raw_user_meta_data ->> 'username');
begin
  if v_username !~ '^[a-z0-9_]{3,20}$' or exists (select 1 from public.profiles where username = v_username) then
    v_username := null;
  end if;
  insert into public.profiles (id, display_name, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), v_username);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create or replace function public.username_taken(p_username text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where username = lower(p_username));
$$;
grant execute on function public.username_taken(text) to anon, authenticated;

create table public.login_attempts (
  username text primary key,
  failures int not null default 0,
  last_failure timestamptz not null default now()
);
alter table public.login_attempts enable row level security;

create or replace function public.email_for_login(p_username text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := lower(p_username);
  v_email text;
  v_hash text;
  v_failures int;
  v_last timestamptz;
begin
  select failures, last_failure into v_failures, v_last from public.login_attempts where username = v_name;
  if v_failures >= 5 and v_last > now() - interval '15 minutes' then
    raise exception 'Too many tries. Wait 15 minutes.';
  end if;

  select u.email, u.encrypted_password into v_email, v_hash
  from auth.users u join public.profiles p on p.id = u.id
  where p.username = v_name;

  if v_hash is not null and v_hash <> '' and v_hash = crypt(p_password, v_hash) then
    delete from public.login_attempts where username = v_name;
    return v_email;
  end if;

  insert into public.login_attempts (username, failures, last_failure) values (v_name, 1, now())
  on conflict (username) do update
    set failures = case when public.login_attempts.last_failure > now() - interval '15 minutes' then public.login_attempts.failures + 1 else 1 end,
        last_failure = now();
  return null;
end;
$$;
grant execute on function public.email_for_login(text, text) to anon, authenticated;

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);
create unique index friendships_pair_idx on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
alter table public.friendships enable row level security;

create policy "see own friendships" on public.friendships for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));
create policy "send a request" on public.friendships for insert to authenticated
  with check (auth.uid() = requester_id and status = 'pending');
create policy "accept a request" on public.friendships for update to authenticated
  using (auth.uid() = addressee_id) with check (status = 'accepted');
create policy "end a friendship" on public.friendships for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

create policy "friends see each other" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.friendships f
    where (f.requester_id = auth.uid() and f.addressee_id = profiles.id)
       or (f.addressee_id = auth.uid() and f.requester_id = profiles.id)
  ));

create or replace function public.search_usernames(p_query text)
returns table (id uuid, username text, display_name text)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.username, p.display_name
  from public.profiles p
  where auth.uid() is not null
    and p.username is not null
    and p.id <> auth.uid()
    and p.username like lower(regexp_replace(p_query, '[^A-Za-z0-9_]', '', 'g')) || '%'
    and length(regexp_replace(p_query, '[^A-Za-z0-9_]', '', 'g')) >= 2
  order by p.username
  limit 10;
$$;
grant execute on function public.search_usernames(text) to authenticated;

create table public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  added_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);
alter table public.trip_members enable row level security;

create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.trips where id = p_trip_id and user_id = auth.uid())
      or exists (select 1 from public.trip_members where trip_id = p_trip_id and user_id = auth.uid());
$$;
grant execute on function public.is_trip_member(uuid) to authenticated;

create or replace function public.are_friends(p_a uuid, p_b uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and least(requester_id, addressee_id) = least(p_a, p_b)
      and greatest(requester_id, addressee_id) = greatest(p_a, p_b)
  );
$$;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

create policy "members see members" on public.trip_members for select to authenticated
  using (public.is_trip_member(trip_id));
create policy "owner invites a friend" on public.trip_members for insert to authenticated
  with check (
    added_by = auth.uid()
    and exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
    and public.are_friends(auth.uid(), user_id)
  );
create policy "owner removes, or member leaves" on public.trip_members for delete to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.trips where id = trip_id and user_id = auth.uid()));

drop policy "own trips" on public.trips;
create policy "members see the trip" on public.trips for select to authenticated using (auth.uid() = user_id or public.is_trip_member(id));
create policy "owner makes a trip" on public.trips for insert to authenticated with check (auth.uid() = user_id);
create policy "owner changes the trip" on public.trips for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner deletes the trip" on public.trips for delete to authenticated using (auth.uid() = user_id);

drop policy "own stops" on public.trip_stops;
create policy "members see stops" on public.trip_stops for select to authenticated using (public.is_trip_member(trip_id));
create policy "members add stops" on public.trip_stops for insert to authenticated with check (public.is_trip_member(trip_id) and auth.uid() = user_id);
create policy "members change stops" on public.trip_stops for update to authenticated using (public.is_trip_member(trip_id));
create policy "members remove stops" on public.trip_stops for delete to authenticated using (public.is_trip_member(trip_id));

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

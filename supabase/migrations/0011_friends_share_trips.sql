-- Friends share trips automatically: accepting a request joins each person to the other's trips, ending the friendship removes them, and a new trip includes existing friends. Usernames are unique whatever their case.
-- Exists because the owner decided that being friends means planning together, so nobody has to send a second invitation after the first was accepted.

create or replace function public.share_trips_between(p_a uuid, p_b uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.trip_members (trip_id, user_id, added_by)
  select t.id, p_b, p_a from public.trips t where t.user_id = p_a
  on conflict do nothing;
  insert into public.trip_members (trip_id, user_id, added_by)
  select t.id, p_a, p_b from public.trips t where t.user_id = p_b
  on conflict do nothing;
end;
$$;

create or replace function public.on_friendship_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and (old.status is distinct from 'accepted') then
    perform public.share_trips_between(new.requester_id, new.addressee_id);
  end if;
  return new;
end;
$$;

create trigger friendship_accepted
  after update of status on public.friendships
  for each row execute function public.on_friendship_accepted();

create or replace function public.on_friendship_ended()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.trip_members m
  using public.trips t
  where m.trip_id = t.id
    and ((t.user_id = old.requester_id and m.user_id = old.addressee_id) or (t.user_id = old.addressee_id and m.user_id = old.requester_id));
  return old;
end;
$$;

create trigger friendship_ended
  after delete on public.friendships
  for each row execute function public.on_friendship_ended();

create or replace function public.on_trip_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.trip_members (trip_id, user_id, added_by)
  select new.id, case when f.requester_id = new.user_id then f.addressee_id else f.requester_id end, new.user_id
  from public.friendships f
  where f.status = 'accepted' and new.user_id in (f.requester_id, f.addressee_id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger trip_created
  after insert on public.trips
  for each row execute function public.on_trip_created();

create unique index profiles_username_lower_idx on public.profiles (lower(username));

-- Foreign keys from friendships, trip members and trips to profiles, and a rule that members of one trip can see each other's names.
-- Exists because the app reads a friend's name through these links, and without them the friends list and the members panel came back empty.

alter table public.friendships
  add constraint friendships_requester_profile_fkey foreign key (requester_id) references public.profiles (id) on delete cascade,
  add constraint friendships_addressee_profile_fkey foreign key (addressee_id) references public.profiles (id) on delete cascade;

alter table public.trip_members
  add constraint trip_members_user_profile_fkey foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.trips
  add constraint trips_user_profile_fkey foreign key (user_id) references public.profiles (id) on delete cascade;

create policy "trip members see each other" on public.profiles for select to authenticated
  using (
    exists (select 1 from public.trip_members tm where tm.user_id = profiles.id and public.is_trip_member(tm.trip_id))
    or exists (select 1 from public.trips t where t.user_id = profiles.id and public.is_trip_member(t.id))
  );

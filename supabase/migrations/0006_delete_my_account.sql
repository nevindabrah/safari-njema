-- One function a signed in user can call to delete their own account and everything in it.
-- Exists because the privacy page promises it. Every table points at auth.users with on delete cascade, so removing
-- the auth row removes the profile, settings, trip, stops, lessons, progress and kangas in the same statement.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  -- Only ever the caller's own row. The function runs as its owner, which is what lets it reach auth.users at all.
  delete from auth.users where id = auth.uid();
end;
$$;

-- Anonymous visitors have no account to delete.
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

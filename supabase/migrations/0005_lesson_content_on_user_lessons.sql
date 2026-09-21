-- Lets a user's lesson carry its own content, for lessons built in the browser when the Edge Function is not deployed.
-- The shared lessons table stays writable only by server code. A user can only ever write content into their own row,
-- which the existing "own lessons" policy on user_lessons already enforces, so no new policy is needed.

alter table public.user_lessons alter column lesson_id drop not null;
alter table public.user_lessons add column content jsonb;
alter table public.user_lessons add column generated_by text;
alter table public.user_lessons add constraint user_lessons_has_a_lesson check (lesson_id is not null or content is not null);

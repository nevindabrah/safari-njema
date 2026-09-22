# Audit, 22 September 2026

An adversarial pass over the code by a senior QA and security lens, assuming it is fragile until shown otherwise. Findings are ranked. Each has the fix that closes it without changing behaviour elsewhere. "Verified" means the finding was confirmed by reading the code or by grep, not guessed.

Severity: **P1** breaks a real user or leaks data. **P2** fails silently or degrades badly under load or odd input. **P3** polish.

## 1. State and data edge cases

### 1.1 P1. Twelve database writes ignore their error and report success
**Verified.** These calls throw nothing, return `{ error }`, and the code never reads it: `trip_stops` delete, date move, status update and lesson status (useStops.ts 52, 91, 101, 105), `trips` dates (useTrip.ts 66), `trip_members` delete (useTripMembers.ts 46), `friendships` accept and delete (useFriends.ts 72, 77), `phrase_progress` upsert (useProgress.ts 37), `phrase_notes` update and delete (useTeacherNotes.ts 32, 37), `trip_stops` set ready (buildLessonInBrowser.ts 35). Several also update local state first. On a dropped connection or an RLS refusal the screen shows the change, the database does not have it, and the next reload silently reverts it.
**Fix.** One tiny helper in `src/lib/`, then check every write. Plain, repeated, readable.
```ts
// src/lib/writeResult.ts
// Turns a Supabase write result into a message or null, so hooks can report a failed save instead of pretending it worked.
// Exists because every write returns { error } and never throws, which makes silent failure the default.
export function writeProblem(result: { error: { message: string; code?: string } | null }): string | null {
  if (!result.error) return null
  if (result.error.code === '42501' || /row-level security/i.test(result.error.message)) return 'You are not allowed to change that.'
  if (/fetch|network/i.test(result.error.message)) return 'Could not reach the server. Your change was not saved.'
  return result.error.message
}
```
Then in each hook, for example `moveStop`:
```ts
async function moveStop(stopId: string, visitDate: string | null) {
  const before = stops
  setStops((list) => orderStops(list.map((s) => (s.id === stopId ? { ...s, visit_date: visitDate } : s))))
  if (isDemoMode) return updateLocalStopDate(stopId, visitDate)
  const problem = writeProblem(await supabase.from('trip_stops').update({ visit_date: visitDate }).eq('id', stopId))
  if (problem) {
    setStops(before)
    setError(problem)
  }
}
```
and expose `error` from the hook so `TripScreen` can render `{error && <p role="alert" className="text-sm text-accent-text font-bold px-2">{error}</p>}`.

### 1.2 P1. `deleteStop` removes the row from the screen before the database answers
**Verified** (useStops.ts 88 to 92). If the delete is refused, the stop is gone from view until the next full reload. Fix is the same pattern as 1.1: keep `before`, restore on `problem`.

### 1.3 P2. Trip title and place name have no length limit in the database
**Verified.** `trips.title text not null` and `places.name text not null` have no check. The UI never lets a user type a title today, but the API does, and `add_trip_stop` accepts any `p_name`. A 5,000 character name breaks the itinerary row and the map label. `display_name` is capped at 60 in the form only.
**Fix.** Migration 0010, additive only:
```sql
-- Length limits on the free text columns a user can write, so one long value cannot break a screen.
alter table public.trips add constraint trips_title_length check (length(title) between 1 and 80);
alter table public.places add constraint places_name_length check (length(name) between 1 and 120);
alter table public.profiles add constraint profiles_display_name_length check (display_name is null or length(display_name) <= 60);
alter table public.phrase_notes add constraint phrase_notes_swahili_length check (length(swahili) <= 120);
```
and in `add_trip_stop` before the insert: `if length(p_name) > 120 or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'Bad place'; end if;`.

### 1.4 P2. Race in `useStops.reload` can build the same lesson twice
**Verified** (useStops.ts 31 to 41). `reload` is called by `addStop` and by `generateLesson`, and `reload` itself can call `buildLessonInBrowser` then `reload` again. The `tried` set stops a second build for the same stop, but two overlapping reloads can both pass the `has` check before either adds to the set. Result: two `user_lessons` rows for one stop; `user_lessons[0]` then picks one at random.
**Fix.** Add to the set before awaiting:
```ts
const mine = rows.find((s) => s.lesson_status === 'ready' && s.user_lessons.length === 0 && !tried.current.has(s.id))
if (mine) {
  tried.current.add(mine.id)
  const built = await buildLessonInBrowser(mine, rows.indexOf(mine) === 0)
  if (built) await reload()
}
```
(the add already happens first; the missing piece is not reloading after a failed build, which otherwise loops the fetch) and a unique index in migration 0010: `create unique index user_lessons_one_per_stop on public.user_lessons (user_id, trip_stop_id);`.

### 1.5 P2. Async effects without a cancelled flag set state after unmount or after the user changed
**Verified** in `useTripMembers`, `useFriends`, `useTeacherNotes`, `useProgress`, `ReviewScreen`, `usePhrasebook`, `PreviewLessonScreen`, `UsernameField`. Fast navigation between a shared trip and your own can show the previous trip's members for a moment, and React warns in development. `AuthProvider.refreshProfile` can apply user A's profile after user B signed in on a slow connection.
**Fix.** Same three lines everywhere, as `useTrip` already does:
```ts
useEffect(() => {
  let cancelled = false
  load().then((data) => { if (!cancelled) setMembers(data) })
  return () => { cancelled = true }
}, [load])
```

### 1.6 P2. `email_for_login` lets anyone lock a username for 15 minutes
**Verified** (migration 0007). Five wrong passwords against `amina_k` and Amina cannot log in by username until the window passes. Email login still works, and the message says so, which is why this is P2 not P1.
**Fix.** Rate limit by caller as well, or shorten the lockout for the victim by clearing failures on a successful email login. Simplest: in the Edge Function backlog, move username login server side where IP is known. Until then, change the message to steer to email: already done (`authMessages.ts`).

### 1.7 P2. `phrase_notes` accepts unlimited anonymous inserts
**Verified.** The policy allows `anon` inserts with only a length check. A script can add a million rows and bury the teacher's page.
**Fix.** A per hour cap in the database, no Edge Function needed:
```sql
create or replace function public.notes_recently() returns bigint language sql security definer stable set search_path = public as $$
  select count(*) from public.phrase_notes where created_at > now() - interval '1 hour';
$$;
drop policy "anyone can leave a note" on public.phrase_notes;
create policy "anyone can leave a note, within reason" on public.phrase_notes for insert to anon, authenticated
  with check ((user_id is null or user_id = auth.uid()) and public.notes_recently() < 200);
```
Two hundred notes an hour is far more than a class produces and far fewer than a flood.

### 1.8 P3. Empty states are handled, with two gaps
**Verified.** Trip with no stops, no friends, no notes, no due phrases, no dates all render a sentence. Gaps: `LessonShowcase` shows "Building the lesson." for ever if `buildLocalLesson` throws (no catch); `useLesson` on a deleted stop shows "Opening your lesson." for ever when the row query returns null without error. Fix: `.catch(() => setLessons([]))` and `if (!row) setError('That lesson was removed.')`.

### 1.9 P3. Double submission is guarded on forms, not on list actions
**Verified.** `AuthForm`, `PasswordForm`, `ProfileForm` disable on `busy`. `Accept`, `Add friend`, `Invite`, `Mark handled` do not; two taps send two writes. The second fails harmlessly on unique keys (`friendships`, `trip_members`) and is idempotent elsewhere, so no corruption, but a second error toast can appear. Fix: a `busy` state on `PersonRow` actions, same pattern as the forms.

## 2. UI, responsive and accessibility

### 2.1 P2. Long usernames and display names overflow chips
**Verified.** `TripMembers` chips and `TripSwitcher` pills use `whitespace-nowrap` with no `max-w` or `truncate`. A 60 character display name makes a 600 px chip, which on a 360 px phone forces sideways scroll of the whole itinerary column. `PersonRow` is correct (`truncate` on both lines).
**Fix.** In `TripMembers.tsx` and `TripSwitcher.tsx`, wrap the name: `<span className="max-w-[10rem] truncate">{name(m)}</span>` and give the `li` `max-w-full`.

### 2.2 P2. Trip title has no truncation on the trip screen
**Verified** (`TripScreen.tsx` `h2`). With 1.3 in place the cap is 80 characters; still add `break-words` to the `h2`.

### 2.3 P3. One hard coded colour
**Verified.** `TodayCard.tsx` line 36: `borderTop: '1px solid rgba(255,255,255,0.2)'`. On the ink card this reads fine in both themes, but it breaks the "every colour is a token" rule and would go wrong if the card colour ever changes. Fix: add `--on-ink-line: rgba(255, 255, 255, 0.2);` to `:root` in `index.css` and use `var(--on-ink-line)`. Google's logo colours in `GoogleButton` are correct as they are: brand marks are not theme colours.

### 2.4 P3. Icon only buttons all carry labels, with one weak spot
**Verified.** The `am` and `pm` buttons show an icon plus text, fine. Every close, back, remove and speaker button has `aria-label`. The clock's day numbers are `role="button"` on SVG groups with `tabIndex={0}` and keyboard handlers, which works, but a screen reader hears "7 o'clock, button" without knowing whether the hour or minute hand is live. Fix: include it in the label: `` aria-label={`${moving === 'hour' ? `${position} o'clock` : `${minuteHere} minutes`}, sets the ${moving} hand`} ``.

### 2.5 P3. Dialogs close on Escape but do not trap focus
**Verified.** `PlaceCatalog`, `CalendarSheet`, `PreviewSheet` and `ConfirmButton` handle Escape and outside taps. Tab still walks behind the sheet. Low impact because every sheet is short lived. Fix if wanted: on open, focus the first control (the catalogue and calendar already do) and on the last control's `onKeyDown` for Tab without shift, `preventDefault` and focus the close button.

### 2.6 Contrast: no findings
`src/lib/theme.test.ts` checks every text and background pairing at 4.5 to 1 and every field edge at 3 to 1 in light and both dark themes, and fails the build otherwise. The two dark blocks are asserted identical.

## 3. Security and error handling

### 3.1 P1. Row Level Security is present on every table and tested, with one policy shape worth knowing
**Verified.** 17 tables, all with RLS on, 59 checks in `scripts/testDatabase.mjs` including cross user reads, the deletion function, friend and member rules. `login_attempts` has RLS on and no policies, which is correct: only the security definer function touches it. `places` is readable by all signed in users and writable only through `add_trip_stop`, correct. Note: `trip_stops` update and delete are open to every member of the trip, by design; a member can delete the owner's stops. Decide whether that is wanted. If not: `for delete ... using (auth.uid() = user_id or exists (select 1 from trips where id = trip_id and user_id = auth.uid()))`.

### 3.2 P2. `search_usernames` returns display names of every user to any signed in user
**Verified.** Prefix search, ten at a time, so a script can enumerate the whole user base by walking prefixes. Usernames are public by design; display names less clearly so.
**Fix.** Require at least three characters (`>= 3` instead of `>= 2`) and return `display_name` only when the caller is already a friend: `case when public.are_friends(auth.uid(), p.id) then p.display_name else null end`.

### 3.3 P2. No rate limit on `username_taken` and `search_usernames`
These are cheap reads, but `username_taken` is callable by `anon`. Supabase's API gateway has a default per IP rate limit, which is the only protection today. Acceptable for a class; add the same `notes_recently` style cap if it ever matters.

### 3.4 No client side injection found
**Verified.** No `dangerouslySetInnerHTML`, `innerHTML` or `eval` anywhere in `src`. All user text is rendered through React text nodes. Links built from data are limited to Wikimedia photo pages and licence URLs from a file the app ships, and the `mailto:` built in `contact.ts`. `window.location.assign` targets are literal paths.

### 3.5 P2. Inputs without a length cap
**Verified.** The note `textarea` (PhraseRow), reviewer name (NotesBar), log in identifier (AuthForm) and the typing exercise have no `maxLength`. The database caps notes at 1,000 and reviewer at 80, so the server refuses, but the user sees a generic error after typing 3,000 characters.
**Fix.** `maxLength={1000}` on the textarea with a counter, `maxLength={80}` on the reviewer field, `maxLength={254}` on the identifier, `maxLength={120}` on the typing exercise.

### 3.6 P3. Secrets
**Verified.** Only `VITE_` values reach the browser; `.env` is ignored and was never committed; the Anthropic key exists only as an Edge Function secret; `checkSupabase.ts` no longer prints the URL. The anon key is public by design and RLS is the control.

### 3.7 P3. Error boundaries
**Verified.** Routes have `errorElement: <NotFoundScreen />`, so a render crash inside a screen shows the not found page rather than a white screen. It says "I am lost", which is wrong for a crash. Fix: a small `CrashScreen` that says "Something went wrong. Reload the page." and use it as the `errorElement` for the private routes.

## 4. Order of work

1. 1.1 and 1.2: read every write's error and roll back optimistic state. One helper, twelve call sites, one afternoon. Highest value.
2. 1.3, 1.4, 1.7 and 3.2 as migration 0010, tested in `scripts/testDatabase.mjs` first.
3. 1.5 cancelled flags, 2.1 and 2.2 truncation, 3.5 input caps. Small and mechanical.
4. 2.3, 2.4, 3.7 polish.

Everything here was found by reading the code and by grep on 22 September 2026. Nothing was load tested, and no penetration test was run against the live project.

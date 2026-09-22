# Decisions

Every decision that shaped how the code works, in the order the project met them: what was decided, why, what else could have been done, and the trade-off that came with the choice. How the work was organised is not recorded here, only what the software does and how. It is written so the owner can defend any part of the project in an interview without rereading the code.

Dates are 20 to 22 September 2026. Commit hashes are given where one commit carries the decision.

## 1. Product

### 1.1 The curriculum is the itinerary
**Decision.** A traveller adds the places they are going and gets a short Swahili lesson made for each one. Nothing is taught that the trip does not need.
**Why.** General language apps teach in an order the learner does not need. A market lesson before a market visit is used the same day, which is what makes it stick.
**Alternatives.** A general phrasebook app with a Kenya theme. A chapter based course. Both exist already and neither knows where the learner is going.
**Trade-off.** Everything depends on knowing the kind of place, so classifying places well matters more than in a normal course.

### 1.2 Kenya only, on purpose
**Decision.** Search is limited to Kenya and the phrase bank is Kenyan Swahili, with Sheng marked as a register and left out of lessons by default.
**Why.** Swahili differs between Kenya and Tanzania, and a small team can review one country's phrases well. The owner's professor and students are the first users.
**Alternatives.** All of East Africa. It would have doubled the review work and weakened the phrases.

### 1.3 Ship the template path as the main product, keep the AI path switched off
**Decision.** Lesson generation with Claude is fully built and tested, but the live site runs with `LESSON_AI_ENABLED=false`. Lessons are built from the reviewed phrase bank by a plan per kind of place.
**Why.** Every phrase a student sees has been reviewed by a Swahili teacher. Text a model writes has not, and a wrong phrase taught to a first year student is worse than a plainer lesson. It also costs nothing to run.
**Alternatives.** Claude on for everyone, with a "not yet reviewed" label. Pre-generated Claude lessons for common places, reviewed once. The second is in the backlog.
**Trade-off.** The brief is general for the kind of place, not written for the exact place. The landing page says so.

## 2. Stack and repository rules

### 2.1 React, Vite, TypeScript, Tailwind, Supabase, Google Maps Platform, Claude API
**Decision.** Fixed by the PRD. No other dependency without asking and writing the reason in the README.
**Why.** Every piece is mainstream, so an interviewer can read it, and Supabase gives Postgres, auth, Row Level Security and Edge Functions from one account.
**Alternatives.** Next.js with server components (more moving parts for a static site). Firebase (no SQL, weaker access rules). A custom Node server (someone has to run it).
**Trade-off.** Vite gives a plain single page app, so there is no server rendering. That is fine: nothing here needs to be indexed by search engines except the landing page.

### 2.2 Rules that keep the code explainable
**Decision.** One feature per folder under `src/features/`. No file over about 200 lines. Every file starts with a two line comment: what it does, and why it exists. Plain, slightly repetitive code over abstractions. Business logic in pure functions in `src/lib/` with Vitest tests, components only render and call them.
**Why.** The owner will walk interviewers through the code. A 200 line ceiling forces a split at the point where a file stops being readable in one sitting. The two line comment answers the two questions a reader has before reading anything.
**Alternatives.** A conventional layered structure (components, hooks, services). Shared generic utilities. Both make a codebase shorter and harder to explain screen by screen.
**Trade-off.** Some code is repeated, for example the three auth screens each build a form. That repetition is the price of each file being self contained.

### 2.3 Tailwind v4 with every colour as a CSS variable
**Decision.** All colours, radii and shadows are variables in `src/index.css`, mapped into Tailwind with `@theme inline`. No hard coded colour in any component. No square corners.
**Why.** Theming is then a matter of rewriting one file's variables. Dark mode arrived on day two and needed no component changes.
**Alternatives.** Tailwind's built in palette. CSS modules. Styled components. All would have scattered colour choices across files.
**Gotcha learned.** Unlayered CSS beats Tailwind utilities, so element defaults must sit in `@layer base` or `mb-4` on a heading is silently ignored (b91db3c).

## 3. Data and security

### 3.1 Row Level Security on every table, from the first migration
**Decision.** Every table has RLS on with its policies in the same migration. The browser holds only the anon key.
**Why.** The anon key is public by design. RLS is what stops one student reading another's trip. Adding it later is the mistake that causes the usual Supabase data leak.
**Alternatives.** A server that checks ownership before every query. That is what Supabase's Postgres already does, closer to the data.
**How it was tested.** `scripts/testDatabase.mjs` runs the real `setup.sql` in an in-process Postgres (PGlite) and makes 25 checks as two users and an anonymous visitor (41b2900). Before that the policies had only been read, never run.

### 3.2 A security definer function for adding a stop
**Decision.** `add_trip_stop` upserts the place and inserts the stop in one call, running as its owner.
**Why.** Places are shared between users, so no user should have a write policy on that table. The function does the one write that needs elevated rights, checks the trip belongs to the caller, and nothing else.
**Alternatives.** A write policy on `places` for all users. Two round trips from the browser. An Edge Function.

### 3.3 Migrations are only ever added, and `setup.sql` is generated
**Decision.** Schema changes are new numbered files in `supabase/migrations/`. `scripts/buildSetupSql.ts` concatenates them and the seed into one `setup.sql` that a new project pastes once.
**Why.** An old migration may already have run on someone's project. Editing it would make two databases that both claim to be at the same version.
**Alternatives.** The Supabase CLI's migration tooling. It needs a terminal and Docker, and the owner wanted setup to be one paste in the browser.

### 3.4 Lesson content lives on the user's own row (migration 0005)
**Decision.** `user_lessons.content` holds the lesson JSON, `lesson_id` became nullable, and a check constraint requires one of the two.
**Why.** So a signed in user gets a lesson even when the Edge Function is not deployed: the browser builds it from the phrase bank with the same pure functions and saves it to a row only they can read (13942eb).
**Alternatives.** Requiring the Edge Function. That made "deploy a function from a terminal" a hard step between a new project and a working app.
**Trade-off.** Two code paths produce lessons. Both call the same functions in `supabase/functions/_shared/`, which is why those functions are shared.

### 3.5 Account deletion is a database function (migration 0006)
**Decision.** `delete_my_account()` deletes the caller's `auth.users` row. Every table cascades from it. Only the `authenticated` role can execute it.
**Why.** The privacy page promised deletion, and a student must be able to do it without emailing anyone.
**Alternatives.** An Edge Function using the service role key. More surface area for the same result.

### 3.6 Secrets
**Decision.** `.env` is ignored from the first commit. Only `VITE_` values reach the browser. `ANTHROPIC_API_KEY` exists only as an Edge Function secret. The feedback email address is a `VITE_FEEDBACK_EMAIL` value, not a string in the public repo.
**Why.** The repository is public.

## 4. Accounts

### 4.1 Email and password first, Google second
**Decision.** Supabase email sign up and log in, then Continue with Google, then password reset by email (585c106, fb831ae).
**Alternatives.** Magic links only (no password to forget, but every sign in needs an email, see 4.2). Google only (excludes anyone without a Google account).

### 4.2 Turn off "Confirm email" until custom SMTP exists
**Decision.** The setup guide tells the owner to turn email confirmation off while friends test.
**Why.** Supabase's built in mailer sends 2 emails an hour and only to the project's own team. With confirmation on, a friend who signs up waits for an email that never arrives. The guide's step 3b explains how to add Resend or similar and turn it back on.
**Alternatives.** Set up custom SMTP first. It is the right end state and is in the backlog, but it needs a domain the owner controls.

### 4.3 Plain sentences for auth errors
**Decision.** `src/lib/authMessages.ts` maps Supabase's error strings to sentences with a next step, and passes anything unknown through unchanged.
**Why.** "email rate limit exceeded" means nothing to a traveller. Passing unknown errors through means nothing is hidden.

### 4.4 The demo and real accounts share one site
**Decision.** When Supabase values exist, the landing page offers both "Create your account" and "Try the demo, no sign up". The choice is saved in localStorage, read once at page load, and entering or leaving the demo reloads the page (d55f2b5).
**Why.** Recruiters want to look around without signing up. Students want their trip saved. One URL serves both.
**Alternatives.** Two Vercel projects. Twice the deployments to keep in step.
**Trade-off.** `isDemoMode` is a constant per page load, not React state. The reload is what makes that safe, and it keeps every data hook to one `if (isDemoMode)`.

### 4.5 Usernames, and logging in with one
**Decision.** Every profile has a unique username, lower case letters, numbers and underscores, 3 to 20 characters, enforced by a check constraint and a unique index. Sign up sends it in the auth metadata and the trigger keeps it if valid and free. Google accounts choose one on a welcome step. Logging in accepts a username or an email.
**Why.** The owner asked for friends to find each other by username, and for a username to work at log in.
**How log in by username works.** Supabase only signs in with an email. `email_for_login(username, password)` runs as its owner, compares the password with the bcrypt hash in `auth.users` using pgcrypto's `crypt`, and returns the email only on a match. The browser then calls the normal password sign in. Five wrong tries lock the username for 15 minutes, in a `login_attempts` table nobody can read.
**Alternatives.** An Edge Function with the service role key doing the lookup (more moving parts and a deploy step). A function that returns the email for any username (leaks every student's email to anyone who knows their username). Asking Google users to reuse their Google password (impossible: Google never shares it, and a site that claimed to would be phishing).
**Trade-off.** The lookup is not covered by Supabase's own auth rate limits, hence the attempts table.

### 4.6 Friend requests and shared trips
**Decision.** One `friendships` table: requester, addressee, status pending or accepted, one row per pair in either direction. One `trip_members` table. The owner may invite only accepted friends. Members see the trip and its stops, may add and move stops, and each gets their own lesson per stop; only the owner changes the dates or the title.
**Why.** The owner's idea: friends who are going on a trip together plan one trip. Keeping lessons per person means each traveller's progress is their own.
**Alternatives.** Copying a trip to a friend (no shared editing). Trip codes anyone can join (no friendship step, and anyone with the code can edit). Full roles per trip (more than two students need).
**Gotcha learned.** A `stable` security definer function used in a select policy cannot see a row inserted by the same statement, so `insert ... returning` failed for trips. `is_trip_member` is volatile and the owner check is written inline in the policy.

## 5. Lessons

### 5.1 Claude behind an Edge Function, validated with zod, one retry, template fallback
**Decision.** The Edge Function asks Claude for JSON, validates it against a zod schema, retries once with the error in the prompt, and falls back to the template lesson if it still fails (a65f74c).
**Why.** The API key never reaches the browser. A model's JSON is sometimes wrong, and a validated fallback means the user always gets a lesson.
**Alternatives.** Calling the API from the browser (leaks the key). Trusting the JSON (crashes on the first malformed reply).

### 5.2 Per phrase tags and a slot plan per kind of place
**Decision.** Each of the 95 phrases carries its own tags in `scripts/extractPhrases.ts`. `lessonPlan.ts` holds six slots per kind of place, filled essential first (36f66ab, 634a9fd).
**Why.** The first version tagged whole chapters, so a beach lesson pulled a random greeting and gave the wrong reason for it. Tagging each phrase let the plan say "a coastal greeting, then a way to order, then two price phrases" and give a true reason for each.
**Alternatives.** Let Claude pick phrases from the bank. That is the AI path, and it is off (1.3).
**Tested.** The three acceptance stops from the PRD and a sweep of every kind of place have exact phrase expectations in tests.

### 5.3 Eight phrases in priority order, learner picks the length
**Decision.** Every lesson stores eight phrases, most needed first. Quick studies four, Standard six, Deep eight (08caa3b, 773ddff).
**Why.** The PRD said six. The owner wanted the learner to choose. Storing eight in priority order means one lesson serves all three lengths without regenerating.
**Trade-off.** This departs from the PRD's six phrase cap, at the owner's request.

### 5.4 Practice is eight kinds of exercise in three parts, with a second chance
**Decision.** Recognise, recall, produce. Meaning, true or false, match, recall, sounds like, listen, build from tiles, fill the gap, type. Missed items return once and do not change the score (c6f5955, f8b062a).
**Why.** The owner asked for "varied questions like Duolingo". Three parts move from reading to producing. The second chance is where the learning happens.
**Alternatives.** Multiple choice only (the first version). It was quick to build and boring to use.
**Detail.** Typed answers are checked with edit distance (`checkTyped.ts`) so one slipped letter is not a fail. Double taps are locked out with a ref, because a fast tap once counted two answers.

### 5.5 A proverb on every lesson, and a kanga for finishing it
**Decision.** Lessons carry a seeded proverb (optional `kanga` field in the schema). Finishing a lesson earns an SVG kanga on a shelf at `/kangas`.
**Why.** Kangas are cloths printed with proverbs. It is the one reward in the app that is Kenyan rather than generic.
**Alternatives.** Points and streaks alone. The streak exists inside practice; the kanga is the lasting thing.

## 6. Demo mode and the map

### 6.1 A full demo with no keys, no accounts and no server
**Decision.** With no Supabase values, the app runs from localStorage: a seeded three stop trip, a sketch map of Kenya drawn in SVG, and lessons built in the browser (a6b157a, 141cd7e, f17495b).
**Why.** The owner asked to exercise every feature before setting up Supabase, then wanted a link a recruiter could open. A demo that needs a key is not a demo.
**Alternatives.** A recorded video. A hosted test account (needs the backend). Neither lets someone add their own stop.
**Trade-off.** Two implementations of the data layer. Each hook keeps them side by side with one `if`, and the pure functions are shared.

### 6.2 Google Maps Platform for the real map, with a sketch when there is no key
**Decision.** The real planner uses the Google map and Places search restricted to Kenya and to the fields the PRD lists. Without a key, the sketch map and a built in catalogue take over.
**Why.** Google Maps needs a paid key. The professor's students will not have one, so the built in catalogue had to become good enough on its own.
**Alternatives.** OpenStreetMap with Leaflet (free, weaker place data and no autocomplete of the same quality). Mapbox (also paid).

### 6.3 A catalogue of 51 places with intent search
**Decision.** Every built in place has a credited photo. `placeSearch.ts` matches names and intent words (food, swim, animals) with typo forgiveness that starts at five letters for names and seven for keywords (460c423, 861a59e).
**Why.** The owner said "if they type food, restaurants should show up". The fuzziness thresholds came from a real miss: "Paris" matched parks until keyword fuzziness required seven letters.
**Alternatives.** A search library. The whole thing is 80 lines and fully tested.

### 6.4 Photos from Wikimedia Commons, resolved once and served from the site
**Decision.** `scripts/fetchPlacePhotos.ts` finds each place's lead photo through the MediaWiki action API in batches, records author and licence, and saves two compressed sizes into `public/places` (51c4688, 61e3726).
**Why.** Wikipedia's per page summary API rate limits with 429 after a few dozen requests, and loading full size photos from Wikimedia cost 832 KB on the landing page. Self hosting cut the landing page from 1,119 KB to 410 KB.
**Alternatives.** Google Places photos (paid, and licensed for use only beside the map). Stock photos (unlicensed or paid). Unsplash (fine, but not the actual place).

## 7. Design

### 7.1 No emoji, an own icon set
**Decision.** Every emoji was replaced by a line icon in `src/components/icons.tsx` (5737ec0).
**Why.** The owner said the first version looked like "AI slop". Emoji render differently on every device and read as a shortcut.

### 7.2 Dark mode written twice, and a test that they match
**Decision.** Dark tokens live in two blocks: the device preference block (`:root:not([data-theme="light"])` inside a media query) and the toggle block (`:root[data-theme="dark"]`). `src/lib/theme.test.ts` fails if they differ, and checks every text and background pairing for 4.5 to 1 contrast in all three themes (227c383).
**Why.** A colour added to only one block made answer feedback unreadable for anyone who picked dark with the toggle. The test turns that mistake into a failing build.
**Alternatives.** One block with `light-dark()` in CSS. Browser support was not universal at the time. A JavaScript theme that sets variables. Then the page flashes before the script runs.

### 7.3 Fields and panels in light mode
**Decision.** New `--field` and `--field-edge` tokens with a shared `.field` class on every typed input, and a darker light `--surface-2`. Edges must reach 3 to 1 against the card in every theme (5d46520).
**Why.** The note box was invisible in light mode: the inner surface colour equalled the page colour and was almost white on a white card. Dark mode hid the problem because its inner surface differs from its card.
**Lesson.** Check new UI in light mode as well as dark.

### 7.4 Fonts served from the site
**Decision.** Bricolage Grotesque and DM Sans are in `public/fonts`, preloaded, and cached for a year (603d760).
**Why.** Two extra connections to Google cost about half a second before the final lettering appeared on a phone. It also means the privacy page can say the site talks to no other service.

## 8. Audio

### 8.1 Offline text to speech, judged by speech recognition, no service at run time
**Decision.** Meta's MMS text to speech for Swahili (`facebook/mms-tts-swh`) records every phrase offline. Several takes are made per phrase, MMS speech recognition (`facebook/mms-1b-all`, Swahili adapter) listens to each, and the take heard closest to the written phrase is kept. Clips under 0.7 similarity are held back (0bda293).
**Why.** A speech service at run time needs a key and costs money per play. Recording once means no key, no cost, and every clip can be checked by a second model before a student hears it. The PRD first planned an Azure `sw-KE` voice.
**Alternatives.** Azure or Google neural voices (better quality, paid, and licensed differently). Human recordings (best of all, and in the backlog for the four held clips).
**Licence.** MMS is CC BY-NC 4.0, non-commercial with credit. If the project ever earns money, the clips must be regenerated with a commercial voice. The About page and README say so.

### 8.2 Short words spoken three times, keep the middle one
**Decision.** For single words the model also says the word three times and the middle one is cut out using the model's own duration predictor, reached through a forward hook (c398bc6).
**Why.** The voice was trained on sentences and clips short words. The middle word has natural flow on both sides. This rescued Bahari, Kiboko and others.

### 8.3 Other voices only where the main voice is weak
**Decision.** Nine community fine tunes were compared. The main voice is clearest overall. Another voice replaces it only when the main voice scores under 0.9 and the other is heard at 0.95 or better. Four clips come from two other voices. Voices with no stated licence were tested and not shipped even where they won (aea3ee9, ce59696).
**Why.** One consistent speaker matters for a learner. Mixing voices is justified only by a clear win.

### 8.4 Held clips say "Audio coming soon"
**Decision.** The four phrases no voice could say (Sasa? / Poa, Ndiyo / Hapana, Mia / Elfu, Twiga) show a quiet label instead of a speaker. The owner will ask his professor or a friend to record them (22 September 2026).
**Alternatives.** Offering the weak clip with a warning. A wrong sound taught to a beginner is worse than none.

### 8.5 Every clock time recorded from the app's own code
**Decision.** `scripts/listTimePhrases.ts` prints the Swahili for all 288 times the clock can show by calling the same functions the screen uses. `generateTimeAudio.py` records them with the same judge (a19953a, b0d704a). 262 of 289 were heard exactly; the mean score is 0.996.
**Why.** A copied list would drift from the code. The list is derived, so a wording change re-records the right clips.

## 9. Performance

### 9.1 Measured on an emulated 4G phone before and after
**Decision.** Landing page cold load went from 1,119 KB to about 370 KB. First paint about 0.6 s, repeat visit 0.3 s (159952f and later).
**How.** Self hosted photos in two sizes, self hosted fonts, `manualChunks` for React and Supabase, idle prefetch of the next screens, long cache headers in `vercel.json`, lesson audio preloaded during the brief.
**One detail worth telling.** Supabase's client was still in the demo build because `Boolean(url && anonKey)` was not folded by the bundler. Writing the condition inline let dead code elimination drop 55 KB.

## 10. Phones and navigation

### 10.1 Phone and laptop matter equally, checked at 320, 360 and 390 px
**Decision.** Every screen is audited by a script for sideways scroll, tap targets under 40 px and form text under 16 px (fab64be).
**Fixes that came out of it.** A picked place opens as a bottom sheet with a sticky Add button, because the card was cut off inside the small phone map. The lesson photo shrinks to a strip once a lesson starts so the answers fit. Form text is 16 px so iPhones stop zooming on focus.
**Gotcha.** In Chrome's mobile emulation an overflowing page widens `innerWidth`, so the audit compares against the intended width, not `innerWidth`.

### 10.2 A logo that goes home, a back arrow or X on everything
**Decision.** `Logo.tsx`, `LeaveButton.tsx` and `SearchBox.tsx` are the three shared pieces (9523f25, 4c9f0c7).
**Detail.** The back arrow returns to the previous screen when there is one in this tab (React Router's history index above zero) and otherwise to a sensible home. A signed in visitor is sent straight to the trip only when the home page is the first screen of the visit, so the logo can still show the home page.

### 10.3 The app's own calendar
**Decision.** The browser's date field was replaced by `DatePicker.tsx` and `CalendarSheet.tsx`, with the arithmetic in `src/lib/calendar.ts` (9c22f13).
**Why.** The native field looks different on every device and ignores the app's colours and corners. The owner asked for it to match.
**Alternatives.** A date picker library. The arithmetic is 60 lines and all dates are strings in UTC, so no time zone can shift a day.
**Trade-off.** The calendar sheet is rendered through a portal so no card or map clips it, and it stops Escape from also closing the sheet under it.

## 11. Telling time

### 11.1 A screen of its own, after a folded section went unseen
**Decision.** First built as a folded card inside the phrasebook. The owner could not find it. It became `/time`, linked from the top bar, a fourth phone tab, the landing page and the phrasebook (952f7f5).
**Lesson.** Put new features where they can be seen. Folding to save space hid the feature entirely.

### 11.2 Two rings on the clock
**Decision.** The outer ring is the watch hour, the inner ring the Swahili hour, so the hand points at both at once. Later an hour hand and a minute hand in steps of five, with a switch for which hand is live (65f4976, 29177b8).
**Why.** The six hour shift is the whole lesson, and it is easier to see than to read.
**Alternatives.** A slider (the first version) and a table. Neither shows the shift on a clock face.

### 11.3 Minutes said the Swahili way, boundaries as a convention
**Decision.** Up to half past, minutes are added (na robo, na nusu, na dakika). After that they are taken away from the coming hour (kasorobo, kasoro dakika), and the part of the day follows the coming hour. Parts of the day are alfajiri 4 to 7, asubuhi 7 to 12, mchana 12 to 16, jioni 16 to 19, usiku otherwise.
**Why.** This is the common convention. Speakers differ on the boundaries, and the screen says so.
**Review.** These words were added after the teacher's review. The owner reviewed the words and every recording on 22 September 2026, so the "not yet reviewed" label was removed.

### 11.4 The face does not turn dark at night
**Decision.** An early version darkened the clock face after 7 pm as a reminder of the count restarting at sunset. The owner did not want it, so it was removed.

## 12. Testing approach

### 12.1 Vitest for pure functions, a browser script for flows, PGlite for the database
**Decision.** 179 Vitest tests cover the pure functions in `src/lib/` and `supabase/functions/_shared/`, plus the theme and contrast checks. Whole user flows are exercised by throwaway Node scripts that drive headless Chrome over the DevTools protocol, including a solver that completes a full lesson using the seed JSON as the answer key. Those scripts are not committed. The database is tested by running the real `setup.sql` in PGlite.
**Why.** Pure functions are where the logic is, and they test in milliseconds. The browser scripts caught most of the real bugs (a scaled focus ring, a double counted tap, an unreadable feedback panel) without adding Playwright as a dependency.
**Alternatives.** Playwright with committed end to end tests and CI. In the backlog. React Testing Library for components, which would have tested rendering, where few of the bugs were.

## 13. Things that would be done differently

- Set up custom SMTP before inviting anyone to sign up. The built in mailer's limits were found late.
- Check every new screen in light mode as well as dark from the start, not only when a user reported it.
- Build a feature where it will be seen, not folded away. The time section had to be moved.
- Commit a small Playwright suite once flows settled, instead of keeping the browser scripts in a scratch folder.
- Decide the audio licence question earlier. MMS is non-commercial, which is fine for a student project and a real constraint later.

## 14. Short answers for interviews

- **Why Supabase and not your own server?** Postgres with Row Level Security puts the access rules next to the data, and I could test them by running the real schema in an in-process Postgres. A server of mine would be one more thing to run and to get wrong.
- **Why is the AI off?** Every phrase a first year student sees has been reviewed by a teacher. Model output has not. The AI path exists, is validated and tested, and can be switched on per project.
- **How do you know the audio is right?** A second model, a Swahili speech recogniser, listens to every take and I keep the one it hears closest to the text. What it heard is logged for every clip. Clips it could not follow are held back and say "coming soon".
- **What was the hardest bug?** Answer feedback unreadable in dark mode, but only for people who chose dark with the toggle. Two copies of the dark theme had drifted. The fix was a test that fails the build if they differ, plus contrast checks for every pairing.
- **What would you do with another week?** Custom email, a Playwright suite in CI, pre-generated Claude lessons reviewed once, and human recordings for the four held phrases.

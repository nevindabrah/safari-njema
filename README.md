# Safari Njema

**A travel companion for Kenya. Duolingo, but the curriculum is your itinerary.**

You add the places you are going. Each stop becomes a five minute Swahili lesson made for that place: a brief on what to know, the phrases you will need there, and a quiz. A market teaches prices and bargaining. A beach teaches coast words and ordering. A game reserve teaches the animals your guide will call out.

**Live demo:** add your Vercel URL here after deploying. No sign up is needed. The demo opens on a ready-made trip.

![The landing page](docs/screenshots/landing.png)

| The trip planner | A finished lesson earns a kanga | On a phone, dark mode |
|---|---|---|
| ![Trip planner with a map of Kenya and three stops](docs/screenshots/trip.png) | ![The end of a lesson, with the place photo and the kanga that was earned](docs/screenshots/lesson.png) | ![The itinerary on a phone in dark mode, with place photos and the bottom tab bar](docs/screenshots/phone-dark.png) |

![The kanga shelf: one cloth per finished lesson, each carrying a Swahili proverb](docs/screenshots/kangas.png)

## The demo and the full product

Safari Njema is designed around **Google Maps Platform** and the **Claude API**. The public demo runs without API keys so it costs nothing to keep online, and it stands in for them like this:

| Part | In the demo | With the keys switched on | Where the code is |
|---|---|---|---|
| Map and search | A sketch of Kenya and 21 built-in places | Google Maps JavaScript API for the map and pins. Places Autocomplete, limited to Kenya, with session tokens and only six billed fields | `src/features/trip/TripMap.tsx`, `usePlaceSearch.ts` |
| Lessons | A template picks phrases from the bank and adds a general brief | The Claude API writes the brief for the exact place and chooses phrases from the bank. JSON is validated with zod, retried once, then falls back to the template | `supabase/functions/generate-lesson/claude.ts` |
| Accounts and data | One demo account in the browser | Supabase Auth, Postgres with Row Level Security, and an Edge Function that keeps the Anthropic key on the server | `supabase/migrations/`, `generate-lesson/index.ts` |

The switch is automatic. With no keys the app is the demo. Add the Supabase values and it becomes the real product with accounts, add a Google Maps key and the sketch becomes Google Maps, set `LESSON_AI_ENABLED=true` with an Anthropic key and Claude writes the lessons.

## Why it is interesting

- **Lessons come from a phrase bank, not free text.** Language models make mistakes in Swahili, so the model may only choose from 95 phrases, each tagged by hand. It picks and explains. It does not invent.
- **An AI switch.** With it on, Claude writes the brief and picks phrases, and its JSON is validated with zod. With it off, a template builds the lesson from the same candidates. The live site runs with it off, so it costs nothing to host.
- **One pipeline, two runtimes.** Scoring, the slot plan and the template are pure TypeScript. The same files run in a Supabase Edge Function and in the browser demo.
- **A Swahili voice, checked by a machine that understands Swahili.** Every phrase is spoken by Meta's MMS text to speech model for Swahili. A script records up to twenty two takes of each phrase, a Swahili speech recogniser listens to every take, and the clearest one is kept. A clip the recogniser could not understand is held back, so that phrase has no speaker button instead of a wrong sound. What was heard for every clip is in `docs/audio-report.json`. No speech service and no key at run time.
- **Built to be corrected.** A public phrasebook lists all 95 phrases with their pronunciation guide and recording, including the eight recordings held back from lessons, so a Swahili speaker can judge them by ear. They leave a note beside any phrase and send all their notes at once by email, copy or file. No account and no server.
- **Accessible colour, tested.** A test reads the real stylesheet and checks every text and background pairing in light, device dark and toggle dark against the 4.5 to 1 standard. It also fails if the two dark themes ever differ, which is the bug that once made answer feedback unreadable.
- **Reviewed Swahili.** All 95 phrases have been reviewed by a Swahili teacher. Anything a model proposes later is marked unreviewed until someone checks it.
- **A look that belongs to the subject.** Every finished lesson earns a kanga, the printed cloth that always carries a Swahili proverb, drawn in SVG from six colourways and four motifs. The icons are the app's own line set, not emoji. Light, dark or follow the device, with no flash on load.
- **Real photos, properly credited.** A script resolves one freely licensed Wikimedia Commons photo per place in three batched requests, and saves the author and licence. Every photo is credited where it is shown and on the About page.
- **Tests that read the lessons.** 124 unit tests. They assert the exact phrases for a market, a beach and a game reserve, then sweep every kind of place so the bill never shows up at an airport.
- **Row Level Security on every table**, with a database function so users never need write access to shared tables.
- **Written to be read.** One feature per folder, no file over 200 lines, and every file opens by saying what it does and why it exists.

Try it in thirty seconds:

```
git clone https://github.com/nevindabrah/safari-njema.git
cd safari-njema
npm install
npm run dev
```

With no keys at all, this runs the full demo. The product requirements are in `safari-njema-prd.md`.

## Architecture in five sentences

The frontend is a Vite and React site deployed on Vercel, with every screen listed in `src/routes.tsx`. Supabase provides the database, email and password login, Row Level Security so users only see their own rows, and one Edge Function. When a stop is added, the browser calls the `generate-lesson` Edge Function, which picks candidate phrases from the phrase bank by matching tags to the place type, activities and region. If the AI switch is on, Claude writes the brief and chooses the phrases from those candidates; if it is off or anything fails, a template lesson is built from the same candidates with no model call. Lessons are cached in a shared `lessons` table and each user gets a `user_lessons` row pointing at one.

## How a lesson is generated

```
browser                     generate-lesson (Edge Function)                     database
-------                     -------------------------------                     --------
add stop  ──rpc──────────▶  add_trip_stop upserts place, inserts stop  ──────▶  places, trip_stops
invoke ───────────────────▶ 1. check the stop belongs to the caller
                            2. load place type, region, activities, level  ◀──  profiles, trip_stops
                            3. first stop of the trip? then greetings are in
                            4. pick 40 candidate phrases by tags            ◀──  phrases
                            5. cache check by place + activities + level    ◀──  lessons
                            6. LESSON_AI_ENABLED=true? ask Claude for JSON,
                               validate with zod, retry once
                            7. otherwise build the template lesson
                            8. save lesson, save user_lesson, mark ready   ──▶  lessons, user_lessons, trip_stops
lesson ready ◀───────────── { user_lesson_id, lesson }
```

The pure parts of this (candidate picking, the template, the quiz) have Vitest tests and no network calls. One test file runs the acceptance-test stops against the real seed with the exact phrases expected, then sweeps every kind of place in three regions to check phrases stay where they belong.

## Setup

The app runs as the demo with no setup at all. To turn on accounts and server side lessons, follow **[docs/SETUP.md](docs/SETUP.md)**. In short:

1. **Supabase.** Create a project, paste `supabase/setup.sql` into the SQL editor once, and put the project URL and anon key in `.env`. That one file holds every table, every Row Level Security policy, both database functions, and the 95 reviewed phrases and 10 proverbs.
2. **Sign in.** Email and password works out of the box. For "Continue with Google", create an OAuth client in Google Cloud and paste its ID and secret into Supabase. The guide gives the exact redirect addresses.
3. **Edge Function.** `npx supabase functions deploy generate-lesson`, then set `LESSON_AI_ENABLED` and, if it is on, `ANTHROPIC_API_KEY` as Supabase secrets.
4. **Check.** `npm run check:supabase` reads `.env` and reports, line by line, whether each table exists, whether Row Level Security hides rows from strangers, whether email and Google sign in are on, and whether the function is deployed.
5. **Google Maps.** Optional at first. Without a Maps key the planner uses the sketch map and the built-in places, so accounts and lessons can be tested before Google Cloud is touched. With one, enable Maps JavaScript API and Places API (New), restrict the key to your domains, and create a Map ID.
6. **Vercel.** Import the repo and add the `VITE_` values. `vercel.json` already rewrites every path to `index.html` for React Router.

## Demo mode: the whole product with no accounts and no keys

When the Supabase values are missing, the app runs in demo mode. This is what the live demo link shows.

- The landing page has one button, "Try the live demo". It opens a ready-made trip: Maasai Market, Diani Beach and the Maasai Mara, each with its own lesson.
- Search a built-in list of 21 well known Kenyan places, one for every kind of place. Searching "Paris" finds nothing, like the real Kenya-only search.
- Add a place with a day and activities. It appears as a numbered pin on a sketch map of Kenya and as a row in the itinerary, with the "Preparing your lesson" state. Stops in the same town fan out into a ring so each pin can be clicked, and picking a pin shows its name and rings its row.
- Lessons are built in the browser by the same pure functions the Edge Function uses, from the same seed phrases. The first stop teaches greetings and later stops do not. Each lesson carries a Swahili proverb from the seeded list, the kanga idea.
- Every lesson starts by asking how long you have: Quick (3 minutes, 4 phrases), Standard (5 minutes, 6 phrases) or Deep (10 minutes, 8 phrases). A lesson holds eight phrases in priority order, so a shorter one studies the first few. The choice is remembered.
- Practice mixes eight kinds of exercise in three parts that get harder: recognise (meaning, true or false, match the pairs), recall (English to Swahili, sounds like), and produce (build the sentence from word tiles, fill the gap, type the answer with one typo forgiven). Wrong answers come from the whole phrase bank, a streak counter rewards runs, and anything missed comes back once in a second chance round. Only first tries count.
- Dates are free. Trip dates can be set, changed or cleared at any time. A stop can take any date, inside the trip or not, and can be moved to another day later. The list and the pin numbers follow the dates.
- Sound effects for taps, right and wrong answers, a new stop and a finished lesson. They are made with Web Audio, so there are no audio files, and the speaker button in the top bar mutes them for good.
- Every phrase can be played aloud: on the phrases step, on the pocket card, and automatically after each answer. Practice includes listening exercises, where you hear a phrase and pick what was said. The speaker button in the top bar turns the automatic playback off.
- The phrasebook at `/phrasebook`, the privacy page at `/privacy`, and a friendly page for unknown addresses are all public.
- During a lesson the tab bar and the demo strip step aside, and the feedback scrolls into view after each answer, so the Next button is never hidden on a phone.
- Every stop has a pocket card: all its phrases with pronunciation, the three things to know, the etiquette note and Kenya's emergency numbers, on one page that prints cleanly.
- The kanga shelf shows a cloth for every lesson. Unearned ones are veiled and keep their proverb hidden until the lesson is finished.
- Laptop users can answer with the number keys and move on with Enter. On a phone the main links sit in a floating tab bar within thumb reach.
- Finish a quiz and the stop turns green and the trip's progress bar moves. "Start with an empty trip" clears the sample so the first stop flow can be tried from scratch.

Demo data lives in the browser's localStorage. Demo mode is only ever on when the Supabase values are missing, so once they are set on Vercel the site becomes the real product with accounts. The code is in `src/features/demo/`, and each data hook switches to it with one `if (isDemoMode)`.

What demo mode cannot show: real sign up and login, the real Google map and search, and Claude written lessons. Those need the setup above.

To put the demo online: go to vercel.com/new, import this repository and press deploy. No environment variables are needed. `vercel.json` already sends every path to `index.html`.

Then locally:

```
cp .env.example .env    # fill in the four VITE_ values
npm install
npm run dev             # http://localhost:5173
npm test                # Vitest
npm run build           # type check and production build
```

## The voice and its licence

`python scripts/generateAudio.py --judge` makes `public/audio/*.m4a` and `src/features/audio/audioManifest.json`. The voice is `facebook/mms-tts-swh` and the listener that judges each take is `facebook/mms-1b-all` with its Swahili adapter. Both are Meta's MMS models under **CC BY-NC 4.0**: free for non-commercial use with credit, which suits a student project. If Safari Njema ever earns money, the clips must be regenerated with a commercial voice, for example an Azure `sw-KE` neural voice, which is what the PRD first planned. The script needs Python with torch, transformers and scipy, and macOS for `afconvert`. It is a one time build step, not a dependency of the app.

## Photos and their licences

`node scripts/fetchPlacePhotos.ts` finds the lead photo of each built-in place's Wikipedia article, falls back to a Wikimedia Commons search where an article has none, and writes `src/features/places/placePhotos.json` with the image URL, author, licence and source page. It skips anything that is not on Commons, which is how fair use logos are kept out. Photos found by search are marked illustrative and credited that way. The app never looks photos up at runtime, so a visitor cannot be rate limited.

## Environment variables

| Name | Where | What |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env`, Vercel | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env`, Vercel | Supabase anon key, safe in the browser because RLS is on |
| `VITE_GOOGLE_MAPS_KEY` | `.env`, Vercel | Google Maps key, restricted by domain and API |
| `VITE_GOOGLE_MAP_ID` | `.env`, Vercel | Map ID for the styled map and custom pins |
| `VITE_FEEDBACK_EMAIL` | Vercel | Optional. Where phrasebook notes are emailed. Left unset, the email opens with no address |
| `LESSON_AI_ENABLED` | Supabase secret | `true` or `false`. The live site runs with `false` |
| `LESSON_MODEL` | Supabase secret | Claude model name, default `claude-opus-5` |
| `ANTHROPIC_API_KEY` | Supabase secret | Never in `.env`, never under `src/` |

`.env` is git ignored. Only `VITE_` variables reach the browser.

## The AI switch

Lesson generation with Claude is fully built in `supabase/functions/generate-lesson/claude.ts`. On the live site `LESSON_AI_ENABLED` is `false`, so every lesson comes from the shared cache or from the template in `supabase/functions/_shared/template.ts`. The lesson screen says which kind it is: "Written for this place" or "General lesson for this kind of place". To demo live generation, set the switch to `true` with a key.

Still to do for this: run the AI path end to end once, record it, and pre-generate lessons for about 20 popular places (PRD 7.3a).

## Demo account on the real backend

Not needed while the live site runs in demo mode. Once Supabase is connected, the PRD asks for a shared demo login. To create it: sign up an account on an address Nevin controls, add three stops, then in the SQL editor set `is_demo = true` on its `profiles` row so it cannot generate new lessons. Then print the email and password here and on the landing page.

## What is built

The 22 September cut, in the PRD's order:

1. Vite, React, TypeScript, Tailwind v4 with every colour, radius and shadow as a CSS variable in `src/index.css`. Light and dark follow the device.
2. Supabase schema for every table in the PRD, RLS on all of them, email and password sign up and login.
3. One trip is created automatically the first time a user opens the planner. No onboarding.
4. The trip planner: Google map, Kenya-only search with session tokens, preview card with day and activity chips, numbered pins, a route line, the itinerary list, delete.
5. `generate-lesson` with the template path and the Claude path behind the switch, daily limit of ten, demo account blocked.
6. The three step lesson: brief, phrases, quiz. The quiz builder is a pure function with tests.
7. About page, a note that the phrases have been reviewed by a Swahili teacher, this README.
8. Demo mode, described above: a seeded trip, a sketch map of Kenya, completion and progress, and a proverb on every lesson.
9. A public sample lesson at `/preview` for the three acceptance-test stops, so a visitor can see a lesson without an account. The trip and lesson screens load on demand to keep the landing page small.

Built since the deadline: Google sign in and password reset, the theme toggle, audio, varied practice, lesson lengths, kangas, pocket cards and photos. Still to do: the Today screen, onboarding, speaking practice, spaced repetition, pre-made Claude lessons, and running the Claude path against the live API.

## How it works, in plain language

- `src/features/trip/usePlaceSearch.ts` talks to Google. It asks for suggestions limited to Kenya, and when you pick one it fetches only six fields. `placeTypes.ts` turns Google's types into our eleven, and `regions.ts` turns the county into one of six regions.
- `add_trip_stop` in `supabase/migrations/0003_functions.sql` upserts the place and inserts the stop in one call, so the browser never needs write access to the shared `places` table.
- `useStops.ts` then calls the Edge Function and waits. The list row shows "Preparing your lesson" until it returns.
- `supabase/functions/_shared/pickCandidates.ts` scores every phrase in the bank by its tags. Greetings score high on the first stop and are dropped afterwards. Sheng is left out by default.
- `supabase/functions/_shared/lessonPlan.ts` holds the tables: which tags matter for each kind of place, activity and region, and the six ordered slots a template lesson fills. A market is price, numbers, bargaining, numbers, shopping, bargaining. Each phrase's "why here" line comes from the slot that chose it.
- `LessonScreen.tsx` reads the lesson JSON and loads the phrase rows it points at. `src/lib/quiz.ts` builds the practice as a pure function, with the multiple choice kinds in `quizChoice.ts` and the hands-on kinds in `quizProduce.ts`. Word tiles and gaps only ever use words that are already in the bank. `checkTyped.ts` marks typed answers, and `lessonLength.ts` holds the three lengths.
- `src/lib/orderStops.ts` sorts stops by date and works out "Day 3". `src/lib/spreadPins.ts` fans out pins that would overlap. `src/lib/sounds.ts` plays the sound effects. All three are small and the first two are tested.

## Dependencies and why

Everything is from section 5 of the PRD. Two notes: the Vite scaffold installed React 19 rather than 18, which changes nothing here, and `@types/google.maps` is a dev only type package for the Places API.

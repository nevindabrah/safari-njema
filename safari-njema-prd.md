# Safari Njema v2: Product Requirements Document

Owner: Nevin Dabrah
Status: Ready for build. Decisions confirmed by Nevin on 20 September 2026
First deadline: a working core loop, live, by 22 September 2026
Audience for this document: a coding agent, and Nevin when he explains the project

---

## 1. Summary

Safari Njema is a web app that gets travellers ready for each day of a trip to Kenya. The user builds a trip by adding real places in Kenya and the dates they will be there. For each stop, the app generates a five minute lesson: a short brief on the place, the Swahili phrases they will need there, and spoken practice where the user says the phrases out loud and gets scored.

The one sentence version: "A travel companion for Kenya. The Swahili you will actually say, taught in the order your trip needs it."

No two users get the same course. What each account learns is decided by where that person is actually going.

A static version (v1) already exists as a single HTML file, `safari-njema-design-reference.html`. It contains eight chapters of reviewed phrases with pronunciation guides and a kanga-inspired design. v2 keeps that content and design language and turns it into a real product with accounts, a database, generated lessons and speaking practice.

## Start here: Phase 1, the core loop

**This is the number one priority. Build and finish this before anything else in this document.** Everything else is an improvement on top of it.

The loop is three steps:

1. **Search.** I type where I am going into a Google map of Kenya and pick the place.
2. **Add.** I add it to a day in my itinerary. It shows as a pin on my map and a row in my list.
3. **Learn.** A lesson is generated for that place and saved to my account. I open it and learn the Swahili and the local knowledge I will need there.

Phase 1 is done when a new user can sign up, do those three steps for three different kinds of places, and get three clearly different lessons.

### What is in Phase 1
- Sign up and log in (6.1). Accounts are needed from the start because itineraries and lessons belong to a user.
- The design tokens and components from 6.10, so the core loop already looks right.
- The map planner (6.3), without drag to reorder and without "I'm here now".
- Lesson generation (section 7), with the template fallback built first and the model call second.
- A simple lesson screen with three steps only: the brief, listen to the phrases, and the multiple choice quiz from v1. Text only. No audio yet.
- The Today screen: "Today in Diani", the day's stops and their lesson buttons.

### What waits until after Phase 1
Speaking practice, generated audio, word tiles, the roleplay conversation, spaced repetition, the pocket card, offline mode, kangas, the bargaining game, the evening check-in. They are all still in scope. They are just not first.

### The flow in detail

**Search**
- Load the map with `@vis.gl/react-google-maps`, centred on Kenya, zoom 6, with the custom map style from 6.10.
- Build our own search box and results list so it matches the design. Do not use Google's default widget styling. Get suggestions from the Places Autocomplete data API (`AutocompleteSuggestion.fetchAutocompleteSuggestions`) with `includedRegionCodes: ["ke"]` and a session token. Debounce typing by 300 ms. Check the current Google documentation for exact names before building, since this API has changed recently.
- When the user picks a suggestion, fetch only these fields, to keep cost down: `id`, `displayName`, `location`, `types`, `formattedAddress`, `addressComponents`.
- Move the map to the place and show a preview card: name, our place type with its icon, the county, and an "Add to itinerary" button.

**Add**
- The card asks which day (a row of day chips built from the trip dates, plus "No date yet") and offers the activity tags. Activities are optional. One tap on "Add" is enough.
- On add: upsert the row in `places` by `google_place_id`, insert a `trip_stops` row with `lesson_status = 'generating'`, show the pin and the list row straight away, then call `generate-lesson`.
- The list row shows a small spinner and "Preparing your lesson". When the function returns, it becomes a "Start lesson" button. If it fails, it shows "Try again". No realtime subscriptions. The client simply waits for the function call to return.

**Learn: what makes the lesson fit the place and the person**

The generator receives:

| Input | Where it comes from | What it changes |
|---|---|---|
| Place type | `placeTypes.ts`, from Google's types | Which phrase tags to pull: market, food, safari, hotel, transport |
| Region | `regions.ts`, from the county in `addressComponents` | Coast stops get coastal greetings and dress notes. Nairobi stops can get Sheng. Mara stops get wildlife words |
| Place name and address | Google | The brief is written about this specific place |
| Activities | The tags the user picked | A beach stop with "eating out" adds ordering food |
| Position in the trip | Order of `trip_stops` | The first stop of any trip always teaches core greetings. Later stops assume them |
| What this user already knows | `phrase_progress` | Mastered phrases are left out and replaced with new ones |
| Swahili level | `profiles` | Beginners get shorter phrases |

Two new small files support this:
- `placeTypes.ts`: Google types to our eleven place types.
- `regions.ts`: Kenya's 47 counties to six regions: Nairobi, Coast, Rift Valley and Mara, Central and Mount Kenya, Western and Lake Victoria, North.

**Sharing versus personalising.** The expensive part, the brief and the phrase selection from the model, is cached and shared by place, activities and level. The personal part is cheap and done in code each time: drop phrases this user has mastered, top up from the remaining candidates, and add core greetings if this is their first stop. This keeps costs low while every account still gets its own path.

**The same place twice.** If a user adds a place they already have a lesson for, such as a hotel they return to, the second lesson is a review of that place's phrases plus two new ones.

### Phase 1 acceptance test
Using one new account:
1. Add "Maasai Market, Nairobi" with "shopping". The lesson includes greetings (first stop), numbers and bargaining phrases, and a brief about the market.
2. Add "Diani Beach" with "eating out". The lesson has coast and food phrases, mentions dress away from the beach, and does not repeat greetings already learned.
3. Add "Maasai Mara National Reserve" with "game drive". The lesson has animal names and guide phrases.
4. All three pins show on the map, numbered, joined by a line. All three lessons open from the itinerary and from the Today screen.
5. Log out and log in as a second user. None of the first user's stops or progress are visible.
6. Remove the Claude API key and add a fourth place. A template lesson is still produced.
7. Searching "Paris" returns no results, because search is limited to Kenya.

### The 22 September cut

There are two days. Build only this, in this order. Anything not on this list waits, even if it is listed under Phase 1 above.

| Order | Build | Notes |
|---|---|---|
| 1 | Vite, React, TypeScript, Tailwind, the design tokens from 6.10, deploy an empty shell to Vercel | Deploy first so the live URL exists from hour one |
| 2 | Supabase tables, RLS, email and password sign up and login | Google sign-in comes after the deadline |
| 3 | On first login, create one trip for the user automatically. No onboarding screens | One trip per account |
| 4 | The map screen: Google map, Kenya-only search, preview card, add to a day, pins, itinerary list, delete | The route line is optional. Skip it if short on time |
| 5 | `generate-lesson`: template version first, prove it end to end, then add the Claude call behind the `LESSON_AI_ENABLED` switch | The template path is what runs on the live site, so make it good. Pre-made lessons (7.3a) come right after the deadline |
| 6 | The three step lesson screen: brief, phrases, quiz | Reuse the quiz logic from v1 |
| 7 | About page, "not yet reviewed" note, README with a demo login | See 6.1 |

Left for right after the deadline: Google sign-in, the Today screen, onboarding, lesson caching and personalising beyond "first stop teaches greetings", theme toggle and custom colours (the app still follows the device's light or dark setting through the tokens).

The itinerary screen is the home screen for this cut.

### What Nevin has to set up by hand
The agent cannot do these. Do them before it starts.
1. Create a Google Cloud project. Attach a billing account.
2. Enable two APIs: Maps JavaScript API and Places API (New).
3. Create an API key. Restrict it to `http://localhost:5173/*` and the production domain, and to those two APIs only.
4. Set a budget alert and daily quota caps.
5. Create a Map ID with a custom style (needed for the styled map and the custom pins).
6. Create a Supabase project. Copy the URL and anon key.
7. Get an Anthropic API key and save it as a Supabase Edge Function secret.

Environment variables: `VITE_GOOGLE_MAPS_KEY`, `VITE_GOOGLE_MAP_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and as Edge Function secrets `ANTHROPIC_API_KEY`, `LESSON_MODEL`, `LESSON_AI_ENABLED`.

---

## 2. Why this exists

Travel guides tell you where to go. Language apps teach sentences you never say. Nobody connects the two. A visitor heading to the Maasai Market tomorrow does not need a grammar unit. They need to greet the seller, understand a price said out loud, and bargain politely. When they can do that, people open up and the trip feels different. That feeling of connection is the goal.

## 3. Users

**Primary: the first time visitor.** Going to Kenya for one to three weeks. Knows no Swahili. Has five minutes over breakfast. Wants to be polite and not feel lost.

**Secondary: the heritage learner.** Has family ties to Kenya or East Africa, some classroom Swahili, and wants practical speaking confidence.

**Tertiary: the visitor.** Someone looking at the site without creating an account. They will not create an account. There is no guest mode, so the README and the landing page give a shared demo login with a ready-made trip. See 6.1.

## 4. Goals and non-goals

### Goals
1. A user can sign up, create a trip, and add any location in Kenya as a stop.
2. Each stop gets a generated lesson that takes about five minutes and is specific to that place.
3. Every lesson includes spoken practice with automatic scoring.
4. Light mode, dark mode, and user-chosen colours, saved to the account.
5. The codebase is small and plain enough that Nevin can walk someone through every file.

### Non-goals
- No native mobile app and no installable app. This is a responsive website deployed on Vercel.
- No bookings, payments, maps navigation or reviews.
- No full Swahili course. No grammar units. Phrases only.
- No countries other than Kenya in this version.
- No social features, leaderboards or chat.

## 5. Tech stack

Chosen for readability first. Do not add libraries beyond this list without a written reason in the README.

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18, Vite, TypeScript | Standard, fast, and the types document the data shapes |
| Routing | React Router | One file lists every screen |
| Styling | Tailwind CSS plus CSS variables | Variables make theming and custom colours simple |
| Backend | Supabase: Postgres, Auth, Row Level Security, Edge Functions, Storage | One service covers database, login, server code and audio files |
| Validation | zod | One schema validates the generated lesson on the server and types it on the client |
| Lesson generation | Anthropic Claude API, called only from an Edge Function. Model name set by env var | The API key never reaches the browser |
| Maps and place search | Google Maps Platform: Maps JavaScript API plus Places Autocomplete, through the `@vis.gl/react-google-maps` library | Best coverage of Kenyan hotels, lodges, restaurants and markets, and every user already knows how it works. See 6.3 for cost and key handling |
| Speech to text | Browser Web Speech API with language `sw-KE` | Free and needs no server. Works in Chrome and Edge. See fallback in 6.5 |
| Text to speech | Cloud TTS with a Kenyan Swahili voice (Azure offers `sw-KE` neural voices. Confirm availability before building), generated once per phrase and cached in Supabase Storage | Most devices have no built-in Swahili voice, so browser TTS cannot be relied on |
| Hosting | Vercel for the frontend, Supabase for everything else | Free tiers are enough |
| Tests | Vitest for logic, one Playwright test for the main path | Keeps testing small but real |

Explicitly not used: Next.js, Redux, a component library, an ORM. State lives in React hooks and Supabase queries.

## 6. Features

Priority labels: **P0** is required for launch. **P1** is the second pass. **P2** is a stretch.

### 6.1 Accounts (P0)
- Sign up and log in with email and password, and with "Continue with Google", using Supabase Auth. Email and password ships first. Google sign-in follows straight after the first deadline.
- No guest mode. Every user has an account, because the product is about a personal itinerary.
- **Demo account.** One seeded account, on an email address Nevin controls, with a finished three stop trip. Its login is printed in the README and on the landing page under "Just looking? Use the demo login". This is for recruiters and reviewers who will not sign up. The demo account cannot generate new lessons, so it cannot run up costs. A nightly job resets its data.
- Password reset by email.
- Delete my account and all my data, from Settings.
- One trip per account at a time. Trip dates are optional.

### 6.2 Onboarding (P0)
Three questions, one per screen, all skippable:
1. How much Swahili do you know? None, a little, or I have taken classes.
2. When is your trip? Start and end date, or "not booked yet".
3. What kind of trip is it? Pick any of: safari, city, coast, family visit, work, volunteering.

Answers are saved to `profiles` and `trips` and used as inputs to lesson generation. Onboarding ends on the map with the prompt "Where are you going first?"

### 6.3 Trip planner with a map (P0)

The planner is one screen with two halves: a map and the itinerary. On desktop they sit side by side. On a phone the map fills the screen and the itinerary is a bottom sheet the user drags up.

**Searching and adding a place**
- A search bar floats over the map. It uses Google Places Autocomplete, restricted to Kenya (`includedRegionCodes: ["ke"]`), so results are only Kenyan places: cities, parks, beaches, hotels, lodges, markets, restaurants, neighbourhoods.
- Picking a result moves the map to that place and drops a pin with a small card: name, type, and an "Add to itinerary" button.
- The user can also tap any labelled place on the map itself to get the same card.
- Adding a place asks two quick things in the same card: which day, and optional activity tags (eating out, shopping, game drive, beach, nightlife, meeting family, public transport, hiking, business meeting).
- The lesson for that stop starts generating as soon as it is added, so it is ready by the time the user opens it.

**The itinerary**
- Stops are grouped by day. Each stop shows its name, type, lesson status (generating, ready, completed) and a "Start lesson" button.
- Stops can be dragged to reorder, moved to another day, edited and deleted.
- Every stop is a numbered pin on the map. A line joins the pins in order so the user sees the shape of their trip. Tapping a pin highlights the stop in the list, and the other way round.
- Completed stops turn green on the map. By the end of the trip the map is a record of where they went and what they learned.
- A trip with no dates still works. Stops are then ordered by position.

**How a place becomes a lesson**
- Google returns a list of types for each place, for example `tourist_attraction`, `restaurant`, `lodging`, `park`, `market`. One small file, `placeTypes.ts`, maps these to our own short list: `city`, `park`, `beach`, `market`, `restaurant`, `hotel`, `airport`, `station`, `religious_site`, `museum`, `other`.
- Our place type, the activity tags and the region of Kenya are what the lesson generator uses to choose phrases. A lodge in the Mara pulls safari and hotel phrases. A restaurant in Mombasa pulls food phrases and coastal greetings.

**Twist: "I'm here now" (P1).** With location permission, if the user is within about one kilometre of a stop, the Today screen offers that stop's pocket card and a one minute refresher of its phrases.

**Cost and keys, stated plainly**
- Google Maps needs a Google Cloud project with a billing account and a card on file. There is a free monthly usage allowance that a student project should stay inside, but check the current pricing page before launch, and set a budget alert and daily quota caps in the Google Cloud console.
- The Maps API key is used in the browser. That is normal for Google Maps and it cannot be hidden. It must be restricted in the Google Cloud console to the site's domains and to only the Maps JavaScript and Places APIs. It goes in `VITE_GOOGLE_MAPS_KEY`.
- Use autocomplete session tokens so a full search counts as one billed session.
- Google's terms limit what Places data may be stored. Store the `google_place_id` permanently (this is allowed), plus the name the user saw and our own derived fields. Refresh other details from the place id when needed instead of keeping a copy.
- **Tradeoff:** Mapbox or OpenStreetMap would avoid the billing account, but their coverage of Kenyan businesses is noticeably thinner, and place search is the first thing a user does. Google is the better product choice. If the billing account is a blocker, the map code sits behind one component (`TripMap`) and one hook (`usePlaceSearch`) so the provider can be swapped.

### 6.4 The five minute lesson (P0)

This is the core of the product. Every lesson has the same six steps so that it is predictable for the user and simple to build.

| Step | Name | Time | What happens |
|---|---|---|---|
| 1 | The brief | 45 s | What this place is. Three things to know today. One etiquette note. One practical note on money, dress or safety |
| 2 | Listen | 60 s | Four to six new phrases. Each shows Swahili, pronunciation and English, and plays audio. Tap to replay |
| 3 | Recognise | 45 s | Multiple choice in both directions, as in v1 |
| 4 | Build it | 45 s | Word tiles. The user arranges tiles to form the Swahili sentence |
| 5 | Say it | 75 s | Spoken practice on three or four of the phrases. See 6.5 |
| 6 | The conversation | 60 s | A short scripted roleplay with a character from that place: a matatu conductor, a market seller, a safari guide. The character's lines play as audio. The user speaks their replies |

Rules:
- At most six new phrases per lesson, plus up to two review phrases that are due (see 6.7).
- A progress bar shows the step. A lesson can be paused and resumed.
- The end screen shows score, time taken, phrases learned, the kanga earned (6.9), and a button to open the pocket card (6.6).
- Target duration is four to six minutes. Log actual duration so this can be measured.

### 6.5 Spoken practice (P0)

**Flow for one prompt:**
1. Show the English meaning and the Swahili phrase. Play the reference audio.
2. The user taps and holds the microphone button, or taps once to start and once to stop.
3. The browser transcribes using `SpeechRecognition` with `lang = "sw-KE"`.
4. The app scores the transcript against the target and shows the result.

**Scoring, kept simple on purpose:**
- Normalise both strings: lowercase, remove punctuation, collapse spaces.
- Compare against the target phrase and any listed accepted variants.
- Score = 1 minus (Levenshtein distance divided by the longer length).
- 0.85 and above is a pass. 0.60 to 0.85 is "close, try again". Below 0.60 is "not yet".
- Show a word by word view: matched words in green, missed words highlighted, with the pronunciation guide for the missed words.
- Three attempts, then the user can move on. Never block progress on speech.

This lives in one pure function, `scoreSpeech(target, transcript)`, with unit tests.

**Fallback when speech recognition is not available** (Safari, Firefox, or microphone denied): record with `MediaRecorder`, play the user's recording next to the reference audio, and ask them to rate themselves: "Nailed it", "Close", "Not yet". The lesson works the same either way. Detect support once at app start and store it in a React context.

**Privacy:** audio never leaves the device in the fallback path and is never stored. Only the transcript and the score are saved.

**P2 upgrade:** send the recording to a server speech to text model that supports Swahili, so scoring works in every browser. Costs money per request, so it is left for later.

### 6.6 Pocket card (P1)
After a lesson, the user gets a one screen cheat sheet for that day: the day's phrases, the three things to know, and emergency numbers (999 and 112). It is cached for offline use, because mobile data in places like the Mara is unreliable. Offline support is a stretch goal (P2). If built, a service worker caches the app shell, today's and tomorrow's lessons, their audio, and the pocket cards.

### 6.7 Review and spaced repetition (P1)
- Each phrase a user has seen sits in a box from 1 to 5 (the Leitner system). Correct answers move it up a box. Wrong answers send it back to box 1.
- Boxes are due after 1, 2, 4, 7 and 14 days.
- Due phrases are mixed into the next lesson as review items, and are also available from a "Review" screen that runs a two minute session.
- One pure function: `nextReview(box, wasCorrect, today)`. Unit tested.

### 6.8 Phrasebook (P1)
Every phrase the user has met, searchable, grouped by place. Filters for "learned", "shaky", and "used in real life".

### 6.9 Interesting twists

**Kanga collection (P1).** A kanga is a Kenyan printed cloth that always carries a Swahili proverb. Each completed lesson earns a kanga with a real proverb and its meaning, tied to the theme of the lesson. The collection screen is the user's record of the trip. The streak counter is named after the proverb "Haba na haba hujaza kibaba", little by little fills the measure.

**Design your kanga (P0, this is the custom colours feature).** See 6.10. The user's colour choices are presented as designing their own kanga, so the theming feature belongs to the culture of the product instead of being a generic settings page.

**The bargaining game (P1).** For any market stop. The seller says a price out loud in Swahili. The user must understand the number, then say a counter offer in Swahili. Three rounds. This trains listening to numbers, which is the skill that actually saves money at a market.

**"Did you use it?" evening check-in (P1).** At the end of a stop's day, the app shows that day's phrases and asks which ones the user really said to someone. Those get a "used in real life" badge and move up a box. This measures the real goal of the product, which is connection, not quiz scores.

**Sheng toggle (P2).** A setting that adds Nairobi street slang to city lessons, for example "Sasa?" and "Poa". Off by default.

**Real facts grounding (P2).** Before generating a brief, fetch the Wikipedia summary for the place and pass it to the model as source material, to reduce invented details.

### 6.10 Appearance and visual design (P0)

**The look.** Modern, soft and friendly. Nothing boxy. The reference points are Duolingo, Airbnb and Apple Maps: rounded shapes, lots of space, one bold colour moment per screen. The updated v1 file shows the direction and is the visual reference for the agent.

Design rules:
- **Shape:** large radii everywhere. 24 to 32 px on cards and the hero, 16 px on inputs and option buttons, full pills for buttons and tabs. No square corners and no hard outline borders around sections.
- **Depth:** cards are white surfaces floating on a very light tinted background with one soft, wide shadow. Separation comes from space and shadow, not from lines.
- **Colour:** a calm neutral base, with one large block of the user's palette colour per screen (the hero or the lesson header). Default palette is marigold, deep ink and hibiscus pink.
- **Buttons:** chunky pills with a darker bottom edge that presses down when tapped, so the app feels playful and tactile.
- **Type:** Bricolage Grotesque, extra bold and tightly spaced, for headings. DM Sans for everything else. Large sizes and short lines.
- **Navigation:** a blurred sticky top bar on desktop. On phones, a floating pill tab bar at the bottom within thumb reach.
- **Icons:** one emoji or simple icon in a soft tinted rounded tile per stop and place type.
- **Progress:** circular rings and rounded bars, never plain text alone.
- **Motion:** only in response to the user. Buttons press, cards lift slightly on hover, the lesson slides between steps, a short celebration when a lesson is finished. Respect the reduced motion setting.
- **The Kenyan identity stays, but lightly.** The kanga idea is kept as a dotted pattern that fades into one corner of the hero, and as the proverb shown in a rounded pill. It should feel like a detail, not a frame.
- **The map** uses a custom Google Maps style that matches the app: muted base colours in light mode, a dark style in dark mode, and rounded custom pins in the accent colour.

**Theme and custom colours.**
- Theme mode: system, light or dark. Default is system. A toggle sits in the top bar.
- Six preset palettes named after kanga colourways. Each defines a hero colour, an accent and a soft tint.
- A custom accent colour picker, presented as "Design your kanga" (see 6.9). The app computes whether dark or white text has better contrast on the chosen colour and uses it. If the colour fails 4.5 to 1 contrast, show a warning and offer the nearest passing shade.
- Implementation: every colour, radius and shadow is a CSS variable on `:root`. Tailwind is configured to read those variables. Changing theme or palette only rewrites variables. No component contains a hard coded colour.
- Saved to `user_settings` and mirrored in `localStorage`. A small inline script in `index.html` applies the saved theme before React loads, so there is no flash of the wrong theme.

### 6.11 About page (P0)
Carry over the About me text from v1 unchanged. It is public and reachable without logging in.

## 7. How lessons are generated

This is the part with the most risk, so it is specified closely.

### 7.1 The main risk
Language models make mistakes in Swahili, and they invent facts about places. The design below limits both.

### 7.2 The phrase bank
- A `phrases` table holds every phrase the app can teach. It is seeded from the `CHAPTERS` array in v1 (about 100 phrases, to be reviewed by a Swahili instructor). Seeded phrases have `verified = true`.
- Each phrase has tags such as `greeting`, `market`, `numbers`, `transport`, `food`, `safari`, `coast`, `help`, `airport`.
- The model's main job is to **choose from the bank**, not to write new Swahili.
- The model may propose at most two new phrases per lesson when the bank has nothing suitable. These are saved with `verified = false` and shown in the UI with a small "not yet reviewed" label. An admin view (P2) lists unverified phrases for review.

### 7.3 Pipeline
The `generate-lesson` Edge Function does the following:
1. Receive `trip_stop_id`. Check that it belongs to the caller.
2. Load the place (name, type, region), the activity tags, the user's level, and the ids of phrases the user already knows.
3. **Cache check.** If a lesson already exists for the same place, activity set and level, reuse it. Two users visiting Diani Beach get the same lesson. This keeps cost low and quality consistent.
4. Pick 30 to 40 candidate phrases from the bank by matching tags to the place type and activities, removing phrases the user has already mastered.
5. Call the model with the place details and the candidates. Ask for JSON only, matching the schema in 7.4.
6. Validate with zod. Check that every `phrase_id` exists in the bank. On failure, retry once.
7. **If it still fails, or if no API key is set, build the lesson from a template with no model call:** a generic brief for the place type, plus the top six candidate phrases. The app must fully work in this mode. This also makes local development free.
8. Request audio for any phrase that has none (see 7.5). Save the lesson. Return it.

Rules written into the prompt:
- Use only the supplied phrase ids, except for up to two new phrases.
- The brief must not state prices, opening hours, phone numbers or anything else that changes. Keep to orientation, culture and etiquette.
- The roleplay dialogue may only use phrases from this lesson, so the user is never asked to say something they were not taught.
- Plain, warm, second person English. No exclamation marks.

Every brief is shown with the line: "Details change. Check locally."

### 7.3a Running it at no cost: the AI switch and pre-made lessons

Nevin does not want ongoing API bills. The design handles this honestly: the AI path is fully built and tested, then switched off on the live site.

- **One switch.** An Edge Function secret, `LESSON_AI_ENABLED`, set to `true` or `false`. When it is `false`, step 5 of the pipeline is skipped and the function goes straight to the cache and then the template. Nothing else in the app changes.
- **Pre-made lessons for popular places.** A script, `scripts/pregenerate.ts`, runs the real Claude pipeline once for about 20 well known places: Maasai Market, Maasai Mara, Diani Beach, Lamu Old Town, Fort Jesus, Nairobi National Park, Giraffe Centre, Karura Forest, Amboseli, Lake Nakuru, Lake Naivasha, Hell's Gate, Mount Kenya, Watamu, Malindi, Kisumu, Nairobi CBD, JKIA, Nairobi SGR terminus, Carnivore restaurant. The output is saved as seed data in `supabase/seed/lessons.json` and loaded into the `lessons` cache table. This is a one time cost of well under a dollar.
- **On the live site with the switch off:** a user who adds one of those places gets a real Claude written lesson from the cache, at no cost. A user who adds any other place gets a template lesson built from the phrase bank for that place type and region. The lesson screen shows a small line saying which kind it is: "Written for this place" or "General lesson for this kind of place".
- **Locally or in a demo:** set the switch to `true` with a key and every place gets a freshly generated lesson. This is what Nevin shows in an interview.
- The README explains this plainly, with a short screen recording of live generation working.

**This must be real.** The AI path has to be built, run and tested end to end at least once, and the recording and the pre-made lessons are the evidence. Do not describe it as working if it has never been run.

### 7.4 Lesson JSON shape

```json
{
  "place": { "name": "Maasai Market", "type": "market" },
  "brief": {
    "what_it_is": "string, 2 to 3 sentences",
    "know_today": ["string", "string", "string"],
    "etiquette": "string",
    "practical": "string"
  },
  "phrases": [
    { "phrase_id": "uuid", "why_here": "string, one line on when you would say this" }
  ],
  "new_phrases": [
    { "swahili": "string", "pronunciation": "string", "english": "string", "tags": ["market"] }
  ],
  "build_it": [
    { "phrase_id": "uuid", "tiles": ["Punguza", "bei", "tafadhali"], "distractors": ["sana"] }
  ],
  "say_it": ["phrase_id", "phrase_id", "phrase_id"],
  "dialogue": {
    "character": "Mama Wanjiku, a bead seller",
    "setting": "string, one line",
    "turns": [
      { "speaker": "character", "swahili": "Karibu! Habari?", "english": "Welcome! How are you?" },
      { "speaker": "user", "phrase_id": "uuid" }
    ]
  },
  "kanga": { "proverb": "string", "meaning": "string" }
}
```

The proverb must come from a seeded `proverbs` table, not from the model.

### 7.5 Audio
The `get-audio` Edge Function takes a phrase id. If `audio_path` is set, it returns the Storage URL. If not, it calls the TTS provider once, stores the MP3 in Supabase Storage, saves the path on the phrase, and returns the URL. Each phrase is synthesised once for all users.

### 7.6 Cost and abuse controls
- Ten generated lessons per user per day. None for the demo account.
- Google Maps key restricted by domain and API, with daily quota caps and a budget alert.
- All keys live in Edge Function secrets.

## 8. Data model

All tables have Row Level Security turned on.

```sql
profiles          (id uuid pk -> auth.users, display_name text, swahili_level text,   -- 'none' | 'some' | 'classes'
                   is_demo boolean, created_at timestamptz)

user_settings     (user_id uuid pk, theme_mode text,          -- 'system' | 'light' | 'dark'
                   palette_key text, custom_accent text, sheng_enabled boolean)

trips             (id uuid pk, user_id uuid, title text, start_date date, end_date date,
                   trip_styles text[], created_at timestamptz)

places            (id uuid pk, google_place_id text unique, name text,
                   lat numeric, lng numeric, google_types text[], place_type text, region text)

trip_stops        (id uuid pk, trip_id uuid, user_id uuid, place_id uuid,
                   visit_date date, activities text[], position int,
                   lesson_status text)                        -- 'generating' | 'ready' | 'failed'

phrases           (id uuid pk, swahili text, pronunciation text, english text, tags text[],
                   register text,                             -- 'standard' | 'sheng' | 'coastal'
                   accepted_variants text[], verified boolean, source text, audio_path text)

proverbs          (id uuid pk, swahili text, meaning text, themes text[])

lessons           (id uuid pk, place_id uuid, activities_key text, level text,
                   content jsonb, generated_by text,          -- model name or 'template'
                   created_at timestamptz)                    -- shared cache

user_lessons      (id uuid pk, user_id uuid, trip_stop_id uuid, lesson_id uuid,
                   status text,                               -- 'ready' | 'started' | 'completed'
                   current_step int, score int, duration_seconds int, completed_at timestamptz)

phrase_progress   (user_id uuid, phrase_id uuid, box int, due_date date,
                   times_correct int, times_wrong int, best_speaking_score numeric,
                   used_in_real_life boolean, primary key (user_id, phrase_id))

speaking_attempts (id uuid pk, user_id uuid, phrase_id uuid, transcript text,
                   score numeric, passed boolean, method text, -- 'auto' | 'self'
                   created_at timestamptz)

phrase_reports    (id uuid pk, user_id uuid, phrase_id uuid, note text, created_at timestamptz)

user_kangas       (user_id uuid, user_lesson_id uuid, proverb_id uuid, earned_at timestamptz)
```

**Row Level Security in one paragraph:** tables with a `user_id` column can only be read and written by that user (`auth.uid() = user_id`). `phrases`, `proverbs`, `places` and `lessons` are readable by any signed in user and writable only by Edge Functions using the service role key.

## 9. Edge Functions

| Function | Input | Output | Notes |
|---|---|---|---|
| `generate-lesson` | `{ trip_stop_id }` | `{ user_lesson_id, lesson }` | Pipeline in 7.3 |
| `get-audio` | `{ phrase_id }` | `{ url }` | Generates once, then serves from Storage |
| `delete-account` | none | `{ ok }` | Removes all user rows and the auth user |

## 10. Screens

| Route | Screen | Login needed |
|---|---|---|
| `/` | Landing page with the kanga hero, a sign up button and the demo login | No |
| `/about` | About me | No |
| `/login`, `/signup` | Auth | No |
| `/welcome` | Onboarding, three questions | Yes |
| `/today` | Home. Today's stop, the lesson button, due reviews, the streak | Yes |
| `/trip` | Trip planner: map, place search and itinerary on one screen | Yes |
| `/lesson/:id` | Lesson player, six steps | Yes |
| `/card/:id` | Pocket card | Yes |
| `/review` | Two minute review session | Yes |
| `/phrasebook` | All phrases met so far | Yes |
| `/kangas` | Kanga collection | Yes |
| `/settings` | Design your kanga, theme mode, Sheng, account | Yes |

Empty states must tell the user what to do next. Example for `/today` with no trip: "You have no stops yet. Add the first place you are going."

## 11. Code structure and readability rules

```
src/
  main.tsx, App.tsx, routes.tsx        one file lists every route
  lib/
    supabase.ts                        the client, created once
    scoreSpeech.ts                     pure function + tests
    spacedRepetition.ts                pure function + tests
    lessonSchema.ts                    zod schema, shared with the Edge Function
    theme.ts                           apply palette, contrast check
  features/
    auth/  trip/ (TripMap, usePlaceSearch, placeTypes)  lesson/  speech/  review/  phrasebook/  kangas/  settings/
  components/                          shared UI only: Button, Card, Hero, ProgressRing
supabase/
  migrations/                          SQL, one file per change
  functions/                           one folder per Edge Function
  seed/                                phrases.json, proverbs.json (from v1)
```

Rules for the coding agent:
1. One feature per folder. A screen and the hooks it uses live together.
2. No file over about 200 lines. Split it if it grows.
3. Every file starts with a two line comment saying what it does and why it exists.
4. Prefer plain, slightly repetitive code over clever abstractions. No custom generic utilities.
5. All business logic (scoring, spaced repetition, validation) is in pure functions in `lib/`, with tests. Components only render and call those functions.
6. The README must contain: a five sentence architecture summary, a diagram of the lesson generation pipeline, setup steps, and the list of environment variables.
7. The app must run locally with no Claude or TTS key, using template lessons and silent audio.

## 12. Non-functional requirements
- **Accessibility:** keyboard usable throughout, visible focus rings, `lang="sw"` on all Swahili text, contrast of 4.5 to 1 in every palette, reduced motion respected. Speech steps always have a non-speech path.
- **Performance:** first load under 2.5 s on a mid-range phone on 4G. A cached lesson opens in under 1 s. A newly generated lesson shows a loading state with a proverb, and must return within 15 s or fall back to the template.
- **Phone and laptop both matter.** Travellers will use a phone, reviewers will use a laptop. Every screen is checked at 390 px and at 1280 px before a milestone is called done. On a laptop the map and itinerary sit side by side and lessons use a centred column. Tap targets at least 44 px.
- **Privacy:** no audio is stored. Transcripts and scores are stored. Account deletion removes everything.

## 13. Build order

Each milestone ends with something that works and can be demoed. **Phase 1 is milestones M0 to M2. Do not start M3 until the Phase 1 acceptance test passes.**

| # | Milestone | Done when |
|---|---|---|
| **Phase 1** | **The core loop** | |
| M0 | Scaffold, routing, design tokens and shared components from 6.10, Supabase project, migrations, RLS, auth, the demo account, landing and About pages | A user can sign up, log out and log in. A second user cannot read the first user's rows. Deployed to Vercel |
| M1 | The map planner: Google map, Kenya-only search, preview card, add to a day, numbered pins, route line, itinerary list, delete a stop | A user can search "Lamu", add it to a day, and see its pin and its row. Reloading the page keeps it |
| M2 | Seed phrase bank, `placeTypes.ts`, `regions.ts`, `generate-lesson` (template first, then the model, then caching and personalising), the three step lesson screen, the Today screen | The Phase 1 acceptance test passes |
| **Phase 2** | **Make it a language app** | |
| M3 | Full lesson player: word tiles, resume, scoring, end screen | A lesson saves progress and resumes where the user left off |
| M4 | Generated audio, spoken practice, the roleplay conversation, with the fallback path | Scoring works in Chrome. Self rating works in Safari. `scoreSpeech` tests pass |
| M5 | Spaced repetition, review screen, phrasebook | Due phrases appear in the next lesson |
| **Phase 3** | **Make it a companion** | |
| M6 | Pocket card, "I'm here now", drag to reorder stops | The pocket card for today's stop opens from the Today screen on phone and laptop |
| M7 | Kanga collection, custom colours, bargaining game, evening check-in | Finishing a lesson awards a kanga. The game runs three rounds |
| M8 | Accessibility pass, Playwright test of the core loop, README, demo data | The path from sign up to a finished generated lesson passes in CI |

P2 items (Sheng toggle, Wikipedia grounding, server speech to text, admin review view) come after M8.

## 14. How we will know it works
- Median lesson duration is between four and six minutes.
- At least 70 percent of started lessons are completed.
- At least three speaking attempts per lesson on average.
- Share of phrases marked "used in real life" by users who complete the evening check-in.

These come from `user_lessons`, `speaking_attempts` and `phrase_progress`. No third party analytics are needed.

## 15. Risks

| Risk | Effect | Mitigation |
|---|---|---|
| Swahili is wrong. No teacher has reviewed the phrases | Users learn mistakes. The project loses credibility | Phrase bank first, so errors are fixed once in one place. New phrases capped at two per lesson. An honest "not yet reviewed" note everywhere. A "Report a mistake" link on every phrase that writes to a `phrase_reports` table |
| Invented facts about places | Misleads travellers | Prompt bans prices, hours and numbers. "Check locally" line. P2 Wikipedia grounding |
| Speech recognition only works in Chromium browsers | iPhone users cannot be auto scored | Self rating fallback from day one. P2 server speech to text |
| Swahili recognition accuracy is uneven, mostly on short phrases | Correct speech marked wrong, which is frustrating | Generous thresholds, accepted variants, three tries then move on, never block progress |
| No Swahili voice from the chosen TTS provider | No reference audio | Confirm the provider in M0. Backup plan is recordings by a native speaker, which would also be better quality |
| Google Maps needs a billing account, and a leaked or unrestricted key can be abused | Unexpected charges | Restrict the key by domain and API. Daily quota caps. Budget alert. Provider is swappable behind `TripMap` |
| API costs | Bills | Shared lesson cache, per phrase audio cache, daily limits, template fallback |
| Two day deadline | The core loop is not live in time | The 22 September cut lists the minimum in build order. Deploy on day one. Template lessons before the model call |
| Scope | Project never ships | Phase 1 (M0 to M2) is a working, demoable travel companion on its own. Everything after is additive |

## 16. Decisions made

| Question | Decision | What it means for the build |
|---|---|---|
| Map provider | Google Maps. A card on file is fine | As written in 6.3 |
| Lesson generation | Claude API, built and tested, then switched off on the live site to avoid bills | See 7.3a. Pre-made Claude lessons for about 20 popular places, template lessons for everything else, live generation shown locally. A ChatGPT Plus or Claude Pro subscription cannot be used here. Those are chat subscriptions and do not include API access, which is billed separately |
| Login | Email and password, plus Continue with Google. No guest mode | Demo account for reviewers instead. See 6.1 |
| Audience | Both a public project and real travellers | Keep the daily limits. Add a short plain-language privacy page before sharing it publicly |
| Countries | Kenya only | Search stays locked to Kenya. No work on other countries |
| Phrase review | Not reviewed by an instructor for now | Show "Phrases written by a learner and not yet reviewed by a Swahili teacher" in the footer, on the About page and at the end of each lesson. All seeded phrases get `verified = false`. If a review happens later, flipping that flag removes the note |
| Voice | Synthetic voice | Cloud text to speech in Phase 2. Confirm a Kenyan Swahili voice exists before building it |
| Sheng | Optional toggle, off by default | Stays P2 |
| Trips | One trip at a time, dates optional | No trip switcher. Simpler schema use |
| Speech scoring | Browser only is fine for now | Self rating on iPhone. No server speech model |
| Language | TypeScript | As written |
| Coding agent | Claude Code | A `CLAUDE.md` file ships with this PRD and carries the rules from section 11 |
| Repo | Public | No secrets in git, ever. `.env` is in `.gitignore` from the first commit. Commit a `.env.example` with empty values. The Anthropic key lives only in Supabase secrets. The Google Maps key is restricted by domain. Turn on GitHub secret scanning |
| Name and URL | Safari Njema, free Vercel URL for now | Nothing to buy |
| Device | Phone and laptop matter equally. It is a website deployed on Vercel, not an app | Every screen is designed and tested at 390 px and 1280 px. No app store, no install prompt |

## 17. Files to give the coding agent
1. This document.
2. `CLAUDE.md`. Put it in the root of the repo. Claude Code reads it at the start of every session.
3. `safari-njema-design-reference.html`, the updated v1. It is the source for the seed phrases, the proverbs, the About page text, the fonts, the colour tokens and the visual direction described in 6.10.

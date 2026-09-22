# Backlog

What is left to do, in the order it should happen. "Owner" marks steps only Nevin can take, because they need his accounts. Everything else can be built in the repo. Last updated 22 September 2026. Migrations 0001 to 0012 are live, and the live account tests pass against production, including friends, automatic trip sharing and Just me stops.

## Now: before the first students sign up

| Item | Who | Notes |
|---|---|---|
| Create the Supabase project and paste `supabase/setup.sql` | Owner | Steps 1 and 2 of `docs/SETUP.md`. About five minutes. |
| Get the two `VITE_SUPABASE` values into the Vercel build | Owner | Five rows exist on Vercel but the production build still has no Supabase code, so the values are probably empty. Remove both rows, add them again with values, redeploy without cache. Until then the live site is the demo. |
| Turn "Confirm email" off, or set up custom SMTP first | Owner | Step 3. The built in mailer sends 2 emails an hour and only to the project's team. |
| Set the Site URL and Redirect URLs in Supabase | Owner | Step 7. Wrong values send Google sign in back to localhost. |
| Google Cloud OAuth client, pasted into Supabase | Owner | Step 4. Needs the consent screen and the Supabase callback URL. |
| Run `npm run check:supabase`, then sign up for real and add a stop | Owner, then assistant | The first ever live test of accounts. Fix whatever it finds. |
| Turn on Google Maps: key, Map ID, domain restriction, quota cap, then the two `VITE_GOOGLE` values on Vercel | Owner | Section 8 of `docs/SETUP.md`. Free within Google's monthly allowance; needs a card on the Cloud billing account. Until then the catalogue is the planner. |
| Human recordings for the four held phrases | Owner's professor or friend | Sasa? / Poa, Ndiyo / Hapana, Mia / Elfu, Twiga. Drop the files into `public/audio` and add them to the manifest. |
| Owner reviews the 16 "unsure" recordings and says keep or remove | Owner | Listed behind "recordings to check" on `/phrasebook`. |
| Teacher reads the food page notes | Owner's professor | `src/features/food/dishes.ts`. English descriptions of 14 dishes and their names as written on menus. |
| Mark the teacher's profile with `is_teacher = true` once he has an account | Owner | Step 2b of the setup guide. |

## Next: soon after students arrive

| Item | Notes |
|---|---|
| Custom SMTP (Resend or similar) and "Confirm email" back on | Password reset then works for everyone. Step 3b of the setup guide. |
| Deploy the Edge Function with `LESSON_AI_ENABLED=false` | Optional. Lessons already work without it. Step 5. |
| Run the Claude path live once, with a key, and read three lessons | The AI path has never run against the real API. |
| Pre-generated Claude lessons for the 51 built in places, reviewed once | PRD 7.3a. Gives the exact place brief without live model calls or unreviewed text. |
| A shared demo login on the real backend | PRD asks for it. Sign up an account, add three stops, set `is_demo = true` on its profile. |
| Places study abroad students really go | Grow the catalogue from the professor's programme itinerary. This was the plan behind the catalogue. |
| Browser tests for signed in flows | The Playwright suite covers the demo. Sign up, friends and shared trips need a test Supabase project with its own keys in CI secrets. |

## Later: the rest of the PRD and good ideas

| Item | Notes |
|---|---|
| Onboarding | First run: name the trip, pick dates, add a first stop. Today the trip simply appears. |
| Speaking practice | The `speaking_attempts` table exists. Needs the Web Speech API or a recogniser, and a decision on privacy. |
| Review inside the next lesson | Today review is its own practice at `/review`. One or two due phrases could also be slipped into the next lesson's practice. |
| Bargaining game | A market role play with prices. Needs Swahili number phrases beyond ten, reviewed. |
| Progress across trips | Kangas and phrases learned, kept when a trip ends. |
| Offline lessons | A finished lesson and its audio kept for the bus. The PRD says the site is not an installable app, so this would be cache only. |
| Screen reader pass | Labels and live regions exist. Nobody has used the app with VoiceOver yet. |
| Commercial voice | Only if the project ever earns money. MMS is non-commercial. |

## Not doing, and why

| Item | Why not |
|---|---|
| Tanzania and Uganda | Different Swahili. One country reviewed well beats three reviewed badly. |
| Analytics or trackers | The privacy page promises none. Usage can be counted from the database if ever needed. |
| An installable app or app store listing | The PRD says this is a website. |
| A general Swahili course | The product is the itinerary. A course is a different product. |
| Letting Claude write phrases for students today | Unreviewed Swahili taught to beginners. The AI path stays off until a review step exists. |

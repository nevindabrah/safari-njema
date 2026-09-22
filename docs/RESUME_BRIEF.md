# Safari Njema: brief for writing resume bullets

You are being given this file so you can write resume bullets for Nevin Dabrah about this project. Read it fully before writing. Every number here was measured in the repository on 22 September 2026; do not invent others.

## The one paragraph version

Safari Njema is a live web app (React, TypeScript, Vite, Tailwind, Supabase) that turns a traveller's Kenya itinerary into Swahili lessons. A user adds the places they are going; each place becomes a short lesson built for that kind of place from a bank of 95 phrases reviewed by a Swahili teacher, with recorded audio, an eight kind practice engine, spaced repetition, friends and shared trips. It is deployed on Vercel with real accounts, Google sign in, Row Level Security on every table, and browser tests that run against both the demo build and the production site. The first users are a university Swahili professor and his first year students. Built from an empty folder to production in three days, 20 to 22 September 2026.

## Nevin's role, stated honestly

Nevin owned the product: the idea, the PRD, every product decision, the Swahili review process with his professor, the accounts (Supabase, Google Cloud, Vercel) and their setup, and acceptance of every feature. He built it as the sole developer using Claude Code as a pair programmer, directing the work, reviewing results, and deciding trade-offs. Bullets should say he built and shipped it; they should not claim a team.

## What exists, with numbers

### Product
- Live at https://safari-njema-rust.vercel.app with real accounts. Email and password, Google sign in, log in by username or email, password reset, account deletion.
- 95 Swahili phrases reviewed by a Swahili teacher, tagged one by one, chosen for a lesson by a slot plan per kind of place (market, beach, reserve, city, and so on), so a market lesson teaches prices and bargaining and a beach lesson teaches coast words.
- Lessons in three lengths (4, 6 or 8 phrases). Practice has 8 kinds of exercise in 3 parts (recognise, recall, produce) with a second chance round, keyboard shortcuts and edit distance tolerant typing.
- A catalogue of 51 Kenyan places with 49 credited Wikimedia Commons photos, searchable by name and by intent ("food", "swim", "animals") with typo tolerance.
- A Telling Time screen with an interactive two hand clock that shows the six hour shift between clock time and Swahili time, with 289 recorded times.
- Spaced repetition (Leitner boxes) with a Today card and a review session. Friends by username with requests. Trips shared between friends where each traveller gets their own lesson per stop. A teacher's page that collects corrections from a public phrasebook.
- Dark and light themes, phone first layout audited at 320, 360 and 390 px, printable pocket cards, an SVG sketch map of Kenya for the no key mode, an own icon set, proverbs on kangas as rewards.

### Audio
- 95 lesson recordings and 289 clock time recordings made offline with Meta's MMS Swahili text to speech, with no speech service at run time.
- Every take is judged by a Swahili speech recogniser (MMS ASR); the clearest of several takes is kept. 64 of 95 lesson clips and 262 of 289 time clips are heard exactly as written. Clips under a threshold are held back and say "Audio coming soon" rather than teach a wrong sound.
- Nine other Swahili voices were compared; two replaced the main voice on four clips where they scored perfectly.

### Engineering
- 132 commits, 158 TypeScript files, about 7,800 lines of app code, in 3 days.
- 195 unit tests (Vitest) over pure functions in `src/lib/`, including tests that read the real stylesheet and fail the build if the two dark themes drift or any text and background pairing drops under 4.5 to 1 contrast.
- 17 Postgres tables, 36 Row Level Security policies and 10 database functions across 10 additive migrations. 67 security and behaviour checks run the real `setup.sql` in an in-process Postgres (PGlite) as two users and an anonymous visitor.
- 12 Playwright browser tests against the demo build on phone and laptop viewports, including one that finishes a whole lesson using the seed phrases as the answer key, and 3 live tests that create and delete throwaway accounts against the production site. GitHub Actions runs type check, lint, unit tests, build, database checks and browser tests on every push.
- Performance: the landing page went from 1,119 KB to about 370 KB by self hosting photos in two sizes and the fonts, splitting chunks, prefetching on idle and setting cache headers; first paint about 0.6 s on an emulated 4G phone; the demo build drops the Supabase library entirely through dead code elimination.
- Security: only public keys reach the browser; the database is the access control. Log in by username checks the password against Supabase's bcrypt hash inside a security definer function and locks a username after five failures. Anonymous teacher notes are capped at 200 an hour in SQL. An adversarial audit found 20 issues, all fixed the same day.
- The AI path: lesson generation with Claude through a Supabase Edge Function is built, validated with zod, with retry and a template fallback, and deliberately switched off so students only see teacher reviewed Swahili.

## Numbers you may use
132 commits. 3 days. 95 phrases. 51 places. 384 recordings (95 plus 289). 8 exercise kinds. 17 tables. 36 RLS policies. 10 migrations. 195 unit tests. 67 database checks. 15 browser tests. 1,119 KB to 370 KB. 0.6 s first paint. 320 px minimum width. 20 audit findings fixed.

## Do not claim
- Any number of users or lessons completed. Students have not started yet.
- That Claude writes the lessons in production. It does not; the switch is off.
- Revenue, a mobile app, or an app store. It is a website.
- That the audio is production licensed for commercial use. The voice is CC BY-NC 4.0.

## Format wanted
XYZ bullets: accomplished X, measured by Y, by doing Z. One line each, under 30 words, past tense, no exclamation marks, no em dashes, no buzzwords ("leveraged", "spearheaded"). Lead with the outcome for the user or the team, then the measurement, then the method. Write 8 to 10 candidates across product, engineering, testing and security, then mark the 4 strongest for a one page resume. Where a bullet needs a technology name, use the real one (Supabase, Row Level Security, Playwright, PGlite, Vitest, Meta MMS). If this is for a Duolingo application, one bullet may mention the comparison to Duolingo; the others should stand on their own.

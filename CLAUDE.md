# Safari Njema: rules for Claude Code

Read `safari-njema-prd.md` before doing anything. It is the source of truth. This file is the short version of how to work in this repo.

## What this is
A travel companion for Kenya. The user searches a place on a Google map, adds it to their itinerary, and gets a short Swahili lesson generated for that place. Stack: React, Vite, TypeScript, Tailwind, Supabase, Google Maps Platform, Claude API through a Supabase Edge Function.

## Current priority
Build "The 22 September cut" in the PRD, in the order listed. Do not start anything outside that list until Nevin says the cut is done. If a task seems to need something outside the list, stop and ask.

## The owner must be able to explain every file
Nevin will walk interviewers through this code. Optimise for reading, not cleverness.
1. One feature per folder under `src/features/`. A screen and the hooks it uses live together.
2. No file over about 200 lines. Split it.
3. Every file starts with a two line comment: what it does, and why it exists.
4. Prefer plain, slightly repetitive code over abstractions. No generic utilities, no higher order components, no custom state library.
5. Business logic goes in pure functions in `src/lib/` with Vitest tests. Components only render and call those functions.
6. Do not add a dependency that is not in section 5 of the PRD without asking first and writing the reason in the README.
7. After each milestone, update the README: what was built, how to run it, and a short "how this works" note in plain language.

## Design
`safari-njema-design-reference.html` is the visual reference. Rounded, soft, modern. Every colour, radius and shadow is a CSS variable. No hard coded colours in components. No square corners.

## Secrets. This repo is public
- Never commit `.env`. It is in `.gitignore` from the first commit. Keep `.env.example` up to date with empty values.
- `ANTHROPIC_API_KEY` exists only as a Supabase Edge Function secret. It must never appear in anything under `src/`.
- Only `VITE_` variables reach the browser: the Supabase URL, the Supabase anon key, the Google Maps key and the Map ID.
- Never print keys in logs, comments, tests or commit messages.

## The AI switch
Lesson generation with Claude must be fully built and tested, but the live site runs with `LESSON_AI_ENABLED=false`. The template path is therefore the main path users see. Treat it as a first class feature, not a fallback stub. Test both settings.

## Screens
Phone and laptop matter equally. Check every screen at 390 px and 1280 px wide before calling it done. This is a website, not an installable app.

## Data safety
- Every table has Row Level Security on. When you add a table, add its policies in the same migration and say in the PR notes how you tested them.
- Schema changes are new files in `supabase/migrations/`. Never edit an old migration.

## Swahili content
- Seed phrases come from the `CHAPTERS` array in the design reference file. Do not invent, correct or translate Swahili yourself. If something looks wrong, flag it to Nevin.
- The seed phrases were reviewed by a Swahili teacher in September 2026 and are seeded with `verified = true`. Any phrase a model proposes later is `verified = false` and shows a "not yet reviewed" label until someone checks it.

## Google Maps
The Places API changed recently. Check the current official documentation for function and field names before writing map code. Do not rely on memory. Request only the fields listed in the PRD to keep costs down.

## Writing style for UI text and docs
Plain sentences. Sentence case. No exclamation marks. No em dashes. Say what a button does.

## Working agreement
- Work in small commits with clear messages.
- Before finishing a task: run the type check, the tests and the build. Report what you ran and what happened.
- If something in the PRD is unclear or seems wrong, ask instead of guessing.

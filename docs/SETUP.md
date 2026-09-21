# Turning on accounts: Supabase and Google sign in

Without these steps the site runs as the demo. With them it becomes the real product: accounts, saved trips, and lessons made on the server. About thirty minutes, all in the browser except step 5.

Keep one rule in mind. Only the four `VITE_` values ever go in `.env` or on Vercel. The Anthropic key and the Google client secret never go anywhere near the repo.

## 1. Create the Supabase project

1. Go to supabase.com, sign in, and press **New project**. Pick a region near your users. Save the database password somewhere safe. You will not need it for this guide.
2. When it finishes, open **Project Settings, API**. Copy the **Project URL** and the **anon public** key.
3. In the repo, copy `.env.example` to `.env` and paste them in:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

The anon key is safe in the browser. Row Level Security is what protects the data, and every table has it on.

## 2. Create the database

1. Open **SQL Editor, New query**.
2. Open `supabase/setup.sql` from this repo, copy all of it, paste it in, and press **Run**.

That one file creates every table, every Row Level Security policy, the two database functions, and the 95 reviewed phrases and 10 proverbs. It is meant for a new project and should be run once.

## 3. Email sign in

Open **Authentication, Sign In / Providers, Email**. Email is on by default.

For testing, turn **Confirm email** off, so signing up logs you straight in. Turn it back on before real users arrive. With it on, the app already shows "Check your email" after sign up.

## 4. Google sign in

This has two halves: Google gives you a client ID and secret, and Supabase is told about them.

**In Google Cloud** (console.cloud.google.com, the same project as your Maps key is fine):

1. Open **APIs and Services, OAuth consent screen**. Choose **External**. Fill in the app name "Safari Njema", your email for support and developer contact, and save. You do not need to add scopes. While the app is in "Testing", add your own Google account under **Test users**.
2. Open **APIs and Services, Credentials, Create credentials, OAuth client ID**. Choose **Web application**.
3. Under **Authorized JavaScript origins** add:
   - `http://localhost:5180`
   - your Vercel address, for example `https://safari-njema.vercel.app`
4. Under **Authorized redirect URIs** add exactly one address, the Supabase callback. Supabase shows it to you in the next step. It looks like `https://abcdefgh.supabase.co/auth/v1/callback`.
5. Press **Create** and copy the **Client ID** and **Client secret**.

**In Supabase:**

1. Open **Authentication, Sign In / Providers, Google**. Turn it on. Paste the Client ID and Client secret. The **Callback URL** shown here is the one to give Google in step 4 above. Save.
2. Open **Authentication, URL Configuration**. Set **Site URL** to your Vercel address. Under **Redirect URLs** add both:
   - `http://localhost:5180/**`
   - `https://safari-njema.vercel.app/**`

If Google sign in sends you back to the wrong place, or to localhost from the live site, this URL Configuration page is almost always the cause.

## 5. Deploy the Edge Function

This is the one step that needs a terminal. It puts `generate-lesson` on Supabase's servers.

```
npx supabase login
npx supabase link --project-ref abcdefgh
npx supabase functions deploy generate-lesson
npx supabase secrets set LESSON_AI_ENABLED=false LESSON_MODEL=claude-opus-5
```

The project ref is the `abcdefgh` part of your project URL. With `LESSON_AI_ENABLED=false` lessons come from the template, which costs nothing. To let Claude write them, add a key and flip the switch:

```
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... LESSON_AI_ENABLED=true
```

The function's code has been type checked with Deno, the runtime Supabase uses, but it has not yet run against a live project. If the deploy or the first lesson fails, send me the error.

## 6. Check your work

```
npm run check:supabase
```

It reads `.env` and reports, line by line, whether each table exists, whether Row Level Security is hiding rows from strangers, whether email and Google sign in are on, and whether the Edge Function is deployed. Fix anything marked FIX and run it again.

Then run `npm run dev`, sign up, and add a stop. With no Google Maps key the planner uses the sketch map and the built-in places, so you can test accounts and lessons before touching Google Maps.

## 7. Put the same values on Vercel

In your Vercel project open **Settings, Environment Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, plus `VITE_GOOGLE_MAPS_KEY` and `VITE_GOOGLE_MAP_ID` when you have them. Redeploy. The demo banner disappears and the site has accounts.

If you want the public link to stay a no sign up demo for recruiters, leave these off the main deployment and make a second Vercel project for the real product.

## What can go wrong

| What you see | Likely cause |
|---|---|
| "Invalid API key" on sign up | The anon key in `.env` was copied with a space or a line break |
| Sign up works but the trip never appears | `setup.sql` was not run, or only partly. Run `npm run check:supabase` |
| "Preparing your lesson" then "Try again" | The Edge Function is not deployed, or the phrases were not seeded |
| Google shows "redirect_uri_mismatch" | The redirect URI in Google Cloud is not exactly the Supabase callback URL |
| Google sign in returns to localhost on the live site | Site URL in Supabase is still localhost |
| Google says the app is not verified | Normal while the consent screen is in Testing. Add yourself as a test user |

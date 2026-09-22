# Turning on accounts: Supabase and Google sign in

Without these steps the site runs as the demo. With them it becomes the real product: accounts and saved trips.

**The short version: steps 1, 2, 3 and 7 are all you need for people to create accounts on the live site. About ten minutes, all in the browser.** Real email (step 3b), Google sign in (step 4) and the Edge Function (step 5) are optional extras you can add any time.

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

That one file creates every table, every Row Level Security policy, the three database functions (including the one behind "Delete my account"), and the 95 reviewed phrases and 10 proverbs. It is meant for a new project and should be run once.

If you set the project up before 22 September 2026, run only the migrations you are missing, in order, in the SQL editor: `0006_delete_my_account.sql`, then `0007_usernames_friends_shared_trips.sql`. Migrations are never edited, only added, so a later one is always safe to run on its own.

This exact file has been run in a real Postgres by `scripts/testDatabase.mjs`, which also checks that one user can never read or change another user's trip, stops or lessons, and that deleting an account removes everything in it and nothing of anyone else's.

## 3. Email sign in

Open **Authentication, Sign In / Providers, Email**. Email is on by default.

**Turn "Confirm email" off, and leave it off while friends and classmates are testing.** This matters more than it looks. Supabase's built-in email sender is only for trying things out: it sends at most 2 emails an hour, and only to the addresses of people in your own Supabase team. With "Confirm email" on, a friend who signs up would be waiting for an email that Supabase refuses to send. With it off, signing up sends no email at all and logs them straight in.

The same limit applies to "Forgot your password". Until step 3b is done, a reset link only reaches your own address. Google sign in (step 4) sends no email, so it is not affected.

### 3b. Later: real email, so password reset works for everyone

1. Make a free account with an email service. Resend is the simplest, and Brevo, Postmark and AWS SES also work. Verify a domain you own, or use the sender address they give you for testing.
2. In Supabase open **Project Settings, Authentication, SMTP Settings**, turn on **Enable custom SMTP**, and paste in the host, port, user and password the email service shows you. That password is a secret: it goes in the Supabase dashboard only, never in this repo.
3. You can now turn "Confirm email" back on if you want it. The app already shows "Check your email" after sign up, and the link in the email brings the visitor back to the site signed in.

## 4. Google sign in

This has two halves: Google gives you a client ID and secret, and Supabase is told about them.

**In Google Cloud** (console.cloud.google.com, the same project as your Maps key is fine):

1. Open **APIs and Services, OAuth consent screen**. Choose **External**. Fill in the app name "Safari Njema", your email for support and developer contact, and save. You do not need to add scopes. While the app is in "Testing", add your own Google account under **Test users**.
2. Open **APIs and Services, Credentials, Create credentials, OAuth client ID**. Choose **Web application**.
3. Under **Authorized JavaScript origins** add:
   - `http://localhost:5180`
   - your Vercel address, for example `https://safari-njema-rust.vercel.app`
4. Under **Authorized redirect URIs** add exactly one address, the Supabase callback. Supabase shows it to you in the next step. It looks like `https://abcdefgh.supabase.co/auth/v1/callback`.
5. Press **Create** and copy the **Client ID** and **Client secret**.

**In Supabase:**

1. Open **Authentication, Sign In / Providers, Google**. Turn it on. Paste the Client ID and Client secret. The **Callback URL** shown here is the one to give Google in step 4 above. Save.
2. Open **Authentication, URL Configuration**. Set **Site URL** to your Vercel address. Under **Redirect URLs** add both:
   - `http://localhost:5180/**`
   - `https://safari-njema-rust.vercel.app/**`

If Google sign in sends you back to the wrong place, or to localhost from the live site, this URL Configuration page is almost always the cause.

## 5. Optional: deploy the Edge Function, for lessons written by Claude

You can skip this. Without the function, a signed in user's lesson is built in their browser from the phrase bank, by the same code, and saved to their own account. Deploy the function only when you want Claude to write the brief for each exact place. It is the one step that needs a terminal.

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

It reads `.env` and reports, line by line, whether each table exists, whether Row Level Security is hiding rows from strangers, whether email and Google sign in are on, and whether the Edge Function is deployed (it does not have to be). Fix anything marked FIX and run it again.

Then run `npm run dev`, sign up, and add a stop. With no Google Maps key the planner uses the sketch map and the built-in places, so you can test accounts and lessons before touching Google Maps.

## 7. Put the same values on Vercel

In your Vercel project open **Settings, Environment Variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, plus `VITE_GOOGLE_MAPS_KEY` and `VITE_GOOGLE_MAP_ID` when you have them. Redeploy. The site now has accounts.

Then tell Supabase where the site lives, so emailed links and Google sign in come back to the right place: open **Authentication, URL Configuration**, set **Site URL** to `https://safari-njema-rust.vercel.app`, and add `https://safari-njema-rust.vercel.app/**` and `http://localhost:5180/**` under **Redirect URLs**.

The demo does not go away. The landing page then offers both: "Create your account" for people who want their trip saved, and "Try the demo, no sign up" for a recruiter who wants to look around. The demo still lives only in the visitor's browser.

## What can go wrong

| What you see | Likely cause |
|---|---|
| "Invalid API key" on sign up | The anon key in `.env` was copied with a space or a line break |
| Sign up works but the trip never appears | `setup.sql` was not run, or only partly. Run `npm run check:supabase` |
| "Preparing your lesson" then "Try again" | The phrases were not seeded, or migration 0005 is missing. Run `npm run check:supabase` |
| A friend signs up and sees "Check your email", but no email comes | "Confirm email" is on and the built-in sender will not email people outside your team. Turn it off (step 3) or set up real email (step 3b) |
| "We cannot send email to that address yet" on password reset | The same limit. Set up real email (step 3b) |
| "Too many tries in a short time" | The built-in sender's limit of 2 emails an hour. Wait, or set up real email (step 3b) |
| Google shows "redirect_uri_mismatch" | The redirect URI in Google Cloud is not exactly the Supabase callback URL |
| Google sign in returns to localhost on the live site | Site URL in Supabase is still localhost |
| Google says the app is not verified | Normal while the consent screen is in Testing. Add yourself as a test user |

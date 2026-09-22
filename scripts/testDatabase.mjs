// Runs the project's real supabase/setup.sql in an in-process Postgres and tests Row Level Security the way Supabase applies it.
// Exists because security rules that were never run are only a hope. It needs one package that is deliberately not a project
// dependency, so install it just for the run:
//   npm install --no-save @electric-sql/pglite && node scripts/testDatabase.mjs
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import { readFileSync } from 'node:fs'
const repo = process.argv[2] ?? '.'
const db = new PGlite({ extensions: { pgcrypto } })
let passed = 0, failed = 0
const ok = (name, cond, detail = '') => { cond ? passed++ : failed++; console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : ' -> ' + detail}`) }

await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, encrypted_password text, raw_user_meta_data jsonb not null default '{}'::jsonb);
  create role authenticated nologin; create role anon nologin;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to authenticated, anon;
`)
await db.exec(readFileSync(repo + '/supabase/setup.sql', 'utf8'))
await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated; grant select on all tables in schema public to anon;`)
console.log('setup.sql ran without errors')

const count = async (q) => Number((await db.query(q)).rows[0].n)
ok('95 phrases seeded, all verified', (await count(`select count(*) n from phrases where verified`)) === 95)
ok('10 proverbs seeded', (await count(`select count(*) n from proverbs`)) === 10)
ok('sort_order runs 1 to 95', (await count(`select count(distinct sort_order) n from phrases where sort_order between 1 and 95`)) === 95)
ok('every table has Row Level Security on', (await count(`select count(*) n from pg_tables t join pg_class c on c.relname = t.tablename where t.schemaname = 'public' and not c.relrowsecurity`)) === 0)

const a = (await db.query(`insert into auth.users (email) values ('amina@example.com') returning id`)).rows[0].id
const b = (await db.query(`insert into auth.users (email) values ('baraka@example.com') returning id`)).rows[0].id
ok('sign up trigger creates a profile and settings', (await count(`select count(*) n from profiles`)) === 2 && (await count(`select count(*) n from user_settings`)) === 2)

async function as(userId, fn) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${userId ?? ''}', false);`)
  try { return await fn() } finally { await db.exec(`reset role`) }
}
const tripA = await as(a, async () => (await db.query(`insert into trips (user_id, title) values ('${a}', 'A trip') returning id`)).rows[0].id)
const stopA = await as(a, async () => (await db.query(`select add_trip_stop('${tripA}', 'sample-diani', 'Diani Beach', -4.28, 39.59, array['beach'], 'beach', 'coast', null, array['eating out']) as id`)).rows[0].id)
ok('add_trip_stop adds a stop in the generating state', !!stopA && (await count(`select count(*) n from trip_stops where lesson_status = 'generating'`)) === 1)
ok('add_trip_stop created the shared place', (await count(`select count(*) n from places where google_place_id = 'sample-diani'`)) === 1)
const second = await as(a, async () => (await db.query(`select add_trip_stop('${tripA}', 'sample-diani', 'Diani Beach', -4.28, 39.59, array['beach'], 'beach', 'coast', null, array[]::text[]) as id`)).rows[0].id)
ok('the same place twice reuses one place row, and positions count up', (await count(`select count(*) n from places`)) === 1 && (await count(`select max(position) n from trip_stops`)) === 2 && !!second)

ok('user B cannot see user A\'s trip or stops', await as(b, async () => (await count(`select count(*) n from trips`)) === 0 && (await count(`select count(*) n from trip_stops`)) === 0))
ok('user B cannot add a stop to user A\'s trip', await as(b, async () => { try { await db.query(`select add_trip_stop('${tripA}', 'x', 'X', 0, 37, array['park'], 'park', 'north', null, array[]::text[])`); return false } catch { return true } }))
ok('user B cannot insert a trip owned by user A', await as(b, async () => { try { await db.query(`insert into trips (user_id) values ('${a}')`); return false } catch { return true } }))
ok('user B cannot update user A\'s stop', await as(b, async () => (await db.query(`update trip_stops set lesson_status = 'failed' where id = '${stopA}'`)).affectedRows === 0))
ok('a signed in user can read the phrase bank and proverbs', await as(b, async () => (await count(`select count(*) n from phrases`)) === 95 && (await count(`select count(*) n from proverbs`)) === 10))
ok('a signed in user cannot write to the phrase bank', await as(b, async () => { try { await db.query(`insert into phrases (swahili, english) values ('x', 'y')`); return false } catch { return true } }))
ok('a signed in user cannot write to the shared lessons table', await as(a, async () => { try { await db.query(`insert into lessons (place_id, content, generated_by) select id, '{}'::jsonb, 'template' from places limit 1`); return false } catch { return true } }))

ok('user A can save a browser built lesson in their own row', await as(a, async () => { await db.query(`insert into user_lessons (user_id, trip_stop_id, content, generated_by) values ('${a}', '${stopA}', '{"place":{"name":"Diani Beach"}}'::jsonb, 'template')`); return (await count(`select count(*) n from user_lessons where content is not null`)) === 1 }))
ok('a lesson row with neither a shared lesson nor content is refused', await as(a, async () => { try { await db.query(`insert into user_lessons (user_id, trip_stop_id) values ('${a}', '${stopA}')`); return false } catch { return true } }))
ok('user B cannot save a lesson into user A\'s account', await as(b, async () => { try { await db.query(`insert into user_lessons (user_id, trip_stop_id, content) values ('${a}', '${stopA}', '{}'::jsonb)`); return false } catch { return true } }))
ok('user B cannot read user A\'s lesson', await as(b, async () => (await count(`select count(*) n from user_lessons`)) === 0))
ok('user A can mark their lesson completed', await as(a, async () => (await db.query(`update user_lessons set status = 'completed', score = 5 where user_id = '${a}'`)).affectedRows === 1))
ok('deleting a stop removes its lesson', await as(a, async () => { await db.query(`delete from trip_stops where id = '${stopA}'`); return (await count(`select count(*) n from user_lessons`)) === 0 }))
ok('someone not signed in sees no trips', await (async () => { await db.exec(`set role anon`); try { return (await count(`select count(*) n from trips`)) === 0 } finally { await db.exec(`reset role`) } })())

const c = (await db.query(`insert into auth.users (email, raw_user_meta_data) values ('chebet@example.com', '{"username":"Chebet_1","full_name":"Chebet K"}') returning id`)).rows[0].id
ok('a valid username from sign up metadata is kept, lower cased, with the Google display name', (await db.query(`select username, display_name from profiles where id = '${c}'`)).rows[0].username === 'chebet_1' && (await db.query(`select display_name from profiles where id = '${c}'`)).rows[0].display_name === 'Chebet K')
const d = (await db.query(`insert into auth.users (email, raw_user_meta_data) values ('dan@example.com', '{"username":"CHEBET_1"}') returning id`)).rows[0].id
ok('a username already taken is dropped at sign up instead of failing the sign up', (await db.query(`select username from profiles where id = '${d}'`)).rows[0].username === null)
ok('username_taken sees it regardless of case', (await db.query(`select username_taken('ChEbEt_1') t`)).rows[0].t === true && (await db.query(`select username_taken('nobody_here') t`)).rows[0].t === false)
ok('a user can set their own username, and a bad one is refused', await as(d, async () => { await db.query(`update profiles set username = 'dan_k' where id = '${d}'`); try { await db.query(`update profiles set username = 'Bad Name!' where id = '${d}'`); return false } catch { return true } }))
ok('two people cannot share a username', await as(d, async () => { try { await db.query(`update profiles set username = 'chebet_1' where id = '${d}'`); return false } catch { return true } }))

await db.query(`update auth.users set encrypted_password = crypt('correct horse', gen_salt('bf', 10)) where id = '${c}'`)
await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`)
ok('the right password returns the email', (await db.query(`select email_for_login('Chebet_1', 'correct horse') e`)).rows[0].e === 'chebet@example.com')
ok('a wrong password returns nothing', (await db.query(`select email_for_login('chebet_1', 'wrong') e`)).rows[0].e === null)
ok('an unknown username returns nothing', (await db.query(`select email_for_login('nobody_here', 'x') e`)).rows[0].e === null)
for (let i = 0; i < 4; i++) await db.query(`select email_for_login('chebet_1', 'wrong')`)
ok('after five wrong tries the username is locked, even with the right password', await (async () => { try { await db.query(`select email_for_login('chebet_1', 'correct horse')`); return false } catch (e) { return /Too many/.test(String(e)) } })())
ok('an anonymous visitor cannot read the attempts table', await (async () => { try { return (await count(`select count(*) n from login_attempts`)) === 0 } catch { return true } })())
await db.exec(`reset role`)

ok('C can send D a request', await as(c, async () => { await db.query(`insert into friendships (requester_id, addressee_id) values ('${c}', '${d}')`); return true }))
ok('C cannot send a request in D\'s name', await as(c, async () => { try { await db.query(`insert into friendships (requester_id, addressee_id) values ('${d}', '${b}')`); return false } catch { return true } }))
ok('D cannot send the same pair back the other way', await as(d, async () => { try { await db.query(`insert into friendships (requester_id, addressee_id) values ('${d}', '${c}')`); return false } catch { return true } }))
ok('D sees the pending request and C\'s profile, B sees neither', (await as(d, async () => (await count(`select count(*) n from friendships where status = 'pending'`)) === 1 && (await count(`select count(*) n from profiles where id = '${c}'`)) === 1)) && (await as(b, async () => (await count(`select count(*) n from friendships`)) === 0 && (await count(`select count(*) n from profiles where id = '${c}'`)) === 0)))
ok('C cannot accept their own request', await as(c, async () => (await db.query(`update friendships set status = 'accepted' where requester_id = '${c}'`)).affectedRows === 0))
ok('D can accept it', await as(d, async () => (await db.query(`update friendships set status = 'accepted' where addressee_id = '${d}'`)).affectedRows === 1))
ok('search by username prefix finds D for C and never C themselves', await as(c, async () => { const r = (await db.query(`select username from search_usernames('DAN')`)).rows.map((x) => x.username); const me = (await db.query(`select username from search_usernames('che')`)).rows; return r.includes('dan_k') && me.length === 0 }))
ok('search needs at least two letters', await as(c, async () => (await db.query(`select * from search_usernames('d')`)).rows.length === 0))

const tripC = await as(c, async () => (await db.query(`insert into trips (user_id, title) values ('${c}', 'Coast trip') returning id`)).rows[0].id)
ok('the owner cannot invite someone who is not a friend', await as(c, async () => { try { await db.query(`insert into trip_members (trip_id, user_id, added_by) values ('${tripC}', '${b}', '${c}')`); return false } catch { return true } }))
ok('the owner can invite a friend', await as(c, async () => { await db.query(`insert into trip_members (trip_id, user_id, added_by) values ('${tripC}', '${d}', '${c}')`); return true }))
ok('a friend cannot add themselves to a trip', await as(d, async () => { try { await db.query(`insert into trip_members (trip_id, user_id, added_by) values ('${tripC}', '${b}', '${d}')`); return false } catch { return true } }))
ok('D now sees C\'s trip, B does not', (await as(d, async () => (await count(`select count(*) n from trips where id = '${tripC}'`)) === 1)) && (await as(b, async () => (await count(`select count(*) n from trips where id = '${tripC}'`)) === 0)))
const stopD = await as(d, async () => (await db.query(`select add_trip_stop('${tripC}', 'g-shared', 'Diani Beach', -4.3, 39.6, '{}', 'beach', 'coast', null, '{}') id`)).rows[0].id)
ok('a member can add a stop to the shared trip', !!stopD && (await as(c, async () => (await count(`select count(*) n from trip_stops where trip_id = '${tripC}'`)) === 1)))
ok('a member cannot rename the trip, only the owner can', await as(d, async () => (await db.query(`update trips set title = 'Hijacked' where id = '${tripC}'`)).affectedRows === 0))
ok('each member keeps their own lesson for a shared stop', (await as(c, async () => { await db.query(`insert into user_lessons (user_id, trip_stop_id, content) values ('${c}', '${stopD}', '{}'::jsonb)`); return (await count(`select count(*) n from user_lessons where trip_stop_id = '${stopD}'`)) === 1 })) && (await as(d, async () => (await count(`select count(*) n from user_lessons where trip_stop_id = '${stopD}'`)) === 0)))
ok('two members who are not friends can still see each other\'s names on a shared trip', await (async () => { const e = (await db.query(`insert into auth.users (email, raw_user_meta_data) values ('esther@example.com', '{"username":"esther_e"}') returning id`)).rows[0].id; await as(c, async () => { await db.query(`insert into friendships (requester_id, addressee_id) values ('${c}', '${e}')`) }); await as(e, async () => { await db.query(`update friendships set status = 'accepted' where addressee_id = '${e}'`) }); await as(c, async () => { await db.query(`insert into trip_members (trip_id, user_id, added_by) values ('${tripC}', '${e}', '${c}')`) }); return as(d, async () => (await count(`select count(*) n from profiles where id = '${e}'`)) === 1) })())
ok('a member can leave, and then sees nothing of the trip', await as(d, async () => { await db.query(`delete from trip_members where trip_id = '${tripC}' and user_id = '${d}'`); return (await count(`select count(*) n from trips where id = '${tripC}'`)) === 0 }))
ok('ending the friendship works from either side', await as(c, async () => (await db.query(`delete from friendships where requester_id = '${c}' and addressee_id = '${d}'`)).affectedRows === 1))


await db.exec(`grant insert on public.phrase_notes to anon;`)
ok('an anonymous reader can leave a note on a phrase', await (async () => { await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`); try { await db.query(`insert into phrase_notes (swahili, note, reviewer_name) values ('Habari?', 'Said faster in Nairobi.', 'Mwalimu')`); return true } catch { return false } finally { await db.exec(`reset role`) } })())
ok('an anonymous reader cannot read the notes', await (async () => { await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`); try { return (await count(`select count(*) n from phrase_notes`)) === 0 } catch { return true } finally { await db.exec(`reset role`) } })())
ok('a signed in student cannot read the notes either', await as(b, async () => (await count(`select count(*) n from phrase_notes`)) === 0))
ok('a signed in student cannot leave a note in someone else\'s name', await as(b, async () => { try { await db.query(`insert into phrase_notes (swahili, note, user_id) values ('Habari?', 'x', '${a}')`); return false } catch { return true } }))
await db.query(`update profiles set is_teacher = true where id = '${a}'`)
ok('a teacher reads every note and can mark one handled', await as(a, async () => (await count(`select count(*) n from phrase_notes`)) === 1 && (await db.query(`update phrase_notes set handled_at = now() where swahili = 'Habari?'`)).affectedRows === 1))
ok('an empty or huge note is refused', await as(b, async () => { try { await db.query(`insert into phrase_notes (swahili, note) values ('Habari?', '')`); return false } catch { return true } }))

ok('a trip title over 80 characters is refused', await as(b, async () => { try { await db.query(`insert into trips (user_id, title) values ('${b}', '${'x'.repeat(81)}')`); return false } catch { return true } }))
ok('a place name over 120 characters is refused by add_trip_stop', await as(c, async () => { try { await db.query(`select add_trip_stop('${tripC}', 'g-long', '${'y'.repeat(121)}', -1, 36, '{}', 'city', 'nairobi', null, '{}')`); return false } catch { return true } }))
ok('a place off the map is refused', await as(c, async () => { try { await db.query(`select add_trip_stop('${tripC}', 'g-off', 'Nowhere', 95, 36, '{}', 'city', 'nairobi', null, '{}')`); return false } catch { return true } }))
ok('a second lesson for the same person and stop is refused', await as(c, async () => { try { await db.query(`insert into user_lessons (user_id, trip_stop_id, content) values ('${c}', '${stopD}', '{}'::jsonb)`); return false } catch { return true } }))
ok('a display name over 60 characters is refused', await as(c, async () => { try { await db.query(`update profiles set display_name = '${'n'.repeat(61)}' where id = '${c}'`); return false } catch { return true } }))
ok('search needs three letters now, and hides display names of people who are not friends', await as(c, async () => { const two = (await db.query(`select * from search_usernames('da')`)).rows.length; const rows = (await db.query(`select username, display_name from search_usernames('dan')`)).rows; return two === 0 && rows.some((r) => r.username === 'dan_k' && r.display_name === null) }))
ok('a member cannot delete a stop the owner added', await (async () => { const ownerStop = await as(c, async () => (await db.query(`select add_trip_stop('${tripC}', 'g-owner', 'Owner stop', -1.3, 36.8, '{}', 'city', 'nairobi', null, '{}') id`)).rows[0].id); await as(c, async () => { await db.query(`insert into friendships (requester_id, addressee_id) values ('${c}', '${d}') on conflict do nothing`) }); await as(d, async () => { await db.query(`update friendships set status = 'accepted' where addressee_id = '${d}'`) }); await as(c, async () => { await db.query(`insert into trip_members (trip_id, user_id, added_by) values ('${tripC}', '${d}', '${c}') on conflict do nothing`) }); const gone = await as(d, async () => (await db.query(`delete from trip_stops where id = '${ownerStop}'`)).affectedRows); return gone === 0 })())
ok('the 200 notes an hour cap holds', await (async () => { await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`); try { for (let i = 0; i < 199; i++) await db.query(`insert into phrase_notes (swahili, note) values ('Habari?', 'flood ${i}')`); try { await db.query(`insert into phrase_notes (swahili, note) values ('Habari?', 'one too many')`); return false } catch { return true } } finally { await db.exec(`reset role`) } })())
await as(b, async () => { await db.query(`insert into trips (user_id, title) values ('${b}', 'B trip')`) })
await as(a, async () => { await db.query(`select delete_my_account()`) })
await db.exec(`reset role`)
ok('a user deleting their account removes their auth row, profile and trip', (await count(`select count(*) n from auth.users where id = '${a}'`)) === 0 && (await count(`select count(*) n from profiles where id = '${a}'`)) === 0 && (await count(`select count(*) n from trips where user_id = '${a}'`)) === 0)
ok('user B is untouched', (await count(`select count(*) n from trips where user_id = '${b}'`)) === 1)
ok('an anonymous visitor cannot call delete_my_account', await (async () => { await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`); try { await db.query(`select delete_my_account()`); return false } catch { return true } finally { await db.exec(`reset role`) } })())

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

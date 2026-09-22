// Runs the project's real supabase/setup.sql in an in-process Postgres and tests Row Level Security the way Supabase applies it.
// Exists because security rules that were never run are only a hope. It needs one package that is deliberately not a project
// dependency, so install it just for the run:
//   npm install --no-save @electric-sql/pglite && node scripts/testDatabase.mjs
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
const repo = process.argv[2] ?? '.'
const db = new PGlite()
let passed = 0, failed = 0
const ok = (name, cond, detail = '') => { cond ? passed++ : failed++; console.log(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : ' -> ' + detail}`) }

await db.exec(`
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text);
  create role authenticated nologin; create role anon nologin;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to authenticated, anon;
`)
let sql = readFileSync(repo + '/supabase/setup.sql', 'utf8')
try { await db.exec(sql) } catch (e) {
  if (/pgcrypto/.test(String(e))) { console.log('  note: this test Postgres has no pgcrypto extension. gen_random_uuid is built in, so it is skipped here only.'); sql = sql.replace(/create extension if not exists "pgcrypto";/, ''); await db.exec(sql) } else throw e
}
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

await as(b, async () => { await db.query(`insert into trips (user_id, title) values ('${b}', 'B trip')`) })
await as(a, async () => { await db.query(`select delete_my_account()`) })
await db.exec(`reset role`)
ok('a user deleting their account removes their auth row, profile and trip', (await count(`select count(*) n from auth.users where id = '${a}'`)) === 0 && (await count(`select count(*) n from profiles where id = '${a}'`)) === 0 && (await count(`select count(*) n from trips where user_id = '${a}'`)) === 0)
ok('user B is untouched', (await count(`select count(*) n from trips where user_id = '${b}'`)) === 1)
ok('an anonymous visitor cannot call delete_my_account', await (async () => { await db.exec(`set role anon; select set_config('request.jwt.claim.sub', '', false);`); try { await db.query(`select delete_my_account()`); return false } catch { return true } finally { await db.exec(`reset role`) } })())

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

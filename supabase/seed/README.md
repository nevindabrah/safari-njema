# Seed data

`phrases.json` is built from the `CHAPTERS` array in `safari-njema-design-reference.html`. Do not write Swahili by hand here.

Steps:
1. Put `safari-njema-design-reference.html` in the repo root.
2. Run `node scripts/extractPhrases.ts` to produce `supabase/seed/phrases.json` and `supabase/seed/proverbs.json`. Each phrase gets its chapter's base tag plus the per phrase tags in the `PHRASE_TAGS` table in the script. The Swahili, pronunciation and English are copied exactly. The script stops if a key in that table matches no phrase, so a typo cannot slip through.
3. Run `node scripts/buildSeedSql.ts` to produce `supabase/seed.sql`.
4. Paste `supabase/seed.sql` into the Supabase SQL editor, or run `supabase db reset` locally.

The seeded phrases have been reviewed by a Swahili teacher, so they are seeded with `verified = true`. A phrase proposed by the model later starts as `verified = false`.

Tag vocabulary used by the lesson generator (see `supabase/functions/_shared/lessonPlan.ts`):

- Chapter base tags: `basics`, `airport`, `transport`, `food`, `market`, `safari`, `coast`, `help`.
- Greetings: `greeting`, `core_greeting` (the two every first stop teaches), `coastal_greeting`, `coastal`, `respect`, `farewell`.
- Manners and meeting people: `polite`, `introductions`, `questions`, `smalltalk`.
- Money, split by situation so the bill never shows up at an airport: `price`, `paying`, `fare`, `cash`.
- Market: `bargaining`, `numbers`, `shopping`. Eating: `ordering`, `drink`. Safari: `animals`, `guide`. Coast: `beach`. Getting around: `directions`, `hotel`. Trouble: `emergency`.
- `essential` marks the one phrase in a group that should be taught first.

v1 has no hotel, nightlife, hiking or business phrases yet. Lessons for those fall back to polite and help phrases until such phrases are added to the bank.

`register` is `standard`, `coastal` or `sheng`. Sheng is left out of lessons unless the Sheng setting is on, which is a later feature.

Shape of one phrase:

```json
{
  "swahili": "",
  "pronunciation": "",
  "english": "",
  "tags": ["basics", "greeting", "core_greeting", "essential"],
  "register": "standard",
  "accepted_variants": [],
  "source": "v1 chapter: Greetings"
}
```

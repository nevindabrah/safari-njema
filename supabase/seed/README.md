# Seed data

`phrases.json` is built from the `CHAPTERS` array in `safari-njema-design-reference.html`. Do not write Swahili by hand here.

Steps:
1. Put `safari-njema-design-reference.html` in the repo root.
2. Run `node scripts/extractPhrases.ts` to produce `supabase/seed/phrases.json` and `supabase/seed/proverbs.json`. Tags are assigned per v1 chapter in the `CHAPTER_TAGS` table in the script, with a few per phrase extras in `EXTRA_TAGS`. The Swahili, pronunciation and English are copied exactly.
3. Run `node scripts/buildSeedSql.ts` to produce `supabase/seed.sql`.
4. Paste `supabase/seed.sql` into the Supabase SQL editor, or run `supabase db reset` locally.

Every seeded phrase has `verified = false` until a Swahili teacher reviews it.

Tag vocabulary used by the lesson generator (see `supabase/functions/_shared/pickCandidates.ts`):
`greeting`, `polite`, `numbers`, `money`, `market`, `bargaining`, `food`, `drink`, `safari`, `animals`, `transport`, `directions`, `hotel`, `help`, `emergency`, `airport`, `coast`, `coastal`, `city`, `family`, `nightlife`, `hiking`, `business`, `questions`, `time`.

v1 has no hotel, nightlife, family, hiking or business phrases yet, so those tags only affect scoring once such phrases are added to the bank.

Shape of one phrase:

```json
{
  "swahili": "",
  "pronunciation": "",
  "english": "",
  "tags": ["greeting"],
  "register": "standard",
  "accepted_variants": [],
  "source": "v1 chapter: Greetings"
}
```

# 001 · Spanish content is hardcoded in TypeScript

## Summary

All of the game's Spanish — vocabulary, verb tables, grammar drills, sentences for the Palabra
Final and the tap-to-translate glossary — lives in hand-written TypeScript arrays and dictionaries
under `src/data/`. Content and code are mixed together, and the content has no schema of its own.

## Where

| File | Holds |
| --- | --- |
| `src/data/vocab.ts` | Nouns, adjectives, expressions, idioms; gender rules |
| `src/data/verbs.ts` | Verbs, irregular tables, tense definitions and English renderings |
| `src/data/grammar.ts` | Ser/estar, por/para, gustar drills and their rule explanations |
| `src/data/sentences.ts` | Sentences for the word-order challenges |
| `src/data/glossary.ts` | Extra glosses so every word in the story can be tapped |

Story dialogue in `src/story/` is also hardcoded, but that is a separate concern (scripts, not
reference data).

## Why it's a problem

- **Scaling.** Spanish levels (beginner → advanced) and more topics multiply the amount of content.
  Growing it means editing large TS files by hand, where a typo is a compile error at best and a
  silently wrong answer at worst.
- **Editing needs a developer.** A Spanish speaker or teacher can't review or add content without
  touching code, and reviewing diffs of nested arrays is hard.
- **No metadata.** Entries can't easily carry a CEFR level, frequency rank, region (Spain vs Latin
  America), audio, or notes — so filtering "only A1 words" or "Spain-only terms" is done with ad-hoc
  code paths (chapter numbers, separate blocks) instead of data.
- **Duplication.** Some information exists in several places (a word in `vocab.ts` and a gloss for
  its inflected form in `glossary.ts`; verb forms generated in code and listed again by hand).
- **Bundle size.** Everything is compiled into the single JS bundle and loaded up front, even content
  for chapters and levels the player hasn't reached.

## What a fix looks like

1. Move content to plain data files (e.g. `content/*.json` or YAML/CSV) with one record per entry
   and explicit fields: `es`, `en`, `pos`, `gender`, `level` (A1–B2), `topic`, `region`, `notes`.
2. Define a schema and validate it in CI (unique ids, required fields, valid levels, every
   referenced verb/word exists, accents normalised).
3. Generate derived data (inflected forms for the glossary, conjugation tables) at build time instead
   of maintaining it by hand.
4. Load content per level/chapter so the initial bundle stays small.
5. Keep the existing tests (every story word translatable, every challenge answerable) running
   against the new data.

## Until then

- Add content to the existing files following their current patterns.
- Rely on `npm test`: it checks that every Spanish word in the story has a translation and that the
  generators produce answerable challenges.
- Note that new difficulty levels add more hardcoded content, which grows this debt.

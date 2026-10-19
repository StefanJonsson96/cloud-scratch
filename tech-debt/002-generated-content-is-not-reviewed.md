# 002 · Generated synonyms and sentences are picked by rules, not reviewed

## Summary

Since the Spanish data is generated (see [docs/content.md](../docs/content.md)), the build decides
on its own which Wiktionary sense a word teaches, which other words count as right answers, how
regional a word is, and which Tatoeba sentences suit each chapter. The rules get most of it right,
but nobody reviews the output, and a few slips get through.

## Where

`scripts/data/build.ts` (`variantsFor`, sentence and drill selection), `scripts/data/select.ts`
(sense picking, gloss clean-up) and `src/data/regions.ts` (reading labels like *(Mexico)*).

Examples from the current data:

- *hola* accepts *ave* (Wiktionary: "hello, hail, used when coming into a house") — true, but archaic in practice.
- *cansado* accepts *harto* and *cabreado* (Wiktionary lists them as synonyms of the "fed up" sense).
- *volver* accepts *devolver* (to give back), from the same synonym list.
- Some sentences are short but idiomatic (*No me salen las palabras*, chapter 4).
- The frequency list files some forms under the wrong lemma (*tranquila* under "tranquilar"); the
  build works around it with Tatoeba's tagged sentences.

## Why it's a problem

- A wrong synonym is a wrong answer marked right, which teaches the mistake.
- A badly picked sense gives a confusing prompt, and the fix today is a `sense`/`en` hint in the
  curriculum, found only when someone happens to notice.
- Changes to the upstream data (`npm run data -- --update`) can change hundreds of entries at once,
  and the diff of minified JSON is hard to review.

## What a fix looks like

1. Have `npm run data` write a readable report (Markdown/HTML) of every word: the sense it chose,
   its accepted variants and why, and its example — so a Spanish speaker can review it, and so
   updates show up as a readable diff.
2. A small reviewed list of rejected variants and sentences, kept as data next to the curriculum,
   applied by the build.
3. Consider [Wiktextract/Kaikki](https://kaikki.org) JSON as the Wiktionary source: it has sense
   ids and structured tags (*Spain*, *colloquial*, *archaic*), which would make synonym and region
   matching exact instead of text-based.

## Until then

- When you notice a bad prompt, add `sense` or `en` to the word in `src/data/curriculum.ts`.
- `tests/answers.test.ts` checks the cases that matter most (Spain words, slang, Latin American
  words graded "almost", no vulgar words, no *ustedes* in sentences).

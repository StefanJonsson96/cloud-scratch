# Where the Spanish comes from

Palabrista doesn't keep a hand-written dictionary. The only Spanish we write by hand is the
**curriculum** — which words and verbs each chapter teaches — plus the story and the grammar
explanations. Everything else is built from open data:

| What | Source |
| --- | --- |
| Meanings, gender, plural and feminine forms, synonyms, slang and regional words, usage notes | [English Wiktionary](https://en.wiktionary.org) (via [doozan/spanish_data](https://github.com/doozan/spanish_data)) |
| Example sentences, word-order sentences, ser/estar · por/para · gustar · subjunctive drills | [Tatoeba](https://tatoeba.org) |
| Every verb form in every tense, Spain style (with *vosotros*) | [conjugate-esp](https://github.com/jirimracek/conjugate-esp) |
| English verb forms ("ate", "has eaten") | [compromise](https://github.com/spencermountain/compromise) |
| Which reading of a word is most common | Tatoeba's tagged sentences and [FrequencyWords](https://github.com/hermitdave/FrequencyWords) |

`npm run data` reads those sources and writes `src/data/generated/*.json`, which the game bundles.
The generated files are committed, so building or playing the game needs no network.

## Adding or changing words

Edit [`src/data/curriculum.ts`](../src/data/curriculum.ts), then run `npm run data` and `npm test`.

```ts
lesson(2, 'la comida', 'noun', [
  'pan',                                  // just the lemma: everything else comes from Wiktionary
  ['patata', '🥔', { sense: 'potato' }],  // an emoji, and which meaning to teach
  ['caña', '🍺', { en: 'small draught beer' }], // our own English prompt
]),
verbs(3, ['ser', 'estar', ['querer', 'want']]), // verbs; ['querer', 'want'] picks the sense
```

| Option | Use it when |
| --- | --- |
| `sense` | Wiktionary's first meaning isn't the one you teach (*plátano* → "banana", not "plantain"). Any word from the meaning you want. |
| `en` | Wiktionary words the meaning unhelpfully (*de nada* = "it's nothing"; we want "you're welcome") or lacks the phrase. |
| `lookup` | The word's entry is under another form (*mola* → *molar*). |
| `both` | Teach both genders (*el amigo / la amiga*). |
| `trap` | A false friend: the English look-alike and how to really say it. |
| `id` | Keep an existing id (saves refer to words by id). |

`npm run data` prints a warning for any word it couldn't find.

Things you never need to write by hand: genders and articles (including *el agua*), plurals and
feminine forms, tricky-gender flags, example sentences, synonyms and Latin American equivalents,
verb tables, irregular-tense flags, the tap-to-translate entries for story text, and the grammar
drills.

## More than one right answer

For each word the build collects other right answers from Wiktionary and grades them like this:

| Kind | Example | Grade |
| --- | --- | --- |
| Synonym | *andar* for *caminar* | Correct, with a note |
| Informal | *porfa* for *por favor*, *boli* for *bolígrafo* | Correct — "informal, fine with friends" |
| Regional | *carro* for *coche*, *jugo* for *zumo* | Almost — "used in Latin America. In Spain: *coche*" |

Vulgar, archaic and rare words are never accepted. If a typed answer isn't one we know, the game
asks Wiktionary's API live before marking it wrong (setting: *Ajustes → Comprobar en línea*; it
sends only that word, and does nothing offline).

## How the build decides

- **Meaning:** the first ordinary sense of the right part of speech (skipping archaic, regional or
  heading-only senses), or the one matching `sense`.
- **Synonyms:** Wiktionary's synonym list for that sense, plus common words whose main meaning is
  exactly the same. A word's own entry is checked for labels like *(Mexico)* or *(vulgar)*.
- **Sentences:** short Tatoeba sentences by native speakers that use only words and tenses the
  chapter has taught — no *ustedes*, no Latin-American-only words, no names.
- **Drills:** sentences with exactly one *ser/estar*, *por/para*, *gusta/gustan* or subjunctive
  form, blanked out, with the alternative as the wrong option.

## Updating the sources

The sources are pinned to a commit in `scripts/data/source.json`. `npm run data -- --update` moves the
pin to the latest version; review the diff of `src/data/generated/` before committing it.

The first run downloads about 130 MB into `.cache/`. To use a local checkout of
`doozan/spanish_data` instead: `SPANISH_DATA_DIR=/path/to/spanish_data npm run data`.

## Licences

The generated data is derived from CC BY-SA and CC BY sources, so it is shared under CC BY-SA 4.0.
See [`src/data/generated/README.md`](../src/data/generated/README.md). Every Tatoeba sentence keeps
its author credit in the data, and the game lists its sources under *Ajustes → Créditos*.

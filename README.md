# Palabrista

A story-driven, turn-based RPG where your magic is the Spanish language — **Spanish from Spain**.

A grey fog called *El Silencio* is stealing the words of a little coastal village. Your grandmother,
the last *Palabrista* (word-mage), is struck silent. With Mateo the fisherman's son and Lola the
flamenco guitarist, you travel up the coast to the Mute Tower to win the words back.

That's Act I. In **Act II, *La Gran Ruta***, the Grey Lady starts stealing the *Mother Word* of
every region of Spain, and you take the train across the country to win them back — ten chapters
in all:

| | Where | The Spanish |
| --- | --- | --- |
| 0–5 | Puerto Alegre and the north coast | the present, *ser/estar*, *gustar*, Spain's *perfecto*, *indefinido* vs *imperfecto* |
| 6 | La Mancha: windmills that really are giants | telling a story with the two past tenses |
| 7 | Valencia: Las Fallas, but the fire won't burn | the future |
| 8 | Seville and the Alhambra: Lola's family has lost its *duende* | commands and the conditional |
| 9 | Santiago de Compostela: a meiga, a queimada, the Santa Compaña | wishes with the subjunctive |
| 10 | Salamanca: the old library and the Book of Forgetting | doubts and feelings with the subjunctive |

![A battle: enemies announce their next move in Spanish](https://github.com/StefanJonsson96/palabrista/blob/main/docs/battle.png?raw=true)

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/StefanJonsson96/palabrista.git; cd palabrista; npm install; npm run dev
```

Then open the address it prints (usually <http://localhost:5173>).

Prefer a single file? `npm run build` writes `dist/index.html`, which runs straight from disk —
double-click it, or put it on a phone. Your progress is saved in the browser; *Menú → Ajustes* gives
you a save code to carry it to another device.

**Sound:** every line of story dialogue is recorded with neural Spanish-from-Spain voices — a
female voice for women and girls, male voices for men — so characters sound right on any device,
each at their own pitch and pace (*Abuela* slower and lower, the children higher). Practice words
and battle announcements use your browser's Spanish voice (*Menú → Ajustes → Voces* shows which, and
how to add one). Mute and volume (music, effects, voices) are the 🔊 and 🎚️ buttons in the corner.

## How it plays

- **Make your character.** Pick a name, how Spanish should address you (*¿estás cansado?* or
  *¿estás cansada?* — everyone agrees with you, which is grammar practice in itself), your look,
  a class, and two difficulty settings: how hard the fights are, and how hard the Spanish is.
- **Follow the 🎯 objective** in the corner — it always says what to do next, in Spanish with the
  English underneath — and the yellow arrow on the map, which points at the target or at the exit
  that leads there.
- **Explore** a pixel-art Spain: a fishing village, a market town, a whispering forest, a snowy
  monastery, windmills and wheat, the Fallas, the Alhambra, a Galician forest in the rain and
  Salamanca's golden stone. Talk to everyone — many people have lost a word and need you to give it
  back, and every region has side quests (lost sheep, a paella recipe, a bagpiper's song…).
- **Take the train.** In Act II the station map shows every line you've opened; they all run through
  Madrid, like Spain's real high-speed network.
- **Fight** in turn-based battles. A timeline shows who acts next (speed matters). Basic attacks roll
  a d20. Elements combo, BG3-style: 💧 *Agua* makes enemies wet, ⚡ *Rayo* then does double damage,
  ❄️ *Hielo* freezes them solid.
- **Read the enemy.** Every enemy announces its next move in Spanish — *«El cangrejo va a pellizcar a
  Mateo»*. Understand it and you can protect the target, defend, or sing the enemy to sleep before a
  big attack lands.
- **Cast with Spanish.** Special moves open a quick challenge. Right = full power, fast = bonus,
  wrong = a weak spell plus the correct answer and a short explanation. Each party member trains a
  different skill:
  - **You** — vocabulary and Spain expressions, from recognising a word to typing it from memory.
  - **Mateo** — quick decisions: *el/la* (with the traps: *el agua, el día, la mano, el problema*),
    *ser* vs *estar*, *por* vs *para*.
  - **Lola** — verbs: full conjugation including *vosotros*, the Spain-style *pretérito perfecto*
    (*hoy he comido*), *indefinido* vs *imperfecto*, and *gustar*.
  - **Bruno** (Act II) — listening: hear a real sentence, read by a woman or a man, and pick what it
    means — later, build it from the words you heard.
- **Racha.** Right answers fill a streak meter. When it's full, unleash a *Palabra Final* by
  building a Spanish sentence from word tiles.
- **No clock.** Take as long as you need to read and answer. (Want pressure? Turn on the speed bonus
  in *Ajustes*.) Lost a fight? Each retry gives you *¡Ánimo!* — the enemies get a bit weaker.

![Choose a class: each changes how you grow, adds a skill and a passive](https://github.com/StefanJonsson96/palabrista/blob/main/docs/classes.png?raw=true)

### Off the main road

- **Postales** — a postcard from every place you visit, with a short note about Spain (the Fallas,
  the Giralda, the frog on Salamanca's university…), in simple Spanish with English underneath.
- **El Rosco** — the word quiz from the Spanish TV show *Pasapalabra*: one word for every letter of
  the alphabet, from the words you've met. Find the presenter at the station.
- **Diario** — your journal: the story so far, retold in the past tenses.
- **Bestiario** — every creature you've beaten, described in Spanish.
- **La Torre de los Ecos** — after the ending: ten fights in a row against the echoes of the
  journey's monsters and bosses, with a review question between floors.

### Classes and talents

| Class | Plays like | Signature skill | Passive |
| --- | --- | --- | --- |
| 🔥 Hechicero / Hechicera | Glass cannon | *Meteoro*: fire on every foe | Right answers deal +15% |
| 🛡️ Guardián / Guardiana | Tank | *Muralla*: draw attacks to you, shielded | Mistakes never break your Racha |
| 🗡️ Pícaro / Pícara | Fast and lucky | *Birlar*: hit and steal | Right answers bring your next turn sooner; crits on 18–20 |

Every 3 levels you pick one of three **talents** — party-wide perks like *Segundo aliento* (survive a
knockout once per battle), *Maestro de combos*, *Buena memoria* (hints stop lowering your grade) or
*Regateo* (cheaper shops).

## What it teaches (and why)

![After a wrong answer you get the full conjugation table](https://github.com/StefanJonsson96/palabrista/blob/main/docs/explain.png?raw=true)

It's built to sit next to Duolingo and fill the gaps an app course tends to leave:

| Gap | What the game does |
| --- | --- |
| Latin American focus | Spain throughout: *vosotros* everywhere, *zumo, patata, vale, ¡qué guay!, ¿me pone…?, te echo de menos*, a Spain voice |
| Recognition over recall | Words you know graduate from multiple choice to typing from memory (turn on *Typing focus*) |
| Thin grammar explanations | Every mistake shows the rule: gender rules, ser/estar uses, por/para uses, a full conjugation table |
| Ser/estar, por/para, gustar | Drilled as fast decisions, with the classic edge cases (*la fiesta es en…*, *está listo / es listo*) |
| Past tenses | Spain's *perfecto* for today, *indefinido* vs *imperfecto* in the story's own flashbacks |
| Idioms | *estar hecho polvo, ser pan comido, meter la pata, quien calla otorga…* |
| Agreement | NPCs address you as *listo / lista, preparado / preparada*; class names agree with you |

### Spanish level

| Level | What changes |
| --- | --- |
| **A1 · Principiante** | Core words and the present tense; grammar unlocks slowly; mostly multiple choice; short sentences; a missing accent still counts |
| **A2 · Intermedio** | Past tenses (Spain's *perfecto*, *indefinido*, *imperfecto*), ser/estar, por/para, gustar; typing once you know a word |
| **B1 · Avanzado** | Everything from the start, plus the **future, conditional, present subjunctive and commands** (with *vosotros*: *¡venid!*), indicative-or-subjunctive drills, **false friends** (*embarazada, éxito, librería…*), **Spain vs Latin America** (*ordenador / computadora, móvil / celular…*), colloquial Spain Spanish (*flipar, currar, majo, ¡qué fuerte!*), and lots of typing |

Change it any time in *Menú → Ajustes*; the Grimorio shows the tenses and notes for your level.

![Every Spanish word is tappable; EN shows the whole line](https://github.com/StefanJonsson96/palabrista/blob/main/docs/dialogue.png?raw=true)

**Translations are always available.** Tap (or hover) any underlined word for its meaning — every
word in the story has an entry, including conjugated verbs. Press **EN** (or **T**) for the whole
line, or set translations to *Always*. In challenges, **💡 Hint** helps when you're stuck. The
**Grimorio** in the menu is your dictionary, verb tables and grammar notes, and **Repaso** gives you a
quick ten-question review anywhere.

A spaced-repetition scheduler decides what you practise: shaky words come back soon, known words
fade into the background, and mastered ones return days later.

**More than one right answer.** Typed answers accept synonyms and slang (*porfa* for *por favor*,
*andar* for *caminar*, *boli* for *bolígrafo*) with a note, and Latin American words count as
"almost" with the Spain word shown (*carro* → *coche*, *jugo* → *zumo*). If you type something the
game doesn't know, it checks Wiktionary before marking it wrong.

## Where the Spanish comes from

There's no hand-written dictionary. The curriculum (`src/data/curriculum.ts`) only lists which
words each chapter teaches; `npm run data` looks everything else up in open data — meanings,
genders, forms, synonyms and regional labels from **Wiktionary**, real example sentences and
grammar drills from **Tatoeba**, and every verb form from **conjugate-esp** — and writes
`src/data/generated/`. See [docs/content.md](https://github.com/StefanJonsson96/palabrista/blob/main/docs/content.md) for how to add words and how answers
are graded.

Data credits: [Wiktionary](https://en.wiktionary.org) (CC BY-SA 4.0) and
[Tatoeba](https://tatoeba.org) (CC BY 2.0 FR) via [doozan/spanish_data](https://github.com/doozan/spanish_data),
[FrequencyWords](https://github.com/hermitdave/FrequencyWords) (CC BY-SA 4.0),
[conjugate-esp](https://github.com/jirimracek/conjugate-esp) and
[compromise](https://github.com/spencermountain/compromise) (MIT). The generated data is shared under
CC BY-SA 4.0 — see [its README](https://github.com/StefanJonsson96/palabrista/blob/main/src/data/generated/README.md).
Recorded dialogue: [Piper](https://github.com/rhasspy/piper) voices *sharvard* (CC BY 3.0, Sharvard
corpus, University of Edinburgh) and *davefx* (CC0), made with
[sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) — see
[the voices README](https://github.com/StefanJonsson96/palabrista/blob/main/src/data/generated/voices/README.md).

## Controls

| | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrows / WASD (hold Shift to run) | D-pad |
| Talk, confirm | Enter / Space / Z | A |
| Back | Esc / X | B |
| Menu | M | ☰ |
| Translate line | T | EN button |
| Hint · hear it again | H · R | 💡 · 🔊 |
| Answer | 1–4 | tap |
| All controls | F1 or ? | ❓ |
| Mute · volume | — | 🔊 · 🎚️ (corner) |

## Project layout

```
src/
  data/       the curriculum, tense and grammar rules, items, and generated/ (built by `npm run data`)
  learn/      answer checking (incl. the live Wiktionary check), spaced repetition, challenges, tap-to-translate
scripts/data/ the data build: reads Wiktionary, Tatoeba and conjugate-esp, writes src/data/generated/
scripts/voices/ records the story dialogue (`npm run voices`), writes src/data/generated/voices/
  battle/     rules (turn order, damage, combos, enemy AI), enemies, classes & talents, controller and screen
  world/      tiles, maps, overworld engine
  story/      the scripts for every chapter, side activities, and the objective for each stage
  ui/         dialogue, challenge card, menus, title, character creation, help & volume
  engine/     input, audio (chiptune synth, volume), speech (per-character voices), pixel-art sprites
  art/        sprites as strings of palette characters
tests/        learning logic, battle rules, map/story integrity, and the side features
tools/        a playtest bot that follows the objective marker (tools/playtest), a sprite gallery
tech-debt/    known shortcuts we intend to fix later
```

`npm test` runs the test suite: answer checking (including synonyms, slang and regional words),
the generated data, conjugations (all eight tenses), the scheduler,
the Spanish levels, battle rules, classes and talents, and checks that every map is walkable, every
exit leads somewhere, every story stage has an objective, and every Spanish word in the story has a
translation.

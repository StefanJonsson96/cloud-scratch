# Recorded dialogue — do not edit by hand

Every scripted line of story dialogue, spoken by neural Spanish-from-Spain voices, written by
`npm run voices`:

- `index.json`: line key (voice + words) → [pack, hash of the text and settings]
- `pack-<story file>.json`: line key → MP3 (base64, 24 kbps mono)

The game plays these with WebAudio, each character at their own speed (see
[`src/story/voices.ts`](../../../story/voices.ts)). Lines built at runtime (item names, amounts of
euros) aren't recorded and use the browser's voice instead.

## Re-recording

After changing dialogue in `src/story/`, run `npm run voices`. It reads every line from the story
scripts (`scripts/voices/lines.ts`), records only new or changed ones (`scripts/voices/render.py`),
and reports any clip whose pitch doesn't match its voice's gender. `npm test` fails if a line has
no recording.

It needs Python 3 with `pip install sherpa-onnx numpy`, and `ffmpeg`. The voice models (about
140 MB) are downloaded into `.cache/voices` the first time.

## Voices and licences

| Voice | Used for | Model | Licence |
| --- | --- | --- | --- |
| `f` | women, girls, boys (faster), the narrator | Piper `es_ES-sharvard-medium`, speaker F — trained on the [Sharvard corpus](https://datashare.ed.ac.uk/handle/10283/574) (Aubanel, García Lecumberri & Cooke, University of Edinburgh) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `m` | most men | Piper `es_ES-davefx-medium` — trained on the [davefx dataset](https://github.com/NabuCasa/voice-datasets) | CC0 |
| `m2` | Mateo, the market men, a male hero | Piper `es_ES-sharvard-medium`, speaker M | CC BY 3.0 |

Models from [Piper](https://github.com/rhasspy/piper), run with [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
(Apache 2.0). The recordings in this folder are shared under CC BY 3.0.

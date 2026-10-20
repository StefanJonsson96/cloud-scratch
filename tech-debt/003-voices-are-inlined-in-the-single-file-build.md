# 003 · The recorded voices are inlined in the single-file build

## Summary

`npm run build` writes one self-contained `dist/index.html`, and every recorded line of dialogue is
inside it as base64 MP3 (about 11 MB of the 12.8 MB file). Each new chapter adds roughly 1 MB.
The file still opens instantly from disk, but it is getting close to the 16 MB limit of the hosting
we use for the playable preview, and every player downloads every chapter's voices up front.

## Where

`src/engine/voiceover.ts` loads the packs with `import.meta.glob`; `vite-plugin-singlefile` inlines
them. The packs are written by `scripts/voices/render.py` into `src/data/generated/voices/`
(one per story file, plus `words` and `sentences`).

## Why it's a problem

- Base64 adds a third to the size of the audio.
- Another chapter or two of dialogue would push the preview over 16 MB.
- On a slow phone connection the first load is long, though only the first chapter's voices are
  needed to start.

## What a fix looks like

1. Keep the single file for "download and double-click", but add a second build that emits the
   packs as separate `.json` (or raw `.mp3`) files next to `index.html`, fetched per chapter. The
   artifact host accepts supporting files.
2. Or shrink the audio: 16 kHz mono at a lower bitrate is still clear for speech (check with the
   Whisper QA in `scripts/voices`), and Opus is about half the size of MP3 at the same quality.

## Until then

Watch the size `npm run build` prints. If it nears 16 MB, lower the MP3 bitrate in
`scripts/voices/render.py` and re-record (`npm run voices` re-renders only changed settings).

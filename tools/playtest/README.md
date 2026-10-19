# Playtest bot

`goalbot.mjs` plays the game by following the 🎯 objective marker, the way a player would: it walks
to where the marker points, talks or examines, and plays whatever comes up — dialogue, challenges
(some answered wrong on purpose), shops and battles. It needs no route of its own, so it keeps
working as the story grows, and it doubles as a test that the objective always says what to do: if
the goal doesn't change after many tries, it stops and reports where it got stuck.

```bash
npm run build; npx vite preview --port 4173 &
node tools/playtest/goalbot.mjs                       # the whole game
node tools/playtest/goalbot.mjs --until gloton        # stop when a story flag is set
node tools/playtest/goalbot.mjs --until fin --save act1.json   # play Act I and keep the save…
node tools/playtest/goalbot.mjs --from act1.json      # …then start the next run from it
node tools/playtest/goalbot.mjs --wrong 0.3 --shots shots/   # more mistakes; a screenshot per objective
```

It needs [Playwright](https://playwright.dev) with Chromium (`npm i -D playwright && npx playwright
install chromium`), or set `PLAYWRIGHT_MODULE` (path to Playwright's `index.mjs`) and `CHROMIUM` (a
browser binary).

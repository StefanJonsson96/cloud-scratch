// Where the open Spanish data comes from: Jeff Doozan's spanish_data
// repository, which packages Wiktionary (CC BY-SA) and Tatoeba (CC BY 2.0 FR)
// for Spanish learners. Pinned to a commit so builds are reproducible;
// `npm run data -- --update` moves the pin to the latest version.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const REPO = 'doozan/spanish_data';
const PIN_FILE = join(import.meta.dirname, 'source.json');
export const FILES = ['es-en.data', 'es_allforms.csv', 'sentences.tsv', 'frequency.csv'] as const;

export interface Pin {
  commit: string;
  date: string;
}

export function readPin(): Pin {
  return JSON.parse(readFileSync(PIN_FILE, 'utf8')) as Pin;
}

function curl(args: string[]): Buffer {
  return execFileSync('curl', ['-fsSL', '--retry', '3', ...args], { maxBuffer: 1 << 30 });
}

/** Look up the newest commit and write it to source.json. */
export function updatePin(): Pin {
  const info = JSON.parse(curl([`https://api.github.com/repos/${REPO}/commits/master`]).toString()) as {
    sha: string;
    commit: { committer: { date: string } };
  };
  const pin = { commit: info.sha, date: info.commit.committer.date };
  writeFileSync(PIN_FILE, JSON.stringify(pin, null, 2) + '\n');
  return pin;
}

/**
 * A directory holding the pinned data files. Uses SPANISH_DATA_DIR if set (a
 * local checkout), otherwise downloads into .cache/ once per commit.
 */
export function dataDir(pin: Pin): string {
  const local = process.env.SPANISH_DATA_DIR;
  if (local) return local;
  const dir = join(import.meta.dirname, '../../.cache/spanish_data', pin.commit);
  mkdirSync(dir, { recursive: true });
  for (const f of FILES) {
    const path = join(dir, f);
    if (existsSync(path)) continue;
    console.log(`Downloading ${f} (${REPO}@${pin.commit.slice(0, 7)})…`);
    writeFileSync(path, curl([`https://raw.githubusercontent.com/${REPO}/${pin.commit}/${f}`]));
  }
  return dir;
}

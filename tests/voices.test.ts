import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { extractLines, withoutName } from '../scripts/voices/lines';
import { CAST_VOICES, NARRATOR_VOICE, heroVoice, recordedVoice, voiceKey } from '../src/story/voices';
import index from '../src/data/generated/voices/index.json';

const INDEX = index as unknown as Record<string, [string, string]>;
const pack = (name: string) => JSON.parse(readFileSync(new URL(`../src/data/generated/voices/pack-${name}.json`, import.meta.url), 'utf8')) as Record<string, string>;

describe('recorded dialogue', () => {
  const { lines } = extractLines();

  it('has a recording for every line in the story (run `npm run voices` after editing dialogue)', () => {
    expect(lines.length).toBeGreaterThan(250);
    const missing = lines.filter((l) => !(l.key in INDEX)).map((l) => `${l.at}  ${l.text}`);
    expect(missing).toEqual([]);
  });

  it('stores real MP3 audio for every entry', () => {
    const byPack = new Map<string, Record<string, string>>();
    for (const [key, [name]] of Object.entries(INDEX)) {
      if (!byPack.has(name)) byPack.set(name, pack(name));
      const b64 = byPack.get(name)![key];
      expect(b64, key).toBeTruthy();
      const head = Buffer.from(b64.slice(0, 8), 'base64');
      const mp3 = head.subarray(0, 3).toString() === 'ID3' || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0);
      expect(mp3, key).toBe(true);
    }
  });

  it('gives women and girls a female voice, and grown men a male one', () => {
    for (const v of Object.values(CAST_VOICES)) {
      if (v.gender === 'f') expect(v.base, v.id).toBe('f');
      // Boys use the female voice sped up, like a child's.
      else if (!['nino', 'pablito', 'curro'].includes(v.id)) expect(['m', 'm2'], v.id).toContain(v.base);
    }
    expect(NARRATOR_VOICE.base).toBe('f');
    expect(heroVoice('f').base).toBe('f');
    expect(heroVoice('m').base).not.toBe('f');
  });

  it('finds lines that mention the hero by name, whatever the name', () => {
    const ramon = recordedVoice(CAST_VOICES.ramon);
    for (const name of ['Alex', 'María José', 'Zoë']) {
      expect(voiceKey(ramon.base, `¡${name}! Mateo me lo ha contado todo. ¡Gracias!`, name) in INDEX).toBe(true);
    }
    expect(withoutName('¡\u0000! Mateo me lo ha contado todo.')).toBe('Mateo me lo ha contado todo.');
    expect(withoutName('\u0000, ¡toma mi Grimorio!')).toBe('¡Toma mi Grimorio!');
    expect(withoutName('¿Y tú, \u0000? ¿Estás bien?')).toBe('¿Y tú? ¿Estás bien?');
  });

  it('records both genders of lines that agree with the hero', () => {
    const abuela = recordedVoice(CAST_VOICES.abuela);
    expect(voiceKey(abuela.base, 'Ahora eres un Palabrista de verdad.') in INDEX).toBe(true);
    expect(voiceKey(abuela.base, 'Ahora eres una Palabrista de verdad.') in INDEX).toBe(true);
  });
});

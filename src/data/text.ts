// Small Spanish text helpers shared by the game and the data build.

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const PROPER = new Set(['rosa', 'mateo', 'lola']);

/** Split a sentence into lowercase word tiles, dropping punctuation. */
export function tokenize(es: string): string[] {
  return es
    .replace(/[¿?¡!.,;:—"«»“”…()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (PROPER.has(t.toLowerCase()) ? t[0].toUpperCase() + t.slice(1).toLowerCase() : t.toLowerCase()));
}

function syllables(word: string): number {
  return (word.match(/[aeiouáéíóúü]+/g) ?? []).length;
}

/**
 * Feminine nouns that start with a stressed "a" take EL in the singular:
 * el agua, el hambre, el águila (but la arena, la abeja).
 */
export function takesEl(word: string): boolean {
  const w = word.toLowerCase();
  if (/^h?á/.test(w)) return true;
  if (!/^h?a/.test(w) || /[áéíóú]/.test(w)) return false;
  // Unmarked stress falls on the second-to-last syllable when a word ends in a
  // vowel, n or s — for a two-syllable word, that's the first one.
  return /[aeiouns]$/.test(w) ? syllables(w) === 2 : syllables(w) === 1;
}

// Reading Wiktionary's qualifiers: is a word or meaning standard in Spain,
// regional (Latin America, Canarias…), informal, or something we shouldn't
// accept at all? Shared by the data build and the live answer check.

const SPAIN = /\bSpain\b|\bPeninsular\b/i;
const REGIONAL =
  /\b(Latin America|Americas|Mexico|Central America|Caribbean|Colombia|Venezuela|Andes|Andean|Cono Sur|Southern Cone|Rioplatense|Río de la Plata|Argentina|Chile|Peru|Ecuador|Uruguay|Paraguay|Bolivia|Cuba|Puerto Rico|Dominican Republic|Costa Rica|Guatemala|Honduras|Nicaragua|Panama|El Salvador|US Spanish|United States|Philippines|Equatorial Guinea|Canary Islands|Canarias|Andalusia|Galicia)\b/i;
const INFORMAL = /\b(colloquial|informal|familiar|slang|childish)\b/i;
const REJECT = /\b(vulgar|offensive|derogatory|pejorative|archaic|obsolete|dated|rare|literary|poetic|euphemistic)\b/i;

export type Register = 'neutral' | 'informal' | 'regional' | 'reject';

export function register(q: string | undefined): Register {
  if (!q) return 'neutral';
  if (REJECT.test(q)) return 'reject';
  if (REGIONAL.test(q) && !SPAIN.test(q)) return 'regional';
  if (INFORMAL.test(q)) return 'informal';
  return 'neutral';
}

/** "Mexico, Central America, Caribbean, Colombia" → "Mexico, Central America and elsewhere" for a short note. */
export function regionLabel(q: string): string {
  const parts = q.split(/,\s*/).filter((p) => REGIONAL.test(p));
  const list = parts.length ? parts : [q];
  if (list.length > 2) return `${list.slice(0, 2).join(', ')} and elsewhere`;
  return list.join(' and ');
}

export function isSpain(q: string | undefined): boolean {
  return !!q && SPAIN.test(q);
}

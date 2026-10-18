// Spanish text-to-speech with the browser's built-in voices, preferring a
// voice from Spain (es-ES) so you hear "zumo" with a Castilian "z".

let voice: SpeechSynthesisVoice | null = null;
let enabled = true;
let ready = false;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
  const rank = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase().replace('_', '-');
    let r = 0;
    if (lang === 'es-es') r += 100;
    if (/google|natural|premium|enhanced|neural/i.test(v.name)) r += 10;
    if (v.localService) r += 2;
    return r;
  };
  voice = es.sort((a, b) => rank(b) - rank(a))[0] ?? null;
  ready = true;
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function speechAvailable(): boolean {
  if (!ready) pickVoice();
  return !!voice;
}

export function voiceName(): string {
  return voice ? `${voice.name} (${voice.lang})` : 'none';
}

export function setSpeechEnabled(on: boolean) {
  enabled = on;
  if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
}

export function speak(text: string, rate = 0.95) {
  if (!enabled || !speechAvailable()) return;
  const clean = text.replace(/[_]{2,}/g, '…').replace(/\[|\]/g, '');
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = voice;
    u.lang = voice!.lang;
    u.rate = rate;
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

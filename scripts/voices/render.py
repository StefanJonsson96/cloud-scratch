#!/usr/bin/env python3
"""Record the story dialogue with neural Spanish-from-Spain voices.

Reads the lines from `npx tsx scripts/voices/lines.ts` (stdin) and writes
src/data/generated/voices/: index.json (key -> pack) and pack-*.json (key ->
base64 MP3). Lines already recorded with the same text are kept, so a re-run
only records what changed.

Needs: python3 with `pip install sherpa-onnx numpy`, and ffmpeg. The voice
models (Piper voices packaged by sherpa-onnx) are downloaded into .cache/voices.
Run it through `npm run voices`.
"""

import base64, hashlib, json, os, subprocess, sys, tarfile, urllib.request
import numpy as np
import sherpa_onnx

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'src', 'data', 'generated', 'voices')
CACHE = os.path.join(ROOT, '.cache', 'voices')
RELEASE = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models'
# Which model and speaker each line uses comes from BASE_VOICES in src/story/voices.ts.
# Less random variation than Piper's defaults (0.667 / 0.8) and a slightly slower pace:
# clearer for learners. Whisper understood 9% more words this way.
NOISE_SCALE, NOISE_SCALE_W, SPEED = 0.3, 0.4, 0.92
SAMPLE_RATE = 22050
BITRATE = '24k'
TARGET_RMS = 0.08  # every voice equally loud
# Expected speaking pitch: a female clip below this, or a male one above, is reported.
F0_FEMALE_MIN, F0_MALE_MAX = 160, 160


def model_dir(name):
    path = os.path.join(CACHE, name)
    if not os.path.isdir(path):
        os.makedirs(CACHE, exist_ok=True)
        archive = path + '.tar.bz2'
        print(f'Downloading {name}…', file=sys.stderr)
        urllib.request.urlretrieve(f'{RELEASE}/{name}.tar.bz2', archive)
        with tarfile.open(archive) as t:
            t.extractall(CACHE, filter='data')
        os.remove(archive)
    return path


_tts = {}
def engine(name):
    if name not in _tts:
        d = model_dir(name)
        onnx = next(f for f in os.listdir(d) if f.endswith('.onnx'))
        _tts[name] = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=os.path.join(d, onnx), tokens=os.path.join(d, 'tokens.txt'),
                                                       data_dir=os.path.join(d, 'espeak-ng-data'),
                                                       noise_scale=NOISE_SCALE, noise_scale_w=NOISE_SCALE_W),
            num_threads=os.cpu_count() or 4)))
    return _tts[name]


def f0(x, sr):
    """Median pitch of the voiced 40 ms frames (autocorrelation, 60–400 Hz)."""
    n = int(sr * 0.04); out = []
    for i in range(0, len(x) - n, n):
        f = x[i:i + n] - x[i:i + n].mean()
        if np.sqrt((f ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(f, f, 'full')[n - 1:]
        lo, hi = int(sr / 400), int(sr / 60)
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.3 * ac[0]:
            out.append(sr / lag)
    return float(np.median(out)) if out else 0.0


def tidy(x, sr):
    """Trim silence (keeping 60 ms), even out loudness, and never clip."""
    loud = np.where(np.abs(x) > 0.01)[0]
    if len(loud):
        pad = int(0.06 * sr)
        x = x[max(0, loud[0] - pad): loud[-1] + pad]
    rms = np.sqrt((x ** 2).mean()) or 1
    x = x * (TARGET_RMS / rms)
    peak = np.abs(x).max()
    return x * (0.95 / peak) if peak > 0.95 else x


def mp3(x, sr):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    return subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-',
                           '-ar', str(SAMPLE_RATE), '-b:a', BITRATE, '-f', 'mp3', '-'],
                          input=pcm, capture_output=True, check=True).stdout


def text_hash(line):
    # Changing a voice or a setting re-records everything.
    settings = f"{line['model']}|{line['speaker']}|{NOISE_SCALE}|{NOISE_SCALE_W}|{SPEED}|{BITRATE}|{TARGET_RMS}"
    return hashlib.sha1(f"{settings}|{line['text']}".encode()).hexdigest()[:10]


def pack_name(line):
    # One pack per story file, so the game loads a chapter's voices together.
    return os.path.splitext(os.path.basename(line['at'].split(':')[0]))[0]


def main():
    lines = json.load(sys.stdin)
    os.makedirs(OUT, exist_ok=True)
    index_path = os.path.join(OUT, 'index.json')
    old_index = json.load(open(index_path)) if os.path.exists(index_path) else {}
    old_audio = {}
    for f in os.listdir(OUT):
        if f.startswith('pack-') and f.endswith('.json'):
            old_audio.update(json.load(open(os.path.join(OUT, f))))

    index, packs, report = {}, {}, []
    made = kept = 0
    for i, line in enumerate(lines):
        key, base, text = line['key'], line['base'], line['text']
        h = text_hash(line)
        pack = pack_name(line)
        if key in old_audio and old_index.get(key, [None, None])[1] == h:
            audio = old_audio[key]
            kept += 1
        else:
            g = engine(line['model']).generate(text, sid=line['speaker'], speed=SPEED)
            x = tidy(np.asarray(g.samples, dtype=np.float32), g.sample_rate)
            pitch = f0(x, g.sample_rate)
            female = base == 'f'
            if pitch and ((female and pitch < F0_FEMALE_MIN) or (not female and pitch > F0_MALE_MAX)):
                report.append(f'  pitch {pitch:.0f} Hz for a {"female" if female else "male"} voice: {text}')
            audio = base64.b64encode(mp3(x, g.sample_rate)).decode()
            made += 1
            if made % 25 == 0:
                print(f'  recorded {made}…', file=sys.stderr)
        index[key] = [pack, h]
        packs.setdefault(pack, {})[key] = audio

    for f in os.listdir(OUT):
        if f.startswith('pack-'):
            os.remove(os.path.join(OUT, f))
    for name, entries in packs.items():
        with open(os.path.join(OUT, f'pack-{name}.json'), 'w') as fh:
            json.dump(dict(sorted(entries.items())), fh, separators=(',', ':'))
            fh.write('\n')
    with open(index_path, 'w') as fh:
        json.dump(dict(sorted(index.items())), fh, ensure_ascii=False, indent=0)
        fh.write('\n')

    size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.startswith('pack-'))
    print(f'{len(lines)} lines: {made} recorded, {kept} kept · {len(packs)} packs, {size / 1e6:.1f} MB', file=sys.stderr)
    if report:
        print('Pitch looks wrong for:', *report, sep='\n', file=sys.stderr)


if __name__ == '__main__':
    main()

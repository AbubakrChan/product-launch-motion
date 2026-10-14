# audio.py: sound for a film. Synthesized voices in several palettes, CC0 samples, and a mixer that
# places every sound so ITS OWN peak lands on its cue.
#
#   from audio import *                      (run your mix script from the engine folder, or add it to sys.path)
#   g = json.load(open('grid.json'))         # from grid.py: bpm, beat, peak, bars
#   m = Mix(36.0)
#   m.song('song.mp3', [(54.598, 0.0, 23.415), (85.818, 23.415, 12.585)])   # (song start, film start, length)
#   m.grid(peak=g['peak'])                   # cues on the grid get + peak; off-grid cues (grid=False) do not
#   m.put(PAL['ui']['click'](), 7.805, 0.3)
#   m.fade_out(34.9, 1.1); m.write('build/mix.wav')
#
# The palette is a direction choice. 'ui' is the Cheerful sound; pick another, mix them, or load samples.
import json, subprocess, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR
att = lambda t, a=0.0015: np.clip(t / a, 0, 1)

def bandnoise(d, lo, hi):
    n = len(T(d)); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)

def partials(f, ratios, amps, taus, d):
    t = T(d); return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau) for r, a, tau in zip(ratios, amps, taus)) * att(t, 0.0005)

# ---------- ui: crisp interface sounds ----------
def click(f=3400, down=True):
    t = T(0.03)
    y = 0.6 * bandnoise(0.03, 2500, 9000) * np.exp(-t / 0.0014) + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.0045) * att(t, 0.0004)
    return y + 0.5 * np.sin(2 * np.pi * (180 if down else 240) * t) * np.exp(-t / 0.008) * att(t, 0.001)
def tick(f=2600, tau=0.005): t = T(0.04); return np.sin(2 * np.pi * f * t) * np.exp(-t / tau) * att(t, 0.0005)
def key(heavy=False):
    t = T(0.06)
    return 0.7 * bandnoise(0.06, 1500, 6000) * np.exp(-t / 0.0022) + 0.8 * np.sin(2 * np.pi * (380 if heavy else 520) * t) * np.exp(-t / (0.016 if heavy else 0.01)) * att(t, 0.0008)
def note(f, d=0.9, tau=0.32):
    t = T(d)
    y = np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.12) + 0.06 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.06)
    return y * np.exp(-t / tau) * att(t, 0.003)
def chime(freqs, gap=0.05):
    out = np.zeros(int((0.9 + gap * len(freqs)) * SR))
    for i, f in enumerate(freqs): y = note(f) * (0.85 ** i); s = int(i * gap * SR); out[s:s + len(y)] += y
    return out
def thump(f0=150, f1=78, d=0.12):
    t = T(d); ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR; return np.sin(ph) * np.exp(-t / 0.035) * att(t, 0.002)
def whoosh(d=0.22, lo=500, hi=4000): t = T(d); return bandnoise(d, lo, hi) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
def blip(f0=800, f1=1250, d=0.07):
    t = T(d); ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR; return np.sin(ph) * np.exp(-t / 0.018) * att(t, 0.002)
def riser(d, lo=400, hi=7000):
    t = T(d); n = len(t); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); y = np.zeros(n); sg = 16; L = n // sg
    for k in range(sg):
        c = lo * (hi / lo) ** (k / (sg - 1)); Xk = X.copy(); Xk[(f < c * 0.6) | (f > c * 1.6)] = 0
        y[k * L:(k + 1) * L] = np.fft.irfft(Xk, n)[k * L:(k + 1) * L]
    return y / (np.abs(y).max() + 1e-9) * (t / d) ** 2.2

# ---------- foley: physical, tactile ----------
def paper(d=0.35):                     # a sheet sliding: grainy band noise with an uneven envelope
    t = T(d); grain = np.abs(np.convolve(rng.standard_normal(len(t)), np.ones(240) / 240, 'same')); grain /= grain.max()
    return bandnoise(d, 1800, 9000) * (0.4 + 0.6 * grain) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7
def stamp():                           # rubber stamp: body thud, a short slap of noise, a little room
    t = T(0.3)
    return 0.9 * np.sin(2 * np.pi * (90 + 60 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.05) * att(t, 0.001) + \
           0.5 * bandnoise(0.3, 400, 3500) * np.exp(-t / 0.012) + 0.08 * bandnoise(0.3, 200, 2000) * np.exp(-t / 0.09)
def wood(f=720):  return partials(f, [1, 2.76, 5.4], [1, 0.4, 0.15], [0.03, 0.012, 0.006], 0.15)
def glass(f=2100): return partials(f, [1, 2.32, 4.25, 6.63], [1, 0.5, 0.25, 0.12], [0.6, 0.3, 0.15, 0.08], 1.2)
def metal(f=340):  return partials(f, [1, 1.47, 2.09, 2.56, 3.9, 5.2], [1, 0.8, 0.6, 0.5, 0.3, 0.2], [1.2, 0.9, 0.7, 0.5, 0.3, 0.2], 1.6)
def snap_shut():                       # a case or a book closing
    t = T(0.12); return np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.02) * att(t, 0.001) + 0.6 * bandnoise(0.12, 1000, 6000) * np.exp(-t / 0.004)

# ---------- analog: synth voices ----------
def pluck(f=440, d=0.6):               # Karplus-Strong string
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n): y[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return y
def saw_stab(f=220, d=0.4, cutoff=2400):
    t = T(d); y = 2 * ((f * t) % 1) - 1; X = np.fft.rfft(y); fr = np.fft.rfftfreq(len(y), 1 / SR)
    X *= 1 / (1 + (fr / cutoff) ** 4); return np.fft.irfft(X, len(y)) * np.exp(-t / 0.12) * att(t, 0.003)
def sub_drop(f0=110, f1=38, d=0.7):
    t = T(d); ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, len(t))) / SR; return np.sin(ph) * np.exp(-t / 0.3) * att(t, 0.004)

# ---------- samples (CC0 or licensed; check each file) ----------
def sample(path, start=0.0, dur=None):
    a = ['ffmpeg', '-v', 'quiet', '-ss', str(start)] + (['-t', str(dur)] if dur else []) + ['-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).astype(np.float64)

PAL = {
    'ui': dict(click=click, tick=tick, key=key, note=note, chime=chime, thump=thump, whoosh=whoosh, blip=blip, riser=riser),
    'foley': dict(paper=paper, stamp=stamp, wood=wood, glass=glass, metal=metal, shut=snap_shut, whoosh=whoosh),
    'analog': dict(pluck=pluck, stab=saw_stab, sub=sub_drop, blip=blip, riser=riser),
}
def pentatonic(root_hz, minor=True, octaves=2):
    steps = [0, 3, 5, 7, 10] if minor else [0, 2, 4, 7, 9]
    return [root_hz * 2 ** (o + s / 12) for o in range(octaves) for s in steps]

# ---------- mixer ----------
class Mix:
    def __init__(self, dur):
        self.dur = dur; self.N = int(dur * SR); self.music = np.zeros((self.N, 2)); self.sfx = np.zeros(self.N + 3 * SR); self.peak = 0.0
    def song(self, path, windows, xfade=0.02):
        """windows: [(song_start, film_start, length)]. Cut on bar lines (grid.py bars); joins get an equal-power crossfade."""
        for k, (s0, f0, L) in enumerate(windows):
            pre = xfade if k else 0.0
            raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-ss', str(max(0, s0 - pre - 1.0)), '-t', str(L + pre + 2.0), '-i', path,
                                  '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
            x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
            lead = int(round((min(1.0, s0 - pre)) * SR)); x = x[lead:lead + int((L + pre) * SR)]
            a = int((f0 - pre) * SR)
            if pre:
                n = int(pre * SR); w = np.linspace(0, 1, n)[:, None]
                self.music[a:a + n] *= np.cos(w * np.pi / 2); x[:n] *= np.sin(w * np.pi / 2)
                self.music[a:a + len(x)] += x[:self.N - a]
            else: self.music[a:a + len(x)] = x[:self.N - a]
        return self
    def grid(self, peak): self.peak = peak; return self
    def put(self, y, t, gain=1.0, grid=True, pan=0.0):
        y = np.asarray(y, float) * gain; pk = int(np.argmax(np.abs(y[:int(0.25 * SR)])))
        s = int(round((t + (self.peak if grid else 0)) * SR)) - pk
        if s < 0: y = y[-s:]; s = 0
        self.sfx[s:s + len(y)] += y[:len(self.sfx) - s]; return self
    def fade_out(self, t0, d):
        tt = np.arange(self.N) / SR; env = np.ones(self.N); m = tt > t0
        env[m] = np.cos(np.clip((tt[m] - t0) / d, 0, 1) * np.pi / 2) ** 1.5; self.music *= env[:, None]; return self
    def write(self, path, music=0.5, sfx=0.62, target_lufs=-15.0, ceiling_db=-1.0):
        mix = self.music * music + self.sfx[:self.N, None] * sfx
        def lufs(x):
            tmp = path + '.probe.wav'; _wav(tmp, x)
            r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
            subprocess.run(['rm', '-f', tmp]); import re
            return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
        g = 0.9 / (np.abs(mix).max() + 1e-9); l, p = lufs(mix * g)
        g *= 10 ** (min(target_lufs - l, ceiling_db - p) / 20)       # one static gain: as loud as the target allows
        _wav(path, mix * g); l, p = lufs(mix * g)
        print(f'{path}: {l} LUFS, true peak {p} dBTP' + ('' if l >= target_lufs - 1 else f' (held back by the {ceiling_db} dB ceiling)'))
        return self
    def audibility(self, cues, music=0.5, sfx=0.62, margin_db=-3.0):
        """Is each SFX buried? Compares SFX and music power in the bands where that SFX has its energy,
        over 60 ms around its peak. A rough stand-in for listening: the draft with sound is the real check."""
        quiet = []
        for t in cues:
            i = int((t + self.peak) * SR); a, b = max(0, i - int(0.03 * SR)), i + int(0.03 * SR)
            Sx = np.abs(np.fft.rfft(self.sfx[a:b] * sfx)) ** 2; Mx = np.abs(np.fft.rfft(self.music[a:b].mean(1) * music)) ** 2
            if Sx.max() <= 0: continue
            m = Sx > 0.1 * Sx.max(); r = 10 * np.log10(Sx[m].sum() / (Mx[m].sum() + 1e-12))
            if r < margin_db: quiet.append((round(float(t), 3), round(float(r), 1)))
        print(f'possibly masked (cue s, SFX vs music dB in its own band): {quiet[:20]}' if quiet else 'every SFX stands out in its own band')
        return quiet

def _wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

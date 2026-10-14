# grid.py: the beat grid of a song, measured, plus its energy arc (build, drop, outro).
#
#   python3 engine/grid.py song.mp3 [--json grid.json]     one song, in detail
#   python3 engine/grid.py --scan a.mp3 b.mp3 ...           many songs: tempo + energy arc per bar, to shortlist
#
# Returns BPM, the first downbeat, bar times, and PEAK: how long after each beat the kick actually peaks.
# Place every sound so its own peak lands on beat + PEAK. PEAK is measured from the waveform against the same
# beat times, so the two can't drift apart (a half-STFT-window mix-up once put every sound 22 ms early).
import sys, json, subprocess
import numpy as np

SR, HOP, N = 22050, 128, 1024
FPS = SR / HOP

def load(path, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def spec(x):
    fr = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP] * np.hanning(N)
    return np.abs(np.fft.rfft(fr, axis=1)), np.fft.rfftfreq(N, 1 / SR)

def ftime(i):   # time of STFT frame i, at its centre
    return (i * HOP + N / 2) / SR

def analyse(x, lo=70, hi=180):
    S, f = spec(x)
    kb = (f >= 30) & (f < 150)
    L = np.log1p(100 * S[:, kb])
    flux = np.r_[0, np.maximum(0, np.diff(L, axis=0)).sum(1)]       # kick onsets
    # coarse tempo: autocorrelation of onset flux; then a fine comb over tempo and phase
    ac = np.correlate(flux - flux.mean(), flux - flux.mean(), 'full')[len(flux) - 1:]
    lags = np.arange(len(ac)); bpms = 60 * FPS / np.maximum(lags, 1)
    m = (bpms >= lo) & (bpms <= hi)
    coarse = bpms[m][np.argmax(ac[m])]
    best = None
    for bpm in np.arange(coarse - 1.0, coarse + 1.0, 0.002):
        P = 60 / bpm * FPS; k = np.arange(int((len(flux) - 1) / P) - 1)
        for ph in np.arange(0, P, 0.5):
            s = flux[(ph + k * P).astype(int)].sum()
            if best is None or s > best[0]: best = (s, bpm, ph)
    _, bpm, ph = best
    T = 60 / bpm
    b0 = ftime(ph)                                                   # flux frame centre ~ onset
    while b0 - T >= 0: b0 -= T
    beats = b0 + np.arange(int((len(x) / SR - b0) / T)) * T
    # downbeat: the beat-in-bar with the most spectral change into it (bars start new chords, crashes, fills)
    E = np.log1p(np.array([S[int(t * FPS):max(int(t * FPS) + 1, int((t + T) * FPS))].mean(0) for t in beats]))
    nov = np.r_[0, np.linalg.norm(np.diff(E, axis=0), axis=1)]
    off = int(np.argmax([nov[o::4].mean() for o in range(4)]))
    bars = beats[off::4]
    # where the kick actually peaks after each beat, from the waveform: low-pass < 150 Hz, 2 ms envelope.
    # Measured against the same beat times it is applied to, so beat + peak is the audible kick peak.
    X = np.fft.rfft(x); fx = np.fft.rfftfreq(len(x), 1 / SR); X[fx > 150] = 0
    lowp = np.convolve(np.abs(np.fft.irfft(X, len(x))), np.ones(44) / 44, 'same')
    # average the envelope over every beat, then read the onset and the peak off that one shape: robust to
    # beats where a bass note, not the kick, is the loudest low thing
    i0s = [int((t - 0.03) * SR) for t in beats if (t - 0.03) * SR >= 0 and (t + 0.15) * SR < len(lowp)]
    L = int(0.18 * SR); avg = np.mean([lowp[i:i + L] for i in i0s], axis=0)
    ip = int(np.argmax(avg)); io = int(np.nonzero(avg[:ip + 1] > 0.15 * avg[ip])[0][0])
    shift = io / SR - 0.03                                           # snap the grid to the kick onset
    beats = beats + shift; bars = bars + shift; b0 += shift
    peak = (ip - io) / SR
    env = S[:, kb].sum(1)
    # energy arc per bar: loudness and kick presence
    rms = np.array([np.sqrt(np.mean(x[int(a * SR):int((a + 4 * T) * SR)] ** 2)) for a in bars[:-1]])
    kick = np.array([env[int(a * FPS):int((a + 4 * T) * FPS)].mean() for a in bars[:-1]])
    return dict(bpm=round(float(bpm), 3), beat=T, first_beat=round(float(b0), 4), first_downbeat=round(float(bars[0]), 4),
                peak=round(peak, 4), bars=[round(float(b), 4) for b in bars], rms=rms, kick=kick)

def arc(r):
    blocks = ' ▁▂▃▄▅▆▇█'
    q = lambda v: ''.join(blocks[min(8, int(u * 8.99))] for u in v / (v.max() + 1e-9))
    lift = (r['rms'][2:] / r['rms'].max() - np.array([r['rms'][i:i + 2].mean() for i in range(len(r['rms']) - 2)]) / r['rms'].max()) + \
           (r['kick'][2:] / r['kick'].max() - np.array([r['kick'][i:i + 2].mean() for i in range(len(r['kick']) - 2)]) / r['kick'].max())
    drops = [int(i) + 2 for i in np.argsort(-lift)[:3]]
    return q(r['rms']), q(r['kick']), drops

if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--scan':
        for p in a[1:]:
            r = analyse(load(p)); lo, kk, drops = arc(r)
            print(f"{p}  {r['bpm']} BPM  {len(r['bars'])} bars")
            print(f"  loud {lo}\n  kick {kk}\n  drop candidates (bar, s): {[(d, round(r['bars'][d], 2)) for d in drops]}")
        sys.exit(0)
    r = analyse(load(a[0])); lo, kk, drops = arc(r)
    print(json.dumps({k: v for k, v in r.items() if k not in ('bars', 'rms', 'kick')}, indent=1))
    print(f"loud {lo}\nkick {kk}\ndrop candidates (bar, s): {[(d, r['bars'][d]) for d in drops]}")
    if '--json' in a:
        out = {k: v for k, v in r.items() if k not in ('rms', 'kick')}; out['drops'] = drops
        json.dump(out, open(a[a.index('--json') + 1], 'w'), indent=1)

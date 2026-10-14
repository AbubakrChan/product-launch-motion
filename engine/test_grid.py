# test_grid.py: grid.py on a synthetic song with a known tempo, phase, downbeat and kick peak.  python3 engine/test_grid.py
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import grid
SR = grid.SR
def song(bpm, start, bars=24, seed=1):
    T = 60 / bpm; n = int((start + bars * 4 * T + 2) * SR); x = np.zeros(n); rng = np.random.default_rng(seed)
    t = np.arange(int(0.25 * SR)) / SR
    kick = np.sin(2 * np.pi * (55 + 90 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.07) * np.clip(t / 0.001, 0, 1)
    hat = rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.008)
    chords = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [247, 311, 370]]
    true_peaks = []
    K = np.fft.rfft(np.r_[kick, np.zeros(SR)]); K[np.fft.rfftfreq(len(kick) + SR, 1 / SR) > 150] = 0   # same definition grid.py uses
    KPEAK = np.argmax(np.convolve(np.abs(np.fft.irfft(K, len(kick) + SR)), np.ones(44) / 44, 'same')) / SR
    for k in range(bars * 4):
        b = start + k * T; i = int(b * SR)
        x[i:i + len(kick)] += 0.8 * kick; true_peaks.append(b + KPEAK)
        j = int((b + T / 2) * SR); x[j:j + len(hat)] += 0.08 * hat
        if k % 4 == 0:                                   # a new chord every bar: the downbeat
            L = int(4 * T * SR); tt = np.arange(L) / SR; seg = sum(np.sin(2 * np.pi * f * tt) for f in chords[(k // 4) % 4])
            x[i:i + L] += 0.06 * seg[:len(x) - i] * np.exp(-tt / 1.5)[:len(x) - i]
    return x.astype(np.float32), np.array(true_peaks)
fails = 0
for bpm, start in [(124.0, 0.37), (98.5, 1.13), (140.0, 0.05)]:
    x, peaks = song(bpm, start)
    r = grid.analyse(x)
    err_bpm = abs(r['bpm'] - bpm)
    down = r['first_downbeat']; T = 60 / bpm
    bar_err = min(abs(((down - start) / (4 * T)) % 1), 1 - abs(((down - start) / (4 * T)) % 1)) * 4 * T
    k = np.round((np.array(r['bars'][:8]) - start) / T).astype(int)
    pk_err = np.abs(np.array(r['bars'][:8]) + r['peak'] - peaks[k]).max()
    ok = err_bpm < 0.05 and bar_err < 0.004 and pk_err < 0.003
    fails += not ok
    print(f"{'ok  ' if ok else 'FAIL'} {bpm} BPM start {start}: got {r['bpm']} BPM, downbeat vs kick onset {bar_err * 1000:.1f} ms, beat+peak off by {pk_err * 1000:.1f} ms")
sys.exit(1 if fails else 0)

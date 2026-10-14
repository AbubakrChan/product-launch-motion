# verify.py <film.mp4> [--storyboard out.jpg] [--holds 26.2-28.5,33-36]: check the delivered file, not the page.
#   - storyboard: one frame per second
#   - glitches: a lone frame that differs from both neighbours while they agree (bad capture, chunk seam)
#   - motion: frozen stretches (> 0.4 s with no visible change, unless declared with --holds), quiet
#     stretches (barely moving for 1 s+, reported only), pops (dead still, then a jump),
#     strobes (a big jump every frame while the image keeps flicking between states)
#   - loudness: integrated LUFS and true peak
# Exit code 1 if anything needs a look. Holds you meant (a designed pause) go in --holds.
import sys, subprocess, json, re
import numpy as np
from PIL import Image, ImageDraw
mp4 = sys.argv[1]
args = dict(zip(sys.argv[2::2], sys.argv[3::2]))
W, H = 192, 108
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'json', mp4], capture_output=True).stdout)
num, den = map(int, probe['streams'][0]['r_frame_rate'].split('/')); fps = num / den
raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', mp4, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean((1, 2))          # motion between frame i and i+1
t = (np.arange(len(d)) + 1) / fps
issues = []
print(f'{mp4}: {len(fr)} frames, {len(fr) / fps:.2f} s at {fps:g} fps')

odd = [i for i in range(1, len(fr) - 1) if np.abs(fr[i] - fr[i - 1]).mean() > 3 and np.abs(fr[i] - fr[i + 1]).mean() > 3 and np.abs(fr[i + 1] - fr[i - 1]).mean() < 1.0]
if odd: issues.append(f'glitch frames at {[round(i / fps, 3) for i in odd[:12]]} s')

allowed = [tuple(map(float, r.split('-'))) for r in args.get('--holds', '').split(',') if r]
ok = lambda a, b: any(a >= x - 0.05 and b <= y + 0.05 for x, y in allowed)
chg = (np.abs(np.diff(fr, axis=0)) > 1.5).mean((1, 2))   # share of pixels that visibly change
still = chg < 0.002; s = None; holds = []
for i, v in enumerate(list(still) + [False]):
    if v and s is None: s = i
    if not v and s is not None:
        if (i - s) / fps >= 0.4 and not ok(t[s], t[i - 1]): holds.append((round(float(t[s]), 2), round(float(t[i - 1]), 2)))
        s = None
if holds: issues.append(f'frozen (no visible change): {holds}, {sum(b - a for a, b in holds):.1f} s total')
quiet = []; s = None                                    # barely moving for a second or more: fine if designed
for i, v in enumerate(list(d < 0.15) + [False]):
    if v and s is None: s = i
    if not v and s is not None:
        if (i - s) / fps >= 1.0 and not ok(t[s], t[i - 1]): quiet.append((round(float(t[s]), 2), round(float(t[i - 1]), 2)))
        s = None
if quiet: print(f'quiet stretches (barely moving, fine if designed): {quiet}, {sum(b - a for a, b in quiet):.1f} s')

pops = []                                              # dead still to a big jump within 2 frames
for i in range(2, len(d) - 2):
    if d[i] > 3 and d[i - 2] < 0.2 and (not pops or t[i] - pops[-1] > 0.1): pops.append(round(float(t[i]), 2))
if pops: issues.append(f'pops (dead still, then a big jump within 2 frames): {pops[:16]}: give hits anticipation and a settle')

e = (d - np.convolve(d, np.ones(9) / 9, 'same'))        # frame-to-frame flicker on fast moves
strobe = [round(float(t[i]), 2) for i in range(4, len(d) - 4) if d[i] > 6 and abs(e[i]) > 3 and np.sign(e[i]) != np.sign(e[i + 1])]
if len(strobe) > 2: issues.append(f'possible strobing at {strobe[:10]}: more subframes on fast moves, or slow them')

per_s = [round(float(d[int(k * fps):int((k + 1) * fps)].mean()), 1) for k in range(int(len(d) / fps))]
print('motion per second:', per_s)

r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); p = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
if m:
    lufs, tp = float(m[-1]), float(p[-1]); print(f'loudness {lufs} LUFS, true peak {tp} dBTP')
    if not -18 <= lufs <= -12: issues.append(f'loudness {lufs} LUFS: aim for about -16 to -14')
    if tp > -0.5: issues.append(f'true peak {tp} dBTP: keep it under -0.5')
else: print('no audio stream')

sb = args.get('--storyboard')
if sb:
    raw2 = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', mp4, '-vf', 'fps=1,scale=384:216', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    st = np.frombuffer(raw2, np.uint8).reshape(-1, 216, 384, 3); cols = 6; rows = (len(st) + cols - 1) // cols
    S = Image.new('RGB', (cols * 384, rows * 216), 'white'); D = ImageDraw.Draw(S)
    for i, f in enumerate(st):
        x, y = (i % cols) * 384, (i // cols) * 216; S.paste(Image.fromarray(f), (x, y)); D.rectangle([x, y, x + 34, y + 16], fill=(20, 20, 20)); D.text((x + 4, y + 2), f'{i}s', fill='white')
    S.save(sb, quality=85); print('storyboard', sb)

print('\n'.join(['NEEDS A LOOK:'] + ['  - ' + i for i in issues]) if issues else 'clean')
sys.exit(1 if issues else 0)

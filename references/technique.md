# Technique: how the films are built

Reference implementation: `~/code/cheerful-motion/launch2/` (`index.html`, `film.js`,
`audio.py`, `events.mjs`, `render.mjs`, `render_chunks.sh`, `snap.mjs`). Shared SFX synth:
`~/code/cheerful-motion/audio.py`. Beat analysis: `~/code/cheerful-motion/song/tempo.py`, `grid.py`.
Contact sheets: `~/code/cheerful-motion/sheet.py <dir> <out.png> <cols> <w> [h]`.
Serve locally for Playwright: `python3 -m http.server 8765 --bind 127.0.0.1` from `~/code/cheerful-motion`.

## Pure time

Every frame is `seek(t)`. Layers: `#bg` (brand bloom), `#thr` (canvas: cursor
trail), `#world` (camera-transformed scene), `#hud` (screen-space overlays, cursors, wordmark).
Camera: `#world { transform: translate(960px,540px) scale(z) translate(-cx,-cy) }` with x, y and
**log-zoom** on springs (zooming linearly in z feels wrong).

## Springs

```js
function stepR(tau, {w, z}) {            // closed-form damped step response, 0 -> 1
  if (tau <= 0) return 0;
  if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
class Track {                            // many target changes = sum of one spring per change
  constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
  to(t, v, sp) { if (v !== this.cur) { this.ev.push([t, v - this.cur, sp]); this.cur = v; } return this; }
  at(t) { let v = this.v0; for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp); return v; }
}
```
Damping 0.72–0.9 for a tiny overshoot, 1.0 for camera and text. A target that must *arrive* at T is
issued ~0.3 s early (depends on w). For looping films, sum the k = -1, -2 periods too (ΣΔ = 0).

## Content swap with blur

```js
function vis(t, tin, tout, dOut = 0.12) {   // enter on a spring, exit short and early
  const e = stepR(t - tin, {w: 26, z: 1}), x = tout == null ? 0 : clamp((t - tout) / dOut), xo = x * x;
  return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 10, dy: (1 - e) * 16 - xo * 10, e };
}
```
Apply opacity, `filter: blur(b)` and a translateY. Morph containers (`cardAt(e, x, y, w, h, s, r, v, q)`)
spring their width/height/radius; their children get their own `vis` windows.

## Edge-split stretch (toggle knob, tab indicator)

Leading edge on a stiff spring, trailing edge on a soft one; width = R − L.
```js
T.tgL = new Track(4).to(TOG, 44, {w: 19, z: 0.9});   // trailing
T.tgR = new Track(44).to(TOG, 84, {w: 34, z: 0.9});  // leading
```

## Cursor

- Agent cursor: gradient arrow + gradient name pill ("Cheerful"), world-space Tracks AX/AY.
  Lean = clamp(−vx·0.0045, ±14°); pill trails by −v·0.012 px (clamped); press scale
  `1 − 0.16·exp(−((t−tc)/0.045)²)`; ripple ring 0.4 s; born with a scale spring at the drop.
- Trail: sample the cursor's screen position at t − k·9 ms (k ≤ 22) — pure, because position is a
  function of t — draw tapered gradient segments, alpha ∝ (speed − 500)/2500.
- Writing: cursor targets follow the end of streamed words (`offsetLeft/Top` measured at build).
- The human cursor ("You" pill) does the typing/clicking in the intro; handoff at the drop.

## Odometer (real numbers)

Per-digit strips 0–9,0 in slots sized to each final glyph (`clip-path: inset(0 -80px)`, clip
vertically only). Digit p: `floor(v/10^p) % 10 + max(0, (v % 10^p) − (10^p − 1))` so a digit only moves
while the one below carries; ease v with outQ to the exact integer. Leading slots fade/scale in as
log10(v) crosses p; gradient text continuous across slots via background-size/position.

## Audio

- numpy: spectral flux + autocorrelation for tempo, kick-band onsets and peaks for the grid;
  estimate key (chroma) so tonal SFX sit in key (pentatonic of the key).
- Song window chosen so the drop lands on the film's big beat; start 3 ms before a bar's kick onset.
- `cue(g) = g · PERIOD/0.5 + PEAK_OFF` maps film time to the measured kick-peak time (drift included);
  `put()` shifts every sound so **its own peak** lands on the cue.
- Cues are exported from the film itself (`M.cues` → `events.mjs` → `events.json`) — one source of truth.
- Synth: click (press/release pair), tick, key, note, chime, thump, whoosh, band noise, blip, shimmer,
  riser, tape. Pen/drag sounds follow the measured speed of the element.
- Mix: song·0.5 + sfx·0.62, one static gain to 0.93 peak (no limiter — keeps loops seamless).
  Measure with `ffmpeg -af ebur128=peak=true` (≈ −15 LUFS, < −0.5 dBTP).

## Render

- Playwright Chromium headless, 1920×1080 (or square), 4 subframes per frame centred on the frame
  time: `subT(i) = floor(i/4)/60 + ((i%4) − 1.5)/240`.
- `ffmpeg -framerate 240 -i s%05d.png -vf "tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\,4)\,3)',setpts=N/(60*TB),scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" -r 60 -c:v libx264 -preset slow -crf 15 -tune film` + BT.709 tags.
- Chunked (`render_chunks.sh`): 960 subframes → segment → delete PNGs → concat with `-c copy` → mux AAC.
- Resilience: retry a subframe with a fresh page; relaunch the browser if disconnected; restart it if
  the page never becomes READY; `process.exit(0)` at the end (close() can hang after a crash). 3 workers.

## QA

- Snapshot `snap.mjs <dir> t1 t2 …`; one frame per beat (t = k·0.5 + 0.12) as a contact sheet;
  transitions at ±0.1 s; full-res looks at text-heavy frames.
- After the render: 1-per-second storyboard from the MP4, and a frame-difference scan (big jumps
  should only be intended hits) to catch chunk seams and crashed-retry frames.

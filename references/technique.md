# Technique: how the films are built

The engine in `engine/` implements everything below; `engine/README.md` has the commands. Your film is
an `index.html` that loads `engine/core.js` and your `film.js`, which defines
`FILM = { dur, fonts, build(), seek(t) }` and calls `boot(FILM)`. `engine/example/` is a 4-second film
that shows the API (not a look).

## Pure time

Every frame is `seek(t)`. A common layer stack (use what the direction needs): `#bg` (the ground),
canvases for trails or fields, `#world` (camera-transformed scene), `#hud` (screen-space overlays).
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
issued `lead(sp)` seconds early (`core.js`). For looping films, sum the k = -1, -2 periods too (ΣΔ = 0).

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

- `engine/grid.py song.mp3`: BPM, first downbeat, bar times and the kick PEAK offset, measured from the
  waveform against the same beat times it is applied to; `--scan *.mp3` prints each song's energy arc
  per bar with drop candidates, to shortlist songs fast. Tested on synthetic songs (`engine/test_grid.py`).
- Estimate the key (chroma) so tonal SFX sit in key (`pentatonic(root)` in `audio.py`).
- Song window: cut on bar lines, 3 ms before the kick onset; the drop lands on the film's big beat.
- `Mix.put(sound, cue)` shifts every sound so **its own peak** lands on cue + PEAK.
- Cues come from the film itself: `cue(t, kind, value)` in `build()`, exported with `engine/cues.mjs`.
- Palettes in `audio.py`: `ui` (click, tick, key, chime, whoosh: the Cheerful sound), `foley` (paper,
  stamp, wood, glass, metal), `analog` (pluck, saw stab, sub drop), plus `sample()` for CC0 or licensed
  files. The direction picks the palette. Pen and drag sounds follow the measured speed of the element.
- `Mix.write()` applies one static gain to about -15 LUFS under a -1 dBTP ceiling (no limiter, so loops
  stay seamless). `Mix.audibility(cues)` flags SFX buried under the music in their own band.

## Render

- `engine/render.mjs <url>`: 1920x1080, 4 subframes per frame centred on the frame time
  (`subT(i) = floor(i/4)/60 + ((i%4) - 1.5)/240`), blended with ffmpeg `tmix`, 60 fps H.264, BT.709.
- `--draft`: 30 fps, 1 subframe, JPEG, encoded at 540p: 8x fewer captures, for review with sound.
- Chunks of 4 s: capture, encode in the background while the next chunk captures, delete the frames.
  Frames live in `*.render.noindex` (macOS Spotlight indexing them once doubled a render).
- Re-runs keep every segment whose 16 sample frames still match the current code, so a fix re-renders
  only the chunks it touched. `--force` re-renders everything.
- Every page has the HTTP cache disabled: a cached `film.js` once rendered a whole film from old code.
- `--cdp http://127.0.0.1:9222` attaches to a Chrome you already run (pages open in background windows
  and only those are closed); without it, a headless Chromium is launched.
- Retries a failed capture on a fresh page. Fast whips can still strobe with 4 subframes: `verify.py`
  flags them; slow the move or raise `--sub`.

## QA

- `engine/preflight.sh`: tools, disk and browser, before any code.
- `engine/snap.mjs <url> <dir> --beat <s> --beats 0:72`: one frame per beat; `sheet.py` makes the
  contact sheet. Check transitions at ±0.1 s and full-size looks at text-heavy frames.
- `engine/pure.mjs <url>`: every frame must be a pure function of `t`; run before the final render.
- `engine/verify.py film.mp4 --storyboard sb.jpg [--holds a-b,...]`: on the delivered file. It reports
  glitch frames, holds with no motion, pops (dead still, then a jump), strobing and loudness. Declare
  designed pauses with `--holds`.

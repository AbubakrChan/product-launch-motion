# 01 · The renderer contract

How an HTML file becomes a deterministic video file, what the DOM has to say for that to
work, and which rules survive a move to another renderer. The plumbing here is HyperFrames;
the laws are not — anything that seeks a timeline and screenshots the result obeys the same
physics. A Remotion translation is at the bottom.

## The mental model

A composition is an HTML file whose **DOM declares timing**. The renderer does not play it:
it sets the playhead to a time, waits for layout, screenshots the viewport, moves the
playhead, screenshots again. Frame 300 of a 30 fps render is whatever the page looks like at
t = 10.000s, arrived at cold. Three consequences follow, and every rule below is one:

1. **Nothing runs on a wall clock.** No `requestAnimationFrame` loop, no `setTimeout`, no
   CSS transition. Those advance by elapsed real time, which the renderer never spends.
2. **Frames can be sampled out of order, or in parallel.** Anything that accumulates state
   ("this is the 4th call, so advance one character") desyncs.
3. **Frame N must be a pure function of N.** If it is not, your render is a lottery — it
   will differ between machines, between runs, and between preview and delivery.

## The structural contract

### Root — one per file, carrying frame size and render length

The assembled film's own root is the same shape with `data-composition-id="main"`.

```html
<div id="root" data-composition-id="09-proof"
     data-width="1920" data-height="1080" data-duration="4.5">
```

| Attribute | On | Means |
|---|---|---|
| `data-composition-id` | root | Identity. Must equal the `window.__timelines` key, and — for a sub-composition — the host slot's id, exactly, with no `-host`/`-slot` suffix |
| `data-width` / `data-height` | root | Pixel frame size |
| `data-duration` | root | Render length. Read once, before scripts run; a script that rewrites it later is ignored |
| `class="clip"` | timed child | Marks the element as framework-timed. The framework owns its visibility — never animate it yourself |
| `data-start` | clip | Seconds from the start of *this* composition |
| `data-duration` | clip | Seconds. Re-read from the live DOM, unlike the root's |
| `data-track-index` | clip | Temporal lane (see *Tracks*) |
| `data-volume` | `<audio>` / `<video>` | 0–1 |

A sub-composition wraps its root in `<template>`; the top-level `index.html` must **not**. The
runtime clones only the template's contents, so put `<style>` and `<script>` inside it — a
sub-composition's `<head>` is discarded.

### One paused timeline per composition

```js
window.__timelines = window.__timelines || {};
var tl = gsap.timeline({ paused: true });
// … tweens, each positioned with an absolute time argument …
window.__timelines["09-proof"] = tl;
```

Build it **synchronously at page load** — not in a promise, an event handler, or after a
`fetch`. The renderer can sample before an async build finishes and will happily screenshot
an empty frame. Never call `tl.play()`: playing is a preview convenience, not the output.

### Media is discovered by `id`

```html
<audio id="sfx-f04-click-12" class="clip" src="audio/sfx/click.mp3"
       data-start="10.490" data-duration="0.360" data-track-index="912" data-volume="0.45"></audio>
```

The renderer finds `<audio>` / `<video>` by id and mixes them into the output, so **an
`<audio>` element without an `id` renders silent, with no error and no warning** — and the
preview plays it correctly, so you only find out in the delivered file. Every generator that
emits audio must mint an id (`sfx-<frame>-<name>-<nn>` is enough).

## Determinism: the bans and what to use instead

| Banned | Why it breaks | Use instead |
|---|---|---|
| `Math.random()` | A different value on every seek; the same element lands somewhere new each frame | Derive from the element's index |
| `Date.now()`, `performance.now()`, `new Date()` | Render-time clock; unrelated to the playhead | Read the playhead |
| CSS `transition` | Advances on elapsed real time, which the renderer never spends | A tween on the timeline |
| CSS `@keyframes` with `animation-iteration-count: infinite` | No finite length for the renderer to infer | Finite count, or a tween |
| `repeat: -1`, `yoyo` on a loop | Unbounded; the phase at time T is undefined | A finite `repeat`, computed with `floor` — or just hold still |
| Hover / scroll / focus state | The renderer dispatches no input events | Static state, or a tween |
| Fetching an asset at render time | Frame 0 can land before the response arrives | Inline or vendor it |
| Two timelines tweening one property | GSAP's overwrite order can flip between runs | One owner per property |

### Index-derived scatter

Anything that should look random is a function of the element's index. This depth-scatter
flies seven chips in from a sphere, byte-identical on every render:

```js
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const scatter = chips.map(function (el, i) {
  const a = i * GOLDEN;                       // golden angle — even, non-obvious spacing
  const depthT = n > 1 ? i / (n - 1) : 0;     // stepped depth, near → far
  return {
    x: Math.cos(a) * RADIUS,  y: Math.sin(a) * RADIUS * Y_SQUASH,
    z: Z_NEAR - depthT * (Z_NEAR - Z_FAR),
    rotationX: Math.sin(a) * TUMBLE,  rotationY: Math.cos(a) * TUMBLE,
  };
});
```

### Playhead-derived noise

Film grain has to move or it reads as a dirty lens. Seed it from the playhead, re-seeded at
a *low* rate:

```js
var clock = { t: 0 }, lastSeed = -1;
tl.to(clock, {
  t: TOTAL, duration: TOTAL, ease: "none",
  onUpdate: function () {
    var seed = Math.floor(clock.t * 12) % 12;   // pure function of the playhead
    if (seed !== lastSeed) { lastSeed = seed; turb.setAttribute("seed", String(seed)); }
  },
}, 0);
```

The `* 12` is measured, not stylistic. Re-seeding **every** frame reads as electronic sizzle
rather than film, and it destroys inter-frame compression: the reference film's 30 Hz grain
encoded to **85 MB against ~9 MB ungrained**. Real 24 fps grain is also held across more than
one frame. See `references/06-look-and-grade.md`.

### The proxy-object tween — counters, typewriters, anything discrete

The canonical pattern for state that is not a CSS property. Tween a plain object, `snap` it
to integers, write the DOM in `onUpdate`. The written value is a function of timeline time
only, so a reverse seek reproduces it exactly.

```js
// count-up: 0 → 400, snapped, settled before the next spoken word
var COUNT = { v: 0 };
tl.to(COUNT, {
  v: 400, duration: 0.72, ease: "power2.out", snap: { v: 1 },
  onUpdate: function () { numEl.textContent = Math.round(COUNT.v); },
}, 1.73);

// typewriter: one tween on a snapped index; slice(0, i) is a pure function of driver time
var typer = { i: 0 };
tl.to(typer, {
  i: QUERY.length, duration: 0.71, ease: "none", snap: { i: 1 },
  onUpdate: function () { textEl.textContent = QUERY.slice(0, Math.round(typer.i)); },
}, 0.29);
```

Give a rolling numeral `font-variant-numeric: tabular-nums` or it reflows as it counts, and
grow it with `transform: scale`, never `font-size`.

## Tracks and layering

`data-track-index` is a **temporal lane, not a z-order**. Two clips on the same track must
not overlap in time; the linter fails if they do. Visual stacking is CSS `z-index`. That is
why an assembled film alternates frames between two tracks: a 0.5s cross-dissolve needs the
outgoing and incoming frame alive at once, which is illegal on one track.

Give each kind of clip its own band of indices so a new cue can never collide with an
existing one. The reference film uses 0–1 for frame hosts (alternating), 10 for narration,
900 for the music bed, 910+ for one SFX cue each, 985/990 for a root-level canvas layer and
the grade. The numbers are arbitrary; the separation is not.

**The consequence that costs you a day:** each `.clip` composites as its own layer, so a
`mix-blend-mode` in an overlay clip has **no frame content as its backdrop** — it blends
against transparency and paints its own source colour. A `multiply` vignette over nothing
rendered an entire film as a white wash on the first attempt. Grade layers use plain alpha;
full treatment in `references/06-look-and-grade.md`.

## Build order and idempotent injection

**The index is generated**, so anything hand-added to it is destroyed on the next assemble.
Every wiring step is therefore a script that injects a *marked* block and replaces its own
previous output:

```js
const MARK_OPEN = "<!-- wire-grade:start -->";
const MARK_CLOSE = "<!-- wire-grade:end -->";

let html = readFileSync(INDEX, "utf8");
html = html.replace(new RegExp(`\\n?[ \\t]*${MARK_OPEN}[\\s\\S]*?${MARK_CLOSE}`, "g"), "");
// … build `block`, wrapped in the two markers …
const anchor = html.lastIndexOf("</body>");
writeFileSync(INDEX, html.slice(0, anchor) + block + "\n  " + html.slice(anchor));
```

An injector that needs film-time positions reads them off the assembled DOM rather than
trusting a config — the frame wrappers are the source of truth for both frame starts and
total length:

```js
let total = 0;
for (const m of html.matchAll(/data-composition-src="compositions\/frames\/[^"]+\.html"[^>]*>/g)) {
  const start = Number(m[0].match(/data-start="([\d.]+)"/)?.[1] ?? NaN);
  const dur   = Number(m[0].match(/data-duration="([\d.]+)"/)?.[1] ?? NaN);
  if (Number.isFinite(start) && Number.isFinite(dur)) total = Math.max(total, start + dur);
}
if (!total) throw new Error("no frame wrappers found — assemble first");
```

**After any re-assemble, re-run the entire chain, in order.** Each step depends on the one
before it: SFX cues resolve against frame starts that exist only *after* transitions are
injected, and the grade's span is the total those wrappers imply.

```bash
node scripts/assemble.mjs        # writes index.html from film.json + the measured VO
node scripts/transitions.mjs     # the crossings; shifts nothing else
node scripts/wire-audio.mjs      # music bed + word-locked SFX, resolved against real frame starts
node scripts/wire-grade.mjs      # grain + vignette + specular sweeps, spanning the real total
```

## Frame durations come from the voiceover

Never estimate a frame length. Render the narration first, measure it, derive the frame from
it — `references/03-word-locked-sync.md` covers why this ordering is not optional. The
relationship has two parts:

- **`hold` = the measured VO length + a pad.** The pad — ~0.25s — is the breath after the
  last word. Without it the cut lands on the final syllable and the shot reads as rushed
  even when every tween inside it was right. Raise it on a beat you want to land.
- **The next frame starts at `hold`**, not when the clip ends.
- **A frame's `data-duration` = `hold` + the outgoing transition's duration.** That second
  surplus is the overlap the dissolve or zoom-through lives in.

Example, from the reference film: frame 08's VO file measures 5.968s; a 0.332s pad makes
its hold 6.3; a 0.5s dissolve makes its `data-duration` 6.8 against a `data-start` of 24.6;
and frame 09 starts at 30.9 — exactly where the dissolve tween is injected.

`scripts/assemble.mjs` does all of this from `film.json`, calling `ffprobe` for the measured
length, so the only numbers you ever type are the pad and the transition duration — the two
that are actually creative decisions.

For a separate reason, a frame's own timeline should also finish **before** its
`data-duration` runs out, so the shot lands and holds instead of cutting mid-move: in the
proof frame the last cued tween ends at ~3.32s inside a 4.5s clip; the rest is deliberate
stillness (law 7).

## On another renderer

### Remotion

The determinism law is identical and Remotion makes it the default mental model rather than
a rule you must not break. What changes is the plumbing.

| HyperFrames | Remotion |
|---|---|
| Renderer seeks `window.__timelines[id]` | `useCurrentFrame()` inside the component |
| `.clip` + `data-start` / `data-duration` | `<Sequence from={…} durationInFrames={…}>` |
| Root `data-duration` / `data-width` / `data-height` | `<Composition durationInFrames fps width height>` |
| GSAP eases, `back.out` to fake a settle | `spring({ frame, fps, config })` — real damped physics |
| Hand-rolled CSS/SVG grain, vignette, sweeps | `<HtmlInCanvas>` → a WebGL fragment shader over live DOM |
| `<audio id>` clips discovered by id | `<Audio src>` inside a `<Sequence>` |

**Ports cleanly:** the storyboard, the word-locked cue times, the palette and type, and every
determinism rule — no `Math.random`, no `Date.now`, index-derived scatter, frame-seeded grain.

**Does not port:** the timeline itself. Per-element React composition replaces one global
timeline, so a 40s+ multi-scene film means re-solving audio and word-sync in a different
shape. What you gain, measured: `spring()` produces a true damped oscillation — a mark ring
went **95 → 107px peak → 91px undershoot → 95px settle**, which `back.out` only approximates
— and the shader route buys bright-pass bloom, radial chromatic aberration and grain in ~40
lines over live DOM. What it costs: `<HtmlInCanvas>` needs Chrome 149+ with
`canvas-draw-element`, WebGL needs `--gl=angle`, and grain is expensive in H.264 either way
(that proof clip: **30 MB** raw, **9.1 MB** after the same `-crf 19 -tune film` master, 204
frames at 1920×1080). Verdict from the bake-off: keep the seek-based host for the long film,
reach for Remotion for a hero title beat wanting a GPU post pass or a real spring.

### The other runtimes

**Lottie** is worth mounting for vector stroke draw-on and for moving a gradient along a
path, which CSS cannot do cleanly. One trap, found live: an animated **multi-dimensional
layer transform silently blanks the whole layer** in `lottie-web` — it plays in preview and
renders empty. Keep layer transforms static and drive motion from GSAP on the container.
Cue by shifting keyframe times, not by the layer's start-time field, which also blanks it.

**Rive**'s runtime is genuinely seek-deterministic — 150 frames rendered twice produced 150
identical md5s — but **authoring is GUI-only**. A `.riv` is a compiled binary, and the one
programmatic generator available produced files that render blank or crash the WASM: an
agent cannot author one. Mount and seek a human-authored file, or skip it — Rive's real
differentiators (state machines, data binding) are interactivity primitives a linear film
never uses.

**Three.js** is the only route to a real camera and real lights without a GPU renderer:
actual perspective, image-based reflections, specular that slides across a surface as the
camera moves. Drive it from the same one paused timeline (`tl.time(t)` → apply → render) and
it stays deterministic. One rule: **tone-map before bloom** — an `UnrealBloomPass` over a
near-white product screenshot blows out to an unreadable white cloud, and a tone-mapped
screen plus a tight, low-strength halo is the fix. Spend it on one hero or lockup shot, not
on flat UI-tour frames.

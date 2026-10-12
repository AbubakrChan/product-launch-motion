# Motion Grammar

Law 7: **nothing ends moving.** Every frame lands and holds. Motion is cued to meaning; when
the meaning is delivered, the motion stops.

This file covers what happens on the element between the cue and the hold. Cue *times* come
from the transcript (`references/03-word-locked-sync.md`); camera and cursor are
`references/05-camera-3d-cursor.md`. Examples are labelled from one reference film — a 44.2s
B2B SaaS launch, 11 frames — and every number was measured off that build. The grammar is
product-agnostic; the numbers are a working start, not a constant.

## Contents

1. [The two failure modes](#1--the-two-failure-modes)
2. [Entrances](#2--entrances)
3. [The easing table](#3--the-easing-table)
4. [Stagger](#4--stagger)
5. [Anticipation and speed ramping](#5--anticipation-and-speed-ramping)
6. [Holds and rhythm](#6--holds-and-rhythm)
7. [Kinetic type](#7--kinetic-type)
8. [Counters and typewriters](#8--counters-and-typewriters)
9. [Deterministic "life" without loops](#9--deterministic-life-without-loops)
10. [Exits and cuts](#10--exits-and-cuts)

## 1 · The two failure modes

Every rule below exists to avoid one of two nameable defects.

**Slideshow — dump-then-freeze.** Everything arrives at once, then nothing happens for three
seconds. Symptoms: one `stagger` at t=0 and no other tween; a timeline finished by 15% of the
frame's duration; reveals cued to the frame start instead of to words. Cure: cue each piece to
the word that earns it, weight arrivals to the back half, give the shot more than one event.

**Screensaver — everything drifting independently, forever.** Six elements on six slow loops,
none finishing, the frame still moving when it cuts. Symptoms: `repeat: -1`, `yoyo`, breathing
pulses, a camera push that never resolves, "ambient" float. Cure: bound every move, let at most
one element carry residual life, end the last tween before the last frame.

They are opposites and it is easy to fix one into the other. The target is between: several
cued events, each of which *completes*, then a still read.

## 2 · Entrances

**`fromTo`, never `to`.** A deterministic renderer seeks to time T and samples; it does not play
from 0. A bare `to` reads the element's *current* state as the tween's start — under a seek,
whatever the DOM happens to hold. `fromTo` pins both ends, so frame T is reproducible from
frame T alone.

```js
tl.fromTo(
  "#f01-headline",
  { opacity: 0, y: 28 },
  { opacity: 1, y: 0, duration: 0.30, ease: "power3.out" },
  0.11, // "Find"@0.11 — the word this line illustrates
);
```

**0.24–0.38s.** Under 0.24 the eye registers a pop, not a move; over ~0.4 the element is still
travelling when the next word arrives. In the reference film effectively every entrance sits in
that band: 0.26 for a card, 0.28–0.30 for a line of type, 0.34–0.36 for a large object, 0.22 for
a hairline drawing itself.

**Opacity plus a small translate, never opacity alone.** A pure cross-fade has no direction, so
it reads as a slideshow dissolve. Pair it with 10–28px of travel that means something: `y: 28`
for a line rising into place, `x: -12` for a label arriving from its own margin, `x: -64` for a
message from the far side of a thread. Scale (0.86–0.99 for objects) is a legitimate third
channel; scale alone reads as a zoom, not an arrival.

**Overshoot is rationed.** `back.out(...)` overshoots and pulls back — physical, playful,
consumer-advert — and it competes with the voice on every reveal. A B2B film with bouncy
entrances reads as a consumer sting. In the reference film `power3.out` outnumbers all
`back.out` variants ~6:1, and every `back.out` is one of three things: a cursor press recovering
from compression (`back.out(2)`, 0.08s); a state flip or confirmation — check, unread dot,
status badge (`back.out(2.2)`, 0.26–0.30s); or one unit of punctuation on a hero beat, e.g. the
`×` after a headline figure (`back.out(1.4)`, 0.30s).

## 3 · The easing table

`power3.out` is the house default: fast commit, long tail, no bounce. Everything else is a
deviation you should be able to justify.

| Job | Ease | What it communicates |
|---|---|---|
| Entrance (default) | `power3.out` | Decisive arrival, long settle — it has landed |
| Secondary entrance | `power2.out` | Same gesture, softer; must not outrank the hero |
| Exit / dismissal | `power2.in` | Leaving — accelerates away instead of easing in |
| Camera, long travel, parallax | `power1.inOut` / `power2.inOut` | A body with mass; soft at both ends |
| State flip / confirmation | `back.out(1.4–2.4)` | A mechanism engaging — the one sanctioned bounce |
| Count-up | `power2.out` | Magnitude reads early, then resolves onto the value |
| Cross-fade of two states | `power2.in` out → `power2.out` in, sequential | A hand-off, not a dissolve |
| Arrival with motion-blur streak | `expo.out` | Extreme deceleration; it was moving fast off-screen |
| Discrete drivers (typewriter, blink, count) | `none` | It's a clock; easing a clock looks broken |
| Bounded sine "life" | `none` on the phase | The shape lives in `Math.sin`, not the ease |

**Sequential, not overlapped, for a text swap** — fade the old out on `power2.in` and start the
new *after* it ends, or the cell double-prints for a few frames (reference film: outgoing 0.16s
from 1.60, incoming at 1.76). `sine.inOut` appears twice in the whole film; any "breathing"
belongs in §9.

## 4 · Stagger

The offset is the entire effect, and the useful range is small.

| Content | Offset | Reads as |
|---|---|---|
| Sub-elements of one object (icon, label, meta) | 0.02 | One arrival, slightly deepened |
| Cells in a row, cite items, chips | 0.03–0.04 | One gesture with internal texture |
| List rows, chips resolving in sequence | 0.05–0.06 | A waterfall — you can count the items |
| Items you *want* counted | 0.10–0.15 | Discrete events; 2–4 items on a slow line only |

Below 0.02 the offset is invisible — use one tween. Above ~0.06 with more than four items the
last lands after the voice has moved on: the stagger has become a waterfall that outruns the
narration. Check that `offset × (n − 1) + duration` finishes before the next word cue. Six rows
at 0.06 with a 0.26s entrance is 0.56s of arrival; if the next clause is 0.4s away, drop to 0.03
or split the group across two cues.

**Stagger in reading order** — left-to-right for a row, top-to-bottom for a list, outside-in for
a closing crowd. When the group is an attribution, match the words: the reference film's cite
row (face · name · hairline · logo) runs a 0.04 stagger positioned so the *face* lands on
"person" and the *logo* on the brand name. For groups whose items are individually word-cued,
skip `stagger` and place each tween by hand — a stagger in the eye, a cue table on the page:

```js
const LAND = [1.21, 1.35, 1.44, 1.73, 1.82, 2.04]; // measured word starts
LAND.forEach((t, j) => {
  tl.to(`#f07-card-${j}`, { opacity: 1, y: 0, duration: 0.26, ease: "power3.out" }, t);
});
```

## 5 · Anticipation and speed ramping

**Anticipation** is a small move *against* the direction of travel just before a committed move
— the difference between a cursor that slides and one that decides. Keep it tiny: 8px, 0.05s.

```js
// f06 — pointer commits to a target
tl.to("#f06-cursor", { x: -112, y: 146, duration: 0.05, ease: "power1.out" }, 1.32); // pull back
tl.to("#f06-cursor", { x: 0, duration: 0.20, ease: "power2.inOut" }, 1.38);
tl.to("#f06-cursor", { y: 0, duration: 0.24, ease: "power1.inOut" }, 1.38);
```

Two details are load-bearing. **x and y run on different eases and durations**, so the path
*bows* instead of sliding along a ruler line — straight-line pointer travel is the clearest tell
of a fake cursor. And travel starts at 1.38, not 1.37: an exact butt-join against the
anticipation reads as an overlap to a tween linter, and a one-frame gap costs nothing. Use
anticipation only on committed moves — pointer to control, card docking, panel leaving. Never on
text; a line that flinches before it rises is a distraction.

**Speed ramping** is the same idea over distance: an `inOut` ease so a long move is soft at both
ends and fastest in the middle. Camera moves, a crowd closing inward, a determinate fill, a wipe
crossing the canvas — all `power1.inOut` or `power2.inOut`. `power3.out` on a 1.3s move
front-loads the speed then crawls: right for an entrance, wrong for a traverse. A long move must
also *end*, and anything riding on it should decay to zero rather than be cut off (§9).

## 6 · Holds and rhythm

**Every frame lands and holds.** Write the lock into the file as a contract —
`// 2.95 → 3.123 — locked still.` — and verify the largest `position + duration` in the timeline
is comfortably under the frame's `data-duration`. A frame still resolving at its boundary cuts
mid-tween: the screensaver failure at the seam.

**Allocate breather frames deliberately.** The reference film designates two frames as held by
allocation — one restrained move, then a still read — either side of the busiest stretch and
before the close. The stillness is the payload: it is only calm because its neighbours are not.
Nine equally busy frames have no dynamics. The same applies within a beat: leave near-silence in
front of a hero hit, because the tail hold of the preceding frame is what gives the reveal
somewhere to land.

**Pace is a director's note, not a constant.** The reference film's v2 cut ran 40.3s, every
reveal word-locked, every frame technically correct — and it was *too fast*. The v3 pass did one
thing: extended every frame to run past its narration so hero frames could breathe, taking it to
44.2s. Nothing about the motion changed; the film got ~4 seconds of nothing and got better.
Budget holds when you set durations, and expect to lengthen them after the first cut.

## 7 · Kinetic type

Reveal a paragraph at once and it is a slide; reveal it letter by letter and it outruns the
voice. Reveal it **line by line, cued to words**.

```js
const ENTER = 0.30;   // duration
const ENTER_Y = 28;   // px it rises
const DIM = 0.30;     // opacity a spent line falls back to
const SHIFT = 10;     // px older lines nudge up per new arrival

function enterLine(el, t) {
  tl.fromTo(el, { opacity: 0, y: ENTER_Y },
                { opacity: 1, y: 0, duration: ENTER, ease: "power3.out" }, t);
}
enterLine("#f01-l1", 0.11); // "Find"@0.11
enterLine("#f01-l2", 1.16); // "Email"@1.16
```

Two refinements make that read as writing rather than a list: **demote the spent line** to ~0.30
opacity and nudge the stack up ~10px per arrival, so accumulation is the visual argument; and
**break the final line into word-level micro-hits** when the narration does — three words, three
cues (2.74 / 3.04 / 3.38), same 0.30s entrance each.

Three other type entrances, each with a cost. **Mask reveal from the baseline** —
`overflow: hidden` on the line, tween the inner span from `y: 100%`; reads as type written onto
the surface, costs a wrapper per line, so title card not eight rows. **Blur-in** — ramp a blur to
0 alongside the translate through a proxy object with an `onUpdate` writer (an SVG
`stdDeviation`, or a filter string), seeding frame 0 by calling the writer once at setup; the
reference film ramps 16px of lateral blur to 0 over 0.5s on `expo.out`, exactly once in the film.
**Tracking-in** — start wide, close to the design letter-spacing; good on one short headline,
unreadable on body copy, and it reflows the box every frame, so never combine it with anything
measuring that box. **The emphasis word carries the accent**: one word per headline, swept across
the glyphs on that word's cue (0.30s, `power2.out`).

### The underline trap

An underline or marker strike must sit **below** the word, hugging it — not across it, not past
it. Two independent bugs live here.

*Overshoot.* If the box is `left: 0; right: 0` on the line, or the path can exceed its viewBox,
the stroke shoots past the word. Bound the box to the word (`left − 6px`, `width + 16px`) and
give the path `pathLength="100"` inside a viewBox it cannot exceed, so its rightmost point is
mathematically inside the box.

*The scaled-ancestor measurement bug.* Measure with **layout metrics** (`offsetWidth` /
`offsetLeft` / `offsetTop` / `offsetHeight`), never `getBoundingClientRect()`. Client rects are
transform-inclusive: if the word sits under a camera node the drift writer scales, a late re-fit
(on `document.fonts.ready`) divides by the camera scale and inflates the box — reintroducing the
overshoot, and only sometimes, since it depends on when fonts resolve relative to the camera's
scale at that instant. Layout metrics are immune to ancestor transforms.

```js
// f02 — underline hugs BELOW the word, immune to the camera's scale
function fitUnderline() {
  const w = markText.offsetWidth;
  if (!w) return;                                 // font not ready — keep the CSS fallback
  underline.style.right = "auto";
  underline.style.left = markText.offsetLeft - 6 + "px";
  underline.style.width = w + 16 + "px";
  underline.style.marginTop = "0px";
  // tuck the wave just under the descenders
  underline.style.top = markText.offsetTop + markText.offsetHeight - 3 + "px";
}
fitUnderline();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitUnderline);
```

The emphasis span must be a tight `inline-block` with `white-space: nowrap` and no stray
whitespace text nodes, or its box is wider than the word and the underline hugs the whitespace.
Keep the static CSS geometry as a fallback for when the measurement no-ops, and draw the stroke
with `strokeDashoffset` on the spoken cue.

## 8 · Counters and typewriters

Both are the same pattern: **tween a proxy object, write the DOM in `onUpdate`.** The displayed
value becomes a pure function of timeline time, so a seek to any frame reproduces it exactly.

```js
// f09 — count 0 → 400, snapped to integers
const COUNT = { v: 0 };
let numEl = null;
tl.to(COUNT, {
  v: 400,
  duration: 0.72,
  ease: "power2.out",
  snap: { v: 1 },
  onUpdate() {
    numEl = numEl || document.querySelector("#f09-num");
    if (numEl) numEl.textContent = Math.round(COUNT.v);
  },
}, 1.73);

// grow the numeral on transform, never font-size — starting 0.04s earlier, so it is already
// growing when the digits move: one gesture, not two.
tl.fromTo("#f09-num", { scale: 0.82 }, { scale: 1, duration: 0.72, ease: "power2.out" }, 1.69);
```

**`snap` matters** — without it the proxy carries a float and the label flickers through
sub-pixel values that never render identically at the frame boundary.

**`tabular-nums` on anything whose digits change.** Proportional numerals have different widths,
so a count-up reflows its own box nearly every frame and visibly jitters;
`font-variant-numeric: tabular-nums` (plus `font-feature-settings: "tnum" 1` for stubborn faces)
fixes the width. A `font-size` tween would relayout every frame and drag its neighbours — scale
is compositor-only.

**Start the count on the word that names it, and finish before the next word.** Reference film:
0 → 400 starts on "gifted"@1.69 and settles by ~2.45, ahead of "creators"@2.52, so the number is
*still* when the voice says what it counts. A count spinning under its own label reads as a
loading spinner.

**A typewriter is a snapped index over `slice`** — a pure function of driver time, so
reverse-seek safety is free:

```js
// f04 — the query types itself in
const QUERY = "Find me lifestyle creators who post Reels and have an email";
const typer = { i: 0 };
tl.to(typer, {
  i: QUERY.length,
  duration: 0.71,
  ease: "none",            // a clock, not a gesture
  snap: { i: 1 },
  onUpdate: () => { textEl.textContent = QUERY.slice(0, Math.round(typer.i)); },
}, 0.29);
```

## 9 · Deterministic "life" without loops

`repeat`, `yoyo`, `repeat: -1` and CSS `animation` are banned by
`references/01-renderer-contract.md` — the renderer seeks frame-by-frame and a loop has no
defined state at an arbitrary time. But zero residual motion through a 1.5s hold can look dead.
Use a **bounded sine driver**: tween a phase once over a fixed window and derive the value from
`Math.sin`. It returns to rest by construction, leaves no residual, and is a pure function of
time.

```js
// f07 — six pills pulse ONCE as the count lands; ends by 2.95
const pulse = { p: 0 };
tl.to(pulse, {
  p: Math.PI,                                    // half a cycle: 0 → 1 → 0
  duration: 0.18,
  ease: "none",
  onUpdate() {
    const s = 1 + 0.09 * Math.sin(pulse.p);      // 1 → 1.09 → 1, no residual
    for (const el of pills) if (el) gsap.set(el, { scale: s });
  },
}, 2.77);
```

`Math.PI` gives out-and-back (a pulse); `Math.PI * 2` gives out-back-under-and-back (a settle) —
the reference film uses that shape for a ±1.5px vertical settle on a hero numeral over 0.84s. A
caret blink is a square wave off the same driver:

```js
// f06 — 1.6 cycles across the typing window, then hard off
const blink = { p: 0 };
tl.to(blink, {
  p: Math.PI * 2 * 1.6,
  duration: 0.9,
  ease: "none",
  onUpdate() { caretEl.style.opacity = Math.sin(blink.p) > 0 ? "1" : "0"; },
}, 0.24);
tl.set("#f06-caret", { opacity: 0 }, 1.16);      // typing done — the caret leaves
```

**Envelope any idle that runs into a hold** so the cut doesn't chop it:

```js
// full amplitude for the first 76%, ramped to 0 over the last 24%
const t = phase.p / (Math.PI * 2 * CYCLES);
const env = t < 1 - FADE_FRAC ? 1 : Math.max(0, (1 - t) / FADE_FRAC);
const s = Math.sin(phase.p) * env;
```

Same trick for camera drift: tween a separate amplitude scalar to 0 before the lock and compose
it inside the single writer that owns that node's transform (one writer per transformed node —
`references/05-camera-3d-cursor.md`). **Ration it:** during a hold at most *one* element may
still be alive, and it should be the hero. Two independently breathing objects is the screensaver.

## 10 · Exits and cuts

**Usually, do not exit anything — cut.** A fade-out before the cut spends 0.2–0.3s saying nothing
and leaves the frame emptying at the boundary. Let the shot hold on its final composition; in the
reference film the great majority of elements have no exit tween at all. Exit only when the
departure *is* the content: a figure docking to a corner to make room for the next (0.34s,
`power3.out`), panels clearing so a lockup can draw on, a wipe sweeping a register away (0.32s,
`power2.inOut`), scaffolding retiring once the thing it supported has landed (0.24s,
`power2.out`). Leaving takes `power2.in`; relocating takes `power3.out`, because a relocation is
an entrance at a new address.

**Velocity-matched cuts vs slideshow cuts.** A slideshow cut is two frames that both start from
rest: everything stops, then everything starts. A velocity-matched cut carries direction across
the seam — the outgoing frame's last movement and the incoming frame's first share an axis and a
rough speed, so the eye tracks through. If a frame ends with a strip sliding left, open the next
with its hero entering from the right on that axis; if the register flips, carry it with a
push-through rather than a dissolve. Word-level swaps inside a frame follow the same rule. This
does not contradict Law 7: the frame is still, and the match is between the *direction* of the
last event and the first event of the next shot, not a tween literally crossing the boundary.

**Check that nothing is mid-tween at a boundary.** Three cheap passes: compare the largest
`position + duration` against the frame's `data-duration` and leave at least ~0.15s; write the
lock as a comment so the next editor knows the contract exists; and in the *delivered file*,
extract the last frame of each shot and the first of the next — a half-faded element, a partly
drawn rule, or a numeral mid-count means the shot is still moving when it cuts
(`references/08-qa-and-direction.md` has the extraction commands).

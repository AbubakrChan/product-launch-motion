# Camera, 3D and the cursor

Owns Law 4 (one camera, two nodes) and Law 5 (the cursor is a stage prop).

This is the single biggest difference between a film that reads as motion design and one
that reads as a web page with fades on it. A flat surface that fades in is a slide. The
same surface, turned slightly in space, with a camera that commits to the thing being
demonstrated, is a shot.

## Contents

- [The two-node rig](#the-two-node-rig)
- [The turn](#the-turn-whole-shot-rotation)
- [The dolly](#the-dolly-mid-shot-scale)
- [The fixed-point trick](#the-fixed-point-trick)
- [Depth without a 3D engine](#depth-without-a-3d-engine)
- [Rack focus](#rack-focus)
- [Parallax](#parallax)
- [The cursor](#the-cursor)
- [The click stack](#the-click-stack)
- [Travel](#travel)
- [Budgeting the move](#budgeting-the-move-against-the-canvas)

## The two-node rig

**Never put a whole-shot rotation and a mid-shot scale on the same element.** They are two
tweens writing the same transform matrix over an overlapping window; the second one to
update wins each frame and the move judders or snaps.

Split them. Outer node owns the dolly, inner node owns the turn:

```html
<!-- outer: the dolly. Its transform-origin is the control the camera pushes toward. -->
<div class="clip cam" id="f06-cam">
  <!-- inner: the 3D turn. Perspective and rotation only. -->
  <div class="stage" id="f06-stage">
    <!-- the card, ALL its content, the cursor and its ripples — everything the
         camera moves lives in here, in stage-local coordinates -->
  </div>
</div>
```

```css
.cam, .stage { position: absolute; left: 0; top: 0; width: 1400px; height: 700px; }
.cam         { left: 260px; top: 148px; }
.stage       { transform-style: preserve-3d; }   /* lets children carry real z */
```

The other half of the rule: **everything the camera moves must be inside the rig.** If the
card is in the rig and its contents are canvas-space siblings, they cannot move as one
object — you will be re-deriving coordinates for every element on every camera move, and
the cursor will drift off its target. Convert the whole shot to rig-local coordinates once
(subtract the rig's origin from every `left`/`top`) and the problem disappears for good.

## The turn (whole-shot rotation)

One slow rotation across the entire shot. The surface starts angled away and squares up as
the shot resolves — the viewer reads it as a camera settling, not as an object spinning.

```js
gsap.set(stage, { transformPerspective: 2600, transformOrigin: "50% 52%" });
tl.fromTo(
  stage,
  { rotationY: -7.2, rotationX: 2.1 },
  { rotationY: -1.3, rotationX: 0.5, duration: DUR, ease: "power1.inOut" },
  0,
);
```

Guide values that read as a camera rather than a gimmick:

| Parameter | Range | Note |
|---|---|---|
| `transformPerspective` | 2200–2800 | Lower is a wider lens and distorts the far edge; higher flattens the effect away |
| `rotationY` start | −6° to −10° | Negative brings the left edge toward the viewer |
| `rotationY` end | −1° to −2° | Never resolve to exactly 0 — a hair of angle keeps the depth |
| `rotationX` | 2° → 0.5° | Small. Vertical tilt reads as a mistake much faster than horizontal |
| `ease` | `power1.inOut` | The move should have no visible start or stop |

Never fully square up and never keep turning past the end of the shot. Both break Law 7.

## The dolly (mid-shot scale)

The push exists to make a point: the shot's payload in its back half is often one small
control, and at full width it is rendered at the same scale as everything else. Push in for
that beat and release afterwards.

```js
gsap.set(cam, { transformOrigin: "89.8% 85.7%" });   // the Accept button's own centre
tl.to(cam, { scale: 1.12, duration: 0.36, ease: "power2.inOut" }, 2.46);
tl.to(cam, { scale: 1,    duration: 0.36, ease: "power2.inOut" }, 3.34);
```

Sequence it around the action, not on top of it: settle the push **before** the cursor
arrives, hold it dead still through the click, and start the release only after the state
has resolved. A camera that is still moving during a click steals the click.

## The fixed-point trick

Under a scale about origin `O`, a point `P` maps to `O + (P − O)·s`. Set `O` **exactly** to
the centre of the control being clicked, and that control becomes a fixed point of the
transform: it does not move at all while everything else grows around it.

This is worth doing every time, for one practical reason: any cursor, ripple or hotspot
coordinate you have already computed stays correct through the entire push. No compensating
maths, no re-timing, no drift. It also happens to be the most natural-looking push, because
the eye is already on that control.

Example, in a 1344×744 card whose top-left sits at (480, 128), pushing toward a pill whose
centre is at canvas (1660, 395):

```js
// (1660 − 480)/1344 = 87.8%   ·   (395 − 128)/744 = 35.9%
gsap.set(streak, { transformOrigin: "87.8% 35.9%" });
```

If the cursor lives outside the scaled node (acceptable when the node is a single card),
the fixed-point origin is what keeps the two in register. If the cursor lives inside the
rig, alignment is automatic and the origin is purely an aesthetic choice.

## Depth without a 3D engine

With `transform-style: preserve-3d` on the stage, children can carry real z. A few
pixels is enough to make the surface stop reading as paint on a flat sheet:

```js
gsap.set(["#f06-reply", "#f06-reply-text"], { z: 16 });
gsap.set(["#f06-terms", "#f06-terms-btn"],  { z: 22 });
gsap.set("#f06-row-0",                      { z: 12 });
```

These are static. The turn supplies the motion; the z values supply the parallax that makes
the turn legible. Put the elements the story touches — the thing being clicked, the thing
that changes state — on the near plane, and leave chrome on the base plane.

## Rack focus

When the camera commits to one region, take the other region out of focus. This is depth
cueing, and it also stops a stat that already paid off from competing with the live beat.

```js
tl.to(statPlane, { filter: "blur(2.6px)", opacity: 0.55, duration: 0.44, ease: "power2.inOut" }, 2.10);
tl.to(statPlane, { filter: "blur(0px)",   opacity: 1,    duration: 0.34, ease: "power2.inOut" }, 3.30);
```

Give the element an explicit `filter: blur(0px)` in CSS. Without a numeric start value the
tween interpolates from `none` and the first frame can jump.

## Parallax

Two planes drifting at different rates separate in depth. One slow move each, whole-shot,
in opposite directions — never per-element drift, which is the screensaver failure mode.

```js
tl.fromTo(nearPlane, { x: 12, scale: 0.992 }, { x: -6, scale: 1.006, duration: DUR, ease: "power1.inOut" }, 0);
tl.fromTo(farPlane,  { x: -7 },               { x: 5,               duration: DUR, ease: "power1.inOut" }, 0);
```

## The cursor

A fake cursor is how a UI demo becomes a demonstration rather than an exhibit. It is also
the element most often built too small, because the instinct is to draw it life-size.

**Draw it as a stage prop.** At 1920×1080 a true-to-life pointer is about 32px and vanishes
into any saturated control — in the reference film the first version read as a smudge on a
gradient button, invisible at a glance.

```css
#f06-cursor {
  position: absolute;
  left: 694px;              /* click point minus the tip offset ≈ (6, 3) */
  top: 457px;
  width: 44px;              /* not 32 — this is a prop, not a screenshot */
  height: 54px;
  opacity: 0;
  transform-origin: 14% 6%; /* the tip, so a press scales about the point it touches */
  pointer-events: none;
  z-index: 60;
  filter: drop-shadow(0 6px 16px rgba(16, 14, 25, 0.42));
}
```

```html
<svg viewBox="0 0 24 30" width="44" height="54">
  <path d="M3.4 1.6 L3.4 25.4 L9.7 19.4 L13.7 29.2 L17.9 27.3 L14 17.7 L21.9 17.1 Z"
        fill="#FFFFFF" stroke="rgba(16,14,25,0.8)" stroke-width="1.6" stroke-linejoin="round" />
</svg>
```

Rules that matter more than the exact numbers:

- **White fill, dark stroke, real shadow.** A dark-filled cursor disappears on dark UI; a
  thin-stroked white one disappears on a bright control. White fill with a heavy stroke and
  a drop shadow survives both.
- **One cursor design across the whole film.** Two different pointers in two shots reads as
  two different products.
- **Position by the tip.** Compute the element's `left`/`top` as *click point minus tip
  offset*, and keep that offset written down next to the CSS. Everything else — ripples,
  hotspots, zoom origins — is expressed in click-point coordinates.
- **Inside the rig.** See above. A cursor composited over a moving plane is a cursor that
  slides off its target.

## The click stack

A click is three layers on the same frame. Any one alone reads as a glitch; together they
read as an intention.

```js
function click(n, at) {
  const bloom = `#f06-bloom-${n}`;   // soft radial, 148px, brand-tinted
  const ring  = `#f06-ripple-${n}`;  // hard 2px ring, 104px

  // hover: the bloom LEADS the press by 0.1s — this is what makes the click
  // feel intentional instead of like a shape appearing
  tl.fromTo(bloom, { opacity: 0, scale: 0.3 },
                   { opacity: 1, scale: 0.62, duration: 0.12, ease: "power2.out" }, at - 0.1);
  // press + release
  tl.to("#f06-cursor", { scale: 0.86, duration: 0.06, ease: "power2.in"     }, at);
  tl.to("#f06-cursor", { scale: 1,    duration: 0.26, ease: "back.out(2.4)" }, at + 0.06);
  // feedback
  tl.to(bloom, { opacity: 0, scale: 1.15, duration: 0.34, ease: "power2.out" }, at);
  tl.fromTo(ring, { opacity: 0.75, scale: 0.34 },
                  { opacity: 0, scale: 1.5, duration: 0.42, ease: "power2.out",
                    immediateRender: false }, at);
}
```

Two details that are easy to get wrong:

- `immediateRender: false` on the ripple's `fromTo`. Without it GSAP applies the "from"
  state at build time and the ring is visible on frame 0 of the shot.
- **The control must react too.** A cursor pressing a button that does not move is uncanny.
  Depress the control 6% on the click frame and spring it back on `back.out(1.8)`; put a
  focus ring on a clicked row; flip the state label. The click is a cause; show the effect.

Size the feedback to the control. A 200px bloom over a 154px button reads as a halo, not a
click — 148px and 104px against that button was the version that worked.

## Travel

Straight-line cursor travel with one ease reads robotic. Two things fix it:

```js
// anticipation: a small pull-back before committing
tl.to("#f06-cursor", { x: -112, y: 146, duration: 0.05, ease: "power1.out" }, 1.32);
// bowed path: x and y on DIFFERENT eases and durations, so the path curves
tl.to("#f06-cursor", { x: 0, duration: 0.20, ease: "power2.inOut" }, 1.38);
tl.to("#f06-cursor", { y: 0, duration: 0.24, ease: "power1.inOut" }, 1.38);
```

Start the travel early enough that the *click* lands on its word — the eased move needs
0.2–0.3s and the distance between two controls cannot read in the 0.05s between two spoken
words. The word-locked beat is the click, not the departure.

Do not butt-join tweens on the same property: a move ending at exactly 1.38 and the next
starting at exactly 1.38 is reported as an overlap by tween linters and is genuinely
ambiguous at the frame boundary. Leave a 0.01s gap.

Finally: **fade the cursor out when its work is done.** A pointer parked on screen through
the final hold is the clearest possible signal that nobody watched the render.

## Budgeting the move against the canvas

Every camera move grows the frame's bounding box, and a launch film usually reserves the
bottom ~17% as a keep-out band (captions, lower thirds, platform chrome). Compute the
ceiling before choosing the scale rather than discovering it in a layout gate:

```
bottom_after = bottom + (bottom − origin_y) · (scale − 1)
```

Worked example: a card whose bottom is at y=872 with the origin at y=395 can take
`scale = 1.06` (→ 900) and no more before it crosses an 897px keep-out line. That is why
the reference film's search shot pushes 1.06 and its inbox shot — whose origin sits near
the bottom of the card — pushes 1.12. The number is arithmetic, not taste.

Run the same check on all four edges. A push that sends the left edge under a stat block
produces an overlap warning that is real: the two elements genuinely collide.

## Related

- `references/04-motion-grammar.md` — easing, holds, and the two failure modes
- `references/03-word-locked-sync.md` — cueing the click to its word
- `references/09-shot-catalog.md` — which shots want a camera and which want to be locked
- `references/10-traps.md` — the tween-overlap, blur-from-`none` and keep-out traps

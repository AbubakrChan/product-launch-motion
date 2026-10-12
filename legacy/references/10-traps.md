# The trap index

Every entry here cost real time to find, and every one is recorded with the measurement or
the symptom that proves it — not the hunch that suggested it. Read the relevant section
before debugging; most of these present as something else entirely.

If you find a new one, add it in this format. The standard is what makes the file useful.

## Contents

- [Compositing and the renderer](#compositing-and-the-renderer)
- [Layout and measurement](#layout-and-measurement)
- [Animation](#animation)
- [Camera](#camera)
- [Media and assets](#media-and-assets)
- [Audio](#audio)
- [Mastering](#mastering)
- [Other runtimes](#other-runtimes)
- [Process](#process)

---

## Compositing and the renderer

### 1 · A `mix-blend-mode` overlay renders the entire film white

**Symptom.** You add a `multiply` vignette or a blended grade layer. Every frame of the
render comes out as a near-white wash. It looked correct in the browser preview.

**Cause.** The renderer composites each timed track as its own layer. An overlay layer has
no frame content as its backdrop — it blends against transparency, and `multiply` against
nothing paints its own source colour.

**Fix.** Plain alpha compositing only, in any overlay pass. Move luminance into alpha (an
`feColorMatrix` on a noise plate) instead of reaching for a blend mode.

**Proof.** Removing every blend mode from the grade pass restored the film. See
`references/06-look-and-grade.md`.

### 2 · An `<audio>` element without an `id` renders silent

**Symptom.** Audio plays in preview; the rendered MP4 has no sound for that cue.

**Cause.** The renderer discovers media elements by `id`. No id, no discovery.

**Fix.** Give every media element an id. Generate them in your wiring script so it cannot
be forgotten.

### 3 · Hand-edits to a generated index vanish

**Symptom.** A block you added to `index.html` disappears after a rebuild, and the film
loses its audio or grade with no error.

**Cause.** The index is generated. Re-assembling overwrites it.

**Fix.** Never hand-edit the index. Write an idempotent injector that brackets its output
with `<!-- name:start -->` / `<!-- name:end -->` markers and strips its own previous block
on each run — then re-run the whole chain after any re-assemble.

### 4 · Root and clip durations disagree

**Symptom.** A frame goes blank shortly before its cut, or a transition overlaps nothing.

**Cause.** A frame's `#root` `data-duration` and its timed children's `data-duration` were
padded independently.

**Fix.** Set them from one value. When a padding script exists, confirm it rewrites the
root only and that the clips already match.

---

## Layout and measurement

### 5 · `getBoundingClientRect` lies under a scaled ancestor

**Symptom.** An underline, marker or connector is the wrong width or in the wrong place —
but only in some shots, or only after you added a camera move.

**Cause.** `getBoundingClientRect` returns post-transform geometry. If any ancestor is
scaled or rotated by the camera, the numbers are in a different space than the CSS you are
about to write.

**Fix.** Use layout metrics: `offsetWidth`, `offsetLeft`, `offsetTop`. They are
transform-immune.

```js
function fitUnderline() {
  const w = word.offsetWidth; if (!w) return;
  underline.style.left  = word.offsetLeft - 6 + "px";
  underline.style.width = w + 16 + "px";
  underline.style.top   = word.offsetTop + word.offsetHeight - 3 + "px";
}
```

### 6 · `object-position` does nothing on a matched aspect ratio

**Symptom.** You try to reframe a photo inside a circular avatar with
`object-fit: cover; object-position: 50% 38%` and nothing changes at any value.

**Cause.** `cover` only crops when the source and the box have different aspect ratios. A
square source in a square box is shown whole, so there is nothing to position.

**Fix.** Size the image larger than an `overflow: hidden` wrapper and offset it by hand.

```css
.avatar     { position: relative; width: 76px; height: 76px; border-radius: 50%; overflow: hidden; }
.avatar img { position: absolute; width: 137px; height: 137px; left: -35px; top: -10px; }
```

### 7 · A camera push shoves content into the keep-out band

**Symptom.** A layout gate reports an overflow, or the delivered film has a card edge under
the caption band, but only during the zoom.

**Cause.** Scale grows the bounding box away from the origin, and nobody did the arithmetic.

**Fix.** `bottom_after = bottom + (bottom − origin_y) · (scale − 1)`. Compute all four
edges before choosing the scale. A card whose bottom sits at 872 with an origin at 395 can
take 1.06 and no more against an 897px keep-out line.

### 8 · Orphaned DOM after an edit

**Symptom.** A stray label renders at the top-left corner of the canvas — the canvas
origin — and nothing in the code obviously produces it.

**Cause.** A structural edit closed at the wrong `</div>`, leaving old markup outside its
intended parent, which then falls back to absolute positioning at (0,0).

**Fix.** After any structural splice, grep for the old ids and confirm zero remain, then
look at a still. This one is invisible in code review and obvious in a screenshot.

---

## Animation

### 9 · Two tweens on one property judder

**Symptom.** A camera move stutters or snaps mid-shot.

**Cause.** A whole-shot rotation and a mid-shot scale on the same element, both writing the
same transform matrix over an overlapping window.

**Fix.** Two nodes: outer for scale, inner for rotation. See `references/05-camera-3d-cursor.md`.

### 10 · Butt-joined tweens are reported as overlapping

**Symptom.** `overlapping_gsap_tweens ... between 1.38s and 1.38s`.

**Cause.** One tween ends exactly where the next begins. Zero-length overlap, but genuinely
ambiguous at a frame boundary.

**Fix.** Leave a 0.01s gap.

### 11 · A `fromTo` shows its "from" state on frame 0

**Symptom.** A click ripple, flash or badge is visible at the start of the shot before its
cue.

**Cause.** GSAP applies a `fromTo`'s start values at build time.

**Fix.** `immediateRender: false` on any `fromTo` whose start state should not be visible
until its cue.

### 12 · A `filter` tween starts from `none`

**Symptom.** The first frame of a rack focus jumps.

**Cause.** GSAP has no numeric start value to interpolate from.

**Fix.** Declare `filter: blur(0px)` in the CSS so the start is numeric.

### 13 · State swaps double-print

**Symptom.** For a few frames, "Negotiating rate" and "Rate agreed" are superimposed, or a
button reads "AAccepptd".

**Cause.** The outgoing label's fade and the incoming label's fade overlap.

**Fix.** Sequential hand-off: start the incoming tween exactly where the outgoing one ends.
Mark the second element as intentionally occluding so the layout gate stays quiet.

### 14 · Anything still moving at a cut

**Symptom.** The film feels restless and cheap without an obvious cause.

**Fix.** Extract the last frame of every shot and confirm it is static. This is Law 7 and it
is the most common single defect in a first cut.

---

## Camera

### 15 · Changing `transformOrigin` mid-timeline jumps

**Symptom.** The shot snaps sideways at the moment the camera begins its push.

**Cause.** Changing the origin of an element that is currently scaled or translated
relocates it.

**Fix.** Set the origin at build time, or only at a moment when scale is exactly 1 and
translation is 0 — then the change is visually free.

### 16 · A cursor outside the camera rig drifts off its target

**Symptom.** The click lands next to the button instead of on it, and worse as the zoom
deepens.

**Cause.** The cursor is in canvas space; the control is on a plane the camera is moving.

**Fix.** Put the cursor inside the rig, or put the zoom origin exactly on the control so it
is a fixed point of the transform. Preferably both.

---

## Media and assets

### 17 · Duplicate media entries risk mis-discovery

**Symptom.** Lint reports `duplicate_media_discovery_risk`: two elements with identical
source, start and duration.

**Fix.** Give the second one its own file. A copy under a different name costs kilobytes
and removes the ambiguity — and usually reads better anyway (`people/founder.webp` beside
`posts/launch-01.webp` documents intent).

### 18 · A product photo carries text you did not intend to ship

**Symptom.** A thumbnail crop includes a "#1 doctor recommended" badge or a net-weight
line — numerals you never approved.

**Fix.** Crop deliberately with ffmpeg before using the asset, and look at the crop:

```bash
ffmpeg -i product.jpg -vf "crop=470:470:415:275" product-crop.jpg
```

### 19 · Network font URLs

**Symptom.** A render is missing its typeface, or renders differently on another machine.

**Fix.** Self-host every font file in the project and reference it with `@font-face` from a
local path. A render should need no network at all.

---

## Audio

### 20 · Cue volume cannot rescue a quiet source

**Symptom.** You add a sound effect, raise its volume, and still cannot hear it.

**Cause.** Arithmetic. Summing a −38 dB signal into a −17 dB bed changes the total by
hundredths of a decibel.

**Fix.** Level the asset, not the cue (`scripts/level-sfx.mjs`).

**Proof.** Raising a typing cue from 0.35 → 0.85 moved the delivered mix by **0.1 dB**.
Levelling the asset +22 dB through a limiter (mean −37.4 → −24.2, peak −8.1 → −1.1) and
cueing at 0.55 took the delivered window's peak from **−4.6 dB to −1.4 dB**.

### 21 · A levelled asset with a silent head makes the cue land late

**Symptom.** The sound effect is audible now, but it feels detached from the animation — or
only the second half of the action has sound.

**Cause.** Field-recorded SFX usually open with room tone before the first hit. If you cut
the asset from `-ss 0`, you levelled the silence too: the cue starts on time and its first
transient does not.

**Fix.** Cut from the first transient (`scripts/level-sfx.mjs` does this by default and
reports what it trimmed). Verify the output's first 100ms is within ~12 dB of its own peak.

**Proof.** A shipped film's typing cue started 0.40s into a 0.71s typing animation, so 56%
of the action was silent. The window peak was a healthy −1.4 dB, which is why it passed
review — the peak was real, it was just in the wrong half of the window. The 100ms envelope
across the cue told the truth immediately:

```
t=10.72  -4.6 dB   ← narration only; the animation has already started
t=10.82  -6.3 dB
t=10.92  -6.0 dB
t=11.02  -4.7 dB
t=11.12  -1.6 dB   ← the first keystroke finally lands
t=11.22  -1.4 dB
```

**The general lesson:** a window measurement proves a cue is loud *somewhere*. Only an
envelope proves it is loud *when it should be*. `scripts/verify-cue.sh` prints both.

### 22 · A TTS `--speed` flag is silently ignored

**Symptom.** Regenerated narration is byte-for-byte the same length as before, even after
clearing the cache.

**Fix.** Verify output length rather than trusting the parameter. Apply tempo changes with
`ffmpeg -af atempo=1.1`, and remember to rescale every word timing by the same factor.

---

## Mastering

### 23 · `loudnorm`'s `linear=true` does not prevent clipping

**Symptom.** The mastered file measures above 0 dBFS.

**Cause.** It applies one gain computed from the pass-1 measurements. A transient added
after measuring — or a different cut — can exceed the target.

**Fix.** Put a true-peak limiter after `loudnorm`.

**Proof.** A master measured **+1.1 dBFS** after one SFX asset was made louder.

### 24 · `alimiter` applies makeup gain unless told not to

**Symptom.** Adding a limiter to fix trap 23 makes the file *louder* than the target.

**Cause.** Output is scaled by `level_out / limit`.

**Fix.** `alimiter=limit=0.891:level=disabled`.

**Proof.** Without `level=disabled`, a −14 LUFS target came out at **−13.0 LUFS / −0.0 dBFS**.

### 25 · Grain destroys compression

**Symptom.** A render balloons and the grain reads as electronic sizzle rather than film.

**Cause.** Re-seeding noise every frame defeats inter-frame compression.

**Fix.** Re-seed at 12 Hz — real film grain is held across frames — and re-encode with
`-crf 19 -tune film` rather than `-c:v copy`.

**Proof.** 9 MB → 85 MB with per-frame grain; 68 MB → 38 MB with the 12 Hz seed and the
re-encode.

### 26 · Shell quoting mangles the filter chain

**Symptom.** `Unable to parse "measured_I"` or a filter option that silently does nothing.

**Fix.** Keep the entire `-af` argument in one double-quoted string or build it in a
variable, and echo it before running when a parse error appears. Scripting the two-pass
chain (`scripts/master.sh`) removes the problem permanently.

---

## Other runtimes

### 27 · A Lottie layer with an animated multi-dimensional transform renders blank

**Symptom.** The animation plays in preview and the layer is empty in the render.

**Fix.** Keep the Lottie layer transform static and drive motion from GSAP on the mount
container.

### 28 · Rive cannot be authored programmatically

**Symptom.** Generated `.riv` files render blank or crash the WASM runtime.

**Cause.** `.riv` is a compiled binary; the editor is GUI-only.

**Fix.** Use Rive only for assets authored in its editor. Its runtime *is*
seek-deterministic (150 frames rendered twice produced identical hashes), so a
human-authored file is fine to mount — but an agent cannot make one. Do not re-probe this.

### 29 · Bloom over near-white UI blows out

**Symptom.** A Three.js hero shot turns into a white cloud and the UI texture is unreadable.

**Fix.** Tone-map before applying bloom, and keep the effect off any near-white surface.

### 30 · A scale on a flex item breaks centring (Remotion)

**Symptom.** A centred word renders pinned to the top-left corner.

**Fix.** Move the transform to an inner wrapper so the flex item itself is untransformed.

### 31 · Crossfading two overlaid words dims the shared stem

**Symptom.** A text morph has a visible dip in the middle.

**Fix.** Hold the shared characters solid and crossfade only the differing tail.

---

## Process

### 32 · Judging scale from contact sheets

**Symptom.** You brief a rebuild for "the card is too small", then measure and find it
already fills 60–77% of the frame.

**Fix.** Judge composition from full-resolution stills. Contact sheets are for spotting
missing content, not for judging weight.

### 33 · Trusting the source instead of the delivered file

**Symptom.** A change is provably present in the composition and absent from the film.

**Fix.** Sample the delivered MP4 at every changed beat, and measure any audio change in
the delivered file. This is Law 9 and it is how traps 20 and 23 were both found.

### 34 · Overwriting renders

**Symptom.** You cannot prove a fix worked, or a director asks for the previous ending back
and it no longer exists.

**Fix.** Version every render and keep the raws.

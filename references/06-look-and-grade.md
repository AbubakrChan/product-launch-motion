# Look and grade

This file owns the visual half of **Law 8 — ration the accent**: two grounds, one accent, and a grade thin
enough that nobody can name it. Everything here is CSS you own, not a plugin, because the renderer composites
each track separately, and half of what a designer reaches for (`backdrop-filter`, `mix-blend-mode`) silently
does nothing or destroys the film. The substitutes below survive a frame-by-frame render. The reference film (a
B2B SaaS launch, purple `#b04adc` / orange `#ff7247`) is a worked **example**; §10 derives the same system from
any palette.

> **Read §10 first, and treat the rest as a parts bin.** Testing found that working forward through this file
> produces the same *value architecture* every time — warm off-white ground, one grey, lifted near-black ink,
> accent plus AA-safe variant — even when the hues are completely different. Two films can share no colour and
> still be recognisably the same film. That architecture is one option among several: a film built on two mid
> values with no near-white and no near-black is valid, and so is a monochrome film with no accent at all.
> Decide the architecture in `references/11-creative-direction.md`, then come back here for the mechanics.
>
> The same applies to the grade itself. `scripts/wire-grade.mjs` will happily give every film grain **and** a
> vignette **and** specular sweeps, and that combination is this kit's default look, not a law. `--grain 0` and
> `--vignette 0` are first-class choices: a scanner-lit or clinical film wants no vignette, a crisp graphic film
> wants no grain, and a film whose own key light provides its light passes should not also carry synthetic
> ones. Pick the treatments your direction needs and switch the others off.

## 1 · Grounds before effects

Build the two registers first — the ground under the argument, the ground under the product — with zero effects
on top. A grade cannot rescue a flat ground; it only makes it grainy. The **product register (near-white)** is a
base colour, two soft brand radials in opposite top corners, and an optional dot grid at ~3% ink.

```css
.ground      { position:absolute; inset:0; background:#fafafb; overflow:hidden; }
.ground-wash {                              /* two soft brand pools — the light source */
  position:absolute; inset:0;
  background:
    radial-gradient(ellipse 62% 52% at 20% 10%, rgba(176,74,220,0.06), transparent 60%),
    radial-gradient(ellipse 52% 46% at 88%  8%, rgba(255,114,71,0.05), transparent 65%);
}
.ground-dots {                              /* optional texture, 28px pitch */
  position:absolute; inset:0;
  background-image: radial-gradient(circle, rgba(16,14,25,0.03) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* Argument register (dark): near-black base, one brand pool from off-canvas above, and a large
   soft ellipse that makes the frame a lit stage instead of a black rectangle. */
.ground--dark {
  position:absolute; inset:0;
  background:
    radial-gradient(ellipse 78% 74% at 50%  44%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.34) 100%),
    radial-gradient(ellipse 66% 52% at 50% -14%, rgba(176,74,220,0.11) 0%, rgba(176,74,220,0) 62%),
    #100e19;                            /* not #000 — see §9 on lifted blacks */
}
```

Those alphas look absurd written down (0.06, 0.05, 0.03) and they are correct: a 6% radial at 1920×1080 is a
*lighting* decision, and you should not be able to point at where it starts.

**Why light, not a blurred screenshot.** A blurred screenshot stays recognisable at any radius, so the viewer
spends the shot trying to read it; it fights the real UI in front of it; and it changes per frame, so your two
registers stop being two. Radial pools read as depth without ever reading as *content*, and cost nothing to keep
identical across eleven frames. Put the ground in its own layer, never on the node the camera moves — a camera
scale on the root drags the ground and the light slides.

## 2 · Aurora / gradient mesh

When a static ground is too flat for a long type-only shot (a thesis card, an end card): three broad brand-hued
pools inset past the canvas edge, with **one** slow drift.

```css
.aurora {
  position:absolute; inset:-8%;         /* overhang, so the drift never exposes an edge */
  background:
    radial-gradient(ellipse 58% 46% at 20% 16%, rgba(176,74,220,0.20), rgba(176,74,220,0) 62%),
    radial-gradient(ellipse 52% 42% at 84% 76%, rgba(255,114,71,0.13), rgba(255,114,71,0) 64%),
    radial-gradient(ellipse 38% 32% at 62%  4%, rgba(199,125,234,0.11), rgba(199,125,234,0) 66%);
  transform-origin:50% 50%; will-change:transform;
}
```

```js
tl.fromTo(aurora,                            // the single move: one drift, eased at both ends
  { scale: 1.08, x: -18, y: 10, opacity: 0.72 },
  { scale: 1, x: 10, y: -6, opacity: 1, duration: DUR, ease: "power1.inOut" }, 0);
```

**Why this beats particles and floating shapes.** The reference film's earlier orbiting-arc layer was cut for
reading as clutter behind the thesis and carrying a fragile runtime dependency. An aurora cannot cross the type
— it *is* the type's background, at 11–20% alpha, with no hard edge to catch the eye. Particles and floating
cards do cross it, so each needs a keep-out rule you will get wrong somewhere. The drift above is 28px over four
seconds: if you can see it moving it is too fast, and Law 7 applies to backgrounds too — the ease-out lands it.

## 3 · Glass that actually renders

**The trap.** `backdrop-filter: blur()` does nothing useful when each track composites on its own —
there is no backdrop. Your "frosted" panel blurs transparency and renders as a flat tint, or looks right in the
preview and wrong in the render. Same root cause as §5.

**The substitute** is two rings drawn with the `padding` + `-webkit-mask` + `mask-composite: exclude`
trick — the element is masked so only its padding band paints, giving a true band instead of a fill: a wide soft
iridescent band for the frost, plus a 1.5px gradient hairline at the edge.

```css
.glass-band, .glass-rim {
  position:absolute; inset:0; border-radius:18px;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;   /* WebKit spelling */
  mask-composite: exclude;       /* standard spelling — ship both */
  opacity:0;                     /* animate this, not the geometry */
  pointer-events:none;
}
.glass-band {                    /* 14px frosted band hugging the inner edge */
  padding:14px; z-index:5;
  background:linear-gradient(135deg, rgba(176,74,220,0.10), rgba(255,255,255,0.60) 42%, rgba(255,114,71,0.09));
}
.glass-rim {                     /* 1.5px brand hairline at the very edge */
  padding:1.5px; z-index:7;
  background:linear-gradient(135deg, rgba(176,74,220,0.55), rgba(255,255,255,0.85) 46%, rgba(255,114,71,0.50));
}
```

Both are `inset: 0`, so the glass lives **inside** the card box rather than as a plate behind it — a layout
decision as much as a look one. An outside plate grows the element's visual bounds, so a camera push can shove
its edge into the bottom keep-out band; inside glass can't, because the card's own box already passed layout.
The recipe scales down to a control: `100px` radius, `1.5px` padding, a two-stop accent gradient, `opacity: 0 →
1` to light a search field on the word "searches".

## 4 · The film grade pass

Three treatments on one overlay track spanning the whole film, injected after assemble + transitions + audio by
an idempotent script. They lift every shot at once and cost nothing per shot.

| Treatment | Fixes | Strength that reads |
|---|---|---|
| Moving grain | Digital flatness — "clean CG" | `opacity: 0.1` on a black-speckle plate |
| Vignette | Eye wanders; corners feel open | `0.15` corner alpha (`0.06` at the 78% stop) |
| Specular sweep | Beats land with no punctuation | `0.11` peak white, 3 passes in 44s |

Keep the vignette weak: the same overlay also sits over the light register, where a heavy one reads dingy rather
than cinematic.

```html
<div id="grade" class="clip" data-start="0" data-duration="44.200"
     data-track-index="990" style="position:absolute;inset:0;z-index:9000;pointer-events:none">
  <!-- vignette: transparent centre → dark corners, straight alpha -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 78% 74% at 50% 48%,
       rgba(8,6,14,0) 44%, rgba(8,6,14,0.060) 78%, rgba(8,6,14,0.15) 100%)"></div>
  <!-- specular sweep: parked off-canvas, driven once per beat (§8) -->
  <div id="grade-sweep" style="position:absolute;top:-24%;left:0;width:40%;height:148%;opacity:0;
       background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.11) 50%,
       rgba(255,255,255,0))"></div>
  <svg id="grade-grain" width="1920" height="1080" style="position:absolute;inset:0;opacity:0.1">
    <filter id="grade-noise" x="0" y="0" width="100%" height="100%">
      <feTurbulence id="grade-turb" type="fractalNoise" baseFrequency="0.82"
                    numOctaves="1" seed="1" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0
                                           0 0 0 0 0
                                           0 0 0 0 0
                                           0.34 0.34 0.34 0 0" />
    </filter>
    <rect width="1920" height="1080" filter="url(#grade-noise)" />
  </svg>
</div>
```

**Read the colour matrix.** The first three rows are zero, forcing R, G and B out to black. The fourth, `0.34
0.34 0.34 0 0`, makes alpha out 34% of the noise's R+G+B — the noise's **luminance is moved into alpha**. Bright
noise becomes an opaque black speckle, dark noise fully clear, and plain alpha compositing then does the job a
`multiply` blend would otherwise be asked to do. Skip the matrix and you get a grey haze only a blend mode can
knock back — the trap in §5. On the turbulence: `stitchTiles` keeps tiles seamless, `numOctaves=1` keeps it fine
rather than cloudy, and `baseFrequency="0.82"` sits near the top of the useful range — lower reads as smoke.

## 5 · The blend-mode trap

**Rule: no `mix-blend-mode` anywhere in an overlay track. Plain alpha compositing only.**

Each `.clip` track composites as its own layer, so an overlay track has **no frame content as its backdrop** —
it blends against transparency. A `multiply` vignette over nothing darkens nothing; it paints its own source
colour, which for a vignette gradient is a near-white field. The first version of the reference film's grade
pass did exactly that and rendered the **entire film as a white wash**. It looked like an encoder bug. It was
one declaration.

The same reasoning kills three other reflexes in an overlay layer: `backdrop-filter` (§3), which has nothing
behind it to filter; `filter: contrast()` / `saturate()` as a curve, which filters the overlay's own pixels
rather than the film (a curve has to live on each frame's own ground, §9); and screen / overlay / soft-light
sheens, the same failure as multiply in a different colour. If you want a blend mode, move the effect *into the
frame* — where it does have a backdrop — or re-express it as alpha the way the grain's colour matrix does.

## 6 · Grain vs compression

**Re-seed at 12 Hz, not per frame.** Per-frame re-seeding took a ~9 MB ungrained render to **85 MB** and read
as electronic sizzle: new noise every frame defeats inter-frame compression completely, because no macroblock is
ever stable. Real film grain is held across more than one frame at 24fps, so 12 Hz is the honest look as well as
the cheap one. Derive the seed from the playhead (Law 3):

```js
var clock = { t: 0 }, lastSeed = -1;
tl.to(clock, { t: TOTAL, duration: TOTAL, ease: "none", onUpdate: function () {
  var seed = Math.floor(clock.t * 12) % 12;        // pure function of the playhead
  if (seed !== lastSeed) { lastSeed = seed; turb.setAttribute("seed", String(seed)); }
} }, 0);
```

A seek to any time reproduces the same grain field, so two renders are byte-identical.

**Re-encode the master; don't `-c:v copy` it.** Copying ships the renderer's own wasteful encode. `-crf 19
-tune film` took a 68 MB render to **38 MB with no visible loss** — `-tune film` lowers deblocking so grain
survives instead of being smeared.

```bash
ffmpeg -i film-raw.mp4 -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart film.mp4
```

Do it in the same pass as loudness normalisation, not as a second generation — full chain in
[`07-sound-and-master.md`](07-sound-and-master.md).

## 7 · The contrast-gate interaction

A full-canvas overlay breaks automated WCAG sampling: the sampler reads text against a background that now
carries grain and vignette, and reports nonsense — the reference film's gate reported **1.06:1** on text that is
genuinely AA-compliant. Don't weaken the grade and don't disable the gate. Gate with the grade **off**, ship
with it **on**:

```bash
npx hyperframes check --no-contrast                              # everything else, grade ON
node scripts/wire-grade.mjs --off && npx hyperframes check       # contrast, grade OFF
node scripts/wire-grade.mjs                                      # put it back
```

This is why the grade script takes `--off` and why it is idempotent (it replaces its own marked block): the
contrast gate removes and restores it on every run. Gate order in
[`08-qa-and-direction.md`](08-qa-and-direction.md).

## 8 · Specular sweeps as story punctuation

One pass per **named story beat**, never a loop — three in 44 seconds is right: the thesis, the proof, the CTA.
A sweep on a timer is a screensaver; a sweep on a beat is punctuation.

```js
const SWEEPS = [
  { at:  7.92, dur: 0.90 },   // the thesis lands
  { at: 24.62, dur: 0.90 },   // the proof opens
  { at: 40.17, dur: 0.95 },   // the CTA
];

gsap.set(sweep, { skewX: -14 });
SWEEPS.forEach(function (s) {
  tl.fromTo(sweep, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, s.at);
  tl.fromTo(sweep, { xPercent: -140 },
                   { xPercent: 260, duration: s.dur, ease: "power2.inOut" }, s.at);
  tl.to(sweep, { opacity: 0, duration: 0.2, ease: "power1.in" }, s.at + s.dur - 0.2);
});
```

**The skew trick.** The obvious way to angle a light pass is an angled gradient (`linear-gradient(115deg,
…)`). Don't: on a tall box a non-90° axis projects corner to corner, so the stops land at different heights on
the left and right edges and you see a hard diagonal seam instead of a soft bar. Keep the gradient axis at
**90°** and skew the *element* (`skewX: -14`), with `top: -24%; height: 148%` so the skewed corners never
enter the canvas. The travel `xPercent: -140 → 260` on a `width: 40%` box runs fully off one edge to fully off
the other, so the band is never parked on screen at rest; fade in over 0.14s and out over the final 0.2s so it
never pops.

Sweeps work **inside** a shot too, at card scale, as a scan sheen on an element landing: a 110px-tall white bar
peaking at 55%, `y: -110 → cardHeight` over 0.30s, once, as the card arrives — one pass, tied to an event, no
repeat.

## 9 · Restraint rules

**A grade, not a filter. If a viewer can name the effect, it is too strong** — nobody should finish the film
thinking "nice grain".

- **Bloom over near-white UI blows out.** The Three.js lane's exploded product hero came back at t≈2.4s
  as a white cloud with unreadable UI texture — bloom over a near-white screenshot has nothing left to clip into.
  Tone-map first, or keep bloom on the dark register where there is headroom.
- **Chromatic aberration was ~40% too strong** at 300px in the bake-off, showing as coloured fringing
  on type: a defect, not a look. It belongs on a fast whip, a scale-through transition or a single impact frame,
  at a strength you have to hunt for — never on held type.
- **Lifted blacks.** No pure black anywhere: the dark ground is `#100e19` and the vignette ink is
  `rgba(8,6,14,…)`, both slightly blue, neither at zero. Crushed blacks are the clearest "made in a
  browser" tell and lifting them costs nothing.
- **A filmic curve lives in the frame, not the grade.** `filter: contrast(1.04) saturate(1.06)` on the
  overlay track filters the overlay's own pixels, not the film (§5) — apply it to each frame's ground/stage node
  instead. The reference film uses none: its contrast comes from the two-register palette, which is cheaper and
  cannot push text out of AA.

## 10 · Brand fit

The structure above is portable; the two hexes are the example. Derive your own:

| Slot | How to derive it | Example |
|---|---|---|
| Accent | The brand primary. Everything on Law 8's budget uses this. | `#b04adc` |
| Accent-2 | The secondary, or the primary rotated to a warm complement. Gradients only, never a solo fill. | `#ff7247` |
| Accent-tint | Primary lightened ~15% — the third aurora pool only. | `#c77dea` |
| Ink | Primary desaturated and darkened until near-black but not black. | `#100e19` |
| Light ground | Off-white carrying a trace of the ink's hue. Keep `#fff` for cards. | `#fafafb` |
| Body grey | One neutral for all secondary text, every frame. | `#4b5563` |
| Accent-AA | Accent darkened until it clears 4.5:1 on white — small text and eyebrows. | `#9a3fc4` |

1. **Two grounds, not three.** Dark carries the argument (thesis, proof, CTA); light carries the
   product (UI, cards, lists). Every frame is one or the other, and the flip is itself a beat worth a sweep.
2. **Accent-AA is not optional.** Most brand primaries fail 4.5:1 on white — the example purple does.
   Define the darkened variant once for every eyebrow, label and caption on the light register, and keep the true
   accent for large type, fills, gradients and rims. Prove it with the gate in §7, not by eye.
3. **A third hue is almost always a mistake.** A frame that seems to need another colour usually needs
   another *value* — a lighter tint of the accent, or the neutral grey. The only legitimate additions are semantic
   (a success green, an error red), once each in the whole film, if at all. For a monochrome brand, drop accent-2
   and build gradients accent → accent-tint → white; the aurora and rims still work, they just read cooler. Never
   invent a second brand colour to fill the slot.

**Cross-links:** [`04-motion-grammar.md`](04-motion-grammar.md) (nothing ends moving — the aurora too) ·
[`05-camera-3d-cursor.md`](05-camera-3d-cursor.md) (glass inside the card box) ·
[`07-sound-and-master.md`](07-sound-and-master.md) (the re-encode that pays for the grain) ·
[`08-qa-and-direction.md`](08-qa-and-direction.md) (gate order) · [`10-traps.md`](10-traps.md)

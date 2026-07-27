# Product Launch Motion

**A Claude Code skill that directs and renders product launch videos from code — not slideshows with a voiceover on top.**

Point it at a product. It writes the script, renders the voiceover, syncs every reveal to
the *word* that describes it, builds each shot as an HTML composition with real camera
moves, grades it like film, masters it to broadcast loudness, and then reviews its own
output and fixes what it finds.

![A camera dolly pushing in on a UI control while a cursor clicks it](examples/camera-move.gif)

*Real output: a 3D-turned product surface, a camera dolly onto the control, a cursor with
a proper click, and a list that updates when the reply lands. All HTML, CSS and GSAP.*

---

## Why this exists

Programmatic video tools solve rendering. They do not solve **direction** — and direction
is the entire difference between a launch film and a slideshow.

A composition can lint clean, render without error, hit every deadline, and still look
like a template. The gap is craft: does the reveal land on the word? Is the camera
actually moving, or is everything just drifting? Can you see the cursor? Is the
"typing sound" you added *actually audible*, or is it 20 dB under the narration and
mathematically inaudible?

This skill is that craft, written down — ten laws, a thirteen-step pipeline, fourteen shot
constructions, and thirty-plus traps, each recorded with **the measurement that proves it**
rather than the vibe that suggested it.

It was extracted from the launch film for [Cheerful](https://www.cheerful.ai) — 44.2
seconds, eleven shots, seven director revisions — and written to work for **any** product:
SaaS, mobile apps, hardware, e-commerce, dev tools, marketplaces, services. The full
revision history, note by note, is in [`examples/CASE-STUDY.md`](examples/CASE-STUDY.md).

## It is a director, not a template

**Two products should never get the same film.** That is the whole design constraint, and
it is why the first thing the skill does is refuse to start building.

The laws are fixed — truth, word-locked sync, determinism, sound arithmetic, mastering
targets, verification. **The look is not.** Palette, ground, depth, camera personality,
typography, texture, pacing, structure, whether there is a cursor, whether there is a
voice at all: all of it is derived per product from the claim, the brand, the audience and
the category. Before a single frame is built, the skill writes **three genuinely different
visual directions, judges them, and kills two.**

It also insists on a **signature move** — one thing this film does that no other film does,
expressing that product's specific claim. A dev tool might play out as one continuously
scrolling terminal buffer. A skincare brand might match-cut every transition on the same
circular form. A fintech dashboard might be a single horizontal pan across one enormous
ledger. Same discipline, unrecognisably different films.

And it ships anti-sameness checks that name its own defaults so you can refuse them:

> Are you using the reference film's gradient? Then you took its accent instead of deriving
> one. Does your film have glass borders *and* a gradient-mesh ground *and* specular
> sweeps? That is the default kit applied wholesale. **Could a competitor use this
> direction unchanged? Then kill it — it is a category template, not a direction.**

See `references/11-creative-direction.md`. Read it before anything else.

## What you get

- **`SKILL.md`** — the laws, the pipeline, and a routing table. Under 500 lines so it
  loads fast; everything else is progressive disclosure.
- **11 reference documents** — creative direction, story and truth, word-locked sync,
  motion grammar, the camera rig, the cursor spec, look and grade, sound and mastering, QA
  and direction, the shot catalog, and the trap index.
- **6 runnable scripts** — audio wiring, film grade, SFX levelling, word timings,
  mastering, and cue verification. Dependency-light, idempotent, safe to re-run.
- **4 templates** — brief, storyboard, cue table, and a working frame skeleton with the
  camera rig and cursor already built. Copy it; don't retype it.
- **A worked example** — the real film, revision by revision, with the note that prompted
  each change and the measurement that closed it.

## Install

```bash
npx skills add AbubakrChan/product-launch-motion
```

Or drop it in by hand:

```bash
git clone https://github.com/AbubakrChan/product-launch-motion \
  ~/.claude/skills/product-launch-motion
```

Then just ask:

> Make a 45-second launch video for my product at example.com

Claude Code loads the skill on any launch-video, promo, demo-reel or motion-design
request. You can also invoke it explicitly with `/product-launch-motion`.

## Requirements

| Need | For | Notes |
|---|---|---|
| **Node ≥ 22** | the renderer and all scripts | required |
| **FFmpeg** | mastering, levelling, verification | required — `brew install ffmpeg` |
| **A seek-based renderer** | HTML → MP4 | [HyperFrames](https://hyperframes.heygen.com) by default; Remotion notes included |
| Python ≥ 3.10 | local text-to-speech | optional — only if you want free offline VO |
| A word-level transcriber | sync timings | optional — Whisper locally, or any API that returns word timestamps |

No paid API is required to produce a complete film. Voiceover can be local
([Kokoro-82M](https://github.com/hexgrad/kokoro), ~80M params, runs on CPU), a commercial
TTS voice, or a human recording — the pipeline only needs a WAV and its word timings.

## Quickstart

```bash
# 1 · scaffold + intake
cp assets/BRIEF.md ./BRIEF.md          # product, audience, the ONE claim, approved figures

# 2 · DIRECTION — write three different looks, judge them, kill two, name the
#     signature move. Ten minutes here decides everything downstream.
#     → references/11-creative-direction.md

# 3 · voiceover FIRST — frame durations come from real VO length, never estimates
#     (any TTS or a human recording; output one wav per narration line)

# 4 · word timings → the cue table every frame reads
node scripts/word-timings.mjs --transcript transcript.json --out audio_meta.json

# 5 · storyboard, then build one HTML frame per beat. The skeleton gives you the
#     camera rig and cursor; the LOOK comes from your direction, not from it.
cp assets/frame-skeleton.html compositions/frames/01-hook.html

# 6 · assemble → transitions → audio → grade  (this order, every time)
node scripts/wire-audio.mjs && node scripts/wire-grade.mjs

# 7 · gates, render, master, verify
npx hyperframes check --no-contrast
npx hyperframes render -o renders/video-v1-raw.mp4
./scripts/master.sh renders/video-v1-raw.mp4 renders/video-v1.mp4
./scripts/verify-cue.sh renders/video-v1.mp4 10.72 0.76    # prove the cue is audible
```

## One film it produced

These frames are **one direction**, executed — not the house look. A dev tool, a skincare
brand and a fintech dashboard built with this skill should share none of this film's
palette, ground, camera behaviour or typography. What they share is the discipline
underneath.

![Product surface with glass borders, filtered results and a rack-focused stat](examples/still-2.jpg)

![A 3D-turned inbox with a camera push onto the control being clicked](examples/still-3.jpg)

![A fulfilment card with a real product line item beside detected posts](examples/still-4.jpg)

![A testimonial attributed to a real customer's photograph](examples/still-6.jpg)

Every pixel above is HTML and CSS. No After Effects, no stock footage, no motion-graphics
license, no GPU renderer — and the render is deterministic, so the same commit produces
the same file every time.

## The craft it encodes

Timing and easing — custom-bezier ease-out, spring and settle, staggered entrances,
anticipation, speed ramping, deliberate holds, beat-synced cuts.
**Camera** — dolly, parallax, orbit and turntable, rack focus, whip pan, zoom-to-detail.
**Type** — kinetic typography, mask reveal from the baseline, blur-in, tracking-in,
odometer counters, text morphs.
**Look** — film grain, bloom and halation, chromatic aberration, light sweeps, aurora and
gradient-mesh grounds, glassmorphism, vignette, lifted blacks, a tight palette with one
accent.
**3D and product** — exploded views, floating isometric mockups, HDRI-style lighting.
**SaaS and UI** — fake cursor with ripples, UI card staggers, skeleton-to-results loading,
progressive disclosure, state flips.
**Sound** — whooshes, UI ticks, sub-bass on hero hits, and silence before the reveal.
**Structure** — cold opens, problem-agitate-solve arcs, register flips as story turns.

Each one is documented as *when to use it and what breaks*, not just as a name.

## Stack — and what we tried before settling

The film this came from was a bake-off. Five motion tools were raced on the same beats,
and the verdicts are baked into the skill so you don't repeat the experiment:

| Tool | Verdict | Why |
|---|---|---|
| **GSAP** | **Core of the system** | Best craft-per-cost, seek-deterministic, zero new dependency. Every frame's timeline is one paused GSAP timeline. |
| **HyperFrames** | **The renderer** | HTML-as-video with a seekable timeline, word-level audio mounting and a real lint/layout/contrast gate. |
| **Lottie** (`lottie-web`) | **Use for logo draw-ons** | Great for vector draw-on. Trap: an animated multi-dimensional *layer* transform silently blanks the layer in render while playing fine in preview. Keep layer transforms static; drive motion from GSAP on the container. |
| **Remotion** | **Per-shot co-host** | Genuinely better React ergonomics, real `spring()` physics, and a WebGL post pass over live DOM. We kept the long-form film elsewhere for its word-sync workflow, but Remotion is a first-class choice — the skill's laws all port. |
| **Three.js** | **One hero shot only** | The only real-camera, real-light route without a GPU renderer. Trap: bloom over a near-white UI screenshot blows out to a white cloud — tone-map first. |
| **Rive** | **Runtime yes, authoring no** | The runtime is seek-deterministic (verified: 150 frames rendered twice, identical hashes). But `.riv` is a compiled binary and the editor is GUI-only, so an agent can't author one. |
| After Effects, C4D, Octane, Blender | **Ruled out** | GUI-only or not installable. An agent cannot drive them. This is why the whole system is code. |

## A taste of the trap index

These are the ones that cost hours. All twenty are in `references/10-traps.md`.

- **Cue volume cannot rescue a quiet source.** Raising a typing SFX from `0.35` to `0.85`
  moved the delivered mix by **0.1 dB** — because the source sat at −37 dB mean under a
  −17 dB narration bed. Level the asset, not the cue.
- **`alimiter` silently applies makeup gain** unless you pass `level=disabled`, which
  pushed a −14 LUFS master to −13.0 LUFS / −0.0 dBFS — louder than the target the limiter
  was added to protect.
- **A `mix-blend-mode` overlay renders the whole film white** when each track composites
  as its own layer — a `multiply` vignette over transparency paints its own source colour.
- **`object-position` is inert when source and box share an aspect ratio**, so it cannot
  reframe a square avatar from a square photo. It looks like it should. It does nothing.
- **Per-frame grain destroys compression** — a 9 MB render became 85 MB and read as
  electronic sizzle. Re-seed at 12 Hz, like real film held across frames.
- **A full-canvas grade breaks automated contrast checks**, which then report bogus
  1.06:1 ratios. Gate with the grade off, ship with it on.

## FAQ

**Will every video made with this look the same?**
No, and the skill is built to prevent it. The look is derived per product, the pipeline
forces three competing directions before any building, and there is a checklist that names
the skill's own defaults so an agent can catch itself reaching for them. What repeats is
the discipline — sync, determinism, sound arithmetic, mastering — not the aesthetic. See
`references/11-creative-direction.md`.

**Does this work for physical products, not just software?**
Yes. The shot catalog covers hardware heroes, unboxing and exploded views, e-commerce
line items and floating product mockups alongside the SaaS shots. The laws are
product-agnostic; only the shot selection changes.

**Do I have to use HyperFrames?**
No. The laws — word-locked sync, the two-node camera, the cursor spec, sound arithmetic,
mastering — are renderer-neutral, and `references/01-renderer-contract.md` includes the
Remotion equivalents. HyperFrames is the default because it ships the gates.

**Can I use my own voice, or a cloned one?**
Yes. The pipeline needs a WAV plus word-level timestamps. Anything that produces those
works — human recording, ElevenLabs, local Kokoro. Swapping voices means re-deriving the
timings, because every cue is locked to the words.

**Is this an AI video generator?**
No, and that is the point. Nothing is diffused or hallucinated. Every frame is code you
can read, diff and fix, so the output is deterministic, brand-exact, and never invents a
number or a face.

**How long does a film take?**
The 44-second reference film renders in ~50 seconds on an M-series laptop and masters in
under 10. The direction loop — the part that matters — takes as many passes as you have
notes.

## Contributing

Traps are the most valuable contribution. If you find one, open a PR against
`references/10-traps.md` with the measurement that proves it — the number, the command,
and the before/after. That standard is the whole reason this file is useful.

## License

MIT. The craft is meant to travel.

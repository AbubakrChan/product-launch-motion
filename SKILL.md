---
name: product-launch-motion
description: Direct and render a professional product launch video, promo film, demo video, or animated product explainer from code — HTML/CSS/GSAP compositions rendered deterministically to MP4 with HyperFrames, voiceover-synced motion, camera moves, a fake cursor UI demo, film grade and broadcast-loudness mastering. Use when asked to make a launch video, product video, promo video, teaser, sizzle reel, feature announcement film, demo reel, motion graphics for a product, or to improve/critique an existing one. Covers SaaS, apps, hardware, e-commerce, dev tools and services. Keywords: launch video, product video, promo, motion design, kinetic typography, storyboard, voiceover sync, GSAP timeline, HyperFrames, Remotion, film grain, LUFS mastering, ffmpeg.
---

# Product Launch Motion

A production discipline for making launch films that look like a motion designer made
them — not a slideshow with a voiceover on top.

The output is a rendered MP4. The medium is HTML, CSS and GSAP, rendered frame-by-frame
by a deterministic seek-based renderer (HyperFrames by default). Everything here is
transferable to any renderer that can seek a timeline; the laws are renderer-neutral,
the plumbing examples are HyperFrames.

**This skill exists because green tooling is not the same as good film.** A composition
can lint clean, render without error, and still be a slideshow. The value below is the
craft that separates the two, plus the ~20 traps that cost real hours to find — each one
recorded with the measurement that proves it, not the vibe that suggested it.

## When to use this

Use it for: a product launch or feature-announcement film (20–90s), a landing-page hero
video, a demo reel, a conference sizzle, an investor-update film, or a rescue pass on a
video that "looks basic".

Do not use it for: talking-head editing, screen-recording with captions slapped on, or
anything where the deliverable is a live web page rather than a video file.

## The nine laws

Break one and the film reads amateur, however good the individual frames are.

**1 · Truth first.** Every number, logo, face, screenshot and testimonial on screen is
real and sourced. Before animating anything, write down the approved figures — the exact
list of numerals allowed to appear — and refuse every other number. Invented metrics and
stock faces are the fastest way to make a real product look fake. → `references/02-story-and-truth.md`

**2 · Word-locked sync.** Every reveal is cued to the measured start time of the word it
illustrates. Not to a beat grid, not to an estimate — to a word-level transcript of the
actual voiceover file. A frame at t=0 shows only what the voice is saying at t=0.
→ `references/03-word-locked-sync.md`

**3 · Determinism.** No `Math.random`, no `Date.now`, no CSS transitions, no
`repeat`/`yoyo`. Any scattered or noisy value is derived from an index or the playhead.
A seek to time T must reproduce byte-identical output, or your render is a lottery.
→ `references/01-renderer-contract.md`

**4 · One camera, two nodes.** A whole-shot rotation and a mid-shot scale must live on
*different* elements. On the same element they fight over one transform matrix and the
move judders. Outer node = dolly (scale), inner node = 3D turn (rotation + perspective).
→ `references/05-camera-3d-cursor.md`

**5 · The cursor is a stage prop.** A life-size pointer (~32px at 1920) disappears into
any saturated control. Draw it at ~44×54 with a heavy stroke and a deep shadow, put it
*inside* the node the camera moves, and put the zoom origin exactly on the control it
clicks — that point becomes a fixed point of the transform and the aim survives the push
with no compensating maths. → `references/05-camera-3d-cursor.md`

**6 · Sound is arithmetic, not taste.** A cue's volume cannot rescue a quiet source file.
If the asset sits 20 dB under the narration bed, raising its volume moves the mix by
tenths of a dB — measured, not guessed. Level the *asset*, then verify the cue landed in
the delivered file. → `references/07-sound-and-master.md`

**7 · Nothing ends moving.** Every frame lands and holds. Motion is cued to meaning; a
shot that is still drifting when it cuts reads as a screensaver, and a shot where
everything drifts independently reads as one too. → `references/04-motion-grammar.md`

**8 · Ration the accent.** Two grounds (one for the argument, one for the product), one
accent colour or gradient, and a written budget for where it may appear — typically:
one emphasis word per headline, stat numerals, the active step, state flips, the CTA.
A third hue is almost always a mistake. → `references/06-look-and-grade.md`

**9 · Green gates are necessary, not sufficient.** Lint, layout and contrast passes catch
none of the things that make a film bad. After every render, extract frames from the
**delivered file** at the beats you changed, look at them, and write down what is wrong
before anyone else does. → `references/08-qa-and-direction.md`

## The pipeline

Twelve steps. Do not skip 1, 4 or 12 — they are the ones people skip.

| # | Step | Output | Reference |
|---|---|---|---|
| 1 | **Intake** — the product, the audience, the ONE claim, the angle (usually the product's own headline) | `BRIEF.md` | `assets/BRIEF.md` |
| 2 | **Truth pass** — collect real assets, real screens, real customers, and fix the approved-figures list | `assets/`, figures list | `references/02-story-and-truth.md` |
| 3 | **Script** — 40–60s written for the ear; one clause per beat; the claim lands in the first 10s | `SCRIPT.md` | `references/02-story-and-truth.md` |
| 4 | **Voiceover** — render or record the VO *before* building anything; frame durations come from real VO length | `assets/voice/*.wav` | `references/03-word-locked-sync.md` |
| 5 | **Word timings** — transcribe with word-level timestamps into a cue table | `audio_meta.json` | `scripts/word-timings.mjs` |
| 6 | **Storyboard** — frames, durations, register map, and a shot per beat from the catalog | `STORYBOARD.md` | `references/09-shot-catalog.md` |
| 7 | **Build frames** — one HTML file per frame; camera rig and cursor from the skeleton; every tween cued to a word | `compositions/frames/*.html` | `references/04-motion-grammar.md` |
| 8 | **Assemble** — index, transitions, audio, grade — in that order, every time | `index.html` | `references/01-renderer-contract.md` |
| 9 | **Gates** — lint/runtime/layout/motion with the grade on; contrast with the grade off | 0 errors | `references/08-qa-and-direction.md` |
| 10 | **Render + master** — two-pass loudnorm, limiter, re-encode | `renders/*.mp4` | `scripts/master.sh` |
| 11 | **Verify in the delivered file** — frames at the changed beats, cue levels measured | evidence | `scripts/verify-cue.sh` |
| 12 | **Direct** — watch it, list the defects yourself, fix, re-render as a NEW file | v2, v3, … | `references/08-qa-and-direction.md` |

### Build order (step 8) is not negotiable

The index is generated, so anything hand-added to it is destroyed on re-assemble and must
be re-injected. Every wiring script here is idempotent (it replaces its own marked block),
so the safe move is always to re-run the whole chain:

```bash
node scripts/assemble.mjs        # or your renderer's assemble step
node scripts/transitions.mjs     # cuts and dissolves between frames
node scripts/wire-audio.mjs      # music bed + word-locked SFX cues
node scripts/wire-grade.mjs      # grain + vignette + specular sweeps
```

## Reference map

Load only what the current step needs.

| File | What's in it |
|---|---|
| `references/01-renderer-contract.md` | How HTML becomes video: timed tracks, the seekable timeline, determinism rules, build order, and what to do on Remotion instead |
| `references/02-story-and-truth.md` | Angle, arc, the register map, the approved-figures discipline, honesty rules, and how to source real assets for *any* product |
| `references/03-word-locked-sync.md` | Getting word timings, writing the cue table, pacing, holds, and why VO comes first |
| `references/04-motion-grammar.md` | Easing, entrances, staggers, anticipation, speed ramps, kinetic type, and the two failure modes (slideshow / screensaver) |
| `references/05-camera-3d-cursor.md` | The two-node camera rig, turntable, dolly, zoom-to-detail, rack focus, z-parallax, and the full fake-cursor spec |
| `references/06-look-and-grade.md` | Palette rationing, glass borders without `backdrop-filter`, film grain, vignette, specular sweeps, and the blend-mode trap |
| `references/07-sound-and-master.md` | SFX design, sub-bass, silence before the hero beat, the volume-arithmetic law, asset levelling, and the mastering chain |
| `references/08-qa-and-direction.md` | The gates, snapshot review, verifying the delivered file, and the director loop that turns a v1 into a v7 |
| `references/09-shot-catalog.md` | 14 reusable shots — SaaS UI, prompt/composer, results list, inbox, pipeline tracker, stat count-up, testimonial, comparison, hardware hero, terminal, map, chart, unboxing, end card |
| `references/10-traps.md` | Every trap we hit, each with the measurement that proves it. Read this before debugging anything |

## Scripts

All are dependency-light Node/bash, all idempotent, all safe to re-run.

| Script | Does |
|---|---|
| `scripts/wire-audio.mjs` | Mounts a music bed + a cue table of SFX into the assembled index, resolving frame-relative cue times against real frame starts |
| `scripts/wire-grade.mjs` | Injects the film grade: playhead-seeded grain, vignette, and specular sweeps on named story beats. `--off` removes it for the contrast gate |
| `scripts/level-sfx.mjs` | Fixes the quiet-source problem: trims and gain-limits an SFX asset to a target level, and prints before/after measurements |
| `scripts/word-timings.mjs` | Turns a word-level transcript into the cue table the frames read |
| `scripts/master.sh` | Two-pass loudnorm → true-peak limiter → `-crf 19 -tune film` re-encode → verification readout |
| `scripts/verify-cue.sh` | Measures a time window in the *delivered* MP4, so you can prove a cue is audible instead of assuming it |

## Templates

| Template | Use |
|---|---|
| `assets/BRIEF.md` | Intake: product, audience, claim, angle, constraints, approved figures |
| `assets/STORYBOARD.md` | Frame-by-frame plan with durations, register, shot type and VO line |
| `assets/cues.example.json` | The SFX cue table format, annotated |
| `assets/frame-skeleton.html` | A working frame: camera rig, glass borders, cursor with the full click stack, and a word-cued timeline. Copy this, don't retype it |

## Definition of done

A launch film is finished when all of these are true. Anything less, say so plainly
rather than shipping quietly.

- [ ] Every on-screen number is on the approved-figures list
- [ ] Every reveal sits on its word (spot-check five at random against the transcript)
- [ ] Gates: 0 errors with the grade on; contrast passes with the grade off
- [ ] No frame is still moving when it cuts
- [ ] The delivered MP4 has been sampled at every changed beat and looked at
- [ ] Loudness measured on the delivered file: −14 LUFS ±0.5, true peak ≤ −1 dBTP
- [ ] Every SFX cue you added is measurably present in the delivered file
- [ ] Renders are versioned (`video-v3.mp4`), never overwritten
- [ ] You have written down what you would fix next

## Worked example

`examples/CASE-STUDY.md` walks the real film this skill was extracted from: a 44.2s
B2B SaaS launch film, 11 frames, seven director revisions from "this is very basic" to
delivered — with the specific note, the specific fix, and the measurement for each pass.
Read it when you want to see the loop in step 12 actually running.

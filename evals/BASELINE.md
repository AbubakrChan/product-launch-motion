# Baseline evaluation — RED / GREEN

The skill was tested the way its own Law 9 demands: run the scenario **without** it, record
what a capable model does unaided, then run the same scenario **with** it and compare. Every
change listed at the bottom came out of this, not out of taste.

Four runs, two scenarios, one fresh context each. Same model, same prompts except for the
instruction to read the skill.

---

## Scenario 1 — "the typing sound is inaudible"

A real defect in a real film: a keystroke cue nobody could hear. The agent could measure but
not modify.

### RED (no skill)

Diagnosed it correctly and thoroughly, including the arithmetic — a −37.4 dB source under a
−16.7 dB bed cannot be rescued by cue volume. It also independently found something the
project team had missed: **the levelled asset opens with 0.40s of room tone, so the sound
lands 400ms after the animation it punctuates.**

The unaided run was strong. This matters, and the honest read is that the skill's value on
this scenario is not "the model could not do it" — it is that the model did it here because
it happened to check the envelope, which nothing was requiring it to do.

### GREEN (with skill)

Reached the same two causes, with tighter numbers (onset measured at 0.435s at 20ms
resolution) and a per-100ms envelope table across both masters showing the cue arriving at
11.155s against an animation starting at 10.74s. It attributed the instinct that found it
to Law 9:

> Reading `wire-audio.mjs` showed a levelled asset at a sensible volume with a thorough
> comment explaining the arithmetic, and the honest-looking move was to report "this is
> already fixed, re-watch v7." Measuring the delivered file anyway is the only reason
> Cause B surfaced.

It then reported six defects **in the skill itself**, three of which were bugs in the
scripts. That is the run's real output.

---

## Scenario 2 — two products, two directions

Direct the launch films for a B2B accounts-payable platform and a DTC moisturiser. The test
is whether they come out the same.

### RED (no skill)

Produced two genuinely unalike surfaces — flat ledger-paper white with no camera and a
mechanical 120bpm foley grid, versus high-chroma riso silkscreen with continuous drift and
an analogue synth swell. Then audited its own pair and found **twelve structural
convergences**, including:

- the same three-act skeleton, turn at the same proportional point
- **the same ending, beat for beat** — drain to the lightest value, shrink to a wordmark,
  one short line, final five seconds
- the same rhetorical device (many collapsing into one) and the same climax mechanic
- the same sound dramaturgy and the same copy placement
- both refusing a camera, both flat 2D, both with no human presence
- **both breaking their category cliché in the same direction**

### GREEN (with skill)

All eleven direction dials differed between the two films, against a requirement of four.
The dial mechanism worked, and the run said so:

> The dial table … is the single most useful mechanism in the file — it converted "make
> them different" into a checkable list, and it's why B has no voiceover and A has no
> perspective.

And then reached the same verdict as the RED run, from the other side:

> **the two films look nothing alike and are structured almost exactly alike.** The skill's
> right column (free) worked; its left column plus the arc/shot defaults produced one shared
> chassis.

Two independent runs, one with the skill and one without, converged on the same finding:
**sameness survives in structure after it has been eliminated from surface.** That was the
single largest gap in the skill and it is now `references/11-creative-direction.md` §
"Sameness hides in structure, not in surface".

The GREEN run also caught the skill teaching its own defaults:

> My honest first instinct for both was to write those two entries back out with new hexes,
> and they would have passed every anti-sameness check in the file. **Nothing in the skill
> catches inheritance from its own worked examples.**

---

## What changed as a result

| Finding | Source | Change |
|---|---|---|
| Sameness lives in structure, not surface | both runs | New section in `11` with nine structural axes and a two-film test |
| Inheritance from the skill's own worked directions is uncaught | GREEN 2 | A worked direction matching your brief is now automatically one of the three you write **and** one of the two you kill |
| A silent head makes a levelled cue land late | RED 1, GREEN 1 | `level-sfx.mjs` detects the first transient and cuts from there by default; reports the head; trap 21 |
| A window measurement averages the defect away | GREEN 1 | `verify-cue.sh` now prints a per-100ms envelope; it is the check that separates a fix from a half-fix |
| `--bed` compared asset peak to bed mean — a false pass on the very file the docs are about | GREEN 1 | Rewritten to report peak-vs-peak and mean-vs-mean and to **stop issuing a verdict**, because masking is not predictable from levels |
| The bed figure mixed pre- and post-master | GREEN 1 | Documented: measure the isolated stem, not the mastered window (4.6 dB error in the flattering direction) |
| A no-voiceover film has no defined pipeline, though the skill recommends one | GREEN 2 | Cueing without narration added to `03` |
| Law 7 read as forbidding a continuous-camera film | GREEN 2 | Law 7 scoped to resolution, not stillness |
| Truth pass assumes the product already ships | GREEN 2 | Pre-launch sourcing added to `02` |
| Steps 1–3 are a loop, not a sequence | GREEN 2 | Stated in `SKILL.md` |
| Composition rules in `09` only hold for cut-based films | GREEN 2 | Scoped |
| Truncation seam when a cue is shorter than its asset | GREEN 1 | Documented in `07` |

## Honest limitations

- One run per cell. These are not statistically meaningful; they are a bug-finding
  instrument, and they found bugs.
- Both scenarios are diagnostic and planning tasks. Neither built and rendered a film end to
  end, so the build mechanics are covered only by the fact that the reference film exists.
- The RED runs were strong. On scenario 1 the unaided model reached the same diagnosis; the
  skill's contribution was making the check that found the second cause **required** rather
  than lucky. Anyone claiming a skill turns a bad answer into a good one should show the
  bad answer, and here there wasn't one.
- Scenario 2's two products share an emotional shape (relief from drudgery), which the GREEN
  run identified as the real convergence hazard. A pair with different shapes would be an
  easier test.

## Re-running this

The scenarios are worth re-running after any substantial edit, particularly scenario 2 —
it is the one that catches the skill drifting back into being a template.

Ask a fresh agent, once without the skill and once with it:

1. *"The typing sound in this film is inaudible. Diagnose and plan the fix. Measure; do not
   modify or re-render."*
2. *"Direct two 45-second launch films for [two unrelated products]. Give palette, ground,
   type, camera, texture, shot list, sound, transitions for each. Then audit honestly how
   similar your two answers are."*

The second prompt's final clause is the whole test. A model that cannot see its own
convergence will not fix it.

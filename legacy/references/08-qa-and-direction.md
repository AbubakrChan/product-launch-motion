# QA and direction

Owns Law 9: green gates are necessary, not sufficient.

Automated checks catch broken things. They do not catch bad films. A composition can lint
clean, render without error, pass every contrast threshold, and still be a slideshow with
an invisible cursor and an inaudible sound cue. Everything below exists to close that gap.

## Contents

- [The two-gate pattern](#the-two-gate-pattern)
- [What the gates do and do not catch](#what-the-gates-do-and-do-not-catch)
- [Snapshot review](#snapshot-review)
- [Verify the delivered file](#verify-the-delivered-file)
- [The director loop](#the-director-loop)
- [How to review your own film](#how-to-review-your-own-film)
- [Versioning renders](#versioning-renders)
- [Definition of done](#definition-of-done)

## The two-gate pattern

Run the automated checks twice, in two different states, because the film grade breaks one
of them:

```bash
# 1 · everything except contrast, WITH the grade on
npx hyperframes check --no-contrast

# 2 · contrast only, with the grade OFF
node scripts/wire-grade.mjs --off && npx hyperframes check
node scripts/wire-grade.mjs            # put it back
```

A full-canvas grade overlay makes a WCAG sampler read text against the *overlay* rather
than the design, which produces nonsense — a real reading of 1.06:1 on text that actually
passes comfortably. Gate with the grade off; ship with it on. Give every overlay pass an
`--off` switch for exactly this reason.

Target: **0 errors** on both. Warnings are worth reading once, then triaging; infos are
usually the grade and the glass rims occluding text they do not actually hide.

## What the gates do and do not catch

| Gate | Catches | Misses |
|---|---|---|
| **Lint** | Missing ids on media (silent audio), overlapping tweens on one property, banned non-deterministic calls, oversized files | Whether the motion means anything |
| **Runtime** | Exceptions during seek, missing timelines, failed asset loads | A timeline that runs but animates the wrong element |
| **Layout** | Text occlusion, container overflow, off-canvas panels, content overlap | A layout that fits perfectly and communicates nothing |
| **Motion** | Elements still moving at a frame boundary, tween conflicts | Whether the move is a camera or a drift |
| **Contrast** | Text below WCAG AA | An invisible white cursor on a gradient button — it is not text |

Two lint signals are worth treating as errors even when they are reported as warnings:

- **`duplicate_media_discovery_risk`** — two identical media elements with the same source
  and timing. Renderers discover media by id and can mis-assign; give the second one its
  own file (a copy under a different name is fine and costs kilobytes).
- **`overlapping_gsap_tweens`** — including exact butt-joins (one tween ending at 1.38 and
  the next starting at 1.38). Leave a 0.01s gap.

## Snapshot review

Before rendering the full film, sample it:

```bash
npx hyperframes snapshot --at 11.2,15.7,19.8,22.4,31.9 -o snapshots/qa
```

Pick times that are *inside* the beats you changed, not at their boundaries — a snapshot at
a cut tells you nothing. For a beat you rebuilt, sample at least three moments: the entry,
the payload, and the resolve.

Then **look at them at full resolution.** This matters more than it sounds. In the
reference film I judged two frames as "too small" from downscaled contact sheets, briefed a
rebuild, then measured and found one card already occupied 60% of the frame width and the
other 77%. Contact sheets are for spotting missing content; full-resolution stills are for
judging scale, weight and legibility.

## Verify the delivered file

The snapshot tool renders from the same source as the film but through a different path.
The file you ship is the only artefact whose behaviour is not an inference.

```bash
# frames at the beats you changed
ffmpeg -ss 19.75 -i renders/video-v7.mp4 -frames:v 1 snapshots/delivered/t19.75.png

# loudness and true peak
ffmpeg -i renders/video-v7.mp4 -af ebur128=peak=true:framelog=quiet -f null - 2>&1 \
  | grep -E "^\s+(I|Peak):"

# a specific audio cue, compared against the previous master
./scripts/verify-cue.sh renders/video-v7.mp4 10.72 0.76
```

This is where the reference film's inaudible-typing bug was caught, and it is the only
reason it was caught: the change looked correct in the source, the cue was present in the
assembled index, and it moved the delivered mix by 0.1 dB. Nothing short of measuring the
output would have found it.

## The director loop

Steps 1–11 of the pipeline produce a film. Step 12 is what makes it good, and it is the
step most likely to be skipped because the render succeeded.

```
render → watch → write the defect list → fix → re-render as a NEW file → repeat
```

The reference film went v1 → v7 this way. The notes that drove it were things no gate
reports:

| Pass | The note | What it actually meant |
|---|---|---|
| v2 | "You have not put attention to detail" | Reveals were near their words, not on them. Every cue re-derived from the transcript |
| v2 | "The line cuts the 'by hand' text" | A marker underline was drawn across the word instead of below it |
| v3 | "We may have sped it up a little more than we should" | The re-cut fixed drag and introduced clipping; the fix was tail holds, not a global slowdown |
| v5 | "I don't like the ripple behind the logo" | Two separate elements both read as a ripple; both had to go, not one |
| v6 | "The building-list part can be improved" | A label on a hairline was carrying a beat that needed a whole panel |
| v7 | "Make the cursor much better" | A life-size cursor is invisible on video |

Every one of those is a taste judgement that a machine cannot make and a human makes in
about two seconds of watching. Which is why the loop is the deliverable, not the render.

## Taking a note

A director's note is a **symptom report, not a specification.** The person giving it is
almost always right that something is wrong and almost never precise about what. Implement
the words literally and you will fix nothing; ignore them and you will fix nothing twice.

The move is to translate the note into a mechanism before touching anything:

| The note | The literal reading (wrong) | The mechanism (right) |
|---|---|---|
| "Make it 3D" | Add a rotation | A camera rig, depth on the elements the story touches, and a coordinate refactor so the shot can move as one object |
| "I don't like the ripple" | Delete the ripple element | Find *everything* that reads as a ripple — there were two, and removing one would not have satisfied the note |
| "It looks basic" | Add effects | A shot is carrying a beat with two rectangles. Rebuild what the shot *is*, not how it is decorated |
| "Add a typing sound" | Raise the cue volume | Measure. The cue may already exist and be arithmetically inaudible |
| "Speed it up" | Compress everything uniformly | Usually: tighten the clauses, keep or lengthen the tail holds |
| "The cursor is bad" | Redraw the cursor | It is probably invisible, not ugly — size, stroke and shadow before shape |

Three habits make this reliable:

1. **Ask what they saw, not what they want.** "At which second?" turns an aesthetic note
   into a frame number.
2. **Reproduce it before fixing it.** Extract the frame. If you cannot see what they saw,
   you do not understand the note yet.
3. **Say what you changed in their words.** "The cursor is bigger and clicks with a
   press-and-ripple" closes the loop; "refactored the transform hierarchy" does not.

When a note is genuinely wrong — and sometimes it is — the answer is a measurement, not an
argument. Two frames judged "too small" in the reference film turned out to occupy 60% and
77% of the frame width; the measurement ended the discussion in one line.

## Iteration economics

Full renders are the slowest possible way to check anything, and the habit of re-rendering
to see a change is what makes a film take a week.

| To check | Use | Cost |
|---|---|---|
| A tween's shape or timing | Studio/preview scrub at that second | seconds |
| Layout, composition, legibility | `snapshot --at t1,t2,t3` | seconds |
| Sync across a whole shot | Render that ONE frame's composition | ~1s per second of film |
| The grade, transitions, cuts | Draft-quality full render | ~half a final render |
| Anything audio | Full render + master, then measure | minutes |
| Delivery | Final render, master, verify | minutes |

Practical rules:

- **Snapshot before you render.** Most defects are visible in a still.
- **Iterate at draft quality**, and only go final when the shot is locked. Grain and
  `-crf 19` are for delivery, not for a look-see.
- **Render one composition, not the film**, when you are working on one shot.
- **Batch audio changes.** Audio is the only class of change that genuinely requires a full
  render plus a master to verify, so make all of them, then verify once.
- Keep the raws. Re-mastering is seconds; re-rendering is minutes.

## How to review your own film

Watch it three times, looking for one class of problem each time. Reviewing for everything
at once finds nothing.

**Pass 1 — sync.** Ignore the visuals. Does each thing appear on its word? Pick five
reveals at random and check them against the transcript.

**Pass 2 — motion.** Mute the audio. Is anything still moving when it cuts? Is anything
drifting for no reason? Is there a shot where nothing moves at all for more than a second
without it being a deliberate hold?

**Pass 3 — read.** Full screen, at distance, once. What do you actually remember
afterwards? If it is not the one claim from the brief, the film has a story problem that no
amount of polish fixes.

Then write the list before opening an editor. A written defect list keeps you from spending
an hour on the first thing you noticed while three worse things ship.

Useful self-checks that catch real defects:

- **Extract the last frame of every shot.** Anything mid-tween is a Law 7 violation.
- **Scan for double-printed text.** State swaps (label A → label B) that overlap for a few
  frames are common and look like a rendering bug.
- **Check every state you claim.** If a list "updates", find the frame before and after.
- **Look for orphaned DOM.** A mis-closed div during an edit can leave old markup rendering
  at the canvas origin; it is invisible in code review and obvious in a still.

## Versioning renders

**Never overwrite a render.** `video-v1.mp4`, `video-v2.mp4`, and the raw alongside each
master. Three reasons, all of which came up:

1. A/B comparison is how you prove a fix worked (the typing cue was verified by measuring
   the same window in v6 and v7).
2. A director who liked v5's ending needs v5 to still exist.
3. A render that regressed is only diagnosable against the one that did not.

Keep the raws too. Re-mastering from a raw takes seconds; re-rendering takes minutes and,
if the source has moved on, may not reproduce.

## Definition of done

- [ ] Both gates: 0 errors (grade on, minus contrast; grade off, contrast only)
- [ ] Every on-screen number is on the approved-figures list
- [ ] Five randomly chosen reveals verified against the transcript
- [ ] Last frame of every shot is static
- [ ] Delivered file sampled at every changed beat and looked at, full resolution
- [ ] Delivered loudness −14 LUFS ±0.5, true peak ≤ −1 dBTP
- [ ] Every added SFX cue measurably present in the delivered file
- [ ] Renders versioned, raws kept
- [ ] A written list of what you would fix next

That last item is not ceremony. A film with a known, stated defect list is in a better
state than a film someone has declared finished — and it is the honest thing to hand over.

## Related

- `references/03-word-locked-sync.md` — what "on the word" means and how to check it
- `references/07-sound-and-master.md` — the measurement commands for audio
- `references/10-traps.md` — the specific failures these checks exist to catch

---
format: 1920x1080
fps: 30
duration: <derived from real VO length — fill AFTER the voiceover exists>
claim: "<the ONE claim from BRIEF.md>"
arc: problem → agitate → thesis → product → proof → contrast → act
---

# STORYBOARD — <product name>

## Video direction

The rules this film is held to. Write them once here; every frame answers to them, and a
reviewer can check a frame against this section without reading the code.

**Register map.** <argument ground> for the argument (frames …), <product ground> for the
product and its evidence (frames …). Every register change is a story turn and carries a
transition.

**Palette.** One accent, rationed to the five jobs listed in `BRIEF.md`. No third hue.
Small accent-coloured text uses the AA-safe darker variant.

**Motion grammar.** One camera per shot. Entrances 0.24–0.38s, `power3.out`, `fromTo`
always. Overshoot only on state flips and confirmations. Reveals are VO-cued: at t=0 a
frame carries only what the voice is saying at t=0. No `repeat`/`yoyo`, no `Math.random`,
no `Date.now`. Nothing is moving when a frame cuts.

**Rhythm.** Frames <n> and <n> are the deliberate breathers — one restrained move, then a
still read. They sit either side of the busiest stretch.

**Type.** <family> by role. Numerals `tabular-nums`. Headlines −0.025em.

**Sound.** Bed at ~0.1. SFX named per frame in `audio/cues.json`, each annotated with the
word it punctuates. Sub-bass on the thesis and the CTA only. Silence in front of both.

**Negative list.** <copy from BRIEF.md>

## Frames

Duration is derived from real narration length plus a tail hold plus the transition pad —
fill it after the voiceover exists, never from an estimate.

### Frame 1 — <name>

- **scene**: <what the viewer sees, one sentence>
- **voiceover**: "<the exact line>"
- **duration**: <s>
- **register**: argument | product
- **shot**: <from references/09-shot-catalog.md>
- **camera**: locked | turn | turn + dolly to <control>
- **transition_in**: cut | crossfade | zoom-through
- **cues**: <word>@<t> → <what lands>; <word>@<t> → <what lands>
- **sfx**: <asset>@<word>
- **src**: compositions/frames/01-<name>.html

### Frame 2 — <name>

- **scene**:
- **voiceover**: "…"
- **duration**:
- **register**:
- **shot**:
- **camera**:
- **transition_in**:
- **cues**:
- **sfx**:
- **src**:

<!-- repeat per frame -->

## Composition check

Before building, read the frame list top to bottom and confirm:

- [ ] The ONE claim lands inside the first 10 seconds
- [ ] No two adjacent frames use the same camera move
- [ ] Busy and still alternate; no three dense shots in a row
- [ ] Every register flip is a genuine story turn
- [ ] Every number planned for screen is on the approved-figures list
- [ ] Total runtime is within the target band

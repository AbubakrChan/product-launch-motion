# Word-locked sync

Owns Law 2. This is the difference between animation that illustrates narration and
animation that merely accompanies it.

The rule: **every reveal is cued to the measured start time of the word it illustrates.**
Not to a beat grid, not to a stopwatch estimate, not to "roughly when he says it" — to a
word-level transcript of the actual voiceover file you are shipping.

Viewers cannot articulate this, but they feel it instantly. A chip that appears 200ms
after the word that names it reads as lag. The same chip on the word reads as the voice
causing it.

## Contents

- [Voiceover first](#voiceover-first)
- [Getting word timings](#getting-word-timings)
- [The cue table](#the-cue-table)
- [Cueing in practice](#cueing-in-practice)
- [Deriving frame durations](#deriving-frame-durations)
- [Pacing and holds](#pacing-and-holds)
- [Re-cutting the narration](#re-cutting-the-narration)
- [Choosing a voice](#choosing-a-voice)

## Voiceover first

Render or record the voiceover **before building a single frame.** Frame durations are
derived from real narration length; if you build to estimates you will rebuild every
timeline when the real audio comes in half a second longer.

This inverts the instinct to storyboard visually first. Storyboard the *shots* first, yes —
but the moment you need a number, that number comes from the wav.

Order of operations:

1. Write the script (`references/02-story-and-truth.md`)
2. Render one audio file per narration line
3. Transcribe with word-level timestamps
4. Derive each frame's duration from its line's length, plus a tail hold
5. Only now, build frames

## Getting word timings

Any transcriber that returns word-level timestamps works. Whisper locally is the usual
choice because it is free, offline and accurate enough:

```bash
whisper assets/voice/01.wav --model small --word_timestamps True --output_format json
```

Normalise whatever you get into one table the frames can read:

```bash
node scripts/word-timings.mjs --transcript transcript.json --out audio_meta.json
```

```json
{
  "01-hook": {
    "duration": 4.02,
    "words": [
      { "w": "Find",   "start": 0.11, "end": 0.42 },
      { "w": "the",    "start": 0.42, "end": 0.55 },
      { "w": "creators","start": 0.55, "end": 1.08 }
    ]
  }
}
```

Two practical notes:

- **Timings are per frame, frame-relative.** A cue inside a frame is expressed relative to
  that frame's start, so re-ordering frames does not invalidate the cues.
- **Spot-check the first and last word of every line.** Transcribers clip leading
  consonants and occasionally merge two short words; a wrong start on the first word
  offsets an entire shot.

## The cue table

Write the timings you actually use into a comment table at the top of the frame, then cue
against it. This is the artefact that makes a frame reviewable — a reader can check the
sync without opening an audio editor.

```js
/* VO: "It searches three hundred and fifty million creators and finds the contact."
   "searches"@0.16  "350"@0.77  "million"@1.47  "creators"@2.02
   "and"@2.68  "finds"@2.84  "the"@3.15  "contact."@3.33                        */

tl.to(glow, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.16);   // "searches"
tl.to(count, { opacity: 1, duration: 0.22, ease: "power2.out" }, 2.02);  // "creators"
click(1, 2.84);                                                          // "finds"
```

Every cue carries the word in a trailing comment. When someone later asks "why 2.84?", the
answer is in the file.

## Cueing in practice

**Cue the meaning, not the noun.** The word to lock to is the one that makes the visual
make sense — usually a verb or the emphasis word, not the subject.

**Lead by a hair when the eye needs travel time.** An element that must be *read* can start
0.02–0.06s early so that it is legible on the word. An element that is a *hit* (a click, a
state flip, a stat landing) fires exactly on the word.

**Lead the travel, land the beat.** A cursor crossing a card needs 0.2–0.3s of eased
travel. Start the move early; put the *click* on the word. The word-locked event is the
one the viewer connects to the sentence.

**Count-ups start on the word that names them and finish before the next clause.** A
counter still spinning while the voice has moved on reads as a stall.

**Weight reveals to the back half of a shot.** At t=0 a frame carries only what the voice is
saying at t=0. Everything else arrives as it is spoken. This single habit is what stops a
shot from being a slide that fades in complete.

**One beat can carry two cues, never three.** If three things must land on one word, you
have a storyboard problem, not a timing problem.

## Deriving frame durations

```
frame duration = narration length + tail hold + transition pad
```

The tail hold is the breath after the line — 0.2–0.5s, longer before a hero beat because
silence is what makes the next hit land (`references/07-sound-and-master.md`). The
transition pad is whatever the outgoing transition needs to overlap the next frame.

Set the root's `data-duration` and every timed child to the same padded value. Mismatched
durations between a frame root and its clips is a common source of a frame that goes blank
just before the cut.

## Pacing and holds

Pace is a direction note, not a constant. The reference film was re-cut 10% faster after a
first pass that dragged, and then given tail holds after a second pass that was too
clipped — the final film is *faster in the clauses and slower at the ends* than either.

Practical guidance:

- If the voice finishes a clause and the visuals are still resolving, the shot is too slow.
- If a shot cuts within ~0.2s of its last motion, it is too fast — the viewer has no time
  to read the state you just built.
- Put a genuine breather on either side of the busiest stretch. Two consecutive dense
  product shots exhaust an audience faster than one long one.

## Re-cutting the narration

If you speed up or re-render the VO, **every cue in the film is now wrong.** Two options:

1. Re-transcribe and re-derive all timings (correct, and what you should do).
2. If you applied a uniform tempo change (`atempo=1.1`), rescale the existing word table by
   the same factor (`start / 1.1`) — valid only for a uniform change, and worth
   spot-checking against the new wav at three points before trusting it.

Changing voice, speaker or model is never a uniform change. Re-transcribe.

## When there is no voiceover

A silent film is a legitimate and often correct choice — feed placements autoplay muted, and
a narrated skincare film is the category default you may want to break. But Law 2 as written
assumes words to lock to, and "cue to a beat grid instead" is exactly what it forbids. So
the law generalises rather than lapses:

> **Every reveal is cued to the thing that motivates it.** With narration, that is the word.
> Without narration, it is a physical event or the moment a viewer has finished reading.

Three sources of truth replace the transcript:

1. **Sound-design events.** If the film is sound-led, the cue grid is the SFX transients, and
   you build it the other way round: place the sound events first, measure their onsets
   exactly as you would words (`volumedetect` in 100ms slices, or read them off the asset),
   and cue the visuals to those. The discipline is identical — measured onsets, never
   estimates.
2. **Reading time.** A title card cannot be cued; it must be *held*. Budget a minimum of
   ~0.35s per word plus 0.3s of settle, never less than 1.2s for any card, and longer for a
   card carrying a number. Read it aloud at a natural pace and time yourself — if you can
   finish comfortably, a viewer can.
3. **The action itself.** In a demonstration, the motivating event is on screen: the lid
   lifts, the row resolves, the value lands. Cue everything else to that.

Two things do not change. Durations still come from measured content rather than estimates —
you are measuring reading time and sound onsets instead of speech. And nothing is arbitrary:
if you cannot say what a reveal is cued *to*, it is cued to nothing, which is the definition
of a slideshow.

## Choosing a voice

| Option | Cost | Trade-off |
|---|---|---|
| **Local neural TTS** (e.g. Kokoro-82M) | Free, offline, CPU | Fully deterministic and re-runnable, but audibly synthetic — acceptable for internal and iterative work, noticeable on a public launch |
| **Commercial TTS** | Per-character | Best quality-per-effort for a public film; pin the voice and model version, because a model update will change your timings |
| **Human recording** | Time or money | Still the best, and the only option that can carry irony. Record before the storyboard is fixed, not after |

Whichever you choose, the pipeline is identical: a wav plus word timings. That is the whole
interface, which is what makes the voice swappable at all.

One caveat learned the hard way: some TTS drivers silently ignore a `--speed` flag. If
tempo matters, verify the output length rather than trusting the parameter, and apply tempo
changes with ffmpeg (`atempo`) where you can measure them.

## Related

- `references/02-story-and-truth.md` — writing the script the voice will read
- `references/04-motion-grammar.md` — how long a cued entrance should take
- `references/07-sound-and-master.md` — SFX cues on the same word grid
- `scripts/word-timings.mjs` — transcript → cue table

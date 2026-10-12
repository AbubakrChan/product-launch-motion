# Sound and mastering

Owns Law 6 (sound is arithmetic, not taste).

Sound is where the most confident wrong decisions get made, because nobody measures. A cue
you believe you added, at a volume you believe is right, is often contributing tenths of a
decibel to the mix. This document is mostly about proving things.

## Contents

- [The three layers](#the-three-layers)
- [Designing the cue table](#designing-the-cue-table)
- [The volume-arithmetic law](#the-volume-arithmetic-law)
- [Levelling an asset](#levelling-an-asset)
- [Sub-bass and silence](#sub-bass-and-silence)
- [Mastering](#mastering)
- [The two mastering traps](#the-two-mastering-traps)
- [Verification](#verification)
- [Licensing](#licensing)

## The three layers

| Layer | Job | Typical level |
|---|---|---|
| **Narration** | Carries the argument. Everything else serves it. | The loudest thing in the mix |
| **Music bed** | Continuity across cuts, and a floor under the silence | ~0.1 of full scale — if you notice it, it is too loud |
| **SFX** | Punctuation. Confirms that a thing on screen happened | Individually placed, individually measured |

A launch film does not need a score. It needs a bed quiet enough that a viewer watching
without headphones never thinks about it, and cues sharp enough to be felt rather than
heard.

## Designing the cue table

Every cue names the word it punctuates. Not the second — the word. When the script is
re-cut, the seconds all move and the words do not, so a cue table annotated with words
survives a re-cut and a cue table of bare numbers does not.

```js
// frame-relative cue times, resolved against real frame starts at wire time
const SFX = {
  "04-prompt": [
    ["mouse-click", 0.04, 0.36, 0.45],       // "Ask" — click into the field
    ["keyboard-typing-loud", 0.27, 0.76, 0.55], // "plain English" — the query types
    ["mouse-click", 1.30, 0.36, 0.50],       // "it goes" — submit
    ["ux-chime",    1.55, 0.34, 0.30],       // "to work" — the agent starts
  ],
};
// [ asset, start (s, frame-relative), duration (s), volume (0–1) ]
```

Rules that keep a cue table from turning into noise:

- **One cue per event, not per element.** Six cards landing get one stagger of three quiet
  pops, not six.
- **Match the cue to the physics.** A click for a press, a soft chime for an arrival, a
  whoosh for something entering frame, a tick for a state flip. A chime on a click is the
  most common tell of a template.
- **Nothing repeats.** A cue that fires more than twice in a 45s film becomes a tic.
- **Silence is a cue.** See below.
- **Frame-relative, resolved late.** Author cues relative to the frame that owns them and
  let the wiring script resolve them against real frame starts after assembly — otherwise
  every timing edit upstream invalidates the whole table.

## The volume-arithmetic law

**A cue's volume cannot rescue a quiet source file.** This is arithmetic, not mixing
philosophy.

The reference film had a typing cue on its hero shot that nobody could hear. The obvious
response — raise the volume — was applied twice, from `0.35` to `0.85`. The measured effect
on the delivered file was **0.1 dB**.

The reason: the source is a distant room recording with a mean level of **−37.4 dB**, and
the narration bed in that window sits at **−16.7 dB**. Summing a −38 dB signal into a
−17 dB signal changes the total by about a hundredth of a decibel. There was no volume
value in the 0–1 range that would have worked.

So before you argue about a cue's level, measure both sides:

```bash
# the asset
ffmpeg -hide_banner -i audio/sfx/keyboard-typing.mp3 -af volumedetect -f null /dev/null 2>&1 \
  | grep -E "mean_volume|max_volume"

# the same window in the delivered film
ffmpeg -hide_banner -ss 10.72 -t 0.76 -i renders/video-v1.mp4 -vn -af volumedetect \
  -f null /dev/null 2>&1 | grep -E "mean_volume|max_volume"
```

If the asset's mean is more than ~15 dB below the narration's, no cue volume will save it.
Level the asset.

## Levelling an asset

Trim to the part you need, gain it, and limit the peaks so the transients survive without
clipping:

```bash
ffmpeg -ss 0 -t 1.1 -i keyboard-typing.mp3 \
  -af "volume=22dB,alimiter=level_out=0.9:limit=0.9,afade=t=out:st=0.95:d=0.15" \
  -c:a libmp3lame -b:a 192k keyboard-typing-loud.mp3
```

That took the reference film's typing bed from mean −37.4 / peak −8.1 to mean −24.2 /
peak −1.1. Cued at `0.55`, its transients land at −6.3 dB — audible under a −17 dB
narration without competing with it. `scripts/level-sfx.mjs` wraps this and prints the
before/after so the decision is on the record.

Keep the original file. The levelled variant is a derived asset with a different name
(`-loud`), so the raw source stays available for a different context.

Transients are what you are protecting. Mean level tells you whether a bed is present;
peak level tells you whether a keystroke or a click will be *heard*. For percussive cues,
peak is the number that matters.

**Cut from the first transient, not from zero.** Field recordings open with room tone. If
you trim from `-ss 0` you have levelled the silence too: the asset is loud, every
measurement passes, and the cue still lands late because its first hit is 400ms in. That
shipped in a real film and covered only the back 44% of the animation it was punctuating
(trap 21). `level-sfx.mjs` detects the onset and starts there by default.

**Measure the bed on the isolated narration stem, not on the mastered film.** Cue volumes
are applied *before* mastering, so comparing an asset against a post-master window compares
the wrong things — in the reference film the stem measured −21.3 dB where the mastered
window measured −16.7 dB, a 4.6 dB error in exactly the direction that flatters the cue.

**Watch the truncation seam.** If a cue's `data-duration` is shorter than the asset, the
clip hard-cuts wherever the timeline says, not where the audio ends — and your `afade` is
positioned relative to the *asset*, so it never plays. Either match the fade to the
shortest cue that uses the asset, or listen at the cut for a click.

## Sub-bass and silence

Two techniques carry most of the emotional weight in a launch film, and both are cheap.

**Sub-bass on the hero reveal.** One low hit under the thesis and one under the CTA, long
(1.7–1.8s) and quiet (0.2–0.22), so it is felt rather than heard. Never on a product beat —
if everything gets a sub, nothing lands.

**Silence in front of it.** The hit only works because the shot before it ends with a tail
hold and near-silence. Build the gap deliberately: end the preceding frame's motion early,
let the bed carry ~0.3s of nothing, then hit. This is the cheapest professional-sounding
move available and it costs one number in a storyboard.

## Mastering

Two passes, because `loudnorm` needs to measure before it can correct.

```bash
# pass 1 — measure
ffmpeg -i renders/video-v1-raw.mp4 -af loudnorm=I=-14:print_format=json -f null -

# pass 2 — correct, limit, re-encode
ffmpeg -i renders/video-v1-raw.mp4 \
  -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.0:LRA=7:linear=true:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…,alimiter=limit=0.891:level=disabled:attack=5:release=50" \
  -c:a aac -b:a 192k -movflags +faststart renders/video-v1.mp4
```

Targets: **−14 LUFS integrated, ≤ −1.0 dBTP.** That is the level most social and web
platforms normalise toward; deliver louder and the platform turns you down, which squashes
your dynamics for nothing.

The video is **re-encoded, not copied**. Film grain defeats inter-frame compression, so
`-c:v copy` preserves a bloated file; `-crf 19 -tune film` took a 68 MB render to 38 MB
with no visible loss (`references/06-look-and-grade.md` has the grain side of this).

`scripts/master.sh` runs both passes, fills the measured values in automatically, and
prints the verification readout.

## The two mastering traps

**1 · `loudnorm`'s `linear=true` does not back off for a new transient.** It computes one
gain for the whole file from the pass-1 measurements. Add one louder cue after measuring —
or measure a different cut — and a peak can land above the target. In the reference film
the louder keystrokes pushed the master to **+1.1 dBFS**: clipped. A limiter after
`loudnorm` is not belt-and-braces, it is the thing that catches this.

**2 · `alimiter` applies makeup gain unless you disable it.** Its output is scaled by
`level_out / limit`, so `alimiter=limit=0.891` alone raises everything by ~1 dB. Adding the
limiter to fix trap 1 produced **−13.0 LUFS / −0.0 dBFS** — louder than the target the
limiter was added to protect. Pass `level=disabled`.

A third, smaller one worth knowing if you script this in zsh: quoting the filter chain
carelessly can mangle it. Keep the whole `-af` argument in one double-quoted string, or
build it in a variable, and echo it before running if a parse error appears.

## Verification

Never call a mix done off the filter graph's own report. Measure the delivered file.

```bash
# integrated loudness and true peak, on the file you will actually ship
ffmpeg -i renders/video-v1.mp4 -af ebur128=peak=true:framelog=quiet -f null - 2>&1 \
  | grep -E "^\s+(I|Peak|LRA):"
```

Expected: `I: -14.0 LUFS`, `Peak: ≤ -0.8 dBFS`. (AAC encoding can add a hair above the
limiter ceiling; that is normal.)

And prove each cue you added is present, by comparing the same window in the old and new
masters:

```bash
./scripts/verify-cue.sh renders/video-v1.mp4 10.72 0.76
```

In the reference film that window went from **−4.6 dB peak (inaudible cue)** to
**−1.4 dB peak (audible keystrokes)** — which is the evidence that the fix worked. "It
sounds better to me" is not evidence, especially at 11pm on the machine that rendered it.

## Licensing

Freeze your SFX and music kit locally and record the licence. A launch film that has to be
pulled because a bed was licensed for personal use only is an expensive way to learn this.
Prefer sources with a blanket commercial licence, keep the original filenames, and write
the licence into the project README next to the kit.

## Related

- `references/03-word-locked-sync.md` — where the cue times come from
- `references/06-look-and-grade.md` — the grain/compression side of the re-encode
- `references/08-qa-and-direction.md` — where verification sits in the loop
- `references/10-traps.md` — the full trap index

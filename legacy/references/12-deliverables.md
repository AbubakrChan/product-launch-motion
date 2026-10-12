# Deliverables

A launch film is not one file. Shipping only the 16:9 master is the most common way a good
film underperforms: it plays muted in a feed with no captions, letterboxed into a vertical
slot, with a thumbnail nobody chose.

Decide the deliverable set at intake, not after the render — some of it changes how you
compose the frames.

## Contents

- [The set](#the-set)
- [Aspect variants](#aspect-variants)
- [Platform safe areas](#platform-safe-areas)
- [Captions](#captions)
- [Poster frame and thumbnail](#poster-frame-and-thumbnail)
- [Loops and stills](#loops-and-stills)
- [Naming and handoff](#naming-and-handoff)

## The set

| Deliverable | Why | Notes |
|---|---|---|
| **16:9 master** | Site hero, YouTube, decks | −14 LUFS, ≤ −1 dBTP, `+faststart` |
| **9:16 cut** | Reels, TikTok, Shorts, Stories | Re-laid out, not cropped — see below |
| **1:1 cut** | Feed placements | Often skippable if you have 9:16 |
| **Captions** | Feeds autoplay muted | Burned-in for social, `.srt` alongside the master |
| **Poster frame** | The still shown before play | Chosen, not the accidental first frame |
| **Silent cut** | Sites that autoplay without sound | Same picture, audio track stripped |
| **Stills** | Launch posts, docs, press | 3–6 full-resolution PNGs |
| **Short loop** | READMEs, X/LinkedIn posts | 2–4s GIF or MP4 |
| **The raws** | Re-mastering later | Keep alongside every master |

## Aspect variants

**Re-lay out; do not crop.** A crop of a 16:9 composition throws away a third of the frame
and leaves type at the wrong size. Because the film is HTML, a vertical cut can be a real
re-composition of the same content at almost no cost — this is a genuine advantage over
timeline tools, and it is worth designing for from the first frame.

Two habits make it nearly free:

1. **Size type and spacing in container units** (`cqw`/`cqh`) rather than pixels, with
   `container-type: size` on the frame root. The same frame at 1080×1920 then scales its
   own typography instead of needing a second stylesheet.
2. **Keep each shot's payload in a central band.** If the meaningful content of every shot
   lives inside the middle ~60% horizontally, the vertical re-layout is a reflow rather
   than a redesign.

What actually changes in a 9:16 cut:

- Two-column shots become stacked. A left rail beside a detail pane becomes the detail pane
  with the rail collapsed to a summary, or two beats in sequence instead of one composite.
- Camera moves shorten. A horizontal dolly has less room; substitute a push.
- Type gets larger relative to the frame, and lines get shorter — re-break every headline.
- The runtime usually wants to be shorter. Feed attention is not deck attention; cutting a
  45s film to 30s for vertical is normal, and the beat to cut is almost always a
  product-detail shot, never the claim.

## Platform safe areas

Platform chrome covers parts of the frame at playback. These are approximate and they
change — verify against the current spec before a launch, and preview on a real device
rather than trusting a diagram.

| Placement | Keep clear |
|---|---|
| Reels / TikTok / Shorts | Bottom ~20% (caption and handle), right ~12% (action rail), top ~10% |
| Stories | Top ~14% and bottom ~14% |
| YouTube | Bottom ~10% while controls are visible |
| Site hero | Whatever your own overlay/gradient covers — check the real page |

Practically: enforce one bottom keep-out band across the whole film (the reference film used
~17%) and never place the claim, a figure, or a CTA inside it. That single rule survives
most platform changes.

## Captions

**Assume muted.** On feed placements, most views start without sound, and a launch film
whose claim only exists in the voiceover has no claim.

Two responses, and you usually want both:

1. **The claim is on screen as type** in the first seconds, regardless of captions. This is
   a storyboard decision, not a post step.
2. **Captions**, burned in for social cuts and shipped as `.srt` beside the master.

You already have everything needed to generate them: the word-level timings from
`references/03-word-locked-sync.md` are strictly better than a re-transcription, because
they match the audio you actually shipped. Group words into cards, do not caption
word-by-word:

- Two lines maximum, roughly 32–42 characters per line
- One to three seconds per card; break on clause boundaries, never mid-phrase
- Position above the platform's bottom chrome, not at the true bottom edge
- Match the film's typeface; do not use a default caption font on a designed film
- Never let a caption cover a figure or the product

If you burn them in, keep an un-captioned master too — the site hero usually should not
have them, and a client will ask.

## Poster frame and thumbnail

The poster is the first thing anyone sees and, for most viewers, the only thing. Choose it.

- Pick a frame that reads at **200px wide**. Test it at that size, not full screen.
- Usually the thesis card or the end lockup — a frame with few elements and legible type.
- Avoid a mid-motion frame, a half-typed string, or a frame with a cursor in it.

```bash
ffmpeg -ss 9.4 -i renders/video-v7.mp4 -frames:v 1 -q:v 2 deliverables/poster.jpg
```

Set it explicitly in the embed (`<video poster="…">`), or the browser picks frame 0, which
is usually an empty ground.

## Loops and stills

A 2–4 second loop is the highest-leverage secondary asset: it is what goes in the README,
the changelog, the launch post and the docs.

```bash
# a small, clean loop — palettegen matters, or gradients band badly
ffmpeg -ss 18.55 -t 2.6 -i renders/video-v7.mp4 \
  -vf "fps=12,scale=720:-1:flags=lanczos,palettegen=max_colors=128" -y /tmp/pal.png
ffmpeg -ss 18.55 -t 2.6 -i renders/video-v7.mp4 -i /tmp/pal.png \
  -lavfi "fps=12,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  deliverables/loop.gif
```

Choose a segment that contains one complete idea — a state change, a count landing, a
camera move resolving. A loop of ambient drift says nothing.

For stills, extract at full resolution and pick moments where a single thing is true. Six
is plenty.

## Naming and handoff

```
deliverables/
  ledgerline-launch-16x9-v3.mp4        master
  ledgerline-launch-16x9-v3.srt        captions
  ledgerline-launch-9x16-v3.mp4        vertical cut, captions burned in
  ledgerline-launch-16x9-v3-silent.mp4 audio stripped
  poster.jpg
  loop.gif
  stills/01.png … 06.png
  raws/                                every unmastered render
```

Hand over the direction document and the brief with the files. Six months later, the person
asked to make "another one like that" needs to know what the direction *was* — the palette,
the signature move, the dial positions — or they will produce something that merely
resembles it.

Include the licence for every third-party asset: music, sound effects, fonts, any
photography. A film pulled after launch over a bed licensed for personal use is an
expensive lesson.

## Related

- `references/03-word-locked-sync.md` — the timings captions are generated from
- `references/11-creative-direction.md` — the direction document you hand over
- `references/08-qa-and-direction.md` — verify each variant, not just the master

# Case study — a 44.2s B2B SaaS launch film, v1 → v7

This skill was extracted from one film. It is worth reading the revision history rather
than just the finished frames, because **every technique in this repo exists as the answer
to a specific director's note** — and the notes are the part you cannot get from a tutorial.

- **Product**: an AI-native influencer-marketing platform (SaaS, B2B, sales-led)
- **Angle**: the product's own headline — *"Hire the agent, not the agency"*
- **Delivered**: 44.2s · 1920×1080 @ 30fps · 11 frames · 30 MB · −14.0 LUFS / −0.8 dBTP
- **Built with**: HTML + CSS + GSAP, rendered by HyperFrames; local TTS narration; a frozen
  local SFX kit; ffmpeg mastering
- **Render time**: ~50s. **Master time**: ~10s. The direction loop took days.

![The search surface with glass borders and a rack-focused stat](still-2.jpg)

## The arc

| # | Frame | Beat |
|---|---|---|
| 1 | Hook | Four verbs of the manual work, stacking up |
| 2 | Pain | Seven lifecycle stages crowd in, and the cost of doing it by hand |
| 3 | Thesis | The claim, held still |
| 4 | Prompt | Ask in plain English; the agent goes to work |
| 5 | Discovery | The search runs and finds the contact |
| 6 | Outreach | Drafts, replies, negotiates |
| 7 | Fulfilment | Ships the product, catches every post |
| 8 | Proof (numbers) | The customer's real figures |
| 9 | Proof (human) | One person did the work of a whole team |
| 10 | Contrast | Point tools / agencies / the product |
| 11 | CTA | The lockup |

Frames 1–3 and 10–11 sit on the dark argument register; 4–9 on the light product register.
Every flip is a story turn and carries a transition.

## The revisions

### v1 → v2 · "You have not put attention to detail in it"

The full note was *"everything should be synced for what the user is saying"* — and it was
correct. Reveals were near their words, not on them, which reads as lag even when a viewer
cannot name it.

**What changed.** Every cue in all eleven frames was re-derived from a word-level
transcript of the actual narration files. Frames 5 and 7 were rebuilt natively instead of
using cropped screenshots. A custom cursor was added to the three UI-demo shots.

Also in this note: *"the line cuts the 'by hand' text — it does not go below it, but on
it."* A marker underline was being drawn across the word. The fix exposed a real trap: the
word sits under a camera-scaled ancestor, so `getBoundingClientRect` returns numbers in the
wrong space. It had to be measured with `offsetWidth` / `offsetLeft` / `offsetTop`.

→ `references/03-word-locked-sync.md`, trap 5 in `references/10-traps.md`

### v2 → v3 · "We may have sped it up a little more than we should"

The v2 re-cut fixed the drag and introduced the opposite problem: shots were cutting within
a couple of frames of their last motion, so there was no time to read the state.

**What changed.** Tail holds on every frame — the film went from 40.3s back to 44.2s, but
*faster in the clauses and slower at the ends* than either previous cut. Pace is a
direction note, not a constant.

This pass also added the film grade (grain, vignette, three specular sweeps on named story
beats) and sub-bass under the two hero reveals. Both had complications worth recording:

- The first grade attempt used `mix-blend-mode` and **rendered the entire film white**,
  because each track composites as its own layer and a `multiply` over transparency paints
  its own source colour.
- Per-frame grain took the render from **9 MB to 85 MB** and read as electronic sizzle. The
  fix was a 12 Hz re-seed and a `-crf 19 -tune film` re-encode.
- A full-canvas grade broke the automated contrast gate, which reported a nonsense
  **1.06:1**. The pass got an `--off` switch so contrast can be gated with the grade
  removed.

→ `references/06-look-and-grade.md`, traps 1, 24 in `references/10-traps.md`

### v3 → v4 · runtimes, and a bake-off

Five motion tools were raced on the same beats to find out what was worth adopting. The
verdicts are in the README's stack table; the short version is that GSAP earns its place,
Lottie is good for a logo draw-on with one serious trap, Rive can be mounted but not
authored by an agent, Three.js is a one-shot tool, and Remotion is a genuine peer whose
laws are the same.

### v4 → v5 · "I don't like the ripple effect behind the logo"

The end card had two separate elements that both read as a ripple — a Lottie burst and
three concentric rings. Removing one would not have satisfied the note; the note was about
the *impression*, not the element.

Two more notes in the same pass, both about a shot doing too little:

- *"The creator search — when you click, it should show a skeleton loading and then
  results."* Four finished rows appearing is a slide. Rows that land as skeletons and
  resolve in sequence read as a query being answered.
- *"The 'hire the agent' background can be improved, or removed if difficult."* It was a
  Rive layer that was not rendering reliably. Replaced with an aurora gradient mesh — three
  broad brand-hued pools with one slow drift, which never crosses the type.

### v5 → v6 · "The building-list part can be improved"

One beat — the moment the agent starts working — was carried by a text label on a hairline
progress bar. Two thin slabs in an empty frame.

**What changed.** It became an agent run panel: a header with a live state pill and three
steps that complete in sequence with rings flipping to checks. The last step is deliberately
left *running* when the frame cuts, because the next frame is what completes it — the shot
does not claim a result the film has not shown yet.

Caught during this pass: a DOM splice closed at the wrong `</div>` and left orphaned markup
rendering at the canvas origin. Invisible in code review, obvious in a still.

→ trap 8 in `references/10-traps.md`

### v6 → v7 · the cursor, the camera, and the people

The final note was six notes, and they are the reason half this repo exists.

![The inbox shot with a 3D turn, a camera push and a visible cursor](still-3.jpg)

**"Add a typing sound."** There already was one. It was mathematically inaudible: the source
was a distant room recording at −37.4 dB mean, under a −16.7 dB narration bed. Raising the
cue volume from 0.35 to 0.85 moved the delivered mix by **0.1 dB** — measured. The fix was
to level the *asset* (+22 dB through a limiter), after which the delivered window's peak
went from **−4.6 dB to −1.4 dB**. This is where Law 6 comes from.

**"Make it 3D, do the camera rotation, do the cursor zoom in."** The inbox shot was rebuilt
on a two-node camera rig. Its card and contents had been separate canvas-space siblings, so
they *could not* move as one object — the first structural fix was converting the whole
shot to rig-local coordinates. The camera now turns across the shot and pushes 1.12 onto the
Accept button, with the zoom origin on the button itself so the cursor stays aimed.

**"Focus on the cursor."** The pointer was life-size and vanished into a gradient button.
It went to 44×54 with a heavy stroke, a deep shadow, a three-layer click and bowed travel.

**"Have actual conversations on the left side."** The rail listed four names against the
words "Draft ready" four times. It now carries each thread's last real message — and row
one's line changes to the reply, with an unread dot, at the moment the reply lands.

**"The fulfilment left side can be improved."** An eyebrow, a pill and three checks floating
on white. It became the order itself: the real product photograph as a line item and the
creator it ships to — the same creator the search found two frames earlier, which turned
three unrelated demo shots into one continuous story.

**"Show Dan's picture."** The testimonial was attributed to a logo. His real photograph
from the customer's own case study was already sitting in the marketing repo. A quote
attributed to a face reads as a person; the same quote attributed to a logo reads as copy.

![The testimonial with the customer's real photograph](still-6.jpg)

Two mastering bugs surfaced in this pass and are now permanent parts of `scripts/master.sh`:
the louder keystrokes pushed the master to **+1.1 dBFS** (clipped), and the limiter added to
fix that silently applied makeup gain and produced **−13.0 LUFS / −0.0 dBFS** until
`level=disabled` was passed.

## What the loop actually taught

1. **Almost every note was about meaning, not polish.** "This is very basic" meant a shot
   was carrying a beat with two rectangles. No linter reports that.
2. **The measurable bugs hid behind aesthetic notes.** "Add a typing sound" surfaced an
   arithmetic problem. "Improve the background" surfaced a runtime that was not rendering.
   Take the note at face value, then measure.
3. **The reviewer was right every time, and imprecise every time.** "The ripple" was two
   elements. "3D" meant a camera rig, a cursor rebuild and a coordinate refactor. Translate
   the note into the mechanism; do not implement it literally.
4. **Continuity is free and nobody asks for it.** Carrying one creator across four frames
   cost nothing and did more for the film than any single effect.
5. **Version every render.** The typing fix was only provable by measuring the same window
   in v6 and v7.

## Reading the frames

The finished film's frame sources are not redistributed here (they are full of one
company's brand assets and customer data). What is portable is in `assets/frame-skeleton.html`
— the camera rig, the cursor, the glass borders and the word-cued timeline, with the
reasoning in comments.

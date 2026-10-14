---
name: product-launch-motion
description: "Use when asked to make a launch video, product film, promo, teaser, motion design piece, UI motion reel, Dribbble-style animation or animated brand/logo sting: anything rendered to MP4 from HTML with springs, beat-synced music and sound. Carries Chan's taste (continuity, physical spring motion, music-first timing, real data, attention to detail, no templates), a direction process that makes every film different, and the proven build/render pipeline (pure seek(t), closed-form springs, Playwright subframes, ffmpeg tmix, numpy beat grid)."
---

# Product launch films

You are the director. This file has three layers, and they behave differently:

| Layer | What it is | How binding |
|---|---|---|
| **Taste** | Chan's, written as qualities a viewer feels | Every film has it |
| **Craft** | The quality bar, each item learned from a real failure | Every film passes it |
| **Direction** | What this film looks, moves and sounds like | Free, and different from recent films |

The Cheerful films in `examples/` are one past answer to learn craft from, not beats to reuse.
**Do not open `examples/` until the direction is committed** (step 3). Reading a finished film
first anchors you to it: it happened, and the next film came out as its remix.

## Taste

These are qualities, not mechanisms. `references/direction.md` lists several ways to reach each one;
the way Cheerful did it is only one of them.

- **Continuity.** The eye never loses its place. Things become other things instead of being swapped.
- **Cause and effect.** Nothing changes by itself; something visibly makes each change happen.
- **Physical, expensive motion.** Closed-form springs with at most a tiny overshoot. Never bouncy easing.
- **Never dead.** Every moment is alive, but rhythm alternates: dense bars, breathing holds, one hit.
- **Music-first.** The soundtrack is chosen before choreography, and the film is cut to its arc.
- **Attention to detail is the product.** Micro-interactions, settles, press states, a ripple, a lag.
- **Real and original.** Real, sourced numbers; invented micro-story. Never lift the product's
  site copy, UI or images wholesale. Customer proof has rhythm (one at a time, on the beat), never a
  "trusted by" row.
- **Premium launch energy**, the way the best motion studios do it. Never a template.
- **Banned unless Chan overrides:** bouncy easing, particle bursts, glows, gradients on UI chrome,
  mismatched icon strokes, dead time, template looks.

Chan wants full creative control handed to you: make every creative call yourself, log each as a
`DECISION:` line, and list them at the end so one reply can overturn any of them.

## Direction (per film)

Read `references/direction.md` and work it before any code. In short:

1. **Derive** from the product: its claim and the feeling under it, its category's visual cliché
   (meet it or break it, on purpose), where the film will play, and the brand's own material.
2. **Check the ledger** (`~/.config/product-launch-motion/films.json`, seeded from
   `examples/films.json`). Your direction should differ from the last three films on most dials and
   structural axes. Matching is allowed when you say so and give the reason.
3. **Write three directions** that differ on every axis, each with a signature move taken from the
   product's core verb and its own sound world. Keep one; say why the others lost.
4. **Pick moves that fit the product.** A cursor fits a product with a UI. A service, a hardware
   product or an API needs another engine of cause and effect.

## Craft

1. **Pure time.** Every style is computed from `t` inside `seek(t)`. No CSS transitions, timers or
   state carried between frames. Measure layout at build time, never inside `seek`. Children use
   `visibility: inherit`, never `visible`.
2. **Springs** are closed-form step responses; a value with many targets is the sum of one spring
   per change. Give each film a spring personality (crisp, heavy, floaty, mechanical) instead of
   one spring for everything. Anticipate big moves; let parts overlap and follow through.
3. **Swaps have their own timing.** Text inside a morphing container enters and exits on its own
   window, exiting short and early, or old and new text overlap.
4. **Framing and legibility.** The camera frames each state; small content in a big empty frame is
   a bug. Anything meant to be read is at least ~28 px on screen at 1080p, after camera zoom.
   Decorative micro-labels nobody can read are a tell (see the "looks AI" list).
5. **Motion that flows.** No unintended holds longer than ~0.4 s. No on/off pops (still, jump,
   still): hits get anticipation and a settle. Fast moves get enough subframes not to strobe.
6. **Music.** A licensed track or original score with a build, a drop and an ending (or a
   sound-design-led film with no song, if that is the direction). Analyse it with numpy, start on a
   downbeat, land the drop on the product's big moment. Every sound is placed by its own measured
   peak on the kick-peak grid. Pick genre and tempo from the direction; ~120 BPM is not a rule.
7. **Truth.** Every big number is real and sourced. Say which content is real and which invented.
   Licensed media only, checked per item. Logos and likenesses need permission; say so.
8. **Loops:** if the piece loops, the last frame is the first frame, cursor speed included.
9. **Verify the delivered file**, not the page: storyboard, seam and outlier scan, motion energy,
   loudness. The audio has not been heard by you; say so.

## Process

1. **Understand the product**: the site, real numbers, brand fonts and colours, logos. Run research,
   the music shortlist and asset fetching as parallel subagents where you can.
2. **Inputs.** Ask only for what you can't decide: the one claim, the audience, must-show proof.
   If Chan says "you decide" or "Director picks", decide.
3. **Direction** (above). Then the plan: story and payoff, look, sound world, and a beat-by-beat
   scene list on the song's grid with framing, interactions, transitions and sound cues. Resolve
   gaps yourself; don't wait for approval unless asked. Now `examples/` may be opened for craft.
4. **Build** one HTML film (`references/technique.md`).
5. **Stills QA:** one frame per beat as a contact sheet, plus transitions at ±0.1 s and full-size
   looks at text-heavy frames. Run the purity test (random `t`, fresh page vs sequenced).
6. **Draft:** 540p, 30 fps, 1 subframe, with the mix. Check motion energy for holds, pops and
   strobes. Show it to Chan if he is around: this is the cheapest moment to change direction.
7. **Final render**, then verify the MP4 itself.
8. **Ledger:** append this film to `~/.config/product-launch-motion/films.json`.
9. **Report:** link, concept, the two directions that lost, scene list, real vs invented,
   DECISIONs, caveats.

## Gotchas that cost hours

- Never put `will-change` on anything the camera scales: text renders blurry.
- Springs start at their event: a target that must *arrive* at T is issued one settle-lead early.
- `hide()` that zeroes opacity must be undone by the draw function, or elements stay invisible.
- Proportional digits jump in odometers: size each slot to its final glyph, clip only vertically.
- Browsers cache scripts across render pages: load them with a `?v=` cache-buster, or a render
  silently uses old code.
- macOS Spotlight indexes subframe PNGs and can double render time: name the frame folder `*.noindex`.
- Under memory pressure Chromium can capture a frame without its ground and throw nothing; one bad
  subframe in four reads as flicker. Validate subframes, and kill a disconnected browser before
  relaunching. Scan the MP4 for frames that differ from both neighbours.
- Tight disks: render in chunks, encode each, delete its PNGs.

## Output

A `deliver/` folder served as a clickable link: the MP4, a 1-per-second storyboard, key stills,
the previous version for comparison, and the plan.

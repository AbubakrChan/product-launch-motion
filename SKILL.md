---
name: motion-launch-video
description: Use when asked to make a launch video, product film, motion design piece, UI motion reel, Dribbble-style UI animation or animated brand/logo sting — anything rendered to MP4 from HTML with a cursor, morphing UI, springs, beat-synced music and SFX. Carries Chan's full creative direction (one shape never cut, blur content swaps, springs, real data, logo slams, no creative limits) and the proven build/render pipeline (pure seek(t), closed-form springs, Playwright subframes, ffmpeg tmix, numpy beat grid).
---

# Motion design launch videos

This is how Chan wants launch films made. It is the distilled direction from every prompt and review
that produced "The Spark" (v1) and the real-data cut (v2) for Cheerful.
The prompts themselves, verbatim and in order, are in `references/prompts.md` — read them before
starting; they are the spec. The code patterns are in `references/technique.md`.
A complete working film to copy from lives in `~/code/cheerful-motion/launch2/`.

## The stance: you are the director

- **No constraints on creativity.** Chan says "I want you to be the director", "full creative control",
  "think out of the box", "no limits on shapes or buttons". Do not ask permission for creative choices;
  make them, log them as DECISIONs, and list them at the end so he can overturn any in one reply.
- **Original, never a template, never a copy.** Do not lift the product website's copy, UI, stats or
  images wholesale. Invent the scenes. "Anything that looks like a template" is banned.
- **Launch-film energy.** Modern, futuristic, premium — the way top motion designers do it (Linear,
  Apple, Arc). Something happens on every beat; there is no dead time.
- **Attention to detail is the product.** Micro-interactions (button press, knob stretch, name pill
  lag, click ripple, odometer settle, sticker tilt) are what make it read as expensive.

## Non-negotiable motion rules

1. **One shape, never cut.** Every state is the same element morphing its size, radius and colour
   while its content swaps with a short blur. Cuts are not encouraged; transitions are morphs,
   camera moves, zooms into an element that becomes the next scene (a tile opens into an inbox,
   a reply card becomes the order, the cursor becomes the logo star).
2. **Content swaps with a short blur**, and text inside a morphing container gets its own enter and
   exit timing — exit short and early — or old and new text overlap.
3. **Springs everywhere, a tiny overshoot at most.** No bouncy easing. Closed-form damped spring step
   responses only (see technique).
4. **Leading/trailing edges on different springs** so things stretch: tab indicators, toggle knobs,
   liquid pills — the leading edge runs ahead of the trailing one.
5. **A cursor drives every change with real clicks and drags.** Drags are direct manipulation: while
   held, the value is computed from the cursor position; on release it springs back from wherever it
   was. The product's agent can be its own cursor (a gradient multiplayer cursor with a name pill, a
   short motion trail, lean with velocity, press scale + ripple on clicks) handing off from the user's
   cursor ("You").
6. **The camera zooms so each state fills the frame.** Empty frames are a bug; frame the content, then
   push, whip or pull back. Pull-backs reveal scale (one email → a grid of hundreds; one post → a wall).
7. **Music-first timing.** ~120 BPM, analyse the song with numpy for the beat grid, start on a
   downbeat, cut the song window so the drop lands on the product's big moment. Something happens on
   every beat; typing rides 32nds on a snare build; slams accelerate beats → 8ths → 16ths.
8. **Every UI sound is synthesized and placed by its measured peak** on the kick-peak grid.
9. **Loops:** when the piece loops, the last frame is the first frame — cursor position and speed
   included — or the loop stutters.

## Look

- **Palette:** the brand's own design system (for Cheerful: warm near-white canvas, brand gradient
  #B04ADC → #E35C91 → #FF7247 → #FFB21E, lilac/peach light pools, ink #111827). Not "black plus one
  purple". One clean UI font.
- **Banned (from the original brief, still binding unless Chan overrides):** bouncy easing, particle
  bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, template looks.

## Content

- **Use real data.** Chan: "You have access to the database. You can be creative and not just pick
  images." Pull real, defensible numbers read-only (creators reached, gifts sent, posts/views
  tracked) and show them as rolling odometers. Invent the micro-story (creator, brand, messages) but
  keep the big numbers true, and say which is which in the report.
- **Customer logos one by one, boom boom boom** — never a website-style "trusted by" row. One shape
  re-sized/re-coloured on every hit, only brands that really ran campaigns.
- **Licensed media only.** Stock video/stills from free-licence sources, checked per item (Mixkit has
  Restricted items mixed in). Never the product's own marketing images as a shortcut.
- **Keep what he liked:** for Cheerful the headline intro, the typed brief, the discovery search wall
  and the wordmark ending tested well — keep strong beats between versions and iterate the rest.

## Process

1. **Ask for inputs first** (unless already given or he says "you decide"): 8–12 states the shape
   should become, palette (B/W, one accent, or the brand system), and a royalty-free ~120 BPM song.
   Offer "Director's cut / Director picks" options — he usually picks those.
2. **Show the state list on the beat grid before writing code** (bar/beat table: what happens, which
   element morphs into what, which sound).
3. **Build** one HTML file where every style is computed from time inside `seek(t)` — no CSS
   transitions, no timers, no state between frames.
4. **Render one frame per beat before the full render**, contact-sheet it, and fix anything off the
   grid, cramped, empty, hard to read or overlapping. Then check transitions at ±0.1 s.
5. **Full render** with Playwright subframes → ffmpeg tmix motion blur → 60 fps H.264 + mix.
6. **Verify the MP4 itself** (1-per-second storyboard, frame-difference scan for seams/glitches),
   serve it over the tailnet, and report: link, concept, scene list, real-vs-invented data,
   DECISIONs, caveats (audio is unheard — say so; logo/likeness permissions).

## Gotchas that cost hours

- Never put `will-change` on anything the camera scales — text renders blurry.
- Springs start at their event: a target that must *arrive* at time T is issued one settle-lead early.
- `hide()` that zeroes opacity must be undone by the draw function, or elements stay invisible.
- Proportional digits jump in odometers: size each slot to its final glyph, clip only vertically.
- On the VPS: disk is tight (render in 4 s chunks and delete PNGs), Chromium is the first thing
  earlyoom kills (auto-retry, relaunch, hard-exit when done), a stray `/tmp/inspect.py` shadows the
  stdlib (run Python from the project dir), PreToolUse hooks block some ffmpeg glob strings.

## Output

Deliverables in a `deliver/` folder served with `serve <dir>` (tailnet URL, never localhost):
the MP4, a 1-per-second storyboard, key stills, and the previous version for comparison.

---
name: product-launch-motion
description: Use when asked to make a launch video, product film, motion design piece, UI motion reel, Dribbble-style UI animation or animated brand/logo sting — anything rendered to MP4 from HTML with a cursor, morphing UI, springs, beat-synced music and SFX. Carries Chan's full creative direction (one shape never cut, blur content swaps, springs, real data, logo slams, no creative limits) and the proven build/render pipeline (pure seek(t), closed-form springs, Playwright subframes, ffmpeg tmix, numpy beat grid).
---

# Motion design launch videos

This is how Chan wants launch films made. It is the distilled direction from every prompt and review
that produced "The Spark" (v1) and the real-data cut (v2) for Cheerful.
The prompts themselves, verbatim and in order, are in `references/prompts.md` — read them before
starting; they are the spec. The code patterns are in `references/technique.md`.
Prior films demonstrate the technique; compose this product's own story from its customer's
problem, current brand assets and actual behavior. Preserve the one-shape continuity throughout.

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
- **Make it easy to follow.** One clear takeaway per scene, short prompts and answers, and enough
  settled time to read the result. Keep the beat alive through secondary motion and sound while
  the main idea holds; simplify the content or add beats rather than rushing the viewer.

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
7. **Music-first timing.** Choose the soundtrack before choreographing: energetic, brand-appropriate,
   with a build, a clear drop and a satisfying ending. BPM alone is not energy; do not default to a
   repetitive synthesized loop. Use a licensed track or an original score with that musical arc.
   Aim for ~120 BPM, analyse the song with numpy for the beat grid, start on a
   downbeat, cut the song window so the drop lands on the product's big moment. Something happens on
   every beat; typing rides 32nds on a snare build; slams accelerate beats → 8ths → 16ths.
8. **Every UI sound is synthesized and placed by its measured peak** on the kick-peak grid, and the
   sound is designed like a studio did it (next section), not a click track laid over a song.
9. **Loops:** when the piece loops, the last frame is the first frame — cursor position and speed
   included — or the loop stutters.

## Sound: a studio, not a click track

Sound is half of what makes a film feel expensive. Chan's reference is the Hoopoe Club film: it
opens on sound design alone, then the music comes in. A film that is busy and loud from frame one
gets boring fast.

- **Open on sound design, then let the music in.** Until the first real payoff (4–8 s), keep the
  music sparse: the song's quiet intro, or the bed low-passed and quiet. Each UI sound is heard on
  its own. The music grows into the drop, and the drop is the first loud moment. Target: the intro
  is at least 12 dB quieter than the section after the drop. (Measured: Hoopoe +12.3 dB, warm intro,
  16 onsets in 7.5 s. Cheerful v2 +8 dB with a bright, hiss-heavy intro, 28 onsets. Hoopoe sounds
  far more premium.)
- **A signature palette for each film.** Design 4–6 sound families from the product itself: a
  reading app gets paper, page turns and a soft wood knock; a dev tool gets keys and glass ticks.
  Tune every tonal sound to the song's key and run them all through one short shared room, so they
  sound recorded in one place. Never a generic UI click kit, and never the same palette two films
  in a row.
- **Layer the important hits.** A hero action is three layers: a transient (2–10 ms), a tonal body
  in key (40–150 ms) and an air tail (room or noise, 200–600 ms). Small actions get the transient
  only. Sub thumps go only on the drop, the big reveal and the logo.
- **Sound follows the picture.** Pan by the element's x position (at most ±0.6). Pitch or
  brightness follows the value or speed: odometers and poll bars rise in pitch, the drag hiss
  follows the cursor's speed. Each multiplayer cursor gets its own pitch, so the viewer hears
  different people.
- **Make room in the mix.** Duck the music 2–4 dB for about 150 ms under each hero sound, and cut
  the music below 120 Hz under sub hits. Keep the bed warm: a hiss-heavy bed buries UI sounds.
- **The ending breathes.** Let the song's real ending play out. The logo gets one signature sound
  (the brand's sting), and the last 1–2 s ring out on the room tail, never a hard stop.
- **Silence is a cue.** About 0.3 s of near-silence before the drop or the logo makes the hit land.

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
2. **Direct first, implement second.** Finalize a concise creative plan before writing animation code:
   the product story and payoff, brand treatment, soundtrack and musical arc, the sound palette
   (the 4–6 families and what each one is made of), then a beat-by-beat scene plan covering
   framing, key interactions, transitions and sound cues. Show the plan, resolve
   gaps as the director, and only then implement it. Do not wait for approval unless requested.
   Give each scene a clear takeaway and reading window, and carry a recognizable customer example
   through the demo. Simplify real product behavior for film without inventing actions or outcomes.
3. **Build** one HTML file where every style is computed from time inside `seek(t)` — no CSS
   transitions, no timers, no state between frames.
4. **Render one frame per beat before the full render**, contact-sheet it, and fix anything off the
   grid, cramped, empty, hard to read or overlapping. Then check transitions at ±0.1 s. Review a
   low-resolution moving draft at normal speed before the full render: verify readable holds,
   cursor actions and continuous morphs. Still frames alone cannot prove the timing works.
5. **Full render** with Playwright subframes → ffmpeg tmix motion blur → 60 fps H.264 + mix.
6. **Verify the MP4 itself** with a 1-per-second storyboard and a frame-difference scan for seams
   and glitches. Review its pacing and transitions at normal speed, check for flicker, and verify audio cue sync
   against the picture. Listen when playback is available; distinguish listening from measurements.
   Serve it over the tailnet, and report: link, concept, scene list, real-vs-invented data,
   DECISIONs, caveats (whether audio was heard or only measured; logo/likeness permissions).

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

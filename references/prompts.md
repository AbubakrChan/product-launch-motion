# Chan's prompts, verbatim and in order

These produced the Cheerful launch films (Sept 2026). Treat them as the spec: every later message
adds to or overrides the earlier ones; nothing earlier is dropped unless a later one reverses it.

---

## 1. The brief (first message)

```
<inputs> Ask me for: 8 to 12 UI states I want the shape to become (e.g. button, loader, player, slider, toggle, tabs, chart, command palette, toast), pure black and white or one accent color, and a royalty-free song around 120 BPM (e.g. Mixkit, free for commercial use). </inputs>
<direction> Dribbble-level UI motion. One shape, never cut: every state is the same element morphing its size, radius and color while its content swaps with a short blur. A cursor drives every change with real clicks and drags. Light warm-gray canvas, black and white components, one clean UI font (Geist). Springs everywhere, a tiny overshoot at most. The camera zooms so each state fills the frame. The last frame is the first frame, so it loops. Banned: bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, anything that looks like a template. </direction>
<structure> 120 BPM, 7 bars, something happens on every beat. "Find creators" button → loader searching 350M+ profiles → check → dynamic island "Creator matched: @mayamoves · 184K" → creator reel preview with a play/pause morph → scrub the reel's progress bar → it becomes a rate slider ($ per reel) that stretches when dragged past max → an "Autopilot" toggle flips on the beat → the knob becomes a liquid tab indicator across Outreach · Negotiation · Deal → the tabs open into a performance chart that draws itself, with a tooltip on hover → it collapses into ⌘K "Ask Cheerful…" → type to filter → enter → toast "Deal signed · @mayamoves" → back to the button. </structure>
<build> 1. One HTML file, square 1440x1440. Every style is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames. 2. Springs are closed-form step responses. A value that changes target many times is the sum of one spring per change, so it stays a pure function of time. 3. The tab indicator's two edges ride different springs, so the leading edge stretches ahead of the trailing one. Same trick for the toggle knob. 4. Drags are direct manipulation: while the cursor is held, the value is computed from its position. On release it springs back from wherever it was. 5. Analyze the song with numpy for the beat grid and start on a downbeat. Place every UI sound by its measured peak. 6. Render with Playwright: 4 subframes per frame, blended with ffmpeg tmix for motion blur at 60fps. 7. Render one frame per beat before the full render. Fix anything off the grid, cramped or hard to read. </build>
<gotchas> Never put will-change on anything the camera scales or the text renders blurry. Text that swaps inside a morphing container needs its own enter and exit timing or it overlaps. Make the last frame identical to the first, cursor position and speed included, or the loop stutters. </gotchas>
<start> Ask me for the inputs, then show me the state list on the beat grid before you write any code. </start>
```

Added in the same message:

> use the theme to create the video of Cheerful (https://www.cheerful.ai/) --- I want you to be the
> director and I want you to compose the whole video, motion design video and I want you to put
> attention to detail. I want you to think out of the box, no constraints on and full creative control

Answers to the input questions: palette = "cheerful design.md" (the brand's design system);
song = "Director picks"; states = "Director's cut".

## 2. Build it — one shape, no cuts

> Okay, go ahead and implement it. Make sure you follow the principles I told in that form. Make sure
> you focus on that wherever like we can cut the scenes or let's actually not cut the scenes We should
> keep one shape every state in the same element morphing its size radius color While its content swaps
> with a short blur something like that so there is consist consistency among this cuts are not
> encouraged

## 3. Be creative — a launch video in the brand design

> Dude, I want you to be creative. I want you to use the cheerful design. I don't want you to use the
> black and this color. I want You're not limited to use any kind of shape or buttons, you know, as I
> told you in the first form. I just want you to Bring up with something your own like a launch video or
> something, you know, so go ahead

## 4. Review of v1 — original content, real data, no star cursor, logos one by one

> Okay, so I'll review the video which you created in the last session. First of all, I really like the
> starting. That's really good. And I really like how you search on it. I think we can speed it up bit,
> but it still looks good. And what I really doesn't like is that you copied it all from the website,
> you know, the content itself. You have access to the database. You can be creative and not just pick
> image. I just want you to... no constraints in the creativity so process of looking at all it is not I
> really like the star more attention to detail into stuff but I don't like the star, that's what I
> meant. I don't like the star cursor that you had. I think we can do a better job of creating a more
> modern, you know, launch video. And at the end that we show the brands we launched the campaign for,
> we can do a better job instead of just copying the UI we have on the website and the ending is also
> good. Maybe for the brands that we show the logo for, for whom we launch the campaign for, we can just
> instead of copying the UI of the website, we can show it one by one, boom, boom, boom.

What this meant in practice: keep the intro, the search (faster) and the ending; replace the sparkle
cursor; rebuild the middle from original scenes driven by real prod numbers; slam real customer
logos one per beat instead of a "trusted by" row.

## 5. This skill

> create me a skill in that skill I want you to mention all of my prompts that we use all of my
> instructions that we use to create really awesome motion design launch videos and make sure you don't
> miss any instruction, you know things like no cuts Same elements, morphing into different sizes, blurs
> and each and every effect we talked about you know what I mean and how there are no constraints in the
> creativity stuff like that which would pro produce really high quality video launch videos.

## Standing working agreements that applied throughout

- Autonomy: don't stop for non-blocking choices; decide, log `DECISION:` lines, report them at the end.
- Hand over tailnet URLs (`serve <dir>`), never localhost or VPS paths.
- Report honestly: audio was never heard (numbers only), which data is real vs invented, which
  third-party logos/likenesses need permission.

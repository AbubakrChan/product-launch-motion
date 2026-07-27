# 09 · Shot Catalog

Fourteen shots covering almost every beat a launch film needs. Each is a *claim carrier*: it exists to make one sentence land, and it fails when asked to carry two.

> **These are constructions, not layouts.** Each entry says what a shot has to *do* — the claim it carries, what arrives in what order, how it fails. It deliberately does not prescribe where things sit, what colour they are, or how the camera behaves: those come from your direction (`11-creative-direction.md`), and two films using the same shot should still look nothing alike. Copying an entry's composition wholesale is how you end up with a film that could belong to anyone. Take the mechanism; invent the picture.

Pick shots at storyboard time (pipeline step 7), before you open a single HTML file. Write the shot name into `../assets/STORYBOARD.md` beside the VO line it serves, then build from `../assets/frame-skeleton.html`. Construction detail lives in `04-motion-grammar.md` (easing, staggers, holds) and `05-camera-3d-cursor.md` (rigs, cursor); this file is *which* shot and *why*.

Where a shot cites an example, that example is the reference film in `../examples/CASE-STUDY.md` — one 44.2s B2B SaaS launch, an instance and not the shape. Every shot below is written for hardware, e-commerce, apps, dev tools and services equally.

**Contents** — [Selection table](#selection-table) · [1 Kinetic type beats](#1-kinetic-type-beats) · [2 Crowding problem](#2-the-crowding-problem-shot) · [3 Held thesis](#3-the-held-thesis) · [4 Prompt / composer](#4-the-prompt--composer-shot) · [5 Results surface](#5-the-results-surface) · [6 Two-pane workspace](#6-the-two-pane-workspace) · [7 Pipeline tracker](#7-the-pipeline--status-tracker) · [8 Hero stat count-up](#8-the-hero-stat-count-up) · [9 Testimonial with a face](#9-the-testimonial-with-a-face) · [10 Comparison columns](#10-the-comparison-columns) · [11 End card / CTA](#11-the-end-card--cta-lockup) · [12 Hardware hero](#12-the-hardware-hero) · [13 Terminal / dev tool](#13-the-terminal--dev-tool-shot) · [14 Map and chart](#14-the-map-and-the-chart-reveal) · [Composing a film](#composing-a-film-from-these)

## Selection table

| Beat | Shot | Suits |
|---|---|---|
| Cold open / hook | 1 · Kinetic type beats | Anything; strongest when the pain is a *list* of chores |
| Cold open, physical goods | 12 · Hardware hero | Devices, packaged goods, apparel, furniture |
| Agitate the problem | 2 · Crowding problem | Multi-step workflows, tool sprawl, manual ops |
| Agitate, quantified | 14 · Chart variant | Fintech, analytics, ops — only with real numbers |
| The turn / thesis | 3 · Held thesis | Every film with a positioning line, i.e. every film |
| Act 1 — the input | 4 · Prompt / composer | Search, chat, CLI, forms, configurators, checkout |
| Act 2 — the output | 5 · Results surface | Lists, grids, tables, feeds, catalogs, search |
| Act 3 — the work | 6 · Two-pane workspace | Inbox, editor, dashboard, CRM, IDE, admin console |
| Operations / fulfilment | 7 · Pipeline tracker | Orders, shipments, builds, deploys, jobs, approvals |
| Developer proof | 13 · Terminal / dev tool | SDKs, CLIs, infra, APIs, agents |
| Reach / geography | 14 · Map variant | Logistics, marketplaces, travel, coverage claims |
| Proof — hard numbers | 8 · Hero stat count-up | Any product with an approved figure |
| Proof — human | 9 · Testimonial with a face | Any real, named, consenting customer |
| Objection / positioning | 10 · Comparison columns | Crowded categories, replacement sells, before/after |
| Close | 11 · End card / CTA | Every film |

### 1. Kinetic type beats

**Says:** "Here is the work you are doing by hand, and there is more of it than you think."
**Use when:** The cold open, or any beat whose argument is a list rather than a scene. Suits every product type — it needs no product footage at all.
**Runtime:** 3.5–5s

**Build**
- One ground and a stack of 3–5 short lines, each pre-positioned at its final y. Nothing scrolls; the stack accumulates.
- One emphasis word per line, usually the verb, carrying the accent. Everything else is plain.
- Per-line chrome that accumulates with it: a hairline rule drawing under the active line, a beat counter, a row of ticks that light on their beat and stay lit.
- Stale lines fall back to ~0.30 opacity and nudge up a few px per new arrival, cumulatively, so the stack compresses as it grows.

**Choreography**
- Each line rises ~28px into place on its verb's measured start time (0.3s, `power3.out`) — on the word, never on a cadence you computed. The rule draws `scaleX` 0→1 with it, and its accent layer fades on the next beat to reveal a flat hairline beneath, so the accent only ever sits on the current line.
- Give the last line three micro-hits, one per word, so the closing beat lands in three pieces rather than as a block.
- On the final word: one 4px settle of the whole stack plus an ~8% brightening of the ground wash, then absolute stillness. No shake, no bounce — that restraint is the impact.

**Camera** — Locked. The accumulation is the motion; a drift on top reads as two competing rhythms.
**Sound** — A soft transient per line, rising in level across the stack, then one deeper hit on the final word.
**Fails when** — The lines appear on an even rhythm. A stack ticking at 1.0s intervals reads as a slideshow however good the type is; speech is uneven and the reveals must be too. Second failure: tweening the beat counter's digits — discrete text swaps on a driver, never a tween.

### 2. The crowding problem shot

**Says:** "There are too many of these, and they all land on you."
**Use when:** Agitating a workflow problem — lifecycle stages, tool sprawl, manual handoffs, integrations to maintain. Any product whose value is *absorbing* a mess.
**Runtime:** 3.5–4.5s

**Build**
- 6–9 labelled chips in a 3D field across three depth planes. Near = biggest, brightest, sharpest; far = smallest, dimmest, softest, and one weight heavier so blurred copy stays shape-legible.
- Two positions per chip in data attributes — a widest-spread point and a closed-in point. The shot is the transit between them.
- A scattered start state derived from the index (golden angle around a radius, stepped depth), never `Math.random`; plus a centre slot the crowd opens for the payoff line, and a vignette that rises with the close-in.
- One emphasis word in that line with a hand-drawn underline as an SVG path, `stroke-dasharray` primed to its own length.

**Choreography**
- Chips land one per beat, ~0.14s apart, while the voice counts or names them — the audience should be able to count them. A tally in the margin then runs 1→n as the last ones land, confirming the number.
- On the conjunction that turns the sentence, every chip moves inward in lockstep with a small per-index offset, the far plane racks toward sharp, and the vignette rises.
- The payoff line rises in the opened slot and is fully readable *before* its key word is spoken; then the crowd defocuses and dims to ~0.32 and the field recedes so one sharp line dominates. The underline draws last, then still.

**Camera** — Multi-phase on a single writer: pull back, settle, one slow lean, drift amplitude decaying to zero ~0.7s before the cut. Compose phase scale and sine drift inside *one* `onUpdate`, never as two tweens on the same element.
**Sound** — A short click per chip landing; a low sub-bass swell under the close-in.
**Fails when** — You measure the underline's box with `getBoundingClientRect()`. The word sits under a camera node being scaled, client rects are transform-inclusive, and the box comes out inflated — the stroke overshoots the word by hundreds of px. Use `offsetLeft`/`offsetWidth`, which are layout-space. Second failure: decorative nonsense labels. Name the real stages or the shot says nothing.

### 3. The held thesis

**Says:** The one positioning line the whole film is built to earn.
**Use when:** The turn, always — the hinge between the problem act and the product act.
**Runtime:** 1.8–2.5s, deliberately the shortest frame in the film

**Build**
- Two halves of one sentence, optically centred as a pair, both reserving their box from frame 1 so the first never jumps when the second arrives.
- The second half is *quieter*: same size, ~0.80 opacity, no accent. The contrast between the halves is the shot.
- One accent job only — a gradient wiping through a single hinge word, built as a pixel-identical stacked copy with the gradient clipped into the glyphs and a background image 3× the box width, so a position tween wipes it left→right. A soft glow sits behind that one word on a negative z-index inside the type's stacking context.
- An aurora ground: three broad brand-hued radial pools with one slow drift. Depth, with nothing crossing the type.

**Choreography**
- Half one rises as a single unit on its first word (0.3s, `power3.out`). Do not stagger the words — a title card is one gesture.
- The gradient wipes through the hinge word on that word's spoken beat; the glow blooms once behind it and settles long before the lock.
- Half two arrives ~1s later, same rise, quieter, no accent. Then lock: nothing moves for the last ~0.4s. The stillness is what makes it read as a thesis rather than a feature bullet.

**Camera** — Locked, except the ground's own aurora drift. A camera move on a title card makes it feel provisional.
**Sound** — Near-silence. Drop the bed to a floor before this shot and bring it back on the next cut; the hole in the mix does more than any cue you could add.
**Fails when** — Both halves carry equal weight, or both get the accent — then it is two claims and the audience remembers neither. Also fails if a word tweens `font-size`; scale the wrapper.

### 4. The prompt / composer shot

**Says:** "You ask for what you want in plain language, and it starts working."
**Use when:** The first product act, for anything with an input: search box, chat composer, CLI prompt, form, configurator, checkout field.
**Runtime:** 2–3s

**Build**
- One wide centred card: the field, a placeholder, a caret, one secondary affordance, one primary button. A gradient focus ring sits behind the field, sized so only a ~3px rim shows when it lights.
- A cursor at ~44×54 with heavy stroke and deep shadow, inside the same node as the card (`05-camera-3d-cursor.md`), and two click ripples parked at the two press points at opacity 0.
- Below the card, a run panel: header, a state pill, three step rows, each with a ring that becomes a check and one carrying a determinate fill.

**Choreography**
- Cursor enters slightly off-target and arrives; press (`scale` 0.9, 0.06s), ripple, focus ring lights, caret appears, placeholder fades — all on the first spoken word.
- Type on **one** tween: a snapped integer index driving `slice(0, i)`, so the rendered string is a pure function of playhead time and a reverse seek reproduces the frame exactly. Never a per-character stagger, never `setTimeout`.
- Cursor travels to the primary button on the conjunction and presses on the verb. The button fills with the accent (`scaleX` from its left edge) and its label swaps at ~12% fill progress, so text and fill change together.
- The run panel opens and its steps complete in sequence on their own beats — but **leave the last step running**. The frame ends mid-work and the next shot completes it, so the shot never claims a result the film has not shown. One 0.2s tint on the active ring, then still: no spinner, no loop. The cursor fades once its work is done.

**Camera** — Locked, or the gentlest whole-plane settle on entry. The typing is the motion.
**Sound** — One click on each press. No per-keystroke SFX: 40+ characters in 0.7s becomes noise.
**Fails when** — The query is generic ("show me data"). Type the exact sentence a real user would type, capped to one line at the field's real font size. Also fails when the button shows the idle label over a filled accent background for a frame — swap on the fill's own progress, not on a separate tween.

### 5. The results surface

**Says:** "It answers, and the answer is specific."
**Use when:** The second product act — search results, a product grid, a catalog, a feed, a table, an inventory view.
**Runtime:** 3.5–4.5s

**Build**
- One hero card with a static 3D tilt, drawn natively at video scale rather than screenshotted: query bar, filter-chip row, result count, 3–5 rows.
- A **skeleton overlay** per row using the same gaps, padding and flex bases as the real content, so placeholder columns line up with what replaces them.
- One state control per row (pill, badge, toggle) with idle and resolved groups stacked in the same box plus a fill layer between them.
- Glass borders as two masked rings *inside* the card box — `backdrop-filter` does nothing in a per-track compositing renderer, and keeping the plate inside stops a camera push shoving its edge into the bottom keep-out band. One figure in a side column and nowhere else.

**Choreography**
- Enter with a lateral motion-blur streak: an SVG `feGaussianBlur` with `stdDeviation` on the horizontal axis only, animated to 0 as the card slides in and grows from ~0.978. Put the filter on a *wrapper*; a filter on a 3D-transformed element flattens it.
- On the query word the bar's border lights, one scan line sweeps the card once, and the rows waterfall in as skeletons at ~0.06 stagger. The skeletons then resolve one at a time, ~0.2s apart, across the following clause — that sequencing is what makes it read as a query being answered instead of four finished rows sliding in.
- Chips pop on their word; the count ticks on its word; everything else waits. The state flip runs off one shared driver with a smoothstep, cross-fading the fill and the two content groups — give only the control the cursor clicks a pop, or the frame reads as a fireworks display.

**Camera** — A slow turntable across the whole shot (~7° over 4s), plus a push to ~1.06 for the detail beat and a release after. Put the push's `transform-origin` exactly on the control being clicked: that point becomes a fixed point of the transform, so a cursor living outside the node stays aligned with no compensating maths. Rack the side column soft during the push, back on release.
**Sound** — A soft whoosh on entry, a tick per row resolve, one confirming chime on the state flip.
**Fails when** — You push further than the layout allows. The card's bottom edge grows by `(bottom − originY) × (scale − 1)`; if that crosses the caption keep-out you have broken the frame for a 4% larger detail. Also fails when every row flips at once — nobody believes it.

### 6. The two-pane workspace

**Says:** "This is where the work happens, and it happens live."
**Use when:** The beat that has to feel like *using* the product — inbox, editor, dashboard, CRM, IDE, admin console, ticketing.
**Runtime:** 4–5s; the longest shot in most films, and it needs the room

**Build**
- **Two nested camera nodes.** Outer owns the dolly (scale only), origin on the control the cursor will press; inner owns the 3D turn (perspective + rotationY/rotationX). One node cannot carry a whole-shot rotation and a mid-shot scale without the two fighting over the same matrix write.
- Everything — surface, content, cursor, ripples — lives *inside* the inner node in stage-local coordinates. That is what glues the cursor to its targets through both moves, the way a cursor in a screen recording is glued to the screen.
- Left rail: four list rows each carrying a real last line of its own thread, plus a "+ n more" that reconciles with any count shown elsewhere. Right pane: header, subject row, an outbound item, an inbound item, one action row with pending and resolved states stacked.
- Give the 2–3 elements the cursor touches a real `z` of 12–22px so they parallax against the surface under the turn instead of reading as paint on a flat sheet.

**Choreography**
- Surface settles, rail cascades in from the left, right pane opens — all inside the first clause. The outbound item then composes itself with one character stepper (`pre-wrap`, so the string's own newlines break the lines), caret blinking on a deterministic sine square wave, hidden the moment typing ends.
- One shared `click(n, at)` routine so both presses feel identical: a soft bloom swells under the pointer 0.1s *early* (that lead is what makes the press read as intentional), arrow to 0.86 on the beat, ring expands, arrow springs back. Split cursor travel into two tweens on different eases so the path **bows** instead of sliding on a ruler line, with a ~0.05s anticipation pull-back before it commits.
- When the inbound item lands, **the list updates too**: row 1's line swaps and takes an unread dot, handed over sequentially (b starts where a ends) so the cell never double-prints. A workspace where only the focused pane reacts looks like a mockup.
- The action row flips on the click — ring recedes, check flips in, both labels swap, the row shell recolours, an underline sweeps — then the camera releases and the frame locks.

**Camera** — The turn runs the whole shot (~6°); the push (~1.12) runs only the decision beat and releases once it resolves. Verify the pushed bounding box stays inside the canvas and clear of the keep-out.
**Sound** — A low typing bed, one click per press, a distinct arrival cue for the inbound item, a confirm on the resolve.
**Fails when** — The cursor is drawn life-size. At 1920 wide a true pointer is ~32px, vanishes into any saturated control and reads as a smudge; draw it as a stage prop. Second failure: cursor and surface in different coordinate spaces — the moment the camera moves the aim drifts, and no correction maths saves it.

### 7. The pipeline / status tracker

**Says:** "It runs the operational steps without you, and you can watch them complete."
**Use when:** Fulfilment, orders, shipments, builds, deployments, background jobs, approval chains, onboarding.
**Runtime:** 3–4s

**Build**
- Split the frame: a tracker card on one side, evidence on the other. The tracker alone is abstract; the evidence is what makes it true.
- The tracker carries a line item with a **real product photograph or asset**, the party it concerns, then three state rows — circle, label, and a small right-aligned meta (source system, tracking state, timestamp) — with connectors between the circles as thin bars primed at `scaleY: 0`, `transform-origin: top`.
- The evidence side: a deterministic masonry of real captured items, each with a scan sheen and a status pill. A counter chip for the total sits outside both columns.

**Choreography**
- The card settles, then the line item arrives — the *subject* of the clause must be on screen while the clause is spoken. Thumbnail first with a small overshoot (the only overshoot on the column), then its name, then the recipient.
- The three states complete ~0.18s apart: circle pops `scale` 0.6→1 with one expanding ring ping, connector drawing inside the gap before the next. Time the handoff so the last state completes exactly as the first evidence card lands — the column passes the shot across.
- Each evidence card rises, one light sheen sweeps down it once, its pill appears +0.14s later. The counter chip counts on the payoff word, and as it lands every pill pulses once from a single shared driver (`sin` 0→π, so it starts and ends at exactly 1 with no residual scale).

**Camera** — Two-plane parallax, no push: the evidence grid as the nearer plane (more travel, slight scale-in), the tracker as the further one (less travel, opposite direction). One slow move each, whole-shot.
**Sound** — A soft mechanical tick per state, a light shutter per evidence card, one confirming tone under the counter.
**Fails when** — The tracker shows states with no subject. Three checks reading "Ordered / Shipped / Delivered" floating on white are true and say nothing, because the audience never learns *what* shipped or *to whom*. Put the real item and the real recipient in the card, and never use placeholder swatches where product photography belongs.

### 8. The hero stat count-up

**Says:** One approved number, and what it means.
**Use when:** The proof act, wherever you have a figure on the approved-figures list (`02-story-and-truth.md`). Never with a number you cannot source.
**Runtime:** 3s for one figure; 5–7s to land two

**Build**
- Light register — the proof act reads better bright, and it separates from the argument act.
- A fixed-width numeral box with `font-variant-numeric: tabular-nums`, wide enough for the final value, so digits never reflow the layout as they tick. A small-caps label, and one supporting quantitative element (bar, ring) that is honestly scaffolding.
- If you land two figures, build the second as its own centred unit and plan the first one's dock position (translate + scale to a corner) up front. A soft glow behind the hero numeral, on its own node.

**Choreography**
- Chrome settles, then the label, then the count — and **start the count on the label word, not on the spoken number**. In the reference film starting it on the figure left the frame near-empty for 1.3s, the biggest dead spot in the cut.
- Run a long count on `ease: "none"`. An eased-out 2.5s counter resolves most of its value in the first third and then crawls; a linear one ticks like a live readout. Set the duration so the tween's terminal frame lands exactly on the word that completes the phrase. Give the scale-grow its own short window (~0.9s) inside the count — stretched across the whole count it reads as slow drift rather than an entrance.
- Hold. The only sanctioned motion in a held read is a ≤2px bounded single-cycle sine settle ending at `sin(2π)`, exactly where it started.
- Second figure: dock the first in one 0.34s move, retire its scaffolding bar as it goes, land the second centre. Punctuation (a `×`, a `%`, a currency mark) is its own beat and arrives *after* the number settles, on its own word.

**Camera** — A ~2.5% dolly across the shot, on a wrapper above the numeral so it composes with the numeral's own scale-grow and the later dock. A 6s shot cannot be genuinely locked.
**Sound** — A low tick bed under the count rising in level, silence at the terminal frame, one soft hit on the second figure.
**Fails when** — The number is not on the approved list, or a projected figure is presented as an achieved one; label it exactly as the source labels it. Also fails when the count animates `font-size` instead of `transform: scale` — that relayouts every frame and jitters.

### 9. The testimonial with a face

**Says:** "A named human at a named company got this result."
**Use when:** The proof act, adjacent to the numbers shot. Requires a real, consenting, named customer.
**Runtime:** 3.5–4.5s

**Build**
- A white card on a light ground with faint concentric rings behind it for pull-quote atmosphere. Static.
- A short accent rule, the quote (one sentence, no numerals in it), then a cite row: **face · name/role · hairline · company mark**, in that order. The photograph is the real one the customer supplied — law 1 bars invented faces and stock portraits, not a real named customer's own photo.
- Below a hairline, one hard number and one quieter second unit (a timeframe, a scope). The number takes the accent; the second unit stays plain grey. Company marks ship as-is — never recoloured, never inverted.

**Choreography**
- Reveal with one register-clearing wipe — a large tilted panel travelling off-frame — not a fade. Keep the tilt **constant in both the from and the to state** so the tween never lerps the rotation, and let the quote sit visible beneath it: it is revealed *by* the word, not by a fade fighting the wipe.
- Stagger the cite row left-to-right at ~0.04s so the face lands on "person" and the logo resolves on the brand word — the attribution reads in the order the sentence says it. Give the face one extra small scale settle of its own, so the human element *arrives* rather than appears.
- The hairline draws, the figure enters and counts to a finish before the noun after it is spoken, the quieter unit fades in last. Then locked still: no exit, no drift, no breathing pulse.

**Camera** — Locked. A camera move on a quote undercuts it; the shot's job is to feel like someone stopped to say something.
**Sound** — Near-silence for the quote; a soft tick bed under the count only.
**Fails when** — The portrait is a room-scale shot dropped into a circular crop. If source and frame are both square, `object-fit: cover` crops nothing and `object-position` is inert — size the image ~1.8× the circle and offset it by hand until the face is centred. Second failure: attributing the quote to a logo instead of a person. The same words attributed to a face read as a person; attributed to a mark they read as copy.

### 10. The comparison columns

**Says:** "Others cover part of this. We cover all of it."
**Use when:** Crowded categories, replacement sells, manual-versus-automated, before/after. Name your own product; describe the alternatives by category, never by brand.
**Runtime:** 4.5–5.5s

**Build**
- A card with a row-label column and three comparison columns, sized so the table commands ~80% of the frame width. 5–8 row labels down the left, written as the buyer's checklist in the buyer's language.
- Column A (partial coverage): a neutral mark on the rows it genuinely covers, a dim dash on the rest. **Partial coverage is the argument** — a column of all dashes is a straw man and the audience knows it.
- Column B (the manual alternative): a mark on every row but in a *different shape* — a hand, a clock, a person. Different shape, not merely a different colour, so the difference from column C is unmistakable at a glance.
- Column C (you): the accent check, with a faint highlight band and a soft bloom behind the column.

**Choreography**
- Scaffold first — card, eyebrow, row labels on a small `x` stagger, header rule — so the skeleton is up before the first word. Then one column per clause: header on the column's name, marks on the verb, caption on the closing word.
- Stagger column A's marks at ~0.1s, B's at ~0.15s, C's at ~0.24s. Slowing down through the columns builds to the payoff instead of racing past it.
- Drive column C's flips from **one** driver looping the cells on update, not n independent tween sets: each a short 0.12s pop with `rotateX` −90→0, the last landing on the final word of the claim. Band and bloom lift as C's header resolves.

**Camera** — The table arrives slightly turned (~6.5° rotationY) and squares up across the whole shot; the straightening *is* the argument landing. Keep the columns' entrances to opacity and y only so nothing fights the card's rotation.
**Sound** — A soft tick per mark, slightly brighter for the accent column's flips.
**Fails when** — You draw a strike-through or a red cross over the alternative. It reads as attack copy and undermines the shot; a plain neutral caption ("by hand") is harsher precisely because it is neutral. Also fails when the row labels are your feature names instead of the buyer's problems.

### 11. The end card / CTA lockup

**Says:** "Here is who we are, and the one thing to do next."
**Use when:** The close. Every film.
**Runtime:** 3–4s

**Build**
- Return to the film's opening register; the close should rhyme with the hook. A mark high in the frame, a one-line headline, one solid accent element (the CTA), a URL, and a customer logo band low if you have one.
- Build the mark twice from the same source geometry: a stroke layer for the self-draw and a filled layer for the resolved state.
- Give the logo band **one** light plate for the whole row when the marks are dark ink — never recoloured, never inverted, never plated individually.
- Carry a little abstract residue from the previous frame — a pair of empty panels, no copy — as the outgoing element.

**Choreography**
- The residue clears off opposite edges (`power2.in`) while the mark arrives as the incoming. That swap *is* the transition; do not put a dissolve on top of it.
- The mark self-draws by `stroke-dashoffset` from a measured `getTotalLength()`, in segments (outer form first, details after), then **crossfades** into the filled version. Never tween gradient stops.
- Headline words fire on their own measured cues; the brand word takes a gradient sweep on `background-position` with `ease: "none"`, because even speed is what makes it read as light travelling across the letters rather than as a colour animation. The CTA pops on its verb, the URL resolves on its own cue.
- Logo band last — set the logos to their **rest opacity up front** and stagger only their y-rise. A separate fade-from-0 starting after the plate leaves one rendered frame of bare grey plate in the delivered file. Any idle on the mark runs on its own inner node with an amplitude envelope to zero, ending ~0.3s before the last frame, so the close is a genuine still.

**Camera** — Locked. The last frame of a film is a poster.
**Sound** — One resolving chord or riser peaking on the brand word, then let the bed decay into the tail. Do not cut the music dead on the last frame.
**Fails when** — The CTA competes with the brand word for the accent. Pick which is hero — usually the brand word, with the CTA as the only *solid* accent shape — and make the other quieter. Also fails when the logo band is a claim you cannot support; those must be real customers with permission.

### 12. The hardware hero

**Says:** "Here is the object, and it is beautifully made."
**Use when:** Devices, packaged goods, apparel, furniture, instruments — the reveal beat or the close. Use it **once**; a film with three 3D shots reads as a render demo.
**Runtime:** 4–6s

**Build**
- Two routes. **CSS 3D** for a slab-like object expressible as a few layered planes: a `perspective` container, a `preserve-3d` node, faces as child divs, and the same two-node rule as shot 6 (outer = dolly, inner = turn). Cheap, deterministic, no new dependency, and it composites with the rest of your DOM.
- **Three.js** when you need a real camera and real lights — a rim light raking the edge, a soft key, a reflective floor. In a bake-off of every motion route drivable on the reference machine, Three.js was the *only* real-camera, real-light option available (After Effects, Cinema 4D and Blender were all absent), and its recorded verdict was explicitly **"one shot only"**: worth it for the hero reveal or the final lockup, never for a whole act.
- Either way: a floating plane with a soft contact shadow and a rim light, plus an exploded view *only* if the parts stay legible when separated. If the object has a screen, treat the screen texture as content that must stay readable, not as a light source.

**Choreography**
- The object arrives already turning and decelerates into its hero angle. Do not start from a dead stop — a turntable beginning on the beat looks like a toy.
- The rim light sweeps the edge as the object squares up, cued to the adjective the voice uses. Callouts (a material, a dimension, a spec) fly in on their own words as flat 2D labels with leader lines; do not render text in 3D, it will alias.
- The exploded view separates on its verb and **reassembles**, or does not happen — a shot that ends exploded ends unresolved. Land on the hero angle and hold dead still for at least 0.5s.

**Camera** — One move only: a slow turntable (~15–25° total) or a slow dolly, never both. Then stop.
**Sound** — A low mechanical or material cue on the reveal — a click, a latch, a soft impact — and nothing else. Silence sells solidity.
**Fails when** — **Bloom over white.** Post-processing bloom over a near-white surface or a light UI texture blows the object into an unreadable cloud, and it looks fine in the viewport at small scale: it only shows at full resolution. Extract frames from the *delivered* file at the brightest beat and look at them (law 9). Sibling traps recorded in the same bake-off: chromatic aberration tuned at small scale runs ~40% too strong at full size; type collides with slab geometry when the type is centred and the object is not; a large empty quadrant reads as an unfinished frame. And if the 3D shot sits on a different register from its neighbours you are choosing between flipping that frame and re-lighting the object — decide before you build, not after.

### 13. The terminal / dev-tool shot

**Says:** "One command, and the thing you wanted exists."
**Use when:** SDKs, CLIs, infrastructure, APIs, agents — the developer-proof beat.
**Runtime:** 3–5s

**Build**
- **Reconstruct it; do not screen-record it.** A recording cannot be seeked to a word, cannot be paced to your VO, types at a rate you did not choose, carries paths and hostnames and timestamps you cannot put on screen, and cannot be graded with the rest of the film. A reconstruction is *more* honest, not less, because you control exactly which claim appears.
- Window chrome, a prompt glyph, a typed command line, an output region, a final status line.
- Set the mono type at video scale — 22–28px at 1920. A real terminal's 13px is illegible in a video and reads as a screenshot someone forgot to zoom.
- Output rows as discrete, pre-laid-out, hidden elements, not appended to a growing string: pre-layout means no reflow and no scroll jump. One accent, reserved for the success state; everything else is the terminal's own greys.

**Choreography**
- Determinism rules for the typewriter, without exception: one tween on a snapped integer index, `slice(0, i)`, `ease: "none"`, so the string at time T is a pure function of T. No per-character stagger (n tweens a seek can land between), no `setTimeout`, no random jitter on the rate. Blink the caret with a sine square wave off the same playhead and hide it the frame typing ends.
- Enter on the verb. Output rows then reveal on a 0.06–0.1s stagger **in bursts** — a real command emits in clumps, not on a metronome. If something takes time, show a determinate bar, never a spinner: a spinner is a loop, and loops are banned by law 3.
- The exit code or success line is the state flip and the last thing to move — a `0`, a check, a "Done in 1.2s" — landing on the closing word, then held.

**Camera** — Locked, or a ~2% push if the shot runs over 4s. Text under a rotating plane goes soft; keep the type square to the camera.
**Sound** — A soft key bed under the command only (not per-character), a single `return` thunk, one confirming tone on the exit code.
**Fails when** — The output is fake in a way a developer will catch: invented flags, impossible timings, a stack trace that could not come from that command. This audience reads terminals for a living. Copy the real output and then trim it — trimming is fine, inventing is not. Second failure: type so small the viewer has to pause.

### 14. The map and the chart reveal

**Says:** Map — "This happens everywhere, or between these places." Chart — "The number moved, and here is the shape of the move."
**Use when:** Coverage, logistics, marketplaces, travel (map); growth, savings, throughput, before/after (chart). Both are proof-act shots.
**Runtime:** 3–4.5s

**Build**
- **Map:** a flat stylised geography as inline SVG — never a live tile layer, which is non-deterministic and usually licence-encumbered. Pins as small marks, routes as SVG paths primed with `stroke-dasharray` at their own length. Hold the palette to the ground plus one accent; a full-colour map fights everything else in the film.
- **Chart:** axis, gridlines and labels as the container; bars, points or an area as the content. Bars grow on `transform: scaleY` from an origin anchored on the axis, never on `height`, which relayouts every frame. Value labels are tabular-numeral and count with their bar.
- Both: one figure or one place name may be emphasised. Not three.

**Choreography**
- Map: the ground fades up, then places land one at a time on their spoken names with a small scale pop; routes then draw between them by `stroke-dashoffset`, 0.4–0.6s each, in the order the sentence names them. If there are many, draw 3–5 hero routes on their beats and let the rest fade up quietly behind as a field.
- Chart: axis and gridlines draw first (`scaleX` on the baseline, gridlines at low opacity), then bars grow in reading order on a 0.08–0.12s stagger, then the one bar carrying the claim overshoots slightly and takes the accent on the claim word, its value label counting as it grows.
- Both end on a single held state, with at most one annotation line arriving after everything else has stopped.

**Camera** — Map: a slow push toward the region that matters, released before the cut. Chart: locked, or a ~2% drift. Never a push and a bar-growth stagger racing each other.
**Sound** — Map: a soft ping per place, a low whoosh per route draw. Chart: a rising tick bed under the growth, one hit on the hero bar.
**Fails when** — **The chart plots numbers you do not have.** This is law 1 in its most tempting form: a shape that "looks about right" is the fastest way to make a real product look fake, and anyone who knows the category spots a fabricated curve instantly. If you have the series, plot it and label the axis. If you do not, draw an abstract form that is visibly *not* a chart — no axis, no ticks, no numerals, no gridlines — or cut the shot. There is no honest middle. The map carries the same rule more quietly: do not light up territory you do not operate in.

## Composing a film from these

**Never put the same camera move on two adjacent shots.** A push into a results surface followed by a push into a workspace reads as one long shot with a bad cut in the middle, and the second push stops meaning anything. Alternate: locked → turn → locked → dolly → locked. The move should be a surprise each time. This is also the practical reason shot 3 is locked while 5 and 6 are not — it sits between them.

**Alternate busy and still.** A crowding shot, a results surface and a workspace back-to-back exhaust the audience by the twenty-second mark; they stop reading and start waiting. Put a title card, a stat or a quote between two dense shots. The still frames are where the argument is absorbed — the dense ones only demonstrate that it is true. A rough budget for a 45s film: three dense product shots, four still or near-still ones, and the two type frames at the ends.

**Flip the register at the story turns, not between them.** The argument act sits on one ground, the product and proof acts on the other, and the close returns to the first — two grounds, one accent, per law 8. If frames inside an act sit on different grounds the film reads as a compilation of separate videos, which is exactly what it becomes when each frame is built in isolation. Write the register map into the storyboard before frame 1, and mark each shot's camera move on it, so the no-adjacent-moves rule is checkable on paper instead of discovered in the delivered file.

Next: `../assets/STORYBOARD.md` for the plan format, then `04-motion-grammar.md` and `05-camera-3d-cursor.md` to build. Read `10-traps.md` before debugging anything.

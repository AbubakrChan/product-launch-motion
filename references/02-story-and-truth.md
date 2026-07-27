# Story and Truth

Owns **Law 1 (Truth first)** and the story half of **Law 8 (Ration the accent)**.

Pipeline steps 1–3: what the film says, and how every word, number, face and screen on it stays honest. Do this
before you animate anything. A film with a clear angle and no invented facts survives a bad shot; a beautiful
film built on a made-up metric is unshippable the moment anyone checks.

## 1 · The angle

**One claim, one film.** Forty-five seconds lands exactly one idea; two ideas means neither is remembered.
Everything after the thesis beat is evidence *for that one claim* — not a tour of the feature list.

Look in three places, in order. Stop at the first that yields a sentence.

| Source | Why it works | How to get it |
|---|---|---|
| The product's own headline | Marketing already fought this fight; the h1 is the claim the company decided to make | Read above the fold; take it verbatim if it survives being said aloud |
| A customer's own words | A sentence a real user said outranks anything you can write, because it is theirs | Case studies, sales-call notes, support threads, reviews, press kit |
| The single before/after | With no headline and no quote, name the state change | One sentence, past tense → present tense: "You did X by hand" → "It does X" |

**EXAMPLE — the reference film.** The angle is the product's homepage headline, verbatim: *"Hire the agent, not
the agency."* `BRIEF.md` records the intent — "Sell, don't tour: lead with the site's own headline" — and lists
the site copy that must survive unchanged to screen. The second half exists to prove that sentence.

### The test

**Can you say the claim in seven words or fewer, out loud, without a conjunction?**

- "Hire the agent, not the agency." — 6 words. Passes.
- "A modern platform for teams who want to move faster and reduce cost." — fails on every axis: no verb the
  viewer performs, two claims joined by "and", nothing specific.

Fail the test and you have a category description, not an angle. Write three candidate sentences and pick the
one a customer would repeat to a colleague. Once fixed, the angle decides which product beats earn a frame (only
those that prove the claim), which proof you need (evidence *for the claim*, not general credibility), and what
the CTA asks for. Record it in `../assets/BRIEF.md` before writing a line of script.

## 2 · The arc

Default: **problem → agitate → solve → prove → contrast → act** (PAS with a proof-and-contrast tail). It works
because it opens inside the viewer's week rather than inside your product, and it earns the claim before it
makes it.

| Act | Job | Share | At 45s |
|---|---|---|---|
| Problem | Name the work the viewer personally does. No product, no logo. | 8–10% | 4s |
| Agitate | Escalate to the real shape or cost of it. Still no product. | 8–10% | 4s |
| Thesis | The claim, said once, held still. | 5% | 2–3s |
| Product beats | 3–4 capability beats, one per proof-carrying feature. | 30–35% | 14–16s |
| Proof | Real numbers, then a real person. Numbers convince, people persuade. | 20–25% | 10s |
| Contrast | Answer "we already have tools", factually. | 10% | 5s |
| CTA | One action, brand last. | 8–10% | 4s |

Two rules matter more than the exact split. **The claim lands inside the first 10 seconds** — problem, agitate
and thesis are your entire budget before the viewer decides. **Cap product beats at four**; a fifth costs you
proof time, and proof is what makes the beats believable.

**The cold-open alternative.** Open on the product doing the striking thing — three seconds of the result, then
cut back to the problem. Use it when the result is visually self-evident (a render finishing, a device lighting
up, a one-frame before/after), when the audience already feels the pain (developer tools, well-understood
categories), or when the film is under 30s and a two-beat setup will not fit. Do **not** cold-open when the
audience does not yet know they have the problem — a buyer who thinks their agency retainer is normal needs the
problem named first.

### EXAMPLE — the reference film's 11 frames

44.2s. `STORYBOARD.md` frontmatter arc: "PAS with feature-benefit progression"; windows from `README.md`.
One worked example, not a template to copy frame-for-frame.

| # | Act | Frame | Window | Beat |
|---|---|---|---|---|
| 1 | Problem | `01-hook` | 0.0–4.1 | Four verbs of the actual work, stacking up |
| 2 | Agitate | `02-pain` | 4.1–8.1 | Seven lifecycle stages crowd in, plus the retainer to do it by hand |
| 3 | Thesis | `03-turn` | 8.1–10.2 | The claim, held still |
| 4 | Product | `04-prompt` | 10.2–12.6 | Ask in plain English (register flips dark → light) |
| 5 | Product | `05-discovery` | 12.6–16.8 | It searches, and finds the contact |
| 6 | Product | `06-outreach` | 16.8–21.2 | Drafts, replies, negotiates |
| 7 | Product | `07-gifting-detection` | 21.2–24.6 | Ships the product, catches every post |
| 8 | Proof | `08-proof-numbers` | 24.6–31.1 | Named customer, two figures |
| 9 | Proof | `09-proof-quote` | 31.1–35.3 | One named person, their own words |
| 10 | Contrast | `10-contrast` | 35.3–40.6 | The old way against the product, factually |
| 11 | CTA | `11-cta` | 40.6–44.4 | One action, URL, brand last |

Note the shape: thesis at 8.1s, four product beats and no more, 10.7s — a quarter of the film — spent on proof.

## 3 · Writing for the ear

The script is heard once, at speed, probably without the viewer's full attention.

1. **One clause per beat.** A beat is one reveal; two clauses need two reveals, and the second lands late.
2. **Short words.** "Finds" not "identifies"; "sends" not "facilitates delivery". Syllables are runtime.
3. **The claim inside the first 10 seconds.** Non-negotiable.
4. **No stacked subordinate clauses.** A TTS voice cannot punctuate them and a human has to fight them. If you
   need a comma inside a comma, split the sentence.
5. **Full stops are direction.** A period is a breath and a cut point. Four short sentences give you four beats
   to animate; one long sentence gives you one.
6. **Numerals in speech: write them as they are said**, not as they are typed — "three hundred fifty million",
   not "350M" — so TTS pronounces it and a human reads it identically.
7. **Round for the ear, exact on screen — and only ever round toward the less impressive number.** Rounding up
   is a fabrication.

**EXAMPLE.** The reference film speaks "It searches three hundred fifty million creators" (`SCRIPT.md`) while
the on-screen approved figure is `350M+`. On the proof beat the voice says "twenty thousand five hundred" while
the screen counts up to the sourced `20,521` — rounded down, never up.

**Before** — written for the eye; three clauses, one breath:

> Our platform leverages AI to help marketing teams streamline their entire creator workflow, from initial
> discovery through to performance reporting, so they can reduce costs while scaling output.

**After** — written for the ear; four beats, four reveals:

> Find the creators. Email them. Negotiate. Chase every post.

The rewrite lost the feature list and gained a film: each sentence is a frame beat, each is a thing the viewer
personally does, and the line runs about four seconds. (It is the reference film's actual hook line —
`SCRIPT.md`, line 1.) Delivery notes belong in the script too: the reference `SCRIPT.md` carries a per-line
**Delivery** direction ("Flat and factual — a list of chores, not a rally") plus a global voice direction, and
those notes survive into the VO render and into the motion — see `./03-word-locked-sync.md`.

## 4 · The truth pass

The heart of this document. Do it *before* animating, because every hour spent animating a number you cannot
source is an hour you will throw away.

### 4.1 The approved-figures list

Write down **the exact set of numerals allowed to appear on screen**, each with its source. Refuse every other
number — including plausible filler, including round numbers you are confident about, including one that is
"obviously fine". The list is a whitelist, not a guideline: if a shot wants a fifth stat and the list has four,
the shot gets four.

**EXAMPLE.** `frame.md` amendment 5 ("Real assets, real numbers") fixes seven figures: `20,521` creators
contacted · `24×` projected ROI · `58.7%` creator response rate · `12×` lower campaign cost · `<1 min` average
reply time · `350M+` creators indexed · `852` emails, zero manual. `README.md`'s design-system section lists
those seven plus `400 creators / 3 weeks`, which the proof-quote frame puts on screen. `STORYBOARD.md`'s
negative list states the rule in one line: "No invented metric, ever — the approved figures are the seven in
`frame.md` amendment 5 and nothing else appears as a number."

Note what that forces: the negotiation beat resolves as a *state* — "Counteroffer sent" → "Rate agreed" — with
no price anywhere, because no rate figure is on the list ("No figures anywhere: the negotiation resolves as
state, not as a price"). That is the list doing its job.

**Building a list for a product with no public numbers**, in order of preference:

1. **The customer's own dashboard or database, with written permission.** Pull the real figure, screenshot the
   source, record the query or URL beside the number in the brief. Permission is per-figure, not blanket.
2. **A published case study, press kit, or investor update.** Cite the document.
3. **A count you can defend from the product itself** — index size, supported integrations, p50 response time
   from your own monitoring.
4. **None.** Ship a film with zero numbers.

**A film with zero invented numbers beats a film with impressive fake ones** — not narrowly, categorically. A
fake number is the fastest way to make a real product look like vapourware: the one viewer who knows the market
will spot it, and they are usually the buyer. Qualitative proof (a real quote, a real named logo, a real screen)
carries a film on its own.

### 4.2 Real assets

Every screen, logo, photograph and piece of UI on screen is the real thing. Where to look:

| Asset | Where it actually lives |
|---|---|
| Product screens | The marketing site's `public/` or CDN; the design system's Storybook; a live capture of the app; the app repo's screenshot fixtures |
| Brand marks + tokens | The brand repo, the press/media kit page, the site's CSS custom properties, a site capture |
| Customer logos | The press kit, the homepage "trusted by" strip, the customer's own media kit |
| Product photography | E-commerce PDP images, the press kit, the shoot originals |
| Customer faces + quotes | The published case study — the person's own photograph beside their own verbatim sentence |
| Live UI stills | A scripted capture of the running product (see `./09-shot-catalog.md`) |

**EXAMPLE.** The reference film's screens come from the marketing-site repo's `public/` plus a capture of the
live site, staged into `assets/`; `BRIEF.md` records each source file, its dimensions, and the beat it serves.

**The lesson about faces.** A real named customer's own photograph, from their published case study and shown
next to their real quote, is legitimate — their words, their face, their published permission. An invented face
is not, and a stock face is worse, because it is a *recognisably* invented one. The reference film's v7 director
note puts the reason plainly: the quote frame cites the line to the real person's photograph from the case
study, then his name and role, then the logo — "A quote attributed to a face reads as a person; the same quote
attributed to a logo reads as copy."

**Reconstruction vs. fabrication.** Rebuilding a real product surface in HTML for crispness is legitimate *when
the surface is real and the rebuild is faithful* — a 5760px screenshot scaled into a 1920px frame goes soft. The
reference film reconstructs its composer in HTML, labels it in `STORYBOARD.md` as "an intentional UI-demo
reconstruction", and anchors it on the real captured console behind it. Drawing a UI the product does not have
is fabrication, whatever you call it.

### 4.3 The negative list

Write down what may **never** appear. A negative list is cheaper to enforce than a positive one, because it
catches the thing you were about to do at 2am without thinking. A generic starter list any project can adopt:

- No stock photography, and no stock faces anywhere.
- No invented metric, percentage, currency figure, or date.
- No competitor named on screen, and no sneer in the comparison copy.
- No fake UI — nothing the product cannot actually do.
- No logo you lack permission to show; no recoloured or inverted customer logo (dark variants are deliberate).
- No decorative shape standing in for a real screen.
- No browser chrome, nav bars, scrollbars, or OS cursors, unless a UI demo deliberately reconstructs one.

**EXAMPLE.** The reference film's negative list (`STORYBOARD.md`) adds motion prohibitions to the truth ones —
no lazy breathing, no back-half pan/push, no bouncy eases, "not slideshow (dump-then-freeze), not screensaver
(everything drifting independently)". Keep both kinds on one list; the same late-night impulse violates them.

### 4.4 Honesty in demos

- **If the product cannot do it, do not show it.** No aspirational UI, no "coming soon" state dressed as
  current, no feature flag flipped only for the film.
- **If a step takes three minutes, do not imply three seconds.** Show the *state*, not a fabricated speed: the
  running spinner, the completed check, the result. Cut between states rather than animating a fake
  fast-forward.
- **Show the honest end of the range.** If replies typically arrive in minutes, claim minutes.
- **Label reconstructions to yourself** in the storyboard, so a later reviewer can tell a design decision from a
  lie.

**EXAMPLE.** The reference film's agent-run panel leaves its third step (`Building list`) deliberately *running*
rather than completing it, because the next frame is what completes it — the state shown is the true state.

## 5 · The register map

**Two grounds. One for the argument, one for the product and its evidence.** The register map is the film's
spine: it tells the viewer, pre-consciously, which mode they are in — "this is about you and your problem"
versus "this is the thing, and here is the evidence". A frame is one register or the other, never both.

**Every register change is a story turn, and carries a transition.** If the ground changes, something in the
argument changed. A flip on a beat that is not a turn reads as an accident; a turn with no flip reads flat.

**Why two and not five.** Each extra ground is another thing the viewer must learn the meaning of, inside 45
seconds, while also listening. Two grounds is one bit of information, legible immediately. Three is a system
nobody decodes; five is inconsistency with a rationale attached.

**EXAMPLE.** Dark `#100E19` for the argument (frames 1–3, 10–11), light `#FAFAFB` for the product and its
evidence (frames 4–9). Two flips in the whole film — into light at frame 4, back to dark at frame 10 — both
carrying a `zoom-through` transition. `frame.md` amendment 2 states the law; `STORYBOARD.md` calls the map "the
film's spine". Your equivalent might be light/dark, cool/warm, or interior/exterior; what matters is that the
two grounds are *assigned to acts*, not chosen per frame.

## 6 · Palette rationing

**One accent — a colour or a gradient — with a written budget of the jobs it may do.** Everything else is
ground, ink, and muted grey. Write the budget as a numbered list in the design spec before building. Typically
five jobs, and typically these:

1. The one emphasis word per headline.
2. Stat numerals.
3. The active step in a sequence or pipeline.
4. State flips (a check turning on, a status resolving).
5. The CTA.

A third hue is almost always a mistake: the accent's whole function is *"look here"*, and a second saturated
colour halves the signal. Two hues that form one gradient ramp are one accent, not two.

**EXAMPLE.** The reference film rations a purple→orange gradient (`#B04ADC → #FF7247`) to exactly five jobs —
one emphasis word per headline, stat numerals, the active pipeline step, the check-flips on the product's
comparison column, and the CTA pill (`STORYBOARD.md`, "Palette system"; `frame.md` amendment 3). Explicitly
excluded: no third hue, no gradient headlines in full, no generic "AI" blue-purple bokeh.

**The AA consequence.** A brand accent tuned for large marketing type frequently fails WCAG AA at small sizes on
a light ground. Do not silently ship it, and do not silently drop the contrast gate — pick a **deeper variant of
the same hue** for small text. The reference film uses the site's deeper `#9A3FC4` for small purple text
specifically so it clears AA (`README.md`, design-system item 3). Gate mechanics — and why the film grade must
be off to measure contrast honestly — live in `./06-look-and-grade.md` and `./08-qa-and-direction.md`.

## 7 · For any product

Steps 1–6 do not change shape. What changes is where the truth comes from.

**Hardware.** The angle is usually a physical before/after, and the proof is the object itself. Real assets
means press-kit or shoot photography — never a render pretending to be a photograph unless you say so. Approved
figures are spec-sheet numbers only (battery hours, weight, dB); the negative list must forbid any spec not on
the published sheet.

**E-commerce.** The angle is the customer's outcome, not the SKU. Real assets are the PDP photography and real
review text under the reviewer's published name. Approved figures are order counts, review counts and ratings
pulled from the store admin — never a made-up "10,000 happy customers". Show the real cart and the real price,
or show no price.

**Mobile app.** The angle is a moment in someone's day. Real assets are captures at real device resolution, from
a device or simulator, not a mockup with fabricated content inside it. Watch for fake data: a screenshot full of
invented user names is still an invented screen. Use a real seeded demo account, and say so in the storyboard.

**Dev tool.** The angle is usually the diff in the loop: what the developer typed before, versus now. Real
assets are real terminal output and a real repo — run the command, capture the actual output including the
actual timing. Never fake a green test run or trim an error out of a log; developers read frames. Approved
figures are benchmarks with the machine and command recorded beside them.

**Service business.** There is no product UI, so the proof act carries the whole film: real named clients with
permission, real deliverables (a redacted report page, a real dashboard), real outcome figures from the
engagement. The approved-figures list is short and client-sourced, and the negative list must forbid the
unattributable industry statistic — "companies waste 30% of their budget", uncited, is this sector's equivalent
of a stock face.

## Related

- `../assets/BRIEF.md` — intake template: product, audience, claim, angle, constraints, approved figures.
- `./03-word-locked-sync.md` — script → VO → word-level cue table. Written here; timed there.
- `./04-motion-grammar.md` — the motion half of the negative list.
- `./06-look-and-grade.md` — the palette and contrast mechanics behind §6.
- `./08-qa-and-direction.md` — the gates that verify §4 held all the way to the delivered file.
- `./09-shot-catalog.md` — the shots each product beat can be built from.

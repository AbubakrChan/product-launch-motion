# Direction: making each film its own

Invention happens here, before any code. Execution afterwards is disciplined. A film that changes
its mind halfway looks like two films.

## 1 · Taste, translated

Each quality in SKILL.md, with ways to reach it. The first way listed is how the Cheerful films did
it. It is still allowed; it is just not the default.

| Quality | Ways to get it |
|---|---|
| **Continuity** | One shape that never cuts and morphs into every state · match cuts on shape, colour or motion · one line drawn through the whole film · the camera travelling through an object into the next scene · a word that becomes the scene · a real object passed hand to hand |
| **Cause and effect** | A cursor with real clicks and drags (the product's agent as a second cursor) · a hand or a person · the music itself (the kick moves things) · data arriving · a physical action: fold, pour, stamp, print · type pushing type |
| **Physical motion** | Springs, plus a personality per film: crisp UI snap, heavy and inertial, floaty, mechanical stepped · edge-split stretch (leading edge on a stiffer spring) · anticipation and overlap |
| **Never dead** | Something on every beat · alternate dense and sparse bars · designed holds that breathe (drift, light, grain) · silence used once, on purpose |
| **Numbers you feel** | Rolling odometer · a physical scale (stacks, distance, fill level) · one number held huge · before and after, cut on the beat |
| **Proof with rhythm** | Logos slammed one per hit on one recoloured shape · logos as stamps, as objects in the scene, on real products, on a map, built from the film's signature shape |
| **Sound placed by peak** | Synthesized UI clicks · foley (paper, glass, metal, wood) · mechanical · analog synth · orchestral hits · CC0 samples, checked per item · no song at all, sound-design-led |

## 2 · Derive from the product

Work these in order; the last usually decides it.

1. **Brand material.** Palette, type, illustration, photography. Extend the brand into time; don't
   animate the website.
2. **Category cliché.** Name it in one sentence ("dev tools are dark, mono and terse"), then meet it
   or break it, on purpose.
3. **Where it plays.** A muted feed needs the claim as type in two seconds; a keynote screen can hold
   a slow wide shot; a sales attachment can be dense.
4. **The claim's feeling.**

| The claim is about | The film should feel |
|---|---|
| Relief from drudgery | Weight lifting: crowded to clean, loud to quiet |
| Precision or trust | An instrument: grid, restraint, tabular figures |
| Speed | Kinetic: hard cuts, speed ramps, arrival before you expect it |
| Craft or taste | Slow, tactile, photographic, generous space |
| Power or scale | Wide, deep, a small human next to a big system |
| Play or delight | Overshoot in colour (not in easing), sound-led jokes that land in 200 ms |

**What kind of product is it?** A UI product can be demoed. A service (people and process), hardware
or an API cannot be: don't invent a dashboard so a cursor has something to click. Show the work, the
people, the object or the outcome instead.

## 3 · The dials and the structure

Pick a position on every dial. Extremes beat centres: a film in the middle of every dial is the
default look.

| Dial | One pole | Other pole |
|---|---|---|
| Energy | contemplative, long holds | relentless, every beat |
| Density | one idea per frame | layered, maximal |
| Ground | flat void or paper | photographic, material, a live field |
| Depth | resolutely 2D | deep 3D |
| Camera | locked off | one continuous move |
| Type | neutral grotesk | editorial serif, mono, expressive display |
| Texture | clinical | grain, halation, print, CRT |
| Colour | monochrome plus one signal | full brand spectrum |
| Product | literal UI | metaphorical or absent |
| Sound | ticks over a song | sound-design-led, or score-led |

Sameness hides in structure more than in surface. Two films can share no colour and still be the same
film. Choose these too:

| Structural axis | Options |
|---|---|
| Device | many to one · before and after · a day in the life · testimony · pure demonstration · contradiction · absence (the work that no longer happens) · one object examined |
| Arc | problem then solution · start at the payoff and work back · one unbroken demonstration · a question held open to the last frame |
| Where the turn lands | 40% is everyone's default; try 15% or 75% |
| Opening | empty ground that fills (default) · start full and subtract · start mid-action |
| Climax | one hero element swallowing the frame is one option, not the option |
| Ending | quiet wordmark lockup is the default; end loud, mid-motion, on the product in use, or on the absent problem |
| Human presence | most code-built films have none; a hand, a face or a real photo is a bigger difference than any grade. Sources: free-licence stock checked per item, the client's own photos with permission, or a hand or silhouette drawn in code |

## 4 · Three directions, keep one

```
DIRECTION <name>
Thesis      one sentence: what this film IS
Dials       energy · density · ground · depth · camera · type · texture · colour · product · sound
Structure   device · arc · turn · opening · climax · ending · human presence
Signature   the one move only this film makes (from the product's core verb)
Sound       song (genre, tempo, arc) or none · SFX palette
Spring      the motion personality
Risk        how it fails if executed badly
```

Kill a direction if a competitor could use it unchanged, or if it only works when every frame is
perfect. The signature move expresses the claim, repeats two or three times (early, middle, end),
and is simple enough to do perfectly. To find it, make the film do the product's core verb: a product
that consolidates converges every transition; one that removes work leaves the frame emptier as the
film runs.

## 5 · The ledger

`~/.config/product-launch-motion/films.json` survives skill updates. If it does not exist, copy
`references/ledger-seed.json` there (it holds the Cheerful films). Append one entry per finished film:

```json
{ "film": "Brand: title", "date": "YYYY-MM-DD",
  "dials": { "energy": "...", "density": "...", "ground": "...", "depth": "...", "camera": "...",
             "type": "...", "texture": "...", "colour": "...", "product": "...", "sound": "..." },
  "structure": { "device": "...", "arc": "...", "turn": 0.4, "opening": "...", "climax": "...",
                 "ending": "...", "human": "..." },
  "signature": "...", "song": "title, genre, BPM", "sfx": "...", "spring": "...", "moves": ["..."] }
```

Write the three directions first, from the product. Then compare them with the last three entries. If most dials and structural
axes match one of them, say so in a `DECISION:` line with the reason, or choose again. This is a nudge,
not a gate: a move Chan loves can come back on purpose.

## 6 · Looks AI: tells to avoid

These came from a real film that read as machine-made.

| Tell | Instead |
|---|---|
| Micro-labels, chips and uppercase eyebrows on every scene | Fewer words, bigger; one label where it earns its place |
| Every element a white rounded card with a soft shadow | A ground and a material chosen by the direction |
| Pastel blurred blobs as the default background | A real texture: photo, paper, grain, light, or a flat colour field with intent |
| Small content centred in a big empty frame | Full-bleed scenes; frame tight; asymmetric composition |
| An invented dashboard for a product without a UI | Show the work, the people, the object or the result |
| Clip-art illustration drawn in code | Real photography, real product, or type as the image |
| One spring and one rhythm for everything | A spring personality; vary density bar to bar |
| Text that is unreadable at 1080p after camera zoom | ≥ ~28 px on screen, or remove it |

#!/usr/bin/env node
// wire-grade.mjs — mount the film grade on top of an assembled film.
//
// Three treatments that cost nothing per-frame to author and lift every shot at once:
//
//   1. moving film grain — kills digital flatness. Deterministic: the noise seed is
//      derived from the playhead, so frame N always gets seed N. No Math.random.
//   2. vignette          — pulls the eye to centre.
//   3. specular sweeps   — one light pass on named story beats. Never a loop.
//
// NOTE — there is no `mix-blend-mode` anywhere in this file, deliberately. The renderer
// composites each `.clip` track as its own layer, so a blend mode here has no frame
// content as its backdrop: it blends against transparency, and a `multiply` vignette over
// nothing paints its own near-white source colour. The first version of this pass did
// exactly that and rendered an entire film as a white wash. Plain alpha only.
//
// Run AFTER assemble + transitions + wire-audio: it reads the film's real length off the
// frame wrappers. Idempotent — re-running replaces the block it wrote last time.
//
// usage:
//   node scripts/wire-grade.mjs [--grain 0.1] [--vignette 0.15] [--sweep 0.11]
//                               [--sweeps "7.92:0.9,24.62:0.9,40.17:0.95"]
//                               [--index index.html] [--dry] [--off]
//
//   --off strips the grade. Needed for the contrast gate: a full-canvas overlay makes a
//   WCAG sampler read text against the grade and report nonsense (a real 1.06:1 on text
//   that passes comfortably). Gate with it off, ship with it on.

import { readFileSync, writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const num = (name, fallback) => {
  const v = flag(name, null);
  return v === null ? fallback : Number(v);
};

const INDEX = flag("index", "index.html");
const dry = argv.includes("--dry");
const off = argv.includes("--off");

// Deliberately low. This is a grade, not a filter: if a viewer can name the effect, it is
// too strong.
const GRAIN = num("grain", 0.1);
const VIGNETTE = num("vignette", 0.15); // low on purpose — a heavy vignette on a LIGHT
//                                          register reads as dingy, not cinematic
const SWEEP = num("sweep", 0.11);

// Specular sweeps in absolute film seconds — "at:duration", one per story beat.
const SWEEPS = (flag("sweeps", "") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => {
    const [at, dur] = s.split(":").map(Number);
    return { at, dur: dur || 0.9 };
  });

const MARK_OPEN = "<!-- wire-grade:start -->";
const MARK_CLOSE = "<!-- wire-grade:end -->";
const TRACK = 990;

let html = readFileSync(INDEX, "utf8");
html = html.replace(new RegExp(`\\n?[ \\t]*${MARK_OPEN}[\\s\\S]*?${MARK_CLOSE}`, "g"), "");

if (off) {
  if (!dry) writeFileSync(INDEX, html);
  console.log("✓ grade removed (run the contrast gate now, then re-run without --off)");
  process.exit(0);
}

// the film's real length, off the assembled frame wrappers
let total = 0;
for (const m of html.matchAll(/data-composition-src="[^"]+\.html"[^>]*>/g)) {
  const tag = m[0];
  const start = Number(tag.match(/data-start="([\d.]+)"/)?.[1] ?? NaN);
  const dur = Number(tag.match(/data-duration="([\d.]+)"/)?.[1] ?? NaN);
  if (Number.isFinite(start) && Number.isFinite(dur)) total = Math.max(total, start + dur);
}
if (!total) throw new Error(`no frame wrappers found in ${INDEX} — assemble first`);

// Each treatment is emitted only if it is switched on. This matters more than it looks:
// the anti-sameness check in references/11-creative-direction.md says to pick the treatments
// your direction needs and drop the rest, and if the tool always writes all three then the
// tool wins and every film made with this skill gets the same look. `--grain 0`,
// `--vignette 0` and omitting `--sweeps` are first-class choices, not degenerate cases.
const useGrain = GRAIN > 0;
const useVignette = VIGNETTE > 0;
const useSweeps = SWEEPS.length > 0 && SWEEP > 0;

if (!useGrain && !useVignette && !useSweeps) {
  console.error("every treatment is off — nothing to wire. Use --off to strip the block instead.");
  process.exit(1);
}

const vignetteEl = useVignette
  ? `
      <!-- vignette: transparent centre → dark corners, straight alpha -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 78% 74% at 50% 48%, rgba(8,6,14,0) 44%, rgba(8,6,14,${(VIGNETTE * 0.4).toFixed(3)}) 78%, rgba(8,6,14,${VIGNETTE}) 100%)"></div>`
  : "";

const sweepEl = useSweeps
  ? `
      <!-- specular sweep — parked off-canvas, driven once per beat.
           The gradient axis is 90deg and the ELEMENT is skewed: an angled gradient on a
           tall box projects corner-to-corner and shows a hard seam. -->
      <div id="hf-grade-sweep" style="position:absolute;top:-24%;left:0;width:40%;height:148%;opacity:0;background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${SWEEP}) 50%, rgba(255,255,255,0) 100%)"></div>`
  : "";

const grainEl = useGrain
  ? `
      <!-- moving grain: the noise's luminance is moved into ALPHA by the colour matrix,
           so the plate is black speckles over transparency rather than a grey haze — which
           is what lets it work with no blend mode. -->
      <svg id="hf-grade-grain" width="1920" height="1080" style="position:absolute;inset:0;opacity:${GRAIN}" aria-hidden="true">
        <filter id="hf-grade-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence id="hf-grade-turb" type="fractalNoise" baseFrequency="0.82" numOctaves="1" seed="1" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0
                                               0 0 0 0 0
                                               0 0 0 0 0
                                               0.34 0.34 0.34 0 0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#hf-grade-noise)" />
      </svg>`
  : "";

const grainJs = useGrain
  ? `
        /* Grain: one driver for the whole film. seed = floor(t * 12) % 12 — a pure
           function of the playhead, so a seek to any time reproduces the same grain field.
           12Hz, not per-frame: re-seeding every frame reads as electronic sizzle rather
           than film, and it defeats inter-frame compression (a 30Hz cut encoded to 85MB
           against ~9MB ungrained). Real film grain is also held across frames at 24fps. */
        var turb = document.getElementById("hf-grade-turb");
        var clock = { t: 0 };
        var lastSeed = -1;
        tl.to(clock, {
          t: TOTAL, duration: TOTAL, ease: "none",
          onUpdate: function () {
            var seed = Math.floor(clock.t * 12) % 12;
            if (seed !== lastSeed) { lastSeed = seed; turb.setAttribute("seed", String(seed)); }
          },
        }, 0);`
  : "";

const sweepJs = useSweeps
  ? `
        /* Specular sweeps — one pass per story beat, no repeat. */
        var sweep = document.getElementById("hf-grade-sweep");
        gsap.set(sweep, { skewX: -14 });
        var SWEEPS = ${JSON.stringify(SWEEPS)};
        SWEEPS.forEach(function (s) {
          tl.fromTo(sweep, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "power1.out" }, s.at);
          tl.fromTo(sweep, { xPercent: -140 }, { xPercent: 260, duration: s.dur, ease: "power2.inOut" }, s.at);
          tl.to(sweep, { opacity: 0, duration: 0.2, ease: "power1.in" }, s.at + s.dur - 0.2);
        });`
  : "";

const block = `
    ${MARK_OPEN}
    <div
      id="hf-grade"
      class="clip"
      data-start="0"
      data-duration="${total.toFixed(3)}"
      data-track-index="${TRACK}"
      style="position:absolute;inset:0;z-index:9000;pointer-events:none"
    >${vignetteEl}${sweepEl}${grainEl}
    </div>
    <script>
      /* grade pass — appended to the root timeline the assembler built. */
      (function () {
        var tl = window.__timelines && window.__timelines["main"];
        if (!tl) return;
        var TOTAL = ${total.toFixed(3)};
${grainJs}${sweepJs}
      })();
    </script>
    ${MARK_CLOSE}`;

const anchor = html.lastIndexOf("</body>");
if (anchor === -1) throw new Error(`${INDEX} has no </body>`);
const out = html.slice(0, anchor) + block + "\n  " + html.slice(anchor);

const active = [
  useGrain ? `grain ${GRAIN} (seed = f(playhead))` : null,
  useVignette ? `vignette ${VIGNETTE}` : null,
  useSweeps ? `${SWEEPS.length} specular sweep(s) at ${SWEEPS.map((s) => s.at).join(", ")}s` : null,
].filter(Boolean);
console.log(`grade: total ${total.toFixed(3)}s · ${active.join(" · ")}`);
if (active.length === 3) {
  console.log(`  note: all three treatments are on, which is this kit's default look.`);
  console.log(`  Your direction should be choosing them, not inheriting them —`);
  console.log(`  --grain 0 and --vignette 0 are first-class choices. A scanner-lit or`);
  console.log(`  clinical film wants no vignette; a crisp graphic film wants no grain.`);
}
if (dry) process.exit(0);
writeFileSync(INDEX, out);
console.log(`✓ wired grade into ${INDEX}`);
console.log(`  contrast gate: node scripts/wire-grade.mjs --off && <your check> && node scripts/wire-grade.mjs`);

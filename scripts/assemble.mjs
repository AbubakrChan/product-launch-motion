#!/usr/bin/env node
// assemble.mjs — write index.html from a manifest and the measured voiceover.
//
// This script exists to enforce one law in code rather than in prose: a frame's length is
// MEASURED from its narration, never estimated. Give it the VO file and it does the
// arithmetic that references/03-word-locked-sync.md describes:
//
//   hold           = measured VO length + a pad, so the shot does not cut on the last syllable
//   frame.duration = hold + the outgoing transition's duration
//   next.start     = this.start + hold                        (NOT + duration)
//
// The surplus is the overlap the transition lives in. Get this wrong by hand once and every
// downstream cue is wrong by the same amount, silently, for the rest of the film.
//
// The index is GENERATED. Anything hand-added to it dies on the next run — which is exactly
// why wire-audio, wire-grade and transitions all write into their own marked blocks and are
// safe to re-run. After any edit to film.json, re-run the whole chain in order:
//
//   node scripts/assemble.mjs
//   node scripts/transitions.mjs
//   node scripts/wire-audio.mjs
//   node scripts/wire-grade.mjs
//
// film.json:
//   {
//     "width": 1920, "height": 1080,
//     "background": "#FAFAFB",              // the film's base colour, behind every frame
//     "gsap": "vendor/gsap.min.js",         // vendored, not a CDN — renders must be offline-safe
//     "pad": 0.25,                          // breath after the last word; per-frame overridable
//     "frames": [
//       { "id": "01-hook",  "src": "compositions/frames/01-hook.html",
//         "vo": "assets/voice/01.wav",
//         "out": { "type": "dissolve", "duration": 0.5 } },
//       { "id": "02-pain",  "src": "…", "vo": "…", "pad": 0.6,          // land this beat
//         "out": { "type": "push", "duration": 0.5 } },
//       { "id": "03-title", "src": "…", "duration": 2.4 }        // no VO: state it explicitly
//     ]
//   }
//
// usage:
//   node scripts/assemble.mjs [--manifest film.json] [--out index.html] [--dry]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const MANIFEST = flag("manifest", "film.json");
const OUT = flag("out", "index.html");
const dry = argv.includes("--dry");

if (!existsSync(MANIFEST)) {
  console.error(`no ${MANIFEST}. See the header of this file for its shape.`);
  process.exit(1);
}
const film = JSON.parse(readFileSync(MANIFEST, "utf8"));

const W = film.width ?? 1920;
const H = film.height ?? 1080;
const BG = film.background ?? "#000";
const GSAP = film.gsap ?? "vendor/gsap.min.js";
const frames = film.frames ?? [];
if (!frames.length) throw new Error(`${MANIFEST} has no frames`);

// Trailing zeros are noise in a diff and make every re-run look like a change.
const t = (n) => String(Number(n.toFixed(3)));

/** Measured length of an audio file, in seconds. */
function probeDuration(file) {
  if (!existsSync(file)) throw new Error(`missing voiceover: ${file}`);
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  if (r.error) throw new Error(`ffprobe not found — install ffmpeg`);
  const secs = Number((r.stdout || "").trim());
  if (!Number.isFinite(secs) || secs <= 0) {
    throw new Error(`ffprobe could not read a duration from ${file}: ${(r.stderr || "").trim()}`);
  }
  return secs;
}

// ── the timing pass ────────────────────────────────────────────────────────────────────
let cursor = 0;
const timed = frames.map((f, i) => {
  if (!f.id) throw new Error(`frame ${i} has no id`);
  if (!f.src) throw new Error(`frame ${f.id} has no src`);

  // A frame is as long as what is SAID over it, plus a breath. `duration` is the escape
  // hatch for a frame with no narration (a title card, a music-only film) — and it has to
  // be stated, because an unmeasured guess is the failure this script exists to prevent.
  //
  // The pad is not slack. A shot that cuts on the last syllable reads as rushed even when
  // every tween in it was perfect, because the viewer is still reading the frame when it
  // leaves. ~0.25s is a breath; raise it on a beat you want to land (the turn, the end
  // card) and the film gains rhythm rather than length.
  const measured = f.vo ? probeDuration(f.vo) : f.duration;
  if (!Number.isFinite(measured)) {
    throw new Error(`frame ${f.id} has neither "vo" nor an explicit "duration"`);
  }
  const pad = f.vo ? (f.pad ?? film.pad ?? 0.25) : 0;
  const hold = measured + pad;

  const overlap = i === frames.length - 1 ? 0 : (f.out?.duration ?? 0.5);
  const entry = {
    ...f,
    index: i,
    start: cursor,
    measured, // what is said
    hold, // what is heard, plus the breath after it
    duration: hold + overlap, // what is seen — longer again, by the transition
    overlap,
    pad,
  };
  cursor += hold; // the next frame starts when the narration ends, not when the clip does
  return entry;
});

const TOTAL = timed[timed.length - 1].start + timed[timed.length - 1].duration;

// ── emit ───────────────────────────────────────────────────────────────────────────────
const sceneEls = timed
  .map((f) => {
    const scene = `      <div
        id="el-${f.id}"
        class="scene"
        data-composition-id="${f.id}"
        data-composition-src="${f.src}"
        data-start="${t(f.start)}"
        data-duration="${t(f.duration)}"
        data-track-index="${f.index}"
      ></div>`;
    // The VO clip is the MEASURED file length — not the frame's `hold` and certainly not its
    // `duration`. The pad and the transition overlap are picture, not speech; stretching the
    // audio clip over them is how a narration ends up bleeding into the next frame's first
    // word on a renderer that loops or holds the tail.
    const voice = f.vo
      ? `
      <audio
        id="el-${f.id}-voice"
        src="${f.vo}"
        data-start="${t(f.start)}"
        data-duration="${t(f.measured)}"
        data-track-index="10"
        data-volume="${f.voVolume ?? 1}"
      ></audio>`
      : "";
    return scene + voice;
  })
  .join("\n\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="${GSAP}"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: ${W}px;
        height: ${H}px;
        overflow: hidden;
        background: #000;
      }
      #root {
        position: relative;
        width: ${W}px;
        height: ${H}px;
        overflow: hidden;
        background: ${BG};
      }
      .scene { position: absolute; inset: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${t(TOTAL)}"
      data-width="${W}"
      data-height="${H}"
    >
${sceneEls}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
      (function () {
        var tl = window.__timelines["main"];
        /* transitions:start */
        /* transitions:end */
        /* Full-span anchor: without it the root timeline is only as long as its last tween,
           and the renderer takes THAT as the film's length — truncating the final hold. */
        tl.to({}, { duration: ${t(TOTAL)} }, 0);
      })();
    </script>
  </body>
</html>
`;

const overrun = timed.filter((f) => f.overlap > f.hold);
for (const f of overrun) {
  console.warn(
    `  ! ${f.id}: transition ${t(f.overlap)}s is longer than its ${t(f.hold)}s of narration —` +
      ` the shot is over before it has landed.`,
  );
}

console.log(`assemble: ${timed.length} frames · ${t(TOTAL)}s`);
for (const f of timed) {
  console.log(
    `  ${String(f.index).padStart(2)} ${f.id.padEnd(22)} ` +
      `start ${t(f.start).padStart(6)}  vo ${t(f.measured).padStart(5)}` +
      ` +pad ${t(f.pad).padStart(4)}  hold ${t(f.hold).padStart(5)}  ` +
      `dur ${t(f.duration).padStart(5)}`,
  );
}
if (dry) process.exit(0);
writeFileSync(OUT, html);
console.log(`✓ wrote ${OUT}`);
console.log(`  now: transitions.mjs → wire-audio.mjs → wire-grade.mjs (this file is generated;`);
console.log(`  anything you hand-add to it is gone on the next assemble)`);

#!/usr/bin/env node
// wire-audio.mjs — mount a music bed and a table of SFX cues into an assembled film.
//
// Why this exists: cue times are authored FRAME-RELATIVE ("0.27s into the prompt shot"),
// because that is the only way they survive a re-order or a re-cut upstream. They have to
// be resolved against each frame's real start time, which is only known after the index
// has been assembled and transitions injected. So this runs late, reads the real starts
// out of the assembled index, and writes absolute times.
//
// Idempotent: it strips the block it wrote last time before writing a new one, so it is
// always safe to re-run — which you must, after every re-assemble, because the index is
// generated and your block is not in the generator.
//
// usage:
//   node scripts/wire-audio.mjs [--index index.html] [--cues audio/cues.json] [--dry]

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const INDEX = flag("index", "index.html");
const CUES = flag("cues", "audio/cues.json");
const dry = argv.includes("--dry");

const MARK_OPEN = "<!-- wire-audio:start -->";
const MARK_CLOSE = "<!-- wire-audio:end -->";
const TRACK_MUSIC = 900;
const TRACK_SFX_BASE = 910;

if (!existsSync(CUES)) {
  console.error(`no cue table at ${CUES} — copy assets/cues.example.json and edit it`);
  process.exit(1);
}

/** @type {{bed?:{src:string,volume:number}, sfxDir?:string, cues:Record<string,Array<object>>}} */
const config = JSON.parse(readFileSync(CUES, "utf8"));
const sfxDir = config.sfxDir ?? "audio/sfx";

let html = readFileSync(INDEX, "utf8");

// strip a previous run's block
html = html.replace(new RegExp(`\\n?[ \\t]*${MARK_OPEN}[\\s\\S]*?${MARK_CLOSE}`, "g"), "");

// Frame wrappers: any element carrying data-composition-src for a frame file. Their
// data-start/data-duration are the post-transition truth.
const frames = [];
for (const m of html.matchAll(
  /<div\b[^>]*data-composition-src="[^"]*?\/([^"/]+)\.html"[^>]*>/g,
)) {
  const tag = m[0];
  const id = m[1];
  const start = Number(tag.match(/data-start="([\d.]+)"/)?.[1] ?? NaN);
  const dur = Number(tag.match(/data-duration="([\d.]+)"/)?.[1] ?? NaN);
  if (!Number.isFinite(start) || !Number.isFinite(dur)) {
    throw new Error(`frame ${id}: missing data-start/data-duration on its index wrapper`);
  }
  frames.push({ id, start, dur });
}
if (frames.length === 0) {
  throw new Error(`no frame wrappers found in ${INDEX} — assemble the index first`);
}

const total = Math.max(...frames.map((f) => f.start + f.dur));
const lines = [`    ${MARK_OPEN}`];

if (config.bed?.src) {
  lines.push(`    <!-- music bed -->`);
  lines.push(
    `    <audio id="bed" class="clip" src="${config.bed.src}" data-start="0"` +
      ` data-duration="${total.toFixed(3)}" data-track-index="${TRACK_MUSIC}"` +
      ` data-volume="${config.bed.volume ?? 0.1}"></audio>`,
  );
}

lines.push(`    <!-- SFX: frame-relative cues resolved against real frame starts -->`);

let track = TRACK_SFX_BASE;
let count = 0;
const unknown = [];
const dropped = [];

for (const f of frames) {
  const cues = config.cues[f.id];
  if (!cues) {
    unknown.push(f.id);
    continue;
  }
  for (const cue of cues) {
    const { sfx, at, dur: d, vol = 0.3, word } = cue;
    const start = f.start + at;
    if (start >= total) {
      dropped.push(`${f.id}:${sfx}@${at}`);
      continue;
    }
    const dur = Math.min(d, total - start);
    // the renderer discovers media by id — an <audio> without one renders SILENT
    const id = `sfx-${f.id}-${sfx}-${String(count).padStart(2, "0")}`;
    const note = word ? ` <!-- "${word}" -->` : "";
    lines.push(
      `    <audio id="${id}" class="clip" src="${sfxDir}/${sfx}.mp3"` +
        ` data-start="${start.toFixed(3)}" data-duration="${dur.toFixed(3)}"` +
        ` data-track-index="${track++}" data-volume="${vol}"></audio>${note}`,
    );
    count++;
  }
}
lines.push(`    ${MARK_CLOSE}`);

const anchor = html.lastIndexOf("</body>");
if (anchor === -1) throw new Error(`${INDEX} has no </body>`);
const out = html.slice(0, anchor) + `\n${lines.join("\n")}\n  ` + html.slice(anchor);

console.log(
  `frames: ${frames.length} · total ${total.toFixed(3)}s · sfx cues ${count}` +
    (config.bed ? ` · bed vol ${config.bed.volume ?? 0.1}` : " · no bed"),
);
for (const f of frames) {
  console.log(`  ${f.id.padEnd(24)} start ${f.start.toFixed(3)}  dur ${f.dur.toFixed(3)}`);
}
if (unknown.length) console.log(`  (no cue entry: ${unknown.join(", ")})`);
if (dropped.length) console.log(`  (dropped, past end of film: ${dropped.join(", ")})`);

if (dry) process.exit(0);
writeFileSync(INDEX, out);
console.log(`✓ wired audio into ${INDEX}`);
console.log(`  next: verify a cue landed — ./scripts/verify-cue.sh <master.mp4> <start> <dur>`);

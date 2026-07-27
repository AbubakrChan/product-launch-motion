#!/usr/bin/env node
// word-timings.mjs — turn word-level transcripts into the cue table the frames read.
//
// Law 2: every reveal is cued to the MEASURED start time of the word it illustrates.
// Estimates drift; a transcript of the file you are actually shipping does not.
//
// Accepts Whisper JSON (segments[].words[]), a flat words array, or an OpenAI-style
// verbose_json. Emits one normalised table keyed by frame id.
//
// usage:
//   # one file per frame, named <frame-id>.json
//   node scripts/word-timings.mjs --in transcripts/ --out audio_meta.json
//
//   # a single transcript for one frame
//   node scripts/word-timings.mjs --transcript 01.json --id 01-hook --out audio_meta.json
//
//   # print a paste-ready cue comment for a frame
//   node scripts/word-timings.mjs --out audio_meta.json --cues 01-hook

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const OUT = flag("out", "audio_meta.json");
const inDir = flag("in", null);
const single = flag("transcript", null);
const singleId = flag("id", null);
const cuesFor = flag("cues", null);

// ── print mode: a paste-ready cue comment for a frame ────────────────────────
if (cuesFor) {
  if (!existsSync(OUT)) {
    console.error(`no table at ${OUT} — build it first`);
    process.exit(1);
  }
  const table = JSON.parse(readFileSync(OUT, "utf8"));
  const frame = table[cuesFor];
  if (!frame) {
    console.error(`no frame "${cuesFor}" in ${OUT}. Have: ${Object.keys(table).join(", ")}`);
    process.exit(1);
  }
  const line = frame.words.map((w) => w.w).join(" ");
  console.log(`/* VO: "${line}"`);
  const parts = frame.words.map((w) => `"${w.w}"@${w.start.toFixed(2)}`);
  for (let i = 0; i < parts.length; i += 6) {
    console.log(`   ${parts.slice(i, i + 6).join("  ")}`);
  }
  console.log(`   duration ${frame.duration.toFixed(3)}s                                   */`);
  process.exit(0);
}

/** Pull a flat [{w,start,end}] out of whatever shape the transcriber produced. */
function normalise(raw) {
  let words = [];
  if (Array.isArray(raw.words)) {
    words = raw.words;
  } else if (Array.isArray(raw.segments)) {
    words = raw.segments.flatMap((s) => s.words ?? []);
  } else if (Array.isArray(raw)) {
    words = raw;
  }
  const out = words
    .map((w) => ({
      w: String(w.word ?? w.w ?? w.text ?? "").trim(),
      start: Number(w.start ?? w.startTime ?? w.from),
      end: Number(w.end ?? w.endTime ?? w.to),
    }))
    .filter((w) => w.w && Number.isFinite(w.start));
  if (!out.length) {
    throw new Error("no word-level timestamps found — did you pass --word_timestamps True?");
  }
  return out;
}

const table = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const added = [];

function addFile(file, id) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const words = normalise(raw);
  const duration = Number(raw.duration ?? words[words.length - 1].end ?? 0);
  table[id] = { duration, words };
  added.push({ id, n: words.length, duration });
}

if (single) {
  if (!singleId) {
    console.error("--transcript needs --id <frame-id>");
    process.exit(1);
  }
  addFile(single, singleId);
} else if (inDir) {
  for (const f of readdirSync(inDir).filter((f) => extname(f) === ".json").sort()) {
    addFile(join(inDir, f), basename(f, ".json"));
  }
} else {
  console.error("pass --in <dir> or --transcript <file> --id <frame-id>");
  process.exit(1);
}

writeFileSync(OUT, `${JSON.stringify(table, null, 2)}\n`);

console.log(`✓ ${OUT}`);
for (const a of added) {
  console.log(`  ${a.id.padEnd(24)} ${String(a.n).padStart(4)} words  ${a.duration.toFixed(3)}s`);
}
console.log(`\nSpot-check the FIRST and LAST word of every line against the wav: transcribers`);
console.log(`clip leading consonants, and a wrong first word offsets an entire shot.`);
console.log(`\nPaste a cue comment into a frame with:  node scripts/word-timings.mjs --cues <frame-id>`);

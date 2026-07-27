#!/usr/bin/env node
// level-sfx.mjs — fix the quiet-source problem.
//
// A cue's volume cannot rescue a quiet source file. This is arithmetic, not mixing taste:
// summing a -38 dB signal into a -17 dB narration bed changes the total by hundredths of a
// decibel. In the film this skill came from, raising a typing cue from 0.35 to 0.85 moved
// the delivered mix by 0.1 dB — measured. There was no cue volume that would have worked.
//
// So: level the ASSET. This trims it to the part you need, gains it, limits the peaks so
// transients survive without clipping, and prints before/after so the decision is on the
// record rather than in someone's memory.
//
// usage:
//   node scripts/level-sfx.mjs audio/sfx/keyboard-typing.mp3 \
//     [--out audio/sfx/keyboard-typing-loud.mp3] [--gain 22] [--trim 1.1] [--fade 0.15]
//     [--bed -16.7]
//
//   --bed  the narration level in the window this cue plays under. Given it, the script
//          tells you whether the levelled asset will actually be audible.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const argv = process.argv.slice(2);
const input = argv.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const num = (name, fallback) => {
  const v = flag(name, null);
  return v === null ? fallback : Number(v);
};

if (!input || !existsSync(input)) {
  console.error("usage: node scripts/level-sfx.mjs <input.mp3> [--out …] [--gain 22] [--trim 1.1] [--fade 0.15] [--bed -16.7]");
  process.exit(1);
}

const ext = extname(input);
const defaultOut = join(dirname(input), `${basename(input, ext)}-loud${ext}`);
const output = flag("out", defaultOut);
const gain = num("gain", 22);
const trim = num("trim", 1.1);
const fade = num("fade", 0.15);
const bed = flag("bed", null) === null ? null : num("bed", null);

// ffmpeg writes volumedetect's report to STDERR, not stdout, and still exits 0 — so
// reading only stdout silently yields NaN rather than an error. Read both streams.
function measure(file, extra = []) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", ...extra, "-i", file, "-af", "volumedetect", "-f", "null", "/dev/null"],
    { encoding: "utf8" },
  );
  const text = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const mean = Number(text.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN);
  const max = Number(text.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN);
  if (!Number.isFinite(mean)) {
    throw new Error(`could not measure ${file} — is ffmpeg installed and the file readable?`);
  }
  return { mean, max };
}

const before = measure(input);

const filter =
  `volume=${gain}dB,` +
  `alimiter=level_out=0.9:limit=0.9,` +
  `afade=t=out:st=${Math.max(0, trim - fade).toFixed(3)}:d=${fade}`;

execFileSync(
  "ffmpeg",
  ["-hide_banner", "-y", "-ss", "0", "-t", String(trim), "-i", input,
   "-af", filter, "-c:a", "libmp3lame", "-b:a", "192k", output],
  { stdio: ["ignore", "ignore", "pipe"] },
);

const after = measure(output);

const fmt = (v) => (Number.isFinite(v) ? `${v.toFixed(1)} dB` : "?");
console.log(`in   ${input}`);
console.log(`     mean ${fmt(before.mean)}   peak ${fmt(before.max)}`);
console.log(`out  ${output}`);
console.log(`     mean ${fmt(after.mean)}   peak ${fmt(after.max)}   (+${(after.mean - before.mean).toFixed(1)} dB mean)`);

if (bed !== null) {
  // percussive cues live or die on their transients, so judge with peak, not mean
  const headroomFor = (vol) => after.max + 20 * Math.log10(vol) - bed;
  const suggest = [0.35, 0.45, 0.55, 0.7].map(
    (v) => `${v} → transients ${(after.max + 20 * Math.log10(v)).toFixed(1)} dB (${headroomFor(v) >= -12 ? "audible" : "buried"})`,
  );
  console.log(`\nagainst a ${bed} dB narration bed:`);
  for (const s of suggest) console.log(`  vol ${s}`);
  console.log(`\nA cue is audible when its TRANSIENTS are within ~12 dB of the bed.`);
  console.log(`Mean level tells you a bed is present; peak tells you a keystroke is heard.`);
}

console.log(`\nnext: cue the -loud variant, re-render, then PROVE it landed:`);
console.log(`  ./scripts/verify-cue.sh <master.mp4> <cue start> <cue dur> [previous-master.mp4]`);

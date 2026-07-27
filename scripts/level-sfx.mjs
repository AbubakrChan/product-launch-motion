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
//     [--bed -16.7] [--from 0] [--keep-head]
//
//   --bed        the narration level in the window this cue plays under. Given it, the
//                script reports whether the levelled asset will actually be audible.
//   --from       explicit start offset in the source, in seconds.
//   --keep-head  do NOT auto-trim leading near-silence (see below).
//
// HEAD SILENCE — the trap this script exists to also prevent. Field-recorded SFX usually
// open with room tone before the first hit. Cut from 0 and you have levelled silence: the
// asset is loud, the measurement passes, and the cue still lands late because its first
// transient is 400ms in. That defect shipped in a real film and survived a window-peak
// check, because the window's PEAK was fine — the front of it was empty. So by default
// this finds the first real transient and starts there.

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

/**
 * Find the first real transient: scan the source in 50ms slices and return the start of
 * the first slice whose peak is within `window` dB of the file's overall peak.
 * A cue must START on a hit, not on the room tone that preceded it in the field.
 */
function firstTransient(file, overallPeak, window = 12, step = 0.05, limit = 3) {
  for (let t = 0; t < limit; t += step) {
    const r = spawnSync(
      "ffmpeg",
      ["-hide_banner", "-ss", t.toFixed(3), "-t", String(step), "-i", file,
       "-af", "volumedetect", "-f", "null", "/dev/null"],
      { encoding: "utf8" },
    );
    const text = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    const max = Number(text.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1] ?? NaN);
    if (Number.isFinite(max) && max >= overallPeak - window) return t;
  }
  return 0;
}

const explicitFrom = flag("from", null);
const keepHead = argv.includes("--keep-head");
let from = explicitFrom === null ? 0 : Number(explicitFrom);
if (explicitFrom === null && !keepHead) {
  from = firstTransient(input, before.max);
  if (from > 0) {
    console.log(`head: first transient at ${from.toFixed(2)}s — trimming the room tone`);
    console.log(`      (--keep-head to disable; a silent head makes the cue land late)`);
  }
}

const filter =
  `volume=${gain}dB,` +
  `alimiter=level_out=0.9:limit=0.9,` +
  `afade=t=out:st=${Math.max(0, trim - fade).toFixed(3)}:d=${fade}`;

execFileSync(
  "ffmpeg",
  ["-hide_banner", "-y", "-ss", String(from), "-t", String(trim), "-i", input,
   "-af", filter, "-c:a", "libmp3lame", "-b:a", "192k", output],
  { stdio: ["ignore", "ignore", "pipe"] },
);

const after = measure(output);
// prove the OUTPUT starts on a hit: its first 100ms should be near its own peak
const headPeak = measure(output, ["-ss", "0", "-t", "0.1"]).max;

const fmt = (v) => (Number.isFinite(v) ? `${v.toFixed(1)} dB` : "?");
console.log(`in   ${input}`);
console.log(`     mean ${fmt(before.mean)}   peak ${fmt(before.max)}`);
console.log(`out  ${output}`);
console.log(`     mean ${fmt(after.mean)}   peak ${fmt(after.max)}   (+${(after.mean - before.mean).toFixed(1)} dB mean)`);
console.log(`     first 100ms peak ${fmt(headPeak)}   ${headPeak >= after.max - 12 ? "✓ starts on a hit" : "✗ SILENT HEAD — this cue will land late"}`);

if (bed !== null) {
  // Compare LIKE WITH LIKE. An earlier version of this script compared the asset's PEAK to
  // the bed's MEAN, which passes almost anything: a room recording with a 28 dB crest
  // factor scored "audible" at a volume that measurably moved the delivered mix by 0.1 dB.
  // `--bed` is read as the bed's mean; its peaks run roughly 8-12 dB above that, so peak
  // comparisons use an estimated bed peak.
  const BED_CREST = 10; // dB, typical narration mean→peak
  const bedPeak = bed + BED_CREST;
  console.log(`\nagainst a narration bed of mean ${bed} dB (peak ≈ ${bedPeak.toFixed(1)} dB):`);
  console.log(`  vol    transient    vs bed peak    mean    vs bed mean`);
  for (const v of [0.35, 0.45, 0.55, 0.7]) {
    const g = 20 * Math.log10(v);
    const peakAt = after.max + g;
    const meanAt = after.mean + g;
    console.log(
      `  ${String(v).padEnd(6)} ${peakAt.toFixed(1).padStart(6)} dB   ` +
        `${(peakAt - bedPeak >= 0 ? "+" : "") + (peakAt - bedPeak).toFixed(1).padStart(6)} dB   ` +
        `${meanAt.toFixed(1).padStart(6)} dB   ` +
        `${(meanAt - bed >= 0 ? "+" : "") + (meanAt - bed).toFixed(1).padStart(6)} dB`,
    );
  }
  console.log(`
Rules of thumb, NOT a verdict — this script deliberately does not tell you "audible":
  · a percussive cue reads as an event when its transients sit at or above the bed's peaks
  · if its MEAN is more than ~20 dB under the bed's mean, it will not register at all,
    however healthy the peaks look — that combination is what a quiet room recording is
  · masking is not predictable from levels alone, and any script claiming otherwise is
    guessing. The reference film's cue passed a naive peak check and moved the delivered
    mix by 0.1 dB.

The only proof is the delivered file. After you render:
  ./scripts/verify-cue.sh <master.mp4> <cue start> <cue dur> [previous-master.mp4]
and read the ENVELOPE, not the window.

Measure --bed on the ISOLATED narration stem, not the mastered film: cue volumes are
applied pre-master, so a post-master figure compares the wrong things (in the reference
film the stem was -21.3 dB and the mastered window -16.7 dB — a 4.6 dB error in exactly
the direction that flatters the cue).`);
}

console.log(`\nnext: cue the -loud variant, re-render, then PROVE it landed:`);
console.log(`  ./scripts/verify-cue.sh <master.mp4> <cue start> <cue dur> [previous-master.mp4]`);

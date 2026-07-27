#!/usr/bin/env node
// transitions.mjs — inject the between-frame moves into the assembled index.
//
// A transition is the ONLY animation that belongs in the index. Everything inside a shot
// belongs to that shot's own timeline; only the move that spans two frames needs to see
// both, and only the root timeline can.
//
// Every transition here is a CROSS: the outgoing frame's tween and the incoming frame's
// tween start at the same instant and share a duration. That instant is the outgoing
// frame's `start + hold` — the moment its narration ends, which is also the incoming
// frame's `data-start`. The overlap assemble.mjs baked into the outgoing frame's
// `data-duration` is exactly the room this cross lives in. Nothing here shifts a start
// time; if a transition looks wrong, the fix is in film.json, not in this file.
//
// Types (from film.json, per frame, `"out": { "type": …, "duration": … }`):
//
//   dissolve      opacity cross. The neutral one. Use it when the two shots are unrelated
//                 and you want the cut to disappear.
//   zoom-through  the outgoing shot rushes at camera and blurs out while the incoming one
//                 arrives from behind it. Reads as "into" — a drill-down, a consequence.
//   push          both frames travel one screen-width. Reads as "next" — a sequence, a
//                 pipeline, time passing. Direction: "push" (right-to-left) or "push-right".
//   cut           no tween at all. The hardest and most underused transition in the set.
//
// Idempotent: it replaces the block between the markers assemble.mjs left, so it is safe to
// re-run, and it MUST be re-run after every assemble.
//
// usage:
//   node scripts/transitions.mjs [--manifest film.json] [--index index.html] [--dry]

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const argv = process.argv.slice(2);
// `--help` prints the header comment above. One source of truth for the usage text, and it
// exits 0 — a --help that exits non-zero breaks every Makefile and CI job that wraps it.
if (argv.includes("--help") || argv.includes("-h")) {
  const doc = [];
  for (const line of readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1)) {
    if (!line.startsWith("//")) break;
    doc.push(line.replace(/^\/\/ ?/, ""));
  }
  console.log(doc.join("\n").trim());
  process.exit(0);
}

const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const MANIFEST = flag("manifest", "film.json");
const INDEX = flag("index", "index.html");
const dry = argv.includes("--dry");

const OPEN = "/* transitions:start */";
const CLOSE = "/* transitions:end */";

if (!existsSync(INDEX)) {
  console.error(`no ${INDEX} — run assemble.mjs first (or pass --index <file>)`);
  process.exit(1);
}
if (!existsSync(MANIFEST)) {
  console.error(`no ${MANIFEST} — copy assets/film.example.json and edit it`);
  process.exit(1);
}
const film = JSON.parse(readFileSync(MANIFEST, "utf8"));
let html = readFileSync(INDEX, "utf8");

if (!html.includes(OPEN) || !html.includes(CLOSE)) {
  console.error(
    `${INDEX} has no transitions markers — it was not written by assemble.mjs.\n` +
      `Either re-run assemble.mjs, or add ${OPEN} … ${CLOSE} inside your root timeline's IIFE.`,
  );
  process.exit(1);
}

// Read the real starts back off the assembled DOM rather than recomputing them. Two sources
// of truth for the same number is how a film ends up with cues that drift by a frame.
const wrappers = [];
for (const m of html.matchAll(/<div\b[^>]*data-composition-src="[^"]+"[^>]*>/g)) {
  const tag = m[0];
  const id = tag.match(/data-composition-id="([^"]+)"/)?.[1];
  const start = Number(tag.match(/data-start="([\d.]+)"/)?.[1] ?? NaN);
  const duration = Number(tag.match(/data-duration="([\d.]+)"/)?.[1] ?? NaN);
  if (id && Number.isFinite(start)) wrappers.push({ id, start, duration });
}
if (!wrappers.length) {
  console.error(`no frame wrappers in ${INDEX} — assemble first`);
  process.exit(1);
}

const t = (n) => String(Number(n.toFixed(3)));

/** The tween pair for one crossing. `at` is when both sides begin. */
function cross(type, outSel, inSel, at, dur) {
  const A = t(at);
  const D = t(dur);
  switch (type) {
    case "cut":
      return [];
    case "zoom-through":
      return [
        `tl.to("${outSel}", { scale: 2.5, opacity: 0, filter: "blur(8px)", duration: ${D}, ease: "power3.in" }, ${A});`,
        `tl.fromTo("${inSel}", { scale: 0.5, opacity: 0, filter: "blur(8px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: ${D}, ease: "power3.out" }, ${A});`,
      ];
    case "push":
    case "push-left":
      return [
        `tl.to("${outSel}", { x: -1920, duration: ${D}, ease: "power3.inOut" }, ${A});`,
        `tl.fromTo("${inSel}", { x: 1920, opacity: 1 }, { x: 0, duration: ${D}, ease: "power3.inOut" }, ${A});`,
      ];
    case "push-right":
      return [
        `tl.to("${outSel}", { x: 1920, duration: ${D}, ease: "power3.inOut" }, ${A});`,
        `tl.fromTo("${inSel}", { x: -1920, opacity: 1 }, { x: 0, duration: ${D}, ease: "power3.inOut" }, ${A});`,
      ];
    case "dissolve":
      return [
        `tl.to("${outSel}", { opacity: 0, duration: ${D}, ease: "power2.inOut" }, ${A});`,
        `tl.fromTo("${inSel}", { opacity: 0 }, { opacity: 1, duration: ${D}, ease: "power2.inOut" }, ${A});`,
      ];
    default:
      throw new Error(
        `unknown transition "${type}" — use dissolve, zoom-through, push, push-right or cut`,
      );
  }
}

const lines = [];
const used = [];
for (let i = 0; i < wrappers.length - 1; i++) {
  const from = wrappers[i];
  const to = wrappers[i + 1];
  const spec = film.frames?.find((f) => f.id === from.id)?.out ?? {};
  const type = spec.type ?? "dissolve";
  const dur = spec.duration ?? 0.5;

  // The cross begins where the next frame begins. If assemble.mjs did its job this is also
  // `from.start + from.duration - dur`; if it is not, the manifest and the index disagree
  // and every cue after this point is suspect.
  const at = to.start;
  const implied = from.start + from.duration - dur;
  if (Math.abs(implied - at) > 0.002) {
    console.warn(
      `  ! ${from.id}: manifest says a ${dur}s "${type}", but its wrapper leaves ` +
        `${t(from.start + from.duration - at)}s of overlap. Re-run assemble.mjs.`,
    );
  }

  lines.push(...cross(type, `#el-${from.id}`, `#el-${to.id}`, at, dur));
  used.push(`${from.id} →${type}→ ${to.id} @ ${t(at)}s`);
}

const block = lines.length
  ? `${OPEN}\n        ` + lines.join("\n        ") + `\n        ${CLOSE}`
  : `${OPEN}\n        ${CLOSE}`;

const out = html.replace(
  new RegExp(`${OPEN.replace(/[*/]/g, "\\$&")}[\\s\\S]*?${CLOSE.replace(/[*/]/g, "\\$&")}`),
  () => block,
);

console.log(`transitions: ${used.length} crossings`);
for (const u of used) console.log(`  ${u}`);
const kinds = new Set(used.map((u) => u.split("→")[1]));
if (used.length >= 6 && kinds.size === 1) {
  console.log(
    `  note: every crossing is the same move. A film with one transition reads as a\n` +
      `  slideshow no matter how good the shots are — see references/04-motion-grammar.md.`,
  );
}
if (dry) process.exit(0);
writeFileSync(INDEX, out);
console.log(`✓ injected into ${INDEX}`);
console.log(`  now: wire-audio.mjs → wire-grade.mjs`);

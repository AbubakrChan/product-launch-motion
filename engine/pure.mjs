// pure.mjs: is every frame a pure function of t? Renders random times on a page that has seen many
// frames and on a freshly loaded page, and compares. Run before every final render.
//   node engine/pure.mjs <url> [--n 24] [--cdp url]
// Ignores compositing noise (a few levels on a few pixels); reports real differences with their box.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { openBrowser, parseArgs } from './browser.mjs';
const A = parseArgs(process.argv.slice(2), { n: 24 });
const url = A._[0];
const B = await openBrowser({ cdp: A.cdp });
const fresh = () => url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now() + Math.random();
const seq = await B.newPage(fresh()), clean = await B.newPage(fresh());
const dur = await seq.evaluate(() => window.FILM_DUR);
const raw = buf => new Promise((res, rej) => {
  const p = spawn('ffmpeg', ['-v', 'error', '-i', 'pipe:0', '-vf', 'scale=480:270:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
  const o = []; p.stdout.on('data', d => o.push(d)); p.on('close', c => c ? rej(new Error('ffmpeg')) : res(Buffer.concat(o)));
  p.stdin.end(buf);
});
let bad = 0;
for (let k = 0; k < A.n; k++) {
  const t = +(((k * 0.618034) % 1) * dur).toFixed(3);          // spread over the film, deterministic
  for (let j = 0; j < 6; j++) await seq.evaluate(tt => window.seek(tt), ((k * 7 + j * 3.1) % dur));   // history
  await seq.evaluate(tt => window.seek(tt), t);
  const a = await raw(await seq.screenshot({ type: 'png' }));
  await clean.goto(fresh()); await clean.waitForFunction(() => window.READY === true);
  await clean.evaluate(tt => window.seek(tt), t);
  const b = await raw(await clean.screenshot({ type: 'png' }));
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 24) { n++; const x = i % 480, y = (i / 480) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (n > 6) { bad++; console.log(`IMPURE t=${t}s: ${n} px differ, box ${x0 * 4},${y0 * 4} to ${x1 * 4},${y1 * 4} (1080p coords)`); }
}
console.log(bad ? `${bad}/${A.n} frames depend on history: fix before rendering` : `pure: ${A.n}/${A.n} frames match`);
await B.close(); process.exit(bad ? 1 : 0);

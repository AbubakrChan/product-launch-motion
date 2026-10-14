// snap.mjs: stills at chosen times, for contact sheets and detail checks.
//   node engine/snap.mjs <url> <outDir> 0.5 1.0 1.5 ...      [--cdp url] [--beat 0.5 --beats 0:72 --offset 0.12]
// With --beat, snaps one frame per beat (k*beat + offset) for k in the --beats range.
import fs from 'node:fs';
import { openBrowser, parseArgs } from './browser.mjs';
const A = parseArgs(process.argv.slice(2), { offset: 0.12 });
const [url, out, ...rest] = A._;
let ts = rest.map(Number);
if (A.beat) { const [a, b] = String(A.beats || '0:64').split(':').map(Number); ts = []; for (let k = a; k < b; k++) ts.push(k * A.beat + A.offset); }
fs.mkdirSync(out, { recursive: true });
const B = await openBrowser({ cdp: A.cdp });
const p = await B.newPage(url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now());
for (const t of ts) {
  await p.evaluate(tt => window.seek(tt), t);
  await p.screenshot({ path: `${out}/t${t.toFixed(3).padStart(7, '0')}.png`, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}
await B.close(); process.exit(0);

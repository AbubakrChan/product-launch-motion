// cues.mjs: export the film's sound cues (window.CUES, from cue() calls in build) to JSON for the mix.
//   node engine/cues.mjs <url> build/cues.json [--cdp url]
import fs from 'node:fs';
import { openBrowser, parseArgs } from './browser.mjs';
const A = parseArgs(process.argv.slice(2));
const [url, out = 'build/cues.json'] = A._;
const B = await openBrowser({ cdp: A.cdp });
const p = await B.newPage(url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now());
const ev = await p.evaluate(() => ({ dur: window.FILM_DUR, cues: window.CUES, extra: window.CUE_EXTRA || null }));
fs.mkdirSync(out.replace(/\/[^/]*$/, '') || '.', { recursive: true });
fs.writeFileSync(out, JSON.stringify(ev));
console.log(`${ev.cues.length} cues -> ${out}`);
await B.close(); process.exit(0);

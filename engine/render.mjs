// render.mjs: film page -> motion-blurred H.264, in chunks, re-rendering only what changed.
//
//   node engine/render.mjs http://127.0.0.1:8765/ --out build/film.mp4 --audio build/mix.wav
//   node engine/render.mjs <url> --draft            540p, 30 fps, 1 subframe, JPEG: 8x fewer captures
//   options: --cdp http://127.0.0.1:9222 (attach to a running Chrome) --workers 3 --fps 60 --sub 4
//            --chunk 4 (seconds) --from 0 --to <dur> --force (ignore reusable segments)
//
// Speed: frames live in a *.noindex folder (macOS Spotlight indexing them doubled a render), and chunk N
// encodes while chunk N+1 captures. Reuse: each segment stores fingerprints of 16 sample frames; on the
// next run those frames are re-captured from the current code, and the segment is kept only if they
// match. A two-line fix re-renders the chunks it touched, not the film.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { openBrowser, parseArgs } from './browser.mjs';

const A = parseArgs(process.argv.slice(2), { workers: 3, fps: 60, sub: 4, chunk: 4 });
const url = A._[0];
if (!url) { console.error('usage: node engine/render.mjs <film url> [--out film.mp4] [--audio mix.wav] [--draft] [--cdp url]'); process.exit(2); }
if (A.draft) Object.assign(A, { fps: A.fps === 60 ? 30 : A.fps, sub: 1, format: 'jpeg' });
const FPS = A.fps, SUB = A.sub, FMT = A.format || 'png', EXT = FMT === 'png' ? 'png' : 'jpg';
const out = A.out || (A.draft ? 'build/draft.mp4' : 'build/film.mp4');
const work = out.replace(/\.mp4$/, '') + '.render.noindex';
const segDir = path.join(work, 'seg');
fs.mkdirSync(segDir, { recursive: true });
const key = JSON.stringify({ FPS, SUB, FMT, draft: !!A.draft });

const run = (cmd, args) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }); const bufs = [], err = [];
  p.stdout.on('data', d => bufs.push(d)); p.stderr.on('data', d => err.push(d));
  p.on('close', c => c === 0 ? res(Buffer.concat(bufs)) : rej(new Error(`${cmd} exited ${c}: ${Buffer.concat(err).toString().slice(-600)}`)));
});
// 48x27 grey thumbnail of an image buffer, as a plain array: enough to see any real change
const thumb = async buf => {
  const tmp = path.join(work, `fp-${process.pid}-${Math.random().toString(36).slice(2)}.${EXT}`);
  fs.writeFileSync(tmp, buf);
  const raw = await run('ffmpeg', ['-v', 'error', '-i', tmp, '-vf', 'scale=48:27:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
  fs.unlinkSync(tmp); return [...raw];
};
const same = (a, b) => { if (!a || !b || a.length !== b.length) return false; let s = 0, m = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); s += d; m = Math.max(m, d); } return s / a.length < 0.6 && m < 8; };

const B = await openBrowser({ cdp: A.cdp });
const pages = [];
for (let w = 0; w < A.workers; w++) pages.push(await B.newPage(url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now() + w));
const DUR = await pages[0].evaluate(() => window.FILM_DUR);
const T0 = A.from || 0, T1 = Math.min(A.to || DUR, DUR);
const shot = async (p, t) => { await p.evaluate(tt => window.seek(tt), t); return p.screenshot({ type: FMT, quality: FMT === 'jpeg' ? 92 : undefined, clip: { x: 0, y: 0, width: 1920, height: 1080 } }); };
const subT = i => Math.floor(i / SUB) / FPS + ((i % SUB) - (SUB - 1) / 2) / (FPS * SUB);

const chunks = [];
for (let t = T0; t < T1 - 1e-6; t += A.chunk) {
  const f0 = Math.round(t * FPS), f1 = Math.min(Math.round(Math.min(t + A.chunk, T1) * FPS), Math.round(T1 * FPS)) - 1;
  const samples = Array.from({ length: 16 }, (_, k) => f0 + Math.floor((k + 0.5) * (f1 - f0 + 1) / 16));
  chunks.push({ f0, f1, samples, seg: path.join(segDir, `${String(f0).padStart(6, '0')}-${f1}.mp4`) });
}

const t0 = Date.now(); let encoding = Promise.resolve(), rendered = 0, kept = 0;
for (const c of chunks) {
  const meta = c.seg + '.json';
  if (!A.force && fs.existsSync(c.seg) && fs.existsSync(meta)) {
    const m = JSON.parse(fs.readFileSync(meta));
    if (m.key === key) {
      let ok = true;
      for (const f of c.samples) { const fp = await thumb(await shot(pages[0], subT(f * SUB + (SUB >> 1)))); if (!same(fp, m.fp[f])) { ok = false; break; } }
      if (ok) { kept++; console.log(`keep  ${(c.f0 / FPS).toFixed(2)}s-${((c.f1 + 1) / FPS).toFixed(2)}s (unchanged)`); continue; }
    }
  }
  const dir = path.join(work, `frames-${c.f0}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const first = c.f0 * SUB, last = (c.f1 + 1) * SUB - 1, fp = {};
  const want = new Set(c.samples.map(f => f * SUB + (SUB >> 1)));
  await Promise.all(pages.map(async (p0, w) => {
    let p = p0;
    for (let i = first + w; i <= last; i += pages.length) {
      for (let a = 0; ; a++) {
        try {
          const buf = await shot(p, subT(i));
          fs.writeFileSync(path.join(dir, `s${String(i).padStart(6, '0')}.${EXT}`), buf);
          if (want.has(i)) fp[Math.floor(i / SUB)] = await thumb(buf);
          break;
        } catch (e) {
          if (a >= 5) throw e;
          console.log(`retry ${i}: ${e.message.split('\n')[0]}`);
          p = pages[w] = await B.newPage(url + (url.includes('?') ? '&' : '?') + 'r=' + Date.now() + w);
        }
      }
    }
  }));
  rendered++;
  const capSec = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`frames ${(c.f0 / FPS).toFixed(2)}s-${((c.f1 + 1) / FPS).toFixed(2)}s captured (${capSec}s elapsed)`);
  await encoding;                                  // at most one encode runs while the next chunk captures
  const vf = (SUB > 1 ? `tmix=frames=${SUB}:weights='${Array(SUB).fill(1).join(' ')}',select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB),` : '') +
    (A.draft ? 'scale=960:540:flags=area:' : 'scale=') + 'out_color_matrix=bt709:out_range=tv,format=yuv420p';
  const enc = A.draft ? ['-preset', 'veryfast', '-crf', '20'] : ['-preset', 'slow', '-crf', '15', '-tune', 'film'];
  encoding = run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS * SUB), '-start_number', String(first), '-i', path.join(dir, `s%06d.${EXT}`),
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', ...enc, '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', c.seg + '.tmp.mp4'])
    .then(() => { fs.renameSync(c.seg + '.tmp.mp4', c.seg); fs.writeFileSync(meta, JSON.stringify({ key, fp })); fs.rmSync(dir, { recursive: true, force: true }); });
}
await encoding;
await B.close();

const list = path.join(work, 'list.txt');
fs.writeFileSync(list, chunks.map(c => `file '${path.resolve(c.seg)}'`).join('\n'));
const mux = A.audio ? ['-i', A.audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : [];
await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, ...mux, '-c:v', 'copy', '-movflags', '+faststart', out]);
console.log(`${out}: ${chunks.length} chunks, ${rendered} rendered, ${kept} kept, ${((Date.now() - t0) / 60000).toFixed(1)} min`);
process.exit(0);

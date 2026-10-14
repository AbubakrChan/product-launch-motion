// core.js: the time engine every film shares. Load it before your film script.
// Every style is a pure function of t: no CSS transitions, no timers, no state between frames.
// Your film defines FILM = { dur, build(), seek(t) } and calls boot(FILM).
'use strict';

// ---------- springs ----------
// Presets. Pick a personality per film instead of using one spring for everything.
const SP = {
  morph: { w: 18, z: 0.88 }, snap: { w: 32, z: 0.86 }, soft: { w: 11, z: 0.92 }, text: { w: 26, z: 1 },
  cam: { w: 6.5, z: 1 }, whip: { w: 8, z: 1 }, pop: { w: 26, z: 0.74 }, hit: { w: 34, z: 0.8 },
  heavy: { w: 7, z: 0.95 }, floaty: { w: 5, z: 0.7 },
};
function stepR(tau, sp) {            // closed-form damped step response, 0 -> 1
  if (tau <= 0) return 0;
  const w = sp.w, z = sp.z;
  if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
class Track {                         // a value with many target changes = sum of one spring per change
  constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
  to(t, v, sp = SP.morph) { if (v !== this.cur) { this.ev.push([t, v - this.cur, sp]); this.cur = v; } return this; }
  at(t) { let v = this.v0; for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp); return v; }
}
// a target that must ARRIVE (≈95%) at time T is issued lead(sp) seconds early
const lead = sp => 4.7 / (sp.w * Math.min(1, sp.z));

// ---------- maths ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const ease = x => (x = clamp(x), x * x * (3 - 2 * x));
const outQ = x => (x = clamp(x), 1 - Math.pow(1 - x, 4));
const outC = x => (x = clamp(x), 1 - Math.pow(1 - x, 3));
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };  // deterministic noise
const kick = (t, t0, k = 12) => t >= t0 ? Math.exp(-(t - t0) * k) : 0;
const press = (t, tc) => 1 - 0.1 * (stepR(t - (tc - 0.06), SP.snap) - stepR(t - (tc + 0.03), SP.pop));
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixC = (a, b, p) => { const x = rgbOf(a), y = rgbOf(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp(p))).join(',')})`; };

// ---------- enter / exit ----------
// Enter on a spring; exit short and early so swaps inside a morphing container never overlap.
function vis(t, tin, tout, dOut = 0.12) {
  const e = stepR(t - tin, SP.text), x = tout == null ? 0 : clamp((t - tout) / dOut), xo = x * x;
  return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 10, dy: (1 - e) * 16 - xo * 10, e };
}
function visW(t, wins, dOut = 0.12) {  // several on-windows for one element: take the strongest
  let best = { o: 0, b: 10, dy: 0, e: 0 };
  for (const [a, z] of wins) { const v = vis(t, a, z, dOut); if (v.o > best.o) best = v; }
  return best;
}
const ON = { o: 1, b: 0, dy: 0, e: 1 };

// ---------- DOM ----------
const $ = id => document.getElementById(id);
function mk(tag, cls, html, parent, cssText) {
  const e = document.createElement(tag); e.className = cls || ''; if (html != null) e.innerHTML = html;
  if (cssText) e.style.cssText += cssText; (parent || $('world')).appendChild(e); return e;
}
// 'inherit', never 'visible': a visible child of a hidden parent keeps rendering (ghosts, frames later)
function applyVis(e, v) {
  e.style.opacity = v.o.toFixed(4);
  e.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
  e.style.visibility = v.o < 0.002 ? 'hidden' : 'inherit';
}
function place(e, x, y, ax, v, extra = '', ay = 0.5) {
  e.style.transform = `translate(${x.toFixed(2)}px,${(y + (v ? v.dy : 0)).toFixed(2)}px) translate(${-ax * 100}%,${-ay * 100}%) ${extra}`;
  if (v) applyVis(e, v);
}
function boxAt(e, x, y, w, h, s, r, v) {  // centre x,y; width/height/radius spring in the caller
  e.style.width = w.toFixed(2) + 'px'; e.style.height = h.toFixed(2) + 'px';
  e.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2 + (v ? v.dy : 0)).toFixed(2)}px) rotate(${r}deg) scale(${s})`;
  if (v) applyVis(e, v);
}
function hide(e) { if (e && e.style.visibility !== 'hidden') { e.style.visibility = 'hidden'; e.style.opacity = '0'; } }
// Measure at BUILD time only. Measuring inside seek() makes a frame depend on which frame came first.
function measure(text, size, weight, ls = 0, extra = '') {
  const s = mk('span', 'a', text, $('stage'), `font-size:${size}px;font-weight:${weight};letter-spacing:${ls}em;visibility:hidden;${extra}`);
  const w = s.getBoundingClientRect().width; s.remove(); return w;
}

// ---------- camera ----------
// x, y and LOG zoom on springs (zooming linearly in z feels wrong). #world is scaled; #hud is screen space.
class Camera {
  constructor(x = 0, y = 0, z = 1, W = 1920, H = 1080) { this.X = new Track(x); this.Y = new Track(y); this.L = new Track(Math.log(z)); this.W = W; this.H = H; }
  to(t, x, y, z, sp = SP.cam) { this.X.to(t, x, sp); this.Y.to(t, y, sp); this.L.to(t, Math.log(z), sp); return this; }
  at(t) { return { cx: this.X.at(t), cy: this.Y.at(t), z: Math.exp(this.L.at(t)) }; }
  apply(t, el = $('world')) {   // never put will-change on el: scaled text renders blurry
    const c = this.at(t);
    el.style.transform = `translate(${this.W / 2}px,${this.H / 2}px) scale(${c.z.toFixed(5)}) translate(${(-c.cx).toFixed(3)}px,${(-c.cy).toFixed(3)}px)`;
    return { ...c, toS: (x, y) => [this.W / 2 + (x - c.cx) * c.z, this.H / 2 + (y - c.cy) * c.z] };
  }
}

// ---------- odometer ----------
// Per-digit strips sized to each final glyph, clipped vertically only. A digit moves only while the one below carries.
function makeOdo(parent, str, size, color, weight = 900) {
  const o = { el: mk('div', 'a', null, parent, 'height:0;width:0'), slots: [], size, H: Math.round(size * 1.08) };
  let p = str.replace(/,/g, '').length - 1, x = 0;
  for (const ch of str) {
    const isD = ch !== ',', w = measure(ch, size, weight, -0.02);
    const box = mk('div', 'a', null, o.el, `width:${w + 2}px;height:${o.H}px;clip-path:inset(0 -80px)`);
    const st = mk('div', 'a', isD ? '0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0' : ',', box,
      `font-size:${size}px;font-weight:${weight};font-variant-numeric:tabular-nums;letter-spacing:-0.02em;line-height:${o.H}px;white-space:normal;width:${w + 2}px;text-align:center;color:${color}`);
    o.slots.push({ isD, p: isD ? p : p + 1, w, box, st, x }); x += w; if (isD) p--;
  }
  o.W = x; return o;
}
function drawOdo(o, v, x, y, ax, vv = ON, grow = true) {
  const lv = Math.log10(Math.max(v, 1));
  const on = o.slots.map(s => (!grow || s.p === 0 ? 1 : clamp((lv - s.p) * 3 + 1)));
  const tot = o.slots.reduce((a, s, i) => a + s.w * on[i], 0);
  let cx = x - ax * tot;
  o.slots.forEach((s, i) => {
    let d;
    if (!s.isD) d = 0;
    else if (s.p === 0) d = v % 10;
    else { const P = Math.pow(10, s.p), r = v % P; d = Math.floor(v / P) % 10 + Math.max(0, r - (P - 1)); }
    s.st.style.transform = `translateY(${(-d * o.H).toFixed(2)}px)`;
    s.box.style.transform = `translate(${cx.toFixed(2)}px,${(-o.H / 2).toFixed(1)}px) scale(${(0.6 + 0.4 * on[i]).toFixed(3)})`;
    s.box.style.opacity = on[i].toFixed(3);
    cx += s.w * on[i];
  });
  o.el.style.transform = `translate(0px,${(y + vv.dy).toFixed(2)}px)`;
  applyVis(o.el, vv);
  return tot;
}
const roll = (t, t0, d, target) => Math.round(target * outQ((t - t0) / d) * 1e6) / 1e6;

// ---------- sound cues ----------
// The film is the one source of truth for sound timing: cue() during build, `node engine/cues.mjs` exports them.
const CUES = [];
const cue = (t, kind, v = null) => { CUES.push([+t.toFixed(4), kind, v]); };

// ---------- boot ----------
// FILM = { dur, fonts: ["800 40px 'Inter'"], build(), seek(t) }. Sets window.READY when the first frame can render.
async function boot(FILM) {
  for (const f of FILM.fonts || []) await document.fonts.load(f);
  await document.fonts.ready;
  if (FILM.load) await FILM.load();
  FILM.build();
  await Promise.all([...document.images].map(im => im.decode().catch(() => {})));
  window.FILM_DUR = FILM.dur;
  window.CUES = CUES;
  window.seek = t => FILM.seek(clamp(t, 0, FILM.dur));
  const q = new URLSearchParams(location.search);
  window.seek(q.has('t') ? +q.get('t') : 0);
  window.READY = true;
}

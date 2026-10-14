// A 4-second example of the engine: one shape that grows, a word swap, a number roll, a camera move,
// sound cues. It shows the API, not a look: build your own direction.
'use strict';
const BEAT = 0.5, b = k => k * BEAT;
const E = {}, cam = new Camera(0, 0, 1.4);
const W = new Track(0), Hh = new Track(0), R = new Track(80), HUE = new Track(0);

const FILM = {
  dur: 4,
  fonts: ["400 120px Georgia"],
  build() {
    E.box = mk('div', 'a', null, null, 'background:#E8553A;transform-origin:50% 50%');
    E.w1 = mk('div', 'a', 'one', null, 'font-size:120px;font-style:italic');
    E.w2 = mk('div', 'a', 'many', null, 'font-size:120px;font-style:italic');
    E.odo = makeOdo($('world'), '1,000', 150, '#F2EFE8', 400);
    W.to(0, 160, SP.floaty).to(b(1), 420, SP.morph).to(b(4), 900, SP.heavy); Hh.to(0, 160, SP.floaty).to(b(1), 260, SP.morph).to(b(4), 420, SP.heavy);
    R.to(b(1), 36).to(b(4), 8); HUE.to(b(4), 1, SP.soft);
    cam.to(b(1) - lead(SP.cam), 0, 0, 1.0).to(b(1.5), 0, 0, 0.8, { w: 1.1, z: 1 }).to(b(3), 0, 0, 1.3, { w: 2, z: 1 }).to(b(6), 0, 40, 0.7, SP.whip);   // a slow push under everything: never dead
    cue(b(1), 'grow'); cue(b(2), 'swap'); cue(b(4), 'hit'); cue(b(5), 'roll');
  },
  seek(t) {
    cam.apply(t);
    const drift = 10 * Math.sin(t * 1.3), tilt = 1.2 * Math.sin(t * 0.9);   // nothing is ever fully still
    const col = mixC('#E8553A', '#3A6BE8', HUE.at(t));
    E.box.style.background = col; E.box.style.borderRadius = R.at(t).toFixed(2) + 'px';
    boxAt(E.box, 0, drift, W.at(t) + 24 * Math.sin(t * 2.1), Hh.at(t), 1, tilt, vis(t, 0, null));
    place(E.w1, 0, drift, 0.5, vis(t, b(1.2), b(2) - 0.1), `rotate(${tilt}deg)`);
    place(E.w2, 0, drift, 0.5, vis(t, b(2), b(4) - 0.1), `rotate(${tilt}deg)`);
    if (t >= b(4)) drawOdo(E.odo, roll(t, b(5), 1.5, 1000), 0, 0, 0.5, vis(t, b(4.2), null)); else hide(E.odo.el);
  },
};
window.addEventListener('load', () => boot(FILM));

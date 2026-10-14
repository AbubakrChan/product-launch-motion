// browser.mjs: one way to get render pages, two backends.
//   launch (default): a headless Chromium owned by this process.
//   --cdp http://127.0.0.1:9222: attach to a Chrome you already run; each page opens in its own
//   background window, and only pages this process opened are ever closed.
// Every page has the HTTP cache disabled, so a render can never use an old copy of film.js.
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  try { return await import(pathToFileURL(join(execSync('npm root -g').toString().trim(), 'playwright', 'index.mjs')).href); } catch {}
  throw new Error('playwright not found: npm i playwright (or npm i -g playwright)');
}

export function parseArgs(argv, defaults = {}) {
  const o = { ...defaults, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { o._.push(a); continue; }
    const k = a.slice(2), n = argv[i + 1];
    if (n === undefined || n.startsWith('--')) o[k] = true; else { o[k] = isNaN(+n) ? n : +n; i++; }
  }
  return o;
}

export async function openBrowser({ cdp, width = 1920, height = 1080 }) {
  const { chromium } = await loadPlaywright();
  const mine = [];
  let browser, ctx, bcdp;
  if (cdp) {
    browser = await chromium.connectOverCDP(cdp);
    ctx = browser.contexts()[0];
    bcdp = await browser.newBrowserCDPSession();
  } else {
    browser = await chromium.launch({ args: ['--hide-scrollbars', '--force-color-profile=srgb'] });
    ctx = await browser.newContext({ viewport: { width, height } });
  }
  async function newPage(url) {
    let p;
    if (cdp) {
      const ev = ctx.waitForEvent('page');
      await bcdp.send('Target.createTarget', { url: 'about:blank', newWindow: true, background: true });
      p = await ev;
      await p.waitForLoadState('load').catch(() => {});
    } else p = await ctx.newPage();
    mine.push(p);
    const s = await ctx.newCDPSession(p);
    await s.send('Network.enable');
    await s.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (cdp) await p.setViewportSize({ width, height });
    p.on('pageerror', e => console.log('[pageerror]', e.message));
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    return p;
  }
  async function close() {
    for (const p of mine) await p.close().catch(() => {});
    if (!cdp) await browser.close().catch(() => {});
  }
  return { newPage, close };
}

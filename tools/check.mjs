#!/usr/bin/env node
// Mechanical checks for this static site. There is no test framework here and
// no reason for one; these are the things that actually break a hand-written
// page, and every one of them has bitten this repo or its predecessor.
//
//   node tools/check.mjs                  run everything
//   node tools/check.mjs --only=contrast  run one
//   node tools/check.mjs --skip-external  no network
//
// Exit 0 when every check that ran passed, 1 otherwise.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, PlaywrightUnavailable } from './lib/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = () => readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ───────────────────────── static server ───────────────────────── */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    // keep the server inside the repo
    if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () =>
    ok({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() })));
}

/* ───────────────────────── shared browser helpers ───────────────────────── */

/** Keys referenced from the markup, or by name from the scripts. */
function usedKeys(dictKeys = []) {
  const fromMarkup = [...html().matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)].map(m => m[1]);
  // A few keys are applied in code rather than bound to an element — the
  // document title, for one. Count a key as used if a script names it.
  const scripts = ['js/app.js', 'js/motion.js']
    .filter(f => existsSync(path.join(ROOT, f)))
    .map(f => readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  const fromCode = dictKeys.filter(k => scripts.includes(`'${k}'`) || scripts.includes(`"${k}"`));
  return [...new Set([...fromMarkup, ...fromCode])];
}

/** Both editions, by evaluating js/i18n.js in a bare sandbox. */
function dictionaries() {
  const win = {};
  new Function('window', readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8')).call(win, win);
  return win.I18N;
}

/** Toggle language/theme by clicking the real controls, so we test what ships. */
const setLang = async (page, lang) => page.evaluate(async (want) => {
  const btn = document.getElementById('lang');
  for (let i = 0; i < 3 && document.documentElement.lang !== want && btn; i++) {
    btn.click(); await new Promise(r => setTimeout(r, 60));
  }
  return document.documentElement.lang;
}, lang);

const themes = async (page) => page.evaluate(() => {
  const btn = document.getElementById('theme');
  const first = document.documentElement.dataset.theme;
  if (!btn) return [first];
  btn.click();
  const second = document.documentElement.dataset.theme;
  btn.click();
  return [first, second];
});

const setTheme = async (page, theme) => page.evaluate(async (want) => {
  const btn = document.getElementById('theme');
  for (let i = 0; i < 3 && document.documentElement.dataset.theme !== want && btn; i++) {
    btn.click(); await new Promise(r => setTimeout(r, 60));
  }
}, theme);

/** The contrast walk.
 *
 *  Three things the first version got wrong, all of which let a real failure
 *  through: it took the first ancestor background at face value instead of
 *  compositing alpha, it ignored background-image entirely, and it resolved a
 *  position:fixed overlay against its DOM ancestors rather than against what
 *  is painted behind it on screen. The HUD is fixed over the sky. */
const CONTRAST_PROBE = `() => {
  const lum = (c) => { const [r,g,b] = c.map(v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
  const nums = (s) => (s.match(/[\\d.]+/g) || []).map(Number);
  const isUnit = (s) => /^color\\(/.test(s);   // color(srgb r g b / a): channels are 0-1
  const rgb = (s) => { const n = nums(s).slice(0,3); return isUnit(s) ? n.map(v => Math.round(v * 255)) : n; };
  const alpha = (s) => { const n = nums(s); return n.length > 3 ? n[3] : 1; };
  const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
  const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b), hi = Math.max(l1,l2), lo = Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };

  // Composite every translucent layer on the way up instead of taking the
  // first one whole. Report when the stack is not answerable.
  const resolveBg = (el) => {
    // Inside a fixed overlay the walk must STOP at the overlay. Escaping to
    // body would measure against a colour that is not painted behind it once
    // the page scrolls, which is how a transparent HUD over bright sky read
    // as passing.
    let fixedRoot = null;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (getComputedStyle(e).position === 'fixed') { fixedRoot = e; break; }
    }

    const stack = [];
    let e = el, imageOnly = false, opaqueFound = false;
    while (e && e.nodeType === 1) {
      const cs = getComputedStyle(e);
      const a = alpha(cs.backgroundColor);
      if (cs.backgroundImage !== 'none' && a < 0.99) imageOnly = true;
      if (a > 0.004) { stack.push([rgb(cs.backgroundColor), a]); if (a >= 0.99) { opaqueFound = true; break; } }
      if (e === fixedRoot) break;          // do not escape the overlay
      e = e.parentElement;
    }
    let base = [255,255,255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i][0], stack[i][1], base);
    return { bg: base, crossedFixed: !!fixedRoot, imageOnly, opaqueFound };
  };

  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
    const r0 = el.getBoundingClientRect();
    if (r0.width <= 2 || r0.height <= 2) continue; // sr-only / clipped: nothing is rendered
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const fg = rgb(cs.color); if (fg.length < 3) continue;

    const res = resolveBg(el);
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = (px >= 24 || (bold && px >= 18.66)) ? 3 : 4.5;
    const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.') : '');
    const txt = el.textContent.trim().slice(0, 40);

    // A fixed overlay whose own stack never reaches an opaque colour is
    // floating over unknown content. Unmeasurable is a failure, not a pass.
    if (res.crossedFixed && !res.opaqueFound) {
      out.push({ sel, fg: cs.color, bg: 'none (fixed overlay, transparent)', px: Math.round(px), ratio: 0, need, txt });
      continue;
    }
    if (res.imageOnly && !res.opaqueFound) {
      out.push({ sel, fg: cs.color, bg: 'background-image over transparent', px: Math.round(px), ratio: 0, need, txt });
      continue;
    }

    const r = ratio(fg, res.bg);
    if (r < need) out.push({ sel, fg: cs.color, bg: 'rgb(' + res.bg + ')', px: Math.round(px), ratio: +r.toFixed(2), need, txt });
  }
  return out;
}`;

/* ───────────────────────── checks ───────────────────────── */

const checks = {};

// The English text lives in index.html (so the page reads without scripts) and
// in js/i18n.js (so the editions can switch). One of them is generated from the
// other; this is the guard that they have not drifted apart.
checks.defaults = async () => {
  const { execFileSync } = await import('node:child_process');
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'tools/sync-defaults.mjs'), '--check'], { encoding: 'utf8', cwd: ROOT });
    return { pass: true, detail: 'index.html defaults match js/i18n.js' };
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`.trim().split('\n').slice(0, 6).join(' | ');
    return { pass: false, detail: out || 'sync-defaults --check failed' };
  }
};

checks.i18n = async () => {
  const I = dictionaries();
  if (!I || !I.en || !I.id) return { pass: false, detail: 'window.I18N.en / .id not found' };
  const en = Object.keys(I.en), id = Object.keys(I.id), used = usedKeys(Object.keys(I.en));
  const problems = [];

  const onlyEn = en.filter(k => !(k in I.id));
  const onlyId = id.filter(k => !(k in I.en));
  if (onlyEn.length) problems.push(`missing from id: ${onlyEn.join(', ')}`);
  if (onlyId.length) problems.push(`missing from en: ${onlyId.join(', ')}`);

  for (const lang of ['en', 'id']) {
    const miss = used.filter(k => !(k in I[lang]));
    if (miss.length) problems.push(`markup keys absent from ${lang}: ${miss.join(', ')}`);
    const empty = Object.entries(I[lang]).filter(([, v]) => typeof v !== 'string' || !v.trim());
    if (empty.length) problems.push(`empty values in ${lang}: ${empty.map(e => e[0]).join(', ')}`);
  }

  const unused = en.filter(k => !used.includes(k));
  if (unused.length) problems.push(`dict keys never used in markup: ${unused.join(', ')}`);

  // applyLang assigns textContent, so an entity in a value renders as itself:
  // "&amp;" shows up on the page as "&amp;", not "&".
  for (const lang of ['en', 'id']) {
    const ent = Object.entries(I[lang]).filter(([, v]) => /&(?:amp|lt|gt|quot|nbsp|mdash|ndash|middot|#\d+);/i.test(String(v)));
    if (ent.length) problems.push(`HTML entities in ${lang} values (they render literally): ${ent.map(e => e[0]).join(', ')}`);
  }

  // duplicate literal keys: JS keeps the last silently
  const src = readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8');
  for (const lang of ['en', 'id']) {
    const start = src.indexOf(`${lang}: {`);
    if (start < 0) continue;
    const end = lang === 'en' ? (src.indexOf('id: {') > start ? src.indexOf('id: {') : src.length) : src.length;
    const ks = [...src.slice(start, end).matchAll(/"([\w.]+)"\s*:/g)].map(m => m[1]);
    const dup = [...new Set(ks.filter((k, i) => ks.indexOf(k) !== i))];
    if (dup.length) problems.push(`duplicate literal keys in ${lang}: ${dup.join(', ')}`);
  }

  return { pass: !problems.length, detail: problems.join(' | ') || `${en.length} keys x2, ${used.length} used` };
};

checks.assets = async () => {
  const refs = [...html().matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
    .concat([...html().matchAll(/srcset="([^"]+)"/g)].flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+/)[0])))
    .filter(u => u && !/^(https?:|mailto:|#|data:)/.test(u));
  const missing = [...new Set(refs)].filter(u => !existsSync(path.join(ROOT, u.split('?')[0])));
  return { pass: !missing.length, detail: missing.length ? `missing: ${missing.join(', ')}` : `${new Set(refs).size} local refs all resolve` };
};

checks.external = async () => {
  const allowPath = path.join(ROOT, 'tools/archived-links.json');
  const allow = existsSync(allowPath) ? JSON.parse(readFileSync(allowPath, 'utf8')) : [];
  const urls = [...new Set([...html().matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => m[1]))]
    .filter(u => !/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(u))
    .filter(u => !allow.includes(u));
  const bad = [];
  await Promise.all(urls.map(async (u) => {
    try {
      const r = await fetch(u, {
        redirect: 'follow', signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36' },
      });
      // 401/403/429/999 mean a live server refusing a robot, not a dead link —
      // a visitor with a real browser gets the page. Only absence is a failure.
      const guarded = [401, 403, 429, 999];
      if (r.status >= 400 && !guarded.includes(r.status)) bad.push(`${u} -> ${r.status}`);
    } catch (e) { bad.push(`${u} -> ${e.cause?.code || e.name}`); }
  }));
  return { pass: !bad.length, detail: bad.length ? bad.join(' | ') : `${urls.length} external links ok (${allow.length} allowlisted)` };
};

checks.overflow = async (ctx) => {
  const page = await ctx.browser.newPage();
  const bad = [];
  await page.goto(ctx.url, { waitUntil: 'load' });
  const themeNames = await themes(page);
  for (const lang of ['en', 'id']) {
    for (const theme of themeNames) {
      for (const w of [280, 320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(ctx.url, { waitUntil: 'load' });
        await setLang(page, lang);
        await setTheme(page, theme);
        // scrollWidth is useless here: html, body and every .world set
        // overflow:hidden, so overflowing content is CLIPPED rather than
        // reported — the page looks fine and the content is unreachable.
        // Measure each element's own right edge instead.
        const over = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const out = [];
          for (const el of document.querySelectorAll('body *')) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            if (cs.position === 'fixed') continue;                 // viewport-anchored by design
            if (el.closest('[aria-hidden="true"]')) continue;      // decoration may bleed
            if (el.classList.contains('sr')) continue;             // parked offscreen on purpose
            if (el.classList.contains('skip')) continue;           // skip link parks at -9999px until focused
            // Content inside a horizontally scrollable frame is reachable by
            // scrolling that frame; that is not the page spilling.
            let scrollable = false;
            for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
              const ox = getComputedStyle(a).overflowX;
              if (ox === 'auto' || ox === 'scroll') { scrollable = true; break; }
            }
            if (scrollable) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const spill = Math.round(Math.max(r.right - vw, -r.left));
            if (spill > 1) out.push(`${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '')} +${spill}px`);
          }
          return [...new Set(out)];
        });
        for (const o of over) bad.push(`${lang}/${theme}/${w}px ${o}`);
      }
    }
  }
  await page.close();
  const uniq = [...new Set(bad)];
  return { pass: !uniq.length, detail: uniq.length ? uniq.slice(0, 6).join(' | ') + (uniq.length > 6 ? ` | +${uniq.length - 6}` : '') : `nothing spills at 6 widths x ${themeNames.length} themes x 2 editions` };
};

checks.contrast = async (ctx) => {
  const page = await ctx.browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  const bad = [];
  await page.goto(ctx.url, { waitUntil: 'load' });
  const themeNames = await themes(page);
  for (const lang of ['en', 'id']) {
    for (const theme of themeNames) {
      await page.goto(ctx.url, { waitUntil: 'load' });
      await setLang(page, lang);
      await setTheme(page, theme);
      // evaluate() treats a string as an expression, so call it explicitly
      const fails = await page.evaluate(`(${CONTRAST_PROBE})()`);
      for (const f of fails) bad.push(`${lang}/${theme} ${f.sel} ${f.ratio}:1 (needs ${f.need}) "${f.txt}"`);
    }
  }
  await page.close();
  const uniq = [...new Set(bad)];
  return { pass: !uniq.length, detail: uniq.length ? uniq.slice(0, 6).join(' | ') + (uniq.length > 6 ? ` | +${uniq.length - 6} more` : '') : `AA met in ${themeNames.length} themes x 2 editions` };
};

// The question is not "is anything hidden" — a tooltip that opens on hover and
// an sr-only label are both hidden at rest, with or without scripts. The
// question is whether anything is hidden ONLY because the scripts did not run.
// So: take the hidden set twice, with JS and without, and diff them.
const HIDDEN_PROBE = `() => [...new Set([...document.querySelectorAll('body *')]
  .filter(el => {
    const cs = getComputedStyle(el);
    return (+cs.opacity < 0.05 || cs.visibility === 'hidden' || cs.display === 'none') && el.textContent.trim();
  })
  .map(el => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\\s+/).join('.') : '')))]`;

checks.nojs = async (ctx) => {
  const withJs = await ctx.browser.newPage();
  await withJs.setViewportSize({ width: 1280, height: 900 });
  await withJs.goto(ctx.url, { waitUntil: 'load' });
  const hiddenWithJs = new Set(await withJs.evaluate(`(${HIDDEN_PROBE})()`));
  await withJs.close();

  const context = await ctx.browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  const hiddenNoJs = await page.evaluate(`(${HIDDEN_PROBE})()`);
  const r = await page.evaluate(() => ({
    facts: [...document.querySelectorAll('[data-fact]')].map(e => e.dataset.fact),
    textLen: document.body.innerText.trim().length,
  }));
  await context.close();

  // hidden without scripts but visible with them = content the page withheld
  const regressed = hiddenNoJs.filter(sel => !hiddenWithJs.has(sel));
  const problems = [];
  if (regressed.length) problems.push(`visible only with JS: ${regressed.slice(0, 8).join(', ')}`);

  // Being visible is not the same as saying anything. An element bound to
  // i18n must carry its real default text in the markup, not a dash waiting
  // for a script — otherwise the content still only exists once JS runs.
  const stubs = [...html().matchAll(/<([a-z0-9]+)\b[^>]*\bdata-i18n(?:-html)?="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => ({ key: m[2], text: m[3].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, 'x').trim() }))
    .filter(e => e.text.length < 3);
  if (stubs.length) {
    problems.push(`placeholder instead of real text in the markup: ${[...new Set(stubs.map(s => s.key))].slice(0, 8).join(', ')}`);
  }
  // A floor that catches a genuinely empty page. "All the content is here" is
  // asserted properly by the recruiter-facts check below, not by a word count.
  if (r.textLen < 100) problems.push(`only ${r.textLen} chars of text without JS`);
  // Once the character sheet exists, all six recruiter facts must be in the DOM.
  if (r.facts.length) {
    const need = ['name', 'role', 'now', 'prev1', 'prev2', 'edu'];
    const miss = need.filter(f => !r.facts.includes(f));
    if (miss.length) problems.push(`recruiter facts missing: ${miss.join(', ')}`);
  }
  return { pass: !problems.length, detail: problems.join(' | ') || `${r.textLen} chars readable, ${r.facts.length} facts tagged` };
};

checks.reducedmotion = async (ctx) => {
  const context = await ctx.browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    animated: [...new Set([...document.querySelectorAll('body *')]
      .filter(el => getComputedStyle(el).animationName !== 'none')
      .map(el => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '') + ':' + getComputedStyle(el).animationName))],
    // ScrollTrigger registers an internal zero-duration bookkeeping tween on
    // load whose target is a function. Only tweens touching the DOM count.
    gsapTweens: (typeof window.gsap !== 'undefined')
      ? window.gsap.globalTimeline.getChildren()
          .filter(t => typeof t.targets === 'function' && t.targets().some(x => x instanceof Element)).length
      : 0,
  }));
  await context.close();
  const problems = [];
  if (r.animated.length) problems.push(`still animating: ${r.animated.slice(0, 8).join(', ')}`);
  if (r.gsapTweens) problems.push(`${r.gsapTweens} gsap tweens running`);
  return { pass: !problems.length, detail: problems.join(' | ') || 'no animation under reduce' };
};

// Every other check looks at the page with the animation turned OFF: nojs,
// nogsap and reducedmotion all answer "is it readable when nothing runs".
// None of them answer the question that actually bit: is it readable when
// everything DOES run? A gsap.from({opacity:0}) whose trigger never fires
// leaves content invisible forever, and that is the spec's core anti-goal.
checks.motionsafe = async (ctx) => {
  const sizes = [[1280, 900], [390, 844], [320, 568]];
  const bad = [];
  for (const [w, h] of sizes) {
    const page = await ctx.browser.newPage();
    await page.setViewportSize({ width: w, height: h });
    await page.goto(ctx.url, { waitUntil: 'load' });
    // let the intro finish, then walk the whole page the way a reader would
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.7);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise(r => setTimeout(r, 70));
      }
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));
      window.scrollTo({ top: 0, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 400));
    });
    const invisible = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const txt = (el.textContent || '').trim();
        if (!txt) continue;
        if (el.closest('.inv__used') || el.classList.contains('inv__used')) continue;
        if (el.classList.contains('sr') || el.classList.contains('skip')) continue;
        if (el.closest('[aria-hidden="true"]')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (+cs.opacity >= 0.05) continue;
        const sel = el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '');
        out.push(`${sel} "${txt.slice(0, 26)}"`);
      }
      return [...new Set(out)];
    });
    await page.close();
    for (const i of invisible) bad.push(`${w}x${h} ${i}`);
  }
  const uniq = [...new Set(bad)];
  return {
    pass: !uniq.length,
    detail: uniq.length ? uniq.slice(0, 6).join(' | ') + (uniq.length > 6 ? ` | +${uniq.length - 6}` : '')
                        : `nothing left invisible after a full scroll at ${sizes.length} sizes`,
  };
};

// The CDN will be blocked, throttled or down for somebody. When it is, the
// page must lose its choreography and nothing else: no errors, no hidden
// content, and the whole world still reachable by scrolling.
checks.nogsap = async (ctx) => {
  const context = await ctx.browser.newContext();
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(`pageerror: ${String(e).slice(0, 120)}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 120)); });
  await page.route('**://cdnjs.cloudflare.com/**', r => r.abort());
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 30));
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 200));
  });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('body *')].filter(el => {
      const cs = getComputedStyle(el);
      return (+cs.opacity < 0.05 || cs.visibility === 'hidden' || cs.display === 'none')
             && el.textContent.trim()
             && !el.closest('.inv__used') && !el.classList.contains('inv__used') && !el.classList.contains('sr');
    }).map(el => el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''));
    const last = document.getElementById('world6');
    return {
      hidden: [...new Set(hidden)],
      gsap: typeof window.gsap,
      reachedBottom: !!last && last.getBoundingClientRect().top < window.innerHeight,
      textLen: document.body.innerText.trim().length,
    };
  });
  await context.close();
  const problems = [];
  if (r.gsap !== 'undefined') problems.push('gsap still loaded — the block did not take, so this proves nothing');
  if (errs.length) problems.push(`errors: ${errs.slice(0, 3).join(' | ')}`);
  if (r.hidden.length) problems.push(`hidden without gsap: ${r.hidden.slice(0, 6).join(', ')}`);
  if (!r.reachedBottom) problems.push('could not scroll to World 6');
  if (r.textLen < 4000) problems.push(`only ${r.textLen} chars rendered without gsap`);
  return { pass: !problems.length, detail: problems.join(' | ') || `${r.textLen} chars readable, whole world scrollable, no errors` };
};

// Deeper is older, and a side vein branches off the role it ran alongside.
// A vein whose dates fall outside its seam is a claim the layout makes
// visually and the dates do not support.
checks.strata = async (ctx) => {
  const page = await ctx.browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    const ym = (s) => (s ? Number(s.slice(0, 4)) * 12 + Number(s.slice(5, 7)) : Infinity);
    const bad = [];
    const seams = [...document.querySelectorAll('.seam')];
    for (let i = 1; i < seams.length; i++) {
      const prev = ym(seams[i - 1].dataset.from), cur = ym(seams[i].dataset.from);
      if (cur > prev) bad.push(`seam ${i + 1} (${seams[i].dataset.from}) is newer than the one above it (${seams[i - 1].dataset.from})`);
    }
    const veins = [...document.querySelectorAll('.vein')];
    for (const v of veins) {
      const host = v.closest('.seam');
      const name = (v.querySelector('.vein__o')?.textContent || '?').trim();
      if (!host) { bad.push(`"${name}": not attached to any seam`); continue; }
      const vf = ym(v.dataset.from), hf = ym(host.dataset.from), ht = ym(host.dataset.to);
      if (!v.dataset.from) { bad.push(`"${name}": no data-from`); continue; }
      if (vf < hf || vf > ht) {
        bad.push(`"${name}" (${v.dataset.from}) does not fall inside ${host.dataset.from}..${host.dataset.to || 'now'}`);
      }
    }
    return { seams: seams.length, veins: veins.length, bad };
  });
  await page.close();
  if (!r.seams) return { pass: false, detail: 'no .seam found' };
  return { pass: !r.bad.length, detail: r.bad.length ? r.bad.slice(0, 5).join(' | ') : `${r.seams} seams in order, ${r.veins} veins inside their host role` };
};

// Every tile says what it is. A project with no public URL is labelled, not
// hidden and not linked to a dead end; a project with no screenshot gets the
// sealed block rather than a broken image or a collapsed card.
const STATUSES = ['live', 'archived', 'private', 'app', 'source', 'social'];

checks.sealedtiles = async (ctx) => {
  const page = await ctx.browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 400));
  });
  const r = await page.evaluate((statuses) => {
    const tiles = [...document.querySelectorAll('.ore-tile')];
    const bad = [];
    for (const t of tiles) {
      const name = (t.querySelector('.ore-tile__n')?.textContent || '').trim() || '(unnamed)';
      const st = t.dataset.status;
      if (!statuses.includes(st)) { bad.push(`"${name}": status "${st}"`); continue; }

      const img = t.querySelector('img');
      if (img) {
        if (img.complete && img.naturalWidth === 0) bad.push(`"${name}": broken image ${img.getAttribute('src')}`);
      } else if (!t.querySelector('.ore-block')) {
        bad.push(`"${name}": no screenshot and no sealed block`);
      }

      const ext = (a) => a && !(a.getAttribute('href') || '').startsWith('#');
      const link = ext(t.matches('a[href]') ? t : null) ? t : [...t.querySelectorAll('a[href]')].find(ext) || null;
      if (['archived', 'private'].includes(st) && link) bad.push(`"${name}": ${st} but still links to ${link.getAttribute('href')}`);
      if (['live', 'source', 'social'].includes(st) && !link) bad.push(`"${name}": ${st} but has no link`);
      if (t.getBoundingClientRect().height < 44) bad.push(`"${name}": under the 44px touch target`);
    }
    const counts = {};
    for (const t of tiles) counts[t.dataset.status] = (counts[t.dataset.status] || 0) + 1;
    const note = (document.querySelector('.mines__note')?.textContent || '').toLowerCase();
    return { count: tiles.length, bad, counts, note };
  }, STATUSES);
  await page.close();
  if (!r.count) return { pass: false, detail: 'no .ore-tile found' };

  // The note describes the unlinked tiles in prose. Prose drifts from reality
  // silently, so assert the English number-word for each count is in it.
  const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  for (const st of ['private', 'app', 'archived']) {
    const n = r.counts[st] || 0;
    const word = WORDS[n];
    if (word && r.note && !r.note.includes(word)) {
      r.bad.push(`note does not say "${word}" but there are ${n} ${st} tiles`);
    }
  }
  const summary = Object.entries(r.counts).map(([k, v]) => `${v} ${k}`).join(', ');
  return { pass: !r.bad.length, detail: r.bad.length ? r.bad.slice(0, 6).join(' | ') : `${r.count} tiles (${summary})` };
};

// A made-up number on a portfolio becomes a question in an interview that
// cannot be answered. Every digit in a war story must trace to the CV.
// {{ANGKA: ...}} is the escape hatch: a visible placeholder, not a claim.
checks.nofakenumbers = async () => {
  const cv = path.join(ROOT, 'assets/Muhammad-Ilham-Rafiannandha-CV.pdf');
  if (!existsSync(cv)) return { pass: false, detail: 'CV not found; cannot verify story numbers' };

  const { execFileSync } = await import('node:child_process');
  let cvText;
  try { cvText = execFileSync('pdftotext', ['-layout', cv, '-'], { encoding: 'utf8' }); }
  catch (e) { return { pass: false, detail: `pdftotext failed: ${e.message.split('\n')[0]}` }; }
  const cvFlat = cvText.replace(/\s+/g, ' ').toLowerCase();

  const stem = (w) => w.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);

  // "27 modules" is traceable only if the CV says 27 near a word starting
  // "modul". Bare digit membership would also accept the phone number.
  const traceable = (num, nextWord) => {
    const st = stem(nextWord);
    if (!st) return cvFlat.includes(num);
    const re = new RegExp(`${num}[^a-z0-9]{0,3}[a-z]*\\s*${st}`, 'i');
    if (re.test(cvFlat)) return true;
    // also allow the number and the word within a short span either way round
    const near = new RegExp(`(${num}[\\s\\S]{0,30}${st}|${st}[\\s\\S]{0,30}${num})`, 'i');
    return near.test(cvFlat);
  };

  const I = dictionaries();
  const bad = [];
  let scanned = 0;
  for (const lang of ['en', 'id']) {
    for (const [k, v] of Object.entries(I[lang] || {})) {
      // every prose key, not just the war stories — the counts in w4.note and
      // the deck in w5 are claims too
      if (/^(st\.|role\.|date\.|cat\.|sheet\.save)/.test(k)) continue;
      const cleaned = String(v).replace(/\{\{ANGKA:[^}]*\}\}/g, '');
      const hits = [...cleaned.matchAll(/(\d+)[^\w]*(\w+)?/g)];
      if (hits.length) scanned++;
      for (const h of hits) {
        const [, num, next = ''] = h;
        if (!traceable(num, next)) bad.push(`${lang}.${k}: "${num} ${next}".trim() is in no CV line`);
      }
    }
  }
  return { pass: !bad.length, detail: bad.length ? bad.slice(0, 6).join(' | ') : `${scanned} keys with numbers, each traced to the CV in context` };
};

// Hover-only content fails a keyboard and a touchscreen at the same time.
// Every inventory slot must say what it is in the DOM, without hovering,
// and must be reachable by keyboard.
checks.tooltip = async (ctx) => {
  const page = await ctx.browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  const r = await page.evaluate(() => {
    const slots = [...document.querySelectorAll('.inv__slot')];
    const bad = [];
    for (const s of slots) {
      const name = s.querySelector('.inv__nm');
      const label = (name?.textContent || '').trim();
      if (!label) { bad.push(`${s.outerHTML.slice(0, 40)}: no .inv__nm text`); continue; }
      if (name && getComputedStyle(name).display === 'none') bad.push(`"${label}": name hidden by default`);
      if (s.tagName !== 'BUTTON' && !s.hasAttribute('tabindex')) bad.push(`"${label}": not keyboard reachable`);
      const box = s.getBoundingClientRect();
      if (box.height < 44) bad.push(`"${label}": ${Math.round(box.height)}px tall, under the 44px touch target`);

      // The payload the check is named after. It must exist, say something,
      // be tied to its button for assistive tech, and stay IN the
      // accessibility tree — display:none and visibility:hidden both remove
      // it, and a screen reader in browse mode never fires :focus-within.
      const describedBy = s.getAttribute('aria-describedby');
      const tip = describedBy ? document.getElementById(describedBy) : s.parentElement?.querySelector('.inv__used');
      if (!tip) { bad.push(`"${label}": no tooltip element`); continue; }
      if (!describedBy) bad.push(`"${label}": tooltip not linked by aria-describedby`);
      if (!(tip.textContent || '').trim()) bad.push(`"${label}": tooltip is empty`);
      const tcs = getComputedStyle(tip);
      if (tcs.display === 'none' || tcs.visibility === 'hidden') {
        bad.push(`"${label}": tooltip removed from the accessibility tree (${tcs.display}/${tcs.visibility})`);
      }
    }
    return { count: slots.length, bad };
  });

  // and it must actually reveal on focus
  if (!r.bad.length && r.count) {
    const reveal = await page.evaluate(async () => {
      const item = document.querySelector('.inv__item');
      const tip = item.querySelector('.inv__used');
      document.activeElement?.blur();
      await new Promise(res => setTimeout(res, 80));
      const before = getComputedStyle(tip).clipPath;
      item.querySelector('.inv__slot').focus();
      await new Promise(res => setTimeout(res, 120));
      const after = getComputedStyle(tip).clipPath;
      return { before, after };
    });
    if (reveal.before === reveal.after) {
      r.bad.push(`tooltip does not reveal on focus (clip-path stays ${reveal.after})`);
    }
  }

  await page.close();
  if (!r.count) return { pass: false, detail: 'no .inv__slot found' };
  return { pass: !r.bad.length, detail: r.bad.length ? r.bad.slice(0, 5).join(' | ') : `${r.count} slots: named, keyboard reachable, described, and revealed on focus` };
};

// The seven-second test. A recruiter reads six things and leaves; if any of
// them needs a scroll, the page has failed before it started. The Indonesian
// edition is the one that breaks first — its strings run longer.
const FACTS = ['name', 'role', 'open', 'now', 'prev1', 'prev2', 'edu', 'stack', 'cv'];

checks.abovefold = async (ctx) => {
  const page = await ctx.browser.newPage();
  const bad = [];
  await page.goto(ctx.url, { waitUntil: 'load' });
  const themeNames = await themes(page);
  for (const [w, h] of [[320, 460], [390, 664], [1440, 900]]) {
    for (const lang of ['en', 'id']) {
      for (const theme of themeNames) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(ctx.url, { waitUntil: 'load' });
        await setLang(page, lang);
        await setTheme(page, theme);
        const r = await page.evaluate((facts) => {
          const found = {}, missing = [];
          for (const f of facts) {
            const el = document.querySelector(`[data-fact="${f}"]`);
            if (!el) { missing.push(f); continue; }
            const cs = getComputedStyle(el);
            // bottom===0 for a display:none element, which would sail under
            // any "<= vh" test. Absent is not the same as above the fold.
            if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) {
              missing.push(f + ' (not rendered)'); continue;
            }
            const b = el.getBoundingClientRect();
            if (b.bottom <= 0) { missing.push(f + ' (above the viewport)'); continue; }
            found[f] = Math.round(b.bottom);
          }
          return { found, missing, vh: window.innerHeight };
        }, FACTS);
        if (r.missing.length) { bad.push(`${lang}/${theme}/${w}x${h} missing: ${r.missing.join(',')}`); continue; }
        for (const [f, bottom] of Object.entries(r.found)) {
          if (bottom > r.vh) bad.push(`${lang}/${theme}/${w}x${h} "${f}" ${bottom - r.vh}px below the fold`);
        }
      }
    }
  }
  await page.close();
  const uniq = [...new Set(bad)];
  return {
    pass: !uniq.length,
    detail: uniq.length ? uniq.slice(0, 6).join(' | ') + (uniq.length > 6 ? ` | +${uniq.length - 6}` : '')
                        : `${FACTS.length} facts above the fold at 3 sizes x 2 editions x ${themeNames.length} themes`,
  };
};

// Private windows, blocked cookies and some enterprise policies make every
// localStorage access throw. The language and theme controls must still work
// for the session; they just forget.
checks.storage = async (ctx) => {
  const page = await ctx.browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  page.on('pageerror', e => errs.push(`pageerror: ${String(e).slice(0, 120)}`));
  await page.addInitScript(() => {
    const boom = () => { throw new DOMException('denied', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { return { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0 }; },
    });
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });

  const r = await page.evaluate(async () => {
    const out = { hasLang: !!document.getElementById('lang'), hasTheme: !!document.getElementById('theme') };
    out.lang0 = document.documentElement.lang;
    out.theme0 = document.documentElement.dataset.theme;
    document.getElementById('lang')?.click();
    document.getElementById('theme')?.click();
    await new Promise(res => setTimeout(res, 120));
    out.lang1 = document.documentElement.lang;
    out.theme1 = document.documentElement.dataset.theme;
    return out;
  });
  await page.close();

  const problems = [];
  if (!r.hasLang) problems.push('no #lang control');
  if (!r.hasTheme) problems.push('no #theme control');
  if (r.hasLang && r.lang0 === r.lang1) problems.push(`language did not change (${r.lang0})`);
  if (r.hasTheme && r.theme0 === r.theme1) problems.push(`theme did not change (${r.theme0})`);
  if (errs.length) problems.push(`console: ${errs.slice(0, 3).join(' | ')}`);
  return {
    pass: !problems.length,
    detail: problems.join(' | ') || `lang ${r.lang0}->${r.lang1}, theme ${r.theme0}->${r.theme1}, no errors`,
  };
};

checks.console = async (ctx) => {
  const page = await ctx.browser.newPage();
  const msgs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(`${m.type()}: ${m.text().slice(0, 120)}`); });
  page.on('pageerror', e => msgs.push(`pageerror: ${String(e).slice(0, 120)}`));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40));
    }
  });
  await page.waitForTimeout(400);
  await page.close();
  return { pass: !msgs.length, detail: msgs.length ? msgs.slice(0, 5).join(' | ') : 'clean' };
};

/* ───────────────────────── runner ───────────────────────── */

const NEEDS_BROWSER = new Set(['overflow', 'contrast', 'nojs', 'reducedmotion', 'storage', 'abovefold', 'tooltip', 'sealedtiles', 'strata', 'nogsap', 'motionsafe', 'console']);

const argv = process.argv.slice(2);
const only = (argv.find(a => a.startsWith('--only=')) || '').split('=')[1];
const skipExternal = argv.includes('--skip-external');

let names = Object.keys(checks);
if (only) {
  if (!checks[only]) { console.error(`unknown check "${only}". known: ${names.join(', ')}`); process.exit(2); }
  names = [only];
}
if (skipExternal) names = names.filter(n => n !== 'external');

const wantsBrowser = names.some(n => NEEDS_BROWSER.has(n));
let ctx = {}, server, browser;
if (wantsBrowser) {
  try {
    server = await serve();
    browser = await launch();
    ctx = { url: server.url, browser };
  } catch (e) {
    if (e instanceof PlaywrightUnavailable) { console.error(e.message); process.exit(2); }
    throw e;
  }
}

let failed = 0;
for (const name of names) {
  let r;
  try { r = await checks[name](ctx); }
  catch (e) { r = { pass: false, detail: `threw: ${e.message.split('\n')[0]}` }; }
  if (!r.pass) failed++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  ${name.padEnd(14)} ${r.detail}`);
}

if (browser) await browser.close();
if (server) server.close();

console.log(failed ? `\n${failed}/${names.length} failed` : `\nall ${names.length} passed`);
process.exit(failed ? 1 : 0);

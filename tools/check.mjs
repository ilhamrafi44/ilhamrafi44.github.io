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

/** The contrast walk, unchanged from the sweep that found the dark-mode bug. */
const CONTRAST_PROBE = `() => {
  const lum = (c) => { const [r,g,b] = c.map(v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
  const nums = (s) => (s.match(/[\\d.]+/g) || []).map(Number);
  const rgb = (s) => nums(s).slice(0,3);
  const alpha = (s) => { const n = nums(s); return n.length > 3 ? n[3] : 1; };
  const bgOf = (el) => { let e = el; while (e) { const b = getComputedStyle(e).backgroundColor; if (alpha(b) > 0.1) return rgb(b); e = e.parentElement; } return [255,255,255]; };
  const ratio = (a,b) => { const l1 = lum(a), l2 = lum(b), hi = Math.max(l1,l2), lo = Math.min(l1,l2); return (hi+0.05)/(lo+0.05); };
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;\n    const r0 = el.getBoundingClientRect();\n    if (r0.width <= 2 || r0.height <= 2) continue; // sr-only / clipped: nothing is rendered
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const fg = rgb(cs.color); if (fg.length < 3) continue;
    const bg = bgOf(el);
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const need = (px >= 24 || (bold && px >= 18.66)) ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < need) out.push({
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.') : ''),
      fg: cs.color, bg: 'rgb(' + bg + ')', px: Math.round(px),
      ratio: +r.toFixed(2), need, txt: el.textContent.trim().slice(0, 40),
    });
  }
  return out;
}`;

/* ───────────────────────── checks ───────────────────────── */

const checks = {};

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
      for (const w of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(ctx.url, { waitUntil: 'load' });
        await setLang(page, lang);
        await setTheme(page, theme);
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - window.innerWidth);
        if (over > 1) bad.push(`${lang}/${theme}/${w}px +${over}`);
      }
    }
  }
  await page.close();
  return { pass: !bad.length, detail: bad.length ? bad.join(', ') : `no overflow at 5 widths x ${themeNames.length} themes x 2 editions` };
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
    gsapTweens: (typeof window.gsap !== 'undefined') ? window.gsap.globalTimeline.getChildren().length : 0,
  }));
  await context.close();
  const problems = [];
  if (r.animated.length) problems.push(`still animating: ${r.animated.slice(0, 8).join(', ')}`);
  if (r.gsapTweens) problems.push(`${r.gsapTweens} gsap tweens running`);
  return { pass: !problems.length, detail: problems.join(' | ') || 'no animation under reduce' };
};

// Every tile says what it is. A project with no public URL is labelled, not
// hidden and not linked to a dead end; a project with no screenshot gets the
// sealed block rather than a broken image or a collapsed card.
const STATUSES = ['live', 'archived', 'private', 'app', 'source'];

checks.sealedtiles = async (ctx) => {
  const page = await ctx.browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(ctx.url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30));
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

      const link = t.matches('a[href]') ? t : t.querySelector('a[href]');
      if (['archived', 'private'].includes(st) && link) bad.push(`"${name}": ${st} but still links to ${link.getAttribute('href')}`);
      if (['live', 'source'].includes(st) && !link) bad.push(`"${name}": ${st} but has no link`);
      if (t.getBoundingClientRect().height < 44) bad.push(`"${name}": under the 44px touch target`);
    }
    const counts = {};
    for (const t of tiles) counts[t.dataset.status] = (counts[t.dataset.status] || 0) + 1;
    return { count: tiles.length, bad, counts };
  }, STATUSES);
  await page.close();
  if (!r.count) return { pass: false, detail: 'no .ore-tile found' };
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
  const cvDigits = new Set(cvText.match(/\d+/g) || []);

  const I = dictionaries();
  const bad = [];
  for (const lang of ['en', 'id']) {
    for (const [k, v] of Object.entries(I[lang] || {})) {
      if (!/^w3\./.test(k)) continue;
      const cleaned = String(v).replace(/\{\{ANGKA:[^}]*\}\}/g, '');
      for (const n of cleaned.match(/\d+/g) || []) {
        if (!cvDigits.has(n)) bad.push(`${lang}.${k}: "${n}" is in no CV line`);
      }
    }
  }
  const n = Object.keys(I.en || {}).filter(k => /^w3\./.test(k)).length;
  return { pass: !bad.length, detail: bad.length ? bad.slice(0, 6).join(' | ') : `${n} story keys, every number traced to the CV` };
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
    }
    return { count: slots.length, bad };
  });
  await page.close();
  if (!r.count) return { pass: false, detail: 'no .inv__slot found' };
  return { pass: !r.bad.length, detail: r.bad.length ? r.bad.slice(0, 5).join(' | ') : `${r.count} slots, all named in the DOM and keyboard reachable` };
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
  for (const [w, h] of [[320, 568], [390, 844], [1440, 900]]) {
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
            const b = el.getBoundingClientRect();
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
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40));
    }
  });
  await page.waitForTimeout(400);
  await page.close();
  return { pass: !msgs.length, detail: msgs.length ? msgs.slice(0, 5).join(' | ') : 'clean' };
};

/* ───────────────────────── runner ───────────────────────── */

const NEEDS_BROWSER = new Set(['overflow', 'contrast', 'nojs', 'reducedmotion', 'storage', 'abovefold', 'tooltip', 'sealedtiles', 'console']);

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

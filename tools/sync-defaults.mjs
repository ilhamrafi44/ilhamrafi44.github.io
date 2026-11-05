#!/usr/bin/env node
// Keeps the English text in index.html identical to js/i18n.js.
//
//   node tools/sync-defaults.mjs          rewrite index.html from the EN dictionary
//   node tools/sync-defaults.mjs --check  exit 1 if any element has drifted
//
// Why this exists: every data-i18n element must carry its real English text in
// the markup, so the page reads correctly with scripts off. Keeping that text
// in two places invites drift, so it is generated from one of them and checked.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'index.html');

const win = {};
new Function('window', readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8')).call(win, win);
const EN = win.I18N?.en;
if (!EN) { console.error('window.I18N.en not found in js/i18n.js'); process.exit(2); }

// Entities the dictionary writes literally; everything else is escaped.
const escape = (s) => s.replace(/&(?!(?:amp|lt|gt|quot|#\d+|[a-z]+);)/gi, '&amp;')
                       .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const check = process.argv.includes('--check');
const src = readFileSync(HTML, 'utf8');
const drifted = [];

// Only elements whose content is a single text run are owned by the dictionary.
// Anything containing a child element is left alone: it is composed in markup
// on purpose (a date beside a label, a name beside a link).
const pattern = /<([a-z0-9]+)\b([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>([^<]*)<\/\1>/gi;

const out = src.replace(pattern, (whole, tag, pre, key, post, inner) => {
  if (!(key in EN)) return whole;
  const want = escape(EN[key]);
  if (inner.trim() === want.trim()) return whole;
  drifted.push({ key, inner: inner.trim().slice(0, 48), want: want.trim().slice(0, 48) });
  return `<${tag}${pre} data-i18n="${key}"${post}>${want}</${tag}>`;
});

if (check) {
  if (drifted.length) {
    console.error(`${drifted.length} element(s) differ from the EN dictionary:`);
    for (const d of drifted.slice(0, 10)) console.error(`  ${d.key}\n    markup: "${d.inner}"\n    dict:   "${d.want}"`);
    console.error('\nRun: node tools/sync-defaults.mjs');
    process.exit(1);
  }
  console.log('index.html defaults match js/i18n.js');
} else {
  writeFileSync(HTML, out);
  console.log(drifted.length ? `synced ${drifted.length} element(s) from the EN dictionary` : 'already in sync');
}

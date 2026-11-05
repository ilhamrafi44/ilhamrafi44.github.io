#!/usr/bin/env node
// Re-capture the project photography:  node tools/shoot.mjs
//
// Writes JPEGs straight into assets/shots/. No resize step and no external
// image tool — Playwright encodes the JPEG itself.
//
// Earlier versions imported playwright-core from one hardcoded absolute path
// under a particular home directory and piped the output through macOS `sips`,
// so "reproducible" meant "on one laptop". Both are gone.

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'shots');

const SITES = [
  ['sblnet',     'https://sblnet.id'],
  ['bigprop',    'https://bigproperty.online'],
  ['whitebox',   'https://propertywhitebox.com'],
  ['itoya',      'https://itoya.my.id'],
  ['dpupr',      'https://dpupr.mubakab.go.id/'],
  ['colabs',     'https://www.coffeelabs.co.id/'],
  ['colabshris', 'https://app.coffeelabs.co.id/'],
  ['colabsadm',  'https://admin.coffeelabs.co.id/'],
  ['elteyba',    'https://www.elteybatours.com'],
  ['elteybago',  'https://elteybago.eilhamzah.com/login'],
  ['tamansafari','https://domestic.tamansafaribogor.com/'],
  ['arkalearn',  'https://www.arkalearn.com/en'],
  ['gudangdus',  'https://gudangdusbandung.com/'],
  ['taiba',      'https://taibacoco.co.id'],
  ['aerocam',    'https://www.aerocam.co.id/'],
];

mkdirSync(OUT, { recursive: true });

const browser = await launch();
const ctx = await browser.newContext({
  viewport: { width: 1360, height: 850 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36',
});
ctx.setDefaultTimeout(30000);

let ok = 0, failed = [];
for (const [slug, url] of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // let fonts, hero images and lazy content settle; networkidle hangs on
    // sites with polling or chat widgets, so just wait a fixed beat
    await page.waitForTimeout(3800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(OUT, `${slug}.jpg`), type: 'jpeg', quality: 70 });
    console.log(`  ok    ${slug.padEnd(12)} ${(await page.title()).slice(0, 46)}`);
    ok++;
  } catch (e) {
    console.log(`  FAIL  ${slug.padEnd(12)} ${String(e).split('\n')[0].slice(0, 70)}`);
    failed.push(slug);
  } finally {
    await page.close();
  }
}
await browser.close();

console.log(`\n${ok}/${SITES.length} captured` + (failed.length ? `; kept existing shots for: ${failed.join(', ')}` : ''));

import { chromium } from '/Users/ilham/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs';

const SITES = [
  ['sblnet',    'https://sblnet.id'],
  ['bigprop',   'https://bigproperty.online'],
  ['whitebox',  'https://propertywhitebox.com'],
  ['itoya',     'https://itoya.my.id'],
  ['dpupr',     'https://dpupr.mubakab.go.id/'],
  ['colabs',    'https://www.coffeelabs.co.id/'],
  ['colabshris','https://app.coffeelabs.co.id/'],
  ['colabsadm', 'https://admin.coffeelabs.co.id/'],
  ['elteyba',   'https://www.elteybatours.com'],
  ['elteybago', 'https://elteybago.eilhamzah.com/login'],
  ['tamansafari','https://domestic.tamansafaribogor.com/'],
  ['arkalearn', 'https://www.arkalearn.com/en'],
  ['gudangdus', 'https://gudangdusbandung.com/'],
  ['taiba',     'https://taibacoco.co.id'],
  ['aerocam',   'https://www.aerocam.co.id/'],
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1360, height: 850 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36',
});
ctx.setDefaultTimeout(30000);

for (const [slug, url] of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // let fonts, hero images and lazy content settle; networkidle hangs on
    // sites with polling or chat widgets, so just wait a fixed beat
    await page.waitForTimeout(3800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `shots/${slug}.png` });
    console.log(`  ok    ${slug.padEnd(12)} ${(await page.title()).slice(0, 46)}`);
  } catch (e) {
    console.log(`  FAIL  ${slug.padEnd(12)} ${String(e).split('\n')[0].slice(0, 70)}`);
  } finally {
    await page.close();
  }
}
await browser.close();

/*  Re-capture the site photography:
 *    node tools/shoot.mjs
 *  Then resize into assets/shots/:
 *    for f in shots/*.png; do
 *      sips -s format jpeg -s formatOptions 70 -Z 680 "$f" \
 *           --out "assets/shots/$(basename "$f" .png).jpg"
 *    done
 *  Drives the installed Google Chrome via playwright-core, so nothing is
 *  downloaded. If the playwright-core path below has moved, point it at any
 *  copy on disk.
 */

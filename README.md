# ilhamrafi44.github.io — The World

Portfolio for **Muhammad Ilham Rafiannandha** ("Bonsky"), built as a side-view
game world you dig down through. Live at **https://ilhamrafi44.github.io**

Static. No build step, no bundler, no package manager — GitHub Pages serves
these files exactly as they are.

```
index.html          markup, the inline SVG sprite sheet (cat poses, icons)
css/tokens.css      palette, type scale, spacing, day/night
css/world.css       HUD, world shell, terrain, the cat
css/panels.css      character sheet, arsenal, buttons
css/worlds.css      per-world layout: chambers, mines, strata, core
css/responsive.css  the phone layout, the laptop layout, print
js/i18n.js          two editions, 120 keys each
js/app.js           language, day/night, HUD world indicator — no dependencies
js/motion.js        GSAP timelines; the ONLY file that touches a CDN
tools/check.mjs     16 mechanical checks, in place of a test framework
tools/sync-defaults.mjs  regenerates index.html's English text from i18n.js
tools/shoot.mjs     re-captures assets/shots/ by driving system Chrome
assets/shots/       screenshots of the live sites
```

## The idea

A vertical cross-section of one world. Sky at the top, then grass, dirt,
stone, and the deep. **Scrolling down is digging down**, and the metaphor
pays for itself at the chronology: deeper is older, exactly like geological
strata, so eleven years of work reads as rock layers.

Six worlds: **Surface** (the character sheet), **Workshop** (the arsenal),
**The Dirt** (three war stories), **The Mines** (everything shipped),
**Strata** (the chronology), **Core** (contact).

## The two rules everything obeys

**Animation decorates arrival. It never gates reading.** Every element's
resting state is its visible state — the choreography moves things *from* an
offset *to* where the CSS already put them. Block the CDN, disable
JavaScript, or turn on `prefers-reduced-motion` and the page is still, not
broken. Nothing pins, nothing scrubs the page, so the scrollbar always means
what it says.

**Pixel type never sets a sentence.** Press Start 2P is for the HUD, labels
and numbers at 6–9px. Paragraphs are Space Grotesk; display headings are
Archivo Black. This is the whole reason the page can be a game and still be
read by someone skimming it in seven seconds.

## Running the checks

```bash
node tools/check.mjs              # all of them
node tools/check.mjs --only=contrast
node tools/check.mjs --skip-external
```

There is no test framework here and no reason for one. These are the things
that actually break a hand-written page, and every one of them has caught a
real bug in this repo:

| check | what it asserts |
|---|---|
| `defaults` | index.html's English text matches `js/i18n.js` |
| `i18n` | both editions have identical keys, none unused, no HTML entities in values |
| `assets` | every local `src`/`href` resolves on disk |
| `external` | every outbound link answers (401/403/429/999 count as alive-but-bot-guarded) |
| `overflow` | no horizontal scroll at 320/390/768/1024/1440 × 2 themes × 2 editions |
| `contrast` | every text/background pair meets WCAG AA, both themes, both editions |
| `nojs` | nothing is visible only with scripts, and no i18n element is a placeholder |
| `reducedmotion` | no CSS animation and no DOM-targeting tween under `reduce` |
| `nogsap` | with cdnjs blocked: no errors, nothing hidden, the whole world still scrollable |
| `strata` | seams run strictly oldest-last; every vein starts inside its host role |
| `sealedtiles` | every tile has a status; archived and private carry no link; no broken images |
| `nofakenumbers` | every digit in a war story traces to a line in the CV |
| `tooltip` | every inventory slot names itself without hovering and is keyboard reachable |
| `abovefold` | all nine recruiter facts clear the fold at 320×568, 390×844 and 1440×900 |
| `storage` | language and theme still work when `localStorage` throws |
| `console` | zero errors or warnings after a full scroll |

Browser checks drive the system Chrome through `playwright-core`, resolved
from the npm cache (`tools/lib/browser.mjs`). If it is missing:

```bash
npx --yes playwright-core@1.49.1 --version
```

## Editing copy

The English text lives twice on purpose — in `index.html` so the page reads
with scripts off, and in `js/i18n.js` so the editions can switch. Edit
`js/i18n.js`, then:

```bash
node tools/sync-defaults.mjs      # regenerate index.html
node tools/check.mjs --only=defaults
```

The `defaults` check fails the build if they drift apart.

Two editions, not one translated twice: English is dry and understated,
Indonesian is stand-up — longer setup, the beat on the last few words.
Technology names and project one-liners stay English in both.

## Dependencies

One, loaded from a CDN at a pinned version and confined to `js/motion.js`:

```
gsap 3.13.0 + ScrollTrigger   https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/
```

GSAP has been free for commercial use, ScrollTrigger included, since 30 April
2025. anime.js was considered and not added: it does a subset of what GSAP
already does here, and two libraries for one job is dead weight.

## The CV

`assets/Muhammad-Ilham-Rafiannandha-CV.pdf` is single-column, real text, no
tables — the three things that actually break a resume parser. An applicant
tracking system never reads this website; it reads that file. The site's only
job on that front is making it easy to find.

## Design and plan

- `docs/superpowers/specs/2026-11-05-retro-world-portfolio-design.md`
- `docs/superpowers/plans/2026-11-05-retro-world-portfolio.md`

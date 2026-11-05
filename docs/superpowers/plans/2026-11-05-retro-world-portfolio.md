# Retro-World Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire `ilhamrafi44.github.io` newspaper site with a retro-game world — a vertical cross-section the visitor digs down through — that a recruiter can read in seven seconds.

**Architecture:** Static files, no build step, served by GitHub Pages. One `index.html` carrying all content as semantic HTML (readable with CSS and JS off), five CSS files split by responsibility, and three JS files where only `js/motion.js` touches GSAP — so a CDN failure degrades motion, never content. A Node check script (`tools/check.mjs`) replaces a test framework: each task adds assertions to it, and every task ends green.

**Tech Stack:** HTML, CSS, vanilla JS, GSAP 3.13.0 + ScrollTrigger (CDN, pinned), `playwright-core` from the npx cache driving system Chrome for the browser checks.

**Spec:** `docs/superpowers/specs/2026-11-05-retro-world-portfolio-design.md`

## Global Constraints

- No build step, no package manager, no `node_modules` committed. Libraries load from CDN with an exact pinned version.
- GSAP is the only animation library. **anime.js is not added.** Plain CSS handles hover and `:active`.
- CDN URLs exactly: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js` and `.../3.13.0/ScrollTrigger.min.js`.
- Every element's resting state is its visible state. Nothing is `opacity: 0` in CSS unless `html.js` is present.
- Pixel type (`Press Start 2P`) never sets a sentence — HUD, labels and numbers only, at 6–9px. Body copy is `Space Grotesk`. Display headings are `Archivo Black`.
- Every text/background pair meets WCAG AA in **both** day and night. A panel that inverts gets an explicit text colour, never a theme-flipping token.
- Bilingual ID/EN: prose is both editions; technology names and project one-liners stay English.
- `prefers-reduced-motion: reduce` disables all transform/opacity choreography. Content unaffected.
- No horizontal scroll at 320, 390, 768, 1024, 1440px. Touch targets ≥ 44px.
- No scroll-jacking, no forced section snapping.
- **No invented business metrics.** Architecture and mechanism come from `~/Downloads/CV-Ilham-Rafiannandha.pdf`. Where a number would strengthen a story, emit a literal `{{ANGKA: …}}` placeholder.
- Palette tokens, verbatim: `--sky-hi #4A90E2`, `--sky-lo #8FD3F4`, `--grass #4FA64F`, `--grass-lit #6FD66F`, `--dirt #7B5230`, `--dirt-dk #5A3A20`, `--stone #4A4652`, `--deep #2A2630`, `--ink #141019`, `--cream #FFF6E5`, `--gold #FFC700`, `--torch #FF8C1A`, `--ore-cyan #5BC8D8`, `--ore-mag #E8A0FF`.
- All work on branch `feat/retro-world`. `main` keeps serving the current site until Ilham approves.

## Review Focus

Five failure modes the spec implies that no feature task would otherwise exercise. Each is pinned to a task below.

1. **GSAP CDN blocked or slow** — the page must be fully readable and navigable with `gsap` undefined; `js/motion.js` must not throw and must not leave anything hidden. *(Task 12)*
2. **`prefers-reduced-motion: reduce`** — no transform/opacity choreography runs, the cat is present but still, and all content is in its resting visible state. *(Task 12)*
3. **Indonesian strings overflow at 320px** — ID copy runs longer than EN; the character sheet must keep all six recruiter facts above the fold in **both** editions at 320px. *(Task 4)*
4. **`localStorage` throws (private mode / blocked cookies)** — theme and language toggles still work for the session; nothing throws. *(Task 3)*
5. **A project tile has no screenshot and no reachable URL** — the tile renders as an unexcavated block with a status marker, never a collapsed layout or a broken-image icon. *(Task 8)*

---

### Task 1: Branch and the check harness

**Files:**
- Create: `tools/check.mjs`
- Create: `tools/lib/browser.mjs`

**Interfaces:**
- Produces: `node tools/check.mjs` — exits 0 when all checks pass, 1 otherwise, prints one line per check. Flags: `--only=<name>` to run one check, `--skip-external` to skip network checks.
- Produces: `tools/lib/browser.mjs` exports `launch(): Promise<Browser>` — resolves `playwright-core` from the npx cache by globbing `~/.npm/_npx/*/node_modules/playwright-core`, then launches system Chrome with `{ channel: 'chrome', headless: true }`. Throws a named `PlaywrightUnavailable` error if no copy is found.
- Produces: check names consumed by later tasks: `i18n`, `assets`, `external`, `overflow`, `contrast`, `nojs`, `reducedmotion`, `console`.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feat/retro-world
```

- [ ] **Step 2: Write `tools/lib/browser.mjs`**

Export `launch()`. Resolution order: `import('playwright-core')` first (in case it is ever installed properly), then glob `~/.npm/_npx/*/node_modules/playwright-core/index.mjs` and import the first hit. The current site's `tools/shoot.mjs` hardcodes `/Users/ilham/.npm/_npx/9833c18b2d85bc59/...`; the same hash directory exists on Linux at `~/.npm/_npx/9833c18b2d85bc59/`, which is why globbing works on both machines and the hardcoded path does not.

- [ ] **Step 3: Write `tools/check.mjs` with the eight checks**

Each check is an async function returning `{ name, pass: boolean, detail: string }`. Static checks (`i18n`, `assets`, `external`) need no browser. Browser checks start a local static server on an ephemeral port and drive Chrome.

| name | asserts |
|---|---|
| `i18n` | every `data-i18n`/`data-i18n-html` key in `index.html` exists in both `I18N.en` and `I18N.id`; both dicts have identical key sets; no dict key is unused; no duplicate literal keys; no empty values |
| `assets` | every `src`/`href` pointing at a local path resolves to a file on disk |
| `external` | every `http(s)` link returns a 2xx or 3xx, or is on a known-archived allowlist read from `tools/archived-links.json` |
| `overflow` | `documentElement.scrollWidth <= innerWidth + 1` at 320, 390, 768, 1024, 1440 — in **both** `en` and `id`, in **both** themes |
| `contrast` | every element rendering its own text node meets WCAG AA (4.5, or 3.0 when ≥24px or bold ≥18.66px) against its nearest opaque ancestor background — both themes |
| `nojs` | with JavaScript disabled, no element in the document has computed `opacity: 0` or `visibility: hidden`, and the character sheet's six recruiter facts are present in the DOM |
| `reducedmotion` | with `prefers-reduced-motion: reduce` emulated, no element has a non-`none` `animation-name`, and `gsap.globalTimeline.getChildren().length === 0` |
| `console` | zero console errors or warnings after load and a full scroll to the bottom |

`contrast` must reuse the algorithm already proven against the current site during the pre-rebuild sweep: walk `body *`, keep elements with a direct non-empty text child, resolve background by walking ancestors until alpha > 0.1.

- [ ] **Step 4: Create `tools/archived-links.json`**

```json
["https://www.aerocam.co.id/", "https://dpupr.mubakab.go.id/", "https://www.linkedin.com/in/ilhamrafi44/"]
```

LinkedIn is listed because it answers `999` to automated clients by design, not because it is dead.

- [ ] **Step 5: Run the harness against the *current* site to prove it works**

Run: `node tools/check.mjs`
Expected: `i18n`, `assets`, `overflow`, `nojs`, `console` PASS. `contrast` PASSES only if the `css/paper.css` dark-mode fix from the pre-rebuild sweep is present — it is, on this branch. `external` PASSES with the archived allowlist. `reducedmotion` may FAIL on the current site; record the output and do not fix the old site.

A harness that passes against a site known to be good is a harness that works. If every check passes trivially, the checks are not reading the page — debug before continuing.

- [ ] **Step 6: Commit**

```bash
git add tools/check.mjs tools/lib/browser.mjs tools/archived-links.json
git commit -m "test: add the static-site check harness"
```

---

### Task 2: Assets — photo, CV, and the broken screenshot script

**Files:**
- Create: `assets/ilham.jpg`, `assets/ilham-sm.jpg`, `assets/ilham.webp`, `assets/ilham-sm.webp`
- Create: `assets/Muhammad-Ilham-Rafiannandha-CV.pdf` (replacing the committed one, same path)
- Modify: `tools/shoot.mjs`
- Delete: `assets/bonsky.jpg`, `assets/bonsky-sm.jpg`, `assets/bonsky-cover.jpg`

**Interfaces:**
- Produces: `assets/ilham.jpg` 1040×1300 and `assets/ilham-sm.jpg` 520×650, plus `.webp` of each. Consumed by Task 4.
- Produces: `tools/shoot.mjs` runnable as `node tools/shoot.mjs`, writing JPEGs straight into `assets/shots/`.

- [ ] **Step 1: Copy and derive the photo**

Source: `/home/void/Downloads/Foto-CV-Ilham-Rafiannandha.jpg` (1040×1300). No background removal — the design frames it in a hard-bordered rectangle. Use ImageMagick if present, else `sharp` via `npx`; the sweep found neither installed, so check first and pick one.

- [ ] **Step 2: Swap the CV**

```bash
cp ~/Downloads/CV-Ilham-Rafiannandha.pdf assets/Muhammad-Ilham-Rafiannandha-CV.pdf
```

Same public filename so existing links survive. The old 4-page file is overwritten, not kept alongside — per spec §13.3, a stale CV at a guessable path is worse than none.

- [ ] **Step 3: Verify the shipped CV says "Present"**

Run: `pdftotext -layout assets/Muhammad-Ilham-Rafiannandha-CV.pdf - | grep -c "Dec 2025 – Present"`
Expected: `1` or more. If `0`, the wrong file was copied — stop, the character sheet would contradict it.

- [ ] **Step 4: Fix `tools/shoot.mjs`**

Three defects: the hardcoded `/Users/ilham/...` import, the `shots/` output path relative to cwd, and the macOS-only `sips` resize in the trailing comment. Replace the import with `launch()` from `tools/lib/browser.mjs` (Task 1), write directly to `assets/shots/<slug>.jpg` using Playwright's `{ type: 'jpeg', quality: 70 }` so no external resize tool is needed, and delete the `sips` comment block.

Keep the existing `SITES` array. Add nothing: `elteybago` is already listed and simply never had its JPEG committed.

- [ ] **Step 5: Run it**

Run: `node tools/shoot.mjs`
Expected: 13 `ok` lines, and `FAIL` for `aerocam` and `dpupr` — both are down (spec §8.4). Those two keep their existing committed JPEGs.

- [ ] **Step 6: Run the harness**

Run: `node tools/check.mjs --only=assets`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add assets/ tools/shoot.mjs
git commit -m "feat: new photo and CV, and a shoot script that runs off one machine"
```

---

### Task 3: Shell — skeleton, tokens, HUD, day/night, i18n plumbing

**Files:**
- Create: `index.html` (replacing the current one wholesale)
- Create: `css/tokens.css`, `css/world.css`
- Create: `js/i18n.js`, `js/app.js`
- Delete: `css/base.css`, `css/cover.css`, `css/paper.css`, `css/contents.css`, `css/sections.css`

**Interfaces:**
- Produces: `window.I18N = { en: {...}, id: {...} }` in `js/i18n.js`.
- Produces: `js/app.js` sets `html.js`, applies language and theme, updates the HUD world indicator, and exposes nothing globally.
- Produces: `<html data-theme="day|night" lang="en|id">`; six `<section id="world1".."world6">` in document order.
- Produces: the `.hud` element with `#lang`, `#theme`, and `#hud-world` (the `WORLD n · NAME` readout, updated by Task 12).

- [ ] **Step 1: Add the `localStorage`-throws case to the harness**

Add to `tools/check.mjs` a check `storage`: load the page with `localStorage` replaced by a throwing stub, then click `#lang` and `#theme` and assert the language and theme actually changed and no console error was logged. This is Review Focus item 4.

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check.mjs --only=storage`
Expected: FAIL — there is no `#lang` yet.

- [ ] **Step 3: Write `css/tokens.css`**

The palette from Global Constraints as custom properties on `:root`, the three font stacks, a `clamp()`-based type scale, and spacing. Night theme under `[data-theme=night]` overrides `--sky-hi`, `--sky-lo` and the ambient values only — **`--ink` and `--cream` do not swap.** The spec's §7.1 failure on the old site came from a muted token flipping with the theme while its surface did not; inverting surfaces get explicit colours here instead.

- [ ] **Step 4: Write `index.html`**

Doctype, meta, Google Fonts link for the three families, the five stylesheets, then: skip link, HUD, six `<section>`s with real headings, and the two scripts at the end. Every section is populated with its real content in later tasks; here each holds only its `<h2>` so the document outline is correct from the start.

`<title>`, `og:*` and `meta description` updated away from "The Bonsky Times".

- [ ] **Step 5: Write `js/app.js`**

Port the parts of the current `js/app.js` that already work and are worth keeping: the `html.js` flag, the `store` wrapper with try/catch on both get and set (this is what makes Review Focus item 4 pass), `applyLang`, `applyTheme`, and the counter and reveal-sweep helpers. Drop the dateline and the scroll-cat — the cat is rebuilt in Task 11.

Theme values are `day`/`night`, not `light`/`dark`.

- [ ] **Step 6: Write `js/i18n.js` with the shell's keys only**

HUD labels, skip link, the six world names, and the document titles for both editions. Later tasks append their own keys.

- [ ] **Step 7: Run the harness**

Run: `node tools/check.mjs`
Expected: `storage`, `i18n`, `nojs`, `console`, `overflow` PASS. `contrast` PASS. `external` PASS.

- [ ] **Step 8: Commit**

```bash
git add index.html css/ js/ && git rm css/base.css css/cover.css css/paper.css css/contents.css css/sections.css
git commit -m "feat: world shell, tokens, HUD and day/night"
```

---

### Task 4: World 1 — the character sheet

**Files:**
- Create: `css/panels.css`
- Modify: `index.html` (`#world1`), `js/i18n.js`

**Interfaces:**
- Produces: `.sheet` — the character-sheet panel. Consumed by nothing; it is terminal UI.
- Produces: i18n keys `w1.*`.

- [ ] **Step 1: Add the above-the-fold check to the harness**

Add check `abovefold`: at 320×568, 390×844 and 1440×900, in **both** editions and **both** themes, assert all eight elements are within the viewport without scrolling — `[data-fact="name"]`, `[data-fact="role"]`, `[data-fact="now"]`, `[data-fact="prev1"]`, `[data-fact="prev2"]`, `[data-fact="edu"]`, `[data-fact="stack"]`, `[data-fact="cv"]`. This is Review Focus item 3; the ID edition is the one that will fail first.

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check.mjs --only=abovefold`
Expected: FAIL — no `[data-fact]` elements exist.

- [ ] **Step 3: Build the sheet in `#world1`**

The eight fields from spec §8.1, each tagged with its `data-fact` attribute. Order in the DOM: name, role, **OPEN TO WORK badge**, now, prev1, prev2, edu, equipped, CTAs.

Exact values, from the CV:

| field | value |
|---|---|
| name | Muhammad Ilham Rafiannandha |
| role | Senior Full Stack Engineer |
| now | PT Surya Bestari Lestari (SBLNET) · Des 2025 → |
| prev1 | PT Cashlez Worldwide Indonesia · Mar–Des 2025 |
| prev2 | PT Cyber Lab Indonesia · Team Lead · Jun 2023–Feb 2025 |
| edu | Universitas Darma Persada · S.S. · 2018–2023 |
| equipped | Java/Spring · Next.js · React · PostgreSQL · Go · Docker · MikroTik · +12 |
| CTAs | `▶ Lihat Project` (anchor to `#world4`), `↓ Unduh CV (PDF)` (download) |

The `OPEN TO WORK` badge is prominent, not muted — Ilham chose the explicit form knowing the page is public (spec §8.1).

- [ ] **Step 4: Write `css/panels.css`**

The sheet, the badge, buttons, and the hard-shadow form language from spec §7.3. The sheet is `--cream` ground with `--ink` text in **both** themes — the most important content never changes contrast.

- [ ] **Step 5: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS, `abovefold` included. If ID overflows at 320px, shorten the ID strings — do not shrink the font below 12px for the stat rows.

- [ ] **Step 6: Commit**

```bash
git add index.html css/panels.css js/i18n.js
git commit -m "feat: the character sheet, with all six recruiter facts above the fold"
```

---

### Task 5: The terrain

**Files:**
- Modify: `css/world.css`, `index.html`

**Interfaces:**
- Produces: `.terrain` with five layer elements `.layer--sky|grass|dirt|stone|deep`, positioned so the ground reads as one continuous cross-section behind all six sections. Consumed by Task 12 for parallax.

- [ ] **Step 1: Build the layers**

Fixed-position background layers behind the content, each with its material texture (the dirt and stone speckle is a `radial-gradient` at `background-size: 9–13px`). Section boundaries must not be visible as edges — the material changes, the page does not show a seam.

- [ ] **Step 2: Verify no layer creates horizontal overflow**

Run: `node tools/check.mjs --only=overflow`
Expected: PASS at all five widths.

- [ ] **Step 3: Commit**

```bash
git add index.html css/world.css
git commit -m "feat: the terrain, sky down to the deep"
```

---

### Task 6: World 2 — the arsenal

**Files:**
- Modify: `index.html` (`#world2`), `css/panels.css`, `js/i18n.js`

**Interfaces:**
- Produces: `.inv__slot` buttons carrying `data-item` and `data-used-on`.

- [ ] **Step 1: Add the hover-only check**

Add check `tooltip`: assert every `.inv__slot` has a text label in the DOM that is readable without hover or focus, and that each slot is a `<button>` reachable by keyboard. Hover-only content fails both accessibility and touch.

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check.mjs --only=tooltip`
Expected: FAIL.

- [ ] **Step 3: Build the grid**

An icon grid of the ~16 technologies Ilham leads with, plus the full 51-item list as text chips in the eight categories (Backend, Frontend, Mobile, Data, Infra, Network, Payments, Systems) from the CV's Skills block.

Tooltip content is **item name + the projects it was used on**, both derivable from the CV. Per spec §15, the mockup's "6 tahun · 14 produksi" was invented and is not used.

Six items carry no project because they appear in no role on either CV — Rust, Kotlin Multiplatform, SvelteKit, TimescaleDB, Grafana, C++ (C++ does appear, in Itoya's DXGI capture agent, so place it there). Render the remaining five with no "used on" line rather than inventing one; spec §14 flags this for Ilham.

4 columns at ≤720px, tap-to-expand instead of hover.

- [ ] **Step 4: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html css/panels.css js/i18n.js
git commit -m "feat: the arsenal"
```

---

### Task 7: World 3 — the war stories

**Files:**
- Modify: `index.html` (`#world3`), `css/worlds.css` (create), `js/i18n.js`

**Interfaces:**
- Produces: `.chamber` — three excavated chambers, each `<article>` with `<h3>`, a figure, and four labelled parts.

- [ ] **Step 1: Add the fabrication guard**

Add check `nofakenumbers`: scan `js/i18n.js` for digit-bearing claims inside `w3.*` keys that are not present in `assets/Muhammad-Ilham-Rafiannandha-CV.pdf` (extract its text once with `pdftotext`). Allow the literal `{{ANGKA:` placeholder. Fail with the offending string.

This check exists because the spec's §8.3 rule is the one a future editor is most likely to break by accident.

- [ ] **Step 2: Run it to verify it passes trivially, then seed a fake to prove it bites**

Run: `node tools/check.mjs --only=nofakenumbers` → PASS (no `w3` keys yet).
Temporarily add `"w3.test": "Served 40,000 subscribers"` → re-run → expect FAIL naming that string. Remove it.

- [ ] **Step 3: Write the three stories**

SBLNET, Cashlez, Taman Safari (spec §8.3). Each: **problem → decision → the hard part → what it does now.** Substance comes from the CV bullets quoted in spec §8.3. Both editions.

- [ ] **Step 4: Build the chambers**

Framed cut-aways in the dirt layer, torch-lit, screenshot inside. `assets/shots/sblnet.jpg`, `assets/shots/tamansafari.jpg`; Cashlez has no screenshot — use the unexcavated-block treatment from Task 8.

- [ ] **Step 5: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html css/worlds.css js/i18n.js
git commit -m "feat: three war stories, dug out of the dirt"
```

---

### Task 8: World 4 — the mines

**Files:**
- Modify: `index.html` (`#world4`), `css/worlds.css`, `js/i18n.js`

**Interfaces:**
- Produces: `.ore` tiles, each with `data-status` ∈ `live|archived|private|app|source`.
- Produces: `.ore--sealed` — the unexcavated-block treatment for a tile with no screenshot.

- [ ] **Step 1: Add the missing-asset check**

Add check `sealedtiles`: assert every `.ore` has a `data-status`; assert no `.ore img` resolves to a missing file; assert every tile without an `img` carries `.ore--sealed`; assert tiles with `data-status` of `archived|private` have no `href`. This is Review Focus item 5.

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check.mjs --only=sealedtiles`
Expected: FAIL.

- [ ] **Step 3: Build all ~25 tiles**

The 16 from the current site plus the 8 URL-less entries named in spec §8.4: ProSpark LMS `private`, Nghbr app `app`, Remedi app `app`, Spectro `private`, SmartHajj `private`, Elteyba Go `live`, newstvri.com `archived`, mfu-macos `source` (links to the GitHub repo).

`aerocam.co.id` and `dpupr.mubakab.go.id` → `archived`, no `href` (spec §8.4).

One-liners stay English per Global Constraints. Descriptions for the 8 new entries come from the CV's Freelance & Independent Projects block.

- [ ] **Step 4: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS. `external` must now pass with the two dead domains unlinked rather than allowlisted — tighten `tools/archived-links.json` to drop them if they are no longer emitted as links.

- [ ] **Step 5: Commit**

```bash
git add index.html css/worlds.css js/i18n.js tools/archived-links.json
git commit -m "feat: every shipped product, with an honest status on each"
```

---

### Task 9: World 5 — the strata

**Files:**
- Modify: `index.html` (`#world5`), `css/worlds.css`, `js/i18n.js`

**Interfaces:**
- Produces: `.seam` (the continuous employment spine) and `.vein` (concurrent freelance branches).

- [ ] **Step 1: Add the chronology check**

Add check `strata`: assert the 7 `.seam` entries appear in strictly descending date order; assert each of the 4 `.vein` entries has a start date falling inside the date range of the `.seam` entry it is attached to. A side vein that is not actually concurrent is a lie the design would be telling visually.

- [ ] **Step 2: Run it to verify it fails**

Run: `node tools/check.mjs --only=strata`
Expected: FAIL.

- [ ] **Step 3: Build the strata**

Seven main-seam entries: SBL (Des 2025→), Cashlez (Mar–Des 2025), Cyber Lab (Jun 2023–Feb 2025), Remedi (Nov 2022–Mei 2023), Elteyba (Apr 2021–Nov 2022), Taiba (Feb 2020–Apr 2021), TVRI internship (Mar–Sep 2017).

Four side veins, all concurrent with Cyber Lab: ProSpark (Jul–Agu 2024), Taman Safari/GlobalTix (Nov 2023–Jan 2024), Spectro-ArkaLearn (Sep–Des 2023), Nghbr (Jun–Agu 2023).

**Draw the seam on concurrency, not on contract status** — the CV tags Cashlez, Cyber Lab, Elteyba and Taiba "(Contract)", and splitting on that would leave two entries on the seam and collapse the section (spec §15).

Deeper is older. Education and the two 2022 talks sit in this world.

- [ ] **Step 4: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html css/worlds.css js/i18n.js
git commit -m "feat: the strata, deeper is older"
```

---

### Task 10: World 6 — the core

**Files:**
- Modify: `index.html` (`#world6`), `css/worlds.css`, `js/i18n.js`

- [ ] **Step 1: Build contact and colophon**

Email `ilhamrafi44@gmail.com`, LinkedIn `in/ilhamrafi44`, GitHub `@ilhamrafi44`, Jakarta · UTC+7. The CV download repeated. Colophon names the three typefaces and states no build step. Copyright year from `new Date().getFullYear()`.

- [ ] **Step 2: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add index.html css/worlds.css js/i18n.js
git commit -m "feat: the core"
```

---

### Task 11: The cat

**Files:**
- Modify: `index.html` (inline SVG sprite sheet), `css/world.css`, `js/i18n.js`

**Interfaces:**
- Produces: four SVG `<symbol>`s — `#cat-walk`, `#cat-sit`, `#cat-sleep`, `#cat-taunt`.
- Produces: `.cat--rider` — the instance that walks the ground line, moved by Task 12.

- [ ] **Step 1: Draw the four poses**

Inline SVG, not emoji and not raster, so they recolour with the theme. The current site's `#cat-sit`, `#cat-sleep` and `#cat-walk` symbols are good and are ported as-is; `#cat-taunt` is new — it is the Duck Hunt payload (spec §10).

- [ ] **Step 2: Place the taunt**

The taunt surfaces once, at the `{{ANGKA: …}}`-free joke the spec names: the `NaN known bugs` line, carried over into World 1 or World 6 at the builder's discretion.

- [ ] **Step 3: Run the harness**

Run: `node tools/check.mjs`
Expected: all PASS — in particular `contrast`, since the cat's `--cat` colour sits on several grounds.

- [ ] **Step 4: Commit**

```bash
git add index.html css/world.css js/i18n.js
git commit -m "feat: Cimol, in four poses"
```

---

### Task 12: Motion

**Files:**
- Create: `js/motion.js`
- Modify: `index.html` (the two GSAP script tags)

**Interfaces:**
- Consumes: `.terrain .layer--*` (Task 5), `.cat--rider` (Task 11), `#hud-world` (Task 3), `.ore` (Task 8), `.chamber` (Task 7).
- Produces: nothing other tasks consume. This file is terminal and optional by design.

- [ ] **Step 1: Add the two degradation checks**

Add check `nogsap`: block the two cdnjs URLs at the network layer, load the page, assert zero console errors, assert no element has computed `opacity: 0`, and assert the page still scrolls to `#world6`. This is Review Focus item 1.

Add check `reducedmotion` (stubbed in Task 1, now made real): emulate `prefers-reduced-motion: reduce`, assert no element has a non-`none` `animation-name` and `gsap.globalTimeline.getChildren().length === 0`. This is Review Focus item 2.

- [ ] **Step 2: Run them to verify they fail**

Run: `node tools/check.mjs --only=nogsap && node tools/check.mjs --only=reducedmotion`
Expected: `nogsap` PASSES already (no GSAP yet — note this, it becomes meaningful after Step 4). `reducedmotion` FAILS if any CSS animation from earlier tasks runs unguarded.

- [ ] **Step 3: Guard every CSS animation**

Wrap all `@keyframes` usage in `@media (prefers-reduced-motion: no-preference)`. Re-run `reducedmotion` → PASS.

- [ ] **Step 4: Write `js/motion.js`**

Guard the whole file on `typeof gsap !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches`. Register ScrollTrigger, then build the choreography from spec §9.2: terrain parallax, `#hud-world` updating per section, the cat's x-position driven by scroll progress, torches fading in, ore glinting on entry, chambers settling.

Easing discipline from spec §9.4: sprite-like movement uses `steps()`; camera and panel movement uses a spring-ish cubic-bezier.

No `ScrollTrigger` with `pin` or `scrub: true` on anything that would hold the page — no scroll-jacking.

- [ ] **Step 5: Run the full harness, then both degradation checks**

Run: `node tools/check.mjs`
Expected: all PASS, `nogsap` and `reducedmotion` now meaningful.

- [ ] **Step 6: Commit**

```bash
git add js/motion.js index.html css/
git commit -m "feat: scroll choreography, and the two ways it is allowed to fail"
```

---

### Task 13: Responsive pass and final verification

**Files:**
- Create: `css/responsive.css`
- Modify: `index.html`, `README.md`

- [ ] **Step 1: Build the two designed layouts**

Phone ≤720px and laptop ≥1024px per spec §11 — two designed layouts, not one that survives. Fluid between, `clamp()` for type, no fixed breakpoint jumps in font size. Touch targets ≥44px.

- [ ] **Step 2: Rewrite `README.md`**

Describe the new structure, the check harness and how to run it, and the GSAP CDN pin. The current README describes the newspaper and is wholly obsolete.

- [ ] **Step 3: Run the complete harness**

Run: `node tools/check.mjs`
Expected: every check PASS. Record the output in the commit message.

- [ ] **Step 4: Verify against the spec's §13.4 list by hand**

The seven checks there map onto harness checks 1:1 except "every i18n key present in both editions, no key unused" — confirm the `i18n` check covers the unused-key half, which the old site's sweep did test.

- [ ] **Step 5: Commit**

```bash
git add css/responsive.css index.html README.md
git commit -m "feat: phone and laptop layouts, and a README that matches the site"
```

- [ ] **Step 6: Hand back to Ilham for review before any merge to `main`**

Do not merge. `main` keeps serving the current site until he has seen this branch running locally and approved it.

---

## Self-Review

**Spec coverage.** §6 world structure → Tasks 3, 5. §7 visual system → Tasks 3, 4. §8.1 → Task 4. §8.2 → Task 6. §8.3 → Task 7. §8.4 → Task 8. §8.5 → Task 9. §8.6 → Task 10. §9 motion → Task 12. §10 cat → Task 11. §11 responsive → Tasks 4, 13. §13.1 GSAP → Task 12. §13.2 file layout → Tasks 3–13. §13.3 assets and CV → Task 2. §13.4 checks → Task 1, verified Task 13. §14 content source → Tasks 4, 7, 8, 9. §15 shoot.mjs → Task 2.

**Gap found and closed:** §7.4's "night darkens the sky, torches brighten, ground barely changes" had no task asserting it. Folded into Task 5 Step 1 — the terrain layers own the day/night response, and the `contrast` check runs in both themes at every task.

**Review Focus coverage.** Items 1 and 2 → Task 12 Step 1. Item 3 → Task 4 Step 1. Item 4 → Task 3 Step 1. Item 5 → Task 8 Step 1. All five are pinned to a task that owns the code.

**Proportion.** The plan is shorter than the spec and carries no function bodies — only signatures, check names, assertions and the exact content values the spec pins.

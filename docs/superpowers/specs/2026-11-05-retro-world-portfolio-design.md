# Portfolio Revamp — "The World" (retro-game × creative agency)

**Date:** 2026-11-05
**Repo:** `ilhamrafi44.github.io` (GitHub Pages, static)
**Replaces:** the entire current newspaper site (`The Bonsky Times`)

---

## 1. Intent

Muhammad Ilham Rafiannandha ("Bonsky") is a Senior Full Stack Engineer in Jakarta.
The current site is a newspaper pastiche. It works, but he wants a different thing:
a retro-game world with the craft of a creative-agency site, that a recruiter can
still read in seven seconds.

The whole brief rests on a tension he named himself: **it has to be a game, and it
has to be readable by someone who skims.** Everything in this document exists to
stop those two from killing each other.

### The resolution

Research (see §12) says a recruiter spends ~7 seconds and looks at six things:
name, current title, current company + dates, previous title, previous company +
dates, education. An RPG character sheet contains exactly those six fields.

So the recruiter-optimal layout *is* the game-native layout. We are not
compromising between them — the concept supplies the answer.

---

## 2. Goals

1. A recruiter who gives it 7 seconds leaves knowing: who he is, what he is now,
   where he's been, what he builds with, and where the CV PDF is.
2. A visitor who gives it 3 minutes travels through a world and enjoys it.
3. Every project he has shipped is on the page and reachable.
4. Works on a phone as well as a laptop — not "doesn't break", but *designed* for both.
5. Motion is substantial and continuous, micro and macro.
6. The cat survives the rewrite.

## 3. Non-goals

- Not a playable game. No win/lose, no controls to learn, no scroll-jacking.
- Not a CMS, blog, or build pipeline.
- Not a framework rewrite. Still plain HTML/CSS/JS on GitHub Pages.
- Not a single-page-app with routing.

## 4. Anti-goals (what makes this a failure even if it ships)

- **A recruiter can't find the facts.** If the game wins over the content, it failed.
- **Content that only exists after JavaScript runs.** Decoration may be JS. Information may not.
- **Motion the visitor has to wait for.** Nothing may gate reading on an animation finishing.
- **Pixel font in body copy.** It reads as a toy and people give up by the second sentence.
- **A phone version that is the desktop one with things hidden.** Phone is a first-class layout.
- **Dates that look wrong.** See §9.5 — the overlapping-role problem must be solved visibly.

---

## 5. Constraints

| Constraint | Source | Note |
|---|---|---|
| Static files only, no build step | existing repo, user confirmed | GitHub Pages serves the directory as-is |
| No package manager, no node_modules in repo | existing repo convention | libraries come from CDN with pinned versions |
| Bilingual ID / EN | existing site, carried forward | two editions, not one machine-translated twice |
| Light + dark | existing site, carried forward | reframed as day/night, see §7.4 |
| Must degrade without JS | **anti-goal** above | all content in initial HTML |
| `prefers-reduced-motion` honoured | accessibility floor | not optional |
| WCAG AA contrast on all body text | accessibility floor | the current site has a dark-mode failure; don't repeat it |

---

## 6. The concept: one world, seen in cross-section

The page is a single vertical slice of a 2D side-view world, the way Terraria
renders terrain: sky at the top, a grass line, then dirt, stone, and the deep.

**Scrolling down is digging down.** This is the organising metaphor and it has to
earn its place at every section, not just the first.

It earns it best at the career timeline: **deeper = older**, exactly like
geological strata. That section is the reason the metaphor is worth having.

```
  ░░░░ SKY ░░░░        WORLD 1 · SURFACE     who he is, the character sheet
  ▓▓▓▓ GRASS ▓▓▓▓      WORLD 2 · WORKSHOP    the arsenal (tech stack)
  ▒▒▒▒ DIRT ▒▒▒▒       WORLD 3 · THE DIRT    war stories (3 deep case studies)
  ▒▒▒▒ DIRT ▒▒▒▒       WORLD 4 · THE MINES   shipped & live (every project)
  ████ STONE ████      WORLD 5 · STRATA      chronology — deeper is older
  ████ DEEP  ████      WORLD 6 · CORE        contact, colophon
```

The ground is continuous. There are no section boundaries that look like a
normal website's `<section>` stack; the terrain just changes material.

---

## 7. Visual system

### 7.1 Palette

Mario's legibility (bright sky, hard black outlines, saturated accents) with
Terraria's materials (earth, stone, ore, torchlight).

```
--sky-hi    #4A90E2   sky, top of page
--sky-lo    #8FD3F4   sky, horizon
--grass     #4FA64F   --grass-lit #6FD66F
--dirt      #7B5230   --dirt-dk   #5A3A20
--stone     #4A4652
--deep      #2A2630
--ink       #141019   outlines + text on light
--cream     #FFF6E5   panels + text on dark
--gold      #FFC700   primary accent, coins, CTA
--torch     #FF8C1A   secondary accent, warmth
--ore-cyan  #5BC8D8   links, "live" markers
--ore-mag   #E8A0FF   rarer accent
```

Hard rule: **every panel carrying body text is `--cream` on dark ground or
`--ink` on light ground.** Accent colours are for chrome, never for paragraphs.
The current site fails AA in dark mode because a muted token flipped with the
theme while its surface didn't — do not reintroduce that pattern. Any panel that
inverts gets its own explicit text colour, not a theme-flipping token.

### 7.2 Typography — the single most important decision

| Role | Face | Why |
|---|---|---|
| HUD, labels, numbers, small caps chrome | **Press Start 2P** | the retro signal, used only where it's 6–9px and short |
| Display headings | **Archivo Black** | chunky enough to read as "game poster", legible at any size |
| Body copy, project text, everything a human reads in sentences | **Space Grotesk** (or Inter) | a real text face |

**Pixel type never sets a sentence.** This is the rule that lets the site be a
game and still be readable. If a builder finds themselves putting Press Start 2P
on a paragraph, the design is being violated.

### 7.3 Form language

- 3–4px hard black outlines on panels and sprites. No soft shadows anywhere.
- Hard offset shadows (`6px 6px 0`), zero blur.
- Blocky, grid-aligned geometry. Nothing is a rounded card.
- Pixel art is drawn as inline SVG, not raster — it scales and recolours with the theme.

### 7.4 Day / night instead of light / dark

The theme toggle is a sun/moon in the HUD. Night darkens the sky and the
torches get brighter; the ground layers barely change because they are already
dark. The character sheet panel stays cream in both modes — the most important
content never changes contrast.

Default follows `prefers-color-scheme`; the choice persists in `localStorage`.

---

## 8. Information architecture

### 8.1 WORLD 1 — Surface (the 7-second panel)

Above the fold on both phone and laptop, with no scrolling, the character sheet
shows all six recruiter facts plus two developer-specific ones:

```
◆ CHARACTER SHEET                              SAVE 01
┌──────────┬────────────────────────────────────────┐
│  photo   │  ILHAM RAFIANNANDHA              ← 1   │
│  LV. 6   │  [Senior Full Stack Engineer]    ← 2   │
│  TAHUN   │  ▸ OPEN TO WORK          (see below)   │
│          │  NOW   PT Surya Bestari Lestari  ← 3   │
│          │        · SBLNET      DES 2025 →        │
│          │  PREV  PT Cashlez     MAR–DES 2025 ← 4,5│
│          │  PREV  PT Cyber Lab · Lead  2023–2025  │
│          │  EDU   Univ. Darma Persada  2018–2023 ←6│
├──────────┴────────────────────────────────────────┤
│  ▸ EQUIPPED   Java/Spring · Next.js · React ·     │
│               PostgreSQL · Go · Docker · +12      │
├───────────────────────────────────────────────────┤
│  [▶ Lihat Project]   [↓ Unduh CV (PDF)]           │
└───────────────────────────────────────────────────┘
```

**Availability badge — DECIDED (Ilham, 2026-11-05): explicit `OPEN TO WORK`.**
It renders as a prominent badge, not a muted line. He was told the page is public
and his current employer can see it, and chose the explicit form anyway. It gets a
reserved slot in the layout from the first build so the above-the-fold test in §11
is run with it present, not retrofitted.

This panel is the first thing in the DOM after the HUD. It is plain semantic
HTML and is fully readable with CSS and JS disabled.

### 8.2 WORLD 2 — Workshop (the arsenal)

The tech stack as an inventory grid. Each slot is a pixel icon; hover/tap shows
a Terraria-style tooltip with the item name, years, and where it was used.

The grid is `<ul>` of `<button>`s — keyboard reachable, each with a visible
label fallback so the information is not hover-only. **Hover-only content is an
accessibility failure and a phone failure simultaneously.**

Grouped by the existing eight categories: Backend, Frontend, Mobile, Data,
Infra, Network, Payments, Systems.

### 8.3 WORLD 3 — The Dirt (war stories)

Three projects, deep. Each gets: **the problem → the decision he made → the part
that was hard → what it does now.** Reviewers say they want reasoning, not feature
lists.

**The three (builder's call, 2026-11-05 — Ilham to override if he disagrees):**

| # | Project | Why this one |
|---|---|---|
| 1 | **SBLNET** (PT Surya Bestari Lestari) | the current role and the deepest system — 27 modules, 8 databases, money as integer cents, FreeRADIUS/MikroTik provisioning |
| 2 | **Cashlez** reconciliation | the "being wrong is expensive" story — two-stage reconciliation, discrepancy detection, disbursement |
| 3 | **Taman Safari** gate ticketing | the only one with a physical-world failure mode — QR/barcode at a gate, thermal printing, forged-ticket rejection |

They were chosen to be *different kinds* of hard: architectural scale, financial
correctness, and hardware-at-the-edge. Three variations on "big backend" would
waste the section.

#### Source of substance — resolved

Ilham's answer to "there are no outcome numbers anywhere" was *"lu karang aja"*
(make them up). **We are not inventing metrics, and we no longer need to.** His
new CV (`~/Downloads/CV-Ilham-Rafiannandha.pdf`, 2026-11-05) turned out to carry
dense, specific, defensible technical detail for every role — material the old
site never had.

So each story is built from facts he can defend in an interview:

- *SBLNET:* 27-module Spring Modulith monolith, hexagonal/DDD, 8 PostgreSQL
  databases with per-context ACID, money stored as integer cents, double-entry GL,
  pluggable multi-gateway payments (Duitku + host-to-host BRI BRIVA), HMAC-verified
  idempotent callbacks, automated dunning and auto-isolation, FreeRADIUS AAA +
  MikroTik PPPoE with CoA disconnect.
- *Cashlez:* two-stage reconciliation (third-party settlement → bank mutation →
  back-office), automated discrepancy detection for disputes and
  missing-in-bank/missing-in-back-office, disbursement and deduction modules.
- *Taman Safari:* ticketing site + back office + React Native (Expo) gate-checker
  with QR/barcode scanning, thermal printing and forged-ticket rejection.

**Rule for the builder: every sentence must trace to the CV or the existing site.**
Architecture and mechanism are fair game and are what makes these stories good.
Business metrics — subscriber counts, transaction volumes, uptime, throughput —
are *not* invented. Where a number would genuinely strengthen a story, the copy
leaves a visible `{{ANGKA: …}}` placeholder for Ilham to fill, and the page ships
without it rather than with a fabricated one.

Reason, stated once: a made-up number on a portfolio is a question in an interview
he cannot answer. The risk lands on him, not on the page.

Rendered as excavated chambers in the dirt layer: a framed cut-away with the
screenshot inside, torch-lit.

### 8.4 WORLD 4 — The Mines (everything shipped)

**All ~25 products, per Ilham's decision (2026-11-05)** — not just the 16 with a
public URL. His CV claims "25+ products shipped"; this section is what makes that
claim checkable instead of decorative.

Rendered as ore veins in the stone: a dense but scannable grid. Hierarchy, not
omission — the three from World 3 are larger and link upward; the rest are uniform.

**Status vocabulary.** Every tile carries one, so a tile without a link never
looks broken:

| Status | Meaning | Clickable |
|---|---|---|
| `LIVE` | public URL, reachable | yes |
| `ARCHIVED` | shipped, no longer reachable | no |
| `PRIVATE` | client-owned, no public URL | no |
| `APP` | shipped to an app store | store link if one exists |
| `SOURCE` | open source | repo link |

Entries with no public URL, from the CV: ProSpark LMS (`PRIVATE`), Nghbr app
(`APP`), Remedi app (`APP`), Spectro job portal (`PRIVATE`), SmartHajj (`PRIVATE`),
Elteyba Go (`LIVE`, login wall), newstvri.com (`ARCHIVED`), mfu-macos (`SOURCE`).

**Tiles with no screenshot get a pixel-art "unexcavated block"** — a sealed ore
vein in the stone — rather than an empty frame. This also absorbs the two dead
links below, so the missing image becomes part of the world instead of a hole.

**The two dead links — RESOLVED (builder's call):** both stay on the page, marked
`ARCHIVED`, not linked.
- `aerocam.co.id` — fully down, no HTTP or HTTPS response.
- `dpupr.mubakab.go.id` — TLS certificate expired 12 Oct 2026, so a visitor gets a
  browser security interstitial. It is a government site; he cannot fix it.

Linking either one sends a recruiter to a dead end or a red warning screen.
Removing them deletes real work from his record. `ARCHIVED` is the honest third
option. Ilham can override.

### 8.5 WORLD 5 — Strata (chronology)

The payoff of the metaphor. Eleven roles as rock layers; deeper is older. Each
layer is labelled with the date range on the left edge, the role and employer
inside.

**The overlap problem.** Several roles run concurrently — ProSpark (Jul–Aug 2024),
Taman Safari (Nov 2023–Jan 2024), Arka (Sep–Dec 2023) and Nghbr (Jun–Aug 2023) all
fall inside Cyber Lab (Jun 2023–Feb 2025). On a flat list this reads as sloppiness
or dishonesty to a recruiter. The design solves it: a **main seam** running
continuously down the left for employment, and **side veins** branching right for
concurrent contract/freelance work. The visual says "these were at the same time,
on purpose" without a footnote.

Also in this world: education and the two 2022 speaking engagements.

### 8.6 WORLD 6 — Core (contact)

Email, LinkedIn, GitHub, location. The CV download repeated. Colophon.
The cat is asleep here.

---

## 9. Motion design

### 9.1 The rule that governs all of it

> **Animation decorates arrival. It never gates reading.**

Concretely:
- Every element's resting state is its *visible* state. Animations move *from* an
  offset *to* the resting state. If the script never runs, everything is already correct.
- No element starts at `opacity: 0` in CSS unless a `.js` class on `<html>` is
  present — the current site already does this correctly and it is worth keeping.
- No scroll-jacking, no scroll hijacking, no forced section snapping.
- Nothing animates for longer than ~600ms on content.
- `prefers-reduced-motion: reduce` → all transform/opacity choreography off,
  the cat stops walking, parallax stops. Content unaffected.

### 9.2 Macro motion (scroll-driven, GSAP ScrollTrigger)

| What | Behaviour |
|---|---|
| Terrain parallax | sky, grass, dirt, stone move at different rates — the depth cue that sells "digging" |
| HUD world indicator | updates `WORLD 1 · SURFACE` → `WORLD 5 · STRATA` as you pass each layer |
| Depth meter | an optional `-240m` style readout in the HUD, tied to scroll |
| The cat | walks the terrain, position driven by scroll progress (see §10) |
| Torches | fade in as the sky light falls away |
| Ore veins | glint as they enter the viewport |
| Strata reveal | each rock layer slides up a few px and settles |

### 9.3 Micro motion (CSS mostly, GSAP where it needs sequencing)

- `?` blocks bounce on hover, "hit" and pop a tooltip on click
- Coins rotate (sprite-flip, steps() easing — not a smooth spin; it must look 8-bit)
- Buttons depress into their shadow on `:active`
- Inventory slots light up and raise a tooltip
- Counters count up once, when first scrolled into view
- Link hovers shift the hard shadow rather than changing colour

### 9.4 Easing discipline

Retro motion is **not** smooth. Sprite-like movement uses `steps()`; physical
movement (bounce, settle) uses a spring-ish cubic-bezier. Mixing them randomly
is what makes retro pastiches look cheap. Rule: anything representing a *sprite*
steps; anything representing a *camera or panel* eases.

---

## 10. The cat

Non-negotiable, carried over from the current site. Her name is Cimol; she is orange.

- Drawn as **inline SVG sprites**, not emoji and not raster. Four poses minimum:
  `walk`, `sit`, `sleep`, `taunt`.
- She walks the ground line, x-position driven by scroll progress, so scrolling
  down "moves" her through the world.
- The **Duck Hunt payload**: the gag that makes Duck Hunt memorable is the dog
  that pops up and laughs at you. Cimol inherits it — she surfaces and taunts at
  a chosen moment (candidate: the `NaN known bugs` joke, or a 404). This is why
  Duck Hunt is a layer across the whole design rather than a fourth direction.
- With reduced-motion on, she is present but still.

---

## 11. Responsiveness

Two designed layouts, not one layout that survives.

**Phone (≤ 720px)**
- Character sheet is full-width, photo and name stack, stats remain a list.
- All six recruiter facts still above the fold. This is the hard test of the phone design.
- Inventory grid: 4 columns. Tooltips become tap-to-expand inline panels, never hover.
- Terrain parallax reduces to two layers — more than that costs more than it gives on a phone.
- The cat walks a shorter path.

**Laptop (≥ 1024px)**
- Character sheet beside sky furniture; inventory panel can sit to the side.
- Full parallax depth.

**Between:** fluid. `clamp()` for type, no fixed breakpoint jumps in font size.

Touch targets ≥ 44px. No horizontal scroll at any width — the current site gets
this right and there is a check for it in §13.

---

## 12. Research findings that shaped this

| Finding | Effect on the design |
|---|---|
| Recruiters spend ~7s; 80% on six fields | §8.1 exists because of this |
| ATS never touches a portfolio site — it parses uploaded CV files | "ATS friendly" is a property of the **PDF**, not this site. The site's only job is to make the PDF easy to find. Removes a constraint we thought we had. |
| 92% of recruiters say their ATS does not auto-reject on format | the "75% rejected by robots" figure traces to a defunct vendor with no published method |
| ATS parsing fails on: text inside images, tables, multi-column | applies to the CV PDF only. Keep it single-column, real text. |
| Reviewers report heavy animation makes content hard to find, and they skip rather than ask | §9.1 — the rule that animation never gates reading |
| Reviewers want reasoning and decisions, not feature lists | §8.3 structure: problem → decision → hard part → outcome |
| Reviewers click 1–2 links | three featured projects get depth; the rest stay listed (Ilham's call) |

**Evidence quality, honestly:** the 7-second study sampled 30 recruiters and other
sources put the range at 6–11 seconds. Most ATS statistics come from vendors with an
incentive. The *pattern* — very fast, very few items — is consistent across sources;
the specific numbers are indicative only. The design depends on the pattern, not the numbers.

Sources: [TheLadders eye-tracking](https://resumeheatmap.com/eye-tracking-study) ·
[HR.com ATS auto-reject](https://www.hr.com/en/app/blog/2026/04/ats-rejection-myth-debunked-92-of-recruiters-confi_mntajhyq.html) ·
[Enhancv, how ATS works](https://enhancv.com/blog/what-is-ats/) ·
[devbio.me](https://devbio.me/blogs/developer-portfolio-guide-2026) ·
[Refactor Talent](https://refactortalent.com/developer-portfolio-projects-that-impress/) ·
[Webdesigner Depot](https://webdesignerdepot.com/the-death-of-the-portfolio-and-what-to-do-before-youre-left-behind/)

---

## 13. Technical decisions

### 13.1 Animation library: GSAP + ScrollTrigger. One engine, not two.

Ilham asked for GSAP and anime.js to be researched. The finding:

- **GSAP became 100% free on 30 April 2025** under Webflow, including the formerly
  paid Club plugins — **ScrollTrigger is now free for commercial use.** That removes
  the only reason the project would have avoided it.
- ScrollTrigger is what this design needs; it is the piece that drives the terrain
  parallax, the HUD world indicator, and the cat's walk.
- **anime.js is not added.** It would do a subset of what GSAP already does. Two
  libraries for one job is dead weight — one engine, plus plain CSS for hovers
  and `:active` states.

Loaded from CDN with an exact pinned version, no build step:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
```

Budget: ~34KB gzip for both. Acceptable for what they do. *Builder must verify the
exact version exists on the CDN before committing.*

### 13.2 File layout

Keep the existing shape — it is already right, and the reason the current site is
maintainable:

```
index.html          markup + inline SVG sprite sheet (cat poses, icons, terrain tiles)
css/tokens.css      palette, type scale, spacing
css/world.css       terrain, parallax layers, sky/day-night
css/panels.css      character sheet, inventory, tooltips, buttons
css/worlds.css      per-section layout
css/responsive.css  phone + laptop layouts
js/i18n.js          two editions
js/app.js           language, theme, HUD, reveal fallback
js/motion.js        GSAP timelines + ScrollTrigger (the only file that needs GSAP)
assets/             photo, CV PDF, project screenshots
tools/shoot.mjs     screenshot re-capture (see §15 — currently broken)
```

`js/motion.js` is separate so that if GSAP fails to load, nothing else breaks.

### 13.3 Images and the CV file

- New photo: `/home/void/Downloads/Foto-CV-Ilham-Rafiannandha.jpg` (1040×1300).
  Needs `-sm` for phones plus WebP; original stays as JPEG fallback. No background
  removal — the design frames it in a hard-bordered rectangle.
- Project screenshots: 14 exist in `assets/shots/`. All get used; tiles without one
  get the unexcavated-block treatment (§8.4).

#### The CV PDF — DECIDED (Ilham, 2026-11-05)

Ship **`~/Downloads/CV-Ilham-Rafiannandha.pdf`** (2026-11-05, single column, real
text, "Dec 2025 – Present"). It replaces the committed
`assets/Muhammad-Ilham-Rafiannandha-CV.pdf`, which says the SBL role ended
Jul 2026 and would contradict the character sheet.

It is also the better artifact on its own terms: single-column, no tables, no
text-in-images — the three things §12 says actually break ATS parsing.

Two things the builder must handle:
1. **The old file is deleted, not left in place.** A stale CV at a guessable path
   is worse than no CV. Keep the same public filename so any existing link survives.
2. **It contains his phone number** (+62 877-…). He was told, and accepted. No
   street address — that was only in the old file, which is going away.

### 13.4 Checks before "done"

Not a test suite — a static site doesn't earn one — but these are mechanical and must pass:

1. No horizontal scroll at 320, 390, 768, 1024, 1440px.
2. Every text/background pair meets WCAG AA, in **both** day and night.
3. JS disabled → all content readable, nothing at `opacity: 0`.
4. `prefers-reduced-motion: reduce` → no transform/opacity choreography runs.
5. Zero console errors.
6. Every i18n key present in both editions, no key unused, no key missing.
7. All internal asset links resolve; all external project links return 2xx.

Checks 1, 2, 5, 6, 7 are scriptable and were already run against the old site —
reuse that approach.

---

## 14. Content

Copy is **rewritten**, not ported. The newspaper voice ("All the code that's fit
to ship") belongs to the old concept.

Both editions keep the spirit the current site established and which is worth keeping:
EN is dry and understated; ID is stand-up — longer setup, the beat on the last few
words, local references. They are two editions, not one translated twice.

### Source of truth for facts

**`~/Downloads/CV-Ilham-Rafiannandha.pdf` (2026-11-05) outranks the current site**
wherever they disagree. It is newer, and it is richer — it carries per-role technical
detail the site never had, which is what World 3 is built from.

Structure in the new CV: **7 roles under Work Experience** (SBL, Cashlez, Cyber Lab,
Remedi, Elteyba, Taiba, TVRI internship) and **7 under Freelance & Independent
Projects** (ProSpark, Taman Safari/GlobalTix, Spectro-ArkaLearn, Nghbr, Itoya, DPUPR,
mfu-macos). The old site's flat list of 11 is superseded — that count conflated the
two tracks, which is the root of the overlapping-dates problem in §8.5.

Carried over unchanged: education with GPA, the two 2022 speaking engagements, the
eight tech categories.

**Minor accuracy note for Ilham, not a blocker:** a few items in the current site's
kit list (Rust, Kotlin Multiplatform, SvelteKit, TimescaleDB, Grafana) appear in no
role on either CV. They may well be real; they just have nothing behind them on the
page. The arsenal tooltips in §8.2 show "used on", so anything with no project
attached will visibly have an empty slot. Worth him pruning or placing.

---

## 15. Questions — all resolved 2026-11-05

### Answered by Ilham

| # | Question | Answer |
|---|---|---|
| 1 | Which CV PDF ships? | The new one in `~/Downloads` (§13.3) |
| 2 | World 4: 16 URLs or all ~25 products? | **All ~25**, with a status marker on each (§8.4) |
| 3 | Availability badge on the panel? | **Yes, explicit `OPEN TO WORK`** (§8.1) |
| 4 | Outcome numbers for World 3? | He said "make them up". **We don't** — his new CV supplied real substance instead (§8.3) |

### Answered by evidence, no longer open

- **Overlapping roles.** Confirmed. His new CV already splits them: 7 entries under
  *Work Experience*, and ProSpark / Taman Safari (client: GlobalTix) / Spectro-ArkaLearn
  / Nghbr under *Freelance & Independent Projects*. That is exactly the main-seam +
  side-veins structure in §8.5.
  **Caveat the builder must respect:** the CV also tags Cashlez, Cyber Lab, Elteyba
  and Taiba as "(Contract)". The seam must therefore be drawn on **concurrency**, not
  on contract status — splitting by contract status would leave only SBL and the 2017
  internship on the main seam and collapse the section.
- **GSAP CDN version.** `gsap/3.13.0/gsap.min.js` and `ScrollTrigger.min.js` both
  return 200 on cdnjs. Verified.
- **Dead links.** Diagnosis confirmed; disposition decided in §8.4 (`ARCHIVED`, unlinked).

### Builder's calls, flagged for Ilham to override

- **The three World 3 projects:** SBLNET, Cashlez, Taman Safari (§8.3, with reasoning).
- **Dead links stay, marked `ARCHIVED`** rather than deleted or linked (§8.4).
- **`tools/shoot.mjs` gets fixed** as part of this work — it currently imports an
  absolute `/Users/ilham/...` playwright-core path and its documented resize step uses
  macOS `sips`, so it runs on exactly one machine despite being committed as
  "reproducible". Fix: resolve `playwright-core` as a bare specifier, write into
  `assets/shots/` directly, and replace `sips` with something portable. Small, and the
  screenshots are now load-bearing for World 4.
- **Branching:** work happens on a feature branch. `main` keeps serving the current
  newspaper until Ilham approves the replacement, so a live portfolio is never
  half-rebuilt during a job hunt.
- **Bilingual depth:** follows existing precedent — prose is ID/EN, technology names
  and project one-liners stay English. Doubling the i18n file for tech nouns buys nothing.
- **Arsenal tooltips:** show item name + the projects it was used on, both derivable.
  The mockup's "6 tahun · 14 produksi" was invented during mockup-making and is dropped.
  Full 51-item list stays as text chips in its eight categories; the icon grid is the
  ~16 he actually leads with.

## 16. Left to the builder

- Exact pixel-art sprite designs (cat poses, inventory icons, terrain tiles) —
  the design fixes the style and the constraints, not each drawing.
- Precise GSAP timeline values, easing curves, stagger amounts.
- The exact copy, in both editions, within the voice described in §14.
- Grid column counts per breakpoint beyond the two anchors given.
- Whether the depth meter in §9.2 is worth keeping — build it, cut it if it's noise.

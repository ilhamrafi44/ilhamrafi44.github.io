# ilhamrafi44.github.io — The Bonsky Times / Harian Bonsky

Portfolio for **Muhammad Ilham Rafiannandha** ("Bonsky"), published as a newspaper.
Live at **https://ilhamrafi44.github.io**

Static. No build step, no framework, no dependencies — GitHub Pages serves these files directly.

```
index.html        markup + the inline cat/icon <symbol> sprite
css/base.css      tokens, newsprint ground, cats, reveal
css/paper.css     newspaper furniture: folio, masthead, ticker, columns, boxes, classifieds
css/sections.css  per-section layout + responsive
js/i18n.js        two editions, 114 keys each
js/app.js         language, theme, dateline, reveal, counters, scroll cat
```

**Layout.** A newspaper, not a website with a navigation bar. Folio line, masthead with
offset-litho misregistration, ticker, a front page with a floated cut and justified serif
columns, a drop cap, an "Inside Today" index box in place of navigation, Weather, By The
Numbers, and a Corrections box. Sections run B through F with running page numbers.
Neo-brutalism supplies the weight: 3px rules, hard zero-blur shadows, flat spot colour.

**Two editions, not one translated twice.** English is dry and understated; the joke hides in
the wording. Indonesian is stand-up — long setup, short punchline, local references, and the
beat lands on the last four words. The mastheads differ (*The Bonsky Times* / *Harian
Bonsky*), the taglines differ, and the front-page headline is a different joke in each.

**Cats.** Her name is Cimol and she is orange. Every cat is inline SVG driven by CSS
transforms, and every one holds still under `prefers-reduced-motion`.

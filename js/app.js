(() => {
  'use strict';

  // Only now may CSS hide anything. If this script never runs, every word on
  // the page must still be visible — that is the whole contract.
  document.documentElement.classList.add('js');

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Private windows and blocked site data make every localStorage access
  // throw, and an unguarded throw here kills the whole script — taking the
  // language and theme controls with it. Preference is a nicety; the controls
  // working is not.
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* session only */ } },
  };

  /* ── language ───────────────────────────────────────── */
  const applyLang = (lang) => {
    const dict = window.I18N?.[lang] || window.I18N?.en || {};
    $$('[data-i18n]').forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v != null) el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(el => {
      const v = dict[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-i18n-aria]').forEach(el => {
      const v = dict[el.dataset.i18nAria];
      if (v != null) el.setAttribute('aria-label', v);
    });
    document.documentElement.lang = lang;
    if (dict['doc.title']) document.title = dict['doc.title'];
    $$('.lang__opt').forEach(o => o.classList.toggle('is-on', o.dataset.lang === lang));
    store.set('lang', lang);
  };

  /* ── day / night ────────────────────────────────────── */
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    $('meta[name=theme-color]')?.setAttribute('content', t === 'night' ? '#0E1A2E' : '#4A90E2');
    store.set('theme', t);
  };

  /* ── boot ───────────────────────────────────────────── */
  const prefersID = (navigator.language || 'en').toLowerCase().startsWith('id');
  applyLang(store.get('lang', prefersID ? 'id' : 'en'));

  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(store.get('theme', prefersDark ? 'night' : 'day'));

  $('#lang')?.addEventListener('click', () =>
    applyLang(document.documentElement.lang === 'id' ? 'en' : 'id'));
  $('#theme')?.addEventListener('click', () =>
    applyTheme(document.documentElement.dataset.theme === 'night' ? 'day' : 'night'));

  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── HUD world indicator ────────────────────────────────
     Which world you are in, updated on scroll. GSAP drives the richer
     choreography later; this is the part that must work without it. */
  const out = $('#hud-world');
  const worlds = $$('.world');
  if (out && worlds.length) {
    let ticking = false;
    const pick = () => {
      const mid = innerHeight * 0.4;
      let current = worlds[0];
      for (const w of worlds) if (w.getBoundingClientRect().top <= mid) current = w;
      const label = current.querySelector('[data-i18n$=".label"]')?.textContent?.trim();
      const name  = current.querySelector('[data-i18n$=".h"]')?.textContent?.trim();
      const next = [label, name].filter(Boolean).join(' · ').toUpperCase();
      if (next && out.textContent !== next) out.textContent = next;
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(pick); }
    }, { passive: true });
    addEventListener('resize', pick, { passive: true });
    pick();
  }
})();

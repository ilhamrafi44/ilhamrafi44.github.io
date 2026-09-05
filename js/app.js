(() => {
  'use strict';
  // Only now is it safe for CSS to hide anything: if this script never runs,
  // the page must still be fully readable.
  document.documentElement.classList.add('js');
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ── the dateline, set fresh every time the edition is opened ── */
  const setDateline = (lang) => {
    const el = $('#dateline');
    if (!el) return;
    const city = lang === 'id' ? 'JAKARTA' : 'JAKARTA';
    const d = new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    el.textContent = `${city} · ${d.toUpperCase()}`;
  };

  /* ── language ── */
  const applyLang = (lang) => {
    const dict = window.I18N[lang] || window.I18N.en;
    $$('[data-i18n]').forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-i18n-html]').forEach(el => {
      const v = dict[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    document.documentElement.lang = lang;
    document.title = lang === 'id'
      ? 'Harian Bonsky — Muhammad Ilham Rafiannandha'
      : 'The Bonsky Times — Muhammad Ilham Rafiannandha';
    $$('.lang__opt').forEach(o => o.classList.toggle('is-on', o.dataset.lang === lang));
    setDateline(lang);
    store.set('lang', lang);
  };
  applyLang(store.get('lang', (navigator.language || 'en').startsWith('id') ? 'id' : 'en'));
  $('#lang')?.addEventListener('click', () =>
    applyLang(document.documentElement.lang === 'id' ? 'en' : 'id'));

  /* ── theme ── */
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    $('meta[name=theme-color]')?.setAttribute('content', t === 'dark' ? '#111013' : '#FFE600');
    store.set('theme', t);
  };
  applyTheme(store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('#theme')?.addEventListener('click', () =>
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ── reveal ──────────────────────────────────────────────
     A sweep rather than IntersectionObserver: IO drops entries on fast
     scrolling or an anchor jump, and a missed element stays at opacity 0,
     which means the content is simply gone. */
  let pending = $$('[data-rv]');
  const sweep = () => {
    if (!pending.length) return;
    const limit = innerHeight * 0.94;
    const next = [];
    for (const el of pending) {
      if (el.getBoundingClientRect().top < limit) el.classList.add('is-in');
      else next.push(el);
    }
    pending = next;
  };

  /* ── counters ── */
  const runCount = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  let counters = matchMedia('(prefers-reduced-motion: reduce)').matches ? [] : $$('[data-count]');

  /* ── scroll edge + cat ── */
  const fill = $('.edge__fill'), rider = $('.edge__cat');
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (fill) fill.style.width = (p * 100) + '%';
    if (rider) {
      const w = rider.getBoundingClientRect().width || 54;
      rider.style.transform = `translateX(calc(${p} * (100vw - ${w + 6}px)))`;
    }
    if (counters.length) {
      const still = [];
      for (const el of counters) {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * 0.85 && r.bottom > 0) runCount(el); else still.push(el);
      }
      counters = still;
    }
    sweep();
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', onScroll);
  onScroll();

  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ── language ─────────────────────────────────────────── */
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
    $$('.lang__opt').forEach(o => o.classList.toggle('is-on', o.dataset.lang === lang));
    store.set('lang', lang);
  };

  const startLang = store.get('lang', (navigator.language || 'en').startsWith('id') ? 'id' : 'en');
  applyLang(startLang);
  $('#lang')?.addEventListener('click', () => {
    applyLang(document.documentElement.lang === 'id' ? 'en' : 'id');
  });

  /* ── theme ────────────────────────────────────────────── */
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    $('meta[name=theme-color]')?.setAttribute('content', t === 'dark' ? '#0E0E10' : '#FFE600');
    store.set('theme', t);
  };
  applyTheme(store.get('theme', prefersDark.matches ? 'dark' : 'light'));
  $('#theme')?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  /* ── mobile menu ──────────────────────────────────────── */
  const nav = $('#nav'), burger = $('#burger');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#navlinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }));

  /* ── scroll reveal ────────────────────────────────────────
     A plain sweep, not IntersectionObserver. IO drops entries when the page is
     scrolled fast or jumped to via an anchor, and a missed .reveal stays at
     opacity 0 — the content is simply gone. This checks whatever is still
     hidden on each throttled scroll frame; the list only ever shrinks. */
  let pending = $$('.reveal');
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

  /* ── stat counters ────────────────────────────────────── */
  const runCount = (el) => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const dur = 900, t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: .6 });
    counters.forEach(el => co.observe(el));
  }

  /* ── scroll progress, with a cat riding it ────────────── */
  const fill = $('.scrollbar__fill'), rider = $('.scrollbar__cat');
  const sections = $$('main section[id]');
  const links = $$('#navlinks a');
  let ticking = false;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (fill) fill.style.width = (p * 100) + '%';
    if (rider) {
      const w = rider.getBoundingClientRect().width || 56;
      rider.style.transform = `translateX(calc(${p} * (100vw - ${w + 6}px)))`;
    }

    let current = '';
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= innerHeight * 0.35) current = s.id;
    }
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    sweep();
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', onScroll);

  /* ── misc ─────────────────────────────────────────────── */
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();

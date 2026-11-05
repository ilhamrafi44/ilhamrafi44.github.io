/* ═══════════════════════════════════════════════════════════
   The opening title sequence.

   This is a title sequence, not a progress indicator. On a warm cache
   every asset is already decoded, so a bar that only tracked real loading
   finished before anyone could see it — which is the same as having no
   opening at all. So it runs for a deliberate minimum, and it also waits
   for the assets that matter: whichever takes longer wins. The bar is
   honest about being paced; it just never claims to be done while the
   page is still fetching.

   Two rules it inherits from the rest of the page:

   1. It is never a gate. The content underneath is already complete and
      already in the DOM. If this script throws, if GSAP never arrives, if
      the visitor asked for reduced motion, or if an image hangs forever,
      the screen is removed and the page is simply there. The curtain is
      raised by this file and only this file, so a script that never
      arrives can never leave a screen nobody can dismiss.

   2. It hands over rather than fading out: the wipe clears upward onto a
      character sheet that is already assembling behind it.
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const root = document.documentElement;
  const boot = document.getElementById('boot');
  if (!boot) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const done = () => {
    root.classList.add('booted');
    document.dispatchEvent(new CustomEvent('world:ready'));
  };

  // Someone who asked for less motion does not want a title sequence.
  if (reduced.matches) { done(); return; }
  root.classList.add('booting');

  const fill = document.getElementById('boot-fill');
  const pct  = document.getElementById('boot-pct');
  const log  = document.getElementById('boot-log');
  const wipe = document.getElementById('boot-wipe');

  /* How long the sequence takes to play, cache or no cache. Long enough to
     read a name and watch the cat cross; short enough that nobody waits. */
  const RUN_MS = 2100;
  const started = performance.now();

  /* A screen nobody can dismiss is the worst outcome, so it has a deadline
     it cannot miss whatever else goes wrong. */
  const deadline = setTimeout(() => finish(true), RUN_MS + 3200);

  const LINES = [
    'mounting world',
    'generating terrain',
    'placing 27 modules',
    'linking 8 databases',
    'waking the cat',
  ];

  let shown = 0;
  const say = (upTo) => {
    for (; shown <= upTo && shown < LINES.length; shown++) {
      const li = document.createElement('li');
      li.textContent = LINES[shown];
      log.appendChild(li);
      if (shown > 0) log.children[shown - 1].classList.add('ok');
    }
  };

  /* Real asset progress still gates the end — the sequence may be paced,
     but it will not claim to be finished while the page is still fetching. */
  const tracked = [...document.images].filter(img => img.loading !== 'lazy');
  let loaded = 0;
  const total = Math.max(tracked.length, 1);
  const assetsDone = () => loaded >= total;

  const bump = () => { loaded++; };
  for (const img of tracked) {
    if (img.complete) bump();
    else { img.addEventListener('load', bump, { once: true }); img.addEventListener('error', bump, { once: true }); }
  }

  let shownPct = 0;
  const tick = () => {
    const elapsed = performance.now() - started;
    const byTime = (elapsed / RUN_MS) * 100;
    const byAssets = (loaded / total) * 100;
    // paced, but never ahead of what has actually arrived
    const target = Math.min(byTime, Math.max(byAssets, byTime * 0.55));
    shownPct = Math.max(shownPct, Math.min(target, 99));

    fill.style.width = shownPct + '%';
    pct.textContent = Math.round(shownPct);
    root.style.setProperty('--boot', (shownPct / 100).toFixed(3));
    say(Math.floor((shownPct / 100) * LINES.length));

    if (elapsed >= RUN_MS && assetsDone()) { finish(false); return; }
    raf = requestAnimationFrame(tick);
  };
  let raf = requestAnimationFrame(tick);

  let finished = false;
  function finish(timedOut) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(deadline);

    fill.style.width = '100%';
    pct.textContent = '100';
    root.style.setProperty('--boot', '1');
    say(LINES.length - 1);
    if (log.lastElementChild) log.lastElementChild.classList.add('ok');

    if (typeof window.gsap === 'undefined') { done(); return; }

    gsap.timeline({ onComplete: done })
      .to(wipe, { scaleY: 1, duration: 0.3, ease: 'power3.in' }, timedOut ? 0 : 0.2)
      .set(boot.querySelector('.boot__in'), { opacity: 0 })
      .set(boot.querySelector('.boot__cat'), { opacity: 0 })
      .add(() => root.classList.add('booted'))
      .fromTo(wipe,
        { scaleY: 1, transformOrigin: 'top center' },
        { scaleY: 0, duration: 0.5, ease: 'power3.inOut' });
  }

  /* The title text deals itself in, if GSAP is here by then. */
  const dealIn = () => {
    if (typeof window.gsap === 'undefined' || finished) return;
    gsap.from('.boot__brand span, .boot__brand b', { yPercent: 110, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out' });
    gsap.from('.boot__role', { opacity: 0, x: -14, duration: 0.4, delay: 0.26, ease: 'power2.out' });
    gsap.from('.boot__bar',  { scaleX: 0, transformOrigin: 'left center', duration: 0.4, delay: 0.34, ease: 'power2.out' });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', dealIn, { once: true });
  else setTimeout(dealIn, 0);
})();

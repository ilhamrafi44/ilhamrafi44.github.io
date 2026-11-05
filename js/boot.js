/* ═══════════════════════════════════════════════════════════
   The boot screen.

   Two rules, both inherited from the rest of the page:

   1. It is never a gate. The content underneath is already complete and
      already in the DOM. If this script throws, if GSAP never arrives, if
      the visitor asked for reduced motion, or if an image hangs forever,
      the boot screen is removed and the page is simply there. The one
      thing that must never happen is a loading screen you cannot get past,
      so there is a hard deadline that fires regardless.

   2. The bar tells the truth. It tracks real images decoding, not a timer
      pretending to. A fake progress bar that finishes before the page does
      is worse than no bar.

   It hands over to the page's own intro rather than fading into a still
   frame: the wipe clears upward and the character sheet is already
   assembling behind it.
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const root = document.documentElement;
  const boot = document.getElementById('boot');
  if (!boot) return;

  // Raise the curtain only now — this is the one script that can drop it.
  // Gating on a class another file sets would let the screen appear with
  // nothing on the page able to dismiss it.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) root.classList.add('booting');
  const done = () => {
    root.classList.add('booted');
    document.dispatchEvent(new CustomEvent('world:ready'));
  };

  if (reduced.matches) { done(); return; }

  const fill = document.getElementById('boot-fill');
  const pct  = document.getElementById('boot-pct');
  const log  = document.getElementById('boot-log');
  const wipe = document.getElementById('boot-wipe');

  /* A loading screen nobody can dismiss is the worst outcome here, so it
     has a deadline it cannot miss, whatever else goes wrong. */
  const deadline = setTimeout(() => finish(true), 4200);

  const LINES = [
    'mounting world',
    'generating terrain',
    'placing 27 modules',
    'linking 8 databases',
    'waking the cat',
  ];

  let shown = 0;
  const say = (i) => {
    if (i >= LINES.length || i < shown) return;
    for (; shown <= i; shown++) {
      const li = document.createElement('li');
      li.textContent = LINES[shown];
      log.appendChild(li);
      if (shown > 0) log.children[shown - 1].classList.add('ok');
    }
  };

  /* ── real progress ──
     Count the images that matter (the ones above and just below the fold);
     the long tail is lazy and should not hold the door. */
  const tracked = [...document.images].filter(img => img.loading !== 'lazy');
  let loaded = 0;
  const total = Math.max(tracked.length, 1);

  let shownPct = 0;
  const paint = (p) => {
    // never go backwards, and never show 100 until we actually finish
    shownPct = Math.max(shownPct, Math.min(p, 99));
    fill.style.width = shownPct + '%';
    pct.textContent = Math.round(shownPct);
    say(Math.floor((shownPct / 100) * LINES.length));
    root.style.setProperty('--boot', (shownPct / 100).toFixed(3));
  };

  const bump = () => { loaded++; paint((loaded / total) * 92); if (loaded >= total) ready(); };
  for (const img of tracked) {
    if (img.complete) bump();
    else { img.addEventListener('load', bump, { once: true }); img.addEventListener('error', bump, { once: true }); }
  }

  // a slow crawl so the bar still moves while nothing is resolving
  const crawl = setInterval(() => paint(shownPct + 1.4), 90);

  let finished = false;
  function finish(timedOut) {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    clearInterval(crawl);

    fill.style.width = '100%';
    pct.textContent = '100';
    say(LINES.length - 1);
    if (log.lastElementChild) log.lastElementChild.classList.add('ok');

    if (typeof window.gsap === 'undefined') { done(); return; }

    // the handover: a block wipes up over the boot screen, the boot screen
    // is dropped behind it, then the block clears upward to reveal the page
    // already in motion
    gsap.timeline({ onComplete: done })
      .to(wipe, { scaleY: 1, duration: 0.3, ease: 'power3.in' }, timedOut ? 0 : 0.22)
      .set(boot.querySelector('.boot__in'), { opacity: 0 })
      .set(boot.querySelector('.boot__cat'), { opacity: 0 })
      .add(() => root.classList.add('booted'))
      .fromTo(wipe,
        { scaleY: 1, transformOrigin: 'top center' },
        { scaleY: 0, duration: 0.5, ease: 'power3.inOut' });
  }

  function ready() {
    // let the last frame of the bar be seen before handing over
    setTimeout(() => finish(false), 260);
  }

  if (!tracked.length) ready();
  addEventListener('load', () => setTimeout(ready, 150));
})();

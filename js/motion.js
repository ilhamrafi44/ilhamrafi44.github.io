/* ═══════════════════════════════════════════════════════════
   Scroll choreography. The only file that touches GSAP.

   One rule governs everything here: animation decorates arrival, it never
   gates reading. Every element's resting state is its visible state, so
   this file moves things FROM an offset TO where they already are. If GSAP
   never loads, or the visitor asked for less motion, nothing below runs and
   the page is simply still — not broken, not blank.

   Nothing pins. Nothing scrubs the page itself. The scrollbar always means
   what it says.
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
  if (reduced.matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── macro: the terrain drifts, so the ground reads as depth ──
     Decoration only. The world backgrounds themselves never move, which is
     why no amount of this can change what the text is read against. */
  $$('.world').forEach((world) => {
    const layer = $('.terrain', world);
    if (!layer) return;
    const far = world.classList.contains('world--surface') ? 34 : 18;
    gsap.fromTo(layer, { y: -far }, {
      y: far, ease: 'none',
      scrollTrigger: { trigger: world, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });

  /* Sun and clouds drift further than the ground behind them. */
  $$('.cloud').forEach((cloud, i) => {
    gsap.to(cloud, {
      x: i % 2 ? -70 : 70, ease: 'none',
      scrollTrigger: { trigger: cloud.closest('.world'), start: 'top bottom', end: 'bottom top', scrub: 1.1 },
    });
  });

  /* ── macro: Cimol walks the world as you scroll ──
     Her x-position is scroll progress, so moving down the page moves her
     along the ground. steps() because she is a sprite, not a camera. */
  const rider = $('.cat--rider');
  if (rider) {
    gsap.to(document.documentElement, {
      '--walk': 1, ease: 'steps(60)',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }

  /* ── micro: panels arrive ──
     from an offset to their resting state, which is where the CSS already
     put them. A missed trigger leaves the element exactly where it belongs. */
  const arrive = (sel, opts = {}) => $$(sel).forEach((el) => {
    gsap.from(el, {
      y: opts.y ?? 22, opacity: 0, duration: 0.42, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // NOT the character sheet. It is above the fold on load, so it does not
  // "arrive" — and animating it from an offset pushed the CV button below the
  // fold on a 320px screen for the length of the tween, which is exactly the
  // failure the rule above exists to prevent.
  arrive('.inv__item', { y: 14 });
  arrive('.kitgrp');
  arrive('.chamber', { y: 26 });
  arrive('.ore-tile', { y: 16 });
  arrive('.seam', { y: 18 });
  arrive('.vein', { y: 12 });
  arrive('.post__c', { y: 14 });
  arrive('.lastcall', { y: 22 });
  arrive('.bugbox', { y: 22 });

  /* Ore glints as it enters, on top of the CSS idle shimmer. */
  $$('.ore').forEach((ore) => {
    gsap.from(ore, {
      scale: 0.4, opacity: 0, duration: 0.5, ease: 'back.out(2)',
      scrollTrigger: { trigger: ore, start: 'top 94%', once: true },
    });
  });

  /* Torches catch as the sky light falls away. */
  $$('.torch').forEach((torch) => {
    gsap.from(torch, {
      scaleY: 0, transformOrigin: 'bottom center', duration: 0.4, ease: 'power2.out',
      scrollTrigger: { trigger: torch, start: 'top 95%', once: true },
    });
  });

  /* ── micro: the equipped chips deal themselves out ── */
  const kit = $('.kit');
  if (kit) {
    gsap.from($$('li', kit), {
      y: 10, opacity: 0, duration: 0.3, stagger: 0.035, ease: 'power2.out',
      scrollTrigger: { trigger: kit, start: 'top 92%', once: true },
    });
  }

  /* ── micro: the bug counter refuses to settle ──
     It lands on NaN, which is the joke. */
  const nan = $('.bugbox__n');
  if (nan) {
    ScrollTrigger.create({
      trigger: nan, start: 'top 85%', once: true,
      onEnter() {
        const frames = ['0', '7', '42', '13', '101', '3', 'NaN'];
        let i = 0;
        const id = setInterval(() => {
          nan.textContent = frames[i++];
          if (i >= frames.length) clearInterval(id);
        }, 90);
      },
    });
  }

  /* If the visitor turns reduced-motion on mid-session, stop everything and
     put every element back where the CSS says it belongs. */
  reduced.addEventListener('change', (e) => {
    if (!e.matches) return;
    ScrollTrigger.getAll().forEach(t => t.kill());
    // Only the elements this file animated. '[style]' also matched the inline
    // sprite sheet, whose style="position:absolute" is the only thing keeping
    // it out of the flow — clearing it jolted the page down 28px.
    const touched = gsap.globalTimeline.getChildren()
      .flatMap(t => (typeof t.targets === 'function' ? t.targets() : []))
      .filter(x => x instanceof Element);
    gsap.globalTimeline.clear();
    if (touched.length) gsap.set([...new Set(touched)], { clearProps: 'all' });
    document.documentElement.style.removeProperty('--walk');
  });
})();

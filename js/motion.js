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

  /* Split a heading into per-character spans so it can be dealt out letter
     by letter. Runs after load, on text that is already in the DOM and
     already readable; aria-label keeps the whole string for a reader. */
  const splitChars = (el) => {
    if (el.dataset.split) return $$('.ch', el);
    const text = el.textContent;
    el.dataset.split = '1';
    el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    const frag = document.createDocumentFragment();
    for (const c of text) {
      if (c === '\n') continue;
      const span = document.createElement('span');
      span.className = 'ch';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = c === ' ' ? ' ' : c;
      frag.appendChild(span);
    }
    el.appendChild(frag);
    return $$('.ch', el);
  };

  /* ═══════════ THE HEADER ═══════════
     It used to just sit there. Now it assembles: the bar wipes open, the
     name deals out character by character, the stats slide in, the chips
     land. The panel itself never moves — only its contents — so the
     above-the-fold budget is unaffected. */
  const sheet = $('.sheet');
  if (sheet) {
    const name = $('.sheet__name');
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    intro.from('.sheet__bar', { scaleX: 0, transformOrigin: 'left center', duration: 0.4 });
    if (name) {
      intro.from(splitChars(name), {
        yPercent: 115, opacity: 0, duration: 0.5, stagger: 0.015, ease: 'back.out(1.7)',
      }, '-=0.16');
    }
    intro.from('.sheet__pic', { scale: 0.86, opacity: 0, duration: 0.45, ease: 'back.out(1.5)' }, '-=0.46')
         .from('.sheet__lv',   { yPercent: -110, opacity: 0, duration: 0.3 }, '-=0.18')
         .from('.sheet__role', { xPercent: -10, opacity: 0, duration: 0.32 }, '-=0.3')
         .from('.sheet__open', { opacity: 0, duration: 0.3 }, '-=0.22')
         .from('.stat',        { x: -18, opacity: 0, duration: 0.34, stagger: 0.06 }, '-=0.2')
         .from('.kit li',      { y: 12, opacity: 0, duration: 0.26, stagger: 0.026, ease: 'back.out(2)' }, '-=0.3')
         .from('.sheet__cta .btn', { y: 14, opacity: 0, duration: 0.3, stagger: 0.07 }, '-=0.2');
  }

  /* The availability blip breathes. */
  gsap.to('.blip', {
    scale: 1.45, opacity: 0.5, duration: 0.85, repeat: -1, yoyo: true,
    ease: 'sine.inOut', transformOrigin: 'center',
  });

  /* Sky furniture moves on its own clock, independent of scroll. */
  $$('.cloud').forEach((c, i) => {
    gsap.to(c, { x: i % 2 ? 24 : -24, duration: 9 + i * 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
  gsap.to('.sun', { rotate: 360, duration: 120, repeat: -1, ease: 'none', transformOrigin: 'center' });

  /* ═══════════ MACRO: depth ═══════════ */
  $$('.world').forEach((world) => {
    const layer = $('.terrain', world);
    if (!layer) return;
    const far = world.classList.contains('world--surface') ? 40 : 22;
    gsap.fromTo(layer, { y: -far }, {
      y: far, ease: 'none',
      scrollTrigger: { trigger: world, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });
  $$('.cloud').forEach((cloud, i) => {
    gsap.to(cloud, {
      xPercent: i % 2 ? -130 : 130, ease: 'none',
      scrollTrigger: { trigger: cloud.closest('.world'), start: 'top bottom', end: 'bottom top', scrub: 1.2 },
    });
  });

  /* ═══════════ MACRO: Cimol walks the world ═══════════
     Scroll progress is her position. She faces the way she is going, her
     legs step while you scroll, her tail swings with the turn, and she
     settles into an idle sway the moment you stop. */
  const rider = $('.cat--rider');
  if (rider) {
    gsap.to(document.documentElement, {
      '--walk': 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.35 },
    });

    const legsF = $$('.cat--rider .c-legf');
    const legsB = $$('.cat--rider .c-legb');
    const tail  = $('.cat--rider .c-swish');

    const step = gsap.timeline({ repeat: -1, paused: true })
      .to(legsF, { y: -5, duration: 0.13, ease: 'steps(1)' }, 0)
      .to(legsB, { y: 4,  duration: 0.13, ease: 'steps(1)' }, 0)
      .to(rider, { y: -2, duration: 0.13, ease: 'steps(1)' }, 0)
      .to(legsF, { y: 4,  duration: 0.13, ease: 'steps(1)' }, 0.13)
      .to(legsB, { y: -5, duration: 0.13, ease: 'steps(1)' }, 0.13)
      .to(rider, { y: 0,  duration: 0.13, ease: 'steps(1)' }, 0.13);

    const idleSway = gsap.to(rider, {
      rotation: 2.5, duration: 1.1, repeat: -1, yoyo: true,
      ease: 'sine.inOut', transformOrigin: 'bottom center', paused: true,
    });
    idleSway.play();

    let last = scrollY, stopTimer;
    addEventListener('scroll', () => {
      const dir = scrollY - last;
      last = scrollY;
      if (Math.abs(dir) < 1) return;
      gsap.set(rider, { scaleX: dir > 0 ? 1 : -1 });
      if (tail) gsap.to(tail, { rotation: dir > 0 ? -18 : 18, duration: 0.25, transformOrigin: '85% 60%', overwrite: 'auto' });
      idleSway.pause();
      gsap.set(rider, { rotation: 0 });
      step.play();
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        step.pause();
        gsap.to([...legsF, ...legsB], { y: 0, duration: 0.2 });
        if (tail) gsap.to(tail, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        gsap.to(rider, { y: 0, duration: 0.2, onComplete: () => idleSway.play() });
      }, 170);
    }, { passive: true });
  }

  /* ═══════════ MACRO: the diagrams draw themselves ═══════════
     Wires draw, then a token tours the path and lights each state as it
     lands. The fact, animated — not decoration laid over prose. */
  const runDiagram = (svg) => {
    const wires  = $$('.wire', svg);
    const states = $$('.st', svg);
    const tok    = svg.querySelector('[class$="__tok"]');
    const labels = $$('.life__labels text', svg);

    for (const w of wires) {
      const len = w.getTotalLength();
      w.dataset.len = len;
      gsap.set(w, { strokeDasharray: len, strokeDashoffset: len });
    }
    if (tok) gsap.set(tok, { opacity: 0, scale: 0, transformOrigin: 'center' });
    if (labels.length) gsap.set(labels, { opacity: 0 });   // only the lifecycle has these

    const tl = gsap.timeline({
      scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
      defaults: { ease: 'power2.out' },
    });

    tl.from(states.map(s => s.querySelector('rect')),
        { scaleX: 0, transformOrigin: 'left center', duration: 0.32, stagger: 0.06 })
      .from(states.map(s => s.querySelector('text')),
        { opacity: 0, duration: 0.22, stagger: 0.06 }, '-=0.46');

    wires.forEach((w, i) => tl.to(w, { strokeDashoffset: 0, duration: 0.36 }, 0.46 + i * 0.09));
    if (labels.length) tl.to(labels, { opacity: 1, duration: 0.28, stagger: 0.05 }, '-=0.28');

    if (tok && states.length) {
      tl.to(tok, { opacity: 1, scale: 1, duration: 0.24, ease: 'back.out(2.4)' });
      states.forEach((st, i) => {
        const r = st.querySelector('rect');
        const cx = +r.getAttribute('x') + +r.getAttribute('width') / 2;
        const cy = +r.getAttribute('y') - 10;   // above the box, not over its label
        tl.to(tok, { attr: { cx, cy }, duration: 0.4, ease: 'power1.inOut' }, i === 0 ? '>' : '>+0.16')
          .add(() => {
            for (const s of states) s.classList.remove('is-on');
            st.classList.add('is-on');
          }, '<+0.28');
      });
      tl.add(() => { for (const s of states) s.classList.remove('is-on'); }, '>+0.6')
        .to(tok, { opacity: 0, duration: 0.3 }, '<')
        .repeat(-1).repeatDelay(1.8);
    }
  };
  $$('.viz').forEach(runDiagram);

  /* ═══════════ MICRO ═══════════ */

  /* Section headings deal out by character. */
  $$('.world__h').forEach((h) => {
    gsap.from(splitChars(h), {
      yPercent: 100, opacity: 0, duration: 0.4, stagger: 0.02, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: h, start: 'top 86%', once: true },
    });
  });

  const arrive = (sel, vars = {}) => $$(sel).forEach((el) => {
    gsap.from(el, Object.assign({
      y: 20, opacity: 0, duration: 0.42, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    }, vars));
  });

  arrive('.world__label', { y: 0, xPercent: -14, duration: 0.34 });
  arrive('.world__deck');
  arrive('.chamber', { y: 28 });
  arrive('.chamber__one');
  arrive('.kitgrp');
  arrive('.seam', { y: 18 });
  arrive('.vein', { x: -20, y: 0 });
  arrive('.post__c', { y: 14 });
  arrive('.lastcall', { y: 22 });
  arrive('.bugbox', { y: 22 });
  arrive('.mines__note', { x: -14, y: 0 });

  /* The screenshot shelf slides in from the side. */
  $$('.shelf').forEach((shelf) => {
    gsap.from($$('figure', shelf), {
      x: 28, opacity: 0, duration: 0.42, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: shelf, start: 'top 88%', once: true },
    });
  });

  /* Inventory: a grid wave in, then the mark lifts under the cursor. */
  const grid = $('.inv__grid');
  if (grid) {
    gsap.from($$('.inv__item', grid), {
      y: 18, opacity: 0, scale: 0.94, duration: 0.36, ease: 'back.out(1.8)',
      stagger: { each: 0.028 },
      scrollTrigger: { trigger: grid, start: 'top 88%', once: true },
    });
    $$('.inv__slot', grid).forEach((slot) => {
      const mark = $('svg', slot);
      if (!mark) return;
      slot.addEventListener('pointerenter', () =>
        gsap.to(mark, { scale: 1.24, rotate: -9, duration: 0.26, ease: 'back.out(3)' }));
      slot.addEventListener('pointerleave', () =>
        gsap.to(mark, { scale: 1, rotate: 0, duration: 0.32, ease: 'power2.out' }));
    });
  }

  /* Spec chips land one after another. */
  $$('.specs').forEach((list) => {
    gsap.from($$('li', list), {
      y: 10, opacity: 0, duration: 0.26, stagger: 0.02, ease: 'back.out(2)',
      scrollTrigger: { trigger: list, start: 'top 92%', once: true },
    });
  });

  /* Project tiles rise in a wave; the image pushes in behind them. */
  const mines = $('.mines');
  if (mines) {
    gsap.from($$('.ore-tile, .ore-wrap', mines), {
      y: 24, opacity: 0, duration: 0.4, ease: 'power2.out',
      stagger: { each: 0.03 },
      scrollTrigger: { trigger: mines, start: 'top 86%', once: true },
    });
    $$('.ore-tile', mines).forEach((t) => {
      const img = $('.ore-tile__img, .ore-block', t);
      if (!img) return;
      t.addEventListener('pointerenter', () => gsap.to(img, { scale: 1.07, duration: 0.5, ease: 'power2.out' }));
      t.addEventListener('pointerleave', () => gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' }));
    });
  }

  /* Ore and torches. */
  $$('.ore').forEach((ore) => {
    gsap.from(ore, {
      scale: 0, duration: 0.5, ease: 'back.out(2.6)',
      scrollTrigger: { trigger: ore, start: 'top 94%', once: true },
    });
  });
  $$('.torch').forEach((torch) => {
    gsap.from(torch, {
      scaleY: 0, transformOrigin: 'bottom center', duration: 0.4, ease: 'power2.out',
      scrollTrigger: { trigger: torch, start: 'top 95%', once: true },
    });
  });

  /* Buttons pull toward the cursor, then snap back. */
  $$('.btn, .ore-tile__story').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      gsap.to(b, {
        x: (e.clientX - r.left - r.width / 2) * 0.16,
        y: (e.clientY - r.top - r.height / 2) * 0.22,
        duration: 0.3, ease: 'power2.out',
      });
    });
    b.addEventListener('pointerleave', () =>
      gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }));
  });

  /* ═══════════ THE BUG COUNTER ═══════════
     It refuses to settle, and Cimol arrives to enjoy it. */
  const nan = $('.bugbox__n');
  if (nan) {
    ScrollTrigger.create({
      trigger: nan, start: 'top 85%', once: true,
      onEnter() {
        const frames = ['0', '7', '42', '13', '101', '3', '0', 'NaN'];
        let i = 0;
        const id = setInterval(() => {
          nan.textContent = frames[i++];
          gsap.fromTo(nan, { scale: 1.16 }, { scale: 1, duration: 0.13, ease: 'power2.out' });
          if (i >= frames.length) {
            clearInterval(id);
            gsap.fromTo(nan, { scale: 1.35, rotate: -4 },
              { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
            const cat = $('.cat--taunt');
            if (cat) gsap.fromTo(cat, { yPercent: 125, rotate: 20 },
              { yPercent: 0, rotate: 0, duration: 0.72, ease: 'back.out(1.8)' });
          }
        }, 95);
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
    for (const s of $$('.viz .st')) s.classList.remove('is-on');
  });
})();

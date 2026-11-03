(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const header = $('.site-header');
  const nav = $('#site-nav');
  const menu = $('.menu');
  const progress = $('.scroll-progress span');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Floating navigation, mobile menu and scroll progress.
  const closeMenu = () => { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Open navigation'); };
  menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); nav?.classList.toggle('is-open', open); });
  $$('#site-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (nav?.classList.contains('is-open') && !nav.contains(event.target) && !menu?.contains(event.target)) closeMenu(); });
  let scrollTick = false;
  const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; header?.classList.toggle('scrolled', scrollY > 30); scrollTick = false; };
  addEventListener('scroll', () => { if (!scrollTick) { requestAnimationFrame(onScroll); scrollTick = true; } }, { passive: true }); onScroll();

  // Active section indicator.
  const navLinks = $$('#site-nav a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; navLinks.forEach(link => { const active = link.hash === `#${entry.target.id}`; link.classList.toggle('is-active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }), { rootMargin: '-34% 0px -56% 0px' });
    navLinks.forEach(link => { const section = $(link.hash); if (section) navObserver.observe(section); });
  }

  // Reveal animations, with a no-motion fallback.
  const revealItems = $$('.hero-copy,.hero-visual,.section > .section-top,.about-grid,.section-heading,.learning-card,.feature-project,.project-card,.next-grid,.certificate-card,.creative-panel,.contact-inner');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealItems.forEach(item => item.classList.add('reveal'));
    const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .1 });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  // Project filters.
  const filterButtons = $$('[data-filter]');
  const projectItems = $$('[data-type]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
    applyFilter(filter);
  }));

  // Project detail modal.
  const projectModal = $('.project-modal');
  const projectTrigger = $('[data-project-open]');
  const projectClose = $('.modal-close');
  projectTrigger?.addEventListener('click', () => projectModal?.showModal());
  projectClose?.addEventListener('click', () => closeAnimated(projectModal));
  projectModal?.addEventListener('click', event => { if (event.target === projectModal) closeAnimated(projectModal); });

  // Certificate lightbox with Escape and arrow-key navigation.
  const lightbox = $('.lightbox');
  const lightboxImage = $('img', lightbox);
  const lightboxCounter = $('.lightbox-counter', lightbox);
  const certButtons = $$('[data-lightbox]');
  let certIndex = 0;
  const showCertificate = index => {
    if (!lightbox || !lightboxImage || !certButtons.length) return;
    certIndex = (index + certButtons.length) % certButtons.length;
    const button = certButtons[certIndex];
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.dataset.alt || 'Certificate preview';
    if (lightboxCounter) lightboxCounter.textContent = `${certIndex + 1} / ${certButtons.length}`;
  };
  certButtons.forEach((button, index) => button.addEventListener('click', () => { showCertificate(index); lightbox?.showModal(); }));
  $('.lightbox-close')?.addEventListener('click', () => closeAnimated(lightbox));
  $('.lightbox-prev')?.addEventListener('click', () => showCertificate(certIndex - 1));
  $('.lightbox-next')?.addEventListener('click', () => showCertificate(certIndex + 1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeAnimated(lightbox); });
  lightbox?.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); showCertificate(certIndex - 1); } if (event.key === 'ArrowRight') { event.preventDefault(); showCertificate(certIndex + 1); } });
  lightbox?.addEventListener('close', () => { if (lightboxImage) lightboxImage.removeAttribute('src'); });

  // Copy email with a compact accessible toast.
  const toast = $('.toast');
  let toastTimer;
  const announce = message => { if (!toast) return; toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); };
  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail;
    try { await navigator.clipboard.writeText(email); announce('Email address copied.'); }
    catch { announce(email); }
  }));

  // A restrained hero reveal; semantic headline text remains unchanged.
  const headline = $('#hero-title');
  if (headline && !reduceMotion) headline.classList.add('headline-arrive');

  // Cursor, magnetic buttons, card spotlight/tilt and click ripple on fine pointers only.
  if (finePointer && !reduceMotion) {
    const dot = $('.cursor-dot'); const ring = $('.cursor-ring');
    if (dot && ring) { dot.style.opacity = '1'; ring.style.opacity = '1'; }
    let x = -100, y = -100, ringX = -100, ringY = -100;
    addEventListener('pointermove', event => { x = event.clientX; y = event.clientY; if (dot) dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    const follow = () => { ringX += (x - ringX) * .16; ringY += (y - ringY) * .16; if (ring) ring.style.transform = `translate(${ringX}px,${ringY}px)`; requestAnimationFrame(follow); }; requestAnimationFrame(follow);
    $$('a,button,.tilt').forEach(target => { target.addEventListener('pointerenter', () => ring?.classList.add('is-hover')); target.addEventListener('pointerleave', () => ring?.classList.remove('is-hover')); });
    $$('.spotlight').forEach(card => {
      card.addEventListener('pointermove', event => { const rect = card.getBoundingClientRect(); card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`); card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`); });
    });
    $$('.magnetic').forEach(button => { button.addEventListener('pointermove', event => { const rect = button.getBoundingClientRect(); const dx = (event.clientX - rect.left - rect.width / 2) * .055; const dy = (event.clientY - rect.top - rect.height / 2) * .075; button.style.transform = `translate3d(${dx}px,${dy}px,0)`; }); button.addEventListener('pointerleave', () => { button.style.transform = ''; }); });
    document.addEventListener('pointerdown', event => { const target = event.target.closest('.button'); if (!target) return; const rect = target.getBoundingClientRect(); const ripple = document.createElement('span'); ripple.className = 'ripple'; ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`; target.append(ripple); ripple.addEventListener('animationend', () => ripple.remove(), { once: true }); });
  }

  // Canvas particle network: capped density, cursor repulsion, pause off-screen and on hidden tabs.
  const canvas = $('#network-canvas'); const visual = canvas?.closest('.hero-visual'); const ctx = canvas?.getContext('2d', { alpha: true });
  if (canvas && visual && ctx) {
    let width = 0, height = 0, dpr = 1, raf = 0, running = false, inView = false;
    const pointer = { x: -1000, y: -1000 };
    const count = innerWidth < 600 ? 34 : innerWidth < 1000 ? 52 : 78;
    const nodes = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .00028, vy: (Math.random() - .5) * .00028 }));
    const resize = () => { const rect = visual.getBoundingClientRect(); width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = () => {
      if (!running) return; ctx.clearRect(0, 0, width, height);
      const points = nodes.map(node => { node.x += node.vx; node.y += node.vy; if (node.x < .03 || node.x > .97) node.vx *= -1; if (node.y < .04 || node.y > .96) node.vy *= -1; let px = node.x * width, py = node.y * height; const dx = px - pointer.x, dy = py - pointer.y, distance = Math.hypot(dx, dy); if (distance < 125) { const force = (125 - distance) / 125 * .6; px += dx / (distance || 1) * force; py += dy / (distance || 1) * force; } return { x: px, y: py }; });
      for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) { const a = points[i], b = points[j], distance = Math.hypot(a.x - b.x, a.y - b.y); if (distance < 112) { ctx.strokeStyle = `rgba(117,218,226,${(1 - distance / 112) * .22})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      points.forEach((point, index) => { ctx.beginPath(); ctx.arc(point.x, point.y, index % 8 === 0 ? 2 : 1.2, 0, Math.PI * 2); ctx.fillStyle = index % 8 === 0 ? 'rgba(180,163,255,.9)' : 'rgba(123,230,222,.65)'; ctx.fill(); });
      raf = requestAnimationFrame(draw);
    };
    const start = () => { if (reduceMotion) { running = true; draw(); running = false; return; } if (!running && inView && !document.hidden) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    resize(); if ('ResizeObserver' in window) new ResizeObserver(resize).observe(visual); else addEventListener('resize', resize, { passive: true });
    if (finePointer) { addEventListener('pointermove', event => { const rect = visual.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; }, { passive: true }); document.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; }); }
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; inView ? start() : stop(); }, { threshold: .05 }).observe(visual); else { inView = true; start(); }
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  // ---- Cinematic layer ----
  const timers = new WeakMap();
  const closeAnimated = dlg => { if (!dlg || !dlg.open) return; if (reduceMotion) return dlg.close(); dlg.classList.add('is-closing'); setTimeout(() => { dlg.classList.remove('is-closing'); dlg.close(); }, 230); };
  [projectModal, lightbox].forEach(d => d?.addEventListener('cancel', e => { e.preventDefault(); closeAnimated(d); }));
  const applyFilter = filter => {
    let shown = 0;
    projectItems.forEach(item => {
      const show = filter === 'all' || item.dataset.type === filter; if (show) shown++;
      clearTimeout(timers.get(item));
      if (show && item.classList.contains('hidden')) { item.classList.remove('hidden'); item.classList.add('is-out'); requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove('is-out'))); }
      else if (!show && !item.classList.contains('hidden')) { item.classList.add('is-out'); timers.set(item, setTimeout(() => item.classList.add('hidden'), reduceMotion ? 0 : 260)); }
    });
    announce(`Showing ${shown} project${shown === 1 ? '' : 's'}`);
  };

  // Headline scramble: word widths are locked first so the layout never jumps.
  const scramble = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz01<>/{}';
    const words = [];
    $$('.hl').forEach(line => { const parts = line.textContent.split(' '); line.textContent = ''; parts.forEach((w, i) => { const span = document.createElement('span'); span.className = 'w'; span.textContent = w; line.append(span); if (i < parts.length - 1) line.append(' '); words.push(span); }); });
    words.forEach(w => { w.dataset.t = w.textContent; w.style.width = w.getBoundingClientRect().width + 'px'; });
    const start = performance.now(); const total = 1100;
    const tick = now => {
      const p = Math.min((now - start) / total, 1); let idx = 0;
      words.forEach((w, wi) => { const t = w.dataset.t; const local = Math.min(Math.max((p * 1.35 - wi * .09), 0), 1); w.textContent = [...t].map((c, i) => (i / t.length < local || /[.,]/.test(c)) ? c : chars[(Math.random() * chars.length) | 0]).join(''); idx++; });
      if (p < 1) requestAnimationFrame(tick); else words.forEach(w => { w.textContent = w.dataset.t; w.style.width = ''; });
    };
    requestAnimationFrame(tick);
  };
  if (!reduceMotion) (document.fonts?.ready || Promise.resolve()).then(scramble);

  // Pointer-reactive light, aurora parallax, card edge light and 3D tilt (fine pointers only).
  if (finePointer && !reduceMotion) {
    document.body.classList.add('has-cursor');
    const light = $('.cursor-light'); const layers = $$('.orb,.wave'); const ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, lx = mx, ly = my, last = null, raf = 0;
    const frame = () => {
      lx += (mx - lx) * .12; ly += (my - ly) * .12;
      if (light) light.style.transform = `translate3d(${lx - 300}px,${ly - 300}px,0)`;
      const nx = lx / innerWidth - .5, ny = ly / innerHeight - .5;
      layers.forEach((el, i) => { const d = (i + 1) * 14; el.style.translate = `${-nx * d}px ${-ny * d}px`; });
      raf = (Math.abs(mx - lx) + Math.abs(my - ly) > .5) ? requestAnimationFrame(frame) : 0;
    };
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(frame);
      const t = e.target.closest?.('.spotlight,.tilt');
      if (ring) { ring.classList.toggle('is-card', !!t && !e.target.closest('a,button')); ring.classList.toggle('is-view', !!e.target.closest('.certificate-card')); ring.classList.toggle('is-text', !!e.target.closest('input,textarea')); }
      if (last && last !== t) { last.style.setProperty('--rx', '0deg'); last.style.setProperty('--ry', '0deg'); }
      last = t;
      if (t && t.classList.contains('tilt')) { const r = t.getBoundingClientRect(); const k = +t.dataset.tilt || 5; t.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -k}deg`); t.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * k}deg`); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (last) { last.style.setProperty('--rx', '0deg'); last.style.setProperty('--ry', '0deg'); } });
    document.addEventListener('pointerdown', e => { const p = document.createElement('span'); p.className = 'click-pulse'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px'; document.body.append(p); p.addEventListener('animationend', () => p.remove(), { once: true }); });
  }

  // Contact form opens the visitor's own email app. No server is involved.
  const form = $('#contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault(); const d = new FormData(form); const name = String(d.get('name') || '').trim(); const msg = String(d.get('message') || '').trim();
    if (!name || !msg) { announce('Add your name and a message first.'); return; }
    location.href = `mailto:pranaybhosale1409@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + name)}&body=${encodeURIComponent(msg + '\n\n' + name)}`;
    announce('Opening your email app.');
  });
})();

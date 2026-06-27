// @ts-nocheck
import { useEffect, useState } from 'react';

export default function Home() {
  const [spainPhotosOpen, setSpainPhotosOpen] = useState(false);
  useEffect(() => {
    // ── CURSOR ──
    const cursor = document.getElementById('cursor')! as HTMLElement;
    const trailCanvas = document.getElementById('cursor-trail')! as HTMLCanvasElement;
    const tCtx = trailCanvas.getContext('2d')!;
    const trail: { x: number; y: number; life: number }[] = [];

    function resizeTrail() {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    function onMouseMove(e: MouseEvent) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (trail.length > 40) trail.shift();
    }
    document.addEventListener('mousemove', onMouseMove);

    let trailRaf = 0;
    function drawTrail() {
      tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trail.forEach(p => {
        p.life -= 0.04;
        if (p.life <= 0) return;
        tCtx.beginPath();
        tCtx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2);
        tCtx.fillStyle = `rgba(196,135,154,${p.life * 0.25})`;
        tCtx.fill();
      });
      trailRaf = requestAnimationFrame(drawTrail);
    }
    drawTrail();

    // ── BACKGROUND PETALS ──
    const bgC = document.getElementById('bg-canvas')! as HTMLCanvasElement;
    const bgCtx = bgC.getContext('2d')!;
    const COLS = ['#C4879A', '#E8C4CF', '#F2E0E6', '#8B4A5C', '#D4A0B0'];

    function resizeBg() { bgC.width = window.innerWidth; bgC.height = window.innerHeight; }
    resizeBg();
    window.addEventListener('resize', resizeBg);

    class BGPetal {
      x = 0; y = 0; sz = 0; vy = 0; vx = 0;
      rot = 0; vr = 0; alpha = 0; col = ''; wb = 0; wbS = 0;
      constructor(init: boolean) { this.reset(init); }
      reset(init: boolean) {
        this.x = Math.random() * bgC.width;
        this.y = init ? Math.random() * bgC.height : -15;
        this.sz = 3 + Math.random() * 7;
        this.vy = 0.3 + Math.random() * 0.6;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.rot = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 0.018;
        this.alpha = 0.06 + Math.random() * 0.15;
        this.col = COLS[Math.floor(Math.random() * COLS.length)];
        this.wb = Math.random() * Math.PI * 2;
        this.wbS = 0.008 + Math.random() * 0.015;
      }
      update() {
        this.wb += this.wbS;
        this.x += this.vx + Math.sin(this.wb) * 0.35;
        this.y += this.vy;
        this.rot += this.vr;
        if (this.y > bgC.height + 15) this.reset(false);
      }
      draw() {
        bgCtx.save();
        bgCtx.globalAlpha = this.alpha;
        bgCtx.translate(this.x, this.y);
        bgCtx.rotate(this.rot);
        bgCtx.fillStyle = this.col;
        bgCtx.beginPath();
        bgCtx.ellipse(0, 0, this.sz * 0.45, this.sz, 0, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.restore();
      }
    }
    const bgPetals = Array.from({ length: 45 }, () => new BGPetal(true));
    let bgRaf = 0;
    function bgLoop() {
      bgCtx.clearRect(0, 0, bgC.width, bgC.height);
      bgPetals.forEach(p => { p.update(); p.draw(); });
      bgRaf = requestAnimationFrame(bgLoop);
    }
    bgLoop();

    // Start hero immediately (intro removed)

    function startHero() {
      const ey    = document.getElementById('h-ey') as HTMLElement | null;
      const title = document.getElementById('h-title') as HTMLElement | null;
      const xx    = document.getElementById('h-xx') as HTMLElement | null;
      const sc    = document.getElementById('h-scroll') as HTMLElement | null;

      if (ey) {
        ey.style.animation = 'fadeSlideUp 0.8s ease forwards';
      }
      if (title) {
        setTimeout(() => { title.style.animation = 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) forwards'; }, 200);
      }
      if (xx) {
        setTimeout(() => { xx.style.animation    = 'fadeSlideUp 0.8s ease forwards'; }, 700);
      }
      if (sc) {
        setTimeout(() => { sc.style.animation    = 'fadeSlideUp 0.8s ease forwards'; }, 1200);
      }
    }

    // ── COUNTER ──
    let counterStarted = false;
    function animateCounter() {
      const el = document.getElementById('count-num') as HTMLElement;
      const lb = document.getElementById('count-label') as HTMLElement;
      el.classList.add('vis'); lb.classList.add('vis');
      const start = performance.now();
      function tick(now: number) {
        const p = Math.min((now - start) / 1800, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * 20).toString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = '20';
      }
      requestAnimationFrame(tick);
    }

    // ── CONFETTI ──
    let confC = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
    if (!confC) confC = document.getElementById('cake-confetti') as HTMLCanvasElement | null;
    const confCtx = confC ? confC.getContext('2d')! : null;

    let confettiRaf = 0;
    function burst() {
      if (!confC || !confCtx) return;
      confC.width  = confC.offsetWidth;
      confC.height = confC.offsetHeight;
      const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * confC.width,
        y: confC.height * 0.6 + Math.random() * confC.height * 0.4,
        vx: (Math.random() - 0.5) * 5,
        vy: -(3 + Math.random() * 7),
        g: 0.06 + Math.random() * 0.04,
        sz: 3 + Math.random() * 7,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.12,
        life: 1,
        col: COLS[Math.floor(Math.random() * COLS.length)],
      }));
      function loop() {
        if (!confCtx) return;
        confCtx.clearRect(0, 0, confC.width, confC.height);
        let alive = false;
        particles.forEach(p => {
          if (p.life <= 0) return;
          p.vy += p.g; p.x += p.vx; p.y += p.vy;
          p.rot += p.vr; p.life -= 0.005; alive = true;
          confCtx.save();
          confCtx.globalAlpha = Math.max(0, p.life) * 0.75;
          confCtx.translate(p.x, p.y);
          confCtx.rotate(p.rot);
          confCtx.fillStyle = p.col;
          confCtx.beginPath();
          confCtx.ellipse(0, 0, p.sz * 0.4, p.sz, 0, 0, Math.PI * 2);
          confCtx.fill();
          confCtx.restore();
        });
        if (alive) confettiRaf = requestAnimationFrame(loop);
      }
      loop();
    }
    // expose burst to other effects
    try { (window as any).burst = burst; } catch (e) {}

    // stop confetti when user reaches bottom of page
    function stopPageConfetti() {
      if (!confC || !confCtx) return;
      cancelAnimationFrame(confettiRaf);
      confettiRaf = 0;
      try { confCtx.clearRect(0, 0, confC.width, confC.height); } catch (e) {}
      try { confC.style.display = 'none'; } catch (e) {}
    }
    try { (window as any).stopPageConfetti = stopPageConfetti; } catch (e) {}

    function isNearPageBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
    }

    function onPageScrollHideConfetti() {
      if (!confC) return;
      if (isNearPageBottom()) stopPageConfetti();
    }
    window.addEventListener('scroll', onPageScrollHideConfetti, { passive: true });

    // ── INTERSECTION OBSERVERS ──
    function makeObs(threshold: number, cb: (el: Element) => void) {
      return new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) cb(e.target); }),
        { threshold }
      );
    }

    const fuObs = makeObs(0.18, el => el.classList.add('vis'));
    document.querySelectorAll('.rev-label,.rev-para,.rev-pq,.rev-things-header')
      .forEach(el => fuObs.observe(el));

    const closeObs = makeObs(0.15, () => {
      document.querySelectorAll('.rev-close').forEach((el, i) =>
        setTimeout(() => el.classList.add('vis'), i * 220)
      );
      setTimeout(burst, 800);
    });
    document.getElementById('closing-scene') && closeObs.observe(document.getElementById('closing-scene')!);

    const cakeConfettiObs = makeObs(0.12, () => stopPageConfetti());
    document.getElementById('cake-section') && cakeConfettiObs.observe(document.getElementById('cake-section')!);

    const countObs = makeObs(0.4, () => {
      if (!counterStarted) { counterStarted = true; animateCounter(); }
    });
    document.getElementById('counter-scene') && countObs.observe(document.getElementById('counter-scene')!);

    const thingsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.t-item').forEach((item, i) =>
          setTimeout(() => item.classList.add('vis'), i * 60)
        );
        thingsObs.unobserve(e.target);
      });
    }, { threshold: 0.05 });
    document.getElementById('things-list') && thingsObs.observe(document.getElementById('things-list')!);

    // ── ENVELOPE / LETTER INTERACTIONS ──
    const envelopeEl = document.getElementById('envelope') as HTMLElement | null;
    const peekEl = document.getElementById('letter-peek') as HTMLElement | null;
    const overlayEl = document.getElementById('overlay') as HTMLElement | null;
    const closeBtnEl = document.getElementById('lp-close') as HTMLElement | null;
    const labelEl = document.getElementById('step-label') as HTMLElement | null;

    let envelopeState: 'closed'|'open'|'letter' = 'closed';

    function setLabel(text: string) {
      if (!labelEl) return;
      labelEl.style.opacity = '0';
      setTimeout(() => { labelEl.textContent = text; labelEl.style.opacity = '1'; }, 350);
    }

    function onEnvelopeClick() {
      if (!envelopeEl || envelopeState !== 'closed') return;
      envelopeState = 'open';
      envelopeEl.classList.add('open');
      if (labelEl) labelEl.style.opacity = '0';
    }

    function onPeekClick(e: Event) {
      if (!peekEl || envelopeState !== 'open') return;
      e.stopPropagation();
      envelopeState = 'letter';
      if (overlayEl) {
        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeOverlay() {
      if (overlayEl) overlayEl.classList.remove('active');
      document.body.style.overflow = '';
      // auto-reset envelope when closing the letter
      envelopeState = 'closed';
      if (envelopeEl) envelopeEl.classList.remove('open');
      setLabel('klicke zum öffnen');
    }

    envelopeEl && envelopeEl.addEventListener('click', onEnvelopeClick);
    peekEl && peekEl.addEventListener('click', onPeekClick);
    closeBtnEl && closeBtnEl.addEventListener('click', closeOverlay);
    const overlayClickHandler = (e: Event) => { if (e.target === overlayEl) closeOverlay(); };
    overlayEl && overlayEl.addEventListener('click', overlayClickHandler);
    // Start hero now that setup is complete (defer to next frame)
    try {
      requestAnimationFrame(() => {
        startHero();
        // mark document ready to enable animations (prevents flicker on reload)
        try { document.documentElement.classList.add('is-ready'); } catch (e) {}
      });
    } catch (e) { /* ignore if startHero not ready */ }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('*').forEach(el => {
        el.style.animationDuration  = '0.01ms';
        el.style.transitionDuration = '0.01ms';
      });
    }
    // cleanup on unmount / HMR to avoid duplicated listeners & RAFs
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resizeTrail);
      window.removeEventListener('resize', resizeBg);
      try { window.removeEventListener('scroll', onPageScrollHideConfetti); } catch (e) {}
      try { fuObs.disconnect(); } catch (e) {}
      try { closeObs.disconnect(); } catch (e) {}
      try { cakeConfettiObs.disconnect(); } catch (e) {}
      try { countObs.disconnect(); } catch (e) {}
      try { thingsObs.disconnect(); } catch (e) {}
      // envelope listeners cleanup
      try { envelopeEl && envelopeEl.removeEventListener('click', onEnvelopeClick); } catch(e) {}
      try { peekEl && peekEl.removeEventListener('click', onPeekClick as EventListener); } catch(e) {}
      try { closeBtnEl && closeBtnEl.removeEventListener('click', closeOverlay as EventListener); } catch(e) {}
      try { overlayEl && overlayEl.removeEventListener('click', overlayClickHandler as EventListener); } catch(e) {}
      if (trailRaf) cancelAnimationFrame(trailRaf);
      if (bgRaf) cancelAnimationFrame(bgRaf);
      if (confettiRaf) cancelAnimationFrame(confettiRaf);
      // clear canvases
      try { tCtx.clearRect(0,0,trailCanvas.width, trailCanvas.height); } catch(e) {}
      try { bgCtx.clearRect(0,0,bgC.width, bgC.height); } catch(e) {}
      try { confCtx.clearRect(0,0,confC.width, confC.height); } catch(e) {}
      try { document.documentElement.classList.remove('is-ready'); } catch (e) {}
    };
  }, []);

  // Question card logic from question.html
  useEffect(() => {
    const btnNo   = document.getElementById('btnNo');
    const btnYes  = document.getElementById('btnYes');
    const qa      = document.getElementById('qaContent');
    const success = document.getElementById('successState');
    const card    = document.getElementById('q-card');
    const canvas  = document.getElementById('question-confetti') as HTMLCanvasElement | null;
    const ctx     = canvas ? canvas.getContext('2d') : null;
    if (!btnNo || !btnYes || !qa || !success || !card) return;

    let particles: any[] = [];
    let raf = 0;

    function launchConfetti() {
      if (!canvas || !ctx) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const colors = ['#ff2d78','#ff6ba8','#ffb3cf','#ffffff','#ff9500','#ffcc00','#6a2435'];
      for (let i = 0; i < 160; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 5,
          vy: 2.5 + Math.random() * 4,
          w: 6 + Math.random() * 8, h: 3 + Math.random() * 5,
          r: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.18,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.45 ? 'rect' : 'circle',
          life: 1,
        });
      }
      cancelAnimationFrame(raf);
      drawQ();
    }
    function drawQ() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07;
        p.rot += p.rotV; p.life -= 0.007;
        if (p.life > 0 && p.y < canvas.height + 20) alive = true;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(drawQ);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const MARGIN = 16, STEP = 280;
    let isFloating = false, noW = 0, noH = 0;
    function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)); }
    function isOutsideCard(x: number, y: number) {
      const cr = card.getBoundingClientRect();
      return x + noW < cr.left || x > cr.right || y + noH < cr.top || y > cr.bottom;
    }
    function escape(fromX: number, fromY: number) {
      const curX = parseFloat((btnNo as HTMLElement).style.left);
      const curY = parseFloat((btnNo as HTMLElement).style.top);
      const cx = curX + noW / 2, cy = curY + noH / 2;
      const angle = Math.atan2(cy - fromY, cx - fromX);
      const angles = [angle, angle+0.8, angle-0.8, angle+1.6, angle-1.6, angle+Math.PI];
      for (const a of angles) {
        const nx = clamp(cx + Math.cos(a)*STEP - noW/2, MARGIN, window.innerWidth  - noW - MARGIN);
        const ny = clamp(cy + Math.sin(a)*STEP - noH/2, MARGIN, window.innerHeight - noH - MARGIN);
        if (isOutsideCard(nx, ny)) return { x: nx, y: ny };
      }
      const corners = [
        { x: MARGIN, y: MARGIN },
        { x: window.innerWidth-noW-MARGIN, y: MARGIN },
        { x: MARGIN, y: window.innerHeight-noH-MARGIN },
        { x: window.innerWidth-noW-MARGIN, y: window.innerHeight-noH-MARGIN },
      ];
      corners.sort((a,b) => Math.hypot(b.x-fromX,b.y-fromY) - Math.hypot(a.x-fromX,a.y-fromY));
      return corners[0];
    }

    let noClickCount = 0;
    const onNoClick = (e: Event) => {
      e.preventDefault();
      noClickCount++;
      // second click => disappear permanently
      if (noClickCount >= 2) {
        try { (btnNo as HTMLElement).style.display = 'none'; } catch (err) {}
        // remove interactive listeners
      try { btnNo.removeEventListener('pointerdown', onNoPointerDown); } catch(e) {}
      try { document.removeEventListener('mousemove', onMouseMove); } catch(e) {}
        return;
      }
      if (isFloating) return;
      const r = btnNo.getBoundingClientRect();
      noW = r.width; noH = r.height;
      (btnNo as HTMLElement).classList.add('q-floating');
      (btnNo as HTMLElement).style.width  = noW + 'px';
      (btnNo as HTMLElement).style.height = noH + 'px';
      (btnNo as HTMLElement).style.left   = r.left + 'px';
      (btnNo as HTMLElement).style.top    = r.top  + 'px';
      isFloating = true;
      const me = e as MouseEvent;
      const pos = escape(me.clientX, me.clientY);
      (btnNo as HTMLElement).style.left = pos.x + 'px';
      (btnNo as HTMLElement).style.top  = pos.y + 'px';
    };
    const onNoPointerDown = (e: Event) => e.preventDefault();
    const onMouseMove = (e: MouseEvent) => {
      if (!isFloating) return;
      const bx = parseFloat((btnNo as HTMLElement).style.left) + noW/2;
      const by = parseFloat((btnNo as HTMLElement).style.top)  + noH/2;
      if (Math.hypot(e.clientX - bx, e.clientY - by) > 120) return;
      const pos = escape(e.clientX, e.clientY);
      (btnNo as HTMLElement).style.left = pos.x + 'px';
      (btnNo as HTMLElement).style.top  = pos.y + 'px';
    };

    // (no scroll-hide behavior for the No button)
    const onYesClick = () => {
      (btnNo as HTMLElement).style.display = 'none';
      qa.classList.add('qa-hidden');
      success.classList.add('q-success-visible');
      launchConfetti();
    };

    btnNo.addEventListener('click', onNoClick);
    btnNo.addEventListener('pointerdown', onNoPointerDown);
    document.addEventListener('mousemove', onMouseMove);
    // no scroll listener for No button
    btnYes.addEventListener('click', onYesClick);

    return () => {
      try { btnNo.removeEventListener('click', onNoClick); } catch(e) {}
      try { btnNo.removeEventListener('pointerdown', onNoPointerDown); } catch(e) {}
      try { document.removeEventListener('mousemove', onMouseMove); } catch(e) {}
      btnYes.removeEventListener('click', onYesClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Cake scene — original logic from cake.html
  useEffect(() => {
    const TOTAL = 5;
    let outCount = 0;

    const flames = Array.from({ length: TOTAL }, (_, i) =>
      document.getElementById(`cake-flame-${i}`)
    );
    const hint   = document.getElementById('cake-hint');
    const canvas = document.getElementById('cake-confetti') as HTMLCanvasElement | null;
    const ctx    = canvas ? canvas.getContext('2d') : null;
    let particles: any[] = [];
    let raf = 0;

    function launchConfetti() {
      if (!canvas || !ctx) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const colors = ['#ff2d78','#ff6ba8','#ffb3cf','#ffffff','#ff9500','#ffcc00','#c91d59'];
      for (let i = 0; i < 180; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 5,
          vy: 2.5 + Math.random() * 4.5,
          r: 4 + Math.random() * 6,
          w: 6 + Math.random() * 8,
          h: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.18,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: Math.random() > 0.45 ? 'rect' : 'circle',
          life: 1,
        });
      }
      cancelAnimationFrame(raf);
      drawConfetti();
    }

    function drawConfetti() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x  += p.vx; p.y += p.vy; p.vy += 0.07;
        p.rot += p.rotV; p.life -= 0.007;
        if (p.life > 0 && p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(drawConfetti);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function stopConfetti() {
      if (!canvas || !ctx) return;
      cancelAnimationFrame(raf);
      raf = 0;
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      try { canvas.style.display = 'none'; } catch (e) {}
      try { (window as any).stopPageConfetti?.(); } catch (e) {}
    }

    function onScrollHideConfetti() {
      if (!canvas) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (atBottom) stopConfetti();
    }
    window.addEventListener('scroll', onScrollHideConfetti, { passive: true });

    function blowCandle(i: number) {
      const g = flames[i];
      if (!g || g.classList.contains('out')) return;
      g.classList.add('out');
      const smoke = g.querySelector('.smoke-path') as HTMLElement | null;
      if (smoke) {
        smoke.classList.remove('animating');
        void smoke.getBoundingClientRect();
        smoke.classList.add('animating');
      }
      outCount++;
      if (outCount === TOTAL) {
        if (hint) hint.classList.add('hidden');
        try { if (canvas) canvas.style.display = 'block'; } catch (e) {}
        launchConfetti();
      }
    }

    const handlers: Array<{ el: Element; fn: EventListener }> = [];
    flames.forEach((g, i) => {
      if (!g) return;
      const fn = () => blowCandle(i);
      g.addEventListener('click', fn);
      handlers.push({ el: g, fn });
    });

    const relight = document.getElementById('cake-relight');
    const relightFn = () => {
      outCount = 0;
      if (hint) hint.classList.remove('hidden');
      flames.forEach(g => {
        if (!g) return;
        g.classList.remove('out');
        const s = g.querySelector('.smoke-path') as HTMLElement | null;
        if (s) s.classList.remove('animating');
      });
    };
    if (relight) relight.addEventListener('click', relightFn);

    return () => {
      handlers.forEach(h => h.el.removeEventListener('click', h.fn));
      if (relight) relight.removeEventListener('click', relightFn);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollHideConfetti);
    };
  }, []);

  return (
    <>
      <div id="cursor" />
      <canvas id="cursor-trail" />

      {/* intro removed — show hero immediately */}

      <canvas id="bg-canvas" />

      {/* HERO */}
      <div className="scene" id="hero">
        <div className="hero-inner">
          <span className="hero-title" id="h-title">Azra</span>
        </div>
        <div className="hero-scroll-hint" id="h-scroll">
          <div className="scroll-bar" />
        </div>
      </div>

      {/* LETTER */}
      <section className="scene" id="letter-scene">
        <span className="scene-label rev-label">Ein Brief an dich</span>
        <p className="letter-para rev-para">
          Ich konnte leider nicht persönlich zu deinem Geburtstag erscheinen.{' '}
        </p>
        <p className="letter-para rev-para" style={{ transitionDelay: '0.15s' }}>
          Doch ich habe hier etwas kleines für dich vorbereitet. Hoffentlich wird es dich{' '}
          <span className="letter-em">beglücken.</span>
        </p>
      </section>


      {/* ENVELOPE */}
      <section className="scene" id="envelope-scene" style={{ position: 'relative', zIndex: 3 }}>
        <span className="closing-eyebrow envelope-hint" id="step-label">klicke zum öffnen</span>
        <div className="envelope-wrap" id="envelope" style={{ margin: '0 auto' }}>
          <div className="env-body">
            <div className="env-v-left" />
            <div className="env-v-right" />

            <div className="env-flap">
              <div className="env-flap-face" />
              <div className="env-flap-back" />
            </div>

            <div className="wax-seal">A</div>

            <div className="letter-peek" id="letter-peek">
              <div className="letter-lines">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div className="peek-cta">klicke auf den Brief</div>
              <div className="peek-arrow">↑</div>
            </div>
          </div>
        </div >

        <div id="overlay">
          <div className="letter-paper">
            <span className="lp-date">irgendwo zwischen gestern und für immer</span>
            <div className="lp-greeting">Liebste Azra,</div>
            <p className="lp-body">
              Alles Gute zum Geburtstag, hier ein paar Worte von mir.
            </p>
            <p className="lp-body">
            Es gibt Augenblicke, in denen das Leben aus einer Person spricht.
            Die leuchtenden Augen, das sanfte Lächeln und die mühelose Kommunikation machen es zu einem besonderen Moment. <em>Du bist so ein Moment.</em>
            </p>
            <p className="lp-body">
              Ein einziges Treffen genügt, um zu wissen, wer deine Seele berührt. <em>Bei dir war dies der Fall.</em> Wenn ich daran denke, verstehe ich es selbst.
                Jahre vergingen ohne richtigen Kontakt und doch, in nur wenigen Minuten war es, als wäre nie etwas gewesen.
            </p>
            <p className="lp-body">
              Ich hoffe, unser Zueinanderfinden war bestimmt und wird unsere Zukunft prägen -
              sofern dies auf Gegenseitigkeit beruhen sollte.  
            </p>
            <p className="lp-body">
              <em>Happy Birthday, Azra.</em>
            </p>
            <span className="lp-sign">In herzlicher Zuneigung</span>
            <button className="lp-close-btn" id="lp-close">schließen</button>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="timeline-section" id="timeline-scene">
        <p className="section-label">Unsere Geschichte</p>
        <div className="timeline">

          <div className="timeline-item">
            <div className="timeline-card">
              <p className="card-date">Der Anfang von allem</p>
              <h2 className="card-title">Spanien 2023</h2>
              <p className="card-text">Die Reise in der wir uns das erste Mal trafen. Alles geschah so schnell und spontan.</p>
              <div className={`timeline-photos${spainPhotosOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="timeline-photos-toggle"
                  onClick={() => setSpainPhotosOpen(o => !o)}
                  aria-expanded={spainPhotosOpen}
                >
                  Fotos ansehen
                </button>
                <div className="timeline-photo-panel">
                  <div className="timeline-photo-panel-inner">
                    <div className="timeline-photo-grid">
                      <img src="/images/spain-1.png" alt="Spanien 2023 — Tag" loading="lazy" />
                      <img src="/images/spain-2.png" alt="Spanien 2023 — Nacht" loading="lazy" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="timeline-dot"><div className="dot-inner"></div></div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"><div className="dot-inner"></div></div>
            <div className="timeline-card">
              <p className="card-date">The great separation</p>
              <h2 className="card-title">Jung und dumm</h2>
              <p className="card-text">Stundenlange Gespräche, Aktionen die wir bereut und eingesehen haben. Wir gingen schließlich unsere eigenen Wege.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-card">
              <p className="card-date">Zusammenkunft</p>
              <h2 className="card-title">Das Wiedersehen</h2>
              <p className="card-text">Wir schrieben nach Jahren wieder mehr und sind zum ersten Mal ausgegangen. Um ehrlich zu sein war ich noch nie so nervös auf ein Treffen.</p>
            </div>
            <div className="timeline-dot"><div className="dot-inner"></div></div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"><div className="dot-inner"></div></div>
            <div className="timeline-card">
              <p className="card-date">Zweites Treffen</p>
              <h2 className="card-title">Eis essen und chillen</h2>
              <p className="card-text">Auch wenn wir nur stundenlang auf der Bank saßen und zwischen den Gesprächen eine angenehme Stille herrschte, habe ich den Tag genossen.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-card">
              <p className="card-date">Heute</p>
              <h2 className="card-title">Die Zukunft</h2>
              <p className="card-text">20 Jahre alt, ein Kapitel welches nun startet. Und Hoffentlich kann ich dich dabei begleiten. Bis zum nächsten Treffen. <em>To be continued....</em>  </p>
            </div>
            <div className="timeline-dot"><div className="dot-inner"></div></div>
          </div>

        </div>
      </section>


      {/* COUNTER */}
      <section className="scene" id="counter-scene">
        <div className="counter-number" id="count-num">0</div>
        <div className="counter-label"  id="count-label">Mögest du noch lange erfolgreiche Jahre leben.</div>
      </section>


      {/* QUESTION CARD */}
      <section className="question-scene" id="question-scene">
        <canvas id="question-confetti" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999 }} />
        <h2 className="q-section-header">Die entscheidene Frage</h2>
        <div className="q-card" id="q-card">
          <div className="qa-content" id="qaContent">
            <p className="q-question">Kaufen wir dir gemeinsam ein <span>Geburtstagsgeschenk?</span></p>
            <div className="q-buttons">
              <button className="q-btn-yes" id="btnYes">Ja</button>
              <button className="q-btn-no"  id="btnNo">Nein</button>
            </div>
          </div>
          <div className="q-success" id="successState">
            <p className="q-success-text">Wusste ich doch, nach meinem Urlaub geht es los!</p>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <div className="scene" id="closing-scene">
        <span className="closing-eyebrow rev-close">mit ganzer Liebe</span>
        <div className="closing-big rev-close">
          Happy<br /><span className="closing-rose">Birthday</span>
        </div>
      </div>
      
      {/* CAKE SCENE */}
      <section className="cake-scene" id="cake-section">
        <canvas id="cake-confetti" style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999 }} />
        <div className="cake-wrapper" id="cakeWrapper">
          <svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="layer1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3d1228"/>
                <stop offset="100%" stopColor="#2a0a1a"/>
              </linearGradient>
              <linearGradient id="layer2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a1530"/>
                <stop offset="100%" stopColor="#2e0d1f"/>
              </linearGradient>
              <linearGradient id="layer3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#55183a"/>
                <stop offset="100%" stopColor="#380f24"/>
              </linearGradient>
              <linearGradient id="frostG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6ba8"/>
                <stop offset="100%" stopColor="#c91d59"/>
              </linearGradient>
              <linearGradient id="topFrostG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff85b8"/>
                <stop offset="100%" stopColor="#ff2d78"/>
              </linearGradient>
              <filter id="glowF" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="flameF" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Plate */}
            <ellipse cx="170" cy="286" rx="108" ry="11" fill="rgba(0,0,0,0.45)"/>
            <ellipse cx="170" cy="276" rx="104" ry="11" fill="#1f0a14" stroke="#6e2042" strokeWidth="1.5"/>

            {/* LAYER 1 */}
            <ellipse cx="170" cy="252" rx="93" ry="11" fill="#1e0810"/>
            <rect x="77" y="202" width="186" height="50" fill="url(#layer1)"/>
            <ellipse cx="170" cy="202" rx="93" ry="11" fill="#3d1228"/>
            <path d="M77 202 Q87 213 97 202 Q107 213 117 202 Q127 213 137 202 Q147 213 157 202 Q167 213 177 202 Q187 213 197 202 Q207 213 217 202 Q227 213 237 202 Q247 213 257 202 Q263 207 263 202" fill="url(#frostG)" opacity="0.88"/>
            <rect x="98"  y="215" width="8" height="3" rx="1.5" fill="#ff6ba8" transform="rotate(20,102,216.5)"/>
            <rect x="138" y="228" width="8" height="3" rx="1.5" fill="#fff"    transform="rotate(-15,142,229.5)"/>
            <rect x="172" y="219" width="8" height="3" rx="1.5" fill="#ff2d78" transform="rotate(35,176,220.5)"/>
            <rect x="208" y="232" width="8" height="3" rx="1.5" fill="#ff6ba8" transform="rotate(-25,212,233.5)"/>
            <rect x="238" y="220" width="8" height="3" rx="1.5" fill="#fff"    transform="rotate(10,242,221.5)"/>
            <circle cx="118" cy="238" r="2.5" fill="#ff2d78"/>
            <circle cx="158" cy="243" r="2"   fill="#fff"/>
            <circle cx="198" cy="236" r="2.5" fill="#ff6ba8"/>
            <circle cx="228" cy="245" r="2"   fill="#ff2d78"/>

            {/* LAYER 2 */}
            <ellipse cx="170" cy="202" rx="78" ry="9" fill="#200b15"/>
            <rect x="92" y="158" width="156" height="44" fill="url(#layer2)"/>
            <ellipse cx="170" cy="158" rx="78" ry="9" fill="#4a1530"/>
            <path d="M92 158 Q102 168 112 158 Q122 168 132 158 Q142 168 152 158 Q162 168 172 158 Q182 168 192 158 Q202 168 212 158 Q222 168 232 158 Q242 168 248 158" fill="url(#frostG)" opacity="0.82"/>
            <rect x="103" y="171" width="7" height="2.5" rx="1.25" fill="#fff"    transform="rotate(-20,106.5,172.25)"/>
            <rect x="143" y="178" width="7" height="2.5" rx="1.25" fill="#ff2d78" transform="rotate(30,146.5,179.25)"/>
            <rect x="178" y="170" width="7" height="2.5" rx="1.25" fill="#ff6ba8" transform="rotate(-10,181.5,171.25)"/>
            <rect x="213" y="182" width="7" height="2.5" rx="1.25" fill="#fff"    transform="rotate(15,216.5,183.25)"/>
            <circle cx="128" cy="188" r="2" fill="#ff6ba8"/>
            <circle cx="163" cy="193" r="2" fill="#fff"/>
            <circle cx="195" cy="186" r="2" fill="#ff2d78"/>

            {/* LAYER 3 */}
            <ellipse cx="170" cy="158" rx="58" ry="8" fill="#200b15"/>
            <rect x="112" y="118" width="116" height="40" fill="url(#layer3)"/>
            <ellipse cx="170" cy="118" rx="58" ry="8" fill="url(#topFrostG)"/>
            <path d="M112 118 Q122 128 132 118 Q142 128 152 118 Q162 128 172 118 Q182 128 192 118 Q202 128 212 118 Q222 128 228 118" fill="url(#frostG)" opacity="0.78"/>
            <g filter="url(#glowF)">
              <circle cx="122" cy="117"   r="3.5" fill="#fff"    opacity="0.9"/>
              <circle cx="136" cy="115"   r="3"   fill="#ffb3cf" opacity="0.9"/>
              <circle cx="150" cy="114"   r="3.5" fill="#fff"    opacity="0.9"/>
              <circle cx="164" cy="113.5" r="4"   fill="#ff2d78"/>
              <circle cx="178" cy="113.5" r="4"   fill="#ff2d78"/>
              <circle cx="192" cy="114"   r="3.5" fill="#fff"    opacity="0.9"/>
              <circle cx="206" cy="115"   r="3"   fill="#ffb3cf" opacity="0.9"/>
              <circle cx="220" cy="117"   r="3.5" fill="#fff"    opacity="0.9"/>
            </g>

            {/* Candle 0 */}
            <rect x="122" y="100" width="8" height="20" rx="4" fill="#1a0810" stroke="#ff2d78" strokeWidth="1.5"/>
            <line x1="126" y1="100" x2="126" y2="96" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="flame-group" id="cake-flame-0" style={{transformOrigin:'126px 98px'}}>
              <g className="flame-visible flame-flicker" style={{transformOrigin:'126px 98px'}}>
                <g filter="url(#flameF)">
                  <ellipse cx="126" cy="90" rx="5.5" ry="9"   fill="#ff9500" opacity="0.9"/>
                  <ellipse cx="126" cy="91" rx="3.5" ry="6.5" fill="#ffcc00"/>
                  <ellipse cx="126" cy="93" rx="2"   ry="4"   fill="#fff" opacity="0.75"/>
                </g>
              </g>
              <path className="smoke-path" d="M126 96 Q129 88 126 80 Q123 72 126 64"
                stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none"
                strokeDasharray="40" strokeDashoffset="40"/>
            </g>

            {/* Candle 1 */}
            <rect x="144" y="100" width="8" height="20" rx="4" fill="#1a0810" stroke="#ff6ba8" strokeWidth="1.5"/>
            <line x1="148" y1="100" x2="148" y2="96" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="flame-group" id="cake-flame-1" style={{transformOrigin:'148px 98px'}}>
              <g className="flame-visible flame-flicker-b" style={{transformOrigin:'148px 98px'}}>
                <g filter="url(#flameF)">
                  <ellipse cx="148" cy="90" rx="5.5" ry="9"   fill="#ff2d78" opacity="0.9"/>
                  <ellipse cx="148" cy="91" rx="3.5" ry="6.5" fill="#ff6ba8"/>
                  <ellipse cx="148" cy="93" rx="2"   ry="4"   fill="#fff" opacity="0.75"/>
                </g>
              </g>
              <path className="smoke-path" d="M148 96 Q151 88 148 80 Q145 72 148 64"
                stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none"
                strokeDasharray="40" strokeDashoffset="40"/>
            </g>

            {/* Candle 2 */}
            <rect x="166" y="100" width="8" height="20" rx="4" fill="#1a0810" stroke="#ff2d78" strokeWidth="1.5"/>
            <line x1="170" y1="100" x2="170" y2="96" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="flame-group" id="cake-flame-2" style={{transformOrigin:'170px 98px'}}>
              <g className="flame-visible flame-flicker-c" style={{transformOrigin:'170px 98px'}}>
                <g filter="url(#flameF)">
                  <ellipse cx="170" cy="89" rx="6"   ry="10"  fill="#ff2d78" opacity="0.95"/>
                  <ellipse cx="170" cy="90" rx="4"   ry="7"   fill="#ff85b8"/>
                  <ellipse cx="170" cy="92" rx="2.2" ry="4.5" fill="#fff" opacity="0.8"/>
                </g>
              </g>
              <path className="smoke-path" d="M170 96 Q173 88 170 80 Q167 72 170 64"
                stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none"
                strokeDasharray="40" strokeDashoffset="40"/>
            </g>

            {/* Candle 3 */}
            <rect x="188" y="100" width="8" height="20" rx="4" fill="#1a0810" stroke="#ff6ba8" strokeWidth="1.5"/>
            <line x1="192" y1="100" x2="192" y2="96" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="flame-group" id="cake-flame-3" style={{transformOrigin:'192px 98px'}}>
              <g className="flame-visible flame-flicker" style={{transformOrigin:'192px 98px'}}>
                <g filter="url(#flameF)">
                  <ellipse cx="192" cy="90" rx="5.5" ry="9"   fill="#ff9500" opacity="0.9"/>
                  <ellipse cx="192" cy="91" rx="3.5" ry="6.5" fill="#ffcc00"/>
                  <ellipse cx="192" cy="93" rx="2"   ry="4"   fill="#fff" opacity="0.75"/>
                </g>
              </g>
              <path className="smoke-path" d="M192 96 Q195 88 192 80 Q189 72 192 64"
                stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none"
                strokeDasharray="40" strokeDashoffset="40"/>
            </g>

            {/* Candle 4 */}
            <rect x="210" y="100" width="8" height="20" rx="4" fill="#1a0810" stroke="#ff2d78" strokeWidth="1.5"/>
            <line x1="214" y1="100" x2="214" y2="96" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="flame-group" id="cake-flame-4" style={{transformOrigin:'214px 98px'}}>
              <g className="flame-visible flame-flicker-b" style={{transformOrigin:'214px 98px'}}>
                <g filter="url(#flameF)">
                  <ellipse cx="214" cy="90" rx="5.5" ry="9"   fill="#ff2d78" opacity="0.9"/>
                  <ellipse cx="214" cy="91" rx="3.5" ry="6.5" fill="#ff6ba8"/>
                  <ellipse cx="214" cy="93" rx="2"   ry="4"   fill="#fff" opacity="0.75"/>
                </g>
              </g>
              <path className="smoke-path" d="M214 96 Q217 88 214 80 Q211 72 214 64"
                stroke="#444" strokeWidth="2" strokeLinecap="round" fill="none"
                strokeDasharray="40" strokeDashoffset="40"/>
            </g>
          </svg>
        </div>
        <p className="hint" id="cake-hint">Klick auf die Flammen um die Kerzen auszupusten</p>
        <button className="btn-restart" id="cake-relight" aria-label="Neu starten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </section>
    </>
  );
}

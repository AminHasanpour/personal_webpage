/**
 * Flower Garden Sway
 * - Provides a gentle wind sway effect for garden flowers
 * - Reacts to gusts emitted by wind.js via the 'garden:gust' event
 * - Respects prefers-reduced-motion and pauses when offscreen/hidden
 *
 * Authoring contract:
 * - Place decorative flowers as <img> with class "flower-garden__item" inside .flower-garden
 * - Optional data attributes per element:
 *   - data-amplitude-deg: base rotation amplitude in degrees (default random ~2..5)
 *   - data-speed:         base cycles per second (default random ~0.07..0.18 Hz)
 *   - data-wind:          "off" to opt-out from gust amplification
 */
(function () {
  const hasGSAP = typeof window !== 'undefined' && typeof window.gsap !== 'undefined';
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GARDEN_SEL = '.flower-garden';
  const FLOWER_SEL = '.flower-garden__item';

  // Early exit: no DOM or user prefers reduced motion
  if (!document || reducedMotion) {
    return; // Keep static visuals (CSS will ensure no animation)
  }

  const garden = document.querySelector(GARDEN_SEL);
  if (!garden) return;

  const flowers = Array.from(garden.querySelectorAll(FLOWER_SEL));
  if (!flowers.length) return;

  // If GSAP is missing, use a very gentle CSS-only fallback
  if (!hasGSAP) {
    flowers.forEach(el => el.classList.add('flower--sway-fallback'));
    return;
  }

  // Build per-flower parameters
  const rand = (min, max) => Math.random() * (max - min) + min;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const items = flowers.map((el, i) => {
    const ampDegAttr = parseFloat(el.getAttribute('data-amplitude-deg'));
    const speedAttr = parseFloat(el.getAttribute('data-speed'));

    const ampDeg = isNaN(ampDegAttr) ? rand(2.0, 5.0) : ampDegAttr;
    // cycles per second (Hz): very slow sway ~0.07..0.18 (one cycle in 6s..14s)
    const speedHz = isNaN(speedAttr) ? rand(0.07, 0.18) : clamp(speedAttr, 0.03, 0.4);
    const omega = Math.PI * 2 * speedHz;
    const phase = rand(0, Math.PI * 2);
    const reactsToWind = (el.getAttribute('data-wind') || 'on').toLowerCase() !== 'off';

    // Ensure natural pivot near base
    el.style.transformOrigin = el.style.transformOrigin || '50% 100%';
    el.style.willChange = 'transform';

    return { el, ampDeg, omega, phase, reactsToWind };
  });

  // Gust handling with smoothing to avoid sudden snaps
  // gustTarget decays; gustValue eases toward gustTarget for smooth entry/exit
  let gustTarget = 0;
  let gustValue = 0;
  let lastTs = performance.now();
  const HALF_LIFE_MS = 1800; // half-life for gust decay (target)
  const RISE_TAU_MS = 260;   // rise time constant for smooth ramp-in
  const FALL_TAU_MS = 320;   // fall time constant for smooth ramp-out (toward target)
  const LN2 = Math.log(2);

  // Visual response tuning
  const AMP_MULT = 1.2;       // how much gust amplifies oscillation amplitude
  const MAX_BIAS_DEG = 5;    // rightward lean at full gust
  const MAX_TOTAL_DEG = 28;   // safety clamp to avoid extreme tilts

  const onGust = (evt) => {
    const d = (evt && evt.detail) || {};
    const intensity = typeof d.intensity === 'number' ? d.intensity : 0.5; // ~0..1
    // Stronger mapping with a small baseline; cap to 2.0
    const boost = clamp(intensity * 1.8 + 0.2, 0.25, 2.0);
    gustTarget = Math.max(gustTarget, boost);
  };

  // Listen on both window and the wind element; de-duplicate events occurring back-to-back
  let lastGustTs = 0;
  const deDup = (handler) => (evt) => {
    const ts = performance.now();
    if (ts - lastGustTs < 30) return; // ignore duplicates within 30ms
    lastGustTs = ts;
    handler(evt);
  };
  window.addEventListener('garden:gust', deDup(onGust));
  const windEl2 = document.getElementById('gardenwind');
  if (windEl2) windEl2.addEventListener('garden:gust', deDup(onGust));

  // Visibility and on-screen control
  let isVisible = true;
  let isDocHidden = document.hidden;

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === garden) {
          isVisible = e.isIntersecting;
        }
      });
    }, { threshold: 0.1 });
    obs.observe(garden);
  }

  document.addEventListener('visibilitychange', () => {
    isDocHidden = document.hidden;
  });

  // Animation loop via GSAP ticker
  const update = () => {
    const now = performance.now();
    const dt = now - lastTs;
    lastTs = now;

    // Skip work if not visible or tab hidden
    if (isDocHidden || !isVisible) return;

    // Exponential decay of gustTarget (wind fades out)
    if (gustTarget > 0) {
      const k = LN2 / HALF_LIFE_MS; // per ms
      gustTarget *= Math.exp(-k * dt);
      if (gustTarget < 0.005) gustTarget = 0;
    }

    // Smooth gustValue toward gustTarget
    const tau = gustValue < gustTarget ? RISE_TAU_MS : FALL_TAU_MS;
    const alpha = 1 - Math.exp(-(dt) / Math.max(1, tau)); // 0..1
    gustValue += (gustTarget - gustValue) * alpha;

    const t = now / 1000; // seconds
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const ampFactor = it.reactsToWind ? (1 + gustValue * AMP_MULT) : 1;
      const osc = Math.sin(t * it.omega + it.phase) * (it.ampDeg * ampFactor);
      // Bias lean to the right when gusting; direction is always to the right per spec
      const lean = it.reactsToWind ? (gustValue * MAX_BIAS_DEG) : 0;
      let angle = lean + osc;
      angle = clamp(angle, -MAX_TOTAL_DEG, MAX_TOTAL_DEG);
      it.el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    }
  };

  // Start ticker
  if (window.gsap && window.gsap.ticker) {
    // Run at default GSAP ticker rate; use lagSmoothing to avoid huge jumps
    try { window.gsap.ticker.lagSmoothing(1000, 16); } catch (_) { /* noop */ }
    window.gsap.ticker.add(update);
  }
})();

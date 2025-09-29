/**
 * Garden Leaves
 * Spawns decorative falling leaves that drift from left to right with an imperfect,
 * slowly-damped curly path and gentle self-rotation. Reacts to wind gusts emitted
 * by wind.js ('garden:gust' with detail.intensity in [0..1]).
 *
 * Behavior:
 * - Randomly spawns a leaf just outside the left edge of the .flower-garden and moves it right.
 * - Curly path = imperfect sine: base sine with slowly decreasing amplitude plus minor noise jitter.
 * - Gravity pulls down; gusts increase horizontal velocity and can briefly add upward lift.
 * - When it hits the ground (top of .flower-garden__grass or container bottom), it stops, fades out, and is removed.
 * - If it exits the container bounds (right or top/bottom), it is removed.
 * - Respects prefers-reduced-motion and pauses when not visible.
 *
 * Config via window.LeavesConfig (optional):
 * {
 *   maxLeaves: 2,
 *   spawnMinMs: 8000,
 *   spawnMaxMs: 16000,
 *   burstChance: 0.35,    // chance to spawn 1-3 additional leaves shortly after
 *   burstMax: 3,
 *   sizeMinPx: 36,
 *   sizeMaxPx: 68,
 *   baseVX: 22,           // px/s base horizontal speed
 *   gustVXBoost: 140,     // px/s added at full gust (intensity ~1)
 *   gravity: 18,          // px/s^2 downward acceleration
 *   liftAtFullGust: 70,   // px/s temporary upward when gusting strongly
 *   curlAmpMin: 12,
 *   curlAmpMax: 34,
 *   curlDampTime: 9.0,    // seconds to decay curl amplitude ~to near zero
 *   curlFreqMin: 0.25,    // Hz, cycles per second
 *   curlFreqMax: 0.6,
 *   curlNoisePx: 2.2,     // small random jitter added to path
 *   rotVelZMin: -60,      // deg/s
 *   rotVelZMax: 90,
 *   rotVelXMin: -20,
 *   rotVelXMax: 20,
 *   rotVelYMin: -35,
 *   rotVelYMax: 35,
 * }
 */
(function () {
  if (typeof document === 'undefined') return;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const garden = document.querySelector('.flower-garden');
  if (!garden) return;

  // Merge config with defaults
  const cfg = Object.assign({
    maxLeaves: 2,
    spawnMinMs: 2000,
    spawnMaxMs: 5000,
    burstChance: 0.35,
    burstMax: 3,
    sizeMinPx: 24,
    sizeMaxPx: 48,
    baseVX: 22, // px/s
    gustVXBoost: 140, // px/s at full gust
    gravity: 16, // px/s^2
    liftAtFullGust: 20, // px/s upward at full gust
    curlAmpMin: 12,
    curlAmpMax: 34,
    curlDampTime: 9.0, // seconds
    curlFreqMin: 0.25,
    curlFreqMax: 0.6,
    curlNoisePx: 0,
    rotVelZMin: -60,
    rotVelZMax: 90,
    rotVelXMin: -20,
    rotVelXMax: 20,
    rotVelYMin: -35,
    rotVelYMax: 35,
  }, (window.LeavesConfig || {}));

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (min, max) => Math.random() * (max - min) + min;

  // Track active leaves
  const active = new Set();

  // Gust smoothing (share semantics with flowers.js)
  let gustTarget = 0;
  let gustValue = 0;
  let lastGustTs = 0;
  const HALF_LIFE_MS = 1600; // fade of gust target
  const RISE_TAU_MS = 220;
  const FALL_TAU_MS = 300;
  const LN2 = Math.log(2);

  const onGustRaw = (evt) => {
    const d = (evt && evt.detail) || {};
    const intensity = typeof d.intensity === 'number' ? clamp(d.intensity, 0, 1) : 0.5;
    const boost = clamp(intensity * 1.8 + 0.2, 0.2, 2.0); // 0.2..2.0
    gustTarget = Math.max(gustTarget, boost);
  };
  const deDup = (handler) => (evt) => {
    const ts = performance.now();
    if (ts - lastGustTs < 30) return;
    lastGustTs = ts;
    handler(evt);
  };
  window.addEventListener('garden:gust', deDup(onGustRaw));
  const windEl = document.getElementById('gardenwind');
  if (windEl) windEl.addEventListener('garden:gust', deDup(onGustRaw));

  // Visibility controls
  let isVisible = true;
  let isDocHidden = document.hidden;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.target === garden) isVisible = e.isIntersecting; });
    }, { threshold: 0.05 });
    obs.observe(garden);
  }
  document.addEventListener('visibilitychange', () => { isDocHidden = document.hidden; });

  // Utility: find ground Y
  const getGroundY = () => {
    const r = garden.getBoundingClientRect();
    const grass = garden.querySelector('.flower-garden__grass');
    // if (grass) {
    //   const gr = grass.getBoundingClientRect();
    //   // Top of grass relative to garden top
    //   return (gr.top - r.top);
    // }
    return r.height; // fallback: bottom of container
  };

  // Spawn a single leaf
  function spawnLeaf() {
    if (active.size >= cfg.maxLeaves) return;
    if (reducedMotion) return;

    const r = garden.getBoundingClientRect();
    const img = document.createElement('img');
    // Pick a random leaf image from the available set
    const leafImgs = [
      'images/flowers/leaf 1.png',
      'images/flowers/leaf 2.png',
      'images/flowers/leaf 3.png',
      'images/flowers/leaf 4.png',
      'images/flowers/leaf 5.png',
      'images/flowers/leaf 6.png',
      'images/flowers/leaf 7.png',
      'images/flowers/leaf 8.png'
    ];
    img.src = leafImgs[Math.floor(Math.random() * leafImgs.length)];
    img.alt = 'Decorative leaf';
    img.className = 'leaf';
    img.style.position = 'absolute';
    img.style.pointerEvents = 'none';
    img.style.willChange = 'transform, opacity';
    img.style.opacity = '1';
    img.style.transform = 'translate3d(-100px,0,0)';

    // Random size (height); width auto via intrinsic ratio
    const size = rand(cfg.sizeMinPx, cfg.sizeMaxPx);
    img.style.height = `${size.toFixed(0)}px`;
    img.style.width = 'auto';

    // Attach early to measure
    garden.appendChild(img);

    // Initial state
    const startY = rand(r.height * 0.05, r.height * 0.45); // enter not too high
    const state = {
      el: img,
      x: -rand(40, 140), // start off-screen left
      y: startY,
      vx: cfg.baseVX,
      vy: 0,
      ax: 0,
      ay: cfg.gravity,
      bornAt: performance.now(),
      // Curly path params
      phase: rand(0, Math.PI * 2),
      freq: rand(cfg.curlFreqMin, cfg.curlFreqMax),
      amp0: rand(cfg.curlAmpMin, cfg.curlAmpMax),
      // Rotation
      rotX: rand(0, 360),
      rotY: rand(0, 360),
      rotZ: rand(0, 360),
      rotVelX: rand(cfg.rotVelXMin, cfg.rotVelXMax),
      rotVelY: rand(cfg.rotVelYMin, cfg.rotVelYMax),
      rotVelZ: rand(cfg.rotVelZMin, cfg.rotVelZMax),
      groundY: getGroundY(),
      fading: false,
      dead: false,
    };

    active.add(state);
  }

  // Fade out and remove
  function fadeAndRemove(state) {
    if (state.fading || state.dead) return;
    state.fading = true;
    const el = state.el;
    el.style.transition = 'opacity 500ms ease-out';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      state.dead = true;
      active.delete(state);
    }, 520);
  }

  // Main animation loop
  let lastTs = performance.now();
  function tick() {
    const now = performance.now();
    let dt = (now - lastTs) / 1000; // seconds
    lastTs = now;

    // Skip heavy work if not visible or tab hidden
    if (!isVisible || isDocHidden) {
      requestAnimationFrame(tick);
      return;
    }

    // Gust decay and smoothing
    if (gustTarget > 0) {
      const k = LN2 / HALF_LIFE_MS;
      gustTarget *= Math.exp(-k * (dt * 1000));
      if (gustTarget < 0.005) gustTarget = 0;
    }
    const tau = gustValue < gustTarget ? RISE_TAU_MS : FALL_TAU_MS;
    const alpha = 1 - Math.exp(-(dt * 1000) / Math.max(1, tau));
    gustValue += (gustTarget - gustValue) * alpha;

    // Update each leaf
    const r = garden.getBoundingClientRect();
    const groundY = getGroundY();
    active.forEach((s) => {
      if (s.dead) return;

      // Recompute ground if layout changed significantly
      s.groundY = groundY;

      // Physics
      const gust = gustValue; // ~0..2
      const vx = cfg.baseVX + cfg.gustVXBoost * Math.min(1, gust);
      s.vx = Math.max(8, vx); // ensure always moving right

      // Lift component: stronger gust = more upward; short-lived
      const lift = cfg.liftAtFullGust * Math.min(1, gust);

      // Integrate velocities
      s.vy += (s.ay * dt) - (lift * dt);
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Curly path offset: damped sine + small jitter
      const t = (now - s.bornAt) / 1000;
      const damp = Math.exp(-t / Math.max(0.001, cfg.curlDampTime));
      const amp = s.amp0 * damp;
      const yOsc = Math.sin((t * Math.PI * 2) * s.freq + s.phase) * amp;
      const xOsc = Math.cos((t * Math.PI * 2) * s.freq * 0.6 + s.phase * 0.7) * (amp * 0.35);
      const jitterX = (Math.random() - 0.5) * cfg.curlNoisePx;
      const jitterY = (Math.random() - 0.5) * cfg.curlNoisePx;

      const drawX = s.x + xOsc + jitterX;
      const drawY = s.y + yOsc + jitterY;

      // Rotations update
      s.rotX += s.rotVelX * dt;
      s.rotY += s.rotVelY * dt;
      s.rotZ += s.rotVelZ * dt;

      // Ground collision
      const leafH = s.el.offsetHeight || 40;
      const bottomY = drawY + leafH * 0.5; // approximate bottom center
      if (!s.fading && bottomY >= s.groundY) {
        // Place on ground and fade out
        const ty = s.groundY - leafH * 0.5;
        s.el.style.transform = `translate3d(${drawX.toFixed(1)}px, ${ty.toFixed(1)}px, 0px) rotateZ(${s.rotZ.toFixed(1)}deg) rotateY(${s.rotY.toFixed(1)}deg) rotateX(${s.rotX.toFixed(1)}deg)`;
        fadeAndRemove(s);
        return;
      }

      // Offscreen cleanup: right or out of vertical bounds
      if (drawX > r.width + 60 || drawY < -80 || drawY > r.height + 80) {
        s.dead = true;
        if (s.el && s.el.parentNode) s.el.parentNode.removeChild(s.el);
        active.delete(s);
        return;
      }

      // Apply transform
      s.el.style.transform = `translate3d(${drawX.toFixed(1)}px, ${drawY.toFixed(1)}px, 0px) rotateZ(${s.rotZ.toFixed(1)}deg) rotateY(${s.rotY.toFixed(1)}deg) rotateX(${s.rotX.toFixed(1)}deg)`;
    });

    requestAnimationFrame(tick);
  }

  // Spawner with optional short bursts
  function scheduleNextSpawn(baseDelay) {
    const delay = typeof baseDelay === 'number' ? baseDelay : rand(cfg.spawnMinMs, cfg.spawnMaxMs);
    setTimeout(() => {
      if (!isVisible || isDocHidden) { scheduleNextSpawn(1200); return; }
      spawnLeaf();
      // Chance for a burst: spawn a few more with short gaps
      if (Math.random() < cfg.burstChance) {
        const extra = Math.floor(rand(1, cfg.burstMax + 1));
        for (let i = 0; i < extra; i++) {
          setTimeout(() => { spawnLeaf(); }, 220 + i * rand(180, 360));
        }
      }
      scheduleNextSpawn();
    }, delay);
  }

  // Start
  if (!reducedMotion) {
    requestAnimationFrame(tick);
    // Stagger initial spawn
    scheduleNextSpawn(rand(1200, 2600));
  }
})();

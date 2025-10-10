(function () {
  const shell = document.querySelector('[data-contact-animation-shell]');
  const heroSection = document.querySelector('.hero-section--contact');
  const contactSection = document.getElementById('contact');

  if (!shell || !heroSection) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const parseScrollRange = () => {
    const range = Number(shell.dataset.scrollRange);
    return Number.isFinite(range) && range > 0 ? range : 400;
  };

  let scrollRange = parseScrollRange();
  let scrollStart = 0;
  let contactEnd = 0;
  let playerInstance = null;
  let totalDuration = 0;
  let listenersAttached = false;
  let bootstrapped = false;

  const ensureSvgElement = () => new Promise((resolve) => {
    const existing = shell.querySelector('svg');
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const candidate = shell.querySelector('svg');
      if (candidate) {
        observer.disconnect();
        resolve(candidate);
      }
    });

    observer.observe(shell, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 10000);
  });

  const waitForSvgatorPlayer = (svgElement) => new Promise((resolve) => {
    if (!svgElement) {
      resolve(null);
      return;
    }

    let attempts = 0;
    const maxAttempts = 600;

    const tick = () => {
      if (svgElement.svgatorPlayer && typeof svgElement.svgatorPlayer.ready === 'function') {
        svgElement.svgatorPlayer.ready(resolve);
        return;
      }

      attempts += 1;
      if (attempts > maxAttempts) {
        resolve(null);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });

  const computeTotalDuration = (player) => {
    if (Number.isFinite(player.maxFiniteDuration) && player.maxFiniteDuration > 0) {
      return player.maxFiniteDuration;
    }
    if (player.iterations > 0 && player.duration) {
      return player.duration * player.iterations;
    }
    return player.duration || 1;
  };

  const updateAnchors = () => {
    scrollRange = parseScrollRange();
    const rect = heroSection.getBoundingClientRect();
    const heroBottom = window.scrollY + rect.bottom;
    scrollStart = heroBottom - window.innerHeight;
    contactEnd = scrollStart + scrollRange;
  };

  const onScroll = () => {
    if (!playerInstance) {
      return;
    }

    const currentScroll = window.scrollY;
    const viewportBottom = currentScroll + window.innerHeight;
    const beforeSection = viewportBottom < scrollStart;
    const afterSection = currentScroll > contactEnd;

    if (beforeSection) {
      shell.classList.remove('is-visible');
      playerInstance.pause();
      playerInstance.seekTo(0);
      return;
    }

    if (afterSection) {
      shell.classList.remove('is-visible');
      playerInstance.pause();
      playerInstance.seekTo(totalDuration);
      return;
    }

    shell.classList.add('is-visible');

    const delta = currentScroll - scrollStart;
    const progress = clamp(delta / scrollRange, 0, 1);
    playerInstance.seekTo(totalDuration * progress);
  };

  const onResize = () => {
    updateAnchors();
    onScroll();
  };

  const addListeners = () => {
    if (listenersAttached) {
      return;
    }

    listenersAttached = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  };

  const removeListeners = () => {
    if (!listenersAttached) {
      return;
    }

    listenersAttached = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };

  const onPrefersReducedMotion = (event) => {
    if (event.matches) {
      removeListeners();
      shell.classList.remove('is-visible');
      if (playerInstance) {
        playerInstance.pause();
        playerInstance.seekTo(0);
      }
      return;
    }

    bootstrap();

    if (playerInstance) {
      updateAnchors();
      addListeners();
      onScroll();
    }
  };

  const bootstrap = () => {
    if (bootstrapped) {
      return;
    }

    bootstrapped = true;

    ensureSvgElement()
      .then((svgElement) => waitForSvgatorPlayer(svgElement))
      .then((player) => {
        if (!player) {
          bootstrapped = false;
          return;
        }

        playerInstance = player;
        totalDuration = computeTotalDuration(player);
        playerInstance.pause();
        playerInstance.seekTo(0);

        shell.classList.add('is-ready');
        updateAnchors();
        addListeners();
        onScroll();
      })
      .catch(() => {
        bootstrapped = false;
        removeListeners();
      });
  };

  prefersReducedMotion.addEventListener('change', onPrefersReducedMotion);

  if (!prefersReducedMotion.matches) {
    bootstrap();
  }
})();

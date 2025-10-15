/**
 * Modern Website Utilities
 * Main application module with modern JavaScript features
 * 
 * Features:
 * - Loading screen with random humorous messages
 * - Smooth scrolling navigation
 * - Email contact form integration
 * - Interactive code editor demos
 * - Performance optimization with service workers
 * - Modern ES6+ architecture replacing legacy jQuery code
 * 
 * @author Mohammad Amin Hasanpour
 * @version 2.0.0 (Modernized from jQuery legacy code)
 * @since 2025
 */

// Development mode flag - set to false for production
const DEBUG_MODE = true;

// Utility function for conditional logging
const log = (...args) => {
  if (DEBUG_MODE) console.log(...args);
};

class WebsiteUtils {
  constructor() {
    this.loadStartTime = Date.now();
    this.minLoaderDuration = 4000;
    this.isScrolling = false;
    this.initializeApp();
  }

  /**
   * Initialize the application
   */
  initializeApp() {
    this.setupLoadingScreen();
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupAnalytics();
    this.setupEmailBox();
    this.setupServiceWorker();
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  /**
   * Handle DOM ready event
   */
  onDOMReady() {
    // Initialize components that require DOM to be ready
    this.setupCodeEditor();
    this.setupScrollableSlider();
    this.setupPlayfulCreativity();
    this.setupAboutPhotoBurst();
  }

  /**
   * Setup loading screen with modern async/await
   */
  setupLoadingScreen() {
    // If URL has ?skipLoading (presence only), bypass the loader immediately
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('skipLoading')) {
        this.removeLoaderScreen();
        return; // Skip scheduling loader timers
      }
    } catch (e) {
      // Ignore URL parsing errors and continue with normal flow
    }

    // Display random loading text
    display_random_loading_text("loader_main_text");
    
    // Setup skip button after 5 seconds
    setTimeout(() => this.showSkipButton(), 5000);
    
    // Handle window load event
    window.addEventListener('load', () => this.handleWindowLoad());
  }

  /**
   * Setup hover bursts for the About photo stack
   * - Emits randomized words/emojis from behind the front "me" image
  * - Particles shoot in any direction, with rotation and scale-up; fade away
   * - Respects prefers-reduced-motion
   */
  setupAboutPhotoBurst() {
    const stack = document.querySelector('.about__photo-stack');
    const emitter = stack ? stack.querySelector('.about__photo-stack__emitter') : null;
    if (!stack || !emitter) return;

    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined';
    
    // Elements we want to shake (exclude the emitter layer)
    const moveBlob = stack.querySelector('.about__photo--blob');
    const moveMe = stack.querySelector('.about__photo--me');
    const moveGlasses = stack.querySelector('.about__photo--sunglasses');
    const movingEls = [moveBlob, moveMe, moveGlasses].filter(Boolean);

  // Audio + effects: require click to start (no autoplay on hover)
    // Single Audio instance kept within this closure
    const beat = new Audio('images/my-photo-beat.mp3');
    beat.loop = true;
    beat.preload = 'auto';
    beat.volume = 0.5; // moderate volume
    
    let awaitingUserUnlock = false; // kept for safety, though we explicitly require a click now

  // Create a small muted mic hint in bottom-left to suggest clicking when autoplay is blocked
  const hint = document.createElement('div');
  hint.className = 'about__audio-hint';
  hint.setAttribute('aria-hidden', 'true');
  // Prefer Font Awesome icon if present; fallback to text
  hint.innerHTML = '<span class="icon"><i class="fa fa-volume-off" aria-hidden="true"></i></span><span>Click to play</span>';
  // Insert hint into stack so it sits on top
  stack.appendChild(hint);
  const showHint = () => hint.classList.add('is-visible');
  const hideHint = () => hint.classList.remove('is-visible');

    // Start music on user action only
    const startMusic = () => {
      if (!beat.paused) return;
      const playPromise = beat.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          hideHint();
        }).catch(() => {
          // In the unlikely case the first click didn't count as a gesture on some browsers,
          // arm a one-off unlock on the next direct interaction.
          awaitingUserUnlock = true;
          const unlock = () => {
            beat.play().catch(() => {/* swallow */});
            stack.removeEventListener('pointerdown', unlock);
            stack.removeEventListener('click', unlock);
            awaitingUserUnlock = false;
            hideHint();
          };
          stack.addEventListener('pointerdown', unlock, { once: true });
          stack.addEventListener('click', unlock, { once: true });
        });
      }
    };

    const stopMusic = () => {
      if (!beat.paused) {
        try { beat.pause(); } catch { /* ignore */ }
      }
      // Reset to start so each hover begins from the beginning
      try { beat.currentTime = 0; } catch { /* ignore */ }
    };

    // Positive words and fun emojis
    const WORDS = [
      'research', 'creative', 'enthusiast', 'idea', 'creativity', 'nature', 'calm', 'smile',
      'curious', 'kind', 'focused', 'tinyML', 'efficient', 'joy', 'build', 'learn', 'explore',
      'code', 'fun', 'happy', 'bright', 'inspire', 'grow', 'dream', 'hope', 'peace', 'love',
      'DL', 'ML', 'AI', 'intelligence'
    ];
    const EMOJIS = ['😀','😄','😊','😌','😍','🤩','✨','💡','🌿','🌟','💖','👍','🌈','🧠','🚀','🎯'];
    const PALETTE = ['#ff3300','#0099ff','#00cc00','#ff0066','#6666ff','#00ffcc','#ff33cc','#3399ff'];

    // Utility: random helpers
    const rand = (min, max) => Math.random() * (max - min) + min;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Create a token element (word or emoji)
    const makeToken = () => {
      const el = document.createElement('span');
      el.className = 'about-token';
      const useEmoji = Math.random() < 0.5;
      el.textContent = useEmoji ? pick(EMOJIS) : pick(WORDS);
      const color = pick(PALETTE);
      el.style.color = color;
      el.style.fontSize = `${rand(14, 28)}px`;
      el.style.left = '50%';
      el.style.top = `${rand(46, 56)}%`; // small vertical jitter from middle/back
      return el;
    };

    const animateToken = (el) => {
      if (reducedMotion) {
        // Static subtle appear/disappear
        el.style.opacity = '0';
        emitter.appendChild(el);
        setTimeout(() => el.remove(), 1200);
        return;
      }

      emitter.appendChild(el);

      // Any-direction trajectory
      const angle = rand(-210 * (Math.PI / 180), 30 * (Math.PI / 180));
      const distance = rand(120, 180);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = rand(-180, 180);
      const scaleTo = rand(1.2, 1.8);
      const dur = rand(0.9, 1.6);

      if (hasGSAP) {
        gsap.fromTo(el,
          { opacity: 0, xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.6, rotate: 0 },
          { opacity: 0.05, duration: dur * 0.15, ease: 'power2.out', onComplete: () => {
              gsap.to(el, { opacity: 1, duration: dur * 0.2, ease: 'power2.out' });
            }
          }
        );
        gsap.to(el, { x: dx, y: dy, scale: scaleTo, rotate: rot, duration: dur, ease: 'power3.out' });
        gsap.to(el, { opacity: 0, duration: dur * 0.35, ease: 'power1.out', delay: dur * 0.65, onComplete: () => el.remove() });
      } else {
        // Fallback using CSS transitions
        el.style.transition = `transform ${dur}s ease-out, opacity ${dur}s ease-out`;
        el.style.opacity = '1';
        requestAnimationFrame(() => {
          el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(${scaleTo})`;
          el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), dur * 1000 + 50);
      }
    };

    let hoverInterval = null;

    const startBurst = () => {
      if (hoverInterval) return; // already running
      // Emit tokens in small bursts
      hoverInterval = setInterval(() => {
        const count = Math.floor(rand(1, 3.5));
        for (let i = 0; i < count; i++) {
          const t = makeToken();
          setTimeout(() => animateToken(t), i * rand(60, 140));
        }
      }, 500); // <-- 500 ms between bursts
      
      // Show hint on every hover when audio isn't playing
      if (beat.paused) showHint();
    };

    const stopBurst = () => {
      if (hoverInterval) { clearInterval(hoverInterval); hoverInterval = null; }
      // Let existing particles finish; they'll self-remove
      stopMusic();
      hideHint();
      // Safety: also stop any pending/active shakes
      stopBeatShake();
      stack.classList.remove('is-playing');
    };

  // Beat-synced shake when music is playing
  let beatShakeTimer = null;
  let beatShakeDelayTimer = null;

    const doSmallShake = () => {
      if (!movingEls.length || reducedMotion) return;
      // Subtle randomized shake for each element
      movingEls.forEach((el, idx) => {
        const amp = 2 + Math.random() * 2; // 2-4 px
        const dur = 0.22 + Math.random() * 0.08; // ~0.22-0.30s
        const rot = (Math.random() - 0.5) * 1.2; // small rotation
        if (hasGSAP && window.gsap) {
          const tl = gsap.timeline();
          tl.to(el, { x: amp, y: -amp, rotate: `+=${rot}` , duration: dur * 0.34, ease: 'power2.out' })
            .to(el, { x: -amp, y: amp, rotate: `-=${rot}` , duration: dur * 0.34, ease: 'power2.inOut' })
            .to(el, { x: 0, y: 0, rotate: '+=0', duration: dur * 0.32, ease: 'power2.in' });
        } else {
          // Minimal fallback: avoid moving sunglasses to preserve base transform
          if (el.classList && el.classList.contains('about__photo--sunglasses')) return;
          const original = el.style.transform || '';
          el.style.transition = `transform ${dur}s ease-in-out`;
          el.style.transform = original + ` translate(${amp}px, ${-amp}px)`;
          setTimeout(() => {
            el.style.transform = original + ` translate(${-amp}px, ${amp}px)`;
            setTimeout(() => {
              el.style.transform = original;
            }, dur * 320);
          }, dur * 340);
        }
      });
    };

    const startBeatShake = () => {
      if (reducedMotion) return;
      if (beatShakeTimer || beatShakeDelayTimer) return;
      // Wait 2.5s to sync with the beat, then start ~1s shakes
      beatShakeDelayTimer = setTimeout(() => {
        doSmallShake();
        beatShakeTimer = setInterval(doSmallShake, 1000);
        beatShakeDelayTimer = null;
      }, 2500);
    };

    const stopBeatShake = () => {
      if (beatShakeTimer) {
        clearInterval(beatShakeTimer);
        beatShakeTimer = null;
      }
      if (beatShakeDelayTimer) {
        clearTimeout(beatShakeDelayTimer);
        beatShakeDelayTimer = null;
      }
      // Ensure all elements settle
      if (hasGSAP && window.gsap && movingEls.length) {
        movingEls.forEach(el => gsap.to(el, { x: 0, y: 0, duration: 0.12, ease: 'power1.out' }));
      }
    };

    // Start/stop shake and sunglasses based on actual audio state
    beat.addEventListener('playing', () => {
      stack.classList.add('is-playing');
      startBeatShake();
    });
    const onAudioStop = () => {
      stack.classList.remove('is-playing');
      stopBeatShake();
    };
    beat.addEventListener('pause', onAudioStop);
    beat.addEventListener('ended', onAudioStop);

    // Event wiring: hover/focus on the stack
    stack.addEventListener('mouseenter', startBurst);
    stack.addEventListener('mouseleave', stopBurst);
    stack.addEventListener('focusin', startBurst);
    stack.addEventListener('focusout', stopBurst);

    // Require explicit user action to start music/effects
    const onActivate = (e) => {
      // Only react if currently hovered/focused, but always allow click to start
      if (beat.paused) {
        startMusic();
        hideHint();
      }
    };
    // Support mouse/touch/pen
    stack.addEventListener('pointerdown', onActivate);
    stack.addEventListener('click', onActivate);
    // Keyboard accessibility: Enter/Space
    stack.setAttribute('tabindex', stack.getAttribute('tabindex') || '0');
    stack.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onActivate(e);
        e.preventDefault();
      }
    });

    // Safety: stop audio when page is hidden or window loses focus
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopBurst();
    });
    window.addEventListener('blur', () => stopBurst());
  }

  /**
   * Show skip loading button
   */
  showSkipButton() {
    const loader = document.querySelector(".loader_screen");
    if (loader && loader.style.visibility !== "hidden") {
      const skipButton = document.querySelector(".loader_skip");
      if (skipButton) {
        skipButton.style.visibility = "visible";
        skipButton.style.opacity = "1";
        skipButton.style.top = "0";
      }
    }
  }

  /**
   * Handle window load event with performance optimization
   */
  handleWindowLoad() {
    const loadEndTime = Date.now();
    const loadDuration = loadEndTime - this.loadStartTime;
    const additionalDelay = Math.max(0, this.minLoaderDuration - loadDuration);
    
    setTimeout(() => this.removeLoaderScreen(), additionalDelay);
  }

  /**
   * Remove loader screen with smooth transition
   */
  removeLoaderScreen() {
    const loader = document.querySelector(".loader_screen");
    if (loader) {
      loader.style.visibility = "hidden";
      loader.style.opacity = "0";
      
      // Show mobile welcome message after loader is removed
      this.showMobileWelcome();
      
      // Check for navigation parameter
      const url = new URL(window.location.href);
      if (url.searchParams.get("nav") === "true") {
        setTimeout(() => {
          window.location.href = "#dl";
        }, 5000);
      }
    }
  }

  /**
   * Setup modern navigation with proper accessibility
   */
  setupNavigation() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('[aria-controls="navDemo"]');
    const mobileMenu = document.getElementById("navDemo");
    
    if (mobileToggle && mobileMenu) {
      // Avoid double-toggling if inline onclick is already wired in HTML
      const hasInlineOnClick = mobileToggle.getAttribute('onclick') !== null;
      if (!hasInlineOnClick) {
        mobileToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleMobileMenu(mobileMenu, mobileToggle);
        });
      }
      
      // Close mobile menu when clicking on a link
      const mobileLinks = mobileMenu.querySelectorAll('a');
      mobileLinks.forEach(link => {
        const hasInlineOnClick = link.getAttribute('onclick') !== null;
        if (!hasInlineOnClick) {
          link.addEventListener('click', () => {
            this.closeMobileMenu(mobileMenu, mobileToggle);
          });
        }
      });
    }

    // Smooth scroll for navigation links
    this.setupSmoothScroll();
  }

  /**
   * Toggle mobile menu with accessibility support
   */
  toggleMobileMenu(menu, button) {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    
    if (isExpanded) {
      this.closeMobileMenu(menu, button);
    } else {
      this.openMobileMenu(menu, button);
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu(menu, button) {
    menu.classList.add("w3-show");
    button.setAttribute("aria-expanded", "true");
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(menu, button) {
    menu.classList.remove("w3-show");
    button.setAttribute("aria-expanded", "false");
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Setup scroll effects with modern intersection observer
   */
  setupScrollEffects() {
    // Use a more efficient scroll handler with requestAnimationFrame
    window.addEventListener('scroll', () => {
      if (!this.isScrolling) {
        requestAnimationFrame(() => {
          this.handleNavbarScroll();
          this.handleParallaxScroll();
          this.isScrolling = false;
        });
        this.isScrolling = true;
      }
    }, { passive: true });
    
    // Code editor visibility
    this.setupCodeEditorObserver();
  }

  /**
   * Handle navbar scroll effects
   */
  handleNavbarScroll() {
    const navbar = document.getElementById("navbar");
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
    if (navbar) {
      if (scrollTop > 100) {
        navbar.className = "w3-bar w3-card w3-animate-top w3-white";
      } else {
        navbar.className = "w3-bar";
      }
    }
  }

  /**
   * Handle parallax scroll effects for hero sections
   */
  handleParallaxScroll() {
    // Check if user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const scrollTop = window.pageYOffset;
    const heroSections = document.querySelectorAll('.hero-section');
    
    heroSections.forEach(section => {
      // Skip if parallax is explicitly disabled on this section
      const parallaxAttr = (section.getAttribute('data-parallax') || '').toLowerCase();
      const parallaxDisabled = section.classList.contains('no-parallax') ||
                               section.classList.contains('hero-section--no-parallax') ||
                               parallaxAttr === 'off' || parallaxAttr === 'false' || parallaxAttr === '0';
      if (parallaxDisabled) {
        section.style.setProperty('--parallax-transform', 'translate3d(0, 0, 0)');
        return;
      }

      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Check if section is at least partially visible
      const isVisible = rect.bottom > 0 && rect.top < windowHeight;
      
      if (isVisible) {
        const parallaxSpeed = 0.4;
        
        // Special handling for home section
        if (section.classList.contains('hero-section--home')) {
          // For home section, start with the background positioned to fill the top
          const homeParallaxOffset = scrollTop * parallaxSpeed;
          section.style.setProperty('--parallax-transform', `translate3d(0, ${homeParallaxOffset}px, 0)`);
        } else {
          // For other sections, use the original calculation
          const relativeScrollPos = scrollTop - sectionTop + (windowHeight / 2);
          const parallaxOffset = relativeScrollPos * parallaxSpeed - 0.2 * sectionHeight;
          section.style.setProperty('--parallax-transform', `translate3d(0, ${parallaxOffset}px, 0)`);
        }
      }
    });
  }

  /**
   * Setup code editor with Intersection Observer API
   */
  setupCodeEditorObserver() {
    const codeBlock = document.getElementById('coditor_nn_block');
    
    if (codeBlock && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && typeof write_code === 'function') {
            write_code(0);
          }
        });
      }, {
        threshold: 0.5
      });
      
      observer.observe(codeBlock);
    }
  }

  /**
   * Setup analytics tracking
   */
  setupAnalytics() {
    try {
      const url = new URL(window.location.href);
      const rec = url.searchParams.get("rec") || "true";
      const id = url.searchParams.get("i") || "";
      
      // Use fetch API instead of XMLHttpRequest
      this.sendAnalytics(id, rec);
    } catch (error) {
      console.warn('Analytics setup failed:', error);
    }
  }

  /**
   * Send analytics data with modern fetch API
   */
  async sendAnalytics(id, rec) {
    try {
      const response = await fetch(
        `https://people.compute.dtu.dk/moam/inforec/inforec.php?source=Home&id=${id}&rec=${rec}`,
        {
          method: 'GET',
          mode: 'no-cors'
        }
      );
      // Note: no-cors mode doesn't allow reading response, but that's okay for analytics
    } catch (error) {
      console.warn('Analytics request failed:', error);
    }
  }

  /**
   * Setup email box functionality
   */
  setupEmailBox() {
    // Setup with proper timing to ensure dependencies are loaded
    const initEmailBox = () => {
      if (typeof setupEmailBox === 'function') {
        setupEmailBox();
      } else {
        console.warn('Email box setup function not available yet');
      }
    };

    // Try immediate setup
    initEmailBox();
    
    // Fallback: try again after a short delay
    setTimeout(initEmailBox, 100);
    
    // Final fallback: try on window load
    window.addEventListener('load', initEmailBox);
  }

  /**
   * Setup code editor with improved error handling
   */
  setupCodeEditor() {
    const initCodeEditor = () => {
      // This will be handled by the existing coditor.js when it loads
      if (typeof write_code === 'function') {
        log('Code editor initialized successfully');
      }
    };

    // Wait for DOM to be ready and scripts to load
    if (document.readyState === 'complete') {
      initCodeEditor();
    } else {
      window.addEventListener('load', initCodeEditor);
    }
  }

  /**
   * Setup scrollable slider with dependency checking
   */
  setupScrollableSlider() {
    const initSlider = () => {
      // This will be handled by the existing scrollable_slider.js when jQuery is ready
      if (typeof $ !== 'undefined' && $.fn.tabs && $.fn.accordion) {
        log('Scrollable slider initialized successfully');
      }
    };

    // Wait for jQuery and jQuery UI to load
    if (document.readyState === 'complete') {
      initSlider();
    } else {
      window.addEventListener('load', initSlider);
    }
  }

  /**
   * Setup service worker for offline capabilities
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          log('[App] ServiceWorker registration successful:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                log('[App] New content available, will load on next visit');
              }
            });
          });
          
        } catch (error) {
          console.warn('[App] ServiceWorker registration failed:', error);
        }
      });
    }
  }

  /**
   * Show mobile welcome message for phone users
   */
  showMobileWelcome() {
    // Only show on mobile devices (screen width < 768px)
    if (window.innerWidth >= 768) {
      return;
    }

    const welcomeMessage = document.querySelector('.mobile-welcome');
    if (!welcomeMessage) {
      return;
    }

    // Check if user has already seen the message (using sessionStorage)
    const hasSeenMessage = sessionStorage.getItem('mobile-welcome-seen');
    if (hasSeenMessage) {
      return;
    }

    // Show the message after a short delay
    setTimeout(() => {
      welcomeMessage.classList.add('is-visible');
      
      // Setup close button
      const closeButton = welcomeMessage.querySelector('.mobile-welcome__close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.closeMobileWelcome();
        });
      }

      // Auto-hide after 8 seconds
      setTimeout(() => {
        if (welcomeMessage.classList.contains('is-visible')) {
          this.closeMobileWelcome();
        }
      }, 12000);
    }, 800);
  }

  /**
   * Close mobile welcome message
   */
  closeMobileWelcome() {
    const welcomeMessage = document.querySelector('.mobile-welcome');
    if (welcomeMessage) {
      welcomeMessage.classList.remove('is-visible');
      
      // Mark as seen in this session
      sessionStorage.setItem('mobile-welcome-seen', 'true');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        welcomeMessage.style.display = 'none';
      }, 600);
    }
  }

  /**
   * Setup playful hover for the colorful "creativity" word
   * - Per-letter bounce with slight randomization
   * - Color splash particles bursting from the hovered word
   * - Respects prefers-reduced-motion
   */
  setupPlayfulCreativity() {
    const root = document.getElementById('creativity');
    if (!root) return;

    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const letters = Array.from(root.querySelectorAll('.char'));

    // Ensure container has relative positioning for splash dots (CSS already sets)
    root.style.position = root.style.position || 'relative';

    // Utility: create colored splash dots
    const palette = [
      '#ff3300', '#e6b800', '#0099ff', '#00cc00', '#ff0066',
      '#6666ff', '#00ffcc', '#cc9900', '#ff33cc', '#3399ff'
    ];

    const createSplash = (x, y) => {
      if (reducedMotion) return;
      const DOT_COUNT = 12;
      for (let i = 0; i < DOT_COUNT; i++) {
        const dot = document.createElement('span');
        dot.className = 'splash-dot';
        dot.style.backgroundColor = palette[i % palette.length];
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        root.appendChild(dot);

        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const duration = 0.5 + Math.random() * 0.6;

        if (window.gsap) {
          gsap.fromTo(dot,
            { opacity: 1, x: 0, y: 0, scale: 0.6 },
            { opacity: 0, x: dx, y: dy, scale: 1, duration, ease: 'power2.out', onComplete: () => dot.remove() }
          );
        } else {
          // CSS fallback: simple transition and timed removal
          dot.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;
          requestAnimationFrame(() => {
            dot.style.opacity = '0';
            dot.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
          });
          setTimeout(() => dot.remove(), duration * 1000 + 50);
        }
      }
    };

    const bounceOnce = () => {
      if (reducedMotion) return;
      root.classList.add('is-bouncing');
      letters.forEach((el, idx) => {
        const delay = (idx * 0.04) + Math.random() * 0.035 + 0.15;
        if (window.gsap) {
          gsap.fromTo(el,
            { y: 0, scale: 1 },
            { y: -12 - Math.random() * 6, scale: 1.05, duration: 0.28, ease: 'power2.out', delay,
              yoyo: true, repeat: 1,
              onComplete: () => {
                // No-op; gsap returns to original after yoyo
              }
            }
          );
        } else {
          // CSS-only bounce is handled via keyframes when .is-bouncing is present
          // We can briefly force reflow to restart animations if needed
          // eslint-disable-next-line no-unused-expressions
          el.offsetHeight;
        }
      });
      // Remove the class after the wave ends
      setTimeout(() => root.classList.remove('is-bouncing'), 900);
    };

    const triggerEffects = (evt) => {
      const rect = root.getBoundingClientRect();
      const x = evt instanceof MouseEvent ? (evt.clientX - rect.left) : rect.width / 2;
      const y = evt instanceof MouseEvent ? (evt.clientY - rect.top) : rect.height / 2;
      bounceOnce();
      createSplash(x, y);
    };

    // Hover and focus events
    root.addEventListener('mouseenter', triggerEffects);
    root.addEventListener('click', triggerEffects);
    root.addEventListener('focus', triggerEffects);
    root.setAttribute('tabindex', '0');

    // Keyboard trigger (Enter/Space)
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        triggerEffects(e);
        e.preventDefault();
      }
    });
  }

  /**
   * Legacy support for isInViewport function
   * @deprecated Use Intersection Observer API instead
   */
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebsiteUtils;
}

// Initialize the application when script loads
const websiteApp = new WebsiteUtils();

// Make some functions globally available for backward compatibility
window.toggleFunction = () => {
  const menu = document.getElementById("navDemo");
  const button = document.querySelector('[aria-controls="navDemo"]');
  websiteApp.toggleMobileMenu(menu, button);
};

window.remove_loader_screen = () => {
  websiteApp.removeLoaderScreen();
};

// Legacy support for isInViewport function
window.isInViewport = WebsiteUtils.isInViewport;
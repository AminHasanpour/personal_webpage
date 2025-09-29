# Copilot: Working in this website repo

This repo is a static personal website (no build system). The entry point is `index.html`; assets live under `styles/`, `js/`, and `images/`. Some sub-pages sit in folders like `DragonEye/` and `etc/PCB/`.

- Architecture at a glance
  - `index.html` lays out sections (About, Deep Learning, Learning, Projects, Contact) and wires scripts in a specific order for compatibility.
  - `js/app.js` (WebsiteUtils) is the orchestrator: loader UX, navbar/mobile menu, smooth scroll, parallax, analytics beacon, Email box init, Service Worker registration, and a11y tweaks. It keeps a few legacy globals on `window` for backward compatibility.
  - Visual/interactive features:
    - Code demo: `js/coditor.js` drives the Python-like code animation; `js/nn.js` renders an SVG neural net with Snap.svg; `app.js` triggers `write_code(0)` when the block is visible via IntersectionObserver.
    - Garden wind: `js/wind.js` animates decorative wind strokes into `#gardenwind` (Snap.svg).
    - Loading text: `js/loading_text.js` exposes `display_random_loading_text(id)`; `app.js` calls it.
    - Email form: `js/email_box.js` uses EmailJS + GSAP to send messages and animate the button. Forms use the `.email-form` structure.
  - Styling: `styles/main.css` defines components, CSS custom properties, a11y helpers, and parallax backgrounds via `hero-section--*` classes.
  - PWA: `sw.js` is a simple service worker for offline cache.

- Script loading order (important)
  - Core first: jQuery, jQuery UI, GSAP (non-deferred). Feature scripts load with `defer` (Snap.svg, wind, nn, Prism, coditor, smooth-scrollbar, overscroll, scrollable_slider, EmailJS, email_box). Then `js/loading_text.js` and `js/app.js` load synchronously at the end.
  - When adding new scripts: prefer `defer`, avoid relying on jQuery-ready if not needed, and don’t break legacy globals. If you remove inline `onclick` handlers in HTML, ensure equivalent listeners are wired in `app.js` (it guards against double-binding).

- Parallax and motion
  - Parallax backgrounds are controlled by a CSS variable `--parallax-transform` set per section by `app.js`. Disable per-section with `.no-parallax`, `.hero-section--no-parallax`, or `data-parallax="off"`.
  - Always respect `prefers-reduced-motion`: both CSS and JS are written to degrade gracefully. Follow the same pattern for new effects.

- Cross-file contracts and IDs (don’t silently change)
  - Code editor: `#coditor_nn_block` container, `#editor` code element, `write_code(...)` global from `coditor.js`.
  - NN demo SVG id: `#neuralnet` (used by `nn.js`).
  - Garden wind SVG id: `#gardenwind` (used by `wind.js`).
  - Mobile menu: button with `aria-controls="navDemo"` and the `#navDemo` menu (toggled by `app.js`).
  - If you change any of these IDs or function names, update all references across HTML/JS.

- Email integration
  - `js/email_box.js` initializes EmailJS and calls `emailjs.send(serviceId, templateId, params)`. Keep service/template IDs and the public key in one place (this file) and avoid duplicating secrets elsewhere. New forms should reuse the `.email-form` markup and `textarea`/`button` expectations.

- Analytics beacon
  - `app.js` sends a GET to `https://people.compute.dtu.dk/moam/inforec/inforec.php?source=Home&id=<id>&rec=<true|false>` in `no-cors` mode; don’t rely on a response body. Validate and guard with try/catch for any changes.

- Service Worker and paths
  - `app.js` registers `'/sw.js'` and `sw.js` caches absolute paths like `'/index.html'`. If you deploy under a subpath (not site root), register `'sw.js'` (no leading slash) and change cache entries to relative paths. When you add/remove critical assets, update `CACHE_URLS` and bump `CACHE_NAME` to evict old caches.

- Accessibility conventions
  - Use `role`, `aria-label`, `aria-live`, and keyboard handlers. Clickable cards in Projects mimic buttons: `role="button"`, `tabindex="0"`, and an Enter/Space `onkeydown` handler. Keep and use `.sr-only` / `.sr-only-focusable` helpers.

- Local development
  - Most features work by opening `index.html` directly. Service workers require serving over HTTP(S). If needed, run a simple static server from the repo root (e.g., Python http.server or an `npx serve`). Ensure the server root matches the path style you chose for `sw.js` (see above).

- Adding a new section/page
  - Add a `hero-section hero-section--<name>` wrapper and define its background in `styles/main.css`. Use the `w3-content w3-container` structure for content and `loading="lazy"` with good `alt` text on images.

Questions to confirm
- Deployment path: is the site hosted at the domain root or under a subpath? This affects `sw.js` registration and cache URL styles.
- EmailJS: are the current service/template IDs and public key final, or should we parameterize them?
- Any preferred local server command to document for contributors?

Natan Lichtnow — Website
=========================

Purpose
-------
This static site was built to solve a single problem the author had: introduce visitors to the three different worlds they inhabit (Paraglider, Music/Flow Arts, and Dev) with a "pick your character" homepage that lets people choose which world to explore.

Quick overview
--------------
- Root HTML pages: index.html (the selector/pick-your-character landing), plus per-section pages under `paraglider/`, `music/`, and `dev/`.
- Languages: bilingual support (English and Brazilian Portuguese) via `window.NATAN_PAGE_TRANSLATIONS` defined per page. The runtime translations are applied by `js/internal-pages.js` which toggles text according to the selected language and persists the choice to `localStorage`.
- Styles: shared design system in `css/blocks/` (notably `css/blocks/hero.css` for the hero and scroll-cue), plus per-page CSS in `css/` (for page-specific tweaks).
- Scripts: `js/internal-pages.js` contains core behavior:
  - language switcher initialization and persistence
  - sticky topbar behavior
  - mobile menu open/close handling
  - smooth scroll and same-page anchor animation (recently added)
- Scroll cue: a decorative, accessible scroll hint implemented via the `.mh-hero__scroll` markup and styles in `css/blocks/hero.css`. Per-page scripts (small IIFEs) hide the cue on scroll or click.

Notable files
-------------
- `index.html` — the landing "pick your character" selector that links to the three worlds.
- `paraglider/` — pages about paragliding (`index.html`, `journey.html`, `projects.html`). Uses `css/paraglider-*.css` for layout and theme.
- `music/` — music and flow-arts pages (including `flow-arts-experience.html` and `history.html`). Uses `css/blocks/music.css` and related files.
- `dev/` — development / portfolio pages.
- `css/blocks/hero.css` — centralized hero & scroll-cue styles used across sections.
- `css/internal.css` — project-wide utility and critical styles.
- `js/internal-pages.js` — main client-side behavior (language switch, smooth scrolling, sticky header, mobile menu).

Local preview
-------------
1. Start your local server (Live Server in VS Code is recommended).
2. Open `index.html` and pick one of the three worlds.
3. Hard-refresh (Ctrl/Cmd+Shift+R or Ctrl+F5) if assets/cache are stale after edits.

Editing notes and conventions
-----------------------------
- Translations: Each page defines `window.NATAN_PAGE_TRANSLATIONS` in a small inline `<script>` block. Keys match `data-i18n` attributes on elements. To add strings, add the key to both `pt-BR` and `en` objects and update markup's `data-i18n` or `data-i18n-attr` where appropriate.
- Scroll cue: Place the `.mh-hero__scroll` element as a direct child of the hero so `css/blocks/hero.css` positioning variants work consistently. If a page needs the cue to overlap artwork, use the modifier `.mh-hero__scroll--over` and ensure the hero container allows overflow where required.
- Scripts: Keep page-specific tiny IIFEs near the bottom of the page (after `NATAN_PAGE_TRANSLATIONS`) so translations and DOM are available. Global behaviors live in `js/internal-pages.js`.
- Favicon: Site now uses `/img/icon.png` (root-relative). Update the file in `/img/` when needed.

Accessibility & preferences
---------------------------
- Motion-sensitive preferences: `prefers-reduced-motion` is respected for animations/scroll behavior.
- Semantic anchors and aria attributes are included for the language switcher, navigation, and dialog elements.

Testing checklist
-----------------
- Language toggle: click PT/EN in the topbar and verify translations are applied and persisted across reloads.
- Scroll cue: verify the cue animates, and disappears after scrolling or by clicking it.
- Smooth scroll: click an anchor link that points to an in-page ID and confirm animated scrolling (or native behavior if reduced motion enabled).
- Favicon: ensure `/img/icon.png` is present and the browser shows the site icon (may require a hard refresh).

If something breaks
-------------------
- Confirm `css/blocks/hero.css` is included in the page head (hero visuals and the cue live there).
- Confirm the page defines `window.NATAN_PAGE_TRANSLATIONS` before `js/internal-pages.js` loads.
- Use browser devtools Network tab to ensure `/img/icon.png` loads and that `/css/blocks/hero.css` returns 200.

Contact / Author note
---------------------
This site was designed to introduce visitors to three different parts of the author's life in a playful way — the landing acts like a "pick your character" gateway so visitors can explore the world that interests them most.

---
Generated and updated by in-repo automation (editor assistant). If you'd like, I can:
- Add a quick CONTRIBUTING.md with editing guidelines, or
- Create a small shell script for launching Live Server or a lightweight Python static server for preview.

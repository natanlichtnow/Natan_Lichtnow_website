(function () {
  'use strict';

  const STORAGE_KEY = 'natanlichtnow-language';
  const SUPPORTED_LANGUAGES = ['pt-BR', 'en'];
  const translations = window.NATAN_PAGE_TRANSLATIONS || {};
  let languageButtons = [];

  function resolveInitialLanguage () {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      return storedLanguage;
    }

    const browserLanguage = window.navigator.language;
    return browserLanguage && browserLanguage.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
  }

  function updateLanguageButtons (language) {
    languageButtons.forEach(button => {
      const isActive = button.dataset.lang === language;
      button.classList.toggle('c-language-switcher__option--is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyTranslations (language) {
    const copy = translations[language] || translations.en || {};

    document.documentElement.lang = language;
    if (copy.pageTitle) {
      document.title = copy.pageTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.dataset.i18n;
      const value = copy[key];

      if (!value) {
        return;
      }

      if (node.dataset.i18nAttr) {
        node.setAttribute(node.dataset.i18nAttr, value);
        return;
      }

      // On very narrow viewports, prefer explicit line-breaks for the hero title
      // so long headings (e.g. "História de vida") can be rendered as stacked
      // words. We insert newline characters and rely on CSS `white-space: pre-line`
      // at small sizes to honor them.
      // store the original untranslated string on the node for dynamic resize handling
      node.dataset.i18nOriginal = value;

      if (key === 'heroTitle' && window.innerWidth <= 455) {
        node.textContent = value.split(' ').join('\n');
      } else {
        node.textContent = value;
      }
    });

    window.localStorage.setItem(STORAGE_KEY, language);
    updateLanguageButtons(language);
  }

  function initLanguageSwitcher () {
    // ensure we query buttons at init-time (in case DOM changed)
    languageButtons = Array.from(document.querySelectorAll('[data-lang]'));
    const initialLanguage = resolveInitialLanguage();

    languageButtons.forEach(button => {
      button.addEventListener('click', () => {
        try {
          applyTranslations(button.dataset.lang);
        } catch (e) {
          console.warn('Language switch failed', e);
        }
      });
    });

    try {
      applyTranslations(initialLanguage);
    } catch (e) {
      console.warn('Applying initial translations failed', e);
    }
  }

  function initStickyTopbar () {
    const topbar = document.querySelector('.c-topbar');
    if (!topbar) { return; }

    const onScroll = function () {
      topbar.classList.toggle('is-scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMobileMenu () {
    const topbar = document.querySelector('.c-topbar');
    const menuToggle = document.querySelector('.c-topbar__menu-toggle');
    const nav = document.querySelector('.c-topbar__nav');
    const overlay = document.querySelector('.c-topbar__menu-overlay');

    if (!topbar || !menuToggle || !nav || !overlay) {
      return;
    }

    const mobileQuery = window.matchMedia('(max-width: 700px)');

    function setOpenState (isOpen) {
      nav.classList.toggle('is-open', isOpen);
      overlay.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      topbar.classList.toggle('has-open-menu', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu () {
      setOpenState(false);
    }

    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setOpenState(!isOpen);
    });

    overlay.addEventListener('click', closeMenu);

    nav.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('a')) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    mobileQuery.addEventListener('change', event => {
      if (!event.matches) {
        closeMenu();
      }
    });
  }

  initLanguageSwitcher();
  initStickyTopbar();
  initMobileMenu();

  /* Smooth-scroll handler for same-page anchor links with custom easing on small devices.
     Respects `prefers-reduced-motion: reduce` and falls back to native behavior otherwise. */
  function initSmoothScroll() {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

      function scrollToY(targetY, duration) {
        const startY = window.scrollY || window.pageYOffset;
        const diff = targetY - startY;
        let start;
        if (!duration || duration <= 0) { window.scrollTo(0, targetY); return; }
        function step(timestamp) {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const t = Math.min(1, elapsed / duration);
          const eased = easeInOutCubic(t);
          window.scrollTo(0, Math.round(startY + diff * eased));
          if (elapsed < duration) {
            window.requestAnimationFrame(step);
          }
        }
        window.requestAnimationFrame(step);
      }

      document.addEventListener('click', function (e) {
        const el = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
        if (!el) return;
        const href = el.getAttribute('href');
        if (!href || href === '#' || href.indexOf('#') !== 0) return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        // Only intercept same-page anchor clicks (no cross-origin or file changes)
        e.preventDefault();

        // compute offset (account for sticky topbar height)
        const topbar = document.querySelector('.c-topbar');
        const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - Math.round(topbarHeight));

        // duration scaled by distance, capped
        const distance = Math.abs(window.scrollY - targetY);
        const base = window.innerWidth <= 800 ? 420 : 600; // slightly snappier on small screens
        const duration = Math.min(900, Math.max(280, Math.round((distance / window.innerHeight) * base)));

        scrollToY(targetY, duration);
      }, { passive: false });
    } catch (err) {
      // best-effort: if anything fails, allow native behavior
      console.warn('Smooth scroll init failed', err);
    }
  }

  initSmoothScroll();

  // Re-apply hero title formatting on resize so injected newlines stay in sync
  (function attachHeroResizeHandler() {
    let timer = null;
    function applyHeroFormatting() {
      const nodes = document.querySelectorAll('[data-i18n="heroTitle"]');
      nodes.forEach(node => {
        const original = node.dataset.i18nOriginal || node.textContent || '';
        if (window.innerWidth <= 455) {
          node.textContent = original.split(' ').join('\n');
        } else {
          node.textContent = original.replace(/\n/g, ' ');
        }
      });
    }

    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(applyHeroFormatting, 120);
    }, { passive: true });
  }());
}());

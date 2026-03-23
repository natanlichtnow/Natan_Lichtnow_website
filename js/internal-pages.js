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

      node.textContent = value;
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
}());

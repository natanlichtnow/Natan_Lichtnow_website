/* ==========================================================================
   Natan Lichtnow — Particle Network Background
   Draws a field of slowly drifting particles that connect with lines
   when they come within range of each other, creating a living network
   grid effect on the canvas behind the character selection screen.
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'natanlichtnow-language';
  const SUPPORTED_LANGUAGES = ['pt-BR', 'en'];
  const translations = {
    'pt-BR': {
      languageLabel: 'IDIOMA',
      prompt: '► SELECIONE SEU MUNDO ◄',
      pilotAriaLabel: 'Entrar no universo de voo livre',
      pilotImageAlt: 'Paraglider voando acima das montanhas',
      pilotName: 'PARAGLIDER',
      pilotClass: 'PILOTO & INSTRUTOR',
      pilotLore: 'Caçando liberdade abaixo das nuvens. Uma vida vivida em altitude.',
      pilotStatAltitude: 'ALTITUDE',
      pilotStatFreedom: 'LIBERDADE',
      pilotStatAdventure: 'AVENTURA',
      musicAriaLabel: 'Entrar no universo de música e flow arts',
      musicImageAlt: 'Performance de música e flow arts',
      musicName: 'MÚSICA &',
      musicClass: 'FLOW ARTS',
      musicLore: 'Entre som e movimento, uma linguagem que vai além das palavras.',
      musicStatRhythm: 'RITMO',
      musicStatFlowState: 'FLOW',
      musicStatVibe: 'VIBE',
      devAriaLabel: 'Entrar no universo de desenvolvimento web',
      devImageAlt: 'Desenvolvedor web trabalhando',
      devName: 'WEB',
      devClass: 'DESENVOLVEDOR',
      devLore: 'Arquiteto de mundos digitais. Construindo experiências para resolver seus problemas.',
      devStatLogic: 'LÓGICA',
      devStatCreativity: 'CRIATIVIDADE',
      devStatPrecision: 'PRECISÃO',
      enterWorld: 'ENTRAR',
      copyright: '© 2026 NATAN LICHTNOW — TODOS OS DIREITOS RESERVADOS',
      pageTitle: 'Natan Lichtnow'
    },
    en: {
      languageLabel: 'LANG',
      prompt: '► SELECT YOUR WORLD ◄',
      pilotAriaLabel: 'Enter the Paraglider Pilot world',
      pilotImageAlt: 'Paraglider soaring above mountains',
      pilotName: 'PARAGLIDER',
      pilotClass: 'PILOT & INSTRUCTOR',
      pilotLore: 'Chasing freedom under the clouds. A life lived at altitude.',
      pilotStatAltitude: 'ALTITUDE',
      pilotStatFreedom: 'FREEDOM',
      pilotStatAdventure: 'ADVENTURE',
      musicAriaLabel: 'Enter the Music and Flow Arts world',
      musicImageAlt: 'Music and flow arts performance',
      musicName: 'MUSIC &',
      musicClass: 'FLOW ARTS',
      musicLore: 'Between sound and movement, a language beyond words.',
      musicStatRhythm: 'RHYTHM',
      musicStatFlowState: 'FLOW STATE',
      musicStatVibe: 'VIBE',
      devAriaLabel: 'Enter the Web Developer world',
      devImageAlt: 'Web developer at work',
      devName: 'WEB',
      devClass: 'DEVELOPER',
      devLore: 'Architect of digital worlds. Building experiences to solve your problems.',
      devStatLogic: 'LOGIC',
      devStatCreativity: 'CREATIVITY',
      devStatPrecision: 'PRECISION',
      enterWorld: 'ENTER WORLD',
      copyright: '© 2026 NATAN LICHTNOW — ALL RIGHTS RESERVED',
      pageTitle: 'Natan Lichtnow'
    }
  };

  /* ---- Config ---- */
  const CFG = {
    count:      75,
    maxRadius:  1.8,
    minRadius:  0.4,
    linkDist:   150,
    speed:      0.3,
    color:      '110, 110, 200',   /* RGB used in rgba() strings */
    mouseRange: 180,
    mouseForce: 0.018,
  };

  /* ---- State ---- */
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  const mouse  = { x: -9999, y: -9999 };
  const languageButtons = Array.from(document.querySelectorAll('[data-lang]'));
  let   particles = [];

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
    const copy = translations[language] || translations.en;

    document.documentElement.lang = language;
    document.title = copy.pageTitle;

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

  function setupLanguageSwitcher () {
    const initialLanguage = resolveInitialLanguage();

    languageButtons.forEach(button => {
      button.addEventListener('click', () => {
        applyTranslations(button.dataset.lang);
      });
    });

    applyTranslations(initialLanguage);
  }

  /* ======================================================================
     Particle class
     ====================================================================== */
  class Particle {
    constructor (initialise) {
      this._spawn(initialise);
    }

    _spawn (randomY) {
      this.x      = Math.random() * canvas.width;
      this.y      = randomY ? Math.random() * canvas.height : canvas.height + 4;
      this.vx     = (Math.random() - 0.5) * CFG.speed;
      this.vy     = (Math.random() - 0.5) * CFG.speed;
      this.radius = Math.random() * (CFG.maxRadius - CFG.minRadius) + CFG.minRadius;
      this.alpha  = Math.random() * 0.45 + 0.1;
    }

    update () {
      /* Subtle mouse repulsion */
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < CFG.mouseRange && dist > 0) {
        const force = CFG.mouseForce * (1 - dist / CFG.mouseRange);
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      /* Apply velocity with a soft speed cap */
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > CFG.speed * 2) {
        this.vx *= (CFG.speed * 2) / speed;
        this.vy *= (CFG.speed * 2) / speed;
      }

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap around all four edges */
      if (this.x < -10)                  this.x = canvas.width  + 10;
      if (this.x > canvas.width  + 10)   this.x = -10;
      if (this.y < -10)                  this.y = canvas.height + 10;
      if (this.y > canvas.height + 10)   this.y = -10;
    }

    draw () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  /* ======================================================================
     Draw connection lines between close particle pairs
     ====================================================================== */
  function drawLinks () {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < CFG.linkDist) {
          const alpha = (1 - dist / CFG.linkDist) * 0.13;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CFG.color}, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  /* ======================================================================
     Resize — keep canvas exactly full-screen
     ====================================================================== */
  function resize () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ======================================================================
     Init
     ====================================================================== */
  function init () {
    resize();
    particles = Array.from(
      { length: CFG.count },
      () => new Particle(true)  /* true = scatter Y randomly on first spawn */
    );
  }

  /* ======================================================================
     Animation loop
     ====================================================================== */
  function loop () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLinks();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  /* ======================================================================
     Event listeners
     ====================================================================== */
  window.addEventListener('resize', () => {
    resize();
    /* Re-anchor any particles that landed outside the new bounds */
    particles.forEach(p => {
      if (p.x > canvas.width || p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      }
    });
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* Reset mouse position when cursor leaves the window */
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* ======================================================================
     Boot
     ====================================================================== */
  setupLanguageSwitcher();
  init();
  loop();
}());

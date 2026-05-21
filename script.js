/* ═══════════════════════════════════════════════════════════════
   ORCHESTRATEUR PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

const App = {
  currentIndex:    0,
  revealedLetters: [],
  currentEnigma:   null,
  _starsFrame:     null,
  _confettiFrame:  null,

  /* ─────────────────────────────────────────────────────────────
     Initialisation (appelée au DOMContentLoaded)
  ───────────────────────────────────────────────────────────── */
  init() {
    this._initStars();
  },

  /* ─────────────────────────────────────────────────────────────
     Démarrage du jeu
  ───────────────────────────────────────────────────────────── */
  start() {
    this.currentIndex    = 0;
    this.revealedLetters = new Array(ENIGMA_CONFIG.length).fill(null);
    document.getElementById('riddle-total').textContent = ENIGMA_CONFIG.length;
    this._renderSlots('letter-slots');
    this._showScreen('screen-riddle');
    this._loadEnigma(0);
  },

  /* ─────────────────────────────────────────────────────────────
     Chargement d'une énigme par son index
  ───────────────────────────────────────────────────────────── */
  _loadEnigma(index) {
    const total  = ENIGMA_CONFIG.length;
    const config = ENIGMA_CONFIG[index];

    /* Mise à jour de l'en-tête */
    document.getElementById('riddle-number').textContent = index + 1;
    document.getElementById('progress-fill').style.width =
      `${(index / total) * 100}%`;

    /* Réinitialisation de l'UI */
    document.getElementById('btn-next').classList.add('hidden');
    document.getElementById('feedback').className = 'feedback hidden';

    /* Montage du mini-jeu */
    if (this.currentEnigma) this.currentEnigma.destroy();
    this.currentEnigma = EnigmaRegistry.create(config);
    this.currentEnigma.onSolve(letter => this._onSolved(index, letter));
    this.currentEnigma.mount(document.getElementById('enigma-container'));
  },

  /* ─────────────────────────────────────────────────────────────
     Callback : énigme résolue
  ───────────────────────────────────────────────────────────── */
  _onSolved(index, letter) {
    this.revealedLetters[index] = letter;

    /* Révéler la case correspondante */
    const slot = document.getElementById(`letter-slots-slot-${index}`);
    if (slot) { slot.textContent = letter; slot.classList.add('revealed'); }

    /* Avancer la barre de progression */
    document.getElementById('progress-fill').style.width =
      `${((index + 1) / ENIGMA_CONFIG.length) * 100}%`;

    /* Feedback */
    const fb = document.getElementById('feedback');
    fb.textContent = `Bravo ! Le chiffre "${letter}" est révélé ✨`;
    fb.className = 'feedback success';

    /* Bouton suivant avec un léger délai */
    setTimeout(() => {
      document.getElementById('btn-next').classList.remove('hidden');
    }, 800);
  },

  /* ─────────────────────────────────────────────────────────────
     Bouton "Énigme suivante"
  ───────────────────────────────────────────────────────────── */
  nextRiddle() {
    this.currentIndex++;
    if (this.currentIndex >= ENIGMA_CONFIG.length) {
      this._showFinalScreen();
    } else {
      this._loadEnigma(this.currentIndex);
    }
  },

  /* ─────────────────────────────────────────────────────────────
     Écran final — toutes les lettres réunies
  ───────────────────────────────────────────────────────────── */
  _showFinalScreen() {
    const finalSlots = document.getElementById('final-letter-slots');
    finalSlots.innerHTML = ENIGMA_CONFIG.map((_, i) =>
      `<div class="letter-slot revealed shimmer">${this.revealedLetters[i] || ''}</div>`
    ).join('');
    this._showScreen('screen-final');
  },

  /* ─────────────────────────────────────────────────────────────
     Révélation du sexe — image centrée + fond palette
  ───────────────────────────────────────────────────────────── */
  reveal() {
    this._showScreen('screen-reveal');

    const rc     = (typeof REVEAL_CONFIG !== 'undefined') ? REVEAL_CONFIG[GENDER] : null;
    const screen = document.getElementById('screen-reveal');
    const img    = document.getElementById('reveal-character');

    /* Fond : dégradé radial tiré de la palette (pas l'image) */
    if (rc) {
      const p   = rc.palette;
      const hex = h => { const v = parseInt(h.slice(1),16); return `${v>>16},${(v>>8)&255},${v&255}`; };
      screen.style.background = [
        `radial-gradient(ellipse at 40% 30%, rgba(${hex(p[1])},0.55) 0%, transparent 55%)`,
        `radial-gradient(ellipse at 70% 75%, rgba(${hex(p[2])},0.35) 0%, transparent 50%)`,
        `linear-gradient(160deg, rgba(${hex(p[3])},0.96) 0%, rgba(${hex(p[4])},0.85) 60%, rgba(${hex(p[3])},0.96) 100%)`,
      ].join(', ');
    }

    /* Image du personnage */
    if (rc && rc.image) {
      img.src = rc.image;
      img.classList.remove('animate-in');
      /* Attendre que l'image soit chargée avant d'animer */
      const doAnimate = () => setTimeout(() => img.classList.add('animate-in'), 200);
      if (img.complete && img.naturalWidth) {
        doAnimate();
      } else {
        img.onload = doAnimate;
      }
    }

    /* Confettis aux couleurs de la palette */
    const colors = rc
      ? [rc.palette[0], rc.palette[1], rc.palette[4] || rc.palette[2], '#ffffff']
      : ['#D7A450', '#8C5E26', '#124019', '#ffffff'];
    this._startConfetti(colors);
  },


  /* ─────────────────────────────────────────────────────────────
     Palette de couleurs par énigme (CSS variables sur :root)
     p[0] accent clair  p[1] accent   p[2] bord/secondaire
     p[3] très sombre   p[4] mi-ton
  ───────────────────────────────────────────────────────────── */
  _applyPalette(p) {
    const root = document.documentElement;
    if (p && p.length >= 4) {
      const hex = h => { const v = parseInt(h.slice(1),16); return `${v>>16},${(v>>8)&255},${v&255}`; };
      root.style.setProperty('--e-accent', p[0]);
      root.style.setProperty('--e-p1',     p[1] || p[0]);
      root.style.setProperty('--e-p2',     p[2]);
      root.style.setProperty('--e-border', `rgba(${hex(p[0])},0.35)`);
      root.style.setProperty('--e-glow',   `rgba(${hex(p[0])},0.28)`);
    } else {
      /* Reset vers la palette dorée par défaut */
      root.style.setProperty('--e-accent', 'var(--gold)');
      root.style.setProperty('--e-p1',     'var(--gold)');
      root.style.setProperty('--e-p2',     'var(--brown)');
      root.style.setProperty('--e-border', 'var(--card-border)');
      root.style.setProperty('--e-glow',   'rgba(215,164,80,0.33)');
    }
  },

  /* ─────────────────────────────────────────────────────────────
     Helpers — navigation entre écrans
  ───────────────────────────────────────────────────────────── */
  _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  /* ─────────────────────────────────────────────────────────────
     Helpers — rendu des cases de lettres
  ───────────────────────────────────────────────────────────── */
  _renderSlots(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ENIGMA_CONFIG.map((cfg, i) => {
      const letter   = this.revealedLetters[i] || '';
      const revealed = letter ? ' revealed' : '';
      return `<div class="letter-slot${revealed}" id="${containerId}-slot-${i}">${letter}</div>`;
    }).join('');
  },

  /* ─────────────────────────────────────────────────────────────
     Animation — étoiles (écran d'accueil)
  ───────────────────────────────────────────────────────────── */
  _initStars() {
    const canvas = document.getElementById('stars-canvas');
    const ctx    = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#D7A450', '#8C5E26', '#f0c878', '#124019', '#f0d8a8'];
    const stars  = Array.from({ length: 90 }, () => ({
      x:          Math.random() * canvas.width,
      y:          Math.random() * canvas.height,
      r:          Math.random() * 2.2 + 0.4,
      alpha:      Math.random(),
      alphaDir:   Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: Math.random() * 0.007 + 0.002,
      speedY:     Math.random() * 0.25 + 0.04,
      color:      COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.alphaDir * s.alphaSpeed;
        if (s.alpha >= 1) { s.alpha = 1; s.alphaDir = -1; }
        if (s.alpha <= 0) { s.alpha = 0; s.alphaDir = 1; }
        s.y -= s.speedY;
        if (s.y < -4) { s.y = canvas.height + 4; s.x = Math.random() * canvas.width; }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle   = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      this._starsFrame = requestAnimationFrame(tick);
    };
    tick();
  },

  /* ─────────────────────────────────────────────────────────────
     Animation — confettis (écran de révélation)
  ───────────────────────────────────────────────────────────── */
  _startConfetti(colors) {
    const canvas = document.getElementById('confetti-canvas');
    const ctx    = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 160 }, () => ({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height - canvas.height,
      w:      Math.random() * 10 + 5,
      h:      Math.random() * 5 + 3,
      color:  colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 1.8,
      speedX: (Math.random() - 0.5) * 2,
      angle:  Math.random() * Math.PI * 2,
      spin:   (Math.random() - 0.5) * 0.14,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      this._confettiFrame = requestAnimationFrame(tick);
    };
    tick();
  },

  _stopConfetti() {
    if (this._confettiFrame) {
      cancelAnimationFrame(this._confettiFrame);
      this._confettiFrame = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

/* ═══════════════════════════════════════════════════════════════
   DEBUG — touche  ²  (le carré à gauche du 1) pour valider l'énigme en cours
   Pour désactiver : commenter le bloc ci-dessous
   ═══════════════════════════════════════════════════════════════ */
// document.addEventListener('keydown', e => {
//  if (e.key === '²' && App.currentEnigma) App.currentEnigma.solve();
// });
/* ─── fin DEBUG ─────────────────────────────────────────────── */

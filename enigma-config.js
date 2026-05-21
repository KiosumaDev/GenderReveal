/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION DU GENDER REVEAL
   ───────────────────────────────────────────────────────────────
   1. GENDER      → 'girl' pour fille, 'boy' pour garçon
   2. ENIGMA_CONFIG → tableau des 4 énigmes dans l'ordre

   Les 4 lettres forment le mot ✨ LUNE ✨
   (clin d'œil à Mayari, déesse philippine de la lune)
   ═══════════════════════════════════════════════════════════════ */

// ← MODIFIEZ ICI : 'girl' pour fille, 'boy' pour garçon
const GENDER = 'girl';

/* ════════════════════════════════════════════════════════
   RÉVÉLATION FINALE — image + palette selon le sexe
   girl → Mayari  |  boy → Aaron
════════════════════════════════════════════════════════ */
const REVEAL_CONFIG = {
  girl: {
    image:    'assets/Mayari.png',
    palette:  ['#F2CAB3', '#BF6E50', '#BF8975', '#402A25', '#8C4842'],
    text:     "C'est une fille !",
    subtitle: "Une petite princesse arrive bientôt ! 🌙",
  },
  boy: {
    image:    'assets/Aaron.png',
    palette:  ['#F2B279', '#F2CAA7', '#A66038', '#734E38', '#BF8A6B'],
    text:     "C'est un garçon !",
    subtitle: "Un petit garçon est en chemin ! ✨",
  },
};

const ENIGMA_CONFIG = [
  
  /* ════════════════════════════════════════════════════════
     ÉNIGME 3 — Puzzle  →  lettre N
     Déposez votre image dans assets/puzzle.jpg
     (pas besoin de la découper, le JS le fait via CSS)
  ════════════════════════════════════════════════════════ */
  {
    type: 'puzzle',
    letter: '2',
    emoji: '🧩',
    image: 'assets/puzzle.png',
    cols: 5,
    rows: 5,
    clue: 'Reconstituez l\'image pour découvrir le premier chiffre.',
  },

  /* ════════════════════════════════════════════════════════
     ÉNIGME 1 — Trouver le prénom : MAYARI  →  lettre L
     Mayari = déesse philippine de la lune et de la beauté
  ════════════════════════════════════════════════════════ */
  {
    type: 'riddle',
    letter: '8',
    emoji: '🌙',
    question: `Je viens d'un monde ancien,<br>
où les histoires naissaient avant les livres.<br><br>
On m'associe à ce que l'on voit sans le toucher,<br>
à ce qui apparaît quand le ciel se libère du jour.<br><br>
Je ne produis rien par moi-même,<br>
mais sans moi, beaucoup avanceraient à l'aveugle.<br><br>
Mon nom appartient à une culture lointaine,<br>
façonnée par les îles, le ciel et le temps.<br><br>
Si vous trouvez ce que je représente,<br>
alors vous trouverez mon nom.`,
    answer: 'MAYARI',
    hint: 'Déesse des Philippines, liée à la nuit et à la lumière douce qui éclaire sans brûler...',
    palette: ['#F2CAB3', '#BF6E50', '#BF8975', '#402A25', '#8C4842'],
  },

  

  /* ════════════════════════════════════════════════════════
     ÉNIGME 4 — Pendu  →  lettre E
     Caractères spéciaux (&, -, é) révélés automatiquement.
     10 erreurs max par mot. Après tous les mots → lettre révélée.
  ════════════════════════════════════════════════════════ */
  {
    type: 'hangman',
    letter: '1',
    emoji: '🕵️',
    maxErrors: 5,
    words: [
      'Souane',
      'Black & Yuumi',
      'Jeux-video',
      'Benjamin',
    ],
    hint: 'Ce sont des personnes et des choses qui comptent...',
  },

  /* ════════════════════════════════════════════════════════
     ÉNIGME 2 — Trouver le prénom : AARON  →  lettre U
     Aaron = grand prêtre, frère de Moïse, guide et intermédiaire
  ════════════════════════════════════════════════════════ */
  {
    type: 'riddle',
    letter: '2',
    emoji: '☀️',
    question: `Mon nom précède mon existence,<br>
inscrit dans des récits plus anciens que nos mémoires.<br><br>
Je suis lié à ce qui permet d'avancer<br>
quand le chemin devient incertain.<br><br>
Je ne suis ni le commencement,<br>
ni la destination,<br>
mais ce qui rend le passage possible.<br><br>
On me retrouve dans les textes fondateurs,<br>
là où la parole, la transmission et la confiance<br>
comptent plus que la force.<br><br>
Si vous comprenez ce que je représente,<br>
vous saurez qui je suis.`,
    answer: 'AARON',
    hint: 'Grand prêtre et frère de Moïse dans la Bible — celui qui porte la parole et guide le passage...',
    palette: ['#F2B279', '#F2CAA7', '#A66038', '#734E38', '#BF8A6B'],
  },


];

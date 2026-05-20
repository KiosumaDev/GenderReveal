/* ═══════════════════════════════════════════════════════════════
   MINI-JEU : HangmanEnigma  (type: 'hangman')
   ───────────────────────────────────────────────────────────────
   Pendu sans dessin : 10 cases qui deviennent rouges pour chaque
   mauvaise lettre. Les caractères spéciaux (-, &, accents, espaces)
   sont révélés automatiquement.

   Si le joueur dépasse 10 erreurs → le mot est révélé, mot suivant.
   Après tous les mots → solve().

   Config attendue :
     type       {string}    'hangman'
     letter     {string}    lettre révélée à la fin
     words      {string[]}  liste des mots à deviner
     maxErrors  {number}    (défaut: 10) erreurs max par mot
     emoji      {string}    (optionnel) emoji décoratif
   ═══════════════════════════════════════════════════════════════ */

class HangmanEnigma extends BaseEnigma {

  render(container) {
    this._origWords = this.config.words || [];
    this._words     = this._origWords.map(w => w.toUpperCase());
    this._maxErr    = this.config.maxErrors || 10;
    this._total     = this._words.length;
    this._wordNum   = 0;
    this._container = container;

    /* File d'attente : mots restants à tenter */
    this._remaining      = [...this._words];
    this._remainingOrig  = [...this._origWords];

    this._buildShell(container);
    this._nextWord();
  }

  /* ─── Structure HTML fixe ─────────────────────────────── */
  _buildShell(container) {
    const hint = this.config.hint || '';
    container.innerHTML = `
      <div class="hangman-game">
        <div class="hangman-top">
          <span class="hangman-emoji">${this.config.emoji || '🔤'}</span>
          <p class="hangman-progress" id="hm-progress"></p>
        </div>
        <div class="hangman-word-row" id="hm-word"></div>
        <div class="hangman-errors"  id="hm-errors"></div>
        <p class="hangman-msg"       id="hm-msg"></p>
        <div class="hangman-keyboard" id="hm-keyboard"></div>
        ${hint ? `
          <div class="hm-hint-wrap">
            <button class="btn-hint" id="hm-hint-btn">💡 Indice</button>
            <p class="riddle-hint hidden" id="hm-hint-text">${hint}</p>
          </div>
        ` : ''}
      </div>
    `;
    this._buildKeyboard(container);

    const hintBtn = container.querySelector('#hm-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        container.querySelector('#hm-hint-text').classList.toggle('hidden');
      });
    }
  }

  _buildKeyboard(container) {
    const kb = container.querySelector('#hm-keyboard');
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
      const btn = document.createElement('button');
      btn.className    = 'hm-key';
      btn.textContent  = letter;
      btn.dataset.letter = letter;
      btn.addEventListener('click', () => { if (!btn.disabled) this._guess(letter); });
      kb.appendChild(btn);
    });
  }

  /* ─── Charge le mot suivant ───────────────────────────── */
  _nextWord() {
    const container = this._container;

    if (this._remaining.length === 0) {
      setTimeout(() => this.solve(), 600);
      return;
    }

    this._wordNum++;
    this._word     = this._remaining.shift();
    this._wordOrig = this._remainingOrig.shift();
    this._errors   = 0;
    this._guessed  = new Set();

    /* Révéler automatiquement les caractères non-alphabétiques */
    [...this._word].forEach(c => {
      if (!/^[A-Z]$/.test(c)) this._guessed.add(c);
    });

    /* Réinitialiser le clavier */
    container.querySelectorAll('.hm-key').forEach(btn => {
      btn.disabled  = false;
      btn.className = 'hm-key';
    });

    container.querySelector('#hm-msg').innerHTML = '';
    this._updateProgress();
    this._updateWord();
    this._updateErrors();
  }

  /* ─── Traitement d'une lettre devinée ─────────────────── */
  _guess(letter) {
    if (this._guessed.has(letter)) return;
    this._guessed.add(letter);

    const btn = this._container.querySelector(`[data-letter="${letter}"]`);
    if (btn) btn.disabled = true;

    if (this._word.includes(letter)) {
      if (btn) btn.classList.add('hm-ok');
    } else {
      this._errors++;
      if (btn) btn.classList.add('hm-wrong');
    }

    this._updateWord();
    this._updateErrors();

    /* Mot complet ? */
    const complete = [...this._word].every(c => this._guessed.has(c));
    if (complete) {
      this._container.querySelector('#hm-msg').innerHTML =
        `<span class="hm-success">✅ "${this._wordOrig}" trouvé !</span>`;
      this._lockKeyboard();
      setTimeout(() => this._nextWord(), 1500);
      return;
    }

    /* Trop d'erreurs ? */
    if (this._errors >= this._maxErr) {
      /* Révéler toutes les lettres */
      [...this._word].forEach(c => this._guessed.add(c));
      this._updateWord();
      this._container.querySelector('#hm-msg').innerHTML =
        `<span class="hm-fail">❌ C'était : <b>${this._wordOrig}</b></span>`;
      this._lockKeyboard();
      setTimeout(() => this._nextWord(), 2000);
    }
  }

  _lockKeyboard() {
    this._container.querySelectorAll('.hm-key').forEach(b => b.disabled = true);
  }

  /* ─── Mises à jour de l'affichage ─────────────────────── */
  _updateProgress() {
    this._container.querySelector('#hm-progress').textContent =
      `Pendu ${this._wordNum} sur ${this._total}`;
  }

  _updateWord() {
    const el = this._container.querySelector('#hm-word');
    el.innerHTML = [...this._word].map(c => {
      if (c === ' ') return `<span class="hm-space"></span>`;
      const shown = this._guessed.has(c);
      return `<span class="hm-letter${shown ? ' hm-revealed' : ''}">${shown ? c : ''}</span>`;
    }).join('');
  }

  _updateErrors() {
    const el = this._container.querySelector('#hm-errors');
    el.innerHTML = '';
    for (let i = 0; i < this._maxErr; i++) {
      const box = document.createElement('div');
      box.className = `hm-err-box${i < this._errors ? ' hm-err-red' : ''}`;
      el.appendChild(box);
    }
  }
}

EnigmaRegistry.register('hangman', HangmanEnigma);

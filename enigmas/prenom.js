/* ═══════════════════════════════════════════════════════════════
   MINI-JEU : PrenomEnigma  (type: 'prenom')
   ───────────────────────────────────────────────────────────────
   Un indice est affiché. Le joueur doit cliquer sur le bon prénom
   parmi une grille de tuiles. Les mauvais choix sont éliminés
   progressivement (shake + disparition).

   Config attendue :
     type    {string}    'prenom'
     letter  {string}    lettre révélée si réussi
     clue    {string}    indice textuel (ex: "Trouvez le prénom qui…")
     names   {string[]}  tableau de prénoms proposés (5–6 recommandé)
     answer  {string}    le prénom correct (doit figurer dans names)
     emoji   {string}    (optionnel) emoji décoratif
   ═══════════════════════════════════════════════════════════════ */

class PrenomEnigma extends BaseEnigma {

  render(container) {
    const { clue, names, emoji } = this.config;
    this._attempts = 0;

    container.innerHTML = `
      <div class="prenom-game">
        <div class="prenom-header">
          <span class="prenom-emoji">${emoji || '👶'}</span>
          <p class="prenom-clue">${clue}</p>
        </div>
        <div class="prenom-grid">
          ${names.map(name => `
            <button class="prenom-tile" data-name="${name}">${name}</button>
          `).join('')}
        </div>
        <p class="prenom-attempts"></p>
      </div>
    `;

    const attemptsEl = container.querySelector('.prenom-attempts');

    container.querySelectorAll('.prenom-tile').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this._handleClick(btn, container, attemptsEl);
      });
    });
  }

  _handleClick(btn, container, attemptsEl) {
    const chosen = btn.dataset.name;

    if (chosen === this.config.answer) {
      /* ── Bonne réponse ── */
      btn.classList.add('correct');
      btn.disabled = true;
      container.querySelectorAll('.prenom-tile:not(.correct)').forEach(t => {
        t.classList.add('faded');
        t.disabled = true;
      });
      setTimeout(() => this.solve(), 900);

    } else {
      /* ── Mauvaise réponse ── */
      this._attempts++;
      btn.classList.add('wrong');
      btn.disabled = true;

      setTimeout(() => btn.classList.add('eliminated'), 400);

      const s = this._attempts > 1 ? 's' : '';
      attemptsEl.textContent =
        `Pas celui-là... Continuez à chercher ! (${this._attempts} essai${s})`;
    }
  }
}

EnigmaRegistry.register('prenom', PrenomEnigma);

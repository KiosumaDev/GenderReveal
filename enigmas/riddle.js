/* ═══════════════════════════════════════════════════════════════
   MINI-JEU : TextRiddleEnigma  (type: 'riddle')
   ───────────────────────────────────────────────────────────────
   Devinette classique : une question, un champ texte, un bouton.
   La validation est insensible à la casse et aux accents.

   Config attendue :
     type     {string}  'riddle'
     letter   {string}  lettre révélée si réussi
     question {string}  texte de la devinette
     answer   {string}  réponse correcte (insensible casse/accents)
     emoji    {string}  (optionnel) emoji affiché en haut de la carte
     hint     {string}  (optionnel) indice masqué derrière un bouton
   ═══════════════════════════════════════════════════════════════ */

class TextRiddleEnigma extends BaseEnigma {

  render(container) {
    const { question, hint, emoji } = this.config;

    container.innerHTML = `
      <div class="riddle-card">
        <span class="riddle-emoji">${emoji || '🤔'}</span>
        <p class="riddle-question">${question}</p>

        <div class="riddle-input-group">
          <input
            type="text"
            class="riddle-input"
            placeholder="Votre réponse..."
            autocomplete="off"
            spellcheck="false"
          >
          <button class="btn-primary btn-validate">Valider</button>
        </div>

        ${hint ? `
          <button class="btn-hint">💡 Indice</button>
          <p class="riddle-hint hidden">${hint}</p>
        ` : ''}
      </div>
    `;

    /* ── Éléments ── */
    const input    = container.querySelector('.riddle-input');
    const btnVal   = container.querySelector('.btn-validate');
    const btnHint  = container.querySelector('.btn-hint');
    const hintEl   = container.querySelector('.riddle-hint');
    const card     = container.querySelector('.riddle-card');

    /* ── Validation ── */
    const normalize = str =>
      str.trim().toUpperCase()
         .normalize('NFD')
         .replace(/[̀-ͯ]/g, '');

    const check = () => {
      if (normalize(input.value) === normalize(this.config.answer)) {
        input.disabled = true;
        btnVal.disabled = true;
        card.classList.add('success');
        setTimeout(() => this.solve(), 700);
      } else {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 450);
        input.value = '';
        input.placeholder = 'Essayez encore...';
        input.focus();
      }
    };

    btnVal.addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });

    if (btnHint) {
      btnHint.addEventListener('click', () => hintEl.classList.toggle('hidden'));
    }

    setTimeout(() => input.focus(), 80);
  }
}

EnigmaRegistry.register('riddle', TextRiddleEnigma);

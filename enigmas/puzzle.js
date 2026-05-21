/* ═══════════════════════════════════════════════════════════════
   MINI-JEU : PuzzleEnigma  (type: 'puzzle')
   ───────────────────────────────────────────────────────────────
   Grille de puzzle où les pièces sont mélangées.
   Le joueur clique une pièce pour la sélectionner, puis une autre
   pour les échanger. Quand tout est en ordre → solve().

   L'image est découpée via CSS background-position :
   aucun pré-découpage nécessaire — fournissez juste une image.

   Config attendue :
     type    {string}  'puzzle'
     letter  {string}  lettre révélée si réussi
     image   {string}  chemin vers l'image (ex: 'assets/puzzle.jpg')
     cols    {number}  colonnes (défaut: 3)
     rows    {number}  lignes   (défaut: 3)
     clue    {string}  (optionnel) texte d'intro
     emoji   {string}  (optionnel) emoji décoratif
   ═══════════════════════════════════════════════════════════════ */

class PuzzleEnigma extends BaseEnigma {

  render(container) {
    this._cols     = this.config.cols || 3;
    this._rows     = this.config.rows || 3;
    this._selected = null;
    this._pieceW   = 0;
    this._pieceH   = 0;

    if (this.config.image) {
      const img  = new Image();
      img.onload = () => this._build(container, img.src);
      img.onerror = () => this._build(container, null);
      img.src    = this.config.image;
    } else {
      this._build(container, null);
    }
  }

  /* ─── Construction de la grille ───────────────────────── */
  _build(container, imgSrc) {
    const { _cols: cols, _rows: rows } = this;
    const total = cols * rows;
    const gap   = 3;

    /* Insérer le shell d'abord pour mesurer la largeur réelle disponible */
    container.innerHTML = `
      <div class="puzzle-game">
        <div class="puzzle-header">
          <span class="puzzle-emoji">${this.config.emoji || '🧩'}</span>
          <p class="puzzle-clue">${this.config.clue || 'Remettez les pièces dans le bon ordre.'}</p>
        </div>
        <div class="puzzle-grid" id="puzzle-grid"></div>
        <p class="puzzle-hint">Cliquez sur une pièce pour la sélectionner, puis une autre pour les échanger.</p>
      </div>
    `;

    const grid      = container.querySelector('#puzzle-grid');
    const availableW = Math.min(360, grid.clientWidth || (window.innerWidth - 72));

    this._pieceW = Math.floor((availableW - gap * (cols - 1)) / cols);
    this._pieceH = Math.floor((availableW - gap * (rows - 1)) / rows);
    const gW     = this._pieceW * cols + gap * (cols - 1);
    const gH     = this._pieceH * rows + gap * (rows - 1);

    grid.style.gridTemplateColumns = `repeat(${cols}, ${this._pieceW}px)`;
    grid.style.width               = `${gW}px`;

    /* Mélanger (Fisher-Yates) — garantit un état non-résolu */
    const order = Array.from({ length: total }, (_, i) => i);
    do {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    } while (order.every((v, i) => v === i));

    /* Chaque cellule a une position fixe dans la grille (gridIdx)
       et affiche visuellement la pièce d'index originalIdx. */
    for (let gridIdx = 0; gridIdx < total; gridIdx++) {
      const origIdx = order[gridIdx];
      const cell    = document.createElement('div');
      cell.className = 'puzzle-piece';
      cell.dataset.gridIdx    = gridIdx;
      cell.dataset.origIdx    = origIdx;
      cell.style.width  = `${this._pieceW}px`;
      cell.style.height = `${this._pieceH}px`;

      this._applyVisual(cell, origIdx, cols, rows, gW, gH, imgSrc);

      if (gridIdx === origIdx) cell.classList.add('correct');
      cell.addEventListener('click', () => this._handleClick(cell, container, cols, rows, gW, gH, imgSrc));
      grid.appendChild(cell);
    }
  }

  /* ─── Applique le style visuel (background-position) ──── */
  _applyVisual(cell, origIdx, cols, rows, gW, gH, imgSrc) {
    const col = origIdx % cols;
    const row = Math.floor(origIdx / cols);

    if (imgSrc) {
      cell.style.backgroundImage    = `url('${imgSrc}')`;
      cell.style.backgroundSize     = `${gW}px ${gH}px`;
      cell.style.backgroundPosition = `-${col * this._pieceW}px -${row * this._pieceH}px`;
      cell.style.backgroundRepeat   = 'no-repeat';
    } else {
      /* Placeholder coloré quand aucune image fournie */
      const hues = [30, 50, 140, 160, 170, 35, 45, 150, 55];
      cell.style.background     = `hsl(${hues[origIdx % hues.length]}, 45%, 28%)`;
      cell.style.color          = 'rgba(240,216,168,0.7)';
      cell.style.display        = 'flex';
      cell.style.alignItems     = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize       = '1.3rem';
      cell.style.fontWeight     = 'bold';
      cell.textContent          = origIdx + 1;
    }
  }

  /* ─── Clic sur une pièce ──────────────────────────────── */
  _handleClick(cell, container, cols, rows, gW, gH, imgSrc) {
    if (cell.classList.contains('correct')) return;

    if (!this._selected) {
      this._selected = cell;
      cell.classList.add('selected');
      return;
    }

    if (this._selected === cell) {
      cell.classList.remove('selected');
      this._selected = null;
      return;
    }

    /* Échanger les contenus visuels (origIdx) */
    const aOrig = parseInt(this._selected.dataset.origIdx);
    const bOrig = parseInt(cell.dataset.origIdx);
    this._selected.dataset.origIdx = bOrig;
    cell.dataset.origIdx           = aOrig;

    this._applyVisual(this._selected, bOrig, cols, rows, gW, gH, imgSrc);
    this._applyVisual(cell,           aOrig, cols, rows, gW, gH, imgSrc);

    /* Marquer les pièces en place */
    [this._selected, cell].forEach(c => {
      const gi = parseInt(c.dataset.gridIdx);
      const oi = parseInt(c.dataset.origIdx);
      c.classList.toggle('correct', gi === oi);
    });

    this._selected.classList.remove('selected');
    this._selected = null;

    /* Vérifier si tout est résolu */
    const pieces = container.querySelectorAll('.puzzle-piece');
    const solved = Array.from(pieces).every(p =>
      parseInt(p.dataset.gridIdx) === parseInt(p.dataset.origIdx)
    );
    if (solved) {
      pieces.forEach(p => p.classList.add('correct'));
      /* Retirer les bordures pour afficher l'image intacte */
      container.querySelector('#puzzle-grid').classList.add('solved');
      setTimeout(() => this.solve(), 900);
    }
  }
}

EnigmaRegistry.register('puzzle', PuzzleEnigma);

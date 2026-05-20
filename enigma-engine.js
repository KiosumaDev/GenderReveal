/* ═══════════════════════════════════════════════════════════════
   ENIGMA ENGINE
   ───────────────────────────────────────────────────────────────
   Contient deux exports globaux :
     • BaseEnigma     — classe de base que tout mini-jeu doit étendre
     • EnigmaRegistry — registre qui associe un type (string) à une classe

   Pour créer un nouveau type de mini-jeu :
     1. Créer un fichier dans enigmas/mon-jeu.js
     2. Étendre BaseEnigma et implémenter render(container)
     3. Appeler this.solve() quand l'énigme est résolue
     4. Terminer par : EnigmaRegistry.register('mon-type', MaClasse);
     5. Inclure le <script> dans index.html AVANT enigma-config.js

   Exemple minimal :
   ─────────────────
   class MonJeu extends BaseEnigma {
     render(container) {
       container.innerHTML = '<button>Cliquez !</button>';
       container.querySelector('button').onclick = () => this.solve();
     }
   }
   EnigmaRegistry.register('mon-jeu', MonJeu);
   ═══════════════════════════════════════════════════════════════ */

class BaseEnigma {
  /**
   * @param {Object} config — objet issu de ENIGMA_CONFIG
   *   config.letter  {string}  — lettre révélée quand l'énigme est résolue
   *   config.type    {string}  — type enregistré dans EnigmaRegistry
   *   (toute autre propriété est libre selon le mini-jeu)
   */
  constructor(config) {
    this.config    = config;
    this.letter    = config.letter;
    this._solved   = false;
    this._onSolveCb = null;
    this._container = null;
  }

  /**
   * Appelé par l'orchestrateur pour injecter le mini-jeu dans le DOM.
   * Efface le conteneur puis appelle render().
   */
  mount(container) {
    this._container = container;
    container.innerHTML = '';
    this.render(container);
  }

  /**
   * À implémenter dans chaque sous-classe.
   * Injecter le HTML du mini-jeu dans container et attacher les listeners.
   * @param {HTMLElement} container
   */
  render(container) {
    throw new Error(`[BaseEnigma] render() doit être implémenté par "${this.constructor.name}"`);
  }

  /**
   * Appeler this.solve() depuis render() quand le joueur a réussi.
   * Déclenche le callback enregistré via onSolve() une seule fois.
   */
  solve() {
    if (this._solved) return;
    this._solved = true;
    if (this._onSolveCb) this._onSolveCb(this.letter);
  }

  /**
   * Enregistre le callback appelé lors de la résolution.
   * @param {Function} callback — reçoit la lettre en argument : cb(letter)
   */
  onSolve(callback) {
    this._onSolveCb = callback;
  }

  /**
   * Nettoyage optionnel. Appelé avant le chargement de l'énigme suivante.
   * Les sous-classes peuvent surcharger pour annuler des timers, etc.
   */
  destroy() {
    this._onSolveCb = null;
    if (this._container) {
      this._container.innerHTML = '';
      this._container = null;
    }
  }
}


/* ─────────────────────────────────────────────────────────────
   EnigmaRegistry — annuaire des types de mini-jeux
   ───────────────────────────────────────────────────────────── */

const EnigmaRegistry = {
  _types: {},

  /**
   * Enregistre une classe pour un type donné.
   * @param {string}   type       — identifiant utilisé dans ENIGMA_CONFIG
   * @param {Function} EnigmaClass — sous-classe de BaseEnigma
   */
  register(type, EnigmaClass) {
    if (this._types[type]) {
      console.warn(`[EnigmaRegistry] Le type "${type}" est déjà enregistré — écrasement.`);
    }
    this._types[type] = EnigmaClass;
  },

  /**
   * Instancie une énigme à partir d'un objet de config.
   * @param  {Object} config — doit avoir une propriété "type"
   * @returns {BaseEnigma}
   */
  create(config) {
    const Cls = this._types[config.type];
    if (!Cls) {
      throw new Error(
        `[EnigmaRegistry] Type inconnu : "${config.type}". ` +
        `Types disponibles : ${Object.keys(this._types).join(', ') || '(aucun)'}`
      );
    }
    return new Cls(config);
  },

  /** Retourne la liste des types enregistrés (utile pour le debug). */
  list() {
    return Object.keys(this._types);
  },
};

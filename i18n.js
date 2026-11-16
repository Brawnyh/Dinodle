/* =========================================================
   i18n.js — Dinodle UI translations (English first, French, Spanish)
   Exposes window.I18N = { lang, locale, t(key, vars), localize(data, dict), mountSwitch(el) }
   ========================================================= */
(function (global) {
  'use strict';

  const LANG_KEY = 'dinodle_lang_v1';
  const LANGS = ['en', 'fr', 'es'];

  const STR = {
    en: {
      page_title: 'Dinodle · Guess the daily dinosaur',
      mode_normal: 'Normal', mode_easy: 'Easy', mode_label: 'Difficulty',
      attempt_html: 'Attempt <b id="attempts">0</b> of {max}',
      next_in: '⏳ Next in',
      placeholder: 'e.g. Tyrannosaurus, Triceratops… (start typing)',
      guess: 'Guess',
      col_name: 'Name',
      practice: '🎲 Play another (practice)',
      not_in_list: '❌ "{raw}" is not in the list. Start typing and pick a suggestion.',
      already: '⚠️ You already tried {name}.',
      win: '🎉 Correct! It was <b>{name}</b> — {n} attempts.',
      lose: '💀 Out of attempts ({max}). It was <b>{name}</b>.',
      unlock_at: 'Unlocks at attempt {n}',
      loading_img: 'Loading image…',
      view_wiki: 'View on Wikipedia →',
      close: 'Close',
      silhouette_alt: 'silhouette',
      stats_title: '📊 My stats',
      stats_reset: 'Reset stats',
      stats_reset_confirm: 'Delete all your local stats? This does not affect today\'s game.',
      played: 'Played', won: 'Won', win_pct: 'Win %', streak: 'Current streak', max_streak: 'Best streak', total: 'Total',
      attr_period: 'Period', attr_diet: 'Diet', attr_type: 'Type', attr_weight: 'Weight', attr_length: 'Length', attr_continent: 'Continent',
      hint_silhouette: 'Silhouette', hint_discoverer: 'Discoverer & year', hint_description: 'Description',
      discovered_by: 'Discovered by <b>{who}</b> in <b>{year}</b>.',
      no_description: 'No description available.',
      load_error: 'Could not load the game data. Serve the page over http.',
      help_summary: 'How to play / Colour legend',
      help_green: '<b>Green</b>: matches the secret dinosaur',
      help_yellow: '<b>Yellow</b>: close — weight/length within ~25–30%, the neighbouring period (← earlier / → later), or an omnivore vs. a meat- or plant-eater',
      help_grey: '<b>Grey</b>: no match. Arrows tell you to go higher ↑ or lower ↓',
      help_hints: '<b>Clues cost bones 🦴.</b> You dig up a bone at attempts 3, 6 and 9 (2, 4 and 6 in Easy) — you have 12 attempts. Spend them on the discoverer, the description and finally the silhouette — the last clue. Score: 1000, −100 every 3 attempts, −150 per bone. Lose = 0.',
      score: 'Score', pts: 'pts', next_token: 'next 🦴 at attempt {n}', token_earned: '🦴 You dug up a bone! Spend it on a clue.',
      buy_hint: 'Use 1 🦴', hint_requires: 'Unlock the other two clues first', no_tokens: 'No bones left',
      final_score: 'Score: <b>{score}</b>.', share: '📋 Share result', copied: '✅ Result copied — paste it anywhere!', copy_this: 'Copy your result:',
      history_title: 'Game history', history_empty: 'No games yet.', won_label: 'Won', lost_label: 'Lost',
      privacy: 'Privacy', about: 'About', contact: 'Contact', other_game: '🦸 Try our superhero game', support: '☕ Support Dinodle',
      help_names: 'Type the scientific name (or an alias such as "T-Rex"). Only dinosaurs in the database are accepted.',
      help_easy: '<b>Easy mode</b> only uses the 25 most famous dinosaurs.',
      credits_link: 'Image credits'
    },
    fr: {
      page_title: 'Dinodle · Devine le dinosaure du jour',
      mode_normal: 'Normal', mode_easy: 'Facile', mode_label: 'Difficulté',
      attempt_html: 'Essai <b id="attempts">0</b> sur {max}',
      next_in: '⏳ Prochain dans',
      placeholder: 'ex. Tyrannosaurus, Triceratops… (commence à écrire)',
      guess: 'Valider',
      col_name: 'Nom',
      practice: '🎲 Rejouer (entraînement)',
      not_in_list: '❌ « {raw} » n\'est pas dans la liste. Commence à écrire et choisis une suggestion.',
      already: '⚠️ Tu as déjà essayé {name}.',
      win: '🎉 Bravo ! C\'était <b>{name}</b> — {n} essais.',
      lose: '💀 Plus d\'essais ({max}). C\'était <b>{name}</b>.',
      unlock_at: 'Débloqué à l\'essai {n}',
      loading_img: 'Chargement de l\'image…',
      view_wiki: 'Voir sur Wikipédia →',
      close: 'Fermer',
      silhouette_alt: 'silhouette',
      stats_title: '📊 Mes statistiques',
      stats_reset: 'Réinitialiser les statistiques',
      stats_reset_confirm: 'Effacer toutes tes statistiques locales ? Cela n\'affecte pas la partie du jour.',
      played: 'Parties', won: 'Victoires', win_pct: '% de victoires', streak: 'Série actuelle', max_streak: 'Meilleure série', total: 'Total',
      attr_period: 'Période', attr_diet: 'Régime', attr_type: 'Groupe', attr_weight: 'Poids', attr_length: 'Longueur', attr_continent: 'Continent',
      hint_silhouette: 'Silhouette', hint_discoverer: 'Découvreur et année', hint_description: 'Description',
      discovered_by: 'Découvert par <b>{who}</b> en <b>{year}</b>.',
      no_description: 'Aucune description disponible.',
      load_error: 'Impossible de charger les données. Sers la page via http.',
      help_summary: 'Comment jouer / Légende des couleurs',
      help_green: '<b>Vert</b> : correspond au dinosaure secret',
      help_yellow: '<b>Jaune</b> : proche — poids/longueur à ~25–30 % près, période voisine (← plus ancienne / → plus récente), ou un omnivore face à un carnivore/herbivore',
      help_grey: '<b>Gris</b> : ne correspond pas. Les flèches indiquent s\'il faut monter ↑ ou descendre ↓',
      help_hints: '<b>Les indices coûtent des os 🦴.</b> Tu déterres un os aux essais 3, 6 et 9 (2, 4 et 6 en Facile) — tu as 12 essais. Dépense-les pour le découvreur, la description et enfin la silhouette — le dernier indice. Score : 1000, −100 tous les 3 essais, −150 par os. Défaite = 0.',
      score: 'Score', pts: 'pts', next_token: 'prochain 🦴 à l\'essai {n}', token_earned: '🦴 Tu as déterré un os ! Utilise-le pour un indice.',
      buy_hint: 'Utiliser 1 🦴', hint_requires: 'Débloque d\'abord les deux autres indices', no_tokens: 'Plus d\'os',
      final_score: 'Score : <b>{score}</b>.', share: '📋 Partager', copied: '✅ Résultat copié — colle-le où tu veux !', copy_this: 'Copie ton résultat :',
      history_title: 'Historique', history_empty: 'Aucune partie pour l\'instant.', won_label: 'Gagnée', lost_label: 'Perdue',
      privacy: 'Confidentialité', about: 'À propos', contact: 'Contact', other_game: '🦸 Essaie notre jeu de super-héros', support: '☕ Soutenir Dinodle',
      help_names: 'Écris le nom scientifique (ou un alias comme « T-Rex »). Seuls les dinosaures de la base sont acceptés.',
      help_easy: 'Le <b>mode Facile</b> n\'utilise que les 25 dinosaures les plus connus.',
      credits_link: 'Crédits des images'
    },
    es: {
      page_title: 'Dinodle · Adivina el dinosaurio del día',
      mode_normal: 'Normal', mode_easy: 'Fácil', mode_label: 'Dificultad',
      attempt_html: 'Intento <b id="attempts">0</b> de {max}',
      next_in: '⏳ Próximo en',
      placeholder: 'Ej: Tyrannosaurus, Triceratops… (empieza a escribir)',
      guess: 'Probar',
      col_name: 'Nombre',
      practice: '🎲 Jugar otro (práctica)',
      not_in_list: '❌ "{raw}" no está en la lista. Empieza a escribir y elige una sugerencia.',
      already: '⚠️ Ya probaste con {name}.',
      win: '🎉 ¡Correcto! Era <b>{name}</b> — {n} intentos.',
      lose: '💀 Se acabaron los {max} intentos. Era <b>{name}</b>.',
      unlock_at: 'Se desbloquea en el intento {n}',
      loading_img: 'Cargando imagen…',
      view_wiki: 'Ver en Wikipedia →',
      close: 'Cerrar',
      silhouette_alt: 'silueta',
      stats_title: '📊 Mis estadísticas',
      stats_reset: 'Reiniciar estadísticas',
      stats_reset_confirm: '¿Borrar todas tus estadísticas locales? Esto no afecta al juego de hoy.',
      played: 'Jugadas', won: 'Ganadas', win_pct: '% victorias', streak: 'Racha actual', max_streak: 'Racha máxima', total: 'Total',
      attr_period: 'Periodo', attr_diet: 'Dieta', attr_type: 'Tipo', attr_weight: 'Peso', attr_length: 'Longitud', attr_continent: 'Continente',
      hint_silhouette: 'Silueta', hint_discoverer: 'Descubridor y año', hint_description: 'Descripción',
      discovered_by: 'Descubierto por <b>{who}</b> en <b>{year}</b>.',
      no_description: 'Sin descripción disponible.',
      load_error: 'Error al cargar datos. Sirve la página por http.',
      help_summary: '¿Cómo se juega? / Leyenda de colores',
      help_green: '<b>Verde</b>: coincide con el dinosaurio secreto',
      help_yellow: '<b>Amarillo</b>: cerca — peso/longitud a ~25–30 %, periodo vecino (← anterior / → posterior), o un omnívoro frente a un carnívoro/herbívoro',
      help_grey: '<b>Gris</b>: no coincide. Las flechas indican si debes subir ↑ o bajar ↓',
      help_hints: '<b>Las pistas cuestan huesos 🦴.</b> Desentierras un hueso en los intentos 3, 6 y 9 (2, 4 y 6 en Fácil) — tienes 12 intentos. Úsalas en el descubridor, la descripción y por último la silueta — la última pista. Puntos: 1000, −100 cada 3 intentos, −150 por hueso. Perder = 0.',
      score: 'Puntos', pts: 'pts', next_token: 'próximo 🦴 en el intento {n}', token_earned: '🦴 ¡Has desenterrado un hueso! Úsalo en una pista.',
      buy_hint: 'Usar 1 🦴', hint_requires: 'Desbloquea antes las otras dos pistas', no_tokens: 'No quedan huesos',
      final_score: 'Puntos: <b>{score}</b>.', share: '📋 Compartir', copied: '✅ Resultado copiado — ¡pégalo donde quieras!', copy_this: 'Copia tu resultado:',
      history_title: 'Historial', history_empty: 'Aún no hay partidas.', won_label: 'Ganada', lost_label: 'Perdida',
      privacy: 'Privacidad', about: 'Acerca de', contact: 'Contacto', other_game: '🦸 Prueba nuestro juego de superhéroes', support: '☕ Apoya Dinodle',
      help_names: 'Escribe el nombre científico (o alias como "T-Rex"). Solo se aceptan dinosaurios de la base de datos.',
      help_easy: 'El <b>modo Fácil</b> solo usa los 25 dinosaurios más famosos.',
      credits_link: 'Créditos de imágenes'
    }
  };
  const LOCALE = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' };

  function detect() {
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (LANGS.indexOf(saved) !== -1) return saved;
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : 'en';
  }
  const lang = detect();

  function t(key, vars) {
    let s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  // Returns copies of the data entries with translated display values.
  // dict = { fields: { field: { source: translated } }, description: { name: text } }.
  // Each field map is applied consistently, so equality comparisons still work.
  function localize(data, dict) {
    if (!dict) return data;
    const fields = dict.fields || {};
    const desc = dict.description || {};
    return data.map(function (item) {
      const out = Object.assign({}, item);
      Object.keys(fields).forEach(function (f) {
        const v = out[f];
        if (typeof v === 'string' && fields[f][v] != null) out[f] = fields[f][v];
      });
      if (desc[item.name]) out.description = desc[item.name];
      return out;
    });
  }

  function mountSwitch(el) {
    if (!el) return;
    el.className = 'lang-toggle';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Language');
    el.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-l="' + l + '" class="' + (lang === l ? 'active' : '') +
        '" aria-pressed="' + (lang === l) + '">' + l.toUpperCase() + '</button>';
    }).join('');
    el.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        try { localStorage.setItem(LANG_KEY, b.dataset.l); } catch (e) {}
        location.reload();
      };
    });
  }

  // Fill static page text: elements with data-i18n="key" (innerHTML).
  function applyStatic(root) {
    document.documentElement.lang = lang;
    (root || document).querySelectorAll('[data-i18n]').forEach(function (n) {
      n.innerHTML = t(n.getAttribute('data-i18n'));
    });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(function (n) {
      n.setAttribute('aria-label', t(n.getAttribute('data-i18n-aria')));
    });
  }

  global.I18N = { lang: lang, locale: LOCALE[lang], t: t, localize: localize, mountSwitch: mountSwitch, applyStatic: applyStatic };
})(window);

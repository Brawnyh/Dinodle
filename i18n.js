/* =========================================================
   i18n.js — Dinodle UI translations (English first, French, Spanish, Portuguese, German, Italian)
   Exposes window.I18N = { lang, locale, t(key, vars), localize(data, dict), mountSwitch(el) }
   ========================================================= */
(function (global) {
  'use strict';

  const LANG_KEY = 'dinodle_lang_v1';
  const LANGS = ['en', 'fr', 'es', 'pt', 'de', 'it'];

  const STR = {
    en: {
      page_title: 'Dinodle · Guess the daily dinosaur',
      mode_normal: 'Normal', mode_easy: 'Easy', mode_label: 'Difficulty',
      attempt_html: 'Attempt <b id="attempts">0</b> of {max}',
      next_in: '⏳ Next in',
      placeholder: 'e.g. Tyrannosaurus, Triceratops… (start typing)',
      guess: 'Guess',
      col_name: 'Name',
      practice: '🎲 Play another (practice)', period_info: 'Periods, oldest to newest: {list}. A neighbouring period shows yellow.', practice_badge: '🎲 Practice — doesn’t count toward stats', back_daily: '← Back to today’s Dinodle', short_period: 'Late Triassic|Early Jurassic|Mid Jurassic|Late Jurassic|Early Cret.|Mid Cret.|Late Cret.', short_type: 'Theropod|Ceratops|Thyreo.|Sauropod|Pro-sauropod|Ornitho.|Margino.', short_diet: 'Carnivore|Herbivore|Omnivore', short_continent: 'N. America|S. America|Europe|Asia|Africa|Oceania|Antarct.', short_cols: 'Period|Diet|Type|Weight|Length|Continent',
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
      challenge: '🦖 Challenge a friend', save_image: '🖼️ Image', image_saved: '✅ Image saved',
      challenge_text_win: 'I found today\'s dinosaur in {n} tries 🦖 Can you beat me?', challenge_text_lose: 'Today\'s dinosaur beat me 💀 Can you find it?',
      vs_banner_win: '🦖 A friend found today\'s dinosaur in <b>{n}</b> tries. Can you beat them?', vs_banner_lose: '🦖 Today\'s dinosaur beat your friend. Can you find it?',
      vs_you_win: '🏆 You beat your friend ({you} vs {them})!', vs_tie: '🤝 Tie with your friend ({you} vs {them}).', vs_you_lose: '😅 Your friend wins this time ({you} vs {them}).',
      history_title: 'Game history', history_empty: 'No games yet.', won_label: 'Won', lost_label: 'Lost',
      privacy: 'Privacy', about: 'About', contact: 'Contact', other_game: '🦸 Try our superhero game', support: '☕ Support Dinodle', all_dinos: 'All dinosaurs',
      help_names: 'Type the scientific name (or an alias such as "T-Rex"). Only dinosaurs in the database are accepted.',
      help_easy: '<b>Easy mode</b> only uses the 25 most famous dinosaurs.',
      credits_link: 'Image credits',
      streamer_btn: '🎥 Streamer', streamer_exit: '✖ Streamer mode', streamer_play_along: '🎮 Play along at <b>dinodle.app</b> · Puzzle #{n}', chat_title: '💬 Chat votes (Twitch)', chat_channel_ph: 'Your Twitch channel', chat_connect: 'Connect chat', chat_disconnect: 'Disconnect', chat_target_random: 'Random dinosaur (no spoilers)', chat_target_daily: 'Today\'s dinosaur', chat_round_len: 'Round length', chat_connecting: 'Connecting…', chat_connected: '✅ Connected to #{ch} (read-only)', chat_error: '❌ Could not connect to the chat.', chat_closed: 'Chat disconnected.', chat_how: 'Vote in chat: <b>!dino name</b> (e.g. !dino trex)', chat_round: '⏱ Next guess in {s} s', chat_paused: '⏸ Paused', chat_no_votes: 'No votes yet', chat_votes: '{n}', chat_guess_now: 'Guess now', chat_pause: 'Pause', chat_resume: 'Resume', chat_new_game: '🎲 New dinosaur', chat_guessed: 'Chat guessed {name} ({n} votes)'
    },
    fr: {
      page_title: 'Dinodle · Devine le dinosaure du jour',
      mode_normal: 'Normal', mode_easy: 'Facile', mode_label: 'Difficulté',
      attempt_html: 'Essai <b id="attempts">0</b> sur {max}',
      next_in: '⏳ Prochain dans',
      placeholder: 'ex. Tyrannosaurus, Triceratops… (commence à écrire)',
      guess: 'Valider',
      col_name: 'Nom',
      practice: '🎲 Rejouer (entraînement)', period_info: 'Périodes, de la plus ancienne à la plus récente : {list}. Une période voisine est en jaune.', practice_badge: '🎲 Entraînement — ne compte pas dans les stats', back_daily: '← Revenir au Dinodle du jour', short_period: 'Trias sup.|Jurass. inf.|Jurass. moy.|Jurass. sup.|Crétacé inf.|Crétacé moy.|Crétacé sup.', short_type: 'Théropode|Cératop.|Thyréo.|Sauropode|Pro-sauropode|Ornitho.|Margino.', short_diet: 'Carnivore|Herbivore|Omnivore', short_continent: 'Am. Nord|Am. Sud|Europe|Asie|Afrique|Océanie|Antarct.', short_cols: 'Période|Régime|Groupe|Poids|Longueur|Contin.',
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
      challenge: '🦖 Défier un ami', save_image: '🖼️ Image', image_saved: '✅ Image enregistrée',
      challenge_text_win: 'J\'ai trouvé le dinosaure du jour en {n} essais 🦖 Tu fais mieux ?', challenge_text_lose: 'Le dinosaure du jour m\'a battu 💀 Tu le trouves ?',
      vs_banner_win: '🦖 Un ami a trouvé le dinosaure du jour en <b>{n}</b> essais. Tu fais mieux ?', vs_banner_lose: '🦖 Le dinosaure du jour a battu ton ami. Tu le trouves ?',
      vs_you_win: '🏆 Tu bats ton ami ({you} contre {them}) !', vs_tie: '🤝 Égalité avec ton ami ({you} contre {them}).', vs_you_lose: '😅 Ton ami gagne cette fois ({you} contre {them}).',
      history_title: 'Historique', history_empty: 'Aucune partie pour l\'instant.', won_label: 'Gagnée', lost_label: 'Perdue',
      privacy: 'Confidentialité', about: 'À propos', contact: 'Contact', other_game: '🦸 Essaie notre jeu de super-héros', support: '☕ Soutenir Dinodle', all_dinos: 'Tous les dinosaures',
      help_names: 'Écris le nom scientifique (ou un alias comme « T-Rex »). Seuls les dinosaures de la base sont acceptés.',
      help_easy: 'Le <b>mode Facile</b> n\'utilise que les 25 dinosaures les plus connus.',
      credits_link: 'Crédits des images',
      streamer_btn: '🎥 Streamer', streamer_exit: '✖ Mode streamer', streamer_play_along: '🎮 Joue avec moi sur <b>dinodle.app</b> · Puzzle n°{n}', chat_title: '💬 Votes du chat (Twitch)', chat_channel_ph: 'Ta chaîne Twitch', chat_connect: 'Connecter le chat', chat_disconnect: 'Déconnecter', chat_target_random: 'Dinosaure aléatoire (sans spoiler)', chat_target_daily: 'Dinosaure du jour', chat_round_len: 'Durée du tour', chat_connecting: 'Connexion…', chat_connected: '✅ Connecté à #{ch} (lecture seule)', chat_error: '❌ Impossible de se connecter au chat.', chat_closed: 'Chat déconnecté.', chat_how: 'Vote dans le chat : <b>!dino nom</b> (ex. !dino trex)', chat_round: '⏱ Prochain essai dans {s} s', chat_paused: '⏸ En pause', chat_no_votes: 'Aucun vote pour l\'instant', chat_votes: '{n}', chat_guess_now: 'Jouer maintenant', chat_pause: 'Pause', chat_resume: 'Reprendre', chat_new_game: '🎲 Nouveau dinosaure', chat_guessed: 'Le chat a joué {name} ({n} votes)'
    },
    es: {
      page_title: 'Dinodle · Adivina el dinosaurio del día',
      mode_normal: 'Normal', mode_easy: 'Fácil', mode_label: 'Dificultad',
      attempt_html: 'Intento <b id="attempts">0</b> de {max}',
      next_in: '⏳ Próximo en',
      placeholder: 'Ej: Tyrannosaurus, Triceratops… (empieza a escribir)',
      guess: 'Probar',
      col_name: 'Nombre',
      practice: '🎲 Jugar otro (práctica)', period_info: 'Periodos, del más antiguo al más reciente: {list}. Un periodo vecino sale en amarillo.', practice_badge: '🎲 Práctica — no cuenta para las estadísticas', back_daily: '← Volver al Dinodle de hoy', short_period: 'Triás. tardío|Jurás. temp.|Jurás. medio|Jurás. tardío|Cretác. temp.|Cretác. medio|Cretác. tardío', short_type: 'Terópodo|Ceratop.|Tireóforo|Saurópodo|Pro-saurópodo|Ornitóp.|Margino.', short_diet: 'Carnívoro|Herbívoro|Omnívoro', short_continent: 'Norteam.|Sudamér.|Europa|Asia|África|Oceanía|Antárt.', short_cols: 'Periodo|Dieta|Tipo|Peso|Longitud|Contin.',
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
      challenge: '🦖 Reta a un amigo', save_image: '🖼️ Imagen', image_saved: '✅ Imagen guardada',
      challenge_text_win: 'He encontrado el dinosaurio de hoy en {n} intentos 🦖 ¿Me superas?', challenge_text_lose: 'El dinosaurio de hoy me ha ganado 💀 ¿Lo encuentras tú?',
      vs_banner_win: '🦖 Un amigo encontró el dinosaurio de hoy en <b>{n}</b> intentos. ¿Lo superas?', vs_banner_lose: '🦖 El dinosaurio de hoy le ganó a tu amigo. ¿Lo encuentras tú?',
      vs_you_win: '🏆 ¡Le ganas a tu amigo ({you} contra {them})!', vs_tie: '🤝 Empate con tu amigo ({you} contra {them}).', vs_you_lose: '😅 Tu amigo gana esta vez ({you} contra {them}).',
      history_title: 'Historial', history_empty: 'Aún no hay partidas.', won_label: 'Ganada', lost_label: 'Perdida',
      privacy: 'Privacidad', about: 'Acerca de', contact: 'Contacto', other_game: '🦸 Prueba nuestro juego de superhéroes', support: '☕ Apoya Dinodle', all_dinos: 'Todos los dinosaurios',
      help_names: 'Escribe el nombre científico (o alias como "T-Rex"). Solo se aceptan dinosaurios de la base de datos.',
      help_easy: 'El <b>modo Fácil</b> solo usa los 25 dinosaurios más famosos.',
      credits_link: 'Créditos de imágenes',
      streamer_btn: '🎥 Streamer', streamer_exit: '✖ Modo streamer', streamer_play_along: '🎮 Juega conmigo en <b>dinodle.app</b> · Puzzle #{n}', chat_title: '💬 Votos del chat (Twitch)', chat_channel_ph: 'Tu canal de Twitch', chat_connect: 'Conectar chat', chat_disconnect: 'Desconectar', chat_target_random: 'Dinosaurio aleatorio (sin spoilers)', chat_target_daily: 'Dinosaurio del día', chat_round_len: 'Duración de la ronda', chat_connecting: 'Conectando…', chat_connected: '✅ Conectado a #{ch} (solo lectura)', chat_error: '❌ No se pudo conectar al chat.', chat_closed: 'Chat desconectado.', chat_how: 'Vota en el chat: <b>!dino nombre</b> (ej. !dino trex)', chat_round: '⏱ Siguiente intento en {s} s', chat_paused: '⏸ En pausa', chat_no_votes: 'Aún no hay votos', chat_votes: '{n}', chat_guess_now: 'Jugar ya', chat_pause: 'Pausa', chat_resume: 'Reanudar', chat_new_game: '🎲 Nuevo dinosaurio', chat_guessed: 'El chat jugó {name} ({n} votos)'
    },
    pt: {
      page_title: 'Dinodle · Adivinhe o dinossauro do dia', mode_normal: 'Normal', mode_easy: 'Fácil', mode_label: 'Dificuldade', attempt_html: 'Tentativa <b id="attempts">0</b> de {max}', next_in: '⏳ Próximo em', placeholder: 'ex.: Tyrannosaurus, Triceratops… (comece a digitar)', guess: 'Chutar', col_name: 'Nome', practice: '🎲 Jogar outro (treino)', period_info: 'Períodos, do mais antigo ao mais recente: {list}. Um período vizinho aparece em amarelo.', practice_badge: '🎲 Treino — não conta nas estatísticas', back_daily: '← Voltar ao Dinodle de hoje', short_period: 'Triás. sup.|Jurás. inf.|Jurás. méd.|Jurás. sup.|Cretác. inf.|Cretác. méd.|Cretác. sup.', short_type: 'Terópode|Ceratop.|Tireóforo|Saurópode|Pro-saurópode|Ornitóp.|Margino.', short_diet: 'Carnívoro|Herbívoro|Onívoro', short_continent: 'Am. Norte|Am. Sul|Europa|Ásia|África|Oceania|Antárt.', short_cols: 'Período|Dieta|Tipo|Peso|Compr.|Contin.', not_in_list: '❌ "{raw}" não está na lista. Comece a digitar e escolha uma sugestão.', already: '⚠️ Você já tentou {name}.', win: '🎉 Acertou! Era <b>{name}</b> — {n} tentativas.', lose: '💀 Sem tentativas ({max}). Era <b>{name}</b>.', unlock_at: 'Desbloqueia na tentativa {n}', loading_img: 'Carregando imagem…', view_wiki: 'Ver na Wikipédia →', close: 'Fechar', silhouette_alt: 'silhueta', stats_title: '📊 Minhas estatísticas', stats_reset: 'Zerar estatísticas', stats_reset_confirm: 'Apagar todas as suas estatísticas locais? Isso não afeta o jogo de hoje.', played: 'Jogos', won: 'Vitórias', win_pct: '% de vitórias', streak: 'Sequência atual', max_streak: 'Melhor sequência', total: 'Total', attr_period: 'Período', attr_diet: 'Dieta', attr_type: 'Tipo', attr_weight: 'Peso', attr_length: 'Comprimento', attr_continent: 'Continente', hint_silhouette: 'Silhueta', hint_discoverer: 'Descobridor e ano', hint_description: 'Descrição', discovered_by: 'Descoberto por <b>{who}</b> em <b>{year}</b>.', no_description: 'Nenhuma descrição disponível.', load_error: 'Não foi possível carregar os dados do jogo. Abra a página via http.', help_summary: 'Como jogar / Legenda de cores', help_green: '<b>Verde</b>: igual ao dinossauro secreto', help_yellow: '<b>Amarelo</b>: perto — peso/comprimento a ~25–30%, o período vizinho (← mais antigo / → mais recente) ou um onívoro vs. um carnívoro ou herbívoro', help_grey: '<b>Cinza</b>: não corresponde. As setas dizem para subir ↑ ou descer ↓', help_hints: '<b>Pistas custam ossos 🦴.</b> Você desenterra um osso nas tentativas 3, 6 e 9 (2, 4 e 6 no Fácil) — você tem 12 tentativas. Use-os no descobridor, na descrição e por fim na silhueta — a última pista. Pontuação: 1000, −100 a cada 3 tentativas, −150 por osso. Derrota = 0.', score: 'Pontos', pts: 'pts', next_token: 'próximo 🦴 na tentativa {n}', token_earned: '🦴 Você desenterrou um osso! Use-o numa pista.', buy_hint: 'Usar 1 🦴', hint_requires: 'Desbloqueie antes as outras duas pistas', no_tokens: 'Sem ossos', final_score: 'Pontos: <b>{score}</b>.', share: '📋 Compartilhar', copied: '✅ Resultado copiado — cole onde quiser!', copy_this: 'Copie seu resultado:', challenge: '🦖 Desafie um amigo', save_image: '🖼️ Imagem', image_saved: '✅ Imagem salva', challenge_text_win: 'Encontrei o dinossauro de hoje em {n} tentativas 🦖 Consegue me superar?', challenge_text_lose: 'O dinossauro de hoje me venceu 💀 Você consegue achar?', vs_banner_win: '🦖 Um amigo encontrou o dinossauro de hoje em <b>{n}</b> tentativas. Consegue superar?', vs_banner_lose: '🦖 O dinossauro de hoje venceu seu amigo. Você consegue achar?', vs_you_win: '🏆 Você venceu seu amigo ({you} x {them})!', vs_tie: '🤝 Empate com seu amigo ({you} x {them}).', vs_you_lose: '😅 Seu amigo venceu desta vez ({you} x {them}).', history_title: 'Histórico', history_empty: 'Nenhuma partida ainda.', won_label: 'Vitória', lost_label: 'Derrota', privacy: 'Privacidade', about: 'Sobre', contact: 'Contato', other_game: '🦸 Experimente nosso jogo de super-heróis', support: '☕ Apoie o Dinodle', all_dinos: 'Todos os dinossauros', help_names: 'Digite o nome científico (ou um apelido como "T-Rex"). Só são aceitos dinossauros da base de dados.', help_easy: 'O <b>modo Fácil</b> usa apenas os 25 dinossauros mais famosos.', credits_link: 'Créditos das imagens', streamer_btn: '🎥 Streamer', streamer_exit: '✖ Modo streamer', streamer_play_along: '🎮 Jogue comigo em <b>dinodle.app</b> · Puzzle #{n}', chat_title: '💬 Votos do chat (Twitch)', chat_channel_ph: 'Seu canal da Twitch', chat_connect: 'Conectar chat', chat_disconnect: 'Desconectar', chat_target_random: 'Dinossauro aleatório (sem spoilers)', chat_target_daily: 'Dinossauro do dia', chat_round_len: 'Duração da rodada', chat_connecting: 'Conectando…', chat_connected: '✅ Conectado a #{ch} (somente leitura)', chat_error: '❌ Não foi possível conectar ao chat.', chat_closed: 'Chat desconectado.', chat_how: 'Vote no chat: <b>!dino nome</b> (ex.: !dino trex)', chat_round: '⏱ Próximo palpite em {s} s', chat_paused: '⏸ Pausado', chat_no_votes: 'Nenhum voto ainda', chat_votes: '{n}', chat_guess_now: 'Jogar agora', chat_pause: 'Pausar', chat_resume: 'Continuar', chat_new_game: '🎲 Novo dinossauro', chat_guessed: 'O chat jogou {name} ({n} votos)'
    },
    de: {
      page_title: 'Dinodle · Errate den Dinosaurier des Tages', mode_normal: 'Normal', mode_easy: 'Leicht', mode_label: 'Schwierigkeit', attempt_html: 'Versuch <b id="attempts">0</b> von {max}', next_in: '⏳ Nächstes in', placeholder: 'z. B. Tyrannosaurus, Triceratops… (einfach lostippen)', guess: 'Raten', col_name: 'Name', practice: '🎲 Noch eins (Übung)', period_info: 'Zeitalter, vom ältesten zum jüngsten: {list}. Ein benachbartes Zeitalter ist gelb.', practice_badge: '🎲 Übung — zählt nicht zur Statistik', back_daily: '← Zurück zum heutigen Dinodle', short_period: 'Spät-trias|Früh-jura|Mittel-jura|Spät-jura|Früh-kreide|Mittel-kreide|Spät-kreide', short_type: 'Theropode|Ceratop.|Thyreo.|Sauropode|Pro-sauropode|Ornitho.|Margino.', short_diet: 'Fleisch-fresser|Pflanzen-fresser|Alles-fresser', short_continent: 'Nord-amerika|Süd-amerika|Europa|Asien|Afrika|Ozeanien|Antarktis', short_cols: 'Zeitalter|Nahrung|Gruppe|Gewicht|Länge|Kontinent', not_in_list: '❌ „{raw}“ ist nicht in der Liste. Tippe los und wähle einen Vorschlag.', already: '⚠️ {name} hast du schon versucht.', win: '🎉 Richtig! Es war <b>{name}</b> — {n} Versuche.', lose: '💀 Keine Versuche mehr ({max}). Es war <b>{name}</b>.', unlock_at: 'Freigeschaltet bei Versuch {n}', loading_img: 'Bild wird geladen…', view_wiki: 'Auf Wikipedia ansehen →', close: 'Schließen', silhouette_alt: 'Silhouette', stats_title: '📊 Meine Statistik', stats_reset: 'Statistik zurücksetzen', stats_reset_confirm: 'Alle lokalen Statistiken löschen? Das heutige Spiel bleibt erhalten.', played: 'Gespielt', won: 'Gewonnen', win_pct: 'Siege %', streak: 'Aktuelle Serie', max_streak: 'Beste Serie', total: 'Gesamt', attr_period: 'Zeitalter', attr_diet: 'Ernährung', attr_type: 'Gruppe', attr_weight: 'Gewicht', attr_length: 'Länge', attr_continent: 'Kontinent', hint_silhouette: 'Silhouette', hint_discoverer: 'Entdecker & Jahr', hint_description: 'Beschreibung', discovered_by: 'Entdeckt von <b>{who}</b> im Jahr <b>{year}</b>.', no_description: 'Keine Beschreibung verfügbar.', load_error: 'Die Spieldaten konnten nicht geladen werden. Öffne die Seite über http.', help_summary: 'So wird gespielt / Farblegende', help_green: '<b>Grün</b>: stimmt mit dem geheimen Dinosaurier überein', help_yellow: '<b>Gelb</b>: knapp daneben — Gewicht/Länge innerhalb von ~25–30 %, das benachbarte Zeitalter (← früher / → später) oder ein Allesfresser vs. Fleisch- oder Pflanzenfresser', help_grey: '<b>Grau</b>: keine Übereinstimmung. Pfeile zeigen, ob es höher ↑ oder niedriger ↓ ist', help_hints: '<b>Hinweise kosten Knochen 🦴.</b> Bei Versuch 3, 6 und 9 (im Leicht-Modus 2, 4 und 6) gräbst du einen Knochen aus — du hast 12 Versuche. Gib sie für den Entdecker, die Beschreibung und zuletzt die Silhouette aus — den letzten Hinweis. Punkte: 1000, −100 alle 3 Versuche, −150 pro Knochen. Verloren = 0.', score: 'Punkte', pts: 'Pkt.', next_token: 'nächster 🦴 bei Versuch {n}', token_earned: '🦴 Du hast einen Knochen ausgegraben! Tausche ihn gegen einen Hinweis.', buy_hint: '1 🦴 einsetzen', hint_requires: 'Schalte zuerst die anderen zwei Hinweise frei', no_tokens: 'Keine Knochen mehr', final_score: 'Punkte: <b>{score}</b>.', share: '📋 Teilen', copied: '✅ Ergebnis kopiert — füge es überall ein!', copy_this: 'Kopiere dein Ergebnis:', challenge: '🦖 Freund herausfordern', save_image: '🖼️ Bild', image_saved: '✅ Bild gespeichert', challenge_text_win: 'Ich habe den Dinosaurier des Tages in {n} Versuchen gefunden 🦖 Schaffst du es besser?', challenge_text_lose: 'Der heutige Dinosaurier hat mich geschlagen 💀 Findest du ihn?', vs_banner_win: '🦖 Ein Freund hat den heutigen Dinosaurier in <b>{n}</b> Versuchen gefunden. Schaffst du es besser?', vs_banner_lose: '🦖 Der heutige Dinosaurier hat deinen Freund geschlagen. Findest du ihn?', vs_you_win: '🏆 Du hast deinen Freund geschlagen ({you} zu {them})!', vs_tie: '🤝 Unentschieden mit deinem Freund ({you} zu {them}).', vs_you_lose: '😅 Diesmal gewinnt dein Freund ({you} zu {them}).', history_title: 'Spielverlauf', history_empty: 'Noch keine Spiele.', won_label: 'Gewonnen', lost_label: 'Verloren', privacy: 'Datenschutz', about: 'Über', contact: 'Kontakt', other_game: '🦸 Probier unser Superhelden-Spiel', support: '☕ Dinodle unterstützen', all_dinos: 'Alle Dinosaurier', help_names: 'Gib den wissenschaftlichen Namen ein (oder einen Spitznamen wie „T-Rex“). Nur Dinosaurier aus der Datenbank zählen.', help_easy: 'Der <b>Leicht-Modus</b> nutzt nur die 25 bekanntesten Dinosaurier.', credits_link: 'Bildnachweise', streamer_btn: '🎥 Streamer', streamer_exit: '✖ Streamer-Modus', streamer_play_along: '🎮 Spiel mit auf <b>dinodle.app</b> · Rätsel #{n}', chat_title: '💬 Chat-Abstimmung (Twitch)', chat_channel_ph: 'Dein Twitch-Kanal', chat_connect: 'Chat verbinden', chat_disconnect: 'Trennen', chat_target_random: 'Zufälliger Dinosaurier (keine Spoiler)', chat_target_daily: 'Dinosaurier des Tages', chat_round_len: 'Rundendauer', chat_connecting: 'Verbinde…', chat_connected: '✅ Verbunden mit #{ch} (nur lesen)', chat_error: '❌ Verbindung zum Chat fehlgeschlagen.', chat_closed: 'Chat getrennt.', chat_how: 'Im Chat abstimmen: <b>!dino Name</b> (z. B. !dino trex)', chat_round: '⏱ Nächster Tipp in {s} s', chat_paused: '⏸ Pausiert', chat_no_votes: 'Noch keine Stimmen', chat_votes: '{n}', chat_guess_now: 'Jetzt raten', chat_pause: 'Pause', chat_resume: 'Weiter', chat_new_game: '🎲 Neuer Dinosaurier', chat_guessed: 'Der Chat hat {name} geraten ({n} Stimmen)'
    },
    it: {
      page_title: 'Dinodle · Indovina il dinosauro del giorno', mode_normal: 'Normale', mode_easy: 'Facile', mode_label: 'Difficoltà', attempt_html: 'Tentativo <b id="attempts">0</b> di {max}', next_in: '⏳ Prossimo tra', placeholder: 'es. Tyrannosaurus, Triceratops… (inizia a scrivere)', guess: 'Prova', col_name: 'Nome', practice: '🎲 Giocane un altro (allenamento)', period_info: 'Periodi, dal più antico al più recente: {list}. Un periodo vicino è giallo.', practice_badge: '🎲 Allenamento — non conta nelle statistiche', back_daily: '← Torna al Dinodle di oggi', short_period: 'Trias sup.|Giur. inf.|Giur. medio|Giur. sup.|Cret. inf.|Cret. medio|Cret. sup.', short_type: 'Teropode|Ceratop.|Tireoforo|Sauropode|Pro-sauropode|Ornitop.|Margino.', short_diet: 'Carnivoro|Erbivoro|Onnivoro', short_continent: 'Am. Nord|Am. Sud|Europa|Asia|Africa|Oceania|Antartide', short_cols: 'Periodo|Dieta|Gruppo|Peso|Lunghezza|Contin.', not_in_list: '❌ "{raw}" non è nella lista. Inizia a scrivere e scegli un suggerimento.', already: '⚠️ Hai già provato {name}.', win: '🎉 Esatto! Era <b>{name}</b> — {n} tentativi.', lose: '💀 Tentativi finiti ({max}). Era <b>{name}</b>.', unlock_at: 'Si sblocca al tentativo {n}', loading_img: 'Caricamento immagine…', view_wiki: 'Vedi su Wikipedia →', close: 'Chiudi', silhouette_alt: 'sagoma', stats_title: '📊 Le mie statistiche', stats_reset: 'Azzera statistiche', stats_reset_confirm: 'Cancellare tutte le tue statistiche locali? La partita di oggi non cambia.', played: 'Giocate', won: 'Vinte', win_pct: '% vittorie', streak: 'Serie attuale', max_streak: 'Serie migliore', total: 'Totale', attr_period: 'Periodo', attr_diet: 'Dieta', attr_type: 'Gruppo', attr_weight: 'Peso', attr_length: 'Lunghezza', attr_continent: 'Continente', hint_silhouette: 'Sagoma', hint_discoverer: 'Scopritore e anno', hint_description: 'Descrizione', discovered_by: 'Scoperto da <b>{who}</b> nel <b>{year}</b>.', no_description: 'Nessuna descrizione disponibile.', load_error: 'Impossibile caricare i dati del gioco. Apri la pagina via http.', help_summary: 'Come si gioca / Legenda dei colori', help_green: '<b>Verde</b>: coincide con il dinosauro segreto', help_yellow: '<b>Giallo</b>: vicino — peso/lunghezza entro ~25–30%, il periodo vicino (← più antico / → più recente) oppure un onnivoro vs. un carnivoro o erbivoro', help_grey: '<b>Grigio</b>: nessuna corrispondenza. Le frecce dicono se salire ↑ o scendere ↓', help_hints: '<b>Gli indizi costano ossa 🦴.</b> Dissotterri un osso ai tentativi 3, 6 e 9 (2, 4 e 6 in Facile) — hai 12 tentativi. Spendile per lo scopritore, la descrizione e infine la sagoma — l\'ultimo indizio. Punteggio: 1000, −100 ogni 3 tentativi, −150 per osso. Sconfitta = 0.', score: 'Punti', pts: 'pt', next_token: 'prossimo 🦴 al tentativo {n}', token_earned: '🦴 Hai dissotterrato un osso! Usalo per un indizio.', buy_hint: 'Usa 1 🦴', hint_requires: 'Sblocca prima gli altri due indizi', no_tokens: 'Niente ossa', final_score: 'Punti: <b>{score}</b>.', share: '📋 Condividi', copied: '✅ Risultato copiato — incollalo dove vuoi!', copy_this: 'Copia il tuo risultato:', challenge: '🦖 Sfida un amico', save_image: '🖼️ Immagine', image_saved: '✅ Immagine salvata', challenge_text_win: 'Ho trovato il dinosauro di oggi in {n} tentativi 🦖 Riesci a battermi?', challenge_text_lose: 'Il dinosauro di oggi mi ha battuto 💀 Riesci a trovarlo?', vs_banner_win: '🦖 Un amico ha trovato il dinosauro di oggi in <b>{n}</b> tentativi. Riesci a batterlo?', vs_banner_lose: '🦖 Il dinosauro di oggi ha battuto il tuo amico. Riesci a trovarlo?', vs_you_win: '🏆 Hai battuto il tuo amico ({you} a {them})!', vs_tie: '🤝 Pareggio con il tuo amico ({you} a {them}).', vs_you_lose: '😅 Stavolta vince il tuo amico ({you} a {them}).', history_title: 'Cronologia', history_empty: 'Ancora nessuna partita.', won_label: 'Vinta', lost_label: 'Persa', privacy: 'Privacy', about: 'Chi siamo', contact: 'Contatti', other_game: '🦸 Prova il nostro gioco di supereroi', support: '☕ Sostieni Dinodle', all_dinos: 'Tutti i dinosauri', help_names: 'Scrivi il nome scientifico (o un soprannome come "T-Rex"). Sono accettati solo i dinosauri del database.', help_easy: 'La <b>modalità Facile</b> usa solo i 25 dinosauri più famosi.', credits_link: 'Crediti immagini', streamer_btn: '🎥 Streamer', streamer_exit: '✖ Modalità streamer', streamer_play_along: '🎮 Gioca con me su <b>dinodle.app</b> · Puzzle #{n}', chat_title: '💬 Voti della chat (Twitch)', chat_channel_ph: 'Il tuo canale Twitch', chat_connect: 'Collega la chat', chat_disconnect: 'Scollega', chat_target_random: 'Dinosauro casuale (niente spoiler)', chat_target_daily: 'Dinosauro del giorno', chat_round_len: 'Durata del turno', chat_connecting: 'Connessione…', chat_connected: '✅ Collegato a #{ch} (sola lettura)', chat_error: '❌ Impossibile collegarsi alla chat.', chat_closed: 'Chat scollegata.', chat_how: 'Vota in chat: <b>!dino nome</b> (es. !dino trex)', chat_round: '⏱ Prossimo tentativo tra {s} s', chat_paused: '⏸ In pausa', chat_no_votes: 'Ancora nessun voto', chat_votes: '{n}', chat_guess_now: 'Gioca ora', chat_pause: 'Pausa', chat_resume: 'Riprendi', chat_new_game: '🎲 Nuovo dinosauro', chat_guessed: 'La chat ha giocato {name} ({n} voti)'
    }
  };
  const LOCALE = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', de: 'de-DE', it: 'it-IT' };

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

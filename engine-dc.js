/* =========================================================
   engine-dc.js V7 — DC con tokens, score, 3 idiomas, historial
   ========================================================= */
(function (global) {
  'use strict';

  const LANG_KEY = 'wordle_lang_v7';
  const STATS_KEY = 'wordle_stats_v5'; // comparte stats con dino

  const I18N = {
    es: {
      attempt:'Intento', of:'de', next:'Próximo en', submit:'Probar',
      practice:'Jugar otro (práctica)', correct:'Correcto. Era',
      attempts_word:'intentos', failed:'Se acabaron los intentos. Era',
      already_tried:'Ya probaste con', not_in_list:'no está en la lista.',
      loading:'Cargando imagen...', wikipedia:'Ver en Wikipedia',
      stats_title:'Mis estadísticas', played:'Jugadas', won:'Ganadas',
      win_pct:'% victorias', current_streak:'Racha actual', max_streak:'Racha máxima',
      total:'Total', reset_stats:'Reiniciar estadísticas',
      confirm_reset:'¿Borrar estadísticas e historial?',
      dino_label:'Dino', dc_label:'DC',
      score:'Puntuación', tokens:'Tokens', available:'disponibles',
      buy_hint:'Comprar (1 token)', hint_bought:'Comprada',
      not_enough_tokens:'Necesitas un token (consíguelo en los intentos 3, 6 y 12)',
      history_title:'Historial de partidas', history_empty:'Aún no hay partidas registradas.',
      won_label:'Ganada', lost_label:'Perdida',
      name:'Nombre', realname:'Nombre real', gender:'Género',
      alignment:'Alineación', first:'1ª aparición', team:'Equipo',
      power:'Poder', city:'Ciudad',
      hint_creator:'Creador', hint_firstComic:'Primer cómic',
      hint_quote:'Cita famosa', hint_description:'Descripción',
      hint_nemesis:'Némesis', hint_actors:'En pantalla',
      no_data:'No hay datos sobre esto, mala suerte',
      no_actors:'Este personaje no tiene adaptaciones ni actores de voz',
      voice_actor:'voz', live_actor:'acción real',
      back:'← Inicio', page_title:'Wordle DC',
      help_title:'Cómo se juega / Leyenda',
      help_green:'Verde: coincide', help_yellow:'Amarillo: año cercano (≤3 años)',
      help_gray:'Gris: no coincide. Flecha = año más reciente o antiguo',
      help_hints:'Gana tokens en los intentos 3, 6 y 12 para comprar pistas. Pierdes 100 cada 4 intentos y 150 por token usado. Si pierdes, 0 puntos.',
      values:{
        'Carnívoro':'Carnívoro','Herbívoro':'Herbívoro','Omnívoro':'Omnívoro',
        'Héroe':'Héroe','Villano':'Villano','Anti-héroe':'Anti-héroe',
        'Masculino':'Masculino','Femenino':'Femenino','Otro':'Otro'
      }
    },
    fr: {
      attempt:'Essai', of:'sur', next:'Prochain dans', submit:'Essayer',
      practice:'Jouer un autre', correct:'Correct. C\'était',
      attempts_word:'essais', failed:'Plus d\'essais. C\'était',
      already_tried:'Tu as déjà essayé', not_in_list:'n\'est pas dans la liste.',
      loading:'Chargement...', wikipedia:'Voir sur Wikipédia',
      stats_title:'Mes statistiques', played:'Parties', won:'Gagnées',
      win_pct:'% victoires', current_streak:'Série actuelle', max_streak:'Série max',
      total:'Total', reset_stats:'Réinitialiser',
      confirm_reset:'Effacer les statistiques et l\'historique ?',
      dino_label:'Dino', dc_label:'DC',
      score:'Score', tokens:'Jetons', available:'disponibles',
      buy_hint:'Acheter (1 jeton)', hint_bought:'Achetée',
      not_enough_tokens:'Il te faut un jeton (essais 3, 6 et 12)',
      history_title:'Historique des parties', history_empty:'Aucune partie enregistrée.',
      won_label:'Gagnée', lost_label:'Perdue',
      name:'Nom', realname:'Nom réel', gender:'Genre',
      alignment:'Alignement', first:'1ère apparition', team:'Équipe',
      power:'Pouvoir', city:'Ville',
      hint_creator:'Créateur', hint_firstComic:'Premier comic',
      hint_quote:'Citation célèbre', hint_description:'Description',
      hint_nemesis:'Némésis', hint_actors:'À l\'écran',
      no_data:'Pas de données, pas de chance',
      no_actors:'Ce personnage n\'a ni adaptations ni acteurs de doublage',
      voice_actor:'voix', live_actor:'prise de vue réelle',
      back:'← Accueil', page_title:'Wordle DC',
      help_title:'Comment jouer / Légende',
      help_green:'Vert : correspond', help_yellow:'Jaune : année proche (≤3 ans)',
      help_gray:'Gris : ne correspond pas. Flèche = année plus récente ou ancienne',
      help_hints:'Gagne des jetons aux essais 3, 6 et 12 pour acheter des indices. -100 tous les 4 essais et -150 par jeton utilisé. Si tu perds, 0 point.',
      values:{
        'Carnívoro':'Carnivore','Herbívoro':'Herbivore','Omnívoro':'Omnivore',
        'Héroe':'Héros','Villano':'Vilain','Anti-héroe':'Anti-héros',
        'Masculino':'Masculin','Femenino':'Féminin','Otro':'Autre', 'Ninguno':'Aucun'
      }
    },
    en: {
      attempt:'Attempt', of:'of', next:'Next in', submit:'Try',
      practice:'Play another', correct:'Correct. It was',
      attempts_word:'attempts', failed:'No more attempts. It was',
      already_tried:'Already tried', not_in_list:'not in the list.',
      loading:'Loading image...', wikipedia:'View on Wikipedia',
      stats_title:'My stats', played:'Played', won:'Won',
      win_pct:'% wins', current_streak:'Current streak', max_streak:'Max streak',
      total:'Total', reset_stats:'Reset stats',
      confirm_reset:'Delete all stats and history?',
      dino_label:'Dino', dc_label:'DC',
      score:'Score', tokens:'Tokens', available:'available',
      buy_hint:'Buy (1 token)', hint_bought:'Bought',
      not_enough_tokens:'You need a token (earn at attempts 3, 6 and 12)',
      history_title:'Game history', history_empty:'No games recorded yet.',
      won_label:'Won', lost_label:'Lost',
      name:'Name', realname:'Real name', gender:'Gender',
      alignment:'Alignment', first:'1st appearance', team:'Team',
      power:'Power', city:'City',
      hint_creator:'Creator', hint_firstComic:'First comic',
      hint_quote:'Famous quote', hint_description:'Description',
      hint_nemesis:'Nemesis', hint_actors:'On screen',
      no_data:'No data on this, tough luck',
      no_actors:'This character has no adaptations or voice actors',
      voice_actor:'voice', live_actor:'live-action',
      back:'← Home', page_title:'Wordle DC',
      help_title:'How to play / Legend',
      help_green:'Green: matches', help_yellow:'Yellow: close year (≤3 years)',
      help_gray:'Gray: no match. Arrow = more recent or older year',
      help_hints:'Earn tokens at attempts 3, 6 and 12 to buy hints. -100 every 4 attempts and -150 per token used. Lose = 0 points.',
      values:{
        'Carnívoro':'Carnivore','Herbívoro':'Herbivore','Omnívoro':'Omnivore',
        'Héroe':'Hero','Villano':'Villain','Anti-héroe':'Anti-hero',
        'Masculino':'Male','Femenino':'Female','Otro':'Other','Ninguno':'None'
      }
    }
  };

  function getLang(){ return localStorage.getItem(LANG_KEY) || 'es'; }
  function setLang(l){ localStorage.setItem(LANG_KEY, l); }
  const LANG = getLang();
  const T = I18N[LANG] || I18N.es;
  window.__T = T; // accesible desde dc.js para hints
  function tv(v){ return (T.values && T.values[v]) || v; }

  /* utils */
  function normalize(s){
    return (s||'').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,' ').trim();
  }
  function el(tag, cls, html){
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function todayStamp(){
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  /* stats compartidas */
  function getStats(){
    try {
      const s = JSON.parse(localStorage.getItem(STATS_KEY)||'null');
      if (s && s.dino && s.dc) return s;
    } catch(e){}
    return {
      dino:{played:0,won:0,streak:0,maxStreak:0,lastDate:null},
      dc:{played:0,won:0,streak:0,maxStreak:0,lastDate:null}
    };
  }
  function saveStats(s){ localStorage.setItem(STATS_KEY, JSON.stringify(s)); }
  function recordGame(gameId, won, dateStr){
    const all = getStats();
    const s = all[gameId];
    if (!s || s.lastDate === dateStr) return;
    s.played++;
    if (won){
      s.won++;
      s.streak = (s.streak||0)+1;
      if (s.streak > (s.maxStreak||0)) s.maxStreak = s.streak;
    } else { s.streak = 0; }
    s.lastDate = dateStr;
    saveStats(all);
    renderStatsWidget();
  }

  /* historial DC */
  function getHistory(key){
    try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch(e){ return []; }
  }
  function pushHistory(key, entry){
    const h = getHistory(key);
    h.unshift(entry);
    if (h.length > 50) h.length = 50;
    localStorage.setItem(key, JSON.stringify(h));
  }

  function renderStatsWidget(){
    const w = document.getElementById('stats-widget');
    if (!w) return;
    const all = getStats();
    const d = all.dino, dc = all.dc;
    const total = d.played + dc.played;
    const won = d.won + dc.won;
    const pct = total ? Math.round((won/total)*100) : 0;
    w.innerHTML = '<button type="button" class="stats-btn" id="stats-btn">' +
      '<span class="stats-line"><b>' + T.dino_label + '</b> ' + d.won + '/' + d.played +
      ' <span class="stats-sep">·</span> <b>' + T.dc_label + '</b> ' + dc.won + '/' + dc.played +
      ' <span class="stats-sep">·</span> <b>' + pct + '%</b></span></button>';
    document.getElementById('stats-btn').onclick = () => openStatsModal();
  }

  function ensureLangToggle(){
    if (document.getElementById('lang-toggle-widget')) return;
    const w = document.getElementById('lang-toggle-widget');
    if (!w) return;
    w.innerHTML = ['es','fr','en'].map(l =>
      '<button data-l="'+l+'" class="'+(LANG===l?'active':'')+'">'+l.toUpperCase()+'</button>'
    ).join('');
    w.querySelectorAll('button').forEach(b => {
      b.onclick = () => { setLang(b.dataset.l); location.reload(); };
    });
  }

  function openStatsModal(historyKey){
    let modal = document.getElementById('stats-modal');
    if (!modal){
      modal = el('div','modal-overlay');
      modal.id = 'stats-modal';
      modal.innerHTML =
        '<div class="modal stats-modal">' +
          '<button class="modal-close" type="button">×</button>' +
          '<h2 class="stats-title">'+T.stats_title+'</h2>' +
          '<div class="stats-grid" id="stats-grid"></div>' +
          '<h3 class="history-title">'+T.history_title+'</h3>' +
          '<div class="history-list" id="history-list"></div>' +
          '<button class="stats-reset" id="stats-reset" type="button">'+T.reset_stats+'</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
    }
    const modalKey = historyKey || window.__historyKey || 'dc-history-v7';
    const resetBtn = modal.querySelector('#stats-reset');
    resetBtn.onclick = () => {
      if (confirm(T.confirm_reset)){
        localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(modalKey);
        fillStatsModal(modal, modalKey);
        renderStatsWidget();
      }
    };
    fillStatsModal(modal, modalKey);
    modal.classList.add('show');
  }

  function fillStatsModal(modal, historyKey){
    const all = getStats();
    const grid = modal.querySelector('#stats-grid');
    grid.innerHTML = '';
    function card(label, s){
      const pct = s.played ? Math.round((s.won/s.played)*100) : 0;
      const c = el('div','stats-card');
      c.innerHTML =
        '<div class="stats-card-head">'+label+'</div>' +
        '<div class="stats-card-row"><span>'+T.played+'</span><b>'+s.played+'</b></div>' +
        '<div class="stats-card-row"><span>'+T.won+'</span><b>'+s.won+'</b></div>' +
        '<div class="stats-card-row"><span>'+T.win_pct+'</span><b>'+pct+'%</b></div>' +
        '<div class="stats-card-row"><span>'+T.current_streak+'</span><b>'+(s.streak||0)+'</b></div>' +
        '<div class="stats-card-row"><span>'+T.max_streak+'</span><b>'+(s.maxStreak||0)+'</b></div>';
      grid.appendChild(c);
    }
    card(T.dino_label, all.dino);
    card(T.dc_label, all.dc);
    const tp = all.dino.played + all.dc.played;
    const tw = all.dino.won + all.dc.won;
    const tpct = tp ? Math.round((tw/tp)*100) : 0;
    const tot = el('div','stats-card stats-card-total');
    tot.innerHTML =
      '<div class="stats-card-head">'+T.total+'</div>' +
      '<div class="stats-card-row"><span>'+T.played+'</span><b>'+tp+'</b></div>' +
      '<div class="stats-card-row"><span>'+T.won+'</span><b>'+tw+'</b></div>' +
      '<div class="stats-card-row"><span>'+T.win_pct+'</span><b>'+tpct+'%</b></div>';
    grid.appendChild(tot);

    const hist = modal.querySelector('#history-list');
    const entries = getHistory(historyKey);
    if (!entries.length){
      hist.innerHTML = '<div class="history-empty">'+T.history_empty+'</div>';
      return;
    }
    hist.innerHTML = entries.map(e => {
      const badge = e.won ? 'history-win' : 'history-lose';
      const label = e.won ? T.won_label : T.lost_label;
      return '<div class="history-item '+badge+'">' +
        '<div class="history-main"><b>'+e.target+'</b> <span class="history-date">'+e.date+'</span></div>' +
        '<div class="history-meta"><span>'+label+'</span> · '+T.attempt+' '+e.attempts+' · '+
        T.score+' '+e.score+' · '+T.tokens+' '+e.tokensUsed+'</div>' +
      '</div>';
    }).join('');
  }

  /* imágenes Wikipedia */
  const imgCache = new Map();
  function upscale(url,size){ return url ? url.replace(/\/(\d+)px-/,'/'+size+'px-') : url; }
  function isJunk(src){
    if (!src) return true;
    if (/\.svg(\?|$)/i.test(src)) return true;
    if (/(logo|icon|map|flag|symbol|disambig|question_book|edit-clear)/i.test(src)) return true;
    return false;
  }
  async function tryFetchImage(title, lang, size){
    if (!title) return null;
    try {
      const safe = encodeURIComponent(title.replace(/ /g,'_'));
      const url = 'https://'+lang+'.wikipedia.org/api/rest_v1/page/summary/'+safe;
      const r = await fetch(url,{headers:{'Accept':'application/json'}});
      if (!r.ok) return null;
      const data = await r.json();
      if (data.type === 'disambiguation') return null;
      let src = (data.thumbnail && data.thumbnail.source) || (data.originalimage && data.originalimage.source);
      if (!src || isJunk(src)) return null;
      return upscale(src, size || 600);
    } catch(e){ return null; }
  }
  async function fetchWikiImage(item, lang, size){
    const key = item.name+'|'+lang+'|'+(size||600);
    if (imgCache.has(key)) return imgCache.get(key);
    const cands = [];
    if (item.wikiName) cands.push(item.wikiName);
    if (item.name){
      cands.push(item.name);
      const base = item.name.split(' (')[0];
      if (base !== item.name) cands.push(base);
    }
    if (item.realName && item.realName !== 'Desconocido' && !item.realName.startsWith('No hay')){
      item.realName.split('/').forEach(p => { const t = p.trim(); if (t && t.length > 2) cands.push(t); });
    }
    if (item.aliases) item.aliases.forEach(a => cands.push(a));
    const seen = new Set();
    const list = cands.filter(c => { const k=(c||'').toLowerCase(); if (!k||seen.has(k)) return false; seen.add(k); return true; });
    const langs = [lang]; ['en','fr','es'].forEach(lg => { if (langs.indexOf(lg)===-1) langs.push(lg); });
    for (let li=0; li<langs.length; li++){
      for (let i=0; i<list.length; i++){
        const s = await tryFetchImage(list[i], langs[li], size);
        if (s){ imgCache.set(key,s); return s; }
      }
    }
    imgCache.set(key, null);
    return null;
  }

  function lockImage(img){
    img.draggable = false;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.addEventListener('contextmenu', e => e.preventDefault());
  }
  function censorNames(text, item){
    if (!text) return text;
    const targets = [];
    if (item.name){
      targets.push(item.name);
      const base = item.name.split(' (')[0];
      if (base !== item.name) targets.push(base);
    }
    if (item.aliases) item.aliases.forEach(a => targets.push(a));
    if (item.realName && item.realName !== 'Desconocido'){
      item.realName.split('/').forEach(p => { const t = p.trim(); if (t) targets.push(t); });
    }
    const unique = Array.from(new Set(targets)).filter(n => n && n.length >= 3);
    unique.sort((a,b) => b.length - a.length);
    let out = text;
    unique.forEach(n => {
      const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(esc, 'gi');
      out = out.replace(re, m => '─'.repeat(Math.min(m.length, 10)));
    });
    return out;
  }
  function startCountdown(node){
    function tick(){
      const now = new Date();
      const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1);
      const diff = Math.max(0, next - now.getTime());
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      node.innerHTML = T.next+' <b>'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'</b>';
    }
    tick();
    return setInterval(tick, 1000);
  }

  /* ============ CREATE GAME ============ */
  function createGame(cfg){
    const data = cfg.data;
    const attributes = cfg.attributes;
    const hints = cfg.hints || [];
    const maxAttempts = cfg.maxAttempts || 20;
    const storageKey = cfg.storageKey || 'dc-daily-v7';
    const historyKey = cfg.historyKey || 'dc-history-v7';
    const gameId = cfg.gameId || 'dc';
    const wikiLang = cfg.wikiLang || 'en';
    const tokensAt = (cfg.tokens && cfg.tokens.at) || [3,6,12];
    const scoring = Object.assign({base:1000, attemptPenalty:100, attemptInterval:4, tokenPenalty:150}, cfg.scoring || {});
    const wikiUrlFor = cfg.wikiUrlFor || (item =>
      'https://'+wikiLang+'.wikipedia.org/wiki/' +
      encodeURIComponent(item.name.split(' (')[0].replace(/ /g,'_')));

    window.__historyKey = historyKey;

    /* topbar */
    document.documentElement.lang = LANG;
    document.title = T.page_title;
    const back = document.getElementById('back-btn');
    if (back) back.textContent = T.back;
    const pt = document.getElementById('page-title');
    if (pt) pt.textContent = T.page_title;
    const ht = document.getElementById('help-title');
    if (ht) ht.textContent = T.help_title;
    const hl = document.getElementById('help-list');
    if (hl) hl.innerHTML =
      '<li><span class="sw correct"></span>'+T.help_green+'</li>' +
      '<li><span class="sw close"></span>'+T.help_yellow+'</li>' +
      '<li><span class="sw wrong"></span>'+T.help_gray+'</li>';
    const hh = document.getElementById('help-hints');
    if (hh) hh.textContent = T.help_hints;

    ensureLangToggle();
    renderStatsWidget();

    /* índice */
    const searchList = [];
    const byKey = new Map();
    data.forEach((item,i) => {
      const keys = [item.name].concat(item.aliases || []);
      keys.forEach(k => {
        const n = normalize(k);
        if (!n) return;
        if (!byKey.has(n)) byKey.set(n, i);
        searchList.push({display: item.name, item});
      });
    });
    function findItem(raw){
      const n = normalize(raw);
      if (!n) return null;
      if (byKey.has(n)) return data[byKey.get(n)];
      const found = new Set();
      byKey.forEach((i,k) => {
        if (k.indexOf(n) === 0 || n.indexOf(k) === 0) found.add(i);
      });
      if (found.size === 1) return data[Array.from(found)[0]];
      return null;
    }

    const state = {
      target: null, guesses: [], attempts: 0,
      over: false, won: false,
      hintsBought: new Set(), practice: false
    };
    const dailyIndex = Math.floor(Date.now()/86400000) % data.length;

    let inputEl, formEl, msgEl, boardBody, counterEl, scoreEl, tokensEl,
        hintsEl, bannerEl, acListEl, acTimer;

    build();
    load();
    render();
    if (state.over) finish();

    function build(){
      const root = document.getElementById('game');
      root.innerHTML = '';

      const head = el('div','game-head');
      counterEl = el('div','counter');
      counterEl.innerHTML = T.attempt+' <b id="attempts">0</b> '+T.of+' '+maxAttempts;
      head.appendChild(counterEl);
      scoreEl = el('div','score-display');
      head.appendChild(scoreEl);
      tokensEl = el('div','tokens-display');
      head.appendChild(tokensEl);
      const cd = el('div','next-puzzle');
      head.appendChild(cd);
      root.appendChild(head);
      startCountdown(cd);

      if (hints.length){
        hintsEl = el('div','hints');
        root.appendChild(hintsEl);
      }

      formEl = el('form','guess-form');
      const acWrap = el('div','autocomplete-wrap');
      inputEl = el('input');
      inputEl.type = 'text';
      inputEl.placeholder = cfg.placeholder || '';
      inputEl.autocomplete = 'off';
      inputEl.autocapitalize = 'off';
      inputEl.spellcheck = false;
      acListEl = el('ul','autocomplete-list');
      acWrap.appendChild(inputEl);
      acWrap.appendChild(acListEl);
      formEl.appendChild(acWrap);
      const btn = el('button', null, T.submit);
      btn.type = 'submit';
      formEl.appendChild(btn);
      root.appendChild(formEl);

      msgEl = el('div','msg');
      root.appendChild(msgEl);

      const wrap = el('div','table-wrap');
      const table = el('table','board');
      const thead = el('thead');
      const trh = el('tr');
      trh.appendChild(el('th','col-name', T.name));
      attributes.forEach(a => trh.appendChild(el('th', null, T[a.labelKey] || a.labelKey)));
      thead.appendChild(trh);
      table.appendChild(thead);
      boardBody = el('tbody');
      table.appendChild(boardBody);
      wrap.appendChild(table);
      root.appendChild(wrap);

      bannerEl = el('div','banner');
      root.appendChild(bannerEl);

      const p = el('button','practice', T.practice);
      p.type = 'button';
      p.onclick = newPractice;
      root.appendChild(p);

      formEl.addEventListener('submit', onSubmit);
      inputEl.addEventListener('input', onInput);
      inputEl.addEventListener('keydown', e => { if (e.key === 'Escape') closeAutocomplete(); });
      document.addEventListener('click', e => { if (!acWrap.contains(e.target)) closeAutocomplete(); });

      const modal = el('div','modal-overlay');
      modal.id = 'reveal-modal';
      modal.innerHTML =
        '<div class="modal">' +
          '<button class="modal-close" type="button">×</button>' +
          '<div class="modal-img-wrap"><div class="modal-img-spinner">'+T.loading+'</div></div>' +
          '<h2 class="modal-title"></h2>' +
          '<p class="modal-desc"></p>' +
          '<a class="modal-link" target="_blank" rel="noopener">'+T.wikipedia+' →</a>' +
        '</div>';
      root.appendChild(modal);
      modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
    }

    function onInput(){
      clearTimeout(acTimer);
      const q = normalize(inputEl.value);
      if (!q || q.length < 2){ closeAutocomplete(); return; }
      acTimer = setTimeout(() => renderSuggestions(q), 120);
    }
    function renderSuggestions(q){
      const seen = new Set();
      const matches = [];
      for (const s of searchList){
        if (matches.length >= 8) break;
        const dn = normalize(s.display);
        if (dn.indexOf(q) !== -1 && !seen.has(s.item.name)){
          seen.add(s.item.name); matches.push(s);
        }
      }
      if (!matches.length){ closeAutocomplete(); return; }
      acListEl.innerHTML = '';
      matches.forEach(m => {
        const li = el('li', null, m.display);
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          inputEl.value = m.item.name;
          closeAutocomplete();
          inputEl.focus();
        });
        acListEl.appendChild(li);
      });
      acListEl.classList.add('show');
    }
    function closeAutocomplete(){ acListEl.classList.remove('show'); acListEl.innerHTML = ''; }

    function computeTokensEarned(){
      return tokensAt.filter(t => state.attempts >= t).length;
    }
    function computeScore(){
      let s = scoring.base;
      s -= Math.floor(state.attempts / scoring.attemptInterval) * scoring.attemptPenalty;
      s -= state.hintsBought.size * scoring.tokenPenalty;
      if (state.over && !state.won) s = 0;
      return Math.max(0, s);
    }
    function updateScoreUI(){
      if (scoreEl) scoreEl.innerHTML = T.score+': <b>'+computeScore()+'</b>';
      if (tokensEl){
        const earned = computeTokensEarned();
        const used = state.hintsBought.size;
        const avail = Math.max(0, earned - used);
        tokensEl.innerHTML = T.tokens+': <b>'+avail+'</b> '+T.available;
      }
    }

    function onSubmit(e){
      e.preventDefault();
      if (state.over) return;
      closeAutocomplete();
      const raw = inputEl.value.trim();
      if (!raw) return;
      const item = findItem(raw);
      if (!item){
        showMsg('"'+raw+'" '+T.not_in_list, 'bad');
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 400);
        return;
      }
      if (state.guesses.indexOf(item.name) !== -1){
        showMsg(T.already_tried+' '+item.name+'.', 'bad');
        return;
      }
      state.guesses.push(item.name);
      state.attempts++;
      inputEl.value = '';
      showMsg('');
      if (item.name === state.target.name){ state.over = true; state.won = true; }
      else if (state.attempts >= maxAttempts){ state.over = true; }
      render();
      save();
      if (state.over) finish();
    }

    function buyHint(hintId){
      if (state.hintsBought.has(hintId)) return;
      const earned = computeTokensEarned();
      if (state.hintsBought.size >= earned) return;
      state.hintsBought.add(hintId);
      save();
      render();
    }

    function finish(){
      bannerEl.className = 'banner show ' + (state.won ? 'win' : 'lose');
      const finalScore = computeScore();
      bannerEl.innerHTML = state.won
        ? T.correct+' <b>'+state.target.name+'</b> — '+state.attempts+' '+T.attempts_word+'. '+T.score+': <b>'+finalScore+'</b>.'
        : T.failed+' <b>'+state.target.name+'</b>. '+T.score+': <b>0</b>.';
      inputEl.disabled = true;
      const b = formEl.querySelector('button');
      if (b) b.disabled = true;
      if (!state.practice){
        recordGame(gameId, state.won, todayStamp());
        pushHistory(historyKey, {
          date: todayStamp(), target: state.target.name,
          score: finalScore, won: state.won,
          attempts: state.attempts, tokensUsed: state.hintsBought.size
        });
      }
      showRevealModal(state.target);
    }

    function showRevealModal(item){
      const modal = document.getElementById('reveal-modal');
      const imgWrap = modal.querySelector('.modal-img-wrap');
      const title = modal.querySelector('.modal-title');
      const desc = modal.querySelector('.modal-desc');
      const link = modal.querySelector('.modal-link');
      imgWrap.innerHTML = '<div class="modal-img-spinner">'+T.loading+'</div>';
      title.textContent = item.name;
      desc.textContent = item.description || item.realName || '';
      link.href = wikiUrlFor(item);
      link.textContent = T.wikipedia+' →';
      modal.classList.add('show');
      fetchWikiImage(item, wikiLang, 800).then(url => {
        if (url){
          wrap.innerHTML = '';
          const img = document.createElement('img');
          img.className = 'modal-img';
          img.alt = item.name;
          lockImage(img);
          img.onload = () => { wrap.innerHTML = ''; wrap.appendChild(img); img.style.opacity = '1'; };
          img.onerror = () => { wrap.innerHTML = '<div class="modal-emoji">'+initials(item.name)+'</div>'; };
          img.src = url;
          const wrap2 = imgWrap;
          wrap2.innerHTML = '';
          const img2 = document.createElement('img');
          img2.className = 'modal-img';
          img2.alt = item.name;
          lockImage(img2);
          img2.onload = () => { wrap2.innerHTML = ''; wrap2.appendChild(img2); img2.style.opacity = '1'; };
          img2.onerror = () => { wrap2.innerHTML = '<div class="modal-emoji">'+initials(item.name)+'</div>'; };
          img2.src = url;
        } else {
          imgWrap.innerHTML = '<div class="modal-emoji">'+initials(item.name)+'</div>';
        }
      });
    }
    function initials(name){
      return (name||'?').replace(/\(([^)]+)\)/, '$1').split(/\s+/).slice(0,2)
        .map(w => w[0]||'').join('').toUpperCase() || '?';
    }

    function showMsg(text, kind){
      msgEl.textContent = text;
      msgEl.className = 'msg' + (kind ? ' '+kind : '');
    }

    function render(){
      if (!state.target) return;
      counterEl.querySelector('#attempts').textContent = state.attempts;
      updateScoreUI();

      boardBody.innerHTML = '';
      state.guesses.forEach(name => {
        const g = data.find(d => d.name === name);
        if (g) boardBody.appendChild(buildRow(g));
      });

      if (hintsEl){
        hintsEl.innerHTML = '';
        const earned = computeTokensEarned();
        const avail = earned - state.hintsBought.size;
        hints.forEach(h => {
          const bought = state.hintsBought.has(h.id);
          const card = el('div','hint ' + (bought ? 'bought' : 'available'));
          card.appendChild(el('div','hint-label', T['hint_'+h.id] || h.id));
          const body = el('div','hint-body');
          if (bought){
            const out = h.render(state.target);
            body.innerHTML = censorNames(out, state.target);
          } else {
            if (avail > 0){
              const btn = el('button','hint-buy', T.buy_hint);
              btn.type = 'button';
              btn.onclick = () => buyHint(h.id);
              body.appendChild(btn);
            } else {
              body.textContent = T.not_enough_tokens;
            }
          }
          card.appendChild(body);
          hintsEl.appendChild(card);
        });
      }
    }

    function buildRow(g){
      const tr = el('tr');
      tr.appendChild(el('td','cell name-cell', g.name));
      attributes.forEach(a => {
        const r = a.compare(g, state.target) || {status:'wrong'};
        const td = el('td','cell '+r.status);
        const disp = a.display(g);
        td.innerHTML = (a.translate === false ? disp : tv(disp)) +
          (r.arrow ? '<span class="arrow">'+r.arrow+'</span>' : '');
        tr.appendChild(td);
      });
      return tr;
    }

    function save(){
      if (state.practice) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          date: todayStamp(), target: state.target.name,
          guesses: state.guesses, attempts: state.attempts,
          over: state.over, won: state.won,
          hintsBought: Array.from(state.hintsBought)
        }));
      } catch(e){}
    }
    function load(){
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(storageKey)||'null'); } catch(e){}
      if (saved && saved.date === todayStamp()){
        const t = data.find(d => d.name === saved.target);
        if (t){
          state.target = t;
          state.guesses = saved.guesses || [];
          state.attempts = saved.attempts || 0;
          state.over = !!saved.over;
          state.won = !!saved.won;
          state.hintsBought = new Set(saved.hintsBought || []);
          return;
        }
      }
      state.target = data[dailyIndex];
    }
    function newPractice(){
      state.practice = true;
      let i;
      do { i = Math.floor(Math.random()*data.length); }
      while (data.length > 1 && data[i].name === state.target.name);
      state.target = data[i];
      state.guesses = []; state.attempts = 0;
      state.over = false; state.won = false;
      state.hintsBought = new Set();
      inputEl.disabled = false;
      const b = formEl.querySelector('button');
      if (b) b.disabled = false;
      bannerEl.className = 'banner'; bannerEl.innerHTML = '';
      showMsg(''); render();
    }
  }

  global.createGame = createGame;
})(window);
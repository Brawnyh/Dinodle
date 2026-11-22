/* =========================================================
   engine.js V5 — Stats locales (sin cuentas) + Censura + Countdown + Anti-drag
   ========================================================= */
(function (global) {
  'use strict';

  // UI text comes from i18n.js (falls back to the key if it is not loaded).
  function T(k, v) { return global.I18N ? global.I18N.t(k, v) : k; }

  function normalize(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  /* ================= DAY (Europe/Madrid) =================
     The daily puzzle changes at midnight Madrid time for everyone,
     wherever the player is. */
  const DAY_TZ = 'Europe/Madrid';
  function madridParts(date) {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: DAY_TZ, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(date || new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      y: +parts.year, m: +parts.month, d: +parts.day,
      h: +parts.hour, min: +parts.minute, s: +parts.second
    };
  }
  function stampFromDayNumber(n) {
    const d = new Date(n * 86400000);
    return d.getUTCFullYear() + '-' +
      String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(d.getUTCDate()).padStart(2, '0');
  }
  // Days since 1970-01-01 counted on the Madrid calendar.
  function dayNumber() {
    const p = madridParts();
    return Math.floor(Date.UTC(p.y, p.m - 1, p.d) / 86400000);
  }
  function todayStamp() { return stampFromDayNumber(dayNumber()); }
  function yesterdayStamp() { return stampFromDayNumber(dayNumber() - 1); }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  /* ================= STATS LOCALES ================= */
  const STATS_KEY = 'wordle_stats_v5';
  const STAT_MODES = ['dino', 'dinoEasy'];
  function emptyStat() { return { played: 0, won: 0, streak: 0, maxStreak: 0, lastDate: null }; }
  function getStats() {
    let s = null;
    try { s = JSON.parse(safeGet(STATS_KEY) || 'null'); } catch (e) {}
    if (!s || typeof s !== 'object') s = {};
    STAT_MODES.forEach(function (k) { if (!s[k]) s[k] = emptyStat(); });
    return s;
  }
  function saveStats(s) { safeSet(STATS_KEY, JSON.stringify(s)); }

  function recordGame(gameId, won, dateStr) {
    const all = getStats();
    const s = all[gameId];
    if (!s) return;
    if (s.lastDate === dateStr) return; // ya contado hoy
    s.played++;
    if (won) {
      s.won++;
      // A streak only continues if the previous game was yesterday.
      s.streak = (s.lastDate === yesterdayStamp() ? (s.streak || 0) : 0) + 1;
      if (s.streak > (s.maxStreak || 0)) s.maxStreak = s.streak;
    } else { s.streak = 0; }
    s.lastDate = dateStr;
    saveStats(all);
    renderStatsWidget();
  }

  /* ================= HISTORY / SOLVED ================= */
  function getHistory(key) {
    try { return JSON.parse(safeGet(key) || '[]'); } catch (e) { return []; }
  }
  function pushHistory(key, entry) {
    const h = getHistory(key);
    // One entry per daily game, even if the finished game is reopened.
    if (h.some(function (x) { return x.date === entry.date && x.target === entry.target; })) return;
    h.unshift(entry);
    if (h.length > 60) h.length = 60;
    safeSet(key, JSON.stringify(h));
  }
  // Dinosaurs this player has already found or seen revealed. The credits page
  // only shows the silhouettes of these, so it can't be used to cheat.
  const SOLVED_KEY = 'dinodle_solved_v1';
  function markSolved(name) {
    let s = [];
    try { s = JSON.parse(safeGet(SOLVED_KEY) || '[]'); } catch (e) {}
    if (s.indexOf(name) === -1) { s.push(name); safeSet(SOLVED_KEY, JSON.stringify(s)); }
  }
  // Day the result popup last opened by itself, per game ({ dino: 'YYYY-MM-DD', dinoEasy: … }).
  const REVEALED_KEY = 'dinodle_revealed_v1';
  function readJSON(key, fallback) {
    try { const v = JSON.parse(safeGet(key) || 'null'); return v && typeof v === 'object' ? v : fallback; }
    catch (e) { return fallback; }
  }
  // Puzzle #1 is 2026-11-16 (Madrid), the day Dinodle got its own site.
  function puzzleNumber() { return dayNumber() - Math.floor(Date.UTC(2026, 10, 16) / 86400000) + 1; }

  function renderStatsWidget() {
    const w = document.getElementById('stats-widget');
    if (!w) return;
    const all = getStats();
    const d = all.dino, e = all.dinoEasy;
    const total = d.played + e.played;
    const won = d.won + e.won;
    const pct = total ? Math.round((won / total) * 100) : 0;
    w.innerHTML =
      '<button type="button" class="stats-btn" id="stats-btn">' +
        '<span class="stats-line"><b>🦖</b> ' + d.won + '/' + d.played +
        ' <span class="stats-sep">·</span> <b>🦕</b> ' + e.won + '/' + e.played +
        ' <span class="stats-sep">·</span> <b>' + pct + '%</b></span>' +
      '</button>';
    document.getElementById('stats-btn').onclick = openStatsModal;
  }

  function ensureStatsWidget() {
    if (document.getElementById('stats-widget')) { renderStatsWidget(); return; }
    const bar = document.querySelector('.topbar');
    if (!bar) return;
    const w = document.createElement('div');
    w.id = 'stats-widget';
    bar.appendChild(w);
    renderStatsWidget();
  }

  function openStatsModal() {
    let modal = document.getElementById('stats-modal');
    if (!modal) {
      modal = el('div', 'modal-overlay');
      modal.id = 'stats-modal';
      modal.innerHTML =
        '<div class="modal stats-modal">' +
          '<button class="modal-close" type="button" aria-label="' + T('close') + '">×</button>' +
          '<h2 class="stats-title">' + T('stats_title') + '</h2>' +
          '<div class="stats-grid" id="stats-grid"></div>' +
          '<h3 class="history-title">' + T('history_title') + '</h3>' +
          '<div class="history-list" id="history-list"></div>' +
          '<button class="stats-reset" id="stats-reset" type="button">' + T('stats_reset') + '</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
      modal.querySelector('#stats-reset').onclick = () => {
        if (confirm(T('stats_reset_confirm'))) {
          try { localStorage.removeItem(STATS_KEY); if (global.__historyKey) localStorage.removeItem(global.__historyKey); } catch (e) {}
          fillStatsGrid(modal);
          renderStatsWidget();
        }
      };
    }
    fillStatsGrid(modal);
    modal.classList.add('show');
  }

  function fillStatsGrid(modal) {
    const all = getStats();
    const grid = modal.querySelector('#stats-grid');
    grid.innerHTML = '';

    function card(emoji, label, s) {
      const pct = s.played ? Math.round((s.won / s.played) * 100) : 0;
      const wrap = el('div', 'stats-card');
      wrap.innerHTML =
        '<div class="stats-card-head"><span>' + emoji + '</span> ' + label + '</div>' +
        '<div class="stats-card-row"><span>' + T('played') + '</span><b>' + s.played + '</b></div>' +
        '<div class="stats-card-row"><span>' + T('won') + '</span><b>' + s.won + '</b></div>' +
        '<div class="stats-card-row"><span>' + T('win_pct') + '</span><b>' + pct + '%</b></div>' +
        '<div class="stats-card-row"><span>' + T('streak') + '</span><b>' + (s.streak || 0) + '</b></div>' +
        '<div class="stats-card-row"><span>' + T('max_streak') + '</span><b>' + (s.maxStreak || 0) + '</b></div>';
      grid.appendChild(wrap);
    }
    card('🦖', T('mode_normal'), all.dino);
    card('🦕', T('mode_easy'), all.dinoEasy);

    const tp = all.dino.played + all.dinoEasy.played;
    const tw = all.dino.won + all.dinoEasy.won;
    const tpct = tp ? Math.round((tw / tp) * 100) : 0;
    const total = el('div', 'stats-card stats-card-total');
    total.innerHTML =
      '<div class="stats-card-head"><span>🏆</span> ' + T('total') + '</div>' +
      '<div class="stats-card-row"><span>' + T('played') + '</span><b>' + tp + '</b></div>' +
      '<div class="stats-card-row"><span>' + T('won') + '</span><b>' + tw + '</b></div>' +
      '<div class="stats-card-row"><span>' + T('win_pct') + '</span><b>' + tpct + '%</b></div>';
    grid.appendChild(total);

    const hist = modal.querySelector('#history-list');
    const entries = global.__historyKey ? getHistory(global.__historyKey) : [];
    hist.innerHTML = '';
    if (!entries.length) { hist.appendChild(el('div', 'history-empty', T('history_empty'))); return; }
    entries.forEach(function (e) {
      const item = el('div', 'history-item ' + (e.won ? 'history-win' : 'history-lose'));
      const main = el('div', 'history-main');
      main.appendChild(el('b')).textContent = e.target;
      main.appendChild(el('span', 'history-date')).textContent = ' ' + e.date;
      item.appendChild(main);
      item.appendChild(el('div', 'history-meta')).textContent =
        (e.won ? T('won_label') : T('lost_label')) + ' · ' + e.attempts + ' · ' +
        T('score') + ' ' + e.score + ' · 🦴 ' + e.tokensUsed;
      hist.appendChild(item);
    });
  }

  /* ================= WIKI IMAGES ================= */
  /* Wikimedia only serves thumbnails at standard widths; other widths
     (400, 600, 700, 800…) return HTTP 400. Snap to the largest allowed
     width that does not exceed the requested size. */
  const WIKI_WIDTHS = [250, 330, 500, 960];
  function standardWidth(size) {
    let w = WIKI_WIDTHS[0];
    WIKI_WIDTHS.forEach(function (x) { if (x <= size) w = x; });
    return w;
  }
  function upscale(url, size) { return url ? url.replace(/\/(\d+)px-/, '/' + size + 'px-') : url; }

  // Found image URLs are kept between visits so we don't hammer Wikipedia
  // (it rate-limits with HTTP 429).
  const IMG_CACHE_KEY = 'dinodle_img_cache_v1';
  const imgCache = new Map();
  (function loadImgCache() {
    try {
      const o = JSON.parse(safeGet(IMG_CACHE_KEY) || '{}');
      Object.keys(o).forEach(function (k) { imgCache.set(k, o[k]); });
    } catch (e) {}
  })();
  function rememberImage(key, url) {
    imgCache.set(key, url);
    if (!url) return; // only persist hits; misses are retried next visit
    const o = {};
    imgCache.forEach(function (v, k) { if (v) o[k] = v; });
    safeSet(IMG_CACHE_KEY, JSON.stringify(o));
  }
  function isJunk(src) {
    if (!src) return true;
    if (/\.svg(\?|$)/i.test(src)) return true;
    if (/(logo|icon|map|flag|symbol|disambig|question_book|edit-clear)/i.test(src)) return true;
    return false;
  }
  async function tryFetchImage(title, lang, size) {
    if (!title) return null;
    try {
      const safe = encodeURIComponent(title.replace(/ /g, '_'));
      const url = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + safe;
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!r.ok) return null;
      const data = await r.json();
      if (data.type === 'disambiguation') return null;
      const orig = data.originalimage;
      const thumb = data.thumbnail;
      const src = (thumb && thumb.source) || (orig && orig.source);
      if (!src || isJunk(src)) return null;
      const w = standardWidth(size || 500);
      // Never ask for a thumbnail wider than the original file.
      if (orig && orig.source && orig.width && orig.width <= w) return orig.source;
      if (thumb && thumb.source) return upscale(thumb.source, w);
      return src;
    } catch (e) { return null; }
  }
  async function fetchWikiImage(item, lang, size) {
    const key = item.name + '|' + lang + '|' + standardWidth(size || 500);
    if (imgCache.has(key)) return imgCache.get(key);
    const cands = [];
    if (item.wikiName) cands.push(item.wikiName);
    if (item.name) cands.push(item.name);
    if (item.name && item.name.indexOf(' ') !== -1) cands.push(item.name.split(' ')[0]);
    if (item.realName && item.realName !== 'Desconocido') {
      const real = item.realName.split('/')[0].trim();
      if (real) cands.push(real);
    }
    if (item.aliases) item.aliases.forEach(a => cands.push(a));
    const seen = new Set();
    const list = cands.filter(c => { const k = (c||'').toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; });
    for (let i = 0; i < list.length; i++) {
      const s = await tryFetchImage(list[i], lang, size);
      if (s) { rememberImage(key, s); return s; }
    }
    if (lang !== 'en') {
      for (let i = 0; i < list.length; i++) {
        const s = await tryFetchImage(list[i], 'en', size);
        if (s) { rememberImage(key, s); return s; }
      }
    }
    rememberImage(key, null);
    return null;
  }

  /* ================= ANTI-DRAG ================= */
  function lockImage(img) {
    img.draggable = false;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ================= CENSOR ================= */
  function censorNames(text, item) {
    if (!text) return text;
    const targets = [];
    if (item.name) targets.push(item.name);
    if (item.wikiName) targets.push(item.wikiName);
    if (item.name && item.name.indexOf(' ') !== -1) targets.push(item.name.split(' ')[0]);
    if (item.aliases) item.aliases.forEach(a => targets.push(a));
    if (item.realName && item.realName !== 'Desconocido') {
      item.realName.split('/').forEach(p => { const t = p.trim(); if (t) targets.push(t); });
    }
    const unique = Array.from(new Set(targets)).filter(n => n && n.length >= 3);
    unique.sort((a, b) => b.length - a.length);
    let out = text;
    unique.forEach(n => {
      const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Whole words only, so short names don't cut into ordinary words.
      const re = new RegExp('(?<![\\p{L}\\p{N}])' + esc + '(?![\\p{L}\\p{N}])', 'giu');
      out = out.replace(re, m => '─'.repeat(Math.min(m.length, 10)));
    });
    return out;
  }

  /* ================= COUNTDOWN ================= */
  function startCountdown(node) {
    const startDay = dayNumber();
    function tick() {
      // A new puzzle is out: reload so the player gets it.
      if (dayNumber() !== startDay) { location.reload(); return; }
      const p = madridParts();
      const left = Math.max(0, 86400 - (p.h * 3600 + p.min * 60 + p.s));
      const h = Math.floor(left / 3600);
      const m = Math.floor((left % 3600) / 60);
      const s = left % 60;
      node.innerHTML = T('next_in') + ' <b>' +
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0') + '</b>';
    }
    tick();
    return setInterval(tick, 1000);
  }

  /* ================= CREATE GAME ================= */
  function createGame(cfg) {
    const data        = cfg.data;
    const attributes  = cfg.attributes;
    const hints       = cfg.hints || [];
    const maxAttempts = cfg.maxAttempts || 12;
    const storageKey  = cfg.storageKey || 'game';
    const gameId      = cfg.gameId || 'dino';
    const wikiLang    = cfg.wikiLang || 'es';
    const wikiUrlFor  = cfg.wikiUrlFor || (item =>
      'https://' + wikiLang + '.wikipedia.org/wiki/' +
      encodeURIComponent((item.wikiName || item.name).replace(/ /g, '_')));

    const searchList = [];
    const byKey = new Map();
    data.forEach(function (item, i) {
      const keys = [item.name].concat(item.aliases || []);
      keys.forEach(function (k) {
        const n = normalize(k);
        if (!n) return;
        if (!byKey.has(n)) byKey.set(n, i);
        if (k === item.name) searchList.push({ display: item.name, item });
        else searchList.push({ display: k + ' — ' + item.name, item });
      });
      const genus = normalize(item.name).split(' ')[0];
      if (genus && !byKey.has(genus)) byKey.set(genus, i);
    });
    function findItem(raw) {
      const n = normalize(raw);
      if (!n) return null;
      if (byKey.has(n)) return data[byKey.get(n)];
      const found = new Set();
      byKey.forEach(function (i, k) {
        if (k.indexOf(n) === 0 || n.indexOf(k) === 0) found.add(i);
      });
      if (found.size === 1) return data[Array.from(found)[0]];
      return null;
    }

    // Token system: a token is earned at each attempt listed in tokensAt; each
    // clue costs one token. A clue with `requires` can only be bought after
    // those clues (the silhouette is the last clue).
    const tokensAt = (cfg.tokens && cfg.tokens.at) || [3, 6, 9];
    const scoring = Object.assign({ base: 1000, attemptPenalty: 100, attemptInterval: 3, tokenPenalty: 150 }, cfg.scoring || {});
    const historyKey = cfg.historyKey || (storageKey + '-history');
    global.__historyKey = historyKey;

    const state = {
      target: null, guesses: [], attempts: 0,
      over: false, won: false, hintsBought: new Set(), practice: false
    };
    const dailyIndex = dayNumber() % data.length;

    let inputEl, formEl, msgEl, boardBody, counterEl, scoreEl, tokensEl, hintsEl, bannerEl, challengeEl,
        countdownEl, practiceEl, acListEl, acTimer;

    function tokensEarned() { return tokensAt.filter(function (t) { return state.attempts >= t; }).length; }
    function tokensAvailable() { return Math.max(0, tokensEarned() - state.hintsBought.size); }
    function nextTokenAt() { return tokensAt.find(function (t) { return state.attempts < t; }); }
    function computeScore() {
      if (state.over && !state.won) return 0;
      const s = scoring.base
        - Math.floor(state.attempts / scoring.attemptInterval) * scoring.attemptPenalty
        - state.hintsBought.size * scoring.tokenPenalty;
      return Math.max(0, s);
    }

    build();
    ensureStatsWidget();
    load();
    // Streamer mode starts on a random dinosaur, so a finished daily never shows on stream.
    if (cfg.startPractice) newPractice();
    else {
      render();
      if (state.over) finish();
    }

    function build() {
      const root = document.getElementById('game');
      root.innerHTML = '';

      const head = el('div', 'game-head');
      head.appendChild(el('div', 'counter', T('attempt_html', { max: maxAttempts })));
      scoreEl = el('div', 'score-display');
      head.appendChild(scoreEl);
      tokensEl = el('div', 'tokens-display');
      head.appendChild(tokensEl);
      const cd = el('div', 'next-puzzle');
      head.appendChild(cd);
      countdownEl = cd;
      // Shown instead of the countdown during a practice game.
      practiceEl = el('div', 'practice-badge');
      practiceEl.hidden = true;
      practiceEl.appendChild(el('span', null, T('practice_badge')));
      const back = el('button', 'back-daily', T('back_daily'));
      back.type = 'button';
      back.addEventListener('click', backToDaily);
      practiceEl.appendChild(back);
      head.appendChild(practiceEl);
      root.appendChild(head);
      startCountdown(cd);

      // A friend's challenge link (?vs=<tries, 0 = lost>&p=<puzzle #>), only for today's puzzle.
      const vs = readChallenge();
      if (vs) {
        challengeEl = el('div', 'challenge-banner', vs.won ? T('vs_banner_win', { n: vs.n }) : T('vs_banner_lose'));
        root.appendChild(challengeEl);
      }

      if (hints.length) {
        hintsEl = el('div', 'hints');
        root.appendChild(hintsEl);
      }

      formEl = el('form', 'guess-form');
      const acWrap = el('div', 'autocomplete-wrap');
      inputEl = el('input');
      inputEl.type = 'text';
      inputEl.placeholder = cfg.placeholder || '';
      inputEl.autocomplete = 'off';
      inputEl.autocapitalize = 'off';
      inputEl.spellcheck = false;
      acListEl = el('ul', 'autocomplete-list');
      acWrap.appendChild(inputEl);
      acWrap.appendChild(acListEl);
      formEl.appendChild(acWrap);
      const btn = el('button', null, T('guess'));
      btn.type = 'submit';
      formEl.appendChild(btn);
      root.appendChild(formEl);

      msgEl = el('div', 'msg');
      root.appendChild(msgEl);

      const wrap = el('div', 'table-wrap');
      const table = el('table', 'board');
      const thead = el('thead');
      const trh = el('tr');
      trh.appendChild(el('th', 'col-name', T('col_name')));
      attributes.forEach(function (a) {
        const th = el('th');
        if (a.shortLabel && a.shortLabel !== a.label) {
          th.appendChild(el('span', 'v-full', a.label));
          th.appendChild(el('span', 'v-short', a.shortLabel));
        } else th.textContent = a.label;
        // Optional explanation (e.g. the order of the periods): hover, or tap on phones.
        if (a.info) {
          th.className = 'has-info';
          th.title = a.info;
          th.tabIndex = 0;
          th.appendChild(el('span', 'info-mark', 'ⓘ'));
          const show = function () { showMsg(a.info, 'info'); };
          th.addEventListener('click', show);
          th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
        }
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);
      boardBody = el('tbody');
      table.appendChild(boardBody);
      wrap.appendChild(table);
      root.appendChild(wrap);

      bannerEl = el('div', 'banner');
      root.appendChild(bannerEl);

      const p = el('button', 'practice', T('practice'));
      p.type = 'button';
      p.addEventListener('click', newPractice);
      root.appendChild(p);

      counterEl = head.querySelector('#attempts');
      formEl.addEventListener('submit', onSubmit);
      inputEl.addEventListener('input', onInput);
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAutocomplete();
      });
      document.addEventListener('click', function (e) {
        if (!acWrap.contains(e.target)) closeAutocomplete();
      });

      const modal = el('div', 'modal-overlay');
      modal.id = 'reveal-modal';
      modal.innerHTML =
        '<div class="modal">' +
          '<button class="modal-close" type="button" aria-label="' + T('close') + '">×</button>' +
          '<div class="modal-img-wrap"><div class="modal-img-spinner">' + T('loading_img') + '</div></div>' +
          '<h2 class="modal-title"></h2>' +
          '<p class="modal-desc"></p>' +
          '<a class="modal-link" target="_blank" rel="noopener">' + T('view_wiki') + '</a>' +
        '</div>';
      // On the page itself, so effects on the game area never move or hide it.
      document.body.appendChild(modal);
      modal.querySelector('.modal-close').addEventListener('click', function () {
        modal.classList.remove('show');
      });
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('show');
      });
      // Escape closes any open popup (result, stats).
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal-overlay.show').forEach(function (m) { m.classList.remove('show'); });
      });
    }

    function onInput() {
      clearTimeout(acTimer);
      const q = normalize(inputEl.value);
      if (!q || q.length < 2) { closeAutocomplete(); return; }
      acTimer = setTimeout(function () { renderSuggestions(q); }, 120);
    }
    function renderSuggestions(q) {
      const seen = new Set();
      const matches = [];
      for (const s of searchList) {
        if (matches.length >= 8) break;
        const dn = normalize(s.display);
        if (dn.indexOf(q) !== -1 && !seen.has(s.item.name)) {
          seen.add(s.item.name); matches.push(s);
        }
      }
      if (!matches.length) { closeAutocomplete(); return; }
      acListEl.innerHTML = '';
      matches.forEach(function (m) {
        const li = el('li', null, m.display);
        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          inputEl.value = m.item.name;
          closeAutocomplete();
          inputEl.focus();
        });
        acListEl.appendChild(li);
      });
      acListEl.classList.add('show');
    }
    function closeAutocomplete() {
      acListEl.classList.remove('show');
      acListEl.innerHTML = '';
    }

    function onSubmit(e) {
      e.preventDefault();
      closeAutocomplete();
      submitGuess(inputEl.value.trim());
    }
    // Returns 'over' | 'empty' | 'unknown' | 'repeat' | 'ok'.
    function submitGuess(raw) {
      if (state.over) return 'over';
      if (!raw) return 'empty';
      const item = findItem(raw);
      if (!item) {
        showMsg(T('not_in_list', { raw: raw }), 'bad');
        inputEl.classList.add('shake');
        setTimeout(function () { inputEl.classList.remove('shake'); }, 400);
        return 'unknown';
      }
      if (state.guesses.indexOf(item.name) !== -1) {
        showMsg(T('already', { name: item.name }), 'bad');
        return 'repeat';
      }
      state.guesses.push(item.name);
      state.attempts++;
      inputEl.value = '';
      showMsg('');
      if (item.name === state.target.name) { state.over = true; state.won = true; }
      else if (state.attempts >= maxAttempts) { state.over = true; }
      if (!state.over && tokensAt.indexOf(state.attempts) !== -1) showMsg(T('token_earned'), 'good');
      render();
      save();
      if (state.over) {
        finish();
        global.dispatchEvent(new Event(state.won ? 'dinodle:win' : 'dinodle:lose'));
      }
      return 'ok';
    }

    function buyHint(h) {
      if (state.over || state.hintsBought.has(h.id) || !tokensAvailable()) return;
      if (h.requires && !h.requires.every(function (r) { return state.hintsBought.has(r); })) return;
      state.hintsBought.add(h.id);
      save();
      render();
    }

    function finish() {
      const score = computeScore();
      bannerEl.className = 'banner show ' + (state.won ? 'win' : 'lose');
      bannerEl.innerHTML = (state.won
        ? T('win', { name: state.target.name, n: state.attempts })
        : T('lose', { name: state.target.name, max: maxAttempts })) +
        ' ' + T('final_score', { score: score });
      if (!state.practice) {
        const share = el('button', 'share-btn', T('share'));
        share.type = 'button';
        share.addEventListener('click', shareResult);
        bannerEl.appendChild(share);
        const ch = el('button', 'share-btn', T('challenge'));
        ch.type = 'button';
        ch.addEventListener('click', challengeFriend);
        bannerEl.appendChild(ch);
        const im = el('button', 'share-btn share-img', T('save_image'));
        im.type = 'button';
        im.addEventListener('click', shareImage);
        bannerEl.appendChild(im);
        // Result against the friend who sent the challenge link.
        const vs = readChallenge();
        if (vs) {
          if (challengeEl) challengeEl.style.display = 'none';
          const you = state.won ? state.attempts : null, them = vs.won ? vs.n : null;
          const key = you === them ? 'vs_tie' : you === null ? 'vs_you_lose' : them === null ? 'vs_you_win' : you < them ? 'vs_you_win' : 'vs_you_lose';
          bannerEl.appendChild(el('div', 'vs-result', T(key, { you: you === null ? 'X' : you, them: them === null ? 'X' : them })));
        }
      }
      // Share on social networks (result text only, never the answer).
      if (!state.practice) {
        const text = shareText();
        const url = cfg.shareUrl || location.origin + location.pathname;
        const enc = encodeURIComponent;
        const nets = [
          ['X', 'https://twitter.com/intent/tweet?text=' + enc(text)],
          ['Bluesky', 'https://bsky.app/intent/compose?text=' + enc(text)],
          ['Reddit', 'https://www.reddit.com/submit?url=' + enc(url) + '&title=' + enc(text.split('\n')[0])],
          ['WhatsApp', 'https://wa.me/?text=' + enc(text)],
          ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)]
        ];
        const row = el('div', 'share-row');
        nets.forEach(function (n) {
          const a = el('a', 'share-net', n[0]);
          a.href = n[1]; a.target = '_blank'; a.rel = 'noopener';
          row.appendChild(a);
        });
        bannerEl.appendChild(row);
      }
      // Donation links after the game (never before playing).
      const support = global.SITE && global.SITE.supportLinks ? global.SITE.supportLinks() : [];
      if (support.length) {
        const row = el('div', 'support-row', T('support') + ' ');
        support.forEach(function (s) {
          const a = el('a', 'support-btn', s.label);
          a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
          row.appendChild(a);
        });
        bannerEl.appendChild(row);
      }
      inputEl.disabled = true;
      const b = formEl.querySelector('button');
      if (b) b.disabled = true;
      if (!state.practice) {
        recordGame(gameId, state.won, todayStamp());
        pushHistory(historyKey, {
          date: todayStamp(), target: state.target.name, won: state.won,
          attempts: state.attempts, score: score, tokensUsed: state.hintsBought.size
        });
        markSolved(state.target.name);
      }
      render();
      // The answer's name in the banner reopens the popup.
      const nameEl = bannerEl.querySelector('b');
      if (nameEl) {
        nameEl.className = 'reveal-again';
        nameEl.addEventListener('click', function () { showRevealModal(state.target, state.won); });
      }
      // The popup opens by itself once per daily puzzle (not on every reload); always after practice.
      const seen = readJSON(REVEALED_KEY, {});
      if (state.practice || seen[gameId] !== todayStamp()) {
        showRevealModal(state.target, state.won);
        if (!state.practice) { seen[gameId] = todayStamp(); safeSet(REVEALED_KEY, JSON.stringify(seen)); }
      }
    }

    // Wordle-style result: one emoji row per guess, no names (no spoilers).
    function statusRows() {
      return state.guesses.map(function (name) {
        const g = data.find(function (d) { return d.name === name; });
        return attributes.map(function (a) { return (a.compare(g, state.target) || {}).status || 'wrong'; });
      });
    }
    function shareText() {
      const icon = { correct: '🟩', close: '🟨', wrong: '⬛' };
      const rows = statusRows().map(function (r) {
        return r.map(function (s) { return icon[s] || '⬛'; }).join('');
      });
      return (cfg.shareTitle || 'Dinodle') + ' #' + puzzleNumber() +
        ' ' + (state.won ? state.attempts + '/' + maxAttempts : 'X/' + maxAttempts) +
        ' · ' + computeScore() + ' ' + T('pts') + (state.hintsBought.size ? ' · 🦴×' + state.hintsBought.size : '') +
        '\n' + rows.join('\n') + '\n' + (cfg.shareUrl || location.origin + location.pathname);
    }
    function shareResult() { shareOrCopy(shareText()); }

    function readChallenge() {
      const q = new URLSearchParams(location.search);
      const vs = q.get('vs');
      if (vs == null || parseInt(q.get('p'), 10) !== puzzleNumber()) return null;
      const n = parseInt(vs, 10);
      if (!(n >= 0 && n <= maxAttempts)) return null;
      return { won: n > 0, n: n };
    }
    function challengeUrl() {
      const base = cfg.shareUrl || location.origin + location.pathname;
      const sep = base.indexOf('?') !== -1 ? '&' : /\/$/.test(base) ? '?' : '/?';
      return base + sep + 'vs=' + (state.won ? state.attempts : 0) + '&p=' + puzzleNumber();
    }
    function challengeFriend() {
      shareOrCopy((state.won ? T('challenge_text_win', { n: state.attempts }) : T('challenge_text_lose')) + '\n' + challengeUrl());
    }

    // Square result card drawn on a canvas (no emoji, so it renders the same everywhere).
    function resultCanvas() {
      const S = 1080, c = document.createElement('canvas');
      c.width = S; c.height = S;
      const x = c.getContext('2d');
      const bg = x.createLinearGradient(0, 0, 0, S);
      bg.addColorStop(0, '#10301a');
      bg.addColorStop(1, state.won ? '#1f5a2a' : '#5a2414');
      x.fillStyle = bg; x.fillRect(0, 0, S, S);
      const font = function (px) { return px + 'px "Lilita One", Impact, "Arial Black", sans-serif'; };
      x.textAlign = 'center';
      x.fillStyle = '#f4ecd0'; x.font = font(92);
      x.fillText((cfg.shareTitle || 'Dinodle') + ' #' + puzzleNumber(), S / 2, 140);
      x.fillStyle = state.won ? '#9be28b' : '#ff9a7a'; x.font = font(58);
      x.fillText((state.won ? state.attempts : 'X') + '/' + maxAttempts + '  ·  ' + computeScore() + ' ' + T('pts'), S / 2, 225);
      const rows = statusRows(), cols = attributes.length;
      const top = 280, avail = S - top - 150;
      const cell = Math.min(100, Math.floor(avail / (rows.length * 1.18)), Math.floor(820 / (cols * 1.18)));
      const gap = Math.round(cell * 0.18);
      const left = (S - (cols * cell + (cols - 1) * gap)) / 2;
      const y0 = top + (avail - (rows.length * cell + (rows.length - 1) * gap)) / 2;
      const color = { correct: '#3fb950', close: '#e3b341', wrong: '#3a3f47' };
      rows.forEach(function (r, i) {
        r.forEach(function (s, j) {
          const px = left + j * (cell + gap), py = y0 + i * (cell + gap), rad = cell * 0.18;
          x.fillStyle = color[s] || color.wrong;
          x.beginPath();
          x.moveTo(px + rad, py); x.arcTo(px + cell, py, px + cell, py + cell, rad);
          x.arcTo(px + cell, py + cell, px, py + cell, rad); x.arcTo(px, py + cell, px, py, rad);
          x.arcTo(px, py, px + cell, py, rad); x.closePath(); x.fill();
        });
      });
      x.fillStyle = '#c7f08a'; x.font = font(52);
      x.fillText('dinodle.app', S / 2, S - 60);
      return c;
    }
    function shareImage() {
      const ready = document.fonts && document.fonts.load
        ? document.fonts.load('58px "Lilita One"').catch(function () {}) : Promise.resolve();
      ready.then(function () {
        resultCanvas().toBlob(function (blob) {
          if (!blob) return;
          const name = 'dinodle-' + puzzleNumber() + '.png';
          let file = null;
          try { file = new File([blob], name, { type: 'image/png' }); } catch (e) {}
          if (file && navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android/i.test(navigator.userAgent)) {
            navigator.share({ files: [file], text: shareText() }).catch(function () {});
            return;
          }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          showMsg(T('image_saved'), 'good');
        }, 'image/png');
      });
    }

    function shareOrCopy(text) {
      const done = function () { showMsg(T('copied'), 'good'); };
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        navigator.share({ text: text }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done, function () { prompt(T('copy_this'), text); });
      } else {
        prompt(T('copy_this'), text);
      }
    }

    function showRevealModal(item, won) {
      const modal = document.getElementById('reveal-modal');
      const imgWrap = modal.querySelector('.modal-img-wrap');
      const title = modal.querySelector('.modal-title');
      const desc = modal.querySelector('.modal-desc');
      const link = modal.querySelector('.modal-link');
      imgWrap.innerHTML = '<div class="modal-img-spinner">' + T('loading_img') + '</div>';
      title.textContent = (won ? '🎉 ' : '💀 ') + item.name;
      desc.textContent = item.description || item.realName || '';
      link.href = wikiUrlFor(item);
      link.textContent = T('view_wiki');
      modal.classList.add('show');

      const manual = item.silhouetteUrl || item.imageUrl;
      if (manual) { renderModalImage(imgWrap, manual, item); return; }
      fetchWikiImage(item, wikiLang, 500).then(function (url) {
        if (url) renderModalImage(imgWrap, url, item);
        else imgWrap.innerHTML = '<div class="modal-emoji">' + (item.emoji || '🖼️') + '</div>';
      });
    }
    function renderModalImage(wrap, src, item) {
      wrap.innerHTML = '<div class="modal-img-spinner">' + T('loading_img') + '</div>';
      const img = document.createElement('img');
      img.className = 'modal-img';
      img.alt = item.name;
      lockImage(img);
      img.onload = function () { wrap.innerHTML = ''; wrap.appendChild(img); img.style.opacity = '1'; };
      img.onerror = function () { wrap.innerHTML = '<div class="modal-emoji">' + (item.emoji || '🖼️') + '</div>'; };
      img.src = src;
    }

    function showMsg(text, kind) {
      msgEl.textContent = text;
      msgEl.className = 'msg' + (kind ? ' ' + kind : '');
    }

    function render() {
      if (!state.target) return;
      counterEl.textContent = state.attempts;
      practiceEl.hidden = !state.practice;
      countdownEl.hidden = state.practice;
      // Lets the theme react to progress (the jungle turns volcanic).
      global.dispatchEvent(new CustomEvent('dinodle:progress', {
        detail: { attempts: state.attempts, max: maxAttempts, over: state.over, won: state.won }
      }));
      scoreEl.innerHTML = T('score') + ' <b>' + computeScore() + '</b>';
      const avail = tokensAvailable();
      tokensEl.innerHTML = '🦴 <b>' + avail + '</b>' +
        (nextTokenAt() && !state.over ? ' <span class="muted">· ' + T('next_token', { n: nextTokenAt() }) + '</span>' : '');

      boardBody.innerHTML = '';
      state.guesses.slice().reverse().forEach(function (name, i) {
        const g = data.find(function (d) { return d.name === name; });
        if (g) {
          const row = buildRow(g);
          if (i === 0) row.classList.add('row-new');
          boardBody.appendChild(row);
        }
      });

      if (hintsEl) {
        hintsEl.innerHTML = '';
        hints.forEach(function (h) {
          const unlocked = state.hintsBought.has(h.id);
          const ready = !h.requires || h.requires.every(function (r) { return state.hintsBought.has(r); });
          const card = el('div', 'hint ' + (unlocked ? 'unlocked' : 'locked') + (h.last ? ' hint-last' : ''));
          card.appendChild(el('div', 'hint-label', (unlocked ? '💡 ' : (ready ? '🦴 ' : '🔒 ')) + h.label));
          const body = el('div', 'hint-body');

          if (!unlocked) {
            if (state.over) {
              body.textContent = '—';
            } else if (!ready) {
              body.textContent = T('hint_requires');
            } else if (avail > 0) {
              const btn = el('button', 'hint-buy', T('buy_hint'));
              btn.type = 'button';
              btn.addEventListener('click', function () { buyHint(h); });
              body.appendChild(btn);
            } else {
              body.textContent = nextTokenAt() ? T('next_token', { n: nextTokenAt() }) : T('no_tokens');
            }
          } else {
            const out = h.render(state.target);
            if (typeof out === 'string') {
              body.innerHTML = censorNames(out, state.target);
            } else if (out && (out.imageName || out.imageSrc)) {
              body.innerHTML = censorNames(out.html || '', state.target);
              const wrap = el('div', 'silhouette-wrap');
              wrap.appendChild(el('div', 'silhouette', state.target.emoji || '🦖'));
              body.appendChild(wrap);
              if (out.imageSrc) {
                loadSilhouette(wrap, out.imageSrc, true);
              } else {
                fetchWikiImage(state.target, out.imageLang || wikiLang, 330).then(function (url) {
                  if (url) loadSilhouette(wrap, url, false);
                });
              }
            }
          }
          card.appendChild(body);
          hintsEl.appendChild(card);
        });
      }
    }

    function loadSilhouette(wrap, src, isReal) {
      const img = document.createElement('img');
      img.className = 'silhouette-img' + (isReal ? ' is-real' : ' is-photo');
      img.alt = T('silhouette_alt');
      lockImage(img);
      img.onload = function () { wrap.innerHTML = ''; wrap.appendChild(img); };
      img.onerror = function () {};
      img.src = src;
    }

    function buildRow(g) {
      const tr = el('tr');
      tr.appendChild(el('td', 'cell name-cell', g.name));
      attributes.forEach(function (a) {
        const r = a.compare(g, state.target) || { status: 'wrong' };
        const td = el('td', 'cell ' + r.status);
        // Optional short form for the compact phone layout (e.g. "8 t" for 8,000 kg).
        const value = a.short
          ? '<span class="v-full">' + a.display(g) + '</span><span class="v-short">' + a.short(g) + '</span>'
          : a.display(g);
        td.innerHTML = value + (r.arrow ? '<span class="arrow">' + r.arrow + '</span>' : '');
        tr.appendChild(td);
      });
      return tr;
    }

    function save() {
      if (state.practice) return;
      safeSet(storageKey, JSON.stringify({
        date: todayStamp(), target: state.target.name,
        guesses: state.guesses, attempts: state.attempts,
        over: state.over, won: state.won, hintsBought: Array.from(state.hintsBought)
      }));
    }
    function load() {
      let saved = null;
      try { saved = JSON.parse(safeGet(storageKey) || 'null'); } catch (e) {}
      if (saved && saved.date === todayStamp()) {
        const t = data.find(function (d) { return d.name === saved.target; });
        if (t) {
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
    function resetBoard() {
      state.guesses = []; state.attempts = 0;
      state.over = false; state.won = false; state.hintsBought = new Set();
      inputEl.disabled = false;
      const b = formEl.querySelector('button');
      if (b) b.disabled = false;
      bannerEl.className = 'banner'; bannerEl.innerHTML = '';
      document.body.classList.remove('extinct');
      showMsg('');
    }
    function newPractice() {
      state.practice = true;
      let i;
      do { i = Math.floor(Math.random() * data.length); }
      while (data.length > 1 && data[i].name === state.target.name);
      state.target = data[i];
      resetBoard();
      render();
      global.dispatchEvent(new Event('dinodle:newgame'));
    }
    // Leaves practice and reloads today's puzzle as saved.
    function backToDaily() {
      state.practice = false;
      resetBoard();
      load();
      render();
      if (state.over) finish();
      global.dispatchEvent(new Event('dinodle:newgame'));
    }

    // Small API for streamer.js (chat voting).
    global.DinodleGame = {
      guess: submitGuess,
      find: findItem,
      newPractice: newPractice,
      daily: backToDaily,
      puzzleNumber: puzzleNumber,
      isOver: function () { return state.over; },
      isPractice: function () { return state.practice; },
      guessed: function (name) { return state.guesses.indexOf(name) !== -1; }
    };
    global.dispatchEvent(new Event('dinodle:ready'));
  }

  global.createGame = createGame;
})(window);
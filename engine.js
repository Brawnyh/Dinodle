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
          '<button class="stats-reset" id="stats-reset" type="button">' + T('stats_reset') + '</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
      modal.querySelector('#stats-reset').onclick = () => {
        if (confirm(T('stats_reset_confirm'))) {
          try { localStorage.removeItem(STATS_KEY); } catch (e) {}
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
    const maxAttempts = cfg.maxAttempts || 20;
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

    const state = {
      target: null, guesses: [], attempts: 0,
      over: false, won: false, unlocked: {}, practice: false
    };
    const dailyIndex = dayNumber() % data.length;

    let inputEl, formEl, msgEl, boardBody, counterEl, hintsEl, bannerEl,
        acListEl, acTimer;

    build();
    ensureStatsWidget();
    load();
    render();
    if (state.over) finish();

    function build() {
      const root = document.getElementById('game');
      root.innerHTML = '';

      const head = el('div', 'game-head');
      head.appendChild(el('div', 'counter', T('attempt_html', { max: maxAttempts })));
      const cd = el('div', 'next-puzzle');
      head.appendChild(cd);
      root.appendChild(head);
      startCountdown(cd);

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
      attributes.forEach(function (a) { trh.appendChild(el('th', null, a.label)); });
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
      root.appendChild(modal);
      modal.querySelector('.modal-close').addEventListener('click', function () {
        modal.classList.remove('show');
      });
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('show');
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
      if (state.over) return;
      closeAutocomplete();
      const raw = inputEl.value.trim();
      if (!raw) return;
      const item = findItem(raw);
      if (!item) {
        showMsg(T('not_in_list', { raw: raw }), 'bad');
        inputEl.classList.add('shake');
        setTimeout(function () { inputEl.classList.remove('shake'); }, 400);
        return;
      }
      if (state.guesses.indexOf(item.name) !== -1) {
        showMsg(T('already', { name: item.name }), 'bad');
        return;
      }
      state.guesses.push(item.name);
      state.attempts++;
      inputEl.value = '';
      showMsg('');
      if (item.name === state.target.name) { state.over = true; state.won = true; }
      else if (state.attempts >= maxAttempts) { state.over = true; }
      hints.forEach(function (h) { if (state.attempts >= h.at) state.unlocked[h.id] = true; });
      render();
      save();
      if (state.over) finish();
    }

    function finish() {
      bannerEl.className = 'banner show ' + (state.won ? 'win' : 'lose');
      bannerEl.innerHTML = state.won
        ? T('win', { name: state.target.name, n: state.attempts })
        : T('lose', { name: state.target.name, max: maxAttempts });
      inputEl.disabled = true;
      const b = formEl.querySelector('button');
      if (b) b.disabled = true;
      if (!state.practice) recordGame(gameId, state.won, todayStamp());
      showRevealModal(state.target, state.won);
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

      boardBody.innerHTML = '';
      state.guesses.forEach(function (name) {
        const g = data.find(function (d) { return d.name === name; });
        if (g) boardBody.appendChild(buildRow(g));
      });

      if (hintsEl) {
        hintsEl.innerHTML = '';
        hints.forEach(function (h) {
          const unlocked = !!state.unlocked[h.id];
          const card = el('div', 'hint ' + (unlocked ? 'unlocked' : 'locked'));
          card.appendChild(el('div', 'hint-label', (unlocked ? '💡 ' : '🔒 ') + h.label));
          const body = el('div', 'hint-body');

          if (unlocked) {
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
          } else {
            body.textContent = T('unlock_at', { n: h.at });
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
        td.innerHTML = a.display(g) + (r.arrow ? '<span class="arrow">' + r.arrow + '</span>' : '');
        tr.appendChild(td);
      });
      return tr;
    }

    function save() {
      if (state.practice) return;
      safeSet(storageKey, JSON.stringify({
        date: todayStamp(), target: state.target.name,
        guesses: state.guesses, attempts: state.attempts,
        over: state.over, won: state.won, unlocked: state.unlocked
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
          state.unlocked = saved.unlocked || {};
          return;
        }
      }
      state.target = data[dailyIndex];
    }
    function newPractice() {
      state.practice = true;
      let i;
      do { i = Math.floor(Math.random() * data.length); }
      while (data.length > 1 && data[i].name === state.target.name);
      state.target = data[i];
      state.guesses = []; state.attempts = 0;
      state.over = false; state.won = false; state.unlocked = {};
      inputEl.disabled = false;
      const b = formEl.querySelector('button');
      if (b) b.disabled = false;
      bannerEl.className = 'banner'; bannerEl.innerHTML = '';
      showMsg(''); render();
    }
  }

  global.createGame = createGame;
})(window);
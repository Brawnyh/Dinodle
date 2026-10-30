/* =========================================================
   engine.js V2 — Autocomplete + Modal + Wikipedia
   ========================================================= */
(function (global) {
  'use strict';

  /* ---------- utilidades ---------- */
  function normalize(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function todayStamp() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /* ---------- fetch imagen de Wikipedia (CORS OK) ---------- */
  const imgCache = new Map();
  async function fetchWikiImage(name, lang) {
    if (imgCache.has(name + '|' + lang)) return imgCache.get(name + '|' + lang);
    const titles = [name, name.split(' ')[0]];
    for (const title of titles) {
      try {
        const url = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
        const r = await fetch(url);
        const data = await r.json();
        const pages = (data.query && data.query.pages) || {};
        for (const id in pages) {
          if (pages[id].thumbnail && pages[id].thumbnail.source) {
            const src = pages[id].thumbnail.source;
            imgCache.set(name + '|' + lang, src);
            return src;
          }
        }
      } catch (e) { /* sigue */ }
    }
    imgCache.set(name + '|' + lang, null);
    return null;
  }

  /* ---------- fábrica del juego ---------- */
  function createGame(cfg) {
    const data        = cfg.data;
    const attributes  = cfg.attributes;
    const hints       = cfg.hints || [];
    const maxAttempts = cfg.maxAttempts || 20;
    const storageKey  = cfg.storageKey || 'game';
    const wikiLang    = cfg.wikiLang || 'es';
    const wikiUrlFor  = cfg.wikiUrlFor || (item =>
      `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(item.name.replace(/ /g, '_'))}`);

    /* índice de búsqueda con lista plana para autocompletar */
    const searchList = [];     // [{ display, item }]
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

    /* estado */
    const state = {
      target: null, guesses: [], attempts: 0,
      over: false, won: false, unlocked: {}, practice: false
    };
    const dailyIndex = Math.floor(Date.now() / 86400000) % data.length;

    let inputEl, formEl, msgEl, boardBody, counterEl, hintsEl, bannerEl,
        acListEl, acTimer;

    build();
    load();
    render();
    if (state.over) finish();

    /* ================= DOM ================= */
    function build() {
      const root = document.getElementById('game');
      root.innerHTML = '';

      const head = el('div', 'game-head');
      head.appendChild(el('div', 'counter', 'Intento <b id="attempts">0</b> de ' + maxAttempts));
      root.appendChild(head);

      if (hints.length) {
        hintsEl = el('div', 'hints');
        root.appendChild(hintsEl);
      }

      formEl = el('form', 'guess-form');
      const acWrap = el('div', 'autocomplete-wrap');
      inputEl = el('input');
      inputEl.type = 'text';
      inputEl.placeholder = cfg.placeholder || 'Escribe un nombre...';
      inputEl.autocomplete = 'off';
      inputEl.autocapitalize = 'off';
      inputEl.spellcheck = false;
      acListEl = el('ul', 'autocomplete-list');
      acWrap.appendChild(inputEl);
      acWrap.appendChild(acListEl);
      formEl.appendChild(acWrap);
      const btn = el('button', null, 'Probar');
      btn.type = 'submit';
      formEl.appendChild(btn);
      root.appendChild(formEl);

      msgEl = el('div', 'msg');
      root.appendChild(msgEl);

      const wrap = el('div', 'table-wrap');
      const table = el('table', 'board');
      const thead = el('thead');
      const trh = el('tr');
      trh.appendChild(el('th', 'col-name', 'Nombre'));
      attributes.forEach(function (a) { trh.appendChild(el('th', null, a.label)); });
      thead.appendChild(trh);
      table.appendChild(thead);
      boardBody = el('tbody');
      table.appendChild(boardBody);
      wrap.appendChild(table);
      root.appendChild(wrap);

      bannerEl = el('div', 'banner');
      root.appendChild(bannerEl);

      const p = el('button', 'practice', '🎲 Jugar otro (práctica)');
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

      /* modal */
      const modal = el('div', 'modal-overlay');
      modal.id = 'reveal-modal';
      modal.innerHTML =
        '<div class="modal">' +
          '<button class="modal-close" type="button" aria-label="Cerrar">×</button>' +
          '<div class="modal-img-wrap"><img class="modal-img" alt=""></div>' +
          '<h2 class="modal-title"></h2>' +
          '<p class="modal-desc"></p>' +
          '<a class="modal-link" target="_blank" rel="noopener">Ver en Wikipedia →</a>' +
        '</div>';
      root.appendChild(modal);
      modal.querySelector('.modal-close').addEventListener('click', function () {
        modal.classList.remove('show');
      });
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('show');
      });
    }

    /* ================= AUTOCOMPLETE ================= */
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
          seen.add(s.item.name);
          matches.push(s);
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

    /* ================= FLUJO ================= */
    function onSubmit(e) {
      e.preventDefault();
      if (state.over) return;
      closeAutocomplete();
      const raw = inputEl.value.trim();
      if (!raw) return;
      const item = findItem(raw);
      if (!item) {
        showMsg('❌ "' + raw + '" no está en la lista. Empieza a escribir y elige una sugerencia.', 'bad');
        inputEl.classList.add('shake');
        setTimeout(function () { inputEl.classList.remove('shake'); }, 400);
        return;
      }
      if (state.guesses.indexOf(item.name) !== -1) {
        showMsg('⚠️ Ya probaste con ' + item.name + '.', 'bad');
        return;
      }
      state.guesses.push(item.name);
      state.attempts++;
      inputEl.value = '';
      showMsg('');

      if (item.name === state.target.name) {
        state.over = true; state.won = true;
      } else if (state.attempts >= maxAttempts) {
        state.over = true;
      }
      hints.forEach(function (h) {
        if (state.attempts >= h.at) state.unlocked[h.id] = true;
      });
      render();
      save();
      if (state.over) finish();
    }

    function finish() {
      bannerEl.className = 'banner show ' + (state.won ? 'win' : 'lose');
      bannerEl.innerHTML = state.won
        ? '🎉 ¡Correcto! Era <b>' + state.target.name + '</b> — ' + state.attempts + ' intentos.'
        : '💀 Se acabaron los ' + maxAttempts + ' intentos. Era <b>' + state.target.name + '</b>.';
      inputEl.disabled = true;
      const b = formEl.querySelector('button');
      if (b) b.disabled = true;
      showRevealModal(state.target, state.won);
    }

    /* ================= MODAL ================= */
    function showRevealModal(item, won) {
      const modal = document.getElementById('reveal-modal');
      const img = modal.querySelector('.modal-img');
      const title = modal.querySelector('.modal-title');
      const desc = modal.querySelector('.modal-desc');
      const link = modal.querySelector('.modal-link');

      img.src = '';
      img.style.opacity = '0';
      title.textContent = (won ? '🎉 ' : '💀 ') + item.name;
      desc.textContent = item.description || item.realName || '';
      link.href = wikiUrlFor(item);
      link.textContent = 'Ver en Wikipedia →';
      modal.classList.add('show');

      fetchWikiImage(item.name, wikiLang).then(function (url) {
        if (url) {
          img.onload = function () { img.style.opacity = '1'; };
          img.src = url;
        }
      });
    }

    function showMsg(text, kind) {
      msgEl.textContent = text;
      msgEl.className = 'msg' + (kind ? ' ' + kind : '');
    }

    /* ================= RENDER ================= */
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
            /* render puede ser string o {html, imageName, imageLang} */
            const out = h.render(state.target);
            if (typeof out === 'string') {
              body.innerHTML = out;
            } else if (out && out.imageName) {
              body.innerHTML = out.html || '';
              fetchWikiImage(out.imageName, out.imageLang || wikiLang).then(function (url) {
                if (url) {
                  const img = document.createElement('img');
                  img.className = out.imgClass || 'silhouette-img';
                  img.alt = 'silueta';
                  img.src = url;
                  body.appendChild(img);
                  /* quitar emoji placeholder si existe */
                  const ph = body.querySelector('.silhouette');
                  if (ph) ph.remove();
                }
              });
            }
          } else {
            body.textContent = 'Se desbloquea en el intento ' + h.at;
          }
          card.appendChild(body);
          hintsEl.appendChild(card);
        });
      }
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

    /* ================= PERSISTENCIA ================= */
    function save() {
      if (state.practice) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          date: todayStamp(), target: state.target.name,
          guesses: state.guesses, attempts: state.attempts,
          over: state.over, won: state.won, unlocked: state.unlocked
        }));
      } catch (e) {}
    }
    function load() {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (e) {}
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
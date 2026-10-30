/* =========================================================
   engine.js — Motor compartido para ambos juegos
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

  /* ---------- fábrica del juego ---------- */
  function createGame(cfg) {
    const data        = cfg.data;
    const attributes  = cfg.attributes;
    const hints       = cfg.hints || [];
    const maxAttempts = cfg.maxAttempts || 15;
    const storageKey  = cfg.storageKey || 'game';

    /* --- índice de búsqueda --- */
    const byKey = new Map();
    data.forEach(function (item, i) {
      const keys = [item.name].concat(item.aliases || []);
      keys.forEach(function (k) {
        const n = normalize(k);
        if (n && !byKey.has(n)) byKey.set(n, i);
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

    /* --- estado --- */
    const state = {
      target: null,
      guesses: [],
      attempts: 0,
      over: false,
      won: false,
      unlocked: {},
      practice: false
    };

    const dailyIndex = Math.floor(Date.now() / 86400000) % data.length;

    let inputEl, formEl, msgEl, boardBody, counterEl, hintsEl, bannerEl;

    build();
    load();
    render();
    if (state.over) finish();

    /* ================= CONSTRUCCIÓN DEL DOM ================= */
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
      inputEl = el('input');
      inputEl.type = 'text';
      inputEl.placeholder = cfg.placeholder || 'Escribe un nombre...';
      inputEl.autocomplete = 'off';
      inputEl.autocapitalize = 'off';
      inputEl.spellcheck = false;
      const btn = el('button', null, 'Probar');
      btn.type = 'submit';
      formEl.appendChild(inputEl);
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
    }

    /* ================= FLUJO DEL JUEGO ================= */
    function onSubmit(e) {
      e.preventDefault();
      if (state.over) return;

      const raw = inputEl.value.trim();
      if (!raw) return;

      const item = findItem(raw);
      if (!item) {
        showMsg('❌ "' + raw + '" no está en la lista de nombres válidos. Revisa la ortografía.', 'bad');
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
        state.over = true;
        state.won = true;
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
        ? '🎉 ¡Correcto! Era <b>' + state.target.name + '</b> — resuelto en ' + state.attempts + ' intentos.'
        : '💀 Se acabaron los ' + maxAttempts + ' intentos. La respuesta era <b>' + state.target.name + '</b>.';
      inputEl.disabled = true;
      const b = formEl.querySelector('button');
      if (b) b.disabled = true;
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
          card.appendChild(el('div', 'hint-body',
            unlocked ? h.render(state.target)
                     : 'Se desbloquea en el intento ' + h.at));
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
          date: todayStamp(),
          target: state.target.name,
          guesses: state.guesses,
          attempts: state.attempts,
          over: state.over,
          won: state.won,
          unlocked: state.unlocked
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
      state.guesses = [];
      state.attempts = 0;
      state.over = false;
      state.won = false;
      state.unlocked = {};

      inputEl.disabled = false;
      const b = formEl.querySelector('button');
      if (b) b.disabled = false;
      bannerEl.className = 'banner';
      bannerEl.innerHTML = '';
      showMsg('');
      render();
    }
  }

  global.createGame = createGame;
})(window);
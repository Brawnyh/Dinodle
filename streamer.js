/* =========================================================
   streamer.js — Streamer mode for Dinodle (?streamer=1)
   A) Bigger, stream-friendly view with a "play along" bar.
   B) Twitch chat voting: viewers type "!dino <name>"; every round the most
      voted dinosaur is guessed. Read-only anonymous chat connection (no login,
      never writes to chat). Default target is a random dinosaur (no spoilers
      from viewers who already played today).
   Needs engine.js (window.DinodleGame) and i18n.js.
   The page itself opens on a random dinosaur (dinos.js `startPractice`), so a
   finished daily board is never shown on stream.
   ========================================================= */
(function (global) {
  'use strict';
  const T = function (k, v) { return global.I18N ? global.I18N.t(k, v) : k; };
  const params = new URLSearchParams(location.search);
  const ON = params.get('streamer') === '1';
  const CH_KEY = 'dinodle_streamer_ch_v1';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Toggle button in the top bar (always visible).
  const bar = document.querySelector('.topbar');
  if (bar) {
    const a = document.createElement('a');
    a.className = 'streamer-toggle' + (ON ? ' active' : '');
    const p = new URLSearchParams(location.search);
    if (ON) p.delete('streamer'); else p.set('streamer', '1');
    const qs = p.toString();
    a.href = location.pathname + (qs ? '?' + qs : '');
    a.textContent = ON ? T('streamer_exit') : T('streamer_btn');
    const sw = document.getElementById('lang-switch');
    bar.insertBefore(a, sw || null);
  }
  if (!ON) return;

  document.body.classList.add('streamer');
  const main = document.querySelector('main');
  const game = document.getElementById('game');

  // A) Play-along bar.
  const along = document.createElement('div');
  along.className = 'streamer-bar';
  main.insertBefore(along, game);

  // B) Chat voting panel.
  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.innerHTML =
    '<div class="chat-head"><b>' + T('chat_title') + '</b></div>' +
    '<form class="chat-connect">' +
      '<input type="text" class="chat-ch" autocomplete="off" spellcheck="false" placeholder="' + esc(T('chat_channel_ph')) + '">' +
      '<select class="chat-target"><option value="random">' + esc(T('chat_target_random')) + '</option>' +
        '<option value="daily">' + esc(T('chat_target_daily')) + '</option></select>' +
      '<select class="chat-len" aria-label="' + esc(T('chat_round_len')) + '">' +
        [20, 30, 45, 60].map(function (s) { return '<option value="' + s + '"' + (s === 30 ? ' selected' : '') + '>' + s + ' s</option>'; }).join('') +
      '</select>' +
      '<button type="submit" class="chat-go">' + esc(T('chat_connect')) + '</button>' +
    '</form>' +
    '<div class="chat-status"></div>' +
    '<div class="chat-live" hidden>' +
      '<div class="chat-how">' + T('chat_how') + '</div>' +
      '<div class="chat-timer"></div>' +
      '<ol class="chat-votes"></ol>' +
      '<div class="chat-actions">' +
        '<button type="button" class="chat-now">' + esc(T('chat_guess_now')) + '</button>' +
        '<button type="button" class="chat-pause">' + esc(T('chat_pause')) + '</button>' +
        '<button type="button" class="chat-new">' + esc(T('chat_new_game')) + '</button>' +
      '</div>' +
    '</div>';
  main.insertBefore(panel, game);

  const $ = function (s) { return panel.querySelector(s); };
  const chInput = $('.chat-ch'), statusEl = $('.chat-status'), live = $('.chat-live');
  const votesEl = $('.chat-votes'), timerEl = $('.chat-timer'), goBtn = $('.chat-go');
  chInput.value = safeGet(CH_KEY) || '';

  let ws = null, channel = '', roundLen = 30, left = 30, paused = false, tick = null;
  let votes = new Map(); // user -> dinosaur name

  function api() { return global.DinodleGame; }
  function renderAlong() {
    const g = api();
    along.innerHTML = T('streamer_play_along', { n: g ? g.puzzleNumber() : '' });
  }
  if (api()) renderAlong(); else global.addEventListener('dinodle:ready', renderAlong);

  function setStatus(text, cls) { statusEl.textContent = text; statusEl.className = 'chat-status ' + (cls || ''); }

  function tally() {
    const count = new Map();
    votes.forEach(function (name) { count.set(name, (count.get(name) || 0) + 1); });
    return Array.from(count.entries()).sort(function (a, b) { return b[1] - a[1]; });
  }
  function renderVotes() {
    const list = tally().slice(0, 5);
    const max = list.length ? list[0][1] : 1;
    votesEl.innerHTML = list.length ? list.map(function (e) {
      return '<li><span class="v-name">' + esc(e[0]) + '</span><span class="v-bar"><i style="width:' + Math.round(100 * e[1] / max) + '%"></i></span>' +
        '<span class="v-n">' + esc(T('chat_votes', { n: e[1] })) + '</span></li>';
    }).join('') : '<li class="v-empty">' + esc(T('chat_no_votes')) + '</li>';
    timerEl.textContent = api() && api().isOver() ? '' : paused ? T('chat_paused') : T('chat_round', { s: left });
  }

  function endRound() {
    const g = api();
    left = roundLen;
    if (!g || g.isOver()) { renderVotes(); return; }
    const list = tally().filter(function (e) { return !g.guessed(e[0]); });
    votes = new Map();
    if (list.length) {
      const r = g.guess(list[0][0]);
      if (r === 'ok') setStatus(T('chat_guessed', { name: list[0][0], n: list[0][1] }), 'good');
    }
    renderVotes();
  }
  function startTimer() {
    clearInterval(tick);
    left = roundLen;
    tick = setInterval(function () {
      if (paused || !api() || api().isOver()) { renderVotes(); return; }
      left--;
      if (left <= 0) endRound(); else renderVotes();
    }, 1000);
    renderVotes();
  }

  function onChat(user, text) {
    const m = /^!(?:dino|d)\s+(.+)$/i.exec(text.trim());
    const g = api();
    if (!m || !g || g.isOver()) return;
    const item = g.find(m[1]);
    if (!item || g.guessed(item.name)) return;
    votes.set(user, item.name); // one vote per viewer per round; the last one counts
    renderVotes();
  }

  function connect(ch) {
    disconnect();
    channel = ch;
    setStatus(T('chat_connecting'));
    try { ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443'); } catch (e) { setStatus(T('chat_error'), 'bad'); return; }
    ws.onopen = function () {
      ws.send('NICK justinfan' + Math.floor(10000 + Math.random() * 80000)); // anonymous, read-only
      ws.send('JOIN #' + channel);
    };
    ws.onmessage = function (ev) {
      String(ev.data).split('\r\n').forEach(function (line) {
        if (!line) return;
        if (line.indexOf('PING') === 0) { ws.send('PONG' + line.slice(4)); return; }
        let m = /^:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/.exec(line);
        if (m) { onChat(m[1], m[2]); return; }
        if (/ 366 /.test(line) || / JOIN #/.test(line)) {
          setStatus(T('chat_connected', { ch: channel }), 'good');
          live.hidden = false;
          goBtn.textContent = T('chat_disconnect');
          startTimer();
        }
      });
    };
    ws.onerror = function () { setStatus(T('chat_error'), 'bad'); };
    ws.onclose = function () { if (ws) { setStatus(T('chat_closed'), 'bad'); } };
  }
  function disconnect() {
    clearInterval(tick);
    if (ws) { const w = ws; ws = null; try { w.close(); } catch (e) {} }
    live.hidden = true;
    goBtn.textContent = T('chat_connect');
    votes = new Map();
  }

  $('.chat-connect').addEventListener('submit', function (e) {
    e.preventDefault();
    if (ws) { disconnect(); setStatus(''); return; }
    const ch = chInput.value.trim().toLowerCase().replace(/^.*twitch\.tv\//, '').replace(/[^a-z0-9_]/g, '');
    if (!ch) { chInput.focus(); return; }
    safeSet(CH_KEY, ch);
    roundLen = parseInt($('.chat-len').value, 10) || 30;
    // The page opens on a random dinosaur; "daily" switches to today's puzzle on purpose.
    const daily = $('.chat-target').value === 'daily';
    if (api() && daily && api().isPractice()) api().daily();
    else if (api() && !daily && !api().isPractice()) api().newPractice();
    connect(ch);
  });
  $('.chat-now').addEventListener('click', endRound);
  $('.chat-pause').addEventListener('click', function () {
    paused = !paused;
    this.textContent = paused ? T('chat_resume') : T('chat_pause');
    renderVotes();
  });
  $('.chat-new').addEventListener('click', function () {
    if (!api()) return;
    api().newPractice();
    votes = new Map(); left = roundLen; renderVotes();
  });
  global.addEventListener('dinodle:newgame', function () { votes = new Map(); left = roundLen; if (ws) renderVotes(); });
})(window);

/* theme.js — picks the visual theme and adds its moving decorations.
   Preview a theme with ?theme=jungle | fossil | volcano | classic
   (the choice is remembered). DEFAULT_THEME is used for new visitors. */
(function () {
  'use strict';
  const DEFAULT_THEME = 'jungle';
  const THEMES = ['classic', 'jungle', 'fossil', 'volcano'];
  const FONTS = {
    jungle: 'family=Lilita+One&family=Nunito:wght@400;700;800',
    fossil: 'family=Rye&family=Nunito:wght@400;700;800',
    volcano: 'family=Bungee&family=Nunito:wght@400;700;800'
  };
  const KEY = 'dinodle_theme_v1';

  let theme = new URLSearchParams(location.search).get('theme');
  if (THEMES.indexOf(theme) !== -1) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
  else { try { theme = localStorage.getItem(KEY); } catch (e) { theme = null; } }
  if (THEMES.indexOf(theme) === -1) theme = DEFAULT_THEME;
  document.body.dataset.theme = theme;
  if (theme === 'classic') return;

  if (FONTS[theme]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + FONTS[theme] + '&display=swap';
    document.head.appendChild(l);
  }

  // A small dinosaur walks along the top bar.
  const bar = document.querySelector('.topbar');
  if (bar) {
    const w = document.createElement('div');
    w.className = 'walker';
    w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<span>' + (theme === 'fossil' ? '🦴' : theme === 'volcano' ? '🦖' : '🦕') + '</span>';
    bar.appendChild(w);
  }

  // Background particles: leaves, dust or meteors and embers.
  const scene = document.createElement('div');
  scene.className = 'scene';
  scene.setAttribute('aria-hidden', 'true');
  document.body.prepend(scene);
  const rnd = function (a, b) { return a + Math.random() * (b - a); };
  function layer(cls) {
    const d = document.createElement('div');
    d.className = 'scene-layer ' + cls;
    scene.appendChild(d);
    return d;
  }
  function add(cls, text, n, dur, parent) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle ' + cls;
      if (text) p.textContent = text[i % text.length];
      p.style.left = rnd(0, 100) + 'vw';
      p.style.fontSize = rnd(14, 26) + 'px';
      p.style.animationDuration = rnd(dur[0], dur[1]) + 's';
      p.style.animationDelay = (-rnd(0, dur[1])) + 's';
      (parent || scene).appendChild(p);
    }
  }
  if (theme === 'jungle') {
    // "Extinction" mode: the more attempts you use, the more the jungle turns
    // into the volcanic end of the Cretaceous (--doom goes from 0 to 1).
    layer('doom-sky');
    add('leaf', ['🍃', '🌿', '🍂'], 14, [12, 22], layer('leaf-layer'));
    const fire = layer('fire-layer');
    add('meteor', null, 4, [5, 11], fire);
    add('ember', null, 20, [6, 12], fire);
    window.addEventListener('dinodle:progress', function (e) {
      const d = e.detail;
      const doom = d.won ? 0 : d.over ? 1 : Math.min(1, d.attempts / d.max);
      document.body.style.setProperty('--doom', doom.toFixed(3));
      document.body.classList.toggle('doom-2', doom >= 0.5 && !d.won);
      document.body.classList.toggle('doom-3', doom >= 0.75 && !d.won);
      document.body.classList.toggle('extinct', d.over && !d.won);
    });
    // Lost: a meteorite hits.
    window.addEventListener('dinodle:lose', function () {
      const m = document.createElement('div');
      m.className = 'meteorite';
      m.textContent = '☄️';
      document.body.appendChild(m);
      setTimeout(function () {
        const f = document.createElement('div');
        f.className = 'impact';
        document.body.appendChild(f);
        document.body.classList.add('shake');
        setTimeout(function () { f.remove(); m.remove(); document.body.classList.remove('shake'); }, 1300);
      }, 1100);
    });
  }
  if (theme === 'fossil') add('dust', ['·', '•', '🦴'], 18, [9, 16]);
  if (theme === 'volcano') { add('meteor', null, 5, [5, 11]); add('ember', null, 22, [6, 12]); }

  // Celebrate a win with falling dinosaurs.
  window.addEventListener('dinodle:win', function () {
    const set = theme === 'fossil' ? ['🦴', '🦕', '⭐'] : theme === 'volcano' ? ['🦖', '🔥', '☄️'] : ['🦕', '🦖', '🌿'];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement('span');
      c.className = 'celebrate';
      c.textContent = set[i % set.length];
      c.style.left = rnd(0, 100) + 'vw';
      c.style.animationDelay = rnd(0, .8) + 's';
      document.body.appendChild(c);
      setTimeout(function () { c.remove(); }, 3600);
    }
  });
})();

/* Shared site footer: contact email, legal pages, credits and the sister game.
   Uses i18n.js labels when it is loaded (game page), English otherwise. */
(function () {
  'use strict';
  const node = document.getElementById('site-foot');
  if (!node) return;
  const t = window.I18N ? window.I18N.t : null;
  const L = function (key, en) { return t ? t(key) : en; };
  const links = [
    ['./', '🦖 Dinodle'],
    ['about.html', L('about', 'About')],
    ['contact.html', L('contact', 'Contact')],
    ['privacy.html', L('privacy', 'Privacy')],
    ['credits.html', L('credits_link', 'Image credits')]
  ];
  node.innerHTML =
    '<nav class="foot-links">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('<span>·</span>') + '</nav>' +
    (window.SITE && window.SITE.SUPPORT_URL
      ? '<p><a class="support-btn" href="' + window.SITE.SUPPORT_URL + '" target="_blank" rel="noopener">' + L('support', '☕ Support Dinodle') + '</a></p>'
      : '') +
    '<p><a class="foot-sister" href="https://brawnyh.github.io/GuessTheCharacter/" rel="noopener">' + L('other_game', '🦸 Try our superhero game') + '</a></p>' +
    '<p class="foot-mail">📧 <a href="mailto:contact@dinodle.app">contact@dinodle.app</a> · © ' + new Date().getFullYear() + ' Dinodle</p>';
})();

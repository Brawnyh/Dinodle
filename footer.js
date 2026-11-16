/* Shared site footer: contact email, legal pages, credits and the sister game.
   Uses i18n.js labels when it is loaded (game page), English otherwise. */
(function () {
  'use strict';
  const node = document.getElementById('site-foot');
  if (!node) return;
  const t = window.I18N ? window.I18N.t : null;
  const L = function (key, en) { return t ? t(key) : en; };
  // Root-absolute links so they also work on pages in subfolders.
  const links = [
    ['/', '🦖 Dinodle'],
    ['/dinosaurs/', L('all_dinos', 'All dinosaurs')],
    ['/faq.html', 'FAQ'],
    ['/about.html', L('about', 'About')],
    ['/contact.html', L('contact', 'Contact')],
    ['/privacy.html', L('privacy', 'Privacy')],
    ['/credits.html', L('credits_link', 'Image credits')]
  ];
  node.innerHTML =
    '<nav class="foot-links">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('<span>·</span>') + '</nav>' +
    (window.SITE && window.SITE.supportLinks && window.SITE.supportLinks().length
      ? '<p class="support-row">' + L('support', '☕ Support Dinodle') + ' ' + window.SITE.supportLinks().map(function (s) {
          return '<a class="support-btn" href="' + s.url + '" target="_blank" rel="noopener">' + s.label + '</a>';
        }).join(' ') + '</p>'
      : '') +
    '<p><a class="foot-sister" href="https://brawnyh.github.io/GuessTheCharacter/" rel="noopener">' + L('other_game', '🦸 Try our superhero game') + '</a></p>' +
    '<p class="foot-mail">📧 <a href="mailto:contact@dinodle.app">contact@dinodle.app</a> · © ' + new Date().getFullYear() + ' Dinodle</p>';
})();

/* =========================================================
   ads.js — Google AdSense hook-up for Dinodle.

   HOW TO TURN ADS ON (after AdSense approves dinodle.app):
   1. Put your publisher ID in CLIENT, e.g. 'ca-pub-1234567890123456'.
   2. In AdSense → Ads → By ad unit, create display ad units and paste each
      "data-ad-slot" number into SLOTS below (any slot left empty stays hidden).
   3. Upload ads.txt at the site root (AdSense gives you its content).
   The consent banner for EU/UK/CH visitors is configured in AdSense →
   Privacy & messaging (Google's free certified CMP); it loads with the script.

   Preview where ads go without AdSense: open the site with ?ads=preview
   ========================================================= */
(function () {
  'use strict';
  const CLIENT = '';           // 'ca-pub-XXXXXXXXXXXXXXXX'
  const SLOTS = {
    top: '',                   // banner under the header
    incontent: '',             // after the board / help
    rail: ''                   // left and right rails on wide screens
  };

  const slots = document.querySelectorAll('.ad-slot');
  if (new URLSearchParams(location.search).get('ads') === 'preview') {
    document.body.classList.add('ads-preview');
    return;
  }
  if (!CLIENT) return;         // ads off: slots stay hidden, no space taken

  document.body.classList.add('ads-on');
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);

  slots.forEach(function (box) {
    const id = SLOTS[box.dataset.slot];
    if (!id) { box.style.display = 'none'; return; }
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', CLIENT);
    ins.setAttribute('data-ad-slot', id);
    if (box.dataset.slot !== 'rail') {
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
    }
    box.appendChild(ins);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
})();

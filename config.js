/* config.js — site settings the owner fills in.
   SUPPORT_LINKS: donation pages, shown as buttons after a game and in the
   footer. Entries with an empty url are hidden.
   Add Ko-fi by filling its url, e.g. 'https://ko-fi.com/yourname'. */
window.SITE = {
  SUPPORT_LINKS: [
    { label: 'PayPal', url: 'https://www.paypal.com/paypalme/MleyeKane' },
    { label: 'Ko-fi', url: '' }
  ]
};
window.SITE.supportLinks = function () {
  return (window.SITE.SUPPORT_LINKS || []).filter(function (l) { return l && l.url; });
};

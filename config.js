/* config.js — site settings the owner fills in.
   SUPPORT_LINKS: donation pages, shown as buttons after a game and in the
   footer. Entries with an empty url are hidden.
   Ko-fi links to the current goal page (progress bar). */
window.SITE = {
  SUPPORT_LINKS: [
    { label: 'Ko-fi', url: 'https://ko-fi.com/kanedino/goal?g=0' }
  ]
};
window.SITE.supportLinks = function () {
  return (window.SITE.SUPPORT_LINKS || []).filter(function (l) { return l && l.url; });
};

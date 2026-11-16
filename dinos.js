// Dinodle game config. Needs i18n.js and engine.js loaded first.
const { t: tr, lang: LANG, locale: LOCALE } = window.I18N;

// Easy mode (?mode=easy): only the 25 most famous dinosaurs (tagged "easy" in
// the data), with its own daily puzzle, saved game and stats.
const EASY = new URLSearchParams(location.search).get('mode') === 'easy';
document.querySelectorAll('.mode-switch a').forEach(a =>
  a.classList.toggle('active', (a.dataset.mode === 'easy') === EASY));

I18N.applyStatic();
I18N.mountSwitch(document.getElementById('lang-switch'));
document.title = tr('page_title');

const getJSON = url => fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
// Spanish is the source language of the data; other languages use a dictionary.
const dictReq = LANG === 'es' ? Promise.resolve(null)
  : getJSON('data/i18n/dinos.' + LANG + '.json').catch(() => null);

Promise.all([
  getJSON('data/dinos.json'),
  getJSON('data/silhouette-credits.json').catch(() => ({})),
  dictReq
])
  .then(([source, silhouettes, dict]) => {
    const all = I18N.localize(source, dict);
    const easyList = all.filter(d => d.easy);
    // Fallback: a stale cached data file without "easy" tags would leave Easy empty.
    const data = EASY && easyList.length ? easyList : all;
    createGame({
      data,
      gameId: EASY ? 'dinoEasy' : 'dino',
      storageKey: EASY ? 'dino-easy-daily-v1' : 'dino-daily-v5',
      maxAttempts: 20,
      wikiLang: 'en',
      wikiUrlFor: item =>
        'https://' + LANG + '.wikipedia.org/wiki/' + encodeURIComponent(item.name.split(' ')[0]),
      placeholder: tr('placeholder'),
      attributes: [
        { label: tr('attr_period'), display: d => d.period,
          compare: (g, t) => ({ status: g.period === t.period ? 'correct' : 'wrong' }) },
        { label: tr('attr_diet'), display: d => d.diet,
          compare: (g, t) => ({ status: g.diet === t.diet ? 'correct' : 'wrong' }) },
        { label: tr('attr_type'), display: d => d.tipo,
          compare: (g, t) => ({ status: g.tipo === t.tipo ? 'correct' : 'wrong' }) },
        { label: tr('attr_weight'), display: d => d.weight.toLocaleString(LOCALE) + ' kg',
          compare: (g, t) => {
            if (g.weight === t.weight) return { status: 'correct' };
            const arrow = g.weight < t.weight ? '⬆️' : '⬇️';
            const ratio = Math.abs(g.weight - t.weight) / t.weight;
            return { status: ratio < 0.3 ? 'close' : 'wrong', arrow };
          } },
        { label: tr('attr_length'), display: d => d.length.toLocaleString(LOCALE) + ' m',
          compare: (g, t) => {
            if (g.length === t.length) return { status: 'correct' };
            const arrow = g.length < t.length ? '⬆️' : '⬇️';
            const ratio = Math.abs(g.length - t.length) / t.length;
            return { status: ratio < 0.25 ? 'close' : 'wrong', arrow };
          } },
        { label: tr('attr_continent'), display: d => d.continent,
          compare: (g, t) => ({ status: g.continent === t.continent ? 'correct' : 'wrong' }) }
      ],
      hints: [
        // Self-hosted free-licence silhouette (see credits.html); falls back to
        // a darkened Wikipedia photo for the few dinosaurs without one.
        { id: 'silhouette', at: 3, label: tr('hint_silhouette'),
          render: t => silhouettes[t.name]
            ? { imageSrc: silhouettes[t.name].file }
            : { imageName: t.name, imageLang: 'en' } },
        { id: 'discoverer', at: 5, label: tr('hint_discoverer'),
          render: t => tr('discovered_by', { who: t.discoverer, year: t.discoveredYear }) },
        { id: 'description', at: 12, label: tr('hint_description'),
          render: t => t.description || tr('no_description') }
      ]
    });
  })
  .catch(err => {
    document.getElementById('game').innerHTML =
      '<p style="color:#ff7b72;padding:20px">' + tr('load_error') + '</p>';
    console.error(err);
  });

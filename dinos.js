// Dinodle game config. Needs i18n.js and engine.js loaded first.
const { t: tr, lang: LANG, locale: LOCALE } = window.I18N;

// Easy mode (?mode=easy): only the 25 most famous dinosaurs (tagged "easy" in
// the data), with its own daily puzzle, saved game and stats.
const EASY = new URLSearchParams(location.search).get('mode') === 'easy';
document.querySelectorAll('.mode-switch a').forEach(a => {
  a.classList.toggle('active', (a.dataset.mode === 'easy') === EASY);
  // Keep the other URL settings (theme, ads preview…) when switching mode.
  const p = new URLSearchParams(location.search);
  if (a.dataset.mode === 'easy') p.set('mode', 'easy'); else p.delete('mode');
  const qs = p.toString();
  a.href = location.pathname + (qs ? '?' + qs : '');
});

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
    // Geological order of the periods (source values), so a neighbouring
    // period can count as "close" with an older/newer arrow.
    const PERIOD_ORDER = ['Triásico tardío', 'Jurásico temprano', 'Jurásico medio', 'Jurásico tardío',
      'Cretácico temprano', 'Cretácico medio', 'Cretácico tardío'];
    source.forEach(d => { d.periodRank = PERIOD_ORDER.indexOf(d.period); d.omnivore = d.diet === 'Omnívoro'; });

    const all = I18N.localize(source, dict);
    const easyList = all.filter(d => d.easy);
    // Fallback: a stale cached data file without "easy" tags would leave Easy empty.
    const data = EASY && easyList.length ? easyList : all;
    createGame({
      data,
      gameId: EASY ? 'dinoEasy' : 'dino',
      // v6/v2: saved games now store bought clues (token system).
      storageKey: EASY ? 'dino-easy-daily-v2' : 'dino-daily-v6',
      historyKey: EASY ? 'dino-easy-history-v1' : 'dino-history-v1',
      maxAttempts: 12,
      // Tokens to buy clues: earlier in Easy mode.
      tokens: { at: EASY ? [2, 4, 6] : [3, 6, 9] },
      scoring: { base: 1000, attemptPenalty: 100, attemptInterval: 3, tokenPenalty: 150 },
      shareTitle: 'Dinodle' + (EASY ? ' (' + tr('mode_easy') + ')' : ''),
      shareUrl: 'https://dinodle.app' + (EASY ? '/?mode=easy' : ''),
      wikiLang: 'en',
      wikiUrlFor: item =>
        'https://' + LANG + '.wikipedia.org/wiki/' + encodeURIComponent(item.name.split(' ')[0]),
      placeholder: tr('placeholder'),
      attributes: [
        { label: tr('attr_period'), display: d => d.period,
          compare: (g, t) => {
            if (g.period === t.period) return { status: 'correct' };
            // ← = the secret dinosaur lived earlier, → = later.
            const arrow = t.periodRank < g.periodRank ? '←' : '→';
            return { status: Math.abs(g.periodRank - t.periodRank) === 1 ? 'close' : 'wrong', arrow };
          } },
        { label: tr('attr_diet'), display: d => d.diet,
          // An omnivore is "close" to both carnivores and herbivores.
          compare: (g, t) => ({ status: g.diet === t.diet ? 'correct' : (g.omnivore || t.omnivore ? 'close' : 'wrong') }) },
        { label: tr('attr_type'), display: d => d.tipo,
          compare: (g, t) => ({ status: g.tipo === t.tipo ? 'correct' : 'wrong' }) },
        { label: tr('attr_weight'), display: d => d.weight.toLocaleString(LOCALE) + ' kg',
          compare: (g, t) => {
            if (g.weight === t.weight) return { status: 'correct' };
            const arrow = g.weight < t.weight ? '↑' : '↓';
            const ratio = Math.abs(g.weight - t.weight) / t.weight;
            return { status: ratio < 0.3 ? 'close' : 'wrong', arrow };
          } },
        { label: tr('attr_length'), display: d => d.length.toLocaleString(LOCALE) + ' m',
          compare: (g, t) => {
            if (g.length === t.length) return { status: 'correct' };
            const arrow = g.length < t.length ? '↑' : '↓';
            const ratio = Math.abs(g.length - t.length) / t.length;
            return { status: ratio < 0.25 ? 'close' : 'wrong', arrow };
          } },
        { label: tr('attr_continent'), display: d => d.continent,
          compare: (g, t) => ({ status: g.continent === t.continent ? 'correct' : 'wrong' }) }
      ],
      // Each clue costs 1 token. The silhouette is the last clue: it can only
      // be bought after the other two.
      hints: [
        { id: 'discoverer', label: tr('hint_discoverer'),
          render: t => tr('discovered_by', { who: t.discoverer, year: t.discoveredYear }) },
        { id: 'description', label: tr('hint_description'),
          render: t => t.description || tr('no_description') },
        // Self-hosted free-licence silhouette (see credits.html); falls back to
        // a darkened Wikipedia photo for the few dinosaurs without one.
        { id: 'silhouette', label: tr('hint_silhouette'), requires: ['discoverer', 'description'], last: true,
          render: t => silhouettes[t.name]
            ? { imageSrc: silhouettes[t.name].file }
            : { imageName: t.name, imageLang: 'en' } }
      ]
    });
  })
  .catch(err => {
    document.getElementById('game').innerHTML =
      '<p style="color:#ff7b72;padding:20px">' + tr('load_error') + '</p>';
    console.error(err);
  });

fetch('data/dinos.json')
  .then(r => r.json())
  .then(data => {
    createGame({
      data,
      storageKey: 'dino-daily-v2',
      maxAttempts: 20,
      wikiLang: 'es',
      wikiUrlFor: item =>
        'https://es.wikipedia.org/wiki/' + encodeURIComponent(item.name.split(' ')[0]),
      placeholder: 'Ej: Tyrannosaurus, Triceratops... (empieza a escribir)',
      attributes: [
        { label: 'Periodo', display: d => d.period,
          compare: (g, t) => ({ status: g.period === t.period ? 'correct' : 'wrong' }) },
        { label: 'Dieta', display: d => d.diet,
          compare: (g, t) => ({ status: g.diet === t.diet ? 'correct' : 'wrong' }) },
        { label: 'Tipo', display: d => d.tipo,
          compare: (g, t) => ({ status: g.tipo === t.tipo ? 'correct' : 'wrong' }) },
        { label: 'Peso', display: d => d.weight.toLocaleString('es-ES') + ' kg',
          compare: (g, t) => {
            if (g.weight === t.weight) return { status: 'correct' };
            const arrow = g.weight < t.weight ? '⬆️' : '⬇️';
            const ratio = Math.abs(g.weight - t.weight) / t.weight;
            return { status: ratio < 0.3 ? 'close' : 'wrong', arrow };
          } },
        { label: 'Longitud', display: d => d.length + ' m',
          compare: (g, t) => {
            if (g.length === t.length) return { status: 'correct' };
            const arrow = g.length < t.length ? '⬆️' : '⬇️';
            const ratio = Math.abs(g.length - t.length) / t.length;
            return { status: ratio < 0.25 ? 'close' : 'wrong', arrow };
          } },
        { label: 'Continente', display: d => d.continent,
          compare: (g, t) => ({ status: g.continent === t.continent ? 'correct' : 'wrong' }) }
      ],
      hints: [
        { id: 'silhouette', at: 3, label: 'Silueta',
          render: t => ({
            html: '<div class="silhouette" style="font-size:34px;filter:none;opacity:.5">🖼️</div>',
            imageName: t.name,
            imageLang: 'es',
            imgClass: 'silhouette-img'
          })
        },
        { id: 'discoverer', at: 5, label: 'Descubridor y año',
          render: t => 'Descubierto por <b>' + t.discoverer + '</b> en <b>' + t.discoveredYear + '</b>.' },
        { id: 'description', at: 12, label: 'Descripción',
          render: t => t.description || 'Sin descripción disponible.' }
      ]
    });
  })
  .catch(err => {
    document.getElementById('game').innerHTML =
      '<p style="color:#ff7b72;padding:20px">Error al cargar datos. Sirve la página por http.</p>';
    console.error(err);
  });
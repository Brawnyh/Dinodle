fetch('data/dc.json')
  .then(r => r.json())
  .then(data => {
    createGame({
      data,
      gameId: 'dc',
      storageKey: 'dc-daily-v5',
      maxAttempts: 20,
      wikiLang: 'en',
      wikiUrlFor: item =>
        'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.name.replace(/ /g, '_')),
      placeholder: 'Ej: Superman, Batman, Wonder Woman...',
      attributes: [
        { label: 'Nombre real', display: d => d.realName,
          compare: (g, t) => ({ status: g.realName === t.realName ? 'correct' : 'wrong' }) },
        { label: 'Género', display: d => d.gender,
          compare: (g, t) => ({ status: g.gender === t.gender ? 'correct' : 'wrong' }) },
        { label: 'Alineación', display: d => d.alignment,
          compare: (g, t) => ({ status: g.alignment === t.alignment ? 'correct' : 'wrong' }) },
        { label: '1ª aparición', display: d => d.firstAppearance,
          compare: (g, t) => {
            const diff = g.firstAppearance - t.firstAppearance;
            if (diff === 0) return { status: 'correct' };
            const arrow = diff < 0 ? '⬆️' : '⬇️';
            return { status: Math.abs(diff) <= 3 ? 'close' : 'wrong', arrow };
          } },
        { label: 'Equipo', display: d => d.team,
          compare: (g, t) => ({ status: g.team === t.team ? 'correct' : 'wrong' }) },
        { label: 'Poder', display: d => d.power,
          compare: (g, t) => ({ status: g.power === t.power ? 'correct' : 'wrong' }) },
        { label: 'Ciudad', display: d => d.city,
          compare: (g, t) => ({ status: g.city === t.city ? 'correct' : 'wrong' }) }
      ],
      hints: [
        { id: 'quote', at: 3, label: 'Cita famosa',
          render: t => t.quote ? '“' + t.quote + '”' : '<i>Sin cita registrada.</i>' },
        { id: 'first', at: 5, label: 'Primera aparición',
          render: t => 'Debutó en <b>' + t.firstAppearance + '</b> como <b>' + t.name + '</b>.' },
        { id: 'description', at: 12, label: 'Descripción',
          render: t => t.description || 'Sin descripción disponible.' }
      ]
    });
  })
  .catch(err => {
    document.getElementById('game').innerHTML =
      '<p style="color:#ff7b72;padding:20px">Error al cargar datos.</p>';
    console.error(err);
  });
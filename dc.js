fetch('data/dc.json')
  .then(r => r.json())
  .then(data => {
    createGame({
      data,
      storageKey: 'dc-daily-v1',
      maxAttempts: 20,
      placeholder: 'Ej: Superman, Batman, Clark Kent...',
      attributes: [
        { label: 'Nombre real', display: d => d.realName,
          compare: (g, t) => ({ status: g.realName === t.realName ? 'correct' : 'wrong' }) },
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
        { id: 'silhouette', at: 3, label: 'Silueta',
          render: t => `<div class="silhouette">${t.emoji}</div>` },
        { id: 'first', at: 5, label: 'Primera aparición',
          render: t => `Debutó en <b>${t.firstAppearance}</b> como <b>${t.name}</b>.` },
        { id: 'reveal', at: 15, label: 'Revelación',
          render: t => `<b>${t.name}</b> — escríbelo para confirmar.` }
      ]
    });
  })
  .catch(err => {
    document.getElementById('game').innerHTML =
      '<p style="color:#ff7b72;padding:20px">Error al cargar datos. Sirve la página por http.</p>';
    console.error(err);
  });
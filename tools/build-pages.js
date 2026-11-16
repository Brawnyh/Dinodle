#!/usr/bin/env node
/* tools/build-pages.js — generates the static SEO pages of Dinodle.
 *
 *   node tools/build-pages.js
 *
 * Reads data/dinos.json (Spanish source) and data/i18n/dinos.{en,fr}.json and writes:
 *   dinosaurs/<slug>.html, fr/dinosaures/<slug>.html, es/dinosaurios/<slug>.html
 *   dinosaurs/index.html, fr/dinosaures/index.html, es/dinosaurios/index.html
 *   faq.html, sitemap.xml
 * The three dinosaur folders are fully generated: old .html files in them are
 * deleted on each run, so removed or renamed dinosaurs don't leave stale pages.
 * No dependencies. Safe to re-run any time the data changes.
 *
 * These pages never show silhouettes or photos (they are a paid in-game clue).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://dinodle.app';
const OG_IMAGE = SITE + '/og-image.png';
const YEAR = new Date().getFullYear();
const CF_BEACON = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3ec68c84495f4c34b2fa164656ac72eb"}'></script><!-- End Cloudflare Web Analytics -->`;

const readJSON = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const readJSONOpt = f => { try { return readJSON(f); } catch (e) { return { fields: {}, description: {} }; } };

const source = readJSON('data/dinos.json');
const DICT = { es: null, en: readJSONOpt('data/i18n/dinos.en.json'), fr: readJSONOpt('data/i18n/dinos.fr.json') };

// Geological order of the source (Spanish) period values, oldest first.
const PERIOD_ORDER = ['Triásico temprano', 'Triásico medio', 'Triásico tardío', 'Jurásico temprano', 'Jurásico medio',
  'Jurásico tardío', 'Cretácico temprano', 'Cretácico medio', 'Cretácico tardío'];

// Fallback translations, used only when data/i18n has no entry for a value.
const FALLBACK = {
  en: {
    period: { 'Triásico temprano': 'Early Triassic', 'Triásico medio': 'Middle Triassic', 'Triásico tardío': 'Late Triassic',
      'Jurásico temprano': 'Early Jurassic', 'Jurásico medio': 'Middle Jurassic', 'Jurásico tardío': 'Late Jurassic',
      'Cretácico temprano': 'Early Cretaceous', 'Cretácico medio': 'Mid-Cretaceous', 'Cretácico tardío': 'Late Cretaceous' },
    diet: { 'Carnívoro': 'Carnivore', 'Herbívoro': 'Herbivore', 'Omnívoro': 'Omnivore', 'Piscívoro': 'Piscivore', 'Insectívoro': 'Insectivore' },
    tipo: { 'Terópodos': 'Theropods', 'Ceratopsios': 'Ceratopsians', 'Tireóforos': 'Thyreophorans', 'Saurópodos': 'Sauropods',
      'Ornitópodos': 'Ornithopods', 'Marginocéfalos': 'Marginocephalians', 'Sauropodomorfos': 'Sauropodomorphs', 'Prosaurópodos': 'Prosauropods' },
    continent: { 'Norteamérica': 'North America', 'Sudamérica': 'South America', 'Asia': 'Asia', 'África': 'Africa', 'Europa': 'Europe',
      'Oceanía': 'Oceania', 'Australia': 'Australia', 'Antártida': 'Antarctica' },
    discoverer: { 'Expedición polaco-mongola': 'Polish-Mongolian expedition' }
  },
  fr: {
    period: { 'Triásico temprano': 'Trias inférieur', 'Triásico medio': 'Trias moyen', 'Triásico tardío': 'Trias supérieur',
      'Jurásico temprano': 'Jurassique inférieur', 'Jurásico medio': 'Jurassique moyen', 'Jurásico tardío': 'Jurassique supérieur',
      'Cretácico temprano': 'Crétacé inférieur', 'Cretácico medio': 'Crétacé moyen', 'Cretácico tardío': 'Crétacé supérieur' },
    diet: { 'Carnívoro': 'Carnivore', 'Herbívoro': 'Herbivore', 'Omnívoro': 'Omnivore', 'Piscívoro': 'Piscivore', 'Insectívoro': 'Insectivore' },
    tipo: { 'Terópodos': 'Théropodes', 'Ceratopsios': 'Cératopsiens', 'Tireóforos': 'Thyréophores', 'Saurópodos': 'Sauropodes',
      'Ornitópodos': 'Ornithopodes', 'Marginocéfalos': 'Marginocéphales', 'Sauropodomorfos': 'Sauropodomorphes', 'Prosaurópodos': 'Prosauropodes' },
    continent: { 'Norteamérica': 'Amérique du Nord', 'Sudamérica': 'Amérique du Sud', 'Asia': 'Asie', 'África': 'Afrique', 'Europa': 'Europe',
      'Oceanía': 'Océanie', 'Australia': 'Australie', 'Antártida': 'Antarctique' },
    discoverer: { 'Expedición polaco-mongola': 'Expédition polono-mongole' }
  },
  es: {}
};

const LOCALE = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' };
const DIR = { en: 'dinosaurs', fr: 'fr/dinosaures', es: 'es/dinosaurios' };
const LANGS = ['en', 'fr', 'es'];

// ---------- helpers ----------
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = obj => '<script type="application/ld+json">' +
  JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') + '</script>';
const num = (lang, n, maxFrac) => Number(n).toLocaleString(LOCALE[lang], { maximumFractionDigits: maxFrac == null ? 1 : maxFrac });
const lcFirst = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
const ucFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const stripAccents = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const slugify = s => stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const genusOf = name => String(name).trim().split(/\s+/)[0];

function tr(lang, field, value) {
  if (lang === 'es' || value == null) return value;
  const d = DICT[lang] && DICT[lang].fields && DICT[lang].fields[field];
  if (d && d[value] != null) return d[value];
  const f = FALLBACK[lang][field];
  if (f && f[value] != null) return f[value];
  return value;
}
function description(lang, d) {
  if (lang === 'es') return d.description || '';
  const desc = DICT[lang] && DICT[lang].description;
  return (desc && desc[d.name]) || ''; // never show the Spanish text on EN/FR pages
}
// "Theropods" -> "theropod", "Théropodes" -> "théropode", "Terópodos" -> "terópodo".
const groupSingular = (lang, d) => lcFirst(tr(lang, 'tipo', d.tipo)).replace(/s$/, '');
const groupPlural = (lang, d) => lcFirst(tr(lang, 'tipo', d.tipo));

// ---------- prepare the data ----------
const missing = { en: [], fr: [] };
const dinos = source.filter(d => d && d.name).map(d => Object.assign({}, d, { genus: genusOf(d.name) }));
// Slug = lowercase genus. If a genus appears twice, the first entry keeps the
// genus URL (stable links) and later ones use the full name (genus-species).
const usedSlugs = new Set();
dinos.forEach(d => {
  const genusTaken = usedSlugs.has(slugify(d.genus));
  let slug = genusTaken ? slugify(d.name) : slugify(d.genus);
  let base = slug, i = 2;
  while (usedSlugs.has(slug)) slug = base + '-' + i++;
  usedSlugs.add(slug);
  d.slug = slug;
  d.title = genusTaken ? d.name : d.genus; // short name used in H1 and links
  d.periodRank = PERIOD_ORDER.indexOf(d.period);
  ['en', 'fr'].forEach(l => { if (!description(l, d)) missing[l].push(d.name); });
});
const N = dinos.length;
const rankBy = key => { // 1 = largest; ties share a rank
  const sorted = dinos.map(d => +d[key] || 0).sort((a, b) => b - a);
  return v => sorted.indexOf(+v || 0) + 1;
};
const lengthRank = rankBy('length');
const weightRank = rankBy('weight');

function related(d) {
  const score = o => (o.tipo === d.tipo ? (o.period === d.period ? 0 : 1) : 2);
  return dinos.filter(o => o !== d && (o.tipo === d.tipo || o.period === d.period))
    .sort((a, b) => score(a) - score(b) || Math.abs((a.era || 0) - (d.era || 0)) - Math.abs((b.era || 0) - (d.era || 0)) || a.name.localeCompare(b.name))
    .slice(0, 4);
}

const pageUrl = (lang, d) => SITE + '/' + DIR[lang] + '/' + d.slug + '.html';
const indexUrl = lang => SITE + '/' + DIR[lang] + '/';
const wikiUrl = (lang, d) => 'https://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(d.genus);

// ---------- UI text per language ----------
const T = {
  en: {
    back: '← Dinodle', home: 'Dinodle', dinosaurs: 'Dinosaurs', langName: 'English',
    pageTitle: d => `${d.name} facts — size, diet, period | Dinodle`,
    tagline: d => `${aOrAn(dietAdj('en', d))} ${dietAdj('en', d)} ${groupSingular('en', d)} of the ${tr('en', 'period', d.period)}`,
    metaDesc: d => `${d.name}: ${aOrAn(dietAdj('en', d))} ${dietAdj('en', d)} ${groupSingular('en', d)} of the ${tr('en', 'period', d.period)} (~${d.era} million years ago), about ${num('en', d.length)} m long and ${num('en', d.weight)} kg, found in ${tr('en', 'continent', d.continent)}.`,
    factsTitle: 'Key facts', aboutTitle: d => `About ${d.title}`,
    rows: { name: 'Scientific name', period: 'Period', diet: 'Diet', group: 'Group', weight: 'Estimated weight', length: 'Estimated length', found: 'Fossils found in', disc: 'Discovered by' },
    ago: era => `~${era} million years ago`,
    disc: d => `${tr('en', 'discoverer', d.discoverer)} (${d.discoveredYear})`,
    prose: d => {
      const p = [];
      p.push(`${d.name} was ${aOrAn(dietAdj('en', d))} ${dietAdj('en', d)} ${groupSingular('en', d)} that lived during the ${tr('en', 'period', d.period)}, roughly ${d.era} million years ago. Its fossils have been found in ${tr('en', 'continent', d.continent)}.`);
      p.push(`Scientists estimate it was about ${num('en', d.length)} ${d.length === 1 ? 'metre' : 'metres'} long and weighed around ${num('en', d.weight)} kg — ${weightCompare('en', d.weight)}.`);
      const fl = PERIOD_FLAVOR.en[d.period]; if (fl) p.push(fl);
      const dl = DIET_FLAVOR.en[d.diet]; if (dl) p.push(dl);
      const lr = lengthRank(d.length), wr = weightRank(d.weight);
      p.push(`Among the ${N} dinosaurs in Dinodle, it ranks ${lr === 1 ? 'first (the longest)' : '#' + lr} by length and ${wr === 1 ? 'first (the heaviest)' : '#' + wr} by weight.`);
      if (d.discoverer && d.discoveredYear) p.push(`It was discovered by ${tr('en', 'discoverer', d.discoverer)} in ${d.discoveredYear}, ${YEAR - d.discoveredYear} years ago.`);
      return p;
    },
    compare: 'Compare it with', relatedLine: o => `${tr('en', 'period', o.period)} ${groupSingular('en', o)}`,
    cta: "Play today's Dinodle →", ctaText: 'Can you guess the secret dinosaur of the day from its period, diet, size and continent?',
    secret: "Today's secret dinosaur is never revealed here.",
    wiki: d => `Read more about ${d.genus} on Wikipedia`,
    allDinos: 'All dinosaurs',
    idxTitle: 'All dinosaurs in Dinodle — facts by period | Dinodle',
    idxH1: 'Dinosaur facts',
    idxDesc: n => `Facts about the ${n} dinosaurs in Dinodle, from the Triassic to the Late Cretaceous: size, weight, diet, period and where their fossils were found.`,
    idxIntro: n => `Here are all ${n} dinosaurs you can guess in Dinodle, grouped by geological period from oldest to most recent and sorted alphabetically. Each page gives the dinosaur's size, weight, diet, group and where its fossils were found.`,
    count: n => `${n} dinosaur${n === 1 ? '' : 's'}`,
    langs: 'Languages'
  },
  fr: {
    back: '← Dinodle', home: 'Dinodle', dinosaurs: 'Dinosaures', langName: 'Français',
    pageTitle: d => `${d.name} : taille, régime, période | Dinodle`,
    tagline: d => `un ${groupSingular('fr', d)} ${dietAdj('fr', d)} du ${tr('fr', 'period', d.period)}`,
    metaDesc: d => `${d.name} : un ${groupSingular('fr', d)} ${dietAdj('fr', d)} du ${tr('fr', 'period', d.period)} (il y a ~${d.era} millions d'années), environ ${num('fr', d.length)} m et ${num('fr', d.weight)} kg, trouvé en ${tr('fr', 'continent', d.continent)}.`,
    factsTitle: 'Fiche d’identité', aboutTitle: d => `À propos de ${d.title}`,
    rows: { name: 'Nom scientifique', period: 'Période', diet: 'Régime alimentaire', group: 'Groupe', weight: 'Poids estimé', length: 'Longueur estimée', found: 'Fossiles trouvés en', disc: 'Découvert par' },
    ago: era => `il y a ~${era} millions d’années`,
    disc: d => `${tr('fr', 'discoverer', d.discoverer)} (${d.discoveredYear})`,
    prose: d => {
      const p = [];
      p.push(`${d.name} était un ${groupSingular('fr', d)} ${dietAdj('fr', d)} qui vivait au ${tr('fr', 'period', d.period)}, il y a environ ${d.era} millions d’années. Ses fossiles ont été découverts en ${tr('fr', 'continent', d.continent)}.`);
      p.push(`Les scientifiques estiment qu’il mesurait environ ${num('fr', d.length)} ${d.length < 2 ? 'mètre' : 'mètres'} de long et pesait autour de ${num('fr', d.weight)} kg — ${weightCompare('fr', d.weight)}.`);
      const fl = PERIOD_FLAVOR.fr[d.period]; if (fl) p.push(fl);
      const dl = DIET_FLAVOR.fr[d.diet]; if (dl) p.push(dl);
      const lr = lengthRank(d.length), wr = weightRank(d.weight);
      p.push(`Parmi les ${N} dinosaures de Dinodle, il se classe ${lr === 1 ? 'premier (le plus long)' : lr + 'e'} en longueur et ${wr === 1 ? 'premier (le plus lourd)' : wr + 'e'} en poids.`);
      if (d.discoverer && d.discoveredYear) p.push(`Il a été découvert par ${tr('fr', 'discoverer', d.discoverer)} en ${d.discoveredYear}, il y a ${YEAR - d.discoveredYear} ans.`);
      return p;
    },
    compare: 'Comparer avec', relatedLine: o => `${groupSingular('fr', o)} du ${tr('fr', 'period', o.period)}`,
    cta: 'Jouer au Dinodle du jour →', ctaText: 'Sauras-tu deviner le dinosaure secret du jour grâce à sa période, son régime, sa taille et son continent ?',
    secret: 'Le dinosaure secret du jour n’est jamais révélé ici.',
    wiki: d => `En savoir plus sur ${d.genus} sur Wikipédia`,
    allDinos: 'Tous les dinosaures',
    idxTitle: 'Tous les dinosaures de Dinodle — fiches par période | Dinodle',
    idxH1: 'Fiches des dinosaures',
    idxDesc: n => `Les fiches des ${n} dinosaures de Dinodle, du Trias au Crétacé supérieur : taille, poids, régime, période et lieu de découverte des fossiles.`,
    idxIntro: n => `Voici les ${n} dinosaures que tu peux deviner dans Dinodle, regroupés par période géologique, du plus ancien au plus récent, puis par ordre alphabétique. Chaque fiche indique la taille, le poids, le régime, le groupe et le lieu de découverte des fossiles.`,
    count: n => `${n} dinosaure${n > 1 ? 's' : ''}`,
    langs: 'Langues'
  },
  es: {
    back: '← Dinodle', home: 'Dinodle', dinosaurs: 'Dinosaurios', langName: 'Español',
    pageTitle: d => `${d.name}: tamaño, dieta, periodo | Dinodle`,
    tagline: d => `un ${groupSingular('es', d)} ${dietAdj('es', d)} del ${d.period}`,
    metaDesc: d => `${d.name}: un ${groupSingular('es', d)} ${dietAdj('es', d)} del ${d.period} (hace ~${d.era} millones de años), de unos ${num('es', d.length)} m y ${num('es', d.weight)} kg, hallado en ${d.continent}.`,
    factsTitle: 'Ficha técnica', aboutTitle: d => `Sobre ${d.title}`,
    rows: { name: 'Nombre científico', period: 'Periodo', diet: 'Dieta', group: 'Grupo', weight: 'Peso estimado', length: 'Longitud estimada', found: 'Fósiles hallados en', disc: 'Descubierto por' },
    ago: era => `hace ~${era} millones de años`,
    disc: d => `${d.discoverer} (${d.discoveredYear})`,
    prose: d => {
      const p = [];
      p.push(`${d.name} fue un ${groupSingular('es', d)} ${dietAdj('es', d)} que vivió durante el ${d.period}, hace unos ${d.era} millones de años. Sus fósiles se han encontrado en ${d.continent}.`);
      p.push(`Los científicos estiman que medía unos ${num('es', d.length)} ${d.length === 1 ? 'metro' : 'metros'} de largo y pesaba alrededor de ${num('es', d.weight)} kg — ${weightCompare('es', d.weight)}.`);
      const fl = PERIOD_FLAVOR.es[d.period]; if (fl) p.push(fl);
      const dl = DIET_FLAVOR.es[d.diet]; if (dl) p.push(dl);
      const lr = lengthRank(d.length), wr = weightRank(d.weight);
      p.push(`Entre los ${N} dinosaurios de Dinodle, ocupa el ${lr === 1 ? 'primer puesto (el más largo)' : 'puesto ' + lr} en longitud y el ${wr === 1 ? 'primer puesto (el más pesado)' : 'puesto ' + wr} en peso.`);
      if (d.discoverer && d.discoveredYear) p.push(`Fue descubierto por ${d.discoverer} en ${d.discoveredYear}, hace ${YEAR - d.discoveredYear} años.`);
      return p;
    },
    compare: 'Compáralo con', relatedLine: o => `${groupSingular('es', o)} del ${o.period}`,
    cta: 'Jugar al Dinodle de hoy →', ctaText: '¿Adivinarás el dinosaurio secreto del día por su periodo, dieta, tamaño y continente?',
    secret: 'El dinosaurio secreto del día nunca se revela aquí.',
    wiki: d => `Más sobre ${d.genus} en Wikipedia`,
    allDinos: 'Todos los dinosaurios',
    idxTitle: 'Todos los dinosaurios de Dinodle — fichas por periodo | Dinodle',
    idxH1: 'Fichas de dinosaurios',
    idxDesc: n => `Fichas de los ${n} dinosaurios de Dinodle, del Triásico al Cretácico tardío: tamaño, peso, dieta, periodo y dónde se hallaron sus fósiles.`,
    idxIntro: n => `Estos son los ${n} dinosaurios que puedes adivinar en Dinodle, agrupados por periodo geológico del más antiguo al más reciente y por orden alfabético. Cada ficha indica su tamaño, peso, dieta, grupo y dónde se hallaron sus fósiles.`,
    count: n => `${n} dinosaurio${n === 1 ? '' : 's'}`,
    langs: 'Idiomas'
  }
};

function aOrAn(word) { return /^[aeiou]/i.test(word || '') ? 'an' : 'a'; }
function dietAdj(lang, d) {
  const M = {
    en: { 'Carnívoro': 'carnivorous', 'Herbívoro': 'herbivorous', 'Omnívoro': 'omnivorous', 'Piscívoro': 'fish-eating', 'Insectívoro': 'insect-eating' },
    fr: { 'Carnívoro': 'carnivore', 'Herbívoro': 'herbivore', 'Omnívoro': 'omnivore', 'Piscívoro': 'piscivore', 'Insectívoro': 'insectivore' },
    es: { 'Carnívoro': 'carnívoro', 'Herbívoro': 'herbívoro', 'Omnívoro': 'omnívoro', 'Piscívoro': 'piscívoro', 'Insectívoro': 'insectívoro' }
  };
  return M[lang][d.diet] || lcFirst(tr(lang, 'diet', d.diet));
}
function weightCompare(lang, kg) {
  const r = v => (v < 10 ? Math.round(v * 10) / 10 : Math.round(v));
  const pl = v => r(v) !== 1;
  const n = (v) => num(lang, v < 10 ? Math.round(v * 10) / 10 : Math.round(v));
  const W = {
    en: [[6000, x => `about as heavy as ${n(x)} African elephant${pl(x) ? 's' : ''}`],
      [1500, x => `roughly the weight of ${n(x)} car${pl(x) ? 's' : ''}`],
      [70, x => `about ${n(x)} times the weight of an adult human`],
      [0, () => kg >= 30 ? 'a little lighter than an adult human' : kg >= 5 ? 'about the weight of a medium-sized dog' : 'lighter than a house cat']],
    fr: [[6000, x => `à peu près le poids de ${n(x)} éléphant${x >= 2 ? 's' : ''} d’Afrique`],
      [1500, x => `environ le poids de ${n(x)} voiture${x >= 2 ? 's' : ''}`],
      [70, x => `environ ${n(x)} fois le poids d’un humain adulte`],
      [0, () => kg >= 30 ? 'un peu moins qu’un humain adulte' : kg >= 5 ? 'à peu près le poids d’un chien moyen' : 'moins qu’un chat domestique']],
    es: [[6000, x => `más o menos lo que ${n(x)} elefante${pl(x) ? 's' : ''} africano${pl(x) ? 's' : ''}`],
      [1500, x => `aproximadamente el peso de ${n(x)} coche${pl(x) ? 's' : ''}`],
      [70, x => `unas ${n(x)} veces el peso de un humano adulto`],
      [0, () => kg >= 30 ? 'algo menos que un humano adulto' : kg >= 5 ? 'más o menos lo que un perro mediano' : 'menos que un gato doméstico']]
  };
  const ref = { 6000: 6000, 1500: 1500, 70: 70, 0: 1 };
  const hit = W[lang].find(([min]) => kg >= min) || W[lang][W[lang].length - 1];
  return hit[1](kg / ref[hit[0]]);
}
const PERIOD_FLAVOR = {
  en: {
    'Triásico tardío': 'The Late Triassic was the dawn of the dinosaurs: they were still small to medium-sized and shared the world with many other reptiles.',
    'Jurásico temprano': 'In the Early Jurassic, dinosaurs became the dominant land animals after a mass extinction at the end of the Triassic.',
    'Jurásico medio': 'The Middle Jurassic is a poorly known time, when big sauropods and early large theropods were spreading across the continents.',
    'Jurásico tardío': 'The Late Jurassic was the age of giant sauropods, when the supercontinent Pangaea was breaking apart.',
    'Cretácico temprano': 'In the Early Cretaceous, the first flowering plants appeared and the continents kept drifting apart.',
    'Cretácico medio': 'The mid-Cretaceous was a warm time with high sea levels, home to some of the largest predators and sauropods ever.',
    'Cretácico tardío': 'The Late Cretaceous was the last chapter of the age of dinosaurs, which ended with an asteroid impact about 66 million years ago.'
  },
  fr: {
    'Triásico tardío': 'Le Trias supérieur marque l’aube des dinosaures : ils étaient encore de taille petite à moyenne et partageaient le monde avec de nombreux autres reptiles.',
    'Jurásico temprano': 'Au Jurassique inférieur, les dinosaures sont devenus les animaux terrestres dominants après une extinction de masse à la fin du Trias.',
    'Jurásico medio': 'Le Jurassique moyen est une époque mal connue, où les grands sauropodes et les premiers grands théropodes se répandaient sur les continents.',
    'Jurásico tardío': 'Le Jurassique supérieur est l’âge des sauropodes géants, alors que le supercontinent Pangée se fragmentait.',
    'Cretácico temprano': 'Au Crétacé inférieur, les premières plantes à fleurs sont apparues et les continents ont continué à s’éloigner.',
    'Cretácico medio': 'Le Crétacé moyen était une période chaude aux mers hautes, peuplée de certains des plus grands prédateurs et sauropodes de l’histoire.',
    'Cretácico tardío': 'Le Crétacé supérieur est le dernier chapitre de l’ère des dinosaures, qui s’est achevée avec la chute d’un astéroïde il y a environ 66 millions d’années.'
  },
  es: {
    'Triásico tardío': 'El Triásico tardío fue el amanecer de los dinosaurios: aún eran de tamaño pequeño o mediano y compartían el mundo con muchos otros reptiles.',
    'Jurásico temprano': 'En el Jurásico temprano los dinosaurios se convirtieron en los animales terrestres dominantes tras una extinción masiva a finales del Triásico.',
    'Jurásico medio': 'El Jurásico medio es una época poco conocida en la que los grandes saurópodos y los primeros grandes terópodos se extendían por los continentes.',
    'Jurásico tardío': 'El Jurásico tardío fue la época de los saurópodos gigantes, mientras el supercontinente Pangea se fragmentaba.',
    'Cretácico temprano': 'En el Cretácico temprano aparecieron las primeras plantas con flores y los continentes siguieron separándose.',
    'Cretácico medio': 'El Cretácico medio fue una época cálida con mares altos, hogar de algunos de los mayores depredadores y saurópodos de la historia.',
    'Cretácico tardío': 'El Cretácico tardío fue el último capítulo de la era de los dinosaurios, que terminó con el impacto de un asteroide hace unos 66 millones de años.'
  }
};
const DIET_FLAVOR = {
  en: { 'Carnívoro': 'As a meat-eater, it hunted or scavenged other animals.', 'Herbívoro': 'As a plant-eater, it fed on the ferns, conifers and other vegetation of its time.', 'Omnívoro': 'As an omnivore, it could eat both plants and small animals.' },
  fr: { 'Carnívoro': 'Carnivore, il chassait ou charognait d’autres animaux.', 'Herbívoro': 'Herbivore, il se nourrissait de fougères, de conifères et d’autres végétaux de son époque.', 'Omnívoro': 'Omnivore, il pouvait manger aussi bien des plantes que de petits animaux.' },
  es: { 'Carnívoro': 'Como carnívoro, cazaba o carroñeaba a otros animales.', 'Herbívoro': 'Como herbívoro, se alimentaba de helechos, coníferas y otras plantas de su época.', 'Omnívoro': 'Como omnívoro, podía comer tanto plantas como pequeños animales.' }
};

// ---------- shared page shell ----------
const PAGE_CSS = `<style>
.doc h1{font-size:clamp(24px,5vw,34px);line-height:1.2;margin:4px 0 14px}
.doc .lead{font-size:18px}
.facts{width:100%;border-collapse:collapse;margin:8px 0 6px;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.facts th,.facts td{text-align:left;padding:9px 14px;border-bottom:1px solid var(--line);vertical-align:top}
.facts tr:last-child th,.facts tr:last-child td{border-bottom:0}
.facts th{width:42%;color:var(--muted);font-weight:600}
.cta-box{margin:28px 0;padding:20px;border:1px solid var(--line);border-radius:14px;background:var(--panel);text-align:center}
.cta-box p{margin:0 0 12px}
.doc a.cta{display:inline-block;background:var(--accent);color:#04140a;font-weight:800;font-size:18px;padding:12px 22px;border-radius:12px;text-decoration:none}
.doc a.cta:hover{filter:brightness(1.1)}
.secret-note{color:var(--muted);font-size:14px}
.related{padding-left:20px}
.related li{margin:4px 0}
.related small,.dino-list small{color:var(--muted)}
.dino-list{columns:2 260px;padding-left:20px}
.dino-list li{break-inside:avoid;margin:3px 0}
.lang-links{margin-left:auto;display:flex;gap:10px}
.crumbs{font-size:14px;color:var(--muted);margin:0 0 6px}
.faq dt{font-weight:700;margin-top:18px}
.faq dd{margin:4px 0 0}
</style>`;

function langLinks(lang, alts) {
  return '<span class="lang-links">' + LANGS.map(l => l === lang
    ? `<b>${l.toUpperCase()}</b>`
    : `<a href="${esc(alts[l].replace(SITE, ''))}" hreflang="${l}" lang="${l}" title="${esc(T[l].langName)}">${l.toUpperCase()}</a>`).join('') + '</span>';
}

function shell({ lang, title, desc, canonical, alts, ogType, ld, body }) {
  const altTags = alts
    ? LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${esc(alts[l])}">`).join('\n') +
      `\n<link rel="alternate" hreflang="x-default" href="${esc(alts.en)}">`
    : `<link rel="alternate" hreflang="en" href="${esc(canonical)}">\n<link rel="alternate" hreflang="x-default" href="${esc(canonical)}">`;
  const ogLocale = { en: 'en_US', fr: 'fr_FR', es: 'es_ES' }[lang];
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(canonical)}">
${altTags}
<meta property="og:site_name" content="Dinodle">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:type" content="${ogType || 'website'}">
<meta property="og:locale" content="${ogLocale}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🦕%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/themes.css">
${PAGE_CSS}
${ld.map(jsonLd).join('\n')}
</head>
<body class="page">
  <nav class="topbar">
    <a href="/" data-set-lang="${lang}">${esc(T[lang].back)}</a>
    ${alts ? langLinks(lang, alts) : ''}
  </nav>
  <main class="doc">
${body}
  </main>
  <footer class="site-foot" id="site-foot"></footer>
  <script src="/config.js"></script>
  <script src="/theme.js"></script>
  <script src="/footer.js"></script>
  <script>
  // The game reads its language from localStorage: open it in this page's language.
  document.querySelectorAll('a[data-set-lang]').forEach(function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem('dinodle_lang_v1', a.getAttribute('data-set-lang')); } catch (e) {} });
  });
  </script>
  ${CF_BEACON}
</body>
</html>
`;
}

const breadcrumbLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: it[1] }))
});
const ctaBox = lang => `    <div class="cta-box">
      <p>${esc(T[lang].ctaText)}</p>
      <a class="cta" href="/" data-set-lang="${lang}">${esc(T[lang].cta)}</a>
      <p class="secret-note" style="margin:12px 0 0">${esc(T[lang].secret)}</p>
    </div>`;

// ---------- dinosaur page ----------
function dinoPage(lang, d) {
  const t = T[lang];
  const alts = {}; LANGS.forEach(l => { alts[l] = pageUrl(l, d); });
  const tagline = t.tagline(d);
  const h1 = `${d.title} — ${tagline}`;
  const desc = description(lang, d);
  const rows = [
    [t.rows.name, `<i>${esc(d.name)}</i>`],
    [t.rows.period, `${esc(tr(lang, 'period', d.period))} (${esc(t.ago(d.era))})`],
    [t.rows.diet, esc(tr(lang, 'diet', d.diet))],
    [t.rows.group, esc(tr(lang, 'tipo', d.tipo))],
    [t.rows.weight, `${esc(num(lang, d.weight))} kg`],
    [t.rows.length, `${esc(num(lang, d.length))} m`],
    [t.rows.found, esc(tr(lang, 'continent', d.continent))]
  ];
  if (d.discoverer) rows.push([t.rows.disc, esc(t.disc(d))]);
  const rel = related(d);
  const crumbs = [[t.home, SITE + '/'], [t.dinosaurs, indexUrl(lang)], [d.title, pageUrl(lang, d)]];
  const metaDesc = t.metaDesc(d);
  const body = `    <p class="crumbs"><a href="/" data-set-lang="${lang}">${esc(t.home)}</a> › <a href="/${DIR[lang]}/">${esc(t.dinosaurs)}</a> › ${esc(d.title)}</p>
    <h1>${esc(h1)}</h1>
${desc ? `    <p class="lead">${esc(desc)}</p>\n` : ''}    <h2>${esc(t.factsTitle)}</h2>
    <table class="facts">
${rows.map(r => `      <tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}
    </table>
    <h2>${esc(t.aboutTitle(d))}</h2>
    <p>${t.prose(d).map(esc).join(' ')}</p>
${rel.length ? `    <h2>${esc(t.compare)}</h2>
    <ul class="related">
${rel.map(o => `      <li><a href="/${DIR[lang]}/${o.slug}.html">${esc(o.title)}</a> <small>— ${esc(t.relatedLine(o))}</small></li>`).join('\n')}
    </ul>
` : ''}${ctaBox(lang)}
    <p><a href="${esc(wikiUrl(lang, d))}" rel="noopener" lang="${lang}">${esc(t.wiki(d))}</a> · <a href="/${DIR[lang]}/">${esc(t.allDinos)}</a></p>`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: h1.slice(0, 110), description: metaDesc, inLanguage: lang,
    mainEntityOfPage: pageUrl(lang, d), url: pageUrl(lang, d), image: OG_IMAGE,
    about: { '@type': 'Thing', name: d.name, sameAs: wikiUrl(lang, d) },
    author: { '@type': 'Organization', name: 'Dinodle', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'Dinodle', url: SITE + '/' }
  }, breadcrumbLd(crumbs)];
  return shell({ lang, title: t.pageTitle(d), desc: metaDesc, canonical: pageUrl(lang, d), alts, ogType: 'article', ld, body });
}

// ---------- index page ----------
function indexPage(lang) {
  const t = T[lang];
  const alts = {}; LANGS.forEach(l => { alts[l] = indexUrl(l); });
  const byPeriod = {};
  dinos.forEach(d => { (byPeriod[d.period] = byPeriod[d.period] || []).push(d); });
  const periods = Object.keys(byPeriod).sort((a, b) => {
    const ra = PERIOD_ORDER.indexOf(a), rb = PERIOD_ORDER.indexOf(b);
    return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb) || a.localeCompare(b);
  });
  const coll = new Intl.Collator(LOCALE[lang]);
  const sections = periods.map(p => {
    const list = byPeriod[p].slice().sort((a, b) => coll.compare(a.title, b.title));
    const eras = list.map(d => d.era).filter(Number.isFinite);
    const range = eras.length ? (Math.min(...eras) === Math.max(...eras) ? t.ago(Math.max(...eras)) : t.ago(Math.max(...eras) + '–' + Math.min(...eras))) : '';
    return `    <h2>${esc(tr(lang, 'period', p))} <small class="secret-note">(${esc(range)} · ${esc(t.count(list.length))})</small></h2>
    <ul class="dino-list">
${list.map(d => `      <li><a href="/${DIR[lang]}/${d.slug}.html">${esc(d.title)}</a> <small>— ${esc(groupSingular(lang, d))}, ${esc(dietAdj(lang, d))}</small></li>`).join('\n')}
    </ul>`;
  }).join('\n');
  const body = `    <p class="crumbs"><a href="/" data-set-lang="${lang}">${esc(t.home)}</a> › ${esc(t.dinosaurs)}</p>
    <h1>${esc(t.idxH1)}</h1>
    <p class="lead">${esc(t.idxIntro(N))}</p>
${sections}
${ctaBox(lang)}`;
  const crumbs = [[t.home, SITE + '/'], [t.dinosaurs, indexUrl(lang)]];
  const ld = [{
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.idxH1, description: t.idxDesc(N),
    url: indexUrl(lang), inLanguage: lang, isPartOf: { '@type': 'WebSite', name: 'Dinodle', url: SITE + '/' }
  }, breadcrumbLd(crumbs)];
  return shell({ lang, title: t.idxTitle, desc: t.idxDesc(N), canonical: indexUrl(lang), alts, ld, body });
}

// ---------- FAQ (English) ----------
const FAQ = [
  ['How do I play Dinodle?', 'Type the name of any dinosaur and press Enter. Each guess shows how it compares with the secret dinosaur of the day: period, diet, group, weight, length and continent. Green means a match, yellow means close and grey means no match. Arrows tell you if the secret dinosaur is heavier or longer (↑), lighter or shorter (↓), older (←) or more recent (→). You have 12 attempts.'],
  ['What is the difference between Easy and Normal mode?', `Easy mode only uses the ${dinos.filter(d => d.easy).length} most famous dinosaurs, such as Tyrannosaurus, Triceratops and Stegosaurus, and gives you bones sooner. Normal mode uses all ${N} dinosaurs in the game. Each mode has its own daily puzzle and its own statistics, so you can play both every day.`],
  ['What are bones and clues?', 'You dig up bones 🦴 as you play: at attempts 3, 6 and 9 in Normal mode (2, 4 and 6 in Easy). Each clue costs one bone. Clues reveal who discovered the dinosaur, a short description and, as the very last clue, its silhouette.'],
  ['How is my score calculated?', 'You start with 1000 points. You lose 100 points every 3 attempts and 150 points for each bone you spend on a clue. If you do not find the dinosaur within 12 attempts, the score is 0. Your streak continues as long as you play every day.'],
  ['When does the daily dinosaur change?', 'A new secret dinosaur appears every day at midnight, Paris time (Central European Time), and it is the same for every player in the world. A countdown at the end of the game shows how long until the next one.'],
  ['Which languages is Dinodle available in?', 'Dinodle is available in English, French and Spanish. The game picks your browser language automatically, and you can switch at any time with the language buttons at the top of the game. The dinosaur fact pages also exist in all three languages.'],
  ['How do I share my result?', 'When you finish, press the Share button. It copies a grid of coloured squares with the puzzle number, so your friends can see how you did without the answer being spoiled.'],
  ['Where does the dinosaur information come from?', 'Facts such as period, diet, size and discovery are compiled from public scientific sources and Wikipedia, and rounded to keep the game fair. Size and weight estimates vary between studies. Silhouettes come from PhyloPic artists and are credited on the image credits page.'],
  ['Do I need an account? Is my data stored?', 'No account is needed and Dinodle is free. Your games, statistics and settings are saved only in your own browser (local storage). See the privacy page for details.'],
  ['How can I contact you or suggest a dinosaur?', 'Write to contact@dinodle.app with ideas, bug reports, corrections or dinosaurs you would like to see in the game.']
];
function faqPage() {
  const canonical = SITE + '/faq.html';
  const title = 'Dinodle FAQ — how to play, clues, score and daily reset | Dinodle';
  const desc = 'Answers about Dinodle, the daily dinosaur guessing game: how to play, Easy vs Normal mode, bones and clues, scoring, the midnight reset, languages and sharing.';
  const linkify = s => esc(s).replace('contact@dinodle.app', '<a href="mailto:contact@dinodle.app">contact@dinodle.app</a>')
    .replace('image credits page', '<a href="/credits.html">image credits page</a>')
    .replace('privacy page', '<a href="/privacy.html">privacy page</a>')
    .replace('dinosaur fact pages', '<a href="/dinosaurs/">dinosaur fact pages</a>');
  const body = `    <p class="crumbs"><a href="/" data-set-lang="en">Dinodle</a> › FAQ</p>
    <h1>Frequently asked questions</h1>
    <dl class="faq">
${FAQ.map(q => `      <dt>${esc(q[0])}</dt>\n      <dd>${linkify(q[1])}</dd>`).join('\n')}
    </dl>
${ctaBox('en')}`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'FAQPage', url: canonical, inLanguage: 'en',
    mainEntity: FAQ.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } }))
  }, breadcrumbLd([['Dinodle', SITE + '/'], ['FAQ', canonical]])];
  return shell({ lang: 'en', title, desc, canonical, alts: null, ld, body });
}

// ---------- sitemap ----------
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const u = (loc, freq, prio, alts) => `  <url><loc>${xmlEsc(loc)}</loc>` +
    (alts ? LANGS.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${xmlEsc(alts[l])}"/>`).join('') +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEsc(alts.en)}"/>` : '') +
    `<lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`;
  const lines = [
    u(SITE + '/', 'daily', '1.0'),
    u(SITE + '/?mode=easy', 'daily', '0.8'),
    u(SITE + '/faq.html', 'monthly', '0.6'),
    u(SITE + '/about.html', 'monthly', '0.5'),
    u(SITE + '/contact.html', 'yearly', '0.3'),
    u(SITE + '/privacy.html', 'yearly', '0.3'),
    u(SITE + '/credits.html', 'monthly', '0.3')
  ];
  const idxAlts = {}; LANGS.forEach(l => { idxAlts[l] = indexUrl(l); });
  LANGS.forEach(l => lines.push(u(indexUrl(l), 'weekly', '0.7', idxAlts)));
  dinos.forEach(d => {
    const alts = {}; LANGS.forEach(l => { alts[l] = pageUrl(l, d); });
    LANGS.forEach(l => lines.push(u(alts[l], 'monthly', '0.6', alts)));
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${lines.join('\n')}
</urlset>
`;
}

// ---------- write everything ----------
function write(rel, content) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content, 'utf8');
}
let count = 0;
LANGS.forEach(lang => {
  const dir = path.join(ROOT, DIR[lang]);
  if (fs.existsSync(dir)) fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => fs.unlinkSync(path.join(dir, f)));
  dinos.forEach(d => { write(`${DIR[lang]}/${d.slug}.html`, dinoPage(lang, d)); count++; });
  write(`${DIR[lang]}/index.html`, indexPage(lang)); count++;
});
write('faq.html', faqPage()); count++;
write('sitemap.xml', sitemap());

console.log(`Dinodle pages: ${N} dinosaurs x 3 languages + 3 indexes + FAQ = ${count} HTML pages, plus sitemap.xml (${7 + 3 + N * 3} URLs).`);
['en', 'fr'].forEach(l => {
  if (missing[l].length) console.warn(`Warning: ${missing[l].length} dinosaur(s) have no ${l.toUpperCase()} description in data/i18n/dinos.${l}.json (description omitted): ${missing[l].join(', ')}`);
});
const untranslated = [];
['en', 'fr'].forEach(l => dinos.forEach(d => ['period', 'diet', 'tipo', 'continent'].forEach(f => {
  if (d[f] != null && tr(l, f, d[f]) === d[f] && !/^(Asia|Europa)$/.test(d[f])) untranslated.push(`${l}:${f}=${d[f]}`);
})));
if (untranslated.length) console.warn('Warning: untranslated field values (shown in Spanish): ' + [...new Set(untranslated)].join(', '));

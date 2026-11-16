# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

DinosauresWOrdle is a static, client-side daily guessing game ("Wordle"-style) with two modes:

- **Dinos** (`dinos.html`) — guess the daily dinosaur by comparing attributes (period, diet, type, weight, length, continent, …).
- **DC** (`dc.html`) — guess the daily DC Comics character (gender, alignment, first appearance, team, powers, city, …).

`index.html` is the landing page linking to both modes. There is no build step, framework, or backend.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Home / mode selector |
| `dinos.html` + `dinos.js` | Dino mode page and its config (attributes, compare rules) |
| `engine.js` | Game engine used by the Dino mode (`createGame`) |
| `dc.html` + `dc.js` | DC mode page and its config |
| `engine-dc.js` | Newer engine used by the DC mode (adds language toggle ES/EN/FR, points system) |
| `data/dinos.json`, `data/dc.json` | Game data: one object per entry with `name`, `aliases` and attribute fields |
| `styles.css` | Shared styles |

## Key behaviors

- **Daily target**: `Math.floor(Date.now() / 86400000) % data.length` — the index into the JSON array. Reordering or inserting entries changes which item is picked on a given day.
- **Persistence**: everything is in `localStorage` (no accounts). Stats key `wordle_stats_v5` is shared by both modes; per-mode daily state uses its own `storageKey`; language uses `wordle_lang_v7`. Bump the version suffix if the stored shape changes.
- **Images**: fetched at runtime from the Wikipedia REST summary API (`/api/rest_v1/page/summary/`), falling back across languages.
- **Input matching**: guesses are normalized (lowercase, accents stripped) and matched against `name` and `aliases`.

## Conventions

- Plain ES5/ES2015-style JavaScript in IIFEs; no modules, no dependencies.
- UI text and data values are primarily in Spanish; DC mode supports ES/EN/FR translations in `engine-dc.js`.
- When adding entries to the JSON files, include every attribute field the mode's config compares, plus `aliases`, so comparisons don't break.
- Keep the two engines in sync when fixing shared logic (stats, normalization, image fetching).

## Running locally

The pages load JSON with `fetch`, so open them through a local HTTP server rather than `file://`, e.g.:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

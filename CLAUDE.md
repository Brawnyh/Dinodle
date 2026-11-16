# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

**Dinodle** is a static, client-side daily guessing game ("-dle" style): guess the dinosaur of the day by comparing attributes (period, diet, type, weight, length, continent). There is no build step, framework, or backend.

The superhero / "guess the character" game used to live here as a DC mode. It now lives in its own repository (`C:\Users\Deme\guess-the-character`, github.com/Brawnyh/guessTheCharacter). Don't add it back here.

Owner priorities: Dinodle first. Make it presentable, English-first (with French and Spanish), then AdSense-ready (privacy/about/contact pages, Google's consent banner, own domain), then monetize.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | The game page (home) with the Normal/Easy switch |
| `i18n.js` | UI strings EN/FR/ES, language detection/switch, `localize()` for data |
| `dinos.js` | Game config: attributes, compare rules, hints, Easy-mode filter |
| `data/i18n/dinos.{en,fr}.json` | Data translations: `fields` value maps + `description` by name (data source language is Spanish) |
| `img/silhouettes/`, `data/silhouette-credits.json`, `credits.html` | Self-hosted PhyloPic silhouettes (CC0/PD/CC BY, a few CC BY-SA; never NC) with per-image credits |
| `engine.js` | Game engine (`createGame`): board, autocomplete, hints, stats, images, countdown |
| `data/dinos.json` | One object per dinosaur: `name`, `aliases`, attribute fields; `"easy": true` marks the 25 Easy-mode dinos |
| `styles.css` | Styles |

## Key behaviors

- **Daily reset: midnight Europe/Madrid** for every player (`dayNumber()` in `engine.js`). Target = `dayNumber() % data.length`, so reordering or inserting entries changes which dino is picked on a given day.
- **Easy mode** (`?mode=easy`): only entries with `"easy": true`, with its own daily puzzle (`dino-easy-daily-v1`) and stats (`dinoEasy`).
- **Persistence**: all in `localStorage` (no accounts). Stats key `wordle_stats_v5` (`dino`, `dinoEasy`); a streak only continues if the last game was yesterday. Bump a key's version suffix if its stored shape changes. Always go through `safeGet`/`safeSet` (storage can be blocked).
- **Images**: fetched from the Wikipedia REST summary API. Wikimedia only serves standard thumbnail widths (250/330/500/960); other widths return HTTP 400. Found URLs are cached in `dinodle_img_cache_v1`. Planned: self-hosted free-licence silhouettes with a credits page (`imageUrl`/`silhouetteUrl` fields are already supported).
- **Languages**: English first; saved choice (`dinodle_lang_v1`), else browser language, else English. UI text lives in `i18n.js` — never hardcode strings in `engine.js`/`dinos.js`. When adding a dinosaur or a new Spanish field value, add its EN and FR entries to `data/i18n/`.
- **Silhouette hint**: uses `data/silhouette-credits.json`; 7 dinos have no commercially usable silhouette and fall back to a darkened Wikipedia photo.
- **Reveal popup** shows every time a finished game is reopened (intended).
- **Input matching**: guesses are normalized (lowercase, accents stripped) and matched against `name` and `aliases`.

## Conventions

- Plain ES5/ES2015-style JavaScript; no modules, no dependencies.
- When adding dinosaurs, include every attribute field `dinos.js` compares, plus `aliases`.
- Never use "Wordle" in names or titles (NYT trademark).

## Running locally

The page loads JSON with `fetch`, so serve it over HTTP rather than `file://`:

```bash
py -m http.server 8000
```

(On this Windows machine `python` is the Microsoft Store stub; use the `py` launcher.)

Then visit http://localhost:8000 (Easy mode: http://localhost:8000/?mode=easy).

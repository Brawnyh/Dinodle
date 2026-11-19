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
| `data/i18n/dinos.{en,fr,pt,de,it}.json` | Data translations: `fields` value maps + `description` by name (data source language is Spanish) |
| `img/silhouettes/`, `data/silhouette-credits.json`, `credits.html` | Self-hosted PhyloPic silhouettes (CC0/PD/CC BY, a few CC BY-SA; never NC) with per-image credits |
| `engine.js` | Game engine (`createGame`): board, autocomplete, hints, stats, images, countdown |
| `data/dinos.json` | One object per dinosaur: `name`, `aliases`, attribute fields; `"easy": true` marks the 25 Easy-mode dinos |
| `styles.css` | Styles |

## Key behaviors

- **Daily reset: midnight Europe/Madrid** for every player (`dayNumber()` in `engine.js`). Target = `dayNumber() % data.length`, so reordering or inserting entries changes which dino is picked on a given day.
- **Easy mode** (`?mode=easy`): only entries with `"easy": true`, with its own daily puzzle (`dino-easy-daily-v2`) and stats (`dinoEasy`). Normal saves to `dino-daily-v6`.
- **Persistence**: all in `localStorage` (no accounts). Stats key `wordle_stats_v5` (`dino`, `dinoEasy`); a streak only continues if the last game was yesterday. Bump a key's version suffix if its stored shape changes. Always go through `safeGet`/`safeSet` (storage can be blocked).
- **Images**: fetched from the Wikipedia REST summary API. Wikimedia only serves standard thumbnail widths (250/330/500/960); other widths return HTTP 400. Found URLs are cached in `dinodle_img_cache_v1`. Planned: self-hosted free-licence silhouettes with a credits page (`imageUrl`/`silhouetteUrl` fields are already supported).
- **Languages**: EN, FR, ES, PT (pt-BR), DE, IT. English first; saved choice (`dinodle_lang_v1`), else browser language, else English. UI text lives in `i18n.js` — never hardcode strings in `engine.js`/`dinos.js`. When adding a dinosaur or a new Spanish field value, add its EN, FR, PT, DE and IT entries to `data/i18n/`.
- **Silhouette hint**: uses `data/silhouette-credits.json` (120 of 155 dinos); the rest fall back to a darkened Wikipedia photo. Only full-body silhouettes: skull-only or head-only drawings make useless clues (check new ones on a contact sheet).
- **Clues cost bones 🦴** (tokens): earned at attempts 3/6/9 (Easy 2/4/6), 12 attempts max; 1 bone per clue; the silhouette (`requires`, `last`) is the last clue. Score = 1000 − 100 per 3 attempts − 150 per bone; loss = 0. History per mode (`dino-history-v1`, `dino-easy-history-v1`). Don't use 🪙 or ⏪⬆️ emoji: they don't render on Windows 10.
- **Rules**: neighbouring period = yellow with ←/→ (earlier/later, via `periodRank`); omnivore vs carnivore/herbivore = yellow.
- **Share**: emoji grid with puzzle number (`puzzleNumber()`, #1 = 2026-11-16).
- **Credits page** only shows silhouettes of dinosaurs the player has finished (`dinodle_solved_v1`), so it can't be used to cheat.
- **Themes**: `theme.js` + `themes.css`. Default **jungle**, which turns volcanic as attempts are used (`--doom` 0→1 from the `dinodle:progress` event; `doom-2`, `doom-3`, `extinct` classes) and drops a meteorite on a loss (`dinodle:lose`). Never put `filter`/`transform` on `body`: it breaks the fixed result panel. Other themes (`classic`, `fossil`, `volcano`) via `?theme=`.
- **Ads**: `ads.js` (publisher ID and slot IDs go there). Gentle layout (marketing advice): one in-content unit ≥150px below the game, optional desktop-only top banner, no side rails, Auto ads off (no vignettes/anchors). Slots stay hidden until ads are on; `?ads=preview` shows placeholders. Donation links: `SUPPORT_LINKS` in `config.js` (PayPal.me now, Ko-fi later; buttons after the game and in the footer; empty urls hidden).
- **Sharing**: result screen has copy/share plus X, Bluesky, Reddit, WhatsApp and Facebook links (text only, never the answer). "Challenge a friend" shares a link `?vs=<tries, 0 = lost>&p=<puzzle #>`: the friend sees a banner and, after playing, who won (ignored on other days). "Image" draws a 1080×1080 result card on a canvas (no emoji) and shares it on mobile or downloads it on desktop. `og-image.png` (1200×630), `manifest.webmanifest` + `icon-192/512.png`, `apple-touch-icon.png` make it installable.
- **Streamer mode** (`streamer.js`, `?streamer=1`, toggle button in the top bar): bigger view, no ads/stats/help, "play along at dinodle.app · Puzzle #N" bar. Twitch chat voting: anonymous read-only IRC websocket (`justinfanNNNNN`, never writes to chat); viewers type `!dino <name>` (one vote per viewer per round, last one counts); every 20–60 s the top-voted dinosaur is guessed through `window.DinodleGame` (small API exposed by `engine.js`: `guess`, `find`, `newPractice`, `isOver`, `isPractice`, `guessed`, `puzzleNumber`). Default target is a random (practice) dinosaur so viewers who already played can't spoil it. Kick/YouTube chat not supported (no browser-friendly anonymous chat API).
- **Analytics**: Cloudflare Web Analytics snippet before `</body>` on every page (cookieless; mentioned in privacy.html). Add it to any new page.
- **155 dinosaurs** (25 tagged Easy). Multiple discoverers are joined with " & " (language-neutral). Adding entries changes which dinosaur falls on each day.
- **SEO pages**: `node tools/build-pages.js` generates `dinosaurs/`, `fr/dinosaures/`, `es/dinosaurios/`, `pt/dinossauros/`, `de/dinosaurier/`, `it/dinosauri/` (one page per dinosaur + index, 937 pages), `faq.html` and `sitemap.xml` (942 URLs; game URLs with `?mode=`, `?vs=` or `?streamer=` stay out, since they canonicalize to `/`). **Re-run it after any data change.** These pages never show silhouettes or photos (no spoilers).
- **Private notes**: `marketing/` (outreach list, email templates) is git-ignored.
- **Pages**: `about.html`, `contact.html`, `privacy.html`, `credits.html`; shared footer from `footer.js`. Contact: contact@dinodle.app. Domain: dinodle.app (`CNAME`).
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

# Quickeys — the quick piano

A fast, free online piano for finding notes, chords and scales: https://quickeys.app

- **Play**: mouse (with glissando), multi-touch or computer keyboard (mapped by physical key position).
  <kbd>Space</kbd> sustain, <kbd>←</kbd>/<kbd>→</kbd> octave, <kbd>/</kbd> search, <kbd>Esc</kbd> clear.
- **Find**: type `Am7`, `F# minor scale`, `Do mayor` or `C4` and it lights up and plays. Deep links: `/?q=Cmaj7`.
- **Learn**: play notes and the chord or interval is named instantly, inversions included.
- **Reference**: 300 chord pages (`/chords/a-minor-7`), 144 scale pages (`/scales/d-dorian`), note frequencies.
- Accent colours, light/dark theme, English or solfège names; settings saved in the browser.

## SEO and agents

Every route is prerendered to static HTML at build time (`scripts/prerender.js`) with its own title,
description, canonical URL, Open Graph tags and JSON-LD (WebApplication, BreadcrumbList, FAQPage,
DefinedTerm). The build also writes `sitemap.xml`, `llms.txt`, `llms-full.txt` and JSON data in `/api/`.

## Development

```sh
npm install
npm run dev      # dev server (client-rendered)
npm run build    # client + SSR build, then prerender every page into build/
npm run preview  # serve build/ like production (clean URLs, 404 page)
npm test         # Vitest
npm run lint
npm run deploy   # lint, test and deploy to Vercel (pushes to main also deploy)
```

Built with React 19, React Router 7, Vite, Tailwind CSS and the Web Audio API.

- `src/music/` — notes, keymap and music theory (spelling, chords, scales, recognition, search)
- `src/audio/engine.js` — sample playback
- `src/state/` — pressed notes store and persisted settings
- `src/components/piano/` — the keyboard, the quick piano card and search
- `src/pages/` — routes; `src/seo/head.jsx` — per-page head tags

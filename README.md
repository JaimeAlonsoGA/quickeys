# MusicKeyboard.io

A free, minimalist online piano: https://musickeyboard.web.app

- 72 keys (C2–B7) with recorded piano samples, played through the Web Audio API
- Mouse (with glissando), multi-touch and computer keyboard input, mapped by physical key position
- Sustain pedal (hold <kbd>Space</kbd>), octave shift (<kbd>←</kbd>/<kbd>→</kbd>)
- Chord and interval detection in every key and inversion, English or solfège notation
- Color themes, zoom, volume; settings saved in the browser
- Note frequency chart (`/freqchart`) and privacy policy (`/privacy`)

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # unit + integration tests (Vitest)
npm run lint
npm run build    # production build in build/
npm run deploy   # lint, test, build and deploy to Firebase Hosting
```

Built with React 19, Vite and Tailwind CSS. The privacy policy lives in
`src/pages/Privacy.jsx`.

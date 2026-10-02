/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { notes } from './music/notes';
import { CHORDS, SCALES, chordPath, scalePath } from './music/theory';
import { HeadCollector, headToHtml } from './seo/head';

export { CHORDS, SCALES, notes, chordPath, scalePath };

/** Every indexable URL. */
export const ROUTES = [
  '/',
  '/chords',
  ...CHORDS.map(chordPath),
  '/scales',
  ...SCALES.map(scalePath),
  '/frequency-chart',
  '/privacy',
];

export function render(url) {
  const head = {};
  const html = renderToString(
    <StrictMode>
      <HeadCollector value={head}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadCollector>
    </StrictMode>,
  );
  return { html, head: headToHtml(head) };
}

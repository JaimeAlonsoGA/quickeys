// Renders every route to static HTML (for search engines, link previews and
// agents) and writes the sitemap, llms.txt and the JSON data files.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build');
const ssrDir = join(root, 'build-ssr');
const SITE = 'https://quickeys.app';

const { render, ROUTES, CHORDS, SCALES, notes, chordPath, scalePath } = await import(
  pathToFileURL(join(ssrDir, 'entry-server.js')).href
);
const template = readFileSync(join(out, 'index.html'), 'utf8');

const write = (file, content) => {
  const target = join(out, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};

const page = (url) => {
  const { html, head } = render(url);
  return template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);
};

// Pages: "/" → index.html, "/chords/c-major" → chords/c-major.html (cleanUrls).
for (const url of ROUTES) write(url === '/' ? 'index.html' : `${url.slice(1)}.html`, page(url));
write('404.html', page('/404'));

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const priority = (url) => (url === '/' ? '1.0' : url.split('/').length === 2 ? '0.8' : '0.6');
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((url) => `  <url><loc>${SITE}${url}</loc><lastmod>${today}</lastmod><priority>${priority(url)}</priority></url>`).join('\n')}
</urlset>
`,
);

// Data for agents and developers
const chordData = CHORDS.map((c) => ({
  symbol: c.symbol,
  name: c.name,
  root: c.root.name,
  alias: c.root.alt ? c.root.alt + c.quality.symbol : undefined,
  quality: c.quality.name,
  notes: c.notes.map((n) => n.name),
  intervals: c.notes.map((n) => n.interval),
  midi: c.midis,
  url: SITE + chordPath(c),
}));
const scaleData = SCALES.map((s) => ({
  name: s.name,
  root: s.root.name,
  type: s.scaleType.name,
  notes: s.notes.map((n) => n.name),
  intervals: s.notes.map((n) => n.interval),
  url: SITE + scalePath(s),
}));
const noteData = notes.map((n) => ({ note: `${n.english}${n.octave}`, solfege: `${n.solfege}${n.octave}`, midi: n.midi, frequencyHz: Number(n.frequency.toFixed(2)) }));
write('api/chords.json', JSON.stringify(chordData));
write('api/scales.json', JSON.stringify(scaleData));
write('api/notes.json', JSON.stringify(noteData));

// llms.txt (https://llmstxt.org)
write(
  'llms.txt',
  `# Quickeys

> A quick, free online piano for finding notes, chords and scales. Play it with a mouse, touch or computer keyboard; search any chord or scale to see and hear it; play notes to get the chord named. 72 keys (C2–B7), recorded piano, A4 = 440 Hz.

Every page below is static HTML with the full content. Note names use sharps or the most common flat spelling (C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B).

## Main pages

- [Online piano](${SITE}/): interactive keyboard with chord/scale search and chord recognition. Deep link a chord or scale with \`${SITE}/?q=<query>\`, e.g. \`/?q=Am7\` or \`/?q=D%20dorian%20scale\`.
- [Piano chords chart](${SITE}/chords): ${CHORDS.length} chords (all 12 roots × ${CHORDS.length / 12} types).
- [Piano scales](${SITE}/scales): ${SCALES.length} scales (all 12 roots × ${SCALES.length / 12} types).
- [Note frequency chart](${SITE}/frequency-chart): frequency in Hz of every note from C2 to B7.

## URL patterns

- Chord: \`${SITE}/chords/{root}-{type}\`, root in c, c-sharp, d, e-flat, e, f, f-sharp, g, a-flat, a, b-flat, b; type in ${[...new Set(CHORDS.map((c) => c.slug.replace(`${c.root.slug}-`, '')))].join(', ')}. Example: ${SITE}/chords/a-minor-7
- Scale: \`${SITE}/scales/{root}-{type}\`, type in ${[...new Set(SCALES.map((s) => s.slug.replace(`${s.root.slug}-`, '')))].join(', ')}. Example: ${SITE}/scales/d-dorian

## Data

- [All chords as JSON](${SITE}/api/chords.json): symbol, name, notes, intervals, MIDI numbers, URL.
- [All scales as JSON](${SITE}/api/scales.json)
- [All notes as JSON](${SITE}/api/notes.json): note, solfège name, MIDI number, frequency.
- [Full reference as text](${SITE}/llms-full.txt)

## Optional

- [Privacy policy](${SITE}/privacy)
`,
);

write(
  'llms-full.txt',
  `# Quickeys – full chord and scale reference

## Chords (notes from the root)

${chordData.map((c) => `- ${c.symbol}${c.alias ? ` (${c.alias})` : ''}: ${c.name}: ${c.notes.join(' ')} [${c.intervals.join(' ')}] ${c.url}`).join('\n')}

## Scales

${scaleData.map((s) => `- ${s.name}: ${s.notes.join(' ')} [${s.intervals.join(' ')}] ${s.url}`).join('\n')}

## Note frequencies (A4 = 440 Hz)

${noteData.map((n) => `- ${n.note} (${n.solfege}): ${n.frequencyHz} Hz, MIDI ${n.midi}`).join('\n')}
`,
);

rmSync(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${ROUTES.length + 1} pages, sitemap, llms.txt and data files.`);

import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const OUT_DIR = 'build';

// `vite preview` behaves like Firebase Hosting with cleanUrls: /chords/c-major
// serves build/chords/c-major.html, unknown pages get 404.html.
const cleanUrls = () => ({
  name: 'clean-urls',
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const [path, query = ''] = req.url.split('?');
      if (path === '/' || extname(path)) return next();
      const file = join(OUT_DIR, `${path.replace(/\/$/, '')}.html`);
      if (existsSync(file)) {
        req.url = `${path.replace(/\/$/, '')}.html${query ? `?${query}` : ''}`;
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(readFileSync(join(OUT_DIR, '404.html')));
        return undefined;
      }
      return next();
    });
  },
});

export default defineConfig({
  plugins: [react(), cleanUrls()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  build: {
    // Firebase Hosting serves this folder (see firebase.json).
    outDir: OUT_DIR,
    // Keep note samples as separate cacheable files instead of inlining them.
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
});

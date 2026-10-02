import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// Browser APIs jsdom doesn't implement.
window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
});
window.ResizeObserver ??= class {
  observe() {}
  disconnect() {}
};
Element.prototype.scrollTo ??= function scrollTo() {};

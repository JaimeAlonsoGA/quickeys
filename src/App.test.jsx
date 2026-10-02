import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { render as renderPage } from './entry-server';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App', () => {
  it('plays chords from the computer keyboard and names them', () => {
    const { container } = renderAt('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The quick piano');
    expect(container.querySelectorAll('[data-note]')).toHaveLength(72);

    act(() => {
      ['KeyQ', 'KeyE', 'KeyT'].forEach((code) => fireEvent.keyDown(window, { code }));
    });
    expect(screen.getByRole('button', { name: 'C4' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('C major', { selector: '[aria-live] span' })).toBeInTheDocument();

    act(() => {
      ['KeyQ', 'KeyE', 'KeyT'].forEach((code) => fireEvent.keyUp(window, { code }));
    });
    expect(screen.getByRole('button', { name: 'C4' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('finds a chord from the search box', () => {
    renderAt('/');
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Am7' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('A minor 7th chord')).toBeInTheDocument();
  });

  it('renders chord and scale pages', () => {
    renderAt('/chords/e-flat-minor');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ebm chord');
    expect(screen.getAllByText('Gb').length).toBeGreaterThan(0);
  });

  it('shows a 404 for unknown chords', () => {
    renderAt('/chords/h-major');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This key doesn’t exist');
  });
});

describe('prerendering', () => {
  it('renders a page with its head tags', () => {
    const { html, head } = renderPage('/scales/d-dorian');
    expect(head).toContain('<title data-head>D Dorian Scale on Piano');
    expect(head).toContain('rel="canonical" href="https://musickeyboard.web.app/scales/d-dorian"');
    expect(head).toContain('"@type":"FAQPage"');
    expect(html).toContain('D Dorian');
  });
});

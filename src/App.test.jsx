import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the piano and plays notes from the computer keyboard', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'MusicKeyboard.io' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^[A-G]#?\d$/ })).toHaveLength(72);

    act(() => {
      fireEvent.keyDown(window, { code: 'KeyQ' });
      fireEvent.keyDown(window, { code: 'KeyE' });
      fireEvent.keyDown(window, { code: 'KeyT' });
    });
    expect(screen.getByRole('button', { name: 'C4' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('DoMaj')).toBeInTheDocument(); // C major chord, in solfège by default

    act(() => {
      fireEvent.keyUp(window, { code: 'KeyQ' });
      fireEvent.keyUp(window, { code: 'KeyE' });
      fireEvent.keyUp(window, { code: 'KeyT' });
    });
    expect(screen.getByRole('button', { name: 'C4' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the frequency chart page on its own', () => {
    window.history.pushState({}, '', '/freqchart');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Frequency Chart' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(73);
    window.history.pushState({}, '', '/');
  });
});

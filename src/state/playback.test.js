import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { audioEngine } from '../audio/engine';
import { pressNote, releaseAll, releaseNote, usePressedNotes } from './playback';

describe('playback store', () => {
  beforeEach(() => {
    releaseAll();
    vi.restoreAllMocks();
  });

  it('keeps a note down until every source releases it', () => {
    const on = vi.spyOn(audioEngine, 'noteOn');
    const off = vi.spyOn(audioEngine, 'noteOff');
    const { result } = renderHook(() => usePressedNotes());

    act(() => pressNote('C4', 'ptr:1'));
    act(() => pressNote('C4', 'key:KeyQ'));
    act(() => pressNote('C4', 'key:KeyQ')); // same source twice: ignored
    expect(on).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual(['C4']);

    act(() => releaseNote('C4', 'ptr:1'));
    expect(off).not.toHaveBeenCalled();
    expect(result.current).toEqual(['C4']);

    act(() => releaseNote('C4', 'key:KeyQ'));
    expect(off).toHaveBeenCalledWith('C4');
    expect(result.current).toEqual([]);
  });

  it('orders notes by pitch and releases by source', () => {
    const { result } = renderHook(() => usePressedNotes());
    act(() => {
      pressNote('G4', 'key:KeyT');
      pressNote('C4', 'ptr:1');
      pressNote('E4', 'key:KeyE');
    });
    expect(result.current).toEqual(['C4', 'E4', 'G4']);
    act(() => releaseAll((s) => s.startsWith('key:')));
    expect(result.current).toEqual(['C4']);
  });
});

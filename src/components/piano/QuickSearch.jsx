import { useEffect, useId, useRef, useState } from 'react';
import { LuSearch, LuX } from 'react-icons/lu';
import { search } from '../../music/theory';

/**
 * "Am7", "F# minor scale", "Do mayor", "C4"… Picks a chord, scale or note.
 * Press / anywhere to focus it; Esc to leave it (the keys play again).
 */
const QuickSearch = ({ initialQuery = '', onSelect, onClear, hasSelection }) => {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const listId = useId();
  const results = search(query);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (result) => {
    if (!result) return;
    inputRef.current?.blur(); // back to playing
    onSelect(result.item);
  };

  const clear = () => {
    setQuery('');
    onClear();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const expanded = open && query.trim() !== '' && results.length > 0;

  return (
    <div className="relative w-full">
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Find a chord, scale or note"
        autoComplete="off"
        spellCheck={false}
        placeholder="Find a chord, scale or note…  Am7, F# minor scale, Do mayor"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={(e) => {
          e.target.select();
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className="h-12 w-full rounded-2xl border border-line bg-sunken/70 pl-11 pr-20 text-base text-ink placeholder:text-muted/80 transition focus:border-accent/60 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {(query || hasSelection) && (
          <button type="button" onClick={clear} className="icon-btn h-8 min-w-8" aria-label="Clear">
            <LuX size={16} />
          </button>
        )}
        {!query && (
          <kbd className="hidden rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-xs text-muted sm:block">/</kbd>
        )}
      </div>
      {expanded && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift"
        >
          {results.map((r, i) => (
            <li
              key={`${r.item.type}-${r.item.slug ?? r.label}`}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => {
                e.preventDefault();
                choose(r);
              }}
              onPointerEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 ${i === active ? 'bg-accent-soft/70' : ''}`}
            >
              <span className="font-display text-base font-semibold">{r.label}</span>
              <span className="text-sm text-muted">{r.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuickSearch;

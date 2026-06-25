'use client';

import { useState, useRef, useEffect, useId } from 'react';

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const labelId = `${uid}-label`;

  const normalized = (options as readonly (string | { value: string; label: string })[]).map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  );

  const selectedIndex = normalized.findIndex((o) => o.value === value);
  const selected = normalized[selectedIndex] ?? normalized[0];
  const activeOptionId = open && activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined;

  // Reset active index to the selected item when opening.
  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function commit(idx: number) {
    if (idx >= 0 && idx < normalized.length) onChange(normalized[idx].value);
    closeDropdown();
    buttonRef.current?.focus();
  }

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) closeDropdown();
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        closeDropdown();
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (open) commit(activeIndex);
        else openDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) { openDropdown(); break; }
        setActiveIndex((i) => Math.min(i + 1, normalized.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) { openDropdown(); break; }
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        if (open) { e.preventDefault(); setActiveIndex(0); }
        break;
      case 'End':
        if (open) { e.preventDefault(); setActiveIndex(normalized.length - 1); }
        break;
      case 'Tab':
        if (open) closeDropdown();
        break;
    }
  }

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span id={labelId} className="text-[11px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">
        {label}
      </span>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          onKeyDown={onKeyDown}
          onClick={() => (open ? closeDropdown() : openDropdown())}
          className="flex w-full items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-left text-sm text-[var(--fg)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)] hover:border-[var(--accent)]"
        >
          <span aria-hidden="true" className="text-[var(--accent)]">&gt;</span>
          <span className="flex-1">{selected?.label ?? value}</span>
          <span aria-hidden="true" className="text-[var(--fg-dim)]">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute z-10 mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg-raised)] py-1 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]"
          >
            {normalized.map((opt, i) => (
              <li
                key={opt.value}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={opt.value === value}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
                className={[
                  'flex cursor-pointer items-center px-3 py-2 text-sm transition-colors',
                  i === activeIndex
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--fg)]',
                ].join(' ')}
              >
                <span aria-hidden="true" className={`mr-2 w-3 text-[var(--accent)] ${opt.value === value ? '' : 'invisible'}`}>✓</span>
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

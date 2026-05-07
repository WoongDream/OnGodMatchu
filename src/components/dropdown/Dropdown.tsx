import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import type { DropdownOption, DropdownProps } from './Dropdown.type';
import {
  wrapperStyle,
  triggerStyle,
  valueStyle,
  caretStyle,
  listStyle,
  optionStyle,
} from './Dropdown.style';

const DropdownInner = <V extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: DropdownProps<V>) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = useMemo<DropdownOption<V> | undefined>(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close]);

  const handleTriggerClick = () => {
    if (disabled) {
      return;
    }
    setOpen((prev) => !prev);
    const idx = options.findIndex((o) => o.value === value);
    setFocusedIndex(idx >= 0 ? idx : 0);
  };

  const handleSelect = (next: V) => {
    onChange(next);
    close();
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = options[focusedIndex];
      if (opt) {
        handleSelect(opt.value);
      }
    }
  };

  return (
    <div ref={wrapperRef} css={wrapperStyle}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleTriggerClick}
        css={triggerStyle(open, disabled)}
      >
        <span css={valueStyle}>{selected?.label ?? ''}</span>
        <span css={caretStyle(open)} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul role="listbox" css={listStyle} onKeyDown={handleListKeyDown} tabIndex={-1}>
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              css={optionStyle(opt.value === value, idx === focusedIndex)}
              onMouseEnter={() => setFocusedIndex(idx)}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Dropdown = memo(DropdownInner) as <V extends string>(props: DropdownProps<V>) => ReactElement;

(Dropdown as { displayName?: string }).displayName = 'Dropdown';

export default Dropdown;

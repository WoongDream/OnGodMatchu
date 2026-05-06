import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import ProfileImage from './ProfileImage';
import {
  getInitial,
  getInitialColor,
  INITIAL_PALETTE,
  FALLBACK_INITIAL,
  FALLBACK_COLOR,
} from './initial';

describe('getInitial', () => {
  it('returns the first character of a Korean nickname', () => {
    expect(getInitial('우진')).toBe('우');
  });

  it('returns the first character uppercased for an English nickname', () => {
    expect(getInitial('woong')).toBe('W');
  });

  it('returns the first character for a numeric nickname', () => {
    expect(getInitial('404')).toBe('4');
  });

  it('returns "?" for an empty string', () => {
    expect(getInitial('')).toBe(FALLBACK_INITIAL);
  });

  it('returns "?" for a whitespace-only string', () => {
    expect(getInitial('   ')).toBe(FALLBACK_INITIAL);
  });

  it('uppercases an English single character', () => {
    expect(getInitial('alice')).toBe('A');
  });

  it('handles a single character nickname', () => {
    expect(getInitial('Z')).toBe('Z');
  });

  it('trims leading whitespace before extracting initial', () => {
    expect(getInitial(' bob')).toBe('B');
  });
});

describe('getInitialColor', () => {
  it('returns a color from the palette for a non-empty nickname', () => {
    const color = getInitialColor('woong');
    expect(INITIAL_PALETTE).toContain(color);
  });

  it('returns FALLBACK_COLOR for an empty string', () => {
    expect(getInitialColor('')).toBe(FALLBACK_COLOR);
  });

  it('returns FALLBACK_COLOR for a whitespace-only string', () => {
    expect(getInitialColor('   ')).toBe(FALLBACK_COLOR);
  });

  it('returns the same color for the same nickname (deterministic)', () => {
    expect(getInitialColor('우진')).toBe(getInitialColor('우진'));
  });

  it('different nicknames with different hashes return potentially different colors', () => {
    // Verify each independently maps to a valid palette color (deterministic)
    const c1 = getInitialColor('alice');
    const c2 = getInitialColor('bob');
    expect(INITIAL_PALETTE).toContain(c1);
    expect(INITIAL_PALETTE).toContain(c2);
  });

  it('returns the same color when called twice with the same argument', () => {
    const first = getInitialColor('test-user');
    const second = getInitialColor('test-user');
    expect(first).toBe(second);
  });
});

describe('ProfileImage', () => {
  describe('when imageUrl is provided', () => {
    it('renders an <img> element', () => {
      renderWithTheme(<ProfileImage nickname="woong" imageUrl="https://example.com/avatar.png" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('img').tagName).toBe('IMG');
    });

    it('sets the alt attribute to "{nickname} 프로필 이미지"', () => {
      renderWithTheme(<ProfileImage nickname="woong" imageUrl="https://example.com/avatar.png" />);
      expect(screen.getByRole('img', { name: 'woong 프로필 이미지' })).toBeInTheDocument();
    });

    it('sets the src attribute to the provided imageUrl', () => {
      const url = 'https://example.com/avatar.png';
      renderWithTheme(<ProfileImage nickname="woong" imageUrl={url} />);
      expect(screen.getByRole('img')).toHaveAttribute('src', url);
    });

    it('does not render the fallback div when imageUrl is set', () => {
      renderWithTheme(<ProfileImage nickname="woong" imageUrl="https://example.com/avatar.png" />);
      // Only one img element, no fallback role=img div
      const imgs = screen.getAllByRole('img');
      expect(imgs).toHaveLength(1);
      expect(imgs[0].tagName).toBe('IMG');
    });
  });

  describe('when imageUrl is absent (fallback initial)', () => {
    it('renders a div with role="img" when imageUrl is undefined', () => {
      renderWithTheme(<ProfileImage nickname="우진" />);
      const fallback = screen.getByRole('img');
      expect(fallback.tagName).toBe('DIV');
    });

    it('sets aria-label to "{nickname} 프로필 이미지" on the fallback div', () => {
      renderWithTheme(<ProfileImage nickname="우진" />);
      expect(screen.getByRole('img', { name: '우진 프로필 이미지' })).toBeInTheDocument();
    });

    it('renders the initial text inside the fallback div', () => {
      renderWithTheme(<ProfileImage nickname="우진" />);
      const fallback = screen.getByRole('img');
      expect(fallback).toHaveTextContent('우');
    });

    it('renders "W" initial for "woong" nickname', () => {
      renderWithTheme(<ProfileImage nickname="woong" />);
      expect(screen.getByRole('img')).toHaveTextContent('W');
    });

    it('renders "4" initial for "404" nickname', () => {
      renderWithTheme(<ProfileImage nickname="404" />);
      expect(screen.getByRole('img')).toHaveTextContent('4');
    });

    it('renders "?" initial for empty nickname', () => {
      renderWithTheme(<ProfileImage nickname="" />);
      expect(screen.getByRole('img')).toHaveTextContent('?');
    });

    it('renders "?" initial for whitespace-only nickname', () => {
      renderWithTheme(<ProfileImage nickname="   " />);
      expect(screen.getByRole('img')).toHaveTextContent('?');
    });

    it('renders fallback when imageUrl is explicitly null', () => {
      renderWithTheme(<ProfileImage nickname="woong" imageUrl={null} />);
      const fallback = screen.getByRole('img');
      expect(fallback.tagName).toBe('DIV');
    });
  });

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg', 'xl'] as const)('renders without error for size="%s"', (size) => {
      expect(() => renderWithTheme(<ProfileImage nickname="woong" size={size} />)).not.toThrow();
    });

    it('defaults to size "md" when size prop is omitted', () => {
      expect(() => renderWithTheme(<ProfileImage nickname="woong" />)).not.toThrow();
    });
  });

  describe('displayName', () => {
    it('has displayName "ProfileImage"', () => {
      expect(ProfileImage.displayName).toBe('ProfileImage');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import NicknameTypeBadge from './NicknameTypeBadge';

describe('NicknameTypeBadge', () => {
  describe('유형별 라벨', () => {
    it('FORBIDDEN → "금지" 를 렌더한다', () => {
      renderWithTheme(<NicknameTypeBadge type="FORBIDDEN" />);
      expect(screen.getByText('금지')).toBeInTheDocument();
    });

    it('RESERVED → "예약" 을 렌더한다', () => {
      renderWithTheme(<NicknameTypeBadge type="RESERVED" />);
      expect(screen.getByText('예약')).toBeInTheDocument();
    });
  });

  describe('memo / displayName', () => {
    it('displayName 이 "NicknameTypeBadge" 이다', () => {
      expect(NicknameTypeBadge.displayName).toBe('NicknameTypeBadge');
    });
  });
});

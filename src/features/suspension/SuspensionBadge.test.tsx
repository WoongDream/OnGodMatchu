import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import SuspensionBadge from './SuspensionBadge';

describe('SuspensionBadge', () => {
  describe('until 미지정', () => {
    it('until 이 없으면 "정지됨" 만 표시한다', () => {
      renderWithTheme(<SuspensionBadge />);
      expect(screen.getByText('정지됨')).toBeInTheDocument();
    });

    it('until 이 null 이면 "정지됨" 만 표시한다', () => {
      renderWithTheme(<SuspensionBadge until={null} />);
      expect(screen.getByText('정지됨')).toBeInTheDocument();
    });
  });

  describe('until 지정', () => {
    it('until 이 있으면 "~날짜까지" 를 함께 표시한다', () => {
      renderWithTheme(<SuspensionBadge until="2026-12-31" />);
      expect(screen.getByText('정지됨 · ~2026-12-31까지')).toBeInTheDocument();
    });

    it('ISO datetime 이면 앞 10자(날짜)만 사용한다', () => {
      renderWithTheme(<SuspensionBadge until="2026-12-31T23:59:59.000Z" />);
      expect(screen.getByText('정지됨 · ~2026-12-31까지')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "SuspensionBadge" 이다', () => {
      expect(SuspensionBadge.displayName).toBe('SuspensionBadge');
    });
  });
});

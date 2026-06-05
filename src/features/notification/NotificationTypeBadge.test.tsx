import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import NotificationTypeBadge from './NotificationTypeBadge';

describe('NotificationTypeBadge', () => {
  describe('라벨 렌더', () => {
    it('INFO 면 label 텍스트("안내")를 표시한다', () => {
      renderWithTheme(<NotificationTypeBadge type="INFO" label="안내" />);
      expect(screen.getByText('안내')).toBeInTheDocument();
    });

    it('WARNING 이면 label 텍스트("경고")를 표시한다', () => {
      renderWithTheme(<NotificationTypeBadge type="WARNING" label="경고" />);
      expect(screen.getByText('경고')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationTypeBadge" 이다', () => {
      expect(NotificationTypeBadge.displayName).toBe('NotificationTypeBadge');
    });
  });
});

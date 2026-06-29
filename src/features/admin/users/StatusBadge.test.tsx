import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { UserStatus } from '@/types';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  describe('status → 라벨 매핑', () => {
    it.each<[UserStatus, string]>([
      ['ACTIVE', '정상'],
      ['SUSPENDED', '정지'],
      ['WITHDRAWN', '탈퇴'],
    ])('status="%s" 이면 "%s" 라벨이 렌더된다', (status, label) => {
      renderWithTheme(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('dot', () => {
    it('장식용 dot(aria-hidden) 이 함께 렌더된다', () => {
      const { container } = renderWithTheme(<StatusBadge status="ACTIVE" />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "StatusBadge" 이다', () => {
      expect(StatusBadge.displayName).toBe('StatusBadge');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { Role } from '@/types';
import RoleBadge from './RoleBadge';

describe('RoleBadge', () => {
  describe('role 별 렌더', () => {
    it.each<Role>(['OWNER', 'ADMIN', 'USER'])('role="%s" 텍스트가 렌더된다', (role) => {
      renderWithTheme(<RoleBadge role={role} />);
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "RoleBadge" 이다', () => {
      expect(RoleBadge.displayName).toBe('RoleBadge');
    });
  });
});

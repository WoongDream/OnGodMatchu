import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import RoleBadge from './RoleBadge';

describe('RoleBadge', () => {
  describe('배지 렌더 (OWNER/ADMIN)', () => {
    it('role="OWNER" 이면 "OWNER" 텍스트와 크라운 아이콘(svg)을 렌더한다', () => {
      const { container } = renderWithTheme(<RoleBadge role="OWNER" />);
      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('role="ADMIN" 이면 "ADMIN" 텍스트와 크라운 아이콘(svg)을 렌더한다', () => {
      const { container } = renderWithTheme(<RoleBadge role="ADMIN" />);
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('렌더 안 함 (USER / null / undefined)', () => {
    it('role="USER" 이면 아무것도 렌더하지 않는다', () => {
      const { container } = renderWithTheme(<RoleBadge role="USER" />);
      expect(container.firstChild).toBeNull();
    });

    it('role={null} 이면 아무것도 렌더하지 않는다', () => {
      const { container } = renderWithTheme(<RoleBadge role={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('role 미지정(undefined)이면 아무것도 렌더하지 않는다', () => {
      const { container } = renderWithTheme(<RoleBadge />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "RoleBadge" 이다', () => {
      expect(RoleBadge.displayName).toBe('RoleBadge');
    });
  });
});

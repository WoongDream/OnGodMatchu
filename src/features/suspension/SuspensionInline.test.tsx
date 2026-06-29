import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter } from 'react-router-dom';
import SuspensionInline from './SuspensionInline';

const renderInline = (until?: string | null) =>
  renderWithTheme(
    <MemoryRouter>
      <SuspensionInline until={until} />
    </MemoryRouter>,
  );

describe('SuspensionInline', () => {
  describe('배지', () => {
    it('until 이 없으면 "정지됨" 배지를 표시한다', () => {
      renderInline();
      expect(screen.getByText('정지됨')).toBeInTheDocument();
    });

    it('until 이 있으면 날짜를 포함한 배지를 표시한다', () => {
      renderInline('2026-12-31');
      expect(screen.getByText('정지됨 · ~2026-12-31까지')).toBeInTheDocument();
    });
  });

  describe('문의하기 링크', () => {
    it('문의하기 링크를 /inquiry 로 연결한다', () => {
      renderInline();
      const link = screen.getByRole('link', { name: '문의하기' });
      expect(link).toHaveAttribute('href', '/inquiry');
    });
  });

  describe('displayName', () => {
    it('displayName 이 "SuspensionInline" 이다', () => {
      expect(SuspensionInline.displayName).toBe('SuspensionInline');
    });
  });
});

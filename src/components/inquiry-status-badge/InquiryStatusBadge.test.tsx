import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { InquiryStatus } from '@/types';
import InquiryStatusBadge from './InquiryStatusBadge';

describe('InquiryStatusBadge', () => {
  describe('상태별 라벨', () => {
    it.each<[InquiryStatus, string]>([
      ['PENDING', '대기'],
      ['IN_PROGRESS', '처리중'],
      ['DONE', '완료'],
    ])('%s → "%s" 를 렌더한다', (status, label) => {
      renderWithTheme(<InquiryStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('memo / displayName', () => {
    it('displayName 이 "InquiryStatusBadge" 이다', () => {
      expect(InquiryStatusBadge.displayName).toBe('InquiryStatusBadge');
    });
  });
});

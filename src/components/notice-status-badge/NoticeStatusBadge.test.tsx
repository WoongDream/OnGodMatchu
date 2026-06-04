import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import NoticeStatusBadge from './NoticeStatusBadge';

describe('NoticeStatusBadge', () => {
  describe('상태별 라벨', () => {
    it('PUBLISHED + pinned → "고정" 을 렌더한다', () => {
      renderWithTheme(<NoticeStatusBadge status="PUBLISHED" pinned />);
      expect(screen.getByText('고정')).toBeInTheDocument();
    });

    it('PUBLISHED + pinned=false → "게시" 를 렌더한다', () => {
      renderWithTheme(<NoticeStatusBadge status="PUBLISHED" pinned={false} />);
      expect(screen.getByText('게시')).toBeInTheDocument();
    });

    it('pinned 미지정 시 기본값 false 로 "게시" 를 렌더한다', () => {
      renderWithTheme(<NoticeStatusBadge status="PUBLISHED" />);
      expect(screen.getByText('게시')).toBeInTheDocument();
    });

    it('DRAFT → "임시저장" 을 렌더한다', () => {
      renderWithTheme(<NoticeStatusBadge status="DRAFT" />);
      expect(screen.getByText('임시저장')).toBeInTheDocument();
    });

    it('DRAFT + pinned 라도 "임시저장" 을 렌더한다 (게시 상태가 아니면 고정 불가)', () => {
      renderWithTheme(<NoticeStatusBadge status="DRAFT" pinned />);
      expect(screen.getByText('임시저장')).toBeInTheDocument();
      expect(screen.queryByText('고정')).not.toBeInTheDocument();
    });
  });

  describe('memo / displayName', () => {
    it('displayName 이 "NoticeStatusBadge" 이다', () => {
      expect(NoticeStatusBadge.displayName).toBe('NoticeStatusBadge');
    });
  });
});

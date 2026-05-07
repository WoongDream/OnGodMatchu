import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '@/test/renderWithTheme';
import MyQuizCard from './MyQuizCard';
import type { MyQuizListItem } from '@/types';

vi.mock('@/components/button', () => ({
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/badge', () => ({
  default: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant ?? ''}>
      {children}
    </span>
  ),
}));

vi.mock('@/lib/time/relative', () => ({
  formatRelativeKo: vi.fn(() => '방금 전'),
}));

const BASE_ITEM: MyQuizListItem = {
  id: 1,
  publicId: 'uuid-1',
  title: '테스트 퀴즈',
  category: 'game',
  categoryLabel: '게임',
  isPublic: true,
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 1234,
  shareCount: 56,
  starCount: 78,
  commentCount: 9,
  correctRate: 72,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
};

const setup = (overrides?: Partial<MyQuizListItem>, isMutating = false) => {
  const item = { ...BASE_ITEM, ...overrides };
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const result = renderWithTheme(
    <MyQuizCard item={item} onEdit={onEdit} onDelete={onDelete} isMutating={isMutating} />,
  );
  return { onEdit, onDelete, container: result.container };
};

describe('MyQuizCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('카테고리 라벨', () => {
    it('categoryLabel 텍스트가 렌더된다', () => {
      setup();
      expect(screen.getByText('게임')).toBeInTheDocument();
    });
  });

  describe('공개/비공개 Badge', () => {
    it('isPublic=true 이면 "공개" Badge 가 info variant 로 렌더된다', () => {
      setup({ isPublic: true });
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('공개');
      expect(badge).toHaveAttribute('data-variant', 'info');
    });

    it('isPublic=false 이면 "비공개" Badge 가 warning variant 로 렌더된다', () => {
      setup({ isPublic: false });
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveTextContent('비공개');
      expect(badge).toHaveAttribute('data-variant', 'warning');
    });
  });

  describe('updatedAt 상대 시간', () => {
    it('formatRelativeKo 반환값이 렌더된다', () => {
      setup();
      expect(screen.getByText('방금 전')).toBeInTheDocument();
    });
  });

  describe('제목', () => {
    it('title 이 h3 로 렌더된다', () => {
      setup();
      expect(screen.getByRole('heading', { level: 3, name: '테스트 퀴즈' })).toBeInTheDocument();
    });
  });

  describe('통계', () => {
    it('playCount 가 toLocaleString 포맷으로 렌더된다', () => {
      setup({ playCount: 1234 });
      // aria-label="플레이" span 안에 표시됨
      const el = screen.getByRole('generic', { name: '플레이' });
      expect(el).toHaveTextContent('1,234');
    });

    it('shareCount 가 렌더된다', () => {
      setup({ shareCount: 56 });
      const el = screen.getByRole('generic', { name: '공유' });
      expect(el).toHaveTextContent('56');
    });

    it('starCount 가 렌더된다', () => {
      setup({ starCount: 78 });
      const el = screen.getByRole('generic', { name: '스타' });
      expect(el).toHaveTextContent('78');
    });

    it('commentCount 가 렌더된다', () => {
      setup({ commentCount: 9 });
      const el = screen.getByRole('generic', { name: '댓글' });
      expect(el).toHaveTextContent('9');
    });

    it('correctRate=72 이면 "72%" 로 렌더된다', () => {
      setup({ correctRate: 72 });
      const el = screen.getByRole('generic', { name: '정답률' });
      expect(el).toHaveTextContent('72%');
    });

    it('correctRate=0 이면 "0%" 로 렌더된다', () => {
      setup({ correctRate: 0 });
      const el = screen.getByRole('generic', { name: '정답률' });
      expect(el).toHaveTextContent('0%');
    });

    it('correctRate=100 이면 "100%" 로 렌더된다', () => {
      setup({ correctRate: 100 });
      const el = screen.getByRole('generic', { name: '정답률' });
      expect(el).toHaveTextContent('100%');
    });

    it('correctRate=null 이면 "—" 로 렌더된다', () => {
      setup({ correctRate: null });
      const el = screen.getByRole('generic', { name: '정답률' });
      expect(el).toHaveTextContent('—');
    });

    it('큰 수는 천 단위 구분자가 적용된다', () => {
      setup({ playCount: 1000000 });
      const el = screen.getByRole('generic', { name: '플레이' });
      expect(el).toHaveTextContent('1,000,000');
    });
  });

  describe('썸네일', () => {
    it('thumbnailUrl 이 있으면 img 엘리먼트가 렌더된다', () => {
      const { container } = setup({ thumbnailUrl: 'https://example.com/thumb.jpg' });
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    });

    it('thumbnailUrl 이 null 이면 img 엘리먼트가 렌더되지 않는다', () => {
      const { container } = setup({ thumbnailUrl: null });
      expect(container.querySelector('img')).toBeNull();
    });
  });

  describe('편집 버튼', () => {
    it('클릭하면 onEdit(quizId) 가 호출된다', async () => {
      const { onEdit } = setup();
      await userEvent.click(screen.getByRole('button', { name: '편집' }));
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(1);
    });
  });

  describe('삭제 버튼', () => {
    it('confirm=true 이면 onDelete(quizId) 가 호출된다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const { onDelete } = setup();
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('confirm=false 이면 onDelete 가 호출되지 않는다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const { onDelete } = setup();
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('인라인 토글 버튼은 더 이상 노출되지 않는다', () => {
    it('isPublic=true 여도 "비공개로" 버튼이 없다', () => {
      setup({ isPublic: true });
      expect(screen.queryByRole('button', { name: '비공개로' })).not.toBeInTheDocument();
    });

    it('isPublic=false 여도 "공개로" 버튼이 없다', () => {
      setup({ isPublic: false });
      expect(screen.queryByRole('button', { name: '공개로' })).not.toBeInTheDocument();
    });
  });

  describe('isMutating', () => {
    it('isMutating=true 이면 편집 버튼이 disabled 된다', () => {
      setup({}, true);
      expect(screen.getByRole('button', { name: '편집' })).toBeDisabled();
    });

    it('isMutating=true 이면 삭제 버튼이 disabled 된다', () => {
      setup({}, true);
      expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
    });

    it('isMutating=false(기본값) 이면 버튼들이 enabled 상태이다', () => {
      setup();
      expect(screen.getByRole('button', { name: '편집' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "MyQuizCard" 이다', () => {
      expect(MyQuizCard.displayName).toBe('MyQuizCard');
    });
  });
});

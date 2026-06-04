import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '@/test/renderWithTheme';
import CommentItem from './CommentItem';
import type { Comment } from '@/types';

const BASE_COMMENT: Comment = {
  id: 1,
  content: '좋은 퀴즈네요',
  authorPublicId: 'pub-123',
  authorNickname: '테스터',
  authorProfileImageUrl: null,
  createdAt: '2026-01-02T03:04:00Z',
  updatedAt: '2026-01-02T03:04:00Z',
};

const setup = (overrides?: {
  comment?: Partial<Comment>;
  canDelete?: boolean;
  onDelete?: ReturnType<typeof vi.fn>;
  isMutating?: boolean;
  onAuthorClick?: ((publicId: string) => void) | undefined;
  withAuthorClick?: boolean;
}) => {
  const comment = { ...BASE_COMMENT, ...overrides?.comment };
  const onDelete = overrides?.onDelete ?? vi.fn();
  const onAuthorClick =
    overrides?.withAuthorClick === false ? undefined : (overrides?.onAuthorClick ?? vi.fn());
  const result = renderWithTheme(
    <CommentItem
      comment={comment}
      canDelete={overrides?.canDelete ?? false}
      onDelete={onDelete as (commentId: number) => void}
      isMutating={overrides?.isMutating}
      onAuthorClick={onAuthorClick}
    />,
  );
  return { onDelete, onAuthorClick, container: result.container };
};

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더', () => {
    it('닉네임과 내용이 렌더된다', () => {
      setup({ withAuthorClick: false });
      expect(screen.getByText('테스터')).toBeInTheDocument();
      expect(screen.getByText('좋은 퀴즈네요')).toBeInTheDocument();
    });

    it('닉네임이 없으면 "익명" 으로 표시된다', () => {
      setup({ comment: { authorNickname: '' }, withAuthorClick: false });
      expect(screen.getByText('익명')).toBeInTheDocument();
    });
  });

  describe('onAuthorClick 미제공 (읽기 전용 회귀)', () => {
    it('아바타/닉네임이 버튼이 아니다', () => {
      setup({ withAuthorClick: false });
      expect(screen.queryByRole('button', { name: '테스터 프로필 보기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '테스터' })).not.toBeInTheDocument();
    });

    it('닉네임이 일반 텍스트(span)로 렌더된다', () => {
      setup({ withAuthorClick: false });
      const nickname = screen.getByText('테스터');
      expect(nickname.tagName).not.toBe('BUTTON');
    });
  });

  describe('onAuthorClick 제공 (클릭 가능)', () => {
    it('닉네임 버튼 클릭 시 onAuthorClick(authorPublicId) 가 호출된다', async () => {
      const onAuthorClick = vi.fn();
      setup({ onAuthorClick });
      await userEvent.click(screen.getByRole('button', { name: '테스터' }));
      expect(onAuthorClick).toHaveBeenCalledTimes(1);
      expect(onAuthorClick).toHaveBeenCalledWith('pub-123');
    });

    it('아바타 버튼("{닉네임} 프로필 보기") 클릭 시 onAuthorClick(authorPublicId) 가 호출된다', async () => {
      const onAuthorClick = vi.fn();
      setup({ onAuthorClick });
      await userEvent.click(screen.getByRole('button', { name: '테스터 프로필 보기' }));
      expect(onAuthorClick).toHaveBeenCalledTimes(1);
      expect(onAuthorClick).toHaveBeenCalledWith('pub-123');
    });

    it('authorPublicId 가 없으면 onAuthorClick 가 있어도 버튼이 아니다', () => {
      const onAuthorClick = vi.fn();
      setup({ comment: { authorPublicId: '' }, onAuthorClick });
      expect(screen.queryByRole('button', { name: '테스터 프로필 보기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '테스터' })).not.toBeInTheDocument();
    });
  });

  describe('삭제 버튼', () => {
    it('canDelete=true 이면 삭제 버튼이 보이고 클릭 시 onDelete(id) 호출된다', async () => {
      const onDelete = vi.fn();
      setup({ canDelete: true, onDelete, withAuthorClick: false });
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('canDelete=false 이면 삭제 버튼이 없다', () => {
      setup({ canDelete: false, withAuthorClick: false });
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "CommentItem" 이다', () => {
      expect(CommentItem.displayName).toBe('CommentItem');
    });
  });
});

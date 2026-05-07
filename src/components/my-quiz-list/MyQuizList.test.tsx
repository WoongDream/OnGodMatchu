import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/test/renderWithTheme';
import MyQuizList from './MyQuizList';
import type { MyQuizListItem } from '@/types';

vi.mock('@/components/my-quiz-card', () => ({
  default: ({ item }: { item: MyQuizListItem }) => (
    <article data-testid="my-quiz-card">{item.title}</article>
  ),
}));

const makeItem = (id: number): MyQuizListItem => ({
  id,
  publicId: `uuid-${id}`,
  title: `퀴즈 ${id}`,
  category: 'game',
  categoryLabel: '게임',
  isPublic: true,
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 0,
  shareCount: 0,
  starCount: 0,
  commentCount: 0,
  correctRate: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

const NOOP = () => {};

const setup = (items: MyQuizListItem[], emptyLabel?: string) => {
  renderWithTheme(
    <MyQuizList items={items} onEdit={NOOP} onDelete={NOOP} emptyLabel={emptyLabel} />,
  );
};

describe('MyQuizList', () => {
  describe('빈 목록', () => {
    it('items 가 빈 배열이면 기본 빈 상태 메시지가 렌더된다', () => {
      setup([]);
      expect(screen.getByText('아직 만든 퀴즈가 없습니다.')).toBeInTheDocument();
    });

    it('items 가 빈 배열이면 카드가 렌더되지 않는다', () => {
      setup([]);
      expect(screen.queryByTestId('my-quiz-card')).not.toBeInTheDocument();
    });

    it('emptyLabel 이 있으면 커스텀 메시지가 렌더된다', () => {
      setup([], '퀴즈를 만들어 보세요!');
      expect(screen.getByText('퀴즈를 만들어 보세요!')).toBeInTheDocument();
    });

    it('emptyLabel 이 있으면 기본 메시지는 렌더되지 않는다', () => {
      setup([], '퀴즈를 만들어 보세요!');
      expect(screen.queryByText('아직 만든 퀴즈가 없습니다.')).not.toBeInTheDocument();
    });
  });

  describe('목록 렌더', () => {
    it('items 1개 → 카드 1개가 렌더된다', () => {
      setup([makeItem(1)]);
      expect(screen.getAllByTestId('my-quiz-card')).toHaveLength(1);
    });

    it('items 3개 → 카드 3개가 렌더된다', () => {
      setup([makeItem(1), makeItem(2), makeItem(3)]);
      expect(screen.getAllByTestId('my-quiz-card')).toHaveLength(3);
    });

    it('각 카드에 해당 항목의 title 이 렌더된다', () => {
      setup([makeItem(1), makeItem(2)]);
      expect(screen.getByText('퀴즈 1')).toBeInTheDocument();
      expect(screen.getByText('퀴즈 2')).toBeInTheDocument();
    });

    it('items 가 있으면 빈 상태 메시지가 렌더되지 않는다', () => {
      setup([makeItem(1)]);
      expect(screen.queryByText('아직 만든 퀴즈가 없습니다.')).not.toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "MyQuizList" 이다', () => {
      expect(MyQuizList.displayName).toBe('MyQuizList');
    });
  });
});

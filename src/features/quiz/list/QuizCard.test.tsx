import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizCard from './QuizCard';
import type { Quiz } from '@/types';

const baseQuiz: Quiz = {
  id: 1,
  authorNickname: 'testuser',
  title: 'Test Quiz Title',
  description: 'Test quiz description',
  category: 'game',
  thumbnailKey: 'quiz-thumbnails/abc',
  thumbnailUrl: 'https://example.com/image.jpg',
  playCount: 1234,
  starCount: 142,
  commentCount: 28,
  shareCount: 11,
  isStarred: false,
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const getCard = () => screen.getByRole('article');
const getStarButton = () => screen.getByRole('button', { name: /좋아요/ });

describe('QuizCard', () => {
  let onClick: Mock<(id: number) => void>;
  let onStarClick: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    onClick = vi.fn();
    onStarClick = vi.fn();
  });

  describe('렌더링', () => {
    it('article 랜드마크가 렌더된다', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(getCard()).toBeInTheDocument();
    });

    it('퀴즈 제목이 렌더된다', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(
        screen.getByRole('heading', { level: 3, name: 'Test Quiz Title' }),
      ).toBeInTheDocument();
    });

    it('설명이 렌더된다', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByText('Test quiz description')).toBeInTheDocument();
    });

    it('카테고리는 한글 라벨로 표시된다 (game → 게임)', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByText('게임')).toBeInTheDocument();
    });

    it('썸네일 이미지가 있으면 img 를 렌더한다', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      const card = getCard();
      const img = card.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe(baseQuiz.thumbnailUrl);
    });

    it('썸네일이 null 이면 img 를 렌더하지 않는다', () => {
      const noThumb: Quiz = { ...baseQuiz, thumbnailUrl: null };
      renderWithTheme(<QuizCard quiz={noThumb} onClick={onClick} onStarClick={onStarClick} />);
      const img = getCard().querySelector('img');
      expect(img).toBeNull();
    });
  });

  describe('4 메트릭 행', () => {
    it('플레이/스타/댓글/공유 카운트가 모두 표시된다', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByLabelText('플레이 1234회')).toBeInTheDocument();
      expect(screen.getByLabelText('스타 142개')).toBeInTheDocument();
      expect(screen.getByLabelText('댓글 28개')).toBeInTheDocument();
      expect(screen.getByLabelText('공유 11회')).toBeInTheDocument();
    });

    it('formatCount: 1234 → 1.2k', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByLabelText('플레이 1234회').textContent).toContain('1.2k');
    });

    it('formatCount: 999 → 999 (k 안 붙음)', () => {
      const q: Quiz = { ...baseQuiz, playCount: 999 };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByLabelText('플레이 999회').textContent).toContain('999');
    });

    it('formatCount: 0 → 0', () => {
      const q: Quiz = {
        ...baseQuiz,
        playCount: 0,
        starCount: 0,
        commentCount: 0,
        shareCount: 0,
      };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByLabelText('플레이 0회').textContent).toContain('0');
    });

    it('formatCount: 12800 → 12.8k', () => {
      const q: Quiz = { ...baseQuiz, playCount: 12800 };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByLabelText('플레이 12800회').textContent).toContain('12.8k');
    });
  });

  describe('스타 버튼', () => {
    it('isStarred=false 일 때 aria-pressed="false"', () => {
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      expect(getStarButton()).toHaveAttribute('aria-pressed', 'false');
    });

    it('isStarred=true 일 때 aria-pressed="true" + 좋아요 취소 label', () => {
      const q: Quiz = { ...baseQuiz, isStarred: true };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      const btn = screen.getByRole('button', { name: '좋아요 취소' });
      expect(btn).toHaveAttribute('aria-pressed', 'true');
    });

    it('isStarPending=true 이면 disabled', () => {
      renderWithTheme(
        <QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} isStarPending />,
      );
      expect(getStarButton()).toBeDisabled();
    });
  });

  describe('클릭 동작', () => {
    it('카드 본체 클릭 시 onClick(quiz.id) 호출', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      await user.click(getCard());
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(1);
    });

    it('스타 버튼 클릭 시 onStarClick(quiz.id, isStarred, e) 호출', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      await user.click(getStarButton());
      expect(onStarClick).toHaveBeenCalledTimes(1);
      expect(onStarClick.mock.calls[0][0]).toBe(1);
      expect(onStarClick.mock.calls[0][1]).toBe(false);
    });

    it('스타 버튼 클릭은 stopPropagation — onClick(카드) 호출 안 됨', async () => {
      const user = userEvent.setup();
      renderWithTheme(<QuizCard quiz={baseQuiz} onClick={onClick} onStarClick={onStarClick} />);
      await user.click(getStarButton());
      expect(onClick).not.toHaveBeenCalled();
    });

    it('isStarred=true 인 카드의 스타 클릭은 현재 값 true 를 전달', async () => {
      const user = userEvent.setup();
      const q: Quiz = { ...baseQuiz, isStarred: true };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      await user.click(screen.getByRole('button', { name: '좋아요 취소' }));
      expect(onStarClick.mock.calls[0][1]).toBe(true);
    });
  });

  describe('카테고리 분기', () => {
    it('각 카테고리가 한글 라벨로 렌더된다', () => {
      const cases: Array<[Quiz['category'], string]> = [
        ['game', '게임'],
        ['music', '음악'],
        ['culture', '문화'],
        ['broadcast', '방송'],
        ['comic', '만화'],
        ['meme', '병맛'],
      ];
      for (const [value, label] of cases) {
        const q: Quiz = { ...baseQuiz, category: value };
        const { unmount } = renderWithTheme(
          <QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />,
        );
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      }
    });

    it('CATEGORIES 에 없는 키는 키 문자열을 그대로 표시한다 (fallback)', () => {
      // 화이트리스트에 없는 키 → CATEGORIES.find 가 undefined → quiz.category 원문 표시
      const q: Quiz = { ...baseQuiz, category: 'unknown' as Quiz['category'] };
      renderWithTheme(<QuizCard quiz={q} onClick={onClick} onStarClick={onStarClick} />);
      expect(screen.getByText('unknown')).toBeInTheDocument();
    });
  });
});

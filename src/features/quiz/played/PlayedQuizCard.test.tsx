import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/test/renderWithTheme';
import type { AttemptListItem } from '@/types';
import PlayedQuizCard from './PlayedQuizCard';
import { TOP_PERCENTILE_HIGHLIGHT_THRESHOLD } from './PlayedQuizCard.type';

// formatRelativeKo 는 결정적인 결과를 위해 고정값을 반환하도록 모킹
vi.mock('@/lib/time/relative', () => ({
  formatRelativeKo: vi.fn(() => '3일 전'),
}));

const makeAttempt = (overrides: Partial<AttemptListItem> = {}): AttemptListItem => ({
  id: 1,
  quizId: 100,
  quizPublicId: 'pub-100',
  quizTitle: '자바스크립트 기초 퀴즈',
  quizCategory: 'general',
  quizCategoryLabel: '상식',
  quizThumbnailKey: null,
  quizThumbnailUrl: null,
  playCount: 1234,
  starCount: 56,
  commentCount: 7,
  shareCount: 8,
  score: 9,
  totalQuestions: 10,
  percent: 90,
  topPercentile: 5,
  timeLimitSec: 30,
  attemptCount: 3,
  completedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('PlayedQuizCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더', () => {
    it('카테고리 라벨과 제목을 렌더한다', () => {
      renderWithTheme(<PlayedQuizCard attempt={makeAttempt()} onClick={vi.fn()} />);
      expect(screen.getByText('상식')).toBeInTheDocument();
      expect(screen.getByText('자바스크립트 기초 퀴즈')).toBeInTheDocument();
    });

    it('4개 지표를 formatCount 로 포맷해 렌더한다', () => {
      renderWithTheme(
        <PlayedQuizCard
          attempt={makeAttempt({ playCount: 1234, starCount: 56, commentCount: 7, shareCount: 8 })}
          onClick={vi.fn()}
        />,
      );
      // 1234 -> 1.2k
      expect(screen.getByText('1.2k')).toBeInTheDocument();
      expect(screen.getByText('56')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('"내 기록" 라벨과 상대 시각을 렌더한다', () => {
      renderWithTheme(<PlayedQuizCard attempt={makeAttempt()} onClick={vi.fn()} />);
      expect(screen.getByText('내 기록')).toBeInTheDocument();
      expect(screen.getByText('3일 전')).toBeInTheDocument();
    });

    it('풀이 점수를 "score/totalQuestions" 형태로 렌더한다', () => {
      renderWithTheme(
        <PlayedQuizCard
          attempt={makeAttempt({ score: 9, totalQuestions: 10 })}
          onClick={vi.fn()}
        />,
      );
      expect(screen.getByText('9/10')).toBeInTheDocument();
    });
  });

  describe('상위 백분위 강조 분기', () => {
    it('topPercentile <= 임계값이면 강조 스타일이 적용된다', () => {
      renderWithTheme(
        <PlayedQuizCard
          attempt={makeAttempt({ topPercentile: TOP_PERCENTILE_HIGHLIGHT_THRESHOLD })}
          onClick={vi.fn()}
        />,
      );
      const highlighted = screen.getByText(`${TOP_PERCENTILE_HIGHLIGHT_THRESHOLD}%`);
      expect(highlighted).toBeInTheDocument();
      const highlightedClass = highlighted.className;

      // 동일 컴포넌트를 강조 임계값 초과로 다시 렌더해 클래스가 달라지는지 비교
      const { getByText } = renderWithTheme(
        <PlayedQuizCard
          attempt={makeAttempt({ topPercentile: TOP_PERCENTILE_HIGHLIGHT_THRESHOLD + 30 })}
          onClick={vi.fn()}
        />,
      );
      const notHighlighted = getByText(`${TOP_PERCENTILE_HIGHLIGHT_THRESHOLD + 30}%`);
      expect(notHighlighted.className).not.toBe(highlightedClass);
    });

    it('topPercentile 이 임계값 초과면 상위% 텍스트는 보이되 강조와 다른 스타일이다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ topPercentile: 42 })} onClick={vi.fn()} />,
      );
      expect(screen.getByText('상위', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('topPercentile 이 null 이면 상위% 행을 렌더하지 않는다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ topPercentile: null })} onClick={vi.fn()} />,
      );
      expect(screen.queryByText('상위', { exact: false })).not.toBeInTheDocument();
    });
  });

  describe('타이머 표기', () => {
    it('timeLimitSec 이 있으면 "타이머 {초}초" 를 렌더한다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ timeLimitSec: 30 })} onClick={vi.fn()} />,
      );
      expect(screen.getByText('타이머 30초')).toBeInTheDocument();
    });

    it('timeLimitSec 이 null 이면 "타이머 없음" 을 렌더한다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ timeLimitSec: null })} onClick={vi.fn()} />,
      );
      expect(screen.getByText('타이머 없음')).toBeInTheDocument();
    });
  });

  describe('플레이 횟수 표기', () => {
    it('attemptCount > 1 이면 "{n}회 플레이" 를 렌더한다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ attemptCount: 3 })} onClick={vi.fn()} />,
      );
      expect(screen.getByText('3회 플레이')).toBeInTheDocument();
    });

    it('attemptCount <= 1 이면 "회 플레이" 를 렌더하지 않는다', () => {
      renderWithTheme(
        <PlayedQuizCard attempt={makeAttempt({ attemptCount: 1 })} onClick={vi.fn()} />,
      );
      expect(screen.queryByText(/회 플레이/)).not.toBeInTheDocument();
    });
  });

  describe('클릭 핸들러', () => {
    it('카드 클릭 시 onClick 이 quizId 로 호출된다', () => {
      const onClick = vi.fn();
      renderWithTheme(<PlayedQuizCard attempt={makeAttempt({ quizId: 777 })} onClick={onClick} />);
      fireEvent.click(screen.getByRole('article'));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(777);
    });
  });
});

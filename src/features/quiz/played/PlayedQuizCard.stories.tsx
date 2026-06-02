import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AttemptListItem } from '@/types';
import PlayedQuizCard from './PlayedQuizCard';

const base: AttemptListItem = {
  id: 1,
  quizId: 10,
  quizPublicId: 'pub-10',
  quizTitle: '90년대 한국 영화 명대사로 맞추기',
  quizCategory: 'culture',
  quizCategoryLabel: '문화',
  quizThumbnailUrl: null,
  playCount: 4821,
  starCount: 312,
  commentCount: 48,
  shareCount: 27,
  score: 9,
  totalQuestions: 10,
  percent: 90,
  topPercentile: 4,
  timeLimitSec: 10,
  attemptCount: 3,
  completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
};

const meta: Meta<typeof PlayedQuizCard> = {
  title: 'Features/Quiz/PlayedQuizCard',
  component: PlayedQuizCard,
  args: { onClick: () => {} },
};

export default meta;

type Story = StoryObj<typeof PlayedQuizCard>;

/** 상위 10% 이내 — 상위% primary 강조 + 다회 플레이 */
export const TopRanked: Story = {
  args: { attempt: base },
};

/** 상위 10% 밖 — 기본 톤 + 단일 플레이 + 타이머 없음 */
export const NoHighlight: Story = {
  args: {
    attempt: {
      ...base,
      quizTitle: '에반게리온 명장면 캡처 퀴즈',
      quizCategoryLabel: '만화',
      topPercentile: 61,
      timeLimitSec: null,
      attemptCount: 1,
      score: 5,
      totalQuestions: 10,
    },
  },
};

/** 첫 응시(상위% 없음) */
export const NoPercentile: Story = {
  args: {
    attempt: { ...base, topPercentile: null, attemptCount: 1 },
  },
};

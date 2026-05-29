import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MyQuizzesAggregate } from '@/types';
import ProfileCard from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ProfileCard>;

const sampleStats: MyQuizzesAggregate = {
  totalQuizCount: 12,
  totalPlayCount: 10739,
  totalShareCount: 240,
  totalStarCount: 861,
  totalCommentCount: 320,
  weeklyPlayCount: 120,
  avgCorrectRate: 58,
  solvedCount: 348,
  avgSolveRate: 64,
};

export const Default: Story = {
  args: {
    nickname: '우진',
    bio: '영화·애니 퀴즈 위주로 만들고 있어요. 가끔 음악도.',
    isProfilePublic: true,
    stats: sampleStats,
  },
};

export const Private: Story = {
  args: {
    nickname: '우진',
    bio: '비공개 프로필',
    isProfilePublic: false,
    stats: sampleStats,
  },
};

export const NoBio: Story = {
  args: {
    nickname: 'Alice',
    isProfilePublic: true,
    stats: {
      ...sampleStats,
      totalQuizCount: 1,
      totalPlayCount: 12,
      totalStarCount: 3,
      solvedCount: 12,
    },
  },
};

export const NullSolveRate: Story = {
  args: {
    nickname: '신규',
    bio: '아직 푼 퀴즈가 없어요',
    isProfilePublic: true,
    stats: { ...sampleStats, solvedCount: 0, avgSolveRate: null },
  },
};

export const NoStats: Story = {
  args: {
    nickname: 'Bob',
    bio: '신규 가입',
    isProfilePublic: true,
  },
};

export const WithImage: Story = {
  args: {
    nickname: '우진',
    imageUrl: 'https://i.pravatar.cc/200?img=12',
    bio: '커스텀 이미지 사용 중',
    isProfilePublic: true,
    stats: sampleStats,
  },
};

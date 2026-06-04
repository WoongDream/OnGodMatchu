import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PublicProfileSummary } from '@/types';
import ProfileModalView from './ProfileModalView';

const publicSummary: PublicProfileSummary = {
  userId: '00000000-0000-0000-0000-000000000001',
  nickname: '지호',
  profileImageUrl: '',
  bio: '영화·애니 위주로 어렵게 냅니다. 명대사·OST 좋아하면 환영 🙌',
  isProfilePublic: true,
  solvedCount: 209,
  avgSolveRate: 71,
  quizCount: 27,
  totalPlayCount: 23104,
  totalStarCount: 1840,
};

const privateSummary: PublicProfileSummary = {
  ...publicSummary,
  nickname: '유나',
  bio: '조용히 음악 퀴즈만 풉니다. 스포는 싫어해요.',
  isProfilePublic: false,
  solvedCount: 512,
  avgSolveRate: 58,
  quizCount: 4,
  totalPlayCount: 1290,
  totalStarCount: 96,
};

const meta: Meta<typeof ProfileModalView> = {
  title: 'Components/ProfileModalView',
  component: ProfileModalView,
  args: { isOpen: true, onClose: () => {}, onGoProfile: () => {}, isLoading: false, error: false },
};

export default meta;

type Story = StoryObj<typeof ProfileModalView>;

/** 공개 프로필 — 통계 + "프로필 보러가기" 버튼 노출 */
export const PublicProfile: Story = { args: { summary: publicSummary } };

/** 비공개 프로필 — 통계는 노출, 버튼만 숨김 */
export const PrivateProfile: Story = { args: { summary: privateSummary } };

export const Loading: Story = { args: { isLoading: true } };

export const ErrorState: Story = { args: { error: true } };

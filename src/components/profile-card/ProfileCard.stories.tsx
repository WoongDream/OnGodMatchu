import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileCard from './ProfileCard';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ProfileCard>;

export const Default: Story = {
  args: {
    nickname: '우진',
    bio: '영화·애니 퀴즈 위주로 만들고 있어요. 가끔 음악도.',
    isProfilePublic: true,
    stats: { playCount: 348, correctRate: 64, createdQuizCount: 12 },
  },
};

export const Private: Story = {
  args: {
    nickname: '우진',
    bio: '비공개 프로필',
    isProfilePublic: false,
    stats: { playCount: 348, correctRate: 64, createdQuizCount: 12 },
  },
};

export const NoBio: Story = {
  args: {
    nickname: 'Alice',
    isProfilePublic: true,
    stats: { playCount: 12, correctRate: 80, createdQuizCount: 1 },
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
    stats: { playCount: 100, correctRate: 75, createdQuizCount: 5 },
  },
};

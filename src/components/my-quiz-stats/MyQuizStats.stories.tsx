import type { Meta, StoryObj } from '@storybook/react-vite';
import MyQuizStats from './MyQuizStats';

const meta: Meta<typeof MyQuizStats> = {
  title: 'Components/MyQuizStats',
  component: MyQuizStats,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MyQuizStats>;

export const WithStats: Story = {
  args: {
    stats: {
      totalQuizCount: 12,
      totalPlayCount: 10739,
      totalShareCount: 0,
      totalStarCount: 861,
      totalCommentCount: 113,
      weeklyPlayCount: 1204,
    },
  },
};

export const Loading: Story = {
  args: {
    stats: undefined,
    isLoading: true,
  },
};

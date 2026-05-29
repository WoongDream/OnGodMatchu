import type { Meta, StoryObj } from '@storybook/react-vite';
import ResultDistribution from './ResultDistribution';

const meta: Meta<typeof ResultDistribution> = {
  title: 'Features/Quiz/Result/ResultDistribution',
  component: ResultDistribution,
};
export default meta;

type Story = StoryObj<typeof ResultDistribution>;

const sampleDistribution = Array.from({ length: 16 }, (_, i) => ({
  score: i,
  count: [0, 1, 3, 5, 8, 12, 18, 25, 30, 35, 32, 28, 22, 14, 8, 3][i],
}));

export const Default: Story = {
  args: {
    data: {
      totalAttempts: 12800,
      averageScore: 8.4,
      distribution: sampleDistribution,
    },
    myScore: 12,
    topPercentile: 7,
  },
};

export const PerfectScore: Story = {
  args: {
    data: {
      totalAttempts: 5210,
      averageScore: 6.2,
      distribution: sampleDistribution,
    },
    myScore: 15,
    topPercentile: 1,
  },
};

export const FirstAttempt: Story = {
  args: {
    data: {
      totalAttempts: 1,
      averageScore: 8.0,
      distribution: Array.from({ length: 11 }, (_, i) => ({
        score: i,
        count: i === 8 ? 1 : 0,
      })),
    },
    myScore: 8,
    topPercentile: null,
  },
};

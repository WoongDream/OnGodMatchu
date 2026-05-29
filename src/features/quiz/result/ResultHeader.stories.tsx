import type { Meta, StoryObj } from '@storybook/react-vite';
import ResultHeader from './ResultHeader';

const meta: Meta<typeof ResultHeader> = {
  title: 'Features/Quiz/Result/ResultHeader',
  component: ResultHeader,
};
export default meta;

type Story = StoryObj<typeof ResultHeader>;

export const Default: Story = {
  args: { score: 12, totalQuestions: 15, topPercentile: 7 },
};

export const Perfect: Story = {
  args: { score: 15, totalQuestions: 15, topPercentile: 1 },
};

export const Zero: Story = {
  args: { score: 0, totalQuestions: 10, topPercentile: 99 },
};

export const FirstAttempt: Story = {
  args: { score: 8, totalQuestions: 10, topPercentile: null },
};

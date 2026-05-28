import type { Meta, StoryObj } from '@storybook/react-vite';
import QuizTimer from './QuizTimer';

const meta: Meta<typeof QuizTimer> = {
  title: 'Features/Quiz/Play/QuizTimer',
  component: QuizTimer,
};
export default meta;

type Story = StoryObj<typeof QuizTimer>;

export const Default: Story = {
  args: { remainingSec: 18, totalSec: 20 },
};

export const HalfRemaining: Story = {
  args: { remainingSec: 10, totalSec: 20 },
};

export const CriticalThreshold: Story = {
  args: { remainingSec: 3, totalSec: 20 },
};

export const NearExpire: Story = {
  args: { remainingSec: 1, totalSec: 20 },
};

export const Expired: Story = {
  args: { remainingSec: 0, totalSec: 20 },
};

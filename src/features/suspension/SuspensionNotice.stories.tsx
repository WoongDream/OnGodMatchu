import type { Meta, StoryObj } from '@storybook/react-vite';
import SuspensionNotice from './SuspensionNotice';

const meta: Meta<typeof SuspensionNotice> = {
  title: 'Features/Suspension/SuspensionNotice',
  component: SuspensionNotice,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SuspensionNotice>;

export const Default: Story = {
  args: { until: '2026-12-31' },
};

export const CustomMessage: Story = {
  args: { until: '2026-12-31', message: '퀴즈 생성이 제한되었어요.' },
};

export const WithoutUntil: Story = {
  args: { until: null },
};

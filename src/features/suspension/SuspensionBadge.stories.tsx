import type { Meta, StoryObj } from '@storybook/react-vite';
import SuspensionBadge from './SuspensionBadge';

const meta: Meta<typeof SuspensionBadge> = {
  title: 'Features/Suspension/SuspensionBadge',
  component: SuspensionBadge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SuspensionBadge>;

export const WithUntil: Story = {
  args: { until: '2026-12-31' },
};

export const WithoutUntil: Story = {
  args: { until: null },
};

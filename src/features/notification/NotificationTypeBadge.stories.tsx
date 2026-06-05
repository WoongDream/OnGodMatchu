import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationTypeBadge from './NotificationTypeBadge';

const meta: Meta<typeof NotificationTypeBadge> = {
  title: 'Features/Notification/NotificationTypeBadge',
  component: NotificationTypeBadge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NotificationTypeBadge>;

export const Info: Story = {
  args: { type: 'INFO', label: '안내' },
};

export const Warning: Story = {
  args: { type: 'WARNING', label: '경고' },
};

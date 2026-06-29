import type { Meta, StoryObj } from '@storybook/react-vite';
import NoticeStatusBadge from './NoticeStatusBadge';

const meta: Meta<typeof NoticeStatusBadge> = {
  title: 'components/NoticeStatusBadge',
  component: NoticeStatusBadge,
};
export default meta;

type Story = StoryObj<typeof NoticeStatusBadge>;

export const Pinned: Story = { args: { status: 'PUBLISHED', pinned: true } };
export const Published: Story = { args: { status: 'PUBLISHED', pinned: false } };
export const Draft: Story = { args: { status: 'DRAFT', pinned: false } };

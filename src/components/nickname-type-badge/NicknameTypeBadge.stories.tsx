import type { Meta, StoryObj } from '@storybook/react-vite';
import NicknameTypeBadge from './NicknameTypeBadge';

const meta: Meta<typeof NicknameTypeBadge> = {
  title: 'components/NicknameTypeBadge',
  component: NicknameTypeBadge,
};
export default meta;

type Story = StoryObj<typeof NicknameTypeBadge>;

export const Reserved: Story = { args: { type: 'RESERVED' } };
export const Forbidden: Story = { args: { type: 'FORBIDDEN' } };

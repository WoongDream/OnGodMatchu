import type { Meta, StoryObj } from '@storybook/react-vite';
import RoleBadge from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Features/Admin/Users/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RoleBadge>;

export const Owner: Story = {
  name: 'OWNER (보라)',
  args: { role: 'OWNER' },
};

export const Admin: Story = {
  name: 'ADMIN (파랑)',
  args: { role: 'ADMIN' },
};

export const User: Story = {
  name: 'USER (회색)',
  args: { role: 'USER' },
};

export const AllRoles: Story = {
  name: '전체 역할',
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <RoleBadge role="OWNER" />
      <RoleBadge role="ADMIN" />
      <RoleBadge role="USER" />
    </div>
  ),
};

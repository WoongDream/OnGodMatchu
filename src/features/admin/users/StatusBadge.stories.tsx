import type { Meta, StoryObj } from '@storybook/react-vite';
import StatusBadge from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Features/Admin/Users/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Active: Story = {
  name: '정상 (ACTIVE)',
  args: { status: 'ACTIVE' },
};

export const Suspended: Story = {
  name: '정지 (SUSPENDED)',
  args: { status: 'SUSPENDED' },
};

export const Withdrawn: Story = {
  name: '탈퇴 (WITHDRAWN)',
  args: { status: 'WITHDRAWN' },
};

export const AllStatuses: Story = {
  name: '전체 상태',
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <StatusBadge status="ACTIVE" />
      <StatusBadge status="SUSPENDED" />
      <StatusBadge status="WITHDRAWN" />
    </div>
  ),
};

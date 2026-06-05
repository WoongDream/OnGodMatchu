import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AdminUser } from '@/api/admin';
import AdminUserListItem from './AdminUserListItem';

const noop = () => {};

const meta: Meta<typeof AdminUserListItem> = {
  title: 'Features/Admin/Users/AdminUserListItem',
  component: AdminUserListItem,
  tags: ['autodocs'],
  args: {
    onSelect: noop,
    onNotify: noop,
  },
};

export default meta;

type Story = StoryObj<typeof AdminUserListItem>;

const baseUser: AdminUser = {
  userId: 'u-1',
  nickname: '홍길동',
  email: 'gildong@example.com',
  profileImageUrl: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'kakao',
  createdAt: '2024-03-15T08:30:00Z',
  withdrawnAt: null,
};

export const Default: Story = {
  name: '기본 (USER · 정상)',
  args: { user: baseUser },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AdminUserListItem {...args} />
    </div>
  ),
};

export const AdminSuspended: Story = {
  name: 'ADMIN · 정지',
  args: {
    user: { ...baseUser, nickname: '운영자', role: 'ADMIN', status: 'SUSPENDED' },
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AdminUserListItem {...args} />
    </div>
  ),
};

export const OwnerWithImage: Story = {
  name: 'OWNER · 프로필 이미지',
  args: {
    user: {
      ...baseUser,
      nickname: '사장님',
      role: 'OWNER',
      profileImageUrl: 'https://placehold.co/64x64?text=O',
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AdminUserListItem {...args} />
    </div>
  ),
};

export const Withdrawn: Story = {
  name: '탈퇴 유저 (알림 보내기 버튼 미노출)',
  args: {
    user: {
      ...baseUser,
      nickname: 'deleted_394c6f93',
      status: 'WITHDRAWN',
      withdrawnAt: '2026-05-29T02:10:00Z',
    },
  },
  render: (args) => (
    <div style={{ maxWidth: '720px' }}>
      <AdminUserListItem {...args} />
    </div>
  ),
};

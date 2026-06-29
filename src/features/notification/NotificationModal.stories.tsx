import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UserNotification } from '@/types';
import NotificationModal from './NotificationModal';

const baseNotification: UserNotification = {
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '서비스 점검 안내',
  content: '6월 6일 02:00 ~ 04:00 동안 서비스 점검이 진행됩니다.',
  senderLabel: '운영팀',
  createdAt: '2026-06-01T09:00:00.000Z',
};

const meta: Meta<typeof NotificationModal> = {
  title: 'Features/Notification/NotificationModal',
  component: NotificationModal,
  tags: ['autodocs'],
  args: {
    notification: baseNotification,
    onNext: () => {},
    onConfirm: () => {},
    onInquiry: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof NotificationModal>;

export const Single: Story = {
  args: { total: 1, index: 0 },
};

export const FirstOfMany: Story = {
  args: { total: 3, index: 0 },
};

export const LastOfMany: Story = {
  args: {
    total: 3,
    index: 2,
    notification: { ...baseNotification, type: 'WARNING', typeLabel: '경고' },
  },
};

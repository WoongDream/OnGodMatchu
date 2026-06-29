import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UserNotification } from '@/types';
import NotificationListItem from './NotificationListItem';

const info: UserNotification = {
  id: 1,
  type: 'INFO',
  typeLabel: '안내',
  title: '이용약관이 개정되었어요',
  content:
    '2026-06-01자로 이용약관 일부가 개정되었어요. 변경된 내용은 마이페이지 > 약관에서 확인할 수 있어요.',
  senderLabel: '운영팀',
  createdAt: '2026-06-02T09:00:00.000Z',
};

const warning: UserNotification = {
  id: 2,
  type: 'WARNING',
  typeLabel: '경고',
  title: '계정 이용이 일시 제한되었어요',
  content:
    '커뮤니티 정책 위반으로 계정이 2026-06-20까지 일시 제한되었어요. 자세한 사유 확인과 이의 제기는 문의하기를 통해 알려주세요.',
  senderLabel: '운영팀',
  createdAt: '2026-06-04T09:00:00.000Z',
};

const meta: Meta<typeof NotificationListItem> = {
  title: 'Features/Notification/NotificationListItem',
  component: NotificationListItem,
  tags: ['autodocs'],
  args: { onSelect: () => {} },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NotificationListItem>;

export const Info: Story = {
  args: { notification: info },
};

export const Warning: Story = {
  args: { notification: warning },
};

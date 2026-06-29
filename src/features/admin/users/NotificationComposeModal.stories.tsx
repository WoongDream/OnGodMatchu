import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@/components/button/Button';
import type { NotificationDraft } from '@/types';
import NotificationComposeModal, { type ComposeChangeItem } from './NotificationComposeModal';

const meta: Meta<typeof NotificationComposeModal> = {
  title: 'Features/Admin/Users/NotificationComposeModal',
  component: NotificationComposeModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NotificationComposeModal>;

const recipient = { nickname: '홍길동', email: 'gildong@example.com' };

const changeSummary: ComposeChangeItem[] = [
  { label: '역할', value: 'USER → ADMIN', emphasize: true },
  { label: '상태', value: '정상 → 정지' },
];

const NotifyOnlyDemo = () => {
  const [open, setOpen] = useState(false);
  const handleSend = (draft: NotificationDraft) => {
    console.log('onSend', draft);
    setOpen(false);
  };
  return (
    <div>
      <Button onClick={() => setOpen(true)}>알림 보내기</Button>
      <NotificationComposeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        recipient={recipient}
        onSend={handleSend}
      />
    </div>
  );
};

const WithChangesDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>수정 + 알림</Button>
      <NotificationComposeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        recipient={recipient}
        changeSummary={changeSummary}
        onSend={() => setOpen(false)}
        onSaveWithoutNotification={() => setOpen(false)}
      />
    </div>
  );
};

export const NotifyOnly: Story = {
  name: '알림만 (2버튼)',
  render: () => <NotifyOnlyDemo />,
};

export const WithChangeSummary: Story = {
  name: '변경 요약 + 알림 (3버튼)',
  render: () => <WithChangesDemo />,
};

export const OpenNotifyOnly: Story = {
  name: '열린 상태 — 알림만',
  render: () => (
    <NotificationComposeModal isOpen onClose={() => {}} recipient={recipient} onSend={() => {}} />
  ),
};

export const OpenWithChanges: Story = {
  name: '열린 상태 — 변경 요약',
  render: () => (
    <NotificationComposeModal
      isOpen
      onClose={() => {}}
      recipient={recipient}
      changeSummary={changeSummary}
      onSend={() => {}}
      onSaveWithoutNotification={() => {}}
    />
  ),
};

export const Submitting: Story = {
  name: '제출 중 (버튼 비활성)',
  render: () => (
    <NotificationComposeModal
      isOpen
      onClose={() => {}}
      recipient={recipient}
      changeSummary={changeSummary}
      isSubmitting
      onSend={() => {}}
      onSaveWithoutNotification={() => {}}
    />
  ),
};

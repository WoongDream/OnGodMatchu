import type { Meta, StoryObj } from '@storybook/react-vite';
import ConfirmModal from './ConfirmModal';

const meta: Meta<typeof ConfirmModal> = {
  title: 'Components/ConfirmModal',
  component: ConfirmModal,
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: '이 퀴즈를 삭제할까요?',
    message: '삭제하면 되돌릴 수 없어요.',
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Danger: Story = {
  args: { confirmLabel: '삭제', confirmVariant: 'danger' },
};

export const Confirming: Story = {
  args: {
    confirmLabel: '삭제',
    confirmVariant: 'danger',
    isConfirming: true,
    confirmingLabel: '삭제 중...',
  },
};

export const PrimaryConfirm: Story = {
  args: {
    title: '변경 사항을 저장할까요?',
    message: undefined,
    confirmLabel: '저장',
    confirmVariant: 'primary',
  },
};

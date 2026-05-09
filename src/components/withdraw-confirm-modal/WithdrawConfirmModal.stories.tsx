import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import WithdrawConfirmModal from './WithdrawConfirmModal';
import Button from '@/components/button';

const meta: Meta<typeof WithdrawConfirmModal> = {
  title: 'Components/WithdrawConfirmModal',
  component: WithdrawConfirmModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WithdrawConfirmModal>;

const Demo = ({ count = 12 }: { count?: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="dangerOutline" onClick={() => setOpen(true)}>
        회원 탈퇴
      </Button>
      <WithdrawConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        createdQuizCount={count}
        email="user@example.com"
      />
    </div>
  );
};

export const With12Quizzes: Story = {
  render: () => <Demo />,
};

export const NoQuizzes: Story = {
  render: () => <Demo count={0} />,
};

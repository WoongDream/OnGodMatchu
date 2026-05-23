import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import PasswordChangeModal from './PasswordChangeModal';
import Button from '@/components/button';

const meta: Meta<typeof PasswordChangeModal> = {
  title: 'Components/PasswordChangeModal',
  component: PasswordChangeModal,
};

export default meta;

type Story = StoryObj<typeof PasswordChangeModal>;

const Demo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>비밀번호 변경 모달 열기</Button>
      <PasswordChangeModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  render: () => <Demo />,
};

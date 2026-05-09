import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Modal from './Modal';
import Button from '@/components/button';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Modal>;

const Demo = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="모달 제목"
        size={size}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setOpen(false)}>확인</Button>
          </>
        }
      >
        <p>모달 본문 내용입니다. esc 키, overlay 클릭, 닫기 버튼 모두 동작해요.</p>
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: () => <Demo />,
};

export const Small: Story = {
  render: () => <Demo size="sm" />,
};

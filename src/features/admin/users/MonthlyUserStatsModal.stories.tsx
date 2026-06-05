import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@/components/button/Button';
import MonthlyUserStatsModal from './MonthlyUserStatsModal';

/**
 * 실제 데이터는 useMonthlyUserStats(SWR) 로 조회한다.
 * Storybook 에서는 모달 열림/닫힘 상호작용만 확인한다 (네트워크 미목킹 시 빈 상태로 표시).
 */
const meta: Meta<typeof MonthlyUserStatsModal> = {
  title: 'Features/Admin/Users/MonthlyUserStatsModal',
  component: MonthlyUserStatsModal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MonthlyUserStatsModal>;

const Demo = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>월별 유저 수 보기</Button>
      <MonthlyUserStatsModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  name: '기본 (버튼으로 열기)',
  render: () => <Demo />,
};

export const Open: Story = {
  name: '열린 상태',
  render: () => <MonthlyUserStatsModal isOpen onClose={() => {}} />,
};

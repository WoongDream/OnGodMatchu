import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Dropdown from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'plays', label: '플레이순' },
  { value: 'shares', label: '공유하기순' },
  { value: 'stars', label: '스타순' },
  { value: 'comments', label: '댓글순' },
] as const;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState<(typeof SORT_OPTIONS)[number]['value']>('latest');
    return <Dropdown options={SORT_OPTIONS} value={v} onChange={setV} ariaLabel="정렬" />;
  },
};

export const Disabled: Story = {
  render: () => (
    <Dropdown options={SORT_OPTIONS} value="latest" onChange={() => {}} disabled ariaLabel="정렬" />
  ),
};

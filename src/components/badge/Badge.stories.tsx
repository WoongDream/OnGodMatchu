import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['success', 'info', 'warning'] },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: '공개',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: '인증 완료',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: '검수 중',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Badge variant="info">공개</Badge>
      <Badge variant="success">인증 완료</Badge>
      <Badge variant="warning">검수 중</Badge>
    </div>
  ),
};

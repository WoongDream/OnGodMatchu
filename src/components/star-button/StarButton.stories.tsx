import type { Meta, StoryObj } from '@storybook/react-vite';
import StarButton from './StarButton';

const meta: Meta<typeof StarButton> = {
  title: 'Components/StarButton',
  component: StarButton,
  args: {
    onClick: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof StarButton>;

export const InactiveIcon: Story = {
  args: { active: false, count: 142, variant: 'icon', size: 'lg' },
};

export const ActiveIcon: Story = {
  args: { active: true, count: 318, variant: 'icon', size: 'lg' },
};

export const InactiveChip: Story = {
  args: { active: false, count: 983, variant: 'chip' },
};

export const ActiveChip: Story = {
  args: { active: true, count: 983, variant: 'chip' },
};

export const NoCount: Story = {
  args: { active: false, variant: 'icon', size: 'md', showCount: false },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import ShareButton from './ShareButton';

const meta: Meta<typeof ShareButton> = {
  title: 'Components/ShareButton',
  component: ShareButton,
  args: { onClick: () => {} },
};

export default meta;

type Story = StoryObj<typeof ShareButton>;

export const Icon: Story = { args: { count: 11, variant: 'icon', size: 'md' } };
export const Chip: Story = { args: { count: 76, variant: 'chip' } };
export const NoCount: Story = { args: { variant: 'icon', size: 'md', showCount: false } };

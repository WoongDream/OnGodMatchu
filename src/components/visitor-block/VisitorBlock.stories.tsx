import type { Meta, StoryObj } from '@storybook/react-vite';
import VisitorBlock from './VisitorBlock';

const meta: Meta<typeof VisitorBlock> = {
  title: 'Components/VisitorBlock',
  component: VisitorBlock,
  tags: ['autodocs'],
  argTypes: {
    today: { control: 'number' },
    total: { control: 'number' },
  },
};

export default meta;

type Story = StoryObj<typeof VisitorBlock>;

export const Default: Story = {
  args: {
    today: 63,
    total: 7_600_000,
    daily: [12, 24, 18, 30, 41, 50, 63],
  },
};

export const Flat: Story = {
  args: {
    today: 50,
    total: 350,
    daily: [50, 50, 50, 50, 50, 50, 50],
  },
};

export const Empty: Story = {
  args: {
    today: 0,
    total: 0,
    daily: [0, 0, 0, 0, 0, 0, 0],
  },
};

export const Spike: Story = {
  args: {
    today: 1280,
    total: 25_400,
    daily: [120, 80, 95, 110, 230, 480, 1280],
  },
};

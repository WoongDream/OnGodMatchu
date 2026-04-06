import type { Meta, StoryObj } from '@storybook/react-vite';
import ChipButton from './ChipButton';

const meta: Meta<typeof ChipButton> = {
  title: 'Components/ChipButton',
  component: ChipButton,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ChipButton>;

export const Default: Story = {
  args: {
    active: false,
    children: '게임',
  },
};

export const Active: Story = {
  args: {
    active: true,
    children: '게임',
  },
};

export const AllCategories: Story = {
  render: () => {
    const categories = ['전체', '게임', '음악', '문화', '방송', '기타'];
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map((category, index) => (
          <ChipButton key={category} active={index === 0}>
            {category}
          </ChipButton>
        ))}
      </div>
    );
  },
};

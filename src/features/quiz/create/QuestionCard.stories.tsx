import type { Meta, StoryObj } from '@storybook/react-vite';
import QuestionCard from './QuestionCard';

const meta: Meta<typeof QuestionCard> = {
  title: 'Features/Quiz/Create/QuestionCard',
  component: QuestionCard,
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof QuestionCard>;

export const ImageItem: Story = {
  args: {
    variant: 'item',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=60',
    questionText: '이 차의 모델명은?',
    selected: false,
    invalid: false,
  },
};

export const TextItem: Story = {
  args: {
    variant: 'item',
    imageUrl: null,
    questionText: '대한민국의 수도는 어디일까요?',
    selected: false,
    invalid: false,
  },
};

export const Selected: Story = {
  args: {
    variant: 'item',
    imageUrl: null,
    questionText: '대한민국의 수도는 어디일까요?',
    selected: true,
    invalid: false,
  },
};

export const Invalid: Story = {
  args: {
    variant: 'item',
    imageUrl: null,
    questionText: '',
    selected: false,
    invalid: true,
  },
};

export const AddCard: Story = {
  args: {
    variant: 'add',
  },
};

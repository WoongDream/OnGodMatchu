import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  QuizIcon,
  PlayIcon,
  StarIcon,
  CommentIcon,
  ShareIcon,
  AccuracyIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from './Icon';

const meta: Meta = {
  title: 'Components/Icon',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const All: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {[
        ['quiz', QuizIcon],
        ['play', PlayIcon],
        ['star', StarIcon],
        ['comment', CommentIcon],
        ['share', ShareIcon],
        ['accuracy', AccuracyIcon],
        ['trending-up', TrendingUpIcon],
        ['arrow-up', ArrowUpIcon],
        ['arrow-down', ArrowDownIcon],
      ].map(([name, Icon]) => {
        const Component = Icon as typeof QuizIcon;
        return (
          <div
            key={name as string}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7' }}
          >
            <Component size={24} />
            <span style={{ fontSize: 12, color: '#71717a' }}>{name as string}</span>
          </div>
        );
      })}
    </div>
  ),
};

export const Sized: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#0284c7' }}>
      <QuizIcon size={16} />
      <QuizIcon size={20} />
      <QuizIcon size={24} />
      <QuizIcon size={32} />
      <QuizIcon size={48} />
    </div>
  ),
};

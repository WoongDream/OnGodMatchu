import type { Meta, StoryObj } from '@storybook/react-vite';
import MyQuizCard from './MyQuizCard';

const meta: Meta<typeof MyQuizCard> = {
  title: 'Components/MyQuizCard',
  component: MyQuizCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MyQuizCard>;

const baseItem = {
  id: 1,
  publicId: 'uuid-1',
  title: '90년대 한국 영화 명대사로 맞추기',
  category: 'movie' as const,
  categoryLabel: '영화',
  isPublic: true,
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 4821,
  shareCount: 312,
  starCount: 312,
  commentCount: 48,
  correctRate: 72,
  createdAt: '2026-05-05T10:00:00+09:00',
  updatedAt: '2026-05-05T10:00:00+09:00',
};

export const Public: Story = {
  args: {
    item: baseItem,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Private: Story = {
  args: {
    item: { ...baseItem, isPublic: false, playCount: 0, correctRate: null },
    onEdit: () => {},
    onDelete: () => {},
  },
};

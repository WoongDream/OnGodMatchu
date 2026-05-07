import type { Meta, StoryObj } from '@storybook/react-vite';
import MyQuizList from './MyQuizList';

const meta: Meta<typeof MyQuizList> = {
  title: 'Components/MyQuizList',
  component: MyQuizList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MyQuizList>;

const items = [
  {
    id: 1,
    publicId: 'uuid-1',
    title: '90년대 한국 영화 명대사로 맞추기',
    category: 'movie' as const,
    categoryLabel: '영화',
    isPublic: true,
    thumbnailKey: null,
    thumbnailUrl: null,
    playCount: 4821,
    shareCount: 12,
    starCount: 312,
    commentCount: 48,
    correctRate: 72,
    createdAt: '2026-05-05T10:00:00+09:00',
    updatedAt: '2026-05-05T10:00:00+09:00',
  },
  {
    id: 2,
    publicId: 'uuid-2',
    title: '봉준호 영화 속 소품으로 영화 맞추기',
    category: 'movie' as const,
    categoryLabel: '영화',
    isPublic: false,
    thumbnailKey: null,
    thumbnailUrl: null,
    playCount: 0,
    shareCount: 0,
    starCount: 0,
    commentCount: 0,
    correctRate: null,
    createdAt: '2026-05-07T09:30:00+09:00',
    updatedAt: '2026-05-07T09:30:00+09:00',
  },
];

export const WithItems: Story = {
  args: {
    items,
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const Empty: Story = {
  args: {
    items: [],
    onEdit: () => {},
    onDelete: () => {},
  },
};

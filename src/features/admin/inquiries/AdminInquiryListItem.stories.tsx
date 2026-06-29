import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import type { BoInquiryListItem } from '@/types';
import AdminInquiryListItem from './AdminInquiryListItem';

const meta: Meta<typeof AdminInquiryListItem> = {
  title: 'Features/Admin/Inquiries/AdminInquiryListItem',
  component: AdminInquiryListItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: '820px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AdminInquiryListItem>;

const baseItem: BoInquiryListItem = {
  id: 1,
  title: '로그인이 자꾸 풀려요',
  author: {
    publicId: 'p-1',
    nickname: '홍길동',
    profileImageUrl: null,
  },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-05-30T08:30:00Z',
};

export const Pending: Story = {
  name: '대기',
  args: { item: baseItem },
};

export const InProgress: Story = {
  name: '처리중 (프로필 이미지)',
  args: {
    item: {
      ...baseItem,
      id: 2,
      title: '퀴즈 정답이 인정되지 않습니다',
      author: {
        publicId: 'p-2',
        nickname: '김퀴즈',
        profileImageUrl: 'https://placehold.co/64x64?text=Q',
      },
      status: 'IN_PROGRESS',
      statusLabel: '처리중',
    },
  },
};

export const Done: Story = {
  name: '완료',
  args: {
    item: {
      ...baseItem,
      id: 3,
      title: '결제 영수증을 받고 싶어요',
      author: { ...baseItem.author, nickname: '이용자' },
      status: 'DONE',
      statusLabel: '완료',
    },
  },
};

export const WithdrawnAuthor: Story = {
  name: '탈퇴 유저 문의',
  args: {
    item: {
      ...baseItem,
      id: 4,
      title: '계정을 삭제했는데 메일이 와요',
      author: { publicId: null, nickname: '탈퇴한 사용자', profileImageUrl: null },
    },
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { InquiryListItem, UserNotification } from '@/types';
import InquiryCard from './InquiryCard';

const answer = (id: number, title: string): UserNotification => ({
  id,
  type: 'INFO',
  typeLabel: '안내',
  title,
  content:
    '문의 주셔서 감사해요. 말씀해주신 내용은 운영팀에서 확인했고, 다음 업데이트에 반영할 예정이에요.',
  senderLabel: '운영팀',
  createdAt: '2026-06-03T09:00:00.000Z',
});

const pending: InquiryListItem = {
  id: 1,
  title: '로그인이 자꾸 풀려요',
  content:
    '카카오 로그인으로 접속하는데 몇 분만 지나면 자동으로 로그아웃돼요. 다른 브라우저에서도 똑같이 발생합니다.',
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-06-04T10:30:00.000Z',
  answers: [],
};

const inProgress: InquiryListItem = {
  id: 2,
  title: '퀴즈 이미지가 안 올라가요',
  content: '퀴즈 만들 때 이미지를 첨부하면 업로드 중에서 멈춰요. 용량은 2MB 정도입니다.',
  status: 'IN_PROGRESS',
  statusLabel: '처리중',
  createdAt: '2026-06-03T14:00:00.000Z',
  answers: [],
};

const doneSingleAnswer: InquiryListItem = {
  id: 3,
  title: '닉네임 변경은 어떻게 하나요?',
  content: '닉네임을 바꾸고 싶은데 설정에서 메뉴를 못 찾겠어요.',
  status: 'DONE',
  statusLabel: '완료',
  createdAt: '2026-06-02T11:00:00.000Z',
  answers: [answer(101, '닉네임 변경 안내')],
};

const doneMultiAnswer: InquiryListItem = {
  id: 4,
  title: '환불 문의드립니다',
  content: '결제한 상품을 환불하고 싶어요. 절차가 궁금합니다.',
  status: 'DONE',
  statusLabel: '완료',
  createdAt: '2026-06-01T09:00:00.000Z',
  answers: [answer(201, '환불 절차 안내'), answer(202, '환불 처리 완료 안내')],
};

const meta: Meta<typeof InquiryCard> = {
  title: 'Features/Inquiry/InquiryCard',
  component: InquiryCard,
  tags: ['autodocs'],
  args: { onViewAnswer: () => {} },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InquiryCard>;

export const Pending: Story = {
  args: { inquiry: pending },
};

export const InProgress: Story = {
  args: { inquiry: inProgress },
};

export const DoneWithAnswer: Story = {
  args: { inquiry: doneSingleAnswer },
};

export const DoneWithMultipleAnswers: Story = {
  args: { inquiry: doneMultiAnswer },
};

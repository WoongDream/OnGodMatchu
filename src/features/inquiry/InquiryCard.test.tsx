import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { InquiryListItem, UserNotification } from '@/types';
import InquiryCard from './InquiryCard';

const makeAnswer = (overrides?: Partial<UserNotification>): UserNotification => ({
  id: 100,
  type: 'INFO',
  typeLabel: '안내',
  title: '답변드립니다',
  content: '문의 주셔서 감사합니다.',
  senderLabel: '운영팀',
  createdAt: '2026-06-02T09:00:00.000Z',
  ...overrides,
});

const makeInquiry = (overrides?: Partial<InquiryListItem>): InquiryListItem => ({
  id: 1,
  title: '로그인이 안돼요',
  content: '카카오 로그인이 실패합니다.',
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-06-01T09:00:00.000Z',
  answers: [],
  ...overrides,
});

const renderCard = (inquiry?: InquiryListItem) => {
  const onViewAnswer = vi.fn();
  renderWithTheme(<InquiryCard inquiry={inquiry ?? makeInquiry()} onViewAnswer={onViewAnswer} />);
  return { onViewAnswer };
};

describe('InquiryCard', () => {
  describe('내용 렌더', () => {
    it('상태 배지·접수일(앞 10자)·제목·내용을 표시한다', () => {
      renderCard(makeInquiry({ status: 'IN_PROGRESS' }));

      expect(screen.getByText('처리중')).toBeInTheDocument();
      expect(screen.getByText('2026-06-01')).toBeInTheDocument();
      expect(screen.getByText('로그인이 안돼요')).toBeInTheDocument();
      expect(screen.getByText('카카오 로그인이 실패합니다.')).toBeInTheDocument();
    });
  });

  describe('받은 답변 목록', () => {
    it('답변이 없으면 답변 영역과 버튼을 렌더하지 않는다', () => {
      renderCard(makeInquiry({ answers: [] }));
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByText(/받은 답변/)).not.toBeInTheDocument();
    });

    it('답변 개수 라벨과 각 답변 제목을 행으로 나열한다', () => {
      renderCard(
        makeInquiry({
          answers: [
            makeAnswer({ id: 1, title: '첫 답변' }),
            makeAnswer({ id: 2, title: '두 번째 답변' }),
          ],
        }),
      );

      expect(screen.getByText('받은 답변 2개')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /첫 답변/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /두 번째 답변/ })).toBeInTheDocument();
    });

    it('답변 행을 클릭하면 해당 답변으로 onViewAnswer 를 호출한다', async () => {
      const user = userEvent.setup();
      const first = makeAnswer({ id: 1, title: '첫 답변' });
      const second = makeAnswer({ id: 2, title: '두 번째 답변' });
      const { onViewAnswer } = renderCard(makeInquiry({ answers: [first, second] }));

      await user.click(screen.getByRole('button', { name: /첫 답변/ }));
      expect(onViewAnswer).toHaveBeenCalledTimes(1);
      expect(onViewAnswer).toHaveBeenCalledWith(first);

      await user.click(screen.getByRole('button', { name: /두 번째 답변/ }));
      expect(onViewAnswer).toHaveBeenCalledTimes(2);
      expect(onViewAnswer).toHaveBeenLastCalledWith(second);
    });
  });

  describe('displayName', () => {
    it('displayName 이 "InquiryCard" 이다', () => {
      expect(InquiryCard.displayName).toBe('InquiryCard');
    });
  });
});

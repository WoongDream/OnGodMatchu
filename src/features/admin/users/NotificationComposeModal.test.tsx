import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import NotificationComposeModal, { type ComposeChangeItem } from './NotificationComposeModal';

const recipient = { nickname: '홍길동', email: 'gildong@example.com' };

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  recipient,
  onSend: vi.fn(),
};

const fillTitleAndContent = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('알림 제목'), '점검 안내');
  await user.type(
    screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'),
    '내일 점검합니다.',
  );
};

describe('NotificationComposeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('open/close', () => {
    it('isOpen=false 면 dialog 가 렌더되지 않는다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true 면 받는 사람 정보가 렌더된다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      expect(screen.getByText(/홍길동/)).toBeInTheDocument();
      expect(screen.getByText(/gildong@example.com/)).toBeInTheDocument();
    });
  });

  describe('유형 toggle', () => {
    it('안내 / 경고 옵션이 렌더된다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      expect(screen.getByRole('button', { name: '안내' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '경고' })).toBeInTheDocument();
    });

    it('경고로 토글하면 onSend draft.type 이 WARNING 으로 전달된다', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      renderWithTheme(<NotificationComposeModal {...baseProps} onSend={onSend} />);
      await user.click(screen.getByRole('button', { name: '경고' }));
      await fillTitleAndContent(user);
      await user.click(screen.getByRole('button', { name: '알림 보내기' }));
      expect(onSend).toHaveBeenCalledWith({
        type: 'WARNING',
        title: '점검 안내',
        content: '내일 점검합니다.',
      });
    });
  });

  describe('보내기 비활성 조건', () => {
    it('제목/내용이 비면 보내기 버튼이 비활성이다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeDisabled();
    });

    it('제목만 채우면 여전히 비활성이다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      await user.type(screen.getByPlaceholderText('알림 제목'), '제목만');
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeDisabled();
    });

    it('공백만 입력하면 비활성이다 (trim)', async () => {
      const user = userEvent.setup();
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      await user.type(screen.getByPlaceholderText('알림 제목'), '   ');
      await user.type(screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'), '   ');
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeDisabled();
    });

    it('제목과 내용을 모두 채우면 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      await fillTitleAndContent(user);
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeEnabled();
    });

    it('isSubmitting=true 면 채워져 있어도 보내기 버튼이 비활성이다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<NotificationComposeModal {...baseProps} isSubmitting />);
      await fillTitleAndContent(user);
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeDisabled();
    });
  });

  describe('onSend', () => {
    it('보내기 클릭 시 trim 된 draft 가 전달된다', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      renderWithTheme(<NotificationComposeModal {...baseProps} onSend={onSend} />);
      await user.type(screen.getByPlaceholderText('알림 제목'), '  제목  ');
      await user.type(
        screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'),
        '  내용  ',
      );
      await user.click(screen.getByRole('button', { name: '알림 보내기' }));
      expect(onSend).toHaveBeenCalledWith({ type: 'INFO', title: '제목', content: '내용' });
    });

    it('취소 버튼 클릭 시 onClose 가 호출된다', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithTheme(<NotificationComposeModal {...baseProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeSummary 분기', () => {
    const changeSummary: ComposeChangeItem[] = [
      { label: '역할', value: 'USER → ADMIN', emphasize: true },
      { label: '상태', value: '정상' },
    ];

    it('changeSummary 가 없으면 버튼이 2개(보내기/취소)이고 보내기 라벨은 "알림 보내기" 이다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} />);
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '알림 없이 수정 저장' })).not.toBeInTheDocument();
      expect(screen.queryByText('이번에 저장되는 변경사항')).not.toBeInTheDocument();
    });

    it('changeSummary 가 있으면 변경 요약과 항목들이 렌더된다', () => {
      renderWithTheme(
        <NotificationComposeModal
          {...baseProps}
          changeSummary={changeSummary}
          onSaveWithoutNotification={vi.fn()}
        />,
      );
      expect(screen.getByText('이번에 저장되는 변경사항')).toBeInTheDocument();
      expect(screen.getByText('역할')).toBeInTheDocument();
      expect(screen.getByText('USER → ADMIN')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
    });

    it('changeSummary + onSaveWithoutNotification 이면 버튼이 3개이고 보내기 라벨이 "알림 보내고 수정 저장" 이다', () => {
      renderWithTheme(
        <NotificationComposeModal
          {...baseProps}
          changeSummary={changeSummary}
          onSaveWithoutNotification={vi.fn()}
        />,
      );
      expect(screen.getByRole('button', { name: '알림 보내고 수정 저장' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '알림 없이 수정 저장' })).toBeInTheDocument();
    });

    it('빈 배열 changeSummary 는 변경 없음으로 취급된다 (2버튼)', () => {
      renderWithTheme(
        <NotificationComposeModal
          {...baseProps}
          changeSummary={[]}
          onSaveWithoutNotification={vi.fn()}
        />,
      );
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '알림 없이 수정 저장' })).not.toBeInTheDocument();
    });

    it('changeSummary 가 있어도 onSaveWithoutNotification 이 없으면 "알림 없이 수정 저장" 버튼은 미렌더된다', () => {
      renderWithTheme(<NotificationComposeModal {...baseProps} changeSummary={changeSummary} />);
      expect(screen.queryByRole('button', { name: '알림 없이 수정 저장' })).not.toBeInTheDocument();
    });

    it('"알림 없이 수정 저장" 클릭 시 onSaveWithoutNotification 이 호출된다', async () => {
      const user = userEvent.setup();
      const onSaveWithoutNotification = vi.fn();
      renderWithTheme(
        <NotificationComposeModal
          {...baseProps}
          changeSummary={changeSummary}
          onSaveWithoutNotification={onSaveWithoutNotification}
        />,
      );
      await user.click(screen.getByRole('button', { name: '알림 없이 수정 저장' }));
      expect(onSaveWithoutNotification).toHaveBeenCalledTimes(1);
    });

    it('isSubmitting=true 면 취소/알림 없이 수정 저장 버튼도 비활성이다', () => {
      renderWithTheme(
        <NotificationComposeModal
          {...baseProps}
          changeSummary={changeSummary}
          onSaveWithoutNotification={vi.fn()}
          isSubmitting
        />,
      );
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '알림 없이 수정 저장' })).toBeDisabled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "NotificationComposeModal" 이다', () => {
      expect(NotificationComposeModal.displayName).toBe('NotificationComposeModal');
    });
  });
});

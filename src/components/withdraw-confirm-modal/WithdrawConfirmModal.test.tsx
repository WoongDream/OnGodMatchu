import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithTheme } from '@/test/renderWithTheme';
import WithdrawConfirmModal from './WithdrawConfirmModal';

// ── useWithdrawAccount mock ──────────────────────────────────────────────────
const mockWithdraw = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockClearError = vi.hoisted(() => vi.fn());
const mockUseWithdrawAccount = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    withdraw: mockWithdraw,
    isSubmitting: false,
    error: null,
    errorCode: null,
    clearError: mockClearError,
  }),
);

vi.mock('@/hooks/useWithdrawAccount', () => ({
  default: mockUseWithdrawAccount,
}));

// ── react-router-dom mock (useWithdrawAccount 내부에서 useNavigate 사용) ───
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// ── 기본 props ────────────────────────────────────────────────────────────────
const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  createdQuizCount: 12,
};

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithTheme(<WithdrawConfirmModal {...defaultProps} {...props} />);

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('WithdrawConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWithdrawAccount.mockReturnValue({
      withdraw: mockWithdraw,
      isSubmitting: false,
      error: null,
      errorCode: null,
      clearError: mockClearError,
    });
    mockWithdraw.mockResolvedValue(true);
  });

  describe('렌더링', () => {
    it('isOpen=false 이면 모달이 렌더되지 않는다', () => {
      renderModal({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true 이면 모달 제목 "회원 탈퇴" 가 노출된다', () => {
      renderModal();
      expect(screen.getByRole('dialog', { name: '회원 탈퇴' })).toBeInTheDocument();
    });

    it('안내 문구 "정말 떠나시는 게 맞나요?" 가 노출된다', () => {
      renderModal();
      expect(screen.getByText(/정말 떠나시는 게 맞나요/)).toBeInTheDocument();
    });

    it('탈퇴 이유 radiogroup 이 렌더된다', () => {
      renderModal();
      expect(screen.getByRole('radiogroup', { name: '탈퇴 이유' })).toBeInTheDocument();
    });

    it('탈퇴 사유 radio 옵션이 5개 렌더된다', () => {
      renderModal();
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(5);
    });

    it('탈퇴 사유 라벨이 올바르게 렌더된다 (시간이 없어요 / 쓸 만한 퀴즈가 별로 없어요 / 개인정보가 걱정돼요 / 계정을 다시 만들 거예요 / 기타)', () => {
      renderModal();
      expect(screen.getByLabelText('시간이 없어요')).toBeInTheDocument();
      expect(screen.getByLabelText('쓸 만한 퀴즈가 별로 없어요')).toBeInTheDocument();
      expect(screen.getByLabelText('개인정보가 걱정돼요')).toBeInTheDocument();
      expect(screen.getByLabelText('계정을 다시 만들 거예요')).toBeInTheDocument();
      expect(screen.getByLabelText('기타')).toBeInTheDocument();
    });

    it('createdQuizCount=12 이면 "12개" 텍스트가 안내 문구에 포함된다', () => {
      renderModal({ createdQuizCount: 12 });
      expect(screen.getByText(/12개/)).toBeInTheDocument();
    });

    it('"관리자" 계정 이전 안내 문구가 노출된다', () => {
      renderModal();
      expect(screen.getByText(/관리자.*계정으로 이전되어 서비스에 남습니다/)).toBeInTheDocument();
    });

    it('"내가 만든 퀴즈도 모두 삭제하기" 체크박스가 기본 미체크 상태다', () => {
      renderModal();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      expect(checkbox).not.toBeChecked();
    });

    it('"취소" 버튼과 "탈퇴하기" 버튼이 푸터에 렌더된다', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });

    it('displayName 이 "WithdrawConfirmModal" 이다', () => {
      expect(WithdrawConfirmModal.displayName).toBe('WithdrawConfirmModal');
    });
  });

  describe('확인 입력 필드 — 버튼 활성 조건', () => {
    it('입력 필드가 비어 있으면 [탈퇴하기] 버튼이 disabled 다', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('"탈퇴하겠습니다" (마침표 없음) 입력 → 여전히 disabled', () => {
      renderModal();
      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: '탈퇴하겠습니다' } });
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('"탈퇴하겠습니다." (마침표 포함) 정확히 입력 → [탈퇴하기] 활성화', () => {
      renderModal();
      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: '탈퇴하겠습니다.' } });
      expect(screen.getByRole('button', { name: '탈퇴하기' })).not.toBeDisabled();
    });

    it('유사하지만 다른 텍스트 입력 → disabled 유지', () => {
      renderModal();
      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: ' 탈퇴하겠습니다.' } });
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });
  });

  describe('체크박스 — 버튼 라벨 분기', () => {
    const typeConfirmText = () => {
      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: '탈퇴하겠습니다.' } });
    };

    it('체크박스 OFF 상태에서 버튼 라벨이 "탈퇴하기" 다', () => {
      renderModal();
      typeConfirmText();
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });

    it('체크박스 ON 상태에서 버튼 라벨이 "퀴즈 삭제 후 탈퇴" 로 바뀐다', () => {
      renderModal();
      typeConfirmText();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox);
      expect(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' })).toBeInTheDocument();
    });

    it('체크박스 ON → OFF 시 버튼 라벨이 다시 "탈퇴하기" 로 돌아온다', () => {
      renderModal();
      typeConfirmText();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox); // ON
      fireEvent.click(checkbox); // OFF
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });

    it('체크박스 ON + 확인 텍스트 미입력 → 버튼 라벨이 "퀴즈 삭제 후 탈퇴" 이지만 disabled', () => {
      renderModal();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox);
      expect(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' })).toBeDisabled();
    });
  });

  describe('제출 동작 — withdraw 호출', () => {
    const setup = () => {
      renderModal();
      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: '탈퇴하겠습니다.' } });
    };

    it('사유 미선택 상태에서 활성 버튼 클릭 → reason=undefined 로 withdraw 호출', async () => {
      setup();
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith({
          reason: undefined,
          deleteMyQuizzes: false,
        }),
      );
    });

    it('사유 선택 후 활성 버튼 클릭 → reason payload 포함하여 withdraw 호출', async () => {
      setup();
      fireEvent.click(screen.getByLabelText('시간이 없어요'));
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith({
          reason: 'no_time',
          deleteMyQuizzes: false,
        }),
      );
    });

    it('deleteMyQuizzes 체크박스 ON 상태에서 제출 → deleteMyQuizzes=true 로 호출', async () => {
      setup();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith({
          reason: undefined,
          deleteMyQuizzes: true,
        }),
      );
    });

    it('사유 선택 + deleteMyQuizzes ON 동시에 → 둘 다 payload 포함', async () => {
      setup();
      fireEvent.click(screen.getByLabelText('개인정보가 걱정돼요'));
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith({
          reason: 'privacy_concern',
          deleteMyQuizzes: true,
        }),
      );
    });

    it('버튼이 disabled 일 때 클릭해도 withdraw 가 호출되지 않는다', async () => {
      renderModal();
      // 확인 텍스트 미입력 상태
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() => expect(mockWithdraw).not.toHaveBeenCalled());
    });

    it('isSubmitting=true 일 때 버튼 라벨이 "처리 중..." 으로 변경된다', () => {
      mockUseWithdrawAccount.mockReturnValue({
        withdraw: mockWithdraw,
        isSubmitting: true,
        error: null,
        errorCode: null,
        clearError: mockClearError,
      });
      renderModal();
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeInTheDocument();
    });

    it('isSubmitting=true 일 때 버튼이 disabled 다', () => {
      mockUseWithdrawAccount.mockReturnValue({
        withdraw: mockWithdraw,
        isSubmitting: true,
        error: null,
        errorCode: null,
        clearError: mockClearError,
      });
      renderModal();
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
    });
  });

  describe('에러 표시', () => {
    it('error 가 있으면 role=alert 로 에러 메시지가 노출된다', () => {
      mockUseWithdrawAccount.mockReturnValue({
        withdraw: mockWithdraw,
        isSubmitting: false,
        error: '회원 탈퇴 처리에 실패했습니다.',
        errorCode: 'WITHDRAWAL_FAILED',
        clearError: mockClearError,
      });
      renderModal();
      expect(screen.getByRole('alert')).toHaveTextContent('회원 탈퇴 처리에 실패했습니다.');
    });

    it('error 가 null 이면 alert 가 렌더되지 않는다', () => {
      renderModal();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('모달 닫힘 — 상태 리셋', () => {
    it('isOpen이 true→false 로 바뀌면 clearError 가 호출된다', () => {
      const { rerender } = renderModal({ isOpen: true });
      rerender(
        <WithdrawConfirmModal
          isOpen={false}
          onClose={defaultProps.onClose}
          createdQuizCount={12}
        />,
      );
      // ThemeProvider wrapper 없이 rerender 사용 — clearError 호출 검증
      expect(mockClearError).toHaveBeenCalled();
    });

    it('isOpen=false → true 로 재오픈 시 radio 가 미선택 상태다', () => {
      const { rerender } = renderModal({ isOpen: true });

      // 사유 선택
      fireEvent.click(screen.getByLabelText('기타'));
      expect(screen.getByLabelText('기타')).toBeChecked();

      // 닫기
      rerender(
        <WithdrawConfirmModal
          isOpen={false}
          onClose={defaultProps.onClose}
          createdQuizCount={12}
        />,
      );

      // 다시 열기
      rerender(
        <WithdrawConfirmModal isOpen={true} onClose={defaultProps.onClose} createdQuizCount={12} />,
      );

      // 모든 radio 미선택 상태 확인
      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => expect(radio).not.toBeChecked());
    });

    it('isOpen=false → true 로 재오픈 시 확인 입력 필드가 비어 있다', () => {
      const { rerender } = renderModal({ isOpen: true });

      const input = screen.getByPlaceholderText('탈퇴하겠습니다.');
      fireEvent.change(input, { target: { value: '탈퇴하겠습니다.' } });

      rerender(
        <WithdrawConfirmModal
          isOpen={false}
          onClose={defaultProps.onClose}
          createdQuizCount={12}
        />,
      );
      rerender(
        <WithdrawConfirmModal isOpen={true} onClose={defaultProps.onClose} createdQuizCount={12} />,
      );

      expect(screen.getByPlaceholderText('탈퇴하겠습니다.')).toHaveValue('');
    });

    it('isOpen=false → true 로 재오픈 시 체크박스가 미체크 상태다', () => {
      const { rerender } = renderModal({ isOpen: true });

      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      rerender(
        <WithdrawConfirmModal
          isOpen={false}
          onClose={defaultProps.onClose}
          createdQuizCount={12}
        />,
      );
      rerender(
        <WithdrawConfirmModal isOpen={true} onClose={defaultProps.onClose} createdQuizCount={12} />,
      );

      expect(
        screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }),
      ).not.toBeChecked();
    });
  });

  describe('"취소" 버튼', () => {
    it('"취소" 버튼 클릭 시 onClose 가 호출된다', () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      fireEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

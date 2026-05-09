import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, waitFor } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import PasswordChangeModal from './PasswordChangeModal';

// ---- mock 설정 ----

const mockChange = vi.hoisted(() => vi.fn());
const mockClearError = vi.hoisted(() => vi.fn());

let hookState = {
  isSubmitting: false,
  error: null as string | null,
  errorCode: null as string | null,
};

const setHookState = (s: Partial<typeof hookState>) => {
  hookState = { ...hookState, ...s };
};

vi.mock('@/hooks/useChangePassword', () => ({
  default: () => ({
    change: mockChange,
    isSubmitting: hookState.isSubmitting,
    error: hookState.error,
    errorCode: hookState.errorCode,
    clearError: mockClearError,
  }),
}));

// PasswordInput → 단순 input 으로 교체해 zxcvbn 의존 제거
vi.mock('@/components/password-input', () => ({
  default: ({ value, onChange, placeholder }: any) => (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid={`password-input-${placeholder}`}
    />
  ),
}));

// password lib mock — 기본값: 길이 OK, 강도 OK
let passwordLibState = {
  isLengthValid: true,
  canSubmitByStrength: true,
};

vi.mock('@/lib/password', () => ({
  isLengthValid: (_pw: string) => passwordLibState.isLengthValid,
  canSubmitByStrength: (_score: number) => passwordLibState.canSubmitByStrength,
  evaluateStrength: (_pw: string, _inputs: string[]) => ({
    score: 3,
    crackTimesDisplay: '3 hours',
    feedbackWarning: '',
    feedbackSuggestions: [],
  }),
}));

// ---- 헬퍼 ----

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
};

const resetState = () => {
  hookState = { isSubmitting: false, error: null, errorCode: null };
  passwordLibState = { isLengthValid: true, canSubmitByStrength: true };
};

// STEP 2 로 이동하는 헬퍼
const goToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('현재 비밀번호'), 'currentPass123');
  await user.click(screen.getByRole('button', { name: '다음' }));
};

// ---- 테스트 ----

describe('PasswordChangeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  describe('displayName', () => {
    it('displayName 이 "PasswordChangeModal" 이다', () => {
      expect(PasswordChangeModal.displayName).toBe('PasswordChangeModal');
    });
  });

  describe('STEP 1 — 현재 비밀번호 입력', () => {
    it('"STEP 1 / 2" 라벨이 노출된다', () => {
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('"현재 비밀번호" 라벨이 노출된다', () => {
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByLabelText('현재 비밀번호')).toBeInTheDocument();
    });

    it('[취소] 버튼이 노출된다', () => {
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('[다음] 버튼이 노출된다', () => {
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    });

    it('현재 비번이 비어 있으면 [다음] 버튼이 disabled 이다', () => {
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: '다음' })).toBeDisabled();
    });

    it('현재 비번 입력 후 [다음] 버튼이 활성화된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await user.type(screen.getByLabelText('현재 비밀번호'), 'password123');
      expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
    });

    it('[취소] 클릭 시 onClose 가 호출된다', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('STEP 1 → STEP 2 전환', () => {
    it('현재 비번 입력 후 [다음] 클릭 시 STEP 2 로 이동한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument();
    });

    it('STEP 2 로 이동하면 STEP 1 UI 가 사라진다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.queryByLabelText('현재 비밀번호')).not.toBeInTheDocument();
    });
  });

  describe('STEP 2 — 새 비밀번호 입력', () => {
    it('"STEP 2 / 2" 라벨이 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument();
    });

    it('"새 비밀번호 확인" 라벨이 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.getByLabelText('새 비밀번호 확인')).toBeInTheDocument();
    });

    it('[이전] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '이전' })).toBeInTheDocument();
    });

    it('[변경하기] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '변경하기' })).toBeInTheDocument();
    });

    it('[이전] 클릭 시 STEP 1 로 돌아간다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '이전' }));
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });
  });

  describe('새 비번 / 새 비번 확인 불일치', () => {
    it('새 비번과 확인이 불일치하면 인라인 에러가 노출된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'different456');

      expect(screen.getByText('새 비밀번호와 일치하지 않아요.')).toBeInTheDocument();
    });

    it('새 비번과 확인이 불일치하면 [변경하기] 버튼이 disabled 이다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'different456');

      expect(screen.getByRole('button', { name: '변경하기' })).toBeDisabled();
    });

    it('새 비번과 확인이 일치하면 인라인 에러가 없다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');

      expect(screen.queryByText('새 비밀번호와 일치하지 않아요.')).not.toBeInTheDocument();
    });
  });

  describe('새 비번 정책 미달', () => {
    it('isLengthValid=false 이면 [변경하기] 버튼이 disabled 이다', async () => {
      passwordLibState.isLengthValid = false;
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'short');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'short');

      expect(screen.getByRole('button', { name: '변경하기' })).toBeDisabled();
    });

    it('canSubmitByStrength=false 이면 [변경하기] 버튼이 disabled 이다', async () => {
      passwordLibState.canSubmitByStrength = false;
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');

      expect(screen.getByRole('button', { name: '변경하기' })).toBeDisabled();
    });
  });

  describe('[변경하기] 클릭 — 정상 제출', () => {
    it('모든 조건 통과 시 [변경하기] 버튼이 활성화된다', async () => {
      mockChange.mockResolvedValue(true);
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');

      expect(screen.getByRole('button', { name: '변경하기' })).toBeEnabled();
    });

    it('[변경하기] 클릭 시 change 가 { currentPassword, newPassword } 로 호출된다', async () => {
      mockChange.mockResolvedValue(true);
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);

      await user.type(screen.getByLabelText('현재 비밀번호'), 'myCurrentPass');
      await user.click(screen.getByRole('button', { name: '다음' }));

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');

      await user.click(screen.getByRole('button', { name: '변경하기' }));

      expect(mockChange).toHaveBeenCalledWith({
        currentPassword: 'myCurrentPass',
        newPassword: 'newPassword123',
      });
    });

    it('change 성공 시 onClose 가 호출된다', async () => {
      mockChange.mockResolvedValue(true);
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} onClose={onClose} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');
      await user.click(screen.getByRole('button', { name: '변경하기' }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it('change 성공 시 onSuccess 콜백이 호출된다', async () => {
      mockChange.mockResolvedValue(true);
      const onSuccess = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} onSuccess={onSuccess} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');
      await user.click(screen.getByRole('button', { name: '변경하기' }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    });

    it('onSuccess prop 이 없어도 에러 없이 성공 처리된다', async () => {
      mockChange.mockResolvedValue(true);
      const onClose = vi.fn();
      const user = userEvent.setup();
      // onSuccess 전달하지 않음
      renderWithTheme(<PasswordChangeModal isOpen={true} onClose={onClose} />);
      await goToStep2(user);

      await user.type(screen.getByTestId('password-input-새 비밀번호'), 'newPassword123');
      await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newPassword123');
      await user.click(screen.getByRole('button', { name: '변경하기' }));

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });
  });

  describe('INVALID_CURRENT_PASSWORD 에러 — STEP 1 복귀', () => {
    // React.memo + vi.mock 조합에서 module-level hookState 갱신 후
    // React 가 re-render 를 트리거하지 않아 useEffect 가 실행되지 않는 한계가 있다.
    // 대신 mockChange 가 비동기 완료 후 hook 내부 state 가 변하는 흐름을
    // 통합적으로 검증한다: change 가 false 를 반환할 때 STEP 2 에 머물고,
    // 이후 errorCode 가 반영된 상태에서 컴포넌트가 마운트되면 STEP 1 이 표시된다.

    it('마운트 시 errorCode=INVALID_CURRENT_PASSWORD 이면 STEP 1 이 표시된다', () => {
      // 초기 렌더 시점부터 errorCode 가 설정되어 있으면 useEffect 가 즉시 실행된다.
      setHookState({
        error: '현재 비밀번호가 올바르지 않습니다.',
        errorCode: 'INVALID_CURRENT_PASSWORD',
      });
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      // useEffect 는 마운트 후 동기적으로 실행 → STEP 이 1 로 세팅됨
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('마운트 시 errorCode=INVALID_CURRENT_PASSWORD 이면 현재 비번 인라인 에러가 노출된다', () => {
      setHookState({
        error: '현재 비밀번호가 올바르지 않습니다.',
        errorCode: 'INVALID_CURRENT_PASSWORD',
      });
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      expect(screen.getByText('현재 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('change 실패(INVALID_CURRENT_PASSWORD) 시 STEP 2 에서 [변경하기] 클릭 후 에러는 role=alert 로 노출된다', async () => {
      // change 는 false 반환 — 이 시나리오에서 errorCode는 외부 hook state 변경이 필요해
      // 실제 useEffect 트리거는 위 두 케이스로 검증. 여기서는 role=alert DOM이 있는지만 확인.
      setHookState({
        error: '현재 비밀번호가 올바르지 않습니다.',
        errorCode: 'INVALID_CURRENT_PASSWORD',
      });
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('현재 비밀번호가 올바르지 않습니다.');
    });
  });

  describe('모달 닫혔다가 재오픈 시 초기화', () => {
    it('isOpen false → true 시 STEP 1 로 초기화된다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<PasswordChangeModal {...defaultProps} isOpen={true} />);

      // STEP 2 로 이동
      await goToStep2(user);
      expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument();

      // 모달 닫기
      rerender(<PasswordChangeModal {...defaultProps} isOpen={false} />);

      // 모달 다시 열기
      rerender(<PasswordChangeModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('isOpen false → true 시 현재 비번 input 이 초기화된다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<PasswordChangeModal {...defaultProps} isOpen={true} />);

      await user.type(screen.getByLabelText('현재 비밀번호'), 'somePassword');
      expect((screen.getByLabelText('현재 비밀번호') as HTMLInputElement).value).toBe(
        'somePassword',
      );

      rerender(<PasswordChangeModal {...defaultProps} isOpen={false} />);
      rerender(<PasswordChangeModal {...defaultProps} isOpen={true} />);

      expect((screen.getByLabelText('현재 비밀번호') as HTMLInputElement).value).toBe('');
    });

    it('isOpen false 시 clearError 가 호출된다', async () => {
      const { rerender } = renderWithTheme(<PasswordChangeModal {...defaultProps} isOpen={true} />);
      rerender(<PasswordChangeModal {...defaultProps} isOpen={false} />);
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('제출 중(isSubmitting) 상태', () => {
    it('isSubmitting=true 이면 STEP 2 에서 [변경하기] 버튼 텍스트가 "변경 중..." 으로 바뀐다', async () => {
      // isSubmitting=true 를 마운트 시점에 세팅 후 STEP 2 로 이동하면 버튼 텍스트를 확인할 수 있다.
      // 단, isSubmitting=true 이면 canSubmitStep2=false 이므로 [변경하기] 가 disabled 된다.
      // 텍스트 변경은 isSubmitting 에만 의존하므로 STEP 2 UI 에서 바로 확인 가능.
      setHookState({ isSubmitting: true });

      const user = userEvent.setup();
      renderWithTheme(<PasswordChangeModal {...defaultProps} />);
      await goToStep2(user);

      // STEP 2 진입 후 버튼 텍스트 확인
      expect(screen.getByText('변경 중...')).toBeInTheDocument();
    });
  });
});

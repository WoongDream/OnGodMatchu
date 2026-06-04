import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, waitFor } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import WithdrawConfirmModal from './WithdrawConfirmModal';

// ── useWithdrawalCode mock ──────────────────────────────────────────────────

const mockSendCode = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockCodeReset = vi.hoisted(() => vi.fn());
const mockVerify = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockClearVerifyError = vi.hoisted(() => vi.fn());

let codeState = {
  codeSent: false,
  isSending: false,
  secondsLeft: 0,
  expired: false,
  resendIn: 0,
  canResend: false,
  errorCode: null as string | null,
  retryAfter: 0,
  isVerifying: false,
  verifyErrorCode: null as string | null,
};

const setCodeState = (s: Partial<typeof codeState>) => {
  codeState = { ...codeState, ...s };
};

const resetCodeState = () => {
  codeState = {
    codeSent: false,
    isSending: false,
    secondsLeft: 0,
    expired: false,
    resendIn: 0,
    canResend: false,
    errorCode: null,
    retryAfter: 0,
    isVerifying: false,
    verifyErrorCode: null,
  };
};

vi.mock('@/hooks/useWithdrawalCode', () => ({
  default: () => ({
    codeSent: codeState.codeSent,
    isSending: codeState.isSending,
    secondsLeft: codeState.secondsLeft,
    expired: codeState.expired,
    resendIn: codeState.resendIn,
    canResend: codeState.canResend,
    errorCode: codeState.errorCode,
    retryAfter: codeState.retryAfter,
    isVerifying: codeState.isVerifying,
    verifyErrorCode: codeState.verifyErrorCode,
    sendCode: mockSendCode,
    reset: mockCodeReset,
    verify: mockVerify,
    clearVerifyError: mockClearVerifyError,
  }),
}));

// ── useWithdrawAccount mock ─────────────────────────────────────────────────

const mockWithdraw = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockWithdrawClearError = vi.hoisted(() => vi.fn());

let withdrawState = {
  isSubmitting: false,
  error: null as string | null,
  errorCode: null as string | null,
};

const setWithdrawState = (s: Partial<typeof withdrawState>) => {
  withdrawState = { ...withdrawState, ...s };
};

const resetWithdrawState = () => {
  withdrawState = { isSubmitting: false, error: null, errorCode: null };
};

vi.mock('@/hooks/useWithdrawAccount', () => ({
  default: () => ({
    withdraw: mockWithdraw,
    isSubmitting: withdrawState.isSubmitting,
    error: withdrawState.error,
    errorCode: withdrawState.errorCode,
    clearError: mockWithdrawClearError,
  }),
}));

// useWithdrawAccount 내부에서 useNavigate 사용
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// ── 헬퍼 ───────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  createdQuizCount: 12,
  email: 'user@example.com',
};

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithTheme(<WithdrawConfirmModal {...defaultProps} {...props} />);

/** step 1 → [다음] 클릭하여 step 2 로 이동 */
const goToStep2 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: '다음' }));
};

/** step 2 에서 코드 + 확인 문구 입력 → 제출 가능 상태로 만드는 헬퍼 */
const fillStep2ReadyToSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  setCodeState({ codeSent: true, secondsLeft: 299, expired: false });
  await goToStep2(user);
  await user.type(screen.getByLabelText('인증코드'), '123456');
  await user.click(screen.getByRole('button', { name: '인증' }));
  await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
};

// ── 테스트 ─────────────────────────────────────────────────────────────────

describe('WithdrawConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCodeState();
    resetWithdrawState();
    mockVerify.mockResolvedValue(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('displayName', () => {
    it('displayName 이 "WithdrawConfirmModal" 이다', () => {
      expect(WithdrawConfirmModal.displayName).toBe('WithdrawConfirmModal');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 1 — 기본 렌더링', () => {
    it('isOpen=false 이면 모달이 렌더되지 않는다', () => {
      renderModal({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true 이면 모달 제목 "회원 탈퇴" 가 노출된다', () => {
      renderModal();
      expect(screen.getByRole('dialog', { name: '회원 탈퇴' })).toBeInTheDocument();
    });

    it('"STEP 1 / 2" 표시가 노출된다', () => {
      renderModal();
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('"정말 떠나시는 게 맞나요?" 안내 문구가 노출된다', () => {
      renderModal();
      expect(screen.getByText(/정말 떠나시는 게 맞나요/)).toBeInTheDocument();
    });

    it('탈퇴 이유 textarea 가 노출된다', () => {
      renderModal();
      expect(screen.getByLabelText('탈퇴 이유')).toBeInTheDocument();
    });

    it('탈퇴 이유 textarea placeholder 가 올바르다', () => {
      renderModal();
      expect(screen.getByPlaceholderText('떠나는 이유를 알려주세요 (선택)')).toBeInTheDocument();
    });

    it('초기 카운터 "0/500" 이 노출된다', () => {
      renderModal();
      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('createdQuizCount=12 시 안내 문구에 "12개" 가 포함된다', () => {
      renderModal({ createdQuizCount: 12 });
      expect(screen.getByText(/12개/)).toBeInTheDocument();
    });

    it('createdQuizCount=7 시 안내 문구에 "7개" 가 포함된다', () => {
      renderModal({ createdQuizCount: 7 });
      expect(screen.getByText(/7개/)).toBeInTheDocument();
    });

    it('"관리자" 계정 이전 안내 문구가 노출된다', () => {
      renderModal();
      expect(screen.getByText(/'관리자' 계정으로/)).toBeInTheDocument();
    });

    it('「내가 만든 퀴즈도 모두 삭제하기」 체크박스가 기본 미체크 상태다', () => {
      renderModal();
      const checkbox = screen.getByRole('checkbox', {
        name: /내가 만든 퀴즈도 모두 삭제하기/,
      });
      expect(checkbox).not.toBeChecked();
    });

    it('정책 안내문("탈퇴한 사용자") 이 노출된다', () => {
      renderModal();
      expect(screen.getByText(/'탈퇴한 사용자'/)).toBeInTheDocument();
    });

    it('Footer 에 [취소] 버튼이 노출된다', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('Footer 에 [다음] 버튼이 노출된다', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    });

    it('Step 1 에서 인증코드 input 이 노출되지 않는다', () => {
      renderModal();
      expect(screen.queryByLabelText('인증코드')).not.toBeInTheDocument();
    });

    it('Step 1 에서 확인 문구 input 이 노출되지 않는다', () => {
      renderModal();
      expect(screen.queryByPlaceholderText('탈퇴하겠습니다.')).not.toBeInTheDocument();
    });

    it('Step 1 의 [다음] 버튼은 입력 없이도 활성 상태다', () => {
      renderModal();
      expect(screen.getByRole('button', { name: '다음' })).toBeEnabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 1 — textarea 카운터', () => {
    it('입력 시 카운터가 갱신된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.type(screen.getByLabelText('탈퇴 이유'), '안녕');
      expect(screen.getByText('2/500')).toBeInTheDocument();
    });

    it('500자 초과 입력 시 500자에서 잘린다', async () => {
      const user = userEvent.setup();
      renderModal();
      const over501 = 'a'.repeat(501);
      await user.type(screen.getByLabelText('탈퇴 이유'), over501);
      const textarea = screen.getByLabelText('탈퇴 이유') as HTMLTextAreaElement;
      expect(textarea.value.length).toBe(500);
      expect(screen.getByText('500/500')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 1 — 체크박스', () => {
    it('체크박스 클릭 시 체크 상태가 된다', async () => {
      const user = userEvent.setup();
      renderModal();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('체크박스 ON → OFF 토글이 동작한다', async () => {
      const user = userEvent.setup();
      renderModal();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      await user.click(checkbox);
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 1 — [취소] 버튼', () => {
    it('[취소] 클릭 시 onClose 가 호출된다', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderModal({ onClose });
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 1 → Step 2 전환', () => {
    it('[다음] 클릭 시 "STEP 2 / 2" 표시로 전환된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument();
    });

    it('Step 2 전환 시 "본인 확인" 안내 문구가 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(
        screen.getByText(/본인 확인을 위해 가입하신 이메일로 인증코드를 보내드릴게요/),
      ).toBeInTheDocument();
    });

    it('Step 2 전환 시 [인증코드 받기] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '인증코드 받기' })).toBeInTheDocument();
    });

    it('Step 2 전환 시 확인 문구 input 이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByPlaceholderText('탈퇴하겠습니다.')).toBeInTheDocument();
    });

    it('Step 2 에서 textarea 가 노출되지 않는다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.queryByLabelText('탈퇴 이유')).not.toBeInTheDocument();
    });

    it('Step 2 에서 체크박스가 노출되지 않는다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(
        screen.queryByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }),
      ).not.toBeInTheDocument();
    });

    it('[다음] 클릭 시 clearError 가 호출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(mockWithdrawClearError).toHaveBeenCalled();
    });

    it('Step 2 Footer 에 [이전] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '이전' })).toBeInTheDocument();
    });

    it('Step 2 Footer 에 [탈퇴하기] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 → Step 1 (이전)', () => {
    it('[이전] 클릭 시 "STEP 1 / 2" 표시로 복귀한다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '이전' }));
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('[이전] 클릭 시 clearError 가 호출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      vi.clearAllMocks();
      await user.click(screen.getByRole('button', { name: '이전' }));
      expect(mockWithdrawClearError).toHaveBeenCalled();
    });

    it('step 1 에서 입력한 reasonText 가 이전 후에도 보존된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.type(screen.getByLabelText('탈퇴 이유'), '서비스가 불편해요');
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '이전' }));
      expect((screen.getByLabelText('탈퇴 이유') as HTMLTextAreaElement).value).toBe(
        '서비스가 불편해요',
      );
    });

    it('step 1 에서 체크한 체크박스 상태가 이전 후에도 보존된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }));
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '이전' }));
      expect(
        screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }),
      ).toBeChecked();
    });

    it('step 2 에서 입력한 코드가 이전 후 다시 step 2 가면 보존된다', async () => {
      setCodeState({ codeSent: true, secondsLeft: 299, expired: false });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '이전' }));
      // step 1 로 돌아온 후 다시 step 2 로
      await goToStep2(user);
      expect((screen.getByLabelText('인증코드') as HTMLInputElement).value).toBe('123456');
    });

    it('step 2 에서 입력한 확인 문구가 이전 후 다시 step 2 가면 보존된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      await user.click(screen.getByRole('button', { name: '이전' }));
      await goToStep2(user);
      expect((screen.getByPlaceholderText('탈퇴하겠습니다.') as HTMLInputElement).value).toBe(
        '탈퇴하겠습니다.',
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 발송 전 인증코드 영역', () => {
    it('발송 전 email 안내 "인증코드를 보내드릴게요" 가 노출된다', async () => {
      const user = userEvent.setup();
      renderModal({ email: 'user@example.com' });
      await goToStep2(user);
      // 상단 인트로 + 코드 영역 둘 다 같은 표현이므로 최소 1개 이상 노출 확인
      expect(screen.getAllByText(/인증코드를 보내드릴게요/).length).toBeGreaterThan(0);
    });

    it('발송 전 email 주소가 안내 문구에 포함된다', async () => {
      const user = userEvent.setup();
      renderModal({ email: 'user@example.com' });
      await goToStep2(user);
      expect(screen.getByText(/user@example\.com/)).toBeInTheDocument();
    });

    it('다른 email 값도 안내 문구에 반영된다', async () => {
      const user = userEvent.setup();
      renderModal({ email: 'another@test.co.kr' });
      await goToStep2(user);
      expect(screen.getByText(/another@test\.co\.kr/)).toBeInTheDocument();
    });

    it('[인증코드 받기] 버튼이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '인증코드 받기' })).toBeInTheDocument();
    });

    it('코드 input 이 노출되지 않는다 (발송 전)', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.queryByLabelText('인증코드')).not.toBeInTheDocument();
    });

    it('[인증코드 받기] 클릭 시 sendCode 가 호출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '인증코드 받기' }));
      expect(mockSendCode).toHaveBeenCalledTimes(1);
    });

    it('isSending=true 시 버튼 라벨이 "발송 중..." 으로 바뀐다', async () => {
      setCodeState({ isSending: true });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '발송 중...' })).toBeInTheDocument();
    });

    it('isSending=true 시 버튼이 disabled 다', async () => {
      setCodeState({ isSending: true });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '발송 중...' })).toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 발송 후 인증코드 영역', () => {
    beforeEach(() => {
      setCodeState({ codeSent: true, secondsLeft: 299, resendIn: 59, canResend: false });
    });

    it('[인증코드 받기] 버튼이 사라진다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.queryByRole('button', { name: '인증코드 받기' })).not.toBeInTheDocument();
    });

    it('코드 input 이 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByLabelText('인증코드')).toBeInTheDocument();
    });

    it('쿨다운 중이면 재발송 버튼이 "Ns" 라벨로 disabled 다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '59s' })).toBeDisabled();
    });

    it('발송 후 성공 메시지 "인증코드를 이메일로 보냈어요" 가 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByText(/인증코드를 이메일로 보냈어요/)).toBeInTheDocument();
    });

    it('코드 input 에 숫자 이외 문자 입력 시 무시된다 (영문 a)', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const input = screen.getByLabelText('인증코드') as HTMLInputElement;
      await user.type(input, 'a');
      expect(input.value).toBe('');
    });

    it('코드 input 에 숫자+영문 혼합 입력 시 숫자만 남는다 ("12345abc6" → "123456")', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const input = screen.getByLabelText('인증코드') as HTMLInputElement;
      await user.type(input, '12345abc6');
      expect(input.value).toBe('123456');
    });

    it('코드 input 에 숫자 6자리까지 입력된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const input = screen.getByLabelText('인증코드') as HTMLInputElement;
      await user.type(input, '123456');
      expect(input.value).toBe('123456');
    });

    it('코드 input 에 7자리 입력 시 6자리로 잘린다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const input = screen.getByLabelText('인증코드') as HTMLInputElement;
      await user.type(input, '1234567');
      expect(input.value).toBe('123456');
    });

    it('canResend=true 시 [다시 받기] 버튼이 활성화된다', async () => {
      setCodeState({ codeSent: true, canResend: true, resendIn: 0, secondsLeft: 200 });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '재발송' })).toBeEnabled();
    });

    it('canResend=false 시 재발송 버튼이 "Ns" 라벨로 disabled 다', async () => {
      setCodeState({ codeSent: true, canResend: false, resendIn: 45, secondsLeft: 200 });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '45s' })).toBeDisabled();
    });

    it('[다시 받기] 클릭 시 sendCode 가 호출된다', async () => {
      setCodeState({ codeSent: true, canResend: true, resendIn: 0, secondsLeft: 200 });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.click(screen.getByRole('button', { name: '재발송' }));
      expect(mockSendCode).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 코드 만료 상태', () => {
    beforeEach(() => {
      setCodeState({ codeSent: true, secondsLeft: 0, expired: true, canResend: true });
    });

    it('"코드가 만료되었어요. 다시 받아주세요." 안내가 노출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByText('코드가 만료되었어요. 다시 받아주세요.')).toBeInTheDocument();
    });

    it('코드 input 이 여전히 노출된다 (만료 상태)', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByLabelText('인증코드')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 인증 버튼 (verify)', () => {
    beforeEach(() => {
      setCodeState({ codeSent: true, secondsLeft: 299, expired: false });
    });

    it('코드 6자리 입력 후 [인증] 클릭 시 verify 가 입력 코드로 호출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      expect(mockVerify).toHaveBeenCalledWith('123456');
    });

    it('verify 성공(true) 시 "✓ 인증되었어요." 가 노출된다', async () => {
      mockVerify.mockResolvedValue(true);
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      expect(await screen.findByText('✓ 인증되었어요.')).toBeInTheDocument();
    });

    it('verify 성공 시 코드 input 이 disabled 된다', async () => {
      mockVerify.mockResolvedValue(true);
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await screen.findByText('✓ 인증되었어요.');
      expect(screen.getByLabelText('인증코드')).toBeDisabled();
    });

    it('verify 실패(false) 시 verified 되지 않아 "✓ 인증되었어요." 가 노출되지 않는다', async () => {
      mockVerify.mockResolvedValue(false);
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await waitFor(() => expect(mockVerify).toHaveBeenCalled());
      expect(screen.queryByText('✓ 인증되었어요.')).not.toBeInTheDocument();
    });

    it('verify 실패 + verifyErrorCode=INVALID_VERIFICATION_CODE → "인증코드가 올바르지 않습니다." 인라인 에러', async () => {
      mockVerify.mockResolvedValue(false);
      setCodeState({
        codeSent: true,
        secondsLeft: 299,
        expired: false,
        verifyErrorCode: 'INVALID_VERIFICATION_CODE',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alerts = screen.getAllByRole('alert');
      const found = alerts.find((el) => el.textContent?.includes('인증코드가 올바르지 않습니다.'));
      expect(found).toBeTruthy();
    });

    it('verifyErrorCode=VERIFICATION_CODE_EXPIRED → "인증코드가 만료되었어요. 다시 받아주세요." 인라인 에러', async () => {
      setCodeState({
        codeSent: true,
        secondsLeft: 299,
        expired: false,
        verifyErrorCode: 'VERIFICATION_CODE_EXPIRED',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alerts = screen.getAllByRole('alert');
      const found = alerts.find((el) =>
        el.textContent?.includes('인증코드가 만료되었어요. 다시 받아주세요.'),
      );
      expect(found).toBeTruthy();
    });

    it('코드 input 변경 시 verifyErrorCode 가 있으면 clearVerifyError 가 호출된다', async () => {
      setCodeState({
        codeSent: true,
        secondsLeft: 299,
        expired: false,
        verifyErrorCode: 'INVALID_VERIFICATION_CODE',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '1');
      expect(mockClearVerifyError).toHaveBeenCalled();
    });

    it('isVerifying=true 시 [인증] 버튼 라벨이 "확인 중..." 이고 disabled 다', async () => {
      setCodeState({
        codeSent: true,
        secondsLeft: 299,
        expired: false,
        isVerifying: true,
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      const button = screen.getByRole('button', { name: '확인 중...' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — RATE_LIMITED inline 에러', () => {
    it('errorCode=RATE_LIMITED + resendIn>0 시 inline 에러가 코드 영역에 노출된다', async () => {
      setCodeState({
        codeSent: true,
        secondsLeft: 200,
        errorCode: 'RATE_LIMITED',
        resendIn: 30,
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByText('잠시 후 다시 시도해주세요. (30초)')).toBeInTheDocument();
    });

    it('resendIn=0 이면 RATE_LIMITED inline 에러가 노출되지 않는다', async () => {
      setCodeState({
        codeSent: true,
        secondsLeft: 200,
        errorCode: 'RATE_LIMITED',
        resendIn: 0,
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.queryByText(/잠시 후 다시 시도해주세요/)).not.toBeInTheDocument();
    });

    it('미발송 상태 + RATE_LIMITED + resendIn>0 → [인증코드 받기] disabled + inline 안내 노출', async () => {
      setCodeState({
        codeSent: false,
        errorCode: 'RATE_LIMITED',
        resendIn: 45,
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '인증코드 받기' })).toBeDisabled();
      expect(screen.getByText('잠시 후 다시 시도해주세요. (45초)')).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 제출 버튼 활성 조건', () => {
    it('코드 미발송 → [탈퇴하기] disabled', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('코드 발송됐지만 코드 미입력 → disabled', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('코드 6자리 + 확인 문구 불일치 → disabled', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다');
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('코드 6자리 + 인증 클릭 + 확인 문구 일치 → 활성', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeEnabled();
    });

    it('만료 상태 → disabled', async () => {
      setCodeState({ codeSent: true, secondsLeft: 0, expired: true });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeDisabled();
    });

    it('isSubmitting=true → disabled, 라벨 "처리 중..."', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      setWithdrawState({ isSubmitting: true });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 체크박스(step 1) → 버튼 라벨 분기', () => {
    beforeEach(() => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
    });

    it('체크박스 OFF → step 2 버튼 라벨 "탈퇴하기"', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });

    it('체크박스 ON (step 1 에서 토글) → step 2 버튼 라벨 "퀴즈 삭제 후 탈퇴"', async () => {
      const user = userEvent.setup();
      renderModal();
      // step 1 에서 체크박스 ON
      await user.click(screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }));
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      expect(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' })).toBeInTheDocument();
    });

    it('체크박스 ON + 조건 미달 → "퀴즈 삭제 후 탈퇴" disabled', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }));
      await goToStep2(user);
      // 확인 문구 미입력
      expect(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' })).toBeDisabled();
    });

    it('체크박스 ON → OFF 시 step 2 버튼 라벨 "탈퇴하기" 로 복귀', async () => {
      const user = userEvent.setup();
      renderModal();
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      await user.click(checkbox);
      await user.click(checkbox);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 제출 동작 (withdraw 페이로드)', () => {
    it('활성 + 클릭 시 withdraw 가 호출된다', async () => {
      const user = userEvent.setup();
      renderModal();
      await fillStep2ReadyToSubmit(user);
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() => expect(mockWithdraw).toHaveBeenCalledTimes(1));
    });

    it('기본 페이로드 — verificationCode + confirmationPhrase + deleteOwnQuizzes=false', async () => {
      const user = userEvent.setup();
      renderModal();
      await fillStep2ReadyToSubmit(user);
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith({
          verificationCode: '123456',
          confirmationPhrase: '탈퇴하겠습니다.',
          deleteOwnQuizzes: false,
        }),
      );
    });

    it('reasonText 비어 있으면 payload 에 reasonText 미포함', async () => {
      const user = userEvent.setup();
      renderModal();
      await fillStep2ReadyToSubmit(user);
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith(
          expect.not.objectContaining({ reasonText: expect.anything() }),
        ),
      );
    });

    it('reasonText 입력 시 trim 후 payload 에 포함된다', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      // step 1 에서 textarea 입력
      await user.type(screen.getByLabelText('탈퇴 이유'), '  서비스가 불편해요  ');
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith(
          expect.objectContaining({ reasonText: '서비스가 불편해요' }),
        ),
      );
    });

    it('공백만 있는 reasonText 는 payload 에 미포함', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      await user.type(screen.getByLabelText('탈퇴 이유'), '   ');
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith(
          expect.not.objectContaining({ reasonText: expect.anything() }),
        ),
      );
    });

    it('체크박스 ON → deleteOwnQuizzes=true 로 호출, 라벨 "퀴즈 삭제 후 탈퇴"', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }));
      await goToStep2(user);
      await user.type(screen.getByLabelText('인증코드'), '123456');
      await user.click(screen.getByRole('button', { name: '인증' }));
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      await user.click(screen.getByRole('button', { name: '퀴즈 삭제 후 탈퇴' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith(
          expect.objectContaining({ deleteOwnQuizzes: true }),
        ),
      );
    });

    it('체크박스 OFF → deleteOwnQuizzes=false 로 호출', async () => {
      const user = userEvent.setup();
      renderModal();
      await fillStep2ReadyToSubmit(user);
      await user.click(screen.getByRole('button', { name: '탈퇴하기' }));
      await waitFor(() =>
        expect(mockWithdraw).toHaveBeenCalledWith(
          expect.objectContaining({ deleteOwnQuizzes: false }),
        ),
      );
    });

    it('canSubmit=false 일 때 disabled 버튼은 클릭해도 withdraw 가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const button = screen.getByRole('button', { name: '탈퇴하기' });
      expect(button).toBeDisabled();
      expect(mockWithdraw).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Step 2 — 에러 분기 (인라인)', () => {
    beforeEach(() => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
    });

    it('errorCode=INVALID_VERIFICATION_CODE → 코드 input 영역에 에러 (role=alert)', async () => {
      setWithdrawState({
        error: '인증코드가 올바르지 않습니다.',
        errorCode: 'INVALID_VERIFICATION_CODE',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alerts = screen.getAllByRole('alert');
      const found = alerts.find((el) => el.textContent?.includes('인증코드가 올바르지 않습니다.'));
      expect(found).toBeTruthy();
    });

    it('errorCode=INVALID_VERIFICATION_CODE → 확인 문구 input 다음에 alert 없음', async () => {
      setWithdrawState({
        error: '인증코드가 올바르지 않습니다.',
        errorCode: 'INVALID_VERIFICATION_CODE',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const confirmInput = screen.getByPlaceholderText('탈퇴하겠습니다.');
      expect(confirmInput.nextElementSibling).toBeNull();
    });

    it('errorCode=VERIFICATION_CODE_EXPIRED → 코드 input 영역에 에러', async () => {
      setWithdrawState({
        error: '인증코드가 만료되었습니다.',
        errorCode: 'VERIFICATION_CODE_EXPIRED',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alerts = screen.getAllByRole('alert');
      const found = alerts.find((el) => el.textContent?.includes('인증코드가 만료되었습니다.'));
      expect(found).toBeTruthy();
    });

    it('errorCode=INVALID_WITHDRAWAL_CONFIRMATION → 확인 문구 영역에 에러', async () => {
      setWithdrawState({
        error: '확인 문구가 올바르지 않습니다.',
        errorCode: 'INVALID_WITHDRAWAL_CONFIRMATION',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alerts = screen.getAllByRole('alert');
      const found = alerts.find((el) => el.textContent?.includes('확인 문구가 올바르지 않습니다.'));
      expect(found).toBeTruthy();
    });

    it('errorCode=RATE_LIMITED → general 에러 영역에 미노출', async () => {
      setWithdrawState({
        error: '잠시 후 다시 시도해주세요.',
        errorCode: 'RATE_LIMITED',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      // withdraw hook 의 RATE_LIMITED 에러는 general 영역에 표시되지 않음
      expect(screen.queryByText('잠시 후 다시 시도해주세요.')).toBeNull();
    });

    it('그 외 errorCode (NETWORK) → general 에러 메시지가 role=alert 로 노출된다', async () => {
      setWithdrawState({
        error: '네트워크 오류가 발생했습니다.',
        errorCode: 'NETWORK',
      });
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('네트워크 오류가 발생했습니다.');
    });

    it('error=null 이면 general alert 가 없다', async () => {
      const user = userEvent.setup();
      renderModal();
      await goToStep2(user);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('모달 닫힘 → 상태 리셋', () => {
    it('isOpen false 시 useWithdrawalCode.reset() 이 호출된다', () => {
      const { rerender } = renderModal({ isOpen: true });
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      expect(mockCodeReset).toHaveBeenCalled();
    });

    it('isOpen false 시 useWithdrawAccount.clearError() 이 호출된다', () => {
      const { rerender } = renderModal({ isOpen: true });
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      expect(mockWithdrawClearError).toHaveBeenCalled();
    });

    it('isOpen false → true 재오픈 시 step 1 으로 리셋된다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderModal({ isOpen: true });
      await goToStep2(user);
      expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument();
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument();
    });

    it('isOpen false → true 재오픈 시 사유 textarea 가 비워진다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderModal({ isOpen: true });
      await user.type(screen.getByLabelText('탈퇴 이유'), '불편해요');
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={true} />);
      expect((screen.getByLabelText('탈퇴 이유') as HTMLTextAreaElement).value).toBe('');
    });

    it('isOpen false → true 재오픈 시 체크박스가 미체크 상태다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderModal({ isOpen: true });
      const checkbox = screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ });
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={true} />);
      expect(
        screen.getByRole('checkbox', { name: /내가 만든 퀴즈도 모두 삭제하기/ }),
      ).not.toBeChecked();
    });

    it('isOpen false → true 재오픈 시 확인 문구 input 이 비워진다', async () => {
      setCodeState({ codeSent: true, secondsLeft: 200, expired: false });
      const user = userEvent.setup();
      const { rerender } = renderModal({ isOpen: true });
      await goToStep2(user);
      await user.type(screen.getByPlaceholderText('탈퇴하겠습니다.'), '탈퇴하겠습니다.');
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={false} />);
      rerender(<WithdrawConfirmModal {...defaultProps} isOpen={true} />);
      // 재오픈 후 step 2 로 이동해서 확인
      await goToStep2(user);
      expect(screen.getByPlaceholderText('탈퇴하겠습니다.')).toHaveValue('');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('overlay 닫힘 차단', () => {
    it('overlay 클릭해도 모달이 닫히지 않는다 (closeOnOverlay=false)', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderModal({ onClose });
      // overlay = dialog 의 부모 (createPortal 의 첫 div)
      const dialog = screen.getByRole('dialog');
      const overlay = dialog.parentElement!;
      await user.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

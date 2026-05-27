import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithTheme } from '@/test/renderWithTheme';
import TermsAgreementPage from './TermsAgreementPage';

// ── react-router-dom mock ─────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ── swr mock ──────────────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: mockMutate }),
}));

// ── @/api/user mock ───────────────────────────────────────────────────────────
const mockAgreeTerms = vi.hoisted(() => vi.fn());

vi.mock('@/api/user', () => ({
  agreeTerms: mockAgreeTerms,
  mapUserError: (error: unknown) => {
    const err = error as {
      isAxiosError?: boolean;
      response?: { status?: number; data?: { error?: { code?: string } } };
    };
    const code = err.response?.data?.error?.code;
    const status = err.response?.status;
    if (code === 'TERMS_AGREEMENT_OUTDATED') {
      return 'TERMS_AGREEMENT_OUTDATED';
    }
    if (code === 'RATE_LIMITED' || status === 429) {
      return 'RATE_LIMITED';
    }
    if (status === 401) {
      return 'UNAUTHORIZED';
    }
    return 'NETWORK';
  },
  USER_ERROR_MESSAGES: {
    NICKNAME_TAKEN: '이미 사용 중인 닉네임입니다.',
    INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
    INVALID_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
    INVALID_WITHDRAWAL_CONFIRMATION: '확인 문구가 일치하지 않습니다.',
    INVALID_VERIFICATION_CODE: '인증코드가 올바르지 않습니다.',
    VERIFICATION_CODE_EXPIRED: '인증코드가 만료되었어요. 다시 받아주세요.',
    RATE_LIMITED: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
    TERMS_AGREEMENT_OUTDATED: '약관 동의가 필요합니다.',
    PROFILE_PRIVATE: '비공개 프로필입니다.',
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    INVALID_INPUT: '입력값을 다시 확인해주세요.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    NETWORK: '네트워크 오류가 발생했습니다.',
  },
}));

// ── @/api/auth mock ───────────────────────────────────────────────────────────
const mockLogoutApi = vi.hoisted(() => vi.fn());

vi.mock('@/api/auth', () => ({
  logout: mockLogoutApi,
}));

// ── @/lib/auth mock ───────────────────────────────────────────────────────────
const mockClearAuthSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  clearAuthSession: mockClearAuthSession,
}));

// ── @/store/authStore mock ────────────────────────────────────────────────────
const mockAuthStoreLogout = vi.hoisted(() => vi.fn());
const mockAuthStoreSetUser = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: {
    getState: vi.fn(() => ({
      logout: mockAuthStoreLogout,
      setUser: mockAuthStoreSetUser,
    })),
  },
}));

// ── TermsAgreementCheckboxes mock ─────────────────────────────────────────────
// mock 컴포넌트는 체크박스 상태를 직접 제어하는 버튼을 노출해
// 페이지 로직(canAgree, disabled 전파)을 검증할 수 있게 함
vi.mock('@/components/terms-agreement-checkboxes', () => {
  type TermsAgreementState = {
    agreedToTerms: boolean;
    agreedToPrivacy: boolean;
  };

  type Props = {
    value: TermsAgreementState;
    onChange: (next: TermsAgreementState) => void;
    disabled?: boolean;
  };

  const MockTermsAgreementCheckboxes = ({ value, onChange, disabled }: Props) =>
    React.createElement(
      'div',
      { 'data-testid': 'terms-checkboxes', 'data-disabled': String(disabled ?? false) },
      React.createElement(
        'button',
        { onClick: () => onChange({ agreedToTerms: true, agreedToPrivacy: true }) },
        '필수 동의',
      ),
      React.createElement(
        'button',
        { onClick: () => onChange({ agreedToTerms: false, agreedToPrivacy: false }) },
        '동의 해제',
      ),
      React.createElement('input', {
        type: 'checkbox',
        'data-testid': 'mock-checkbox',
        disabled,
        readOnly: true,
        checked: value.agreedToTerms,
      }),
    );

  MockTermsAgreementCheckboxes.displayName = 'TermsAgreementCheckboxes';

  return { default: MockTermsAgreementCheckboxes };
});

// ── 가짜 axios 에러 생성 헬퍼 ──────────────────────────────────────────────────
const makeAxiosError = (status: number, code?: string) => {
  const err = Object.assign(new Error('AxiosError'), {
    isAxiosError: true,
    response: {
      status,
      data: code ? { error: { code } } : {},
    },
  });
  return err;
};

// ── User fixture ──────────────────────────────────────────────────────────────
const updatedUser = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스터',
  provider: 'LOCAL' as const,
  profileImageKey: null,
  profileImageUrl: null,
  isProfilePublic: true,
  createdAt: '2024-01-01T00:00:00Z',
  needsTermsAgreement: false,
};

// ── render 헬퍼 ───────────────────────────────────────────────────────────────
const render = () => renderWithTheme(<TermsAgreementPage />);

describe('TermsAgreementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAgreeTerms.mockResolvedValue(updatedUser);
    mockLogoutApi.mockResolvedValue(undefined);
  });

  // ── displayName ──────────────────────────────────────────────────────────────
  describe('displayName', () => {
    it('displayName 이 "TermsAgreementPage" 이다', () => {
      expect(TermsAgreementPage.displayName).toBe('TermsAgreementPage');
    });
  });

  // ── 초기 렌더 ────────────────────────────────────────────────────────────────
  describe('초기 렌더', () => {
    it('"약관 동의" 제목이 렌더된다', () => {
      render();
      expect(screen.getByRole('heading', { name: '약관 동의' })).toBeInTheDocument();
    });

    it('안내 문구가 렌더된다', () => {
      render();
      expect(screen.getByText(/OnGodMatchu 서비스를 이용하려면/)).toBeInTheDocument();
    });

    it('"동의하고 계속하기" 버튼이 렌더된다', () => {
      render();
      expect(screen.getByRole('button', { name: '동의하고 계속하기' })).toBeInTheDocument();
    });

    it('"거부하고 로그아웃" 버튼이 렌더된다', () => {
      render();
      expect(screen.getByRole('button', { name: '거부하고 로그아웃' })).toBeInTheDocument();
    });

    it('TermsAgreementCheckboxes mock 이 렌더된다', () => {
      render();
      expect(screen.getByTestId('terms-checkboxes')).toBeInTheDocument();
    });
  });

  // ── 동의 버튼 disabled 상태 ───────────────────────────────────────────────────
  describe('[동의하고 계속하기] 버튼 disabled 상태', () => {
    it('초기 상태 (필수 2개 미체크) 에서 disabled 다', () => {
      render();
      expect(screen.getByRole('button', { name: '동의하고 계속하기' })).toBeDisabled();
    });

    it('필수 2개 체크 후 enabled 다', () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      expect(screen.getByRole('button', { name: '동의하고 계속하기' })).not.toBeDisabled();
    });

    it('동의 해제하면 다시 disabled 다', () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의 해제' }));
      expect(screen.getByRole('button', { name: '동의하고 계속하기' })).toBeDisabled();
    });
  });

  // ── [동의하고 계속하기] 클릭 — 성공 흐름 ─────────────────────────────────────
  describe('[동의하고 계속하기] 클릭 — 성공', () => {
    it('agreeTerms 가 인자 없이 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(mockAgreeTerms).toHaveBeenCalledOnce());
      expect(mockAgreeTerms).toHaveBeenCalledWith();
    });

    it('성공 시 useAuthStore.getState().setUser 가 응답 user 로 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(mockAuthStoreSetUser).toHaveBeenCalledOnce());
      expect(mockAuthStoreSetUser).toHaveBeenCalledWith(updatedUser);
    });

    it('성공 시 mutate(["profile","me"], user, {revalidate:false}) 가 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(mockMutate).toHaveBeenCalledOnce());
      expect(mockMutate).toHaveBeenCalledWith(['profile', 'me'], updatedUser, {
        revalidate: false,
      });
    });

    it('성공 시 setUser → mutate 순서로 호출된다', async () => {
      const callOrder: string[] = [];
      mockAuthStoreSetUser.mockImplementation(() => callOrder.push('setUser'));
      mockMutate.mockImplementation(() => {
        callOrder.push('mutate');
        return Promise.resolve();
      });

      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
      expect(callOrder).toEqual(['setUser', 'mutate']);
    });

    it('성공 시 navigate("/", {replace: true}) 가 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
    });
  });

  // ── [동의하고 계속하기] 클릭 — 실패 흐름 ─────────────────────────────────────
  describe('[동의하고 계속하기] 클릭 — 실패', () => {
    it('axios 에러 발생 시 에러 메시지가 렌더된다', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(500));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('네트워크 오류가 발생했습니다.'),
      );
    });

    it('axios 에러 발생 시 navigate 가 호출되지 않는다', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(500));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('RATE_LIMITED 에러 시 해당 메시지가 렌더된다', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(429, 'RATE_LIMITED'));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.',
        ),
      );
    });

    it('에러 후 버튼이 다시 활성화된다 (isAgreeing=false)', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(500));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(screen.getByRole('button', { name: '동의하고 계속하기' })).not.toBeDisabled();
    });

    it('에러 시 setUser 가 호출되지 않는다', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(500));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(mockAuthStoreSetUser).not.toHaveBeenCalled();
    });

    it('에러 시 mutate 가 호출되지 않는다', async () => {
      mockAgreeTerms.mockRejectedValue(makeAxiosError(500));
      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── [거부하고 로그아웃] 클릭 — 성공 흐름 ────────────────────────────────────
  describe('[거부하고 로그아웃] 클릭 — 성공', () => {
    it('logoutApi 가 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockLogoutApi).toHaveBeenCalledOnce());
    });

    it('clearAuthSession 이 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockClearAuthSession).toHaveBeenCalledOnce());
    });

    it('authStore.logout 이 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockAuthStoreLogout).toHaveBeenCalledOnce());
    });

    it('navigate("/login", {replace: true}) 가 호출된다', async () => {
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));
    });
  });

  // ── [거부하고 로그아웃] 클릭 — logout API 실패해도 세션 정리 ──────────────────
  describe('[거부하고 로그아웃] — logout API 실패 시', () => {
    it('logout API 실패해도 clearAuthSession 이 호출된다', async () => {
      mockLogoutApi.mockRejectedValue(new Error('network'));
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockClearAuthSession).toHaveBeenCalledOnce());
    });

    it('logout API 실패해도 authStore.logout 이 호출된다', async () => {
      mockLogoutApi.mockRejectedValue(new Error('network'));
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockAuthStoreLogout).toHaveBeenCalledOnce());
    });

    it('logout API 실패해도 navigate("/login") 가 호출된다', async () => {
      mockLogoutApi.mockRejectedValue(new Error('network'));
      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));
    });
  });

  // ── 처리 중 disabled 상태 (TermsAgreementCheckboxes disabled prop) ────────────
  describe('처리 중 체크박스 disabled', () => {
    it('isAgreeing 중에는 TermsAgreementCheckboxes 에 disabled=true 가 전달된다', async () => {
      // agreeTerms 가 즉시 resolve 되지 않도록 제어
      let resolveAgreeTerms!: (user: typeof updatedUser) => void;
      mockAgreeTerms.mockReturnValue(
        new Promise<typeof updatedUser>((res) => {
          resolveAgreeTerms = res;
        }),
      );

      render();
      fireEvent.click(screen.getByRole('button', { name: '필수 동의' }));
      fireEvent.click(screen.getByRole('button', { name: '동의하고 계속하기' }));

      // agreeTerms 가 pending 인 동안 체크박스가 disabled 여야 함
      await waitFor(() => expect(screen.getByTestId('mock-checkbox')).toBeDisabled());

      // 정리
      resolveAgreeTerms(updatedUser);
    });

    it('isLoggingOut 중에는 TermsAgreementCheckboxes 에 disabled=true 가 전달된다', async () => {
      let resolveLogout!: () => void;
      mockLogoutApi.mockReturnValue(
        new Promise<void>((res) => {
          resolveLogout = res;
        }),
      );

      render();
      fireEvent.click(screen.getByRole('button', { name: '거부하고 로그아웃' }));

      await waitFor(() => expect(screen.getByTestId('mock-checkbox')).toBeDisabled());

      // 정리
      resolveLogout();
    });

    it('초기 상태에서 체크박스는 disabled 가 아니다', () => {
      render();
      expect(screen.getByTestId('mock-checkbox')).not.toBeDisabled();
    });
  });
});

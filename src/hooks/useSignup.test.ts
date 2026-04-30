import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { AxiosError } from 'axios';
import useSignup from './useSignup';

// -----------------------------------------------------------------------
// Hoisted mock variables
// -----------------------------------------------------------------------
const mockNavigate = vi.hoisted(() => vi.fn());
const mockSignup = vi.hoisted(() => vi.fn());
const mockVerifyEmail = vi.hoisted(() => vi.fn());

// -----------------------------------------------------------------------
// Module mocks
// -----------------------------------------------------------------------
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/auth', () => ({
  signup: mockSignup,
  verifyEmail: mockVerifyEmail,
}));

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
function makeAxiosError(status: number): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = { status, data: {}, headers: {}, config: {} as never, statusText: '' };
  return err;
}

async function flushPromises() {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}

function renderUseSignup() {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(MemoryRouter, null, children);
  return renderHook(() => useSignup(), { wrapper });
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------
describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =====================================================================
  // 초기 상태
  // =====================================================================
  describe('초기 상태', () => {
    it('error 는 null 이다', () => {
      const { result } = renderUseSignup();
      expect(result.current.error).toBeNull();
    });

    it('signupErrorCode 는 null 이다', () => {
      const { result } = renderUseSignup();
      expect(result.current.signupErrorCode).toBeNull();
    });

    it('isSending 은 false 다', () => {
      const { result } = renderUseSignup();
      expect(result.current.isSending).toBe(false);
    });

    it('emailSent 는 false 다', () => {
      const { result } = renderUseSignup();
      expect(result.current.emailSent).toBe(false);
    });
  });

  // =====================================================================
  // handleSendCode — 성공
  // =====================================================================
  describe('handleSendCode — 성공', () => {
    beforeEach(() => {
      mockSignup.mockResolvedValue(undefined);
    });

    it('signup API 를 올바른 인수로 호출한다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'StrongPass1!');
      });

      expect(mockSignup).toHaveBeenCalledWith('a@b.com', 'nick', 'StrongPass1!');
    });

    it('성공 후 emailSent 가 true 가 된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'StrongPass1!');
      });

      expect(result.current.emailSent).toBe(true);
    });

    it('성공 후 error 는 null 이다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'StrongPass1!');
      });

      expect(result.current.error).toBeNull();
    });

    it('성공 후 isSending 은 false 다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'StrongPass1!');
      });

      expect(result.current.isSending).toBe(false);
    });
  });

  // =====================================================================
  // handleSendCode — 422 (BREACH)
  // =====================================================================
  describe('handleSendCode — 422 응답 (BREACH)', () => {
    beforeEach(() => {
      mockSignup.mockRejectedValue(makeAxiosError(422));
    });

    it('signupErrorCode 가 "BREACH" 로 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'breached');
      });

      expect(result.current.signupErrorCode).toBe('BREACH');
    });

    it('error 메시지가 "이 비밀번호는 외부 유출 이력이 있어요. 다른 비밀번호를 사용해주세요." 로 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'breached');
      });

      expect(result.current.error).toBe(
        '이 비밀번호는 외부 유출 이력이 있어요. 다른 비밀번호를 사용해주세요.',
      );
    });

    it('emailSent 는 false 를 유지한다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'breached');
      });

      expect(result.current.emailSent).toBe(false);
    });
  });

  // =====================================================================
  // handleSendCode — 400 (POLICY)
  // =====================================================================
  describe('handleSendCode — 400 응답 (POLICY)', () => {
    beforeEach(() => {
      mockSignup.mockRejectedValue(makeAxiosError(400));
    });

    it('signupErrorCode 가 "POLICY" 로 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'short');
      });

      expect(result.current.signupErrorCode).toBe('POLICY');
    });

    it('error 메시지가 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'short');
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // =====================================================================
  // handleSendCode — 409 (CONFLICT)
  // =====================================================================
  describe('handleSendCode — 409 응답 (CONFLICT)', () => {
    beforeEach(() => {
      mockSignup.mockRejectedValue(makeAxiosError(409));
    });

    it('signupErrorCode 가 "CONFLICT" 로 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });

      expect(result.current.signupErrorCode).toBe('CONFLICT');
    });
  });

  // =====================================================================
  // handleSendCode — 네트워크/기타 오류 (NETWORK)
  // =====================================================================
  describe('handleSendCode — 네트워크 오류 (NETWORK)', () => {
    it('axios 오류가 아니면 signupErrorCode 가 "NETWORK" 로 설정된다', async () => {
      mockSignup.mockRejectedValue(new Error('Network error'));
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });

      expect(result.current.signupErrorCode).toBe('NETWORK');
    });

    it('상태 코드가 없는 axios 오류는 NETWORK 로 처리된다', async () => {
      const err = new AxiosError('timeout');
      // response 없음
      mockSignup.mockRejectedValue(err);
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });

      expect(result.current.signupErrorCode).toBe('NETWORK');
    });

    it('NETWORK 에러 메시지가 설정된다', async () => {
      mockSignup.mockRejectedValue(new Error('fail'));
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  // =====================================================================
  // clearError
  // =====================================================================
  describe('clearError', () => {
    it('error 를 null 로 초기화한다', async () => {
      mockSignup.mockRejectedValue(makeAxiosError(422));
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });
      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('signupErrorCode 를 null 로 초기화한다', async () => {
      mockSignup.mockRejectedValue(makeAxiosError(422));
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleSendCode('a@b.com', 'nick', 'pw');
      });
      expect(result.current.signupErrorCode).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.signupErrorCode).toBeNull();
    });

    it('에러가 없는 상태에서도 안전하게 호출된다', () => {
      const { result } = renderUseSignup();

      expect(() => {
        act(() => {
          result.current.clearError();
        });
      }).not.toThrow();
    });
  });

  // =====================================================================
  // handleVerify — 성공
  // =====================================================================
  describe('handleVerify — 성공', () => {
    beforeEach(() => {
      mockVerifyEmail.mockResolvedValue(undefined);
    });

    it('verifyEmail API 를 올바른 인수로 호출한다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleVerify('a@b.com', '123456');
      });

      expect(mockVerifyEmail).toHaveBeenCalledWith('a@b.com', '123456');
    });

    it('성공 후 /login 으로 navigate 한다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleVerify('a@b.com', '123456');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('성공 후 isVerifying 은 false 다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleVerify('a@b.com', '123456');
      });

      expect(result.current.isVerifying).toBe(false);
    });
  });

  // =====================================================================
  // handleVerify — 실패
  // =====================================================================
  describe('handleVerify — 실패', () => {
    beforeEach(() => {
      mockVerifyEmail.mockRejectedValue(new Error('invalid code'));
    });

    it('실패 시 error 메시지가 설정된다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleVerify('a@b.com', 'wrong');
      });

      expect(result.current.error).toBeTruthy();
    });

    it('실패 시 navigate 가 호출되지 않는다', async () => {
      const { result } = renderUseSignup();

      await act(async () => {
        await result.current.handleVerify('a@b.com', 'wrong');
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('실패 후 isVerifying 은 false 다', async () => {
      const { result } = renderUseSignup();

      await flushPromises();

      await act(async () => {
        await result.current.handleVerify('a@b.com', 'wrong');
      });

      expect(result.current.isVerifying).toBe(false);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { AxiosError } from 'axios';
import useSignup from './useSignup';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSignup = vi.hoisted(() => vi.fn());
const mockSetAuthSession = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/api/auth', () => ({
  signup: mockSignup,
}));

vi.mock('@/lib/auth', () => ({
  setAuthSession: mockSetAuthSession,
}));

function makeAxiosError(status: number, data: unknown = {}): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = { status, data, headers: {}, config: {} as never, statusText: '' };
  return err;
}

function renderUseSignup() {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(MemoryRouter, null, children);
  return renderHook(() => useSignup(), { wrapper });
}

const PARAMS = {
  email: 'a@b.com',
  password: 'StrongPass1!extra',
  nickname: 'nick',
  code: '123456',
  agreedToTerms: true,
  agreedToPrivacy: true,
};

describe('useSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetAuthSession.mockResolvedValue(undefined);
  });

  describe('초기 상태', () => {
    it('error 는 null', () => {
      const { result } = renderUseSignup();
      expect(result.current.error).toBeNull();
    });

    it('errorCode 는 null', () => {
      const { result } = renderUseSignup();
      expect(result.current.errorCode).toBeNull();
    });

    it('isSubmitting 은 false', () => {
      const { result } = renderUseSignup();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('retryAfter 는 0', () => {
      const { result } = renderUseSignup();
      expect(result.current.retryAfter).toBe(0);
    });
  });

  describe('submit 성공', () => {
    beforeEach(() => {
      mockSignup.mockResolvedValue({ accessToken: 'A', refreshToken: 'R' });
    });

    it('signup API 를 단일 객체 인자로 호출한다', async () => {
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockSignup).toHaveBeenCalledWith(PARAMS);
    });

    it('signup 호출 인자에 agreedToMarketing 키가 없다', async () => {
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockSignup).toHaveBeenCalledTimes(1);
      const callArg = mockSignup.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('agreedToMarketing');
    });

    it('signup 응답 토큰을 setAuthSession 으로 전달한다', async () => {
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockSetAuthSession).toHaveBeenCalledWith({
        accessToken: 'A',
        refreshToken: 'R',
      });
    });

    it('성공 후 / 로 navigate 한다', async () => {
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('성공 시 true 를 반환한다', async () => {
      const { result } = renderUseSignup();
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.submit(PARAMS);
      });
      expect(returned).toBe(true);
    });
  });

  describe('에러 코드 매핑', () => {
    type Case = {
      name: string;
      err: AxiosError;
      expectedCode: string;
      expectedRetryAfter?: number;
    };

    const cases: Case[] = [
      {
        name: 'INVALID_CODE',
        err: makeAxiosError(400, { error: { code: 'INVALID_CODE' } }),
        expectedCode: 'INVALID_CODE',
      },
      {
        name: 'EXPIRED_CODE',
        err: makeAxiosError(400, { error: { code: 'EXPIRED_CODE' } }),
        expectedCode: 'EXPIRED_CODE',
      },
      {
        name: 'EMAIL_ALREADY_EXISTS via error.code',
        err: makeAxiosError(409, { error: { code: 'EMAIL_ALREADY_EXISTS' } }),
        expectedCode: 'EMAIL_ALREADY_EXISTS',
      },
      {
        name: 'EMAIL_ALREADY_EXISTS via 409 status fallback',
        err: makeAxiosError(409),
        expectedCode: 'EMAIL_ALREADY_EXISTS',
      },
      {
        name: 'INVALID_EMAIL_FORMAT',
        err: makeAxiosError(400, { error: { code: 'INVALID_EMAIL_FORMAT' } }),
        expectedCode: 'INVALID_EMAIL_FORMAT',
      },
      {
        name: 'RATE_LIMITED with retryAfter',
        err: makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 12 } }),
        expectedCode: 'RATE_LIMITED',
        expectedRetryAfter: 12,
      },
      {
        name: 'RATE_LIMITED via 429 fallback',
        err: makeAxiosError(429),
        expectedCode: 'RATE_LIMITED',
      },
      {
        name: 'NICKNAME_TAKEN via NICKNAME_ALREADY_EXISTS code',
        err: makeAxiosError(409, { error: { code: 'NICKNAME_ALREADY_EXISTS' } }),
        expectedCode: 'NICKNAME_TAKEN',
      },
      {
        name: 'BREACH (422)',
        err: makeAxiosError(422),
        expectedCode: 'BREACH',
      },
      {
        name: 'POLICY (400)',
        err: makeAxiosError(400),
        expectedCode: 'POLICY',
      },
      {
        name: 'TERMS_AGREEMENT_REQUIRED via code',
        err: makeAxiosError(400, { error: { code: 'TERMS_AGREEMENT_REQUIRED' } }),
        expectedCode: 'TERMS_AGREEMENT_REQUIRED',
      },
    ];

    cases.forEach(({ name, err, expectedCode, expectedRetryAfter }) => {
      it(`${name}`, async () => {
        mockSignup.mockRejectedValueOnce(err);
        const { result } = renderUseSignup();
        await act(async () => {
          await result.current.submit(PARAMS);
        });
        expect(result.current.errorCode).toBe(expectedCode);
        if (expectedRetryAfter !== undefined) {
          expect(result.current.retryAfter).toBe(expectedRetryAfter);
        }
      });
    });

    it('axios 외 에러는 NETWORK', async () => {
      mockSignup.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(result.current.errorCode).toBe('NETWORK');
    });

    it('실패 시 setAuthSession 과 navigate 가 호출되지 않는다', async () => {
      mockSignup.mockRejectedValueOnce(makeAxiosError(400, { error: { code: 'INVALID_CODE' } }));
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockSetAuthSession).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('실패 시 false 를 반환한다', async () => {
      mockSignup.mockRejectedValueOnce(makeAxiosError(400));
      const { result } = renderUseSignup();
      let returned: boolean | undefined;
      await act(async () => {
        returned = await result.current.submit(PARAMS);
      });
      expect(returned).toBe(false);
    });
  });

  describe('TERMS_AGREEMENT_REQUIRED 에러', () => {
    it('errorCode 를 TERMS_AGREEMENT_REQUIRED 로 세팅한다', async () => {
      mockSignup.mockRejectedValueOnce(
        makeAxiosError(400, { error: { code: 'TERMS_AGREEMENT_REQUIRED' } }),
      );
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(result.current.errorCode).toBe('TERMS_AGREEMENT_REQUIRED');
    });

    it('error 메시지를 "필수 약관에 동의해야 합니다." 로 세팅한다', async () => {
      mockSignup.mockRejectedValueOnce(
        makeAxiosError(400, { error: { code: 'TERMS_AGREEMENT_REQUIRED' } }),
      );
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(result.current.error).toBe('필수 약관에 동의해야 합니다.');
    });

    it('setAuthSession 과 navigate 가 호출되지 않는다', async () => {
      mockSignup.mockRejectedValueOnce(
        makeAxiosError(400, { error: { code: 'TERMS_AGREEMENT_REQUIRED' } }),
      );
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(mockSetAuthSession).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('error / errorCode / retryAfter 를 모두 초기화한다', async () => {
      mockSignup.mockRejectedValueOnce(
        makeAxiosError(429, { error: { code: 'RATE_LIMITED', retryAfter: 10 } }),
      );
      const { result } = renderUseSignup();
      await act(async () => {
        await result.current.submit(PARAMS);
      });
      expect(result.current.errorCode).toBe('RATE_LIMITED');

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
      expect(result.current.errorCode).toBeNull();
      expect(result.current.retryAfter).toBe(0);
    });
  });
});

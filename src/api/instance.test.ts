import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('axios instance', () => {
  let mockAxios: any;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock = {};

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      key: vi.fn(),
      length: 0,
    } as Storage;

    // Mock window.location to prevent jsdom navigation errors
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    // Reset mocks
    vi.clearAllMocks();

    // Re-import the module to ensure fresh interceptor setup
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('instance creation', () => {
    it('creates an axios instance with correct baseURL from environment', async () => {
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('sets timeout to 10000ms', async () => {
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const createCall = mockAxios.create.mock.calls[0][0];
      expect(createCall.timeout).toBe(10000);
    });

    it('sets Content-Type header to application/json', async () => {
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const createCall = mockAxios.create.mock.calls[0][0];
      expect(createCall.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('request interceptor', () => {
    it('injects Authorization header when token exists in localStorage', async () => {
      localStorageMock['accessToken'] = 'test-token-123';

      // Set up mock to capture the request interceptor
      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('does not inject Authorization header when token does not exist', async () => {
      // localStorage is empty
      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('returns config unchanged when adding Authorization header', async () => {
      localStorageMock['accessToken'] = 'test-token-xyz';

      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = {
        headers: { 'X-Custom-Header': 'value' },
        url: '/api/test',
      };
      const result = requestInterceptor(config);

      expect(result.url).toBe('/api/test');
      expect(result.headers['X-Custom-Header']).toBe('value');
      expect(result.headers.Authorization).toBe('Bearer test-token-xyz');
    });

    it('handles empty string token in localStorage', async () => {
      localStorageMock['accessToken'] = '';

      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      // Empty string is falsy, so Authorization should not be set
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('preserves existing headers when adding Authorization', async () => {
      localStorageMock['accessToken'] = 'token-abc';

      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': '12345',
        },
      };
      const result = requestInterceptor(config);

      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['X-Request-ID']).toBe('12345');
      expect(result.headers.Authorization).toBe('Bearer token-abc');
    });

    it('handles special characters in token', async () => {
      localStorageMock['accessToken'] =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';

      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe(
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
      );
    });
  });

  describe('response interceptor - success path', () => {
    it('passes through response on success', async () => {
      let responseInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((successHandler) => {
              responseInterceptor = successHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const response = {
        status: 200,
        data: { message: 'success' },
      };
      const result = responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('passes through 2xx responses', async () => {
      let responseInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((successHandler) => {
              responseInterceptor = successHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const response = {
        status: 201,
        data: { id: 123 },
      };
      const result = responseInterceptor(response);

      expect(result).toBe(response);
    });
  });

  describe('response interceptor - error handling', () => {
    it('removes accessToken from localStorage on 401 response', async () => {
      localStorageMock['accessToken'] = 'expired-token';
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        config: { _retry: false, headers: {} },
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      expect(localStorageMock['accessToken']).toBe('expired-token');

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(localStorageMock['accessToken']).toBeUndefined();
    });

    it('rejects the error after removing token on 401', async () => {
      let responseErrorHandler: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        config: { _retry: false, headers: {} },
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      const result = responseErrorHandler(error);

      await expect(result).rejects.toBe(error);
    });

    it('does not remove token on non-401 errors', async () => {
      localStorageMock['accessToken'] = 'valid-token';
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(localStorageMock['accessToken']).toBe('valid-token');
    });

    it('handles errors without response object', async () => {
      localStorageMock['accessToken'] = 'valid-token';
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = new Error('Network error');

      await expect(responseErrorHandler(error)).rejects.toThrow('Network error');

      // Token should not be removed
      expect(localStorageMock['accessToken']).toBe('valid-token');
    });

    it('handles errors with undefined response', async () => {
      localStorageMock['accessToken'] = 'valid-token';
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        response: undefined,
      };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);

      expect(localStorageMock['accessToken']).toBe('valid-token');
    });

    it('rejects error on 403 Forbidden status', async () => {
      let responseErrorHandler: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
      };

      const result = responseErrorHandler(error);

      await expect(result).rejects.toBe(error);
    });

    it('rejects error on 404 Not Found status', async () => {
      let responseErrorHandler: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
      };

      const result = responseErrorHandler(error);

      await expect(result).rejects.toBe(error);
    });

    it('handles 401 when no token exists in localStorage', async () => {
      // localStorage is empty
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        config: { _retry: false, headers: {} },
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });

    it('maintains error information when rejecting', async () => {
      let responseErrorHandler: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        response: {
          status: 401,
          data: {
            message: 'Token expired',
            code: 'TOKEN_EXPIRED',
          },
          headers: { 'x-request-id': '123' },
        },
        config: {
          method: 'GET',
          url: '/api/user',
        },
      };

      const result = responseErrorHandler(error);

      await expect(result).rejects.toEqual(error);
    });
  });

  describe('public auth endpoints (401 without refresh)', () => {
    const publicEndpoints = [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/refresh',
      '/api/auth/send-verification-code',
      '/api/auth/check-nickname',
    ];

    publicEndpoints.forEach((endpoint) => {
      it(`${endpoint} 의 401 은 토큰 제거·redirect 없이 그대로 reject 한다`, async () => {
        localStorageMock['refreshToken'] = 'some-refresh';
        localStorageMock['accessToken'] = 'some-access';
        let responseErrorHandler: any;

        mockAxios = vi.mocked(axios);
        mockAxios.create.mockReturnValue({
          interceptors: {
            request: { use: vi.fn() },
            response: {
              use: vi.fn((_s, errorHandler) => {
                responseErrorHandler = errorHandler;
              }),
            },
          },
        } as any);
        // refresh 시도 시 axios.post 가 호출되면 안 됨 → spy
        mockAxios.post = vi.fn();

        await import('./instance');

        const error = {
          config: { url: endpoint, _retry: false, headers: {} },
          response: { status: 401, data: { error: 'INVALID_CREDENTIALS' } },
        };

        await expect(responseErrorHandler(error)).rejects.toBe(error);

        // refresh API 미호출
        expect(mockAxios.post).not.toHaveBeenCalled();
        // 토큰 제거 안 함 (로그인 실패 시 기존 세션 보존)
        expect(localStorageMock['accessToken']).toBe('some-access');
        expect(localStorageMock['refreshToken']).toBe('some-refresh');
        // location 변경 안 함
        expect(window.location.href).toBe('');
      });
    });
  });

  describe('interceptor registration', () => {
    it('registers request interceptor', async () => {
      const mockRequestUse = vi.fn();
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: mockRequestUse },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      expect(mockRequestUse).toHaveBeenCalledTimes(1);
      expect(typeof mockRequestUse.mock.calls[0][0]).toBe('function');
    });

    it('registers response interceptor', async () => {
      const mockResponseUse = vi.fn();
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: mockResponseUse },
        },
      } as any);

      await import('./instance');

      expect(mockResponseUse).toHaveBeenCalledTimes(1);
      expect(typeof mockResponseUse.mock.calls[0][0]).toBe('function');
      expect(typeof mockResponseUse.mock.calls[0][1]).toBe('function');
    });
  });

  describe('token format', () => {
    it('formats Authorization header with Bearer prefix', async () => {
      localStorageMock['accessToken'] = 'my-token';
      let requestInterceptor: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toMatch(/^Bearer /);
    });

    it('uses correct key name (accessToken) from localStorage', async () => {
      localStorageMock['accessToken'] = 'correct-token';
      localStorageMock['token'] = 'wrong-token';

      let requestInterceptor: any;
      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: {
            use: vi.fn((handler) => {
              requestInterceptor = handler;
            }),
          },
          response: { use: vi.fn() },
        },
      } as any);

      await import('./instance');

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer correct-token');
    });

    it('uses correct key name (accessToken) for removal on 401', async () => {
      localStorageMock['accessToken'] = 'token-to-remove';
      let responseErrorHandler: any;

      mockAxios = vi.mocked(axios);
      mockAxios.create.mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: vi.fn((_successHandler, errorHandler) => {
              responseErrorHandler = errorHandler;
            }),
          },
        },
      } as any);

      await import('./instance');

      const error = {
        config: { _retry: false, headers: {} },
        response: {
          status: 401,
        },
      };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });
  });
});

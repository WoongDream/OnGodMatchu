import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/refresh',
  '/api/auth/send-verification-code',
  '/api/auth/check-nickname',
];

const isPublicAuthRequest = (url?: string): boolean =>
  url ? PUBLIC_AUTH_PATHS.some((path) => url.includes(path)) : false;

type ErrorResponseBody = { error?: { code?: string } };

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 약관 미동의 가드 — 403 + TERMS_AGREEMENT_OUTDATED 시 약관 페이지 강제 이동
    if (error.response?.status === 403) {
      const code = (error.response?.data as ErrorResponseBody | undefined)?.error?.code;
      if (
        code === 'TERMS_AGREEMENT_OUTDATED' &&
        !window.location.pathname.startsWith('/terms-agreement')
      ) {
        window.location.href = '/terms-agreement';
        return Promise.reject(error);
      }
    }

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isPublicAuthRequest(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(instance(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string };
      }>(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, storedRefreshToken, {
        headers: { 'Content-Type': 'text/plain' },
      });

      const { accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      pendingRequests.forEach((cb) => cb(accessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default instance;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestOnlyRoute from './GuestOnlyRoute';

const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn((sel) =>
    sel({ user: null, isLoggedIn: false, status: 'ready', setUser: vi.fn(), logout: vi.fn() }),
  ),
}));

vi.mock('@/store/authStore', () => ({
  default: useAuthStoreMock,
}));

describe('GuestOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('status 분기', () => {
    it("status 가 'bootstrapping' 이면 children 도 redirect 도 없다 (null)", () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          status: 'bootstrapping',
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      renderWithTheme(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <div data-testid="guest-child">Login Form</div>
                </GuestOnlyRoute>
              }
            />
            <Route path="/profile" element={<div data-testid="profile-route">Profile</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('guest-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('profile-route')).not.toBeInTheDocument();
    });
  });

  describe('로그인 상태', () => {
    it('from 이 없으면 /profile 로 redirect 한다', () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          status: 'ready',
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      renderWithTheme(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <div data-testid="guest-child">Login Form</div>
                </GuestOnlyRoute>
              }
            />
            <Route path="/profile" element={<div data-testid="profile-route">Profile</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('guest-child')).not.toBeInTheDocument();
      expect(screen.getByTestId('profile-route')).toBeInTheDocument();
    });

    it('location state.from 이 있으면 그 경로로 redirect 한다', () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          status: 'ready',
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      renderWithTheme(
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/quiz/create' } }]}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <div data-testid="guest-child">Login Form</div>
                </GuestOnlyRoute>
              }
            />
            <Route path="/profile" element={<div data-testid="profile-route">Profile</div>} />
            <Route path="/quiz/create" element={<div data-testid="from-route">Quiz Create</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('guest-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('profile-route')).not.toBeInTheDocument();
      expect(screen.getByTestId('from-route')).toBeInTheDocument();
    });
  });

  describe('비로그인 상태', () => {
    it("status 가 'ready' 이고 비로그인이면 children 을 렌더한다", () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: null,
          isLoggedIn: false,
          status: 'ready',
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      renderWithTheme(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <div data-testid="guest-child">Login Form</div>
                </GuestOnlyRoute>
              }
            />
            <Route path="/profile" element={<div data-testid="profile-route">Profile</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('guest-child')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-route')).not.toBeInTheDocument();
    });
  });

  describe('component metadata', () => {
    it('is wrapped with React.memo', () => {
      expect(GuestOnlyRoute.$$typeof).toBeDefined();
    });

    it('has displayName set to GuestOnlyRoute', () => {
      expect(GuestOnlyRoute.displayName).toBe('GuestOnlyRoute');
    });
  });
});

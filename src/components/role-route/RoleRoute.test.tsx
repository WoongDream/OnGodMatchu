import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import type { Role } from '@/types';

const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn((sel) =>
    sel({ user: null, isLoggedIn: false, status: 'ready', setUser: vi.fn(), logout: vi.fn() }),
  ),
}));

vi.mock('@/store/authStore', () => ({
  default: useAuthStoreMock,
}));

const baseUser = {
  id: 1,
  email: 'test@example.com',
  nickname: 'tester',
  provider: 'LOCAL' as const,
  isProfilePublic: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockAuth = (state: {
  user: unknown;
  isLoggedIn: boolean;
  status: 'bootstrapping' | 'ready';
}) => {
  useAuthStoreMock.mockImplementation((sel: any) =>
    sel({ ...state, setUser: vi.fn(), logout: vi.fn() }),
  );
};

const renderRoute = (min: Role, initialEntries: any[] = ['/admin']) =>
  renderWithTheme(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleRoute min={min}>
              <div data-testid="role-child">Admin Content</div>
            </RoleRoute>
          }
        />
        <Route path="/" element={<div data-testid="home-route">Home</div>} />
        <Route path="/login" element={<div data-testid="login-route">Login</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('status 분기', () => {
    it("status 가 'bootstrapping' 이면 children 도 redirect 도 없다 (null)", () => {
      mockAuth({ user: null, isLoggedIn: false, status: 'bootstrapping' });

      renderRoute('ADMIN');

      expect(screen.queryByTestId('role-child')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-route')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-route')).not.toBeInTheDocument();
    });
  });

  describe('미인증', () => {
    it("status 가 'ready' 이고 비로그인이면 /login 으로 redirect 하며 state.from 에 원래 경로를 담는다", () => {
      mockAuth({ user: null, isLoggedIn: false, status: 'ready' });

      const LoginRoute = () => {
        const location = useLocation();
        const from = (location.state as { from?: string } | null)?.from;
        return (
          <div>
            <span data-testid="login-route">Login</span>
            <span data-testid="from-value">{from ?? 'none'}</span>
          </div>
        );
      };

      renderWithTheme(
        <MemoryRouter initialEntries={['/admin?tab=users']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleRoute min="ADMIN">
                  <div data-testid="role-child">Admin Content</div>
                </RoleRoute>
              }
            />
            <Route path="/login" element={<LoginRoute />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('role-child')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-route')).toBeInTheDocument();
      expect(screen.getByTestId('from-value')).toHaveTextContent('/admin?tab=users');
    });
  });

  describe('역할 미달 redirect', () => {
    it("min='ADMIN' 인데 user.role='USER' 면 '/' 로 redirect 한다", () => {
      mockAuth({ user: { ...baseUser, role: 'USER' }, isLoggedIn: true, status: 'ready' });

      renderRoute('ADMIN');

      expect(screen.queryByTestId('role-child')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-route')).toBeInTheDocument();
    });

    it("min='OWNER' 인데 user.role='ADMIN' 면 '/' 로 redirect 한다", () => {
      mockAuth({ user: { ...baseUser, role: 'ADMIN' }, isLoggedIn: true, status: 'ready' });

      renderRoute('OWNER');

      expect(screen.queryByTestId('role-child')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-route')).toBeInTheDocument();
    });

    it("role 이 없는 user 는 USER 취급(least-privilege) → min='ADMIN' 이면 '/' 로 redirect 한다", () => {
      mockAuth({ user: { ...baseUser }, isLoggedIn: true, status: 'ready' });

      renderRoute('ADMIN');

      expect(screen.queryByTestId('role-child')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-route')).toBeInTheDocument();
    });
  });

  describe('역할 충족 렌더', () => {
    it("min='ADMIN', user.role='ADMIN' 이면 children 을 렌더한다", () => {
      mockAuth({ user: { ...baseUser, role: 'ADMIN' }, isLoggedIn: true, status: 'ready' });

      renderRoute('ADMIN');

      expect(screen.getByTestId('role-child')).toBeInTheDocument();
      expect(screen.queryByTestId('home-route')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-route')).not.toBeInTheDocument();
    });

    it("min='ADMIN', user.role='OWNER' 이면 children 을 렌더한다 (상위 역할 포함)", () => {
      mockAuth({ user: { ...baseUser, role: 'OWNER' }, isLoggedIn: true, status: 'ready' });

      renderRoute('ADMIN');

      expect(screen.getByTestId('role-child')).toBeInTheDocument();
      expect(screen.queryByTestId('home-route')).not.toBeInTheDocument();
    });

    it("min='OWNER', user.role='OWNER' 이면 children 을 렌더한다", () => {
      mockAuth({ user: { ...baseUser, role: 'OWNER' }, isLoggedIn: true, status: 'ready' });

      renderRoute('OWNER');

      expect(screen.getByTestId('role-child')).toBeInTheDocument();
      expect(screen.queryByTestId('home-route')).not.toBeInTheDocument();
    });
  });

  describe('component metadata', () => {
    it('is wrapped with React.memo', () => {
      expect(RoleRoute.$$typeof).toBeDefined();
    });

    it('has displayName set to RoleRoute', () => {
      expect(RoleRoute.displayName).toBe('RoleRoute');
    });
  });
});

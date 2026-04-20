import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import useAuthStore from '@/store/authStore';
import * as router from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock authStore
vi.mock('@/store/authStore', () => ({
  default: vi.fn(),
}));

describe('Header', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (router.useNavigate as any).mockReturnValue(mockNavigate);
  });

  describe('logo rendering and navigation', () => {
    it('renders the logo with text "OnGodMatchu"', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      renderWithTheme(<Header />);
      const logo = screen.getByText('OnGodMatchu');

      expect(logo).toBeInTheDocument();
    });

    it('navigates to / when logo is clicked', async () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logo = screen.getByText('OnGodMatchu');

      await user.click(logo);

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('logo click only calls navigate once per click', async () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logo = screen.getByText('OnGodMatchu');

      await user.click(logo);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('login button when not logged in', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });
    });

    it('shows login button when isLoggedIn is false', () => {
      renderWithTheme(<Header />);
      const loginButton = screen.getByRole('button', { name: '로그인' });

      expect(loginButton).toBeInTheDocument();
    });

    it('does not show create or logout buttons when not logged in', () => {
      renderWithTheme(<Header />);

      expect(screen.queryByRole('button', { name: '퀴즈 만들기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
    });

    it('navigates to /login when login button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const loginButton = screen.getByRole('button', { name: '로그인' });

      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('only one login button is rendered', () => {
      renderWithTheme(<Header />);
      const loginButtons = screen.getAllByRole('button', { name: '로그인' });

      expect(loginButtons).toHaveLength(1);
    });
  });

  describe('logout and create buttons when logged in', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: vi.fn(),
      });
    });

    it('shows create button when isLoggedIn is true', () => {
      renderWithTheme(<Header />);
      const createButton = screen.getByRole('button', { name: '퀴즈 만들기' });

      expect(createButton).toBeInTheDocument();
    });

    it('shows logout button when isLoggedIn is true', () => {
      renderWithTheme(<Header />);
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      expect(logoutButton).toBeInTheDocument();
    });

    it('does not show login button when isLoggedIn is true', () => {
      renderWithTheme(<Header />);

      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });

    it('shows both create and logout buttons', () => {
      renderWithTheme(<Header />);
      const createButton = screen.getByRole('button', { name: '퀴즈 만들기' });
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      expect(createButton).toBeInTheDocument();
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('create button navigation', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: vi.fn(),
      });
    });

    it('navigates to /quiz/create when create button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const createButton = screen.getByRole('button', { name: '퀴즈 만들기' });

      await user.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/quiz/create');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('only navigates once per click on create button', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const createButton = screen.getByRole('button', { name: '퀴즈 만들기' });

      await user.click(createButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout button behavior', () => {
    let mockLogout: any;

    beforeEach(() => {
      mockLogout = vi.fn();
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: mockLogout,
      });
    });

    it('calls logout from store when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('navigates to / after logout is called', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      await user.click(logoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls logout before navigating', async () => {
      const callOrder: string[] = [];
      mockLogout.mockImplementation(() => callOrder.push('logout'));
      mockNavigate.mockImplementation(() => callOrder.push('navigate'));

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      await user.click(logoutButton);

      expect(callOrder).toEqual(['logout', 'navigate']);
    });
  });

  describe('authentication state transitions', () => {
    it('renders login button when not logged in', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });
      renderWithTheme(<Header />);
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '퀴즈 만들기' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
    });

    it('renders create and logout buttons when logged in', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: vi.fn(),
      });
      renderWithTheme(<Header />);
      expect(screen.getByRole('button', { name: '퀴즈 만들기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });
  });

  describe('button count assertions', () => {
    it('renders exactly one button when not logged in', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      renderWithTheme(<Header />);
      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(1);
    });

    it('renders exactly two buttons when logged in', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: vi.fn(),
      });

      renderWithTheme(<Header />);
      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('all buttons are keyboard accessible', () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: vi.fn(),
      });

      renderWithTheme(<Header />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });
  });

  describe('edge cases', () => {
    it('handles multiple rapid clicks on login button', async () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const loginButton = screen.getByRole('button', { name: '로그인' });

      await user.click(loginButton);
      await user.click(loginButton);
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles logout without navigate being called before', async () => {
      const mockLogout = vi.fn();
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: true,
        logout: mockLogout,
      });

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logoutButton = screen.getByRole('button', { name: '로그아웃' });

      // Even if navigate was never called before, logout should work
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('logo click does not interfere with button clicks', async () => {
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: vi.fn(),
      });

      const user = userEvent.setup();
      renderWithTheme(<Header />);
      const logo = screen.getByText('OnGodMatchu');
      const loginButton = screen.getByRole('button', { name: '로그인' });

      await user.click(logo);
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/login');
    });
  });

  describe('render consistency', () => {
    it('maintains consistent render when auth state does not change', () => {
      const mockLogout = vi.fn();
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: mockLogout,
      });

      const { rerender } = renderWithTheme(<Header />);
      const firstLoginButton = screen.getByRole('button', { name: '로그인' });

      // Rerender with same state
      (useAuthStore as any).mockReturnValue({
        isLoggedIn: false,
        logout: mockLogout,
      });
      rerender(<Header />);
      const secondLoginButton = screen.getByRole('button', { name: '로그인' });

      expect(firstLoginButton.textContent).toBe(secondLoginButton.textContent);
    });
  });

  describe('memoization', () => {
    it('component is wrapped with React.memo', () => {
      // Header should have displayName set by memo
      expect(Header.displayName).toBe('Header');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import LoginPage from './LoginPage';

vi.mock('@/features/auth/LoginForm', () => ({
  default: () => <div data-testid="login-form" />,
}));

function renderLoginPage(url: string = '/login') {
  return renderWithTheme(
    <MemoryRouter initialEntries={[url]}>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  describe('error banner — oauth2_failed', () => {
    it('shows the error banner when ?error=oauth2_failed is in the URL', () => {
      renderLoginPage('/login?error=oauth2_failed');
      expect(
        screen.getByText('소셜 로그인에 실패했습니다. 다시 시도해주세요.'),
      ).toBeInTheDocument();
    });

    it('renders role="alert" element when ?error=oauth2_failed is present', () => {
      renderLoginPage('/login?error=oauth2_failed');
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('error banner — no error param', () => {
    it('does not render the error banner when there is no error query param', () => {
      renderLoginPage('/login');
      expect(
        screen.queryByText('소셜 로그인에 실패했습니다. 다시 시도해주세요.'),
      ).not.toBeInTheDocument();
    });

    it('does not render role="alert" element when there is no error query param', () => {
      renderLoginPage('/login');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('error banner — unknown error code', () => {
    it('does not render the error banner for an unrecognised error code', () => {
      renderLoginPage('/login?error=unknown_code');
      expect(
        screen.queryByText('소셜 로그인에 실패했습니다. 다시 시도해주세요.'),
      ).not.toBeInTheDocument();
    });

    it('does not render role="alert" for an unrecognised error code', () => {
      renderLoginPage('/login?error=unknown_code');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('LoginForm rendering', () => {
    it('always renders the LoginForm regardless of error state', () => {
      renderLoginPage('/login');
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('renders the LoginForm even when ?error=oauth2_failed is present', () => {
      renderLoginPage('/login?error=oauth2_failed');
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });
});

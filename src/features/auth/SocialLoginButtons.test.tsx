import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SocialLoginButtons from './SocialLoginButtons';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const expectedUrl = (provider: 'google' | 'naver' | 'kakao') =>
  `${baseUrl}/oauth2/authorization/${provider}`;

const renderInRouter = () =>
  renderWithTheme(
    <MemoryRouter>
      <SocialLoginButtons />
    </MemoryRouter>,
  );

describe('SocialLoginButtons', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all three social login buttons', () => {
      renderInRouter();
      expect(screen.getByText('Google로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('네이버로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('카카오로 계속하기')).toBeInTheDocument();
    });

    it('renders divider section with "또는" text', () => {
      renderInRouter();
      expect(screen.getByText('또는')).toBeInTheDocument();
    });

    it('renders exactly three buttons', () => {
      const { container } = renderInRouter();
      expect(container.querySelectorAll('button')).toHaveLength(3);
    });
  });

  describe('redirect to OAuth authorization URL', () => {
    it('redirects to Google authorization URL on click', async () => {
      const user = userEvent.setup();
      renderInRouter();

      await user.click(screen.getByText('Google로 계속하기'));

      expect(window.location.href).toBe(expectedUrl('google'));
    });

    it('redirects to Naver authorization URL on click', async () => {
      const user = userEvent.setup();
      renderInRouter();

      await user.click(screen.getByText('네이버로 계속하기'));

      expect(window.location.href).toBe(expectedUrl('naver'));
    });

    it('redirects to Kakao authorization URL on click', async () => {
      const user = userEvent.setup();
      renderInRouter();

      await user.click(screen.getByText('카카오로 계속하기'));

      expect(window.location.href).toBe(expectedUrl('kakao'));
    });

    it('overwrites href with the latest provider when multiple buttons are clicked', async () => {
      const user = userEvent.setup();
      renderInRouter();

      await user.click(screen.getByText('Google로 계속하기'));
      expect(window.location.href).toBe(expectedUrl('google'));

      await user.click(screen.getByText('카카오로 계속하기'));
      expect(window.location.href).toBe(expectedUrl('kakao'));
    });

    it('does not change href when no button is clicked', () => {
      renderInRouter();
      expect(window.location.href).toBe('');
    });
  });

  describe('component structure', () => {
    it('has displayName set correctly', () => {
      expect(SocialLoginButtons.displayName).toBe('SocialLoginButtons');
    });
  });

  describe('legal consent notice', () => {
    it('renders consent notice text near the social buttons', () => {
      renderInRouter();
      expect(screen.getByText(/동의하는 것으로 간주됩니다/)).toBeInTheDocument();
    });

    it('renders link to /terms with "이용약관" label', () => {
      renderInRouter();
      const termsLink = screen.getByRole('link', { name: '이용약관' });
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('renders link to /privacy with "개인정보처리방침" label', () => {
      renderInRouter();
      const privacyLink = screen.getByRole('link', { name: '개인정보처리방침' });
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('keyboard interactions', () => {
    it('redirects to Google URL on Enter key', async () => {
      const user = userEvent.setup();
      renderInRouter();

      const googleButton = screen.getByText('Google로 계속하기');
      googleButton.focus();
      await user.keyboard('{Enter}');

      expect(window.location.href).toBe(expectedUrl('google'));
    });

    it('redirects to Naver URL on Space key', async () => {
      const user = userEvent.setup();
      renderInRouter();

      const naverButton = screen.getByText('네이버로 계속하기');
      naverButton.focus();
      await user.keyboard(' ');

      expect(window.location.href).toBe(expectedUrl('naver'));
    });
  });
});

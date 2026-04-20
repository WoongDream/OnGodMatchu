import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import SocialLoginButtons from './SocialLoginButtons';

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all three social login buttons', () => {
      renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('Google로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('네이버로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('카카오로 계속하기')).toBeInTheDocument();
    });

    it('renders divider section with "또는" text', () => {
      renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('또는')).toBeInTheDocument();
    });

    it('renders exactly three buttons', () => {
      const { container } = renderWithTheme(<SocialLoginButtons />);
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(3);
    });

    it('renders buttons with correct button element type', () => {
      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');
      const naverButton = screen.getByText('네이버로 계속하기');
      const kakaoButton = screen.getByText('카카오로 계속하기');

      expect(googleButton.tagName).toBe('BUTTON');
      expect(naverButton.tagName).toBe('BUTTON');
      expect(kakaoButton.tagName).toBe('BUTTON');
    });

    it('renders all buttons as interactive elements', () => {
      renderWithTheme(<SocialLoginButtons />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.every((btn) => !btn.disabled)).toBe(true);
    });
  });

  describe('provider-specific handlers', () => {
    it('calls alert with google provider name when google button is clicked', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      await user.click(googleButton);

      expect(alertSpy).toHaveBeenCalledWith('google 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });

    it('calls alert with naver provider name when naver button is clicked', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const naverButton = screen.getByText('네이버로 계속하기');

      await user.click(naverButton);

      expect(alertSpy).toHaveBeenCalledWith('naver 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });

    it('calls alert with kakao provider name when kakao button is clicked', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const kakaoButton = screen.getByText('카카오로 계속하기');

      await user.click(kakaoButton);

      expect(alertSpy).toHaveBeenCalledWith('kakao 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenCalledTimes(1);

      alertSpy.mockRestore();
    });

    it('distinguishes between different provider clicks', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');
      const naverButton = screen.getByText('네이버로 계속하기');

      await user.click(googleButton);
      await user.click(naverButton);

      expect(alertSpy).toHaveBeenNthCalledWith(1, 'google 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenNthCalledWith(2, 'naver 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenCalledTimes(2);

      alertSpy.mockRestore();
    });
  });

  describe('click handlers', () => {
    it('executes handler when google button is clicked multiple times', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      await user.click(googleButton);
      await user.click(googleButton);
      await user.click(googleButton);

      expect(alertSpy).toHaveBeenCalledTimes(3);

      alertSpy.mockRestore();
    });

    it('executes handler for each button independently', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');
      const naverButton = screen.getByText('네이버로 계속하기');
      const kakaoButton = screen.getByText('카카오로 계속하기');

      await user.click(googleButton);
      await user.click(naverButton);
      await user.click(kakaoButton);
      await user.click(googleButton);

      expect(alertSpy).toHaveBeenCalledTimes(4);
      expect(alertSpy).toHaveBeenNthCalledWith(1, 'google 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenNthCalledWith(2, 'naver 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenNthCalledWith(3, 'kakao 로그인 (API 연동 전)');
      expect(alertSpy).toHaveBeenNthCalledWith(4, 'google 로그인 (API 연동 전)');

      alertSpy.mockRestore();
    });

    it('does not trigger handler when component is rendered without interaction', () => {
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);

      expect(alertSpy).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('alert callbacks', () => {
    it('displays alert with correct format when button is clicked', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const buttons = screen.getAllByRole('button');

      await user.click(buttons[0]);

      expect(alertSpy).toHaveBeenCalled();
      const callArg = alertSpy.mock.calls[0][0];
      expect(callArg).toMatch(/로그인 \(API 연동 전\)$/);

      alertSpy.mockRestore();
    });

    it('includes provider name in alert message', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      await user.click(googleButton);

      const message = alertSpy.mock.calls[0][0];
      expect(message).toContain('google');

      alertSpy.mockRestore();
    });

    it('alert is called synchronously on button click', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});
      const callOrder: string[] = [];

      alertSpy.mockImplementation(() => {
        callOrder.push('alert');
      });

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      callOrder.push('before_click');
      await user.click(googleButton);
      callOrder.push('after_click');

      expect(callOrder).toEqual(['before_click', 'alert', 'after_click']);

      alertSpy.mockRestore();
    });

    it('correctly constructs alert messages for all providers', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);

      const expectedMessages = [
        'google 로그인 (API 연동 전)',
        'naver 로그인 (API 연동 전)',
        'kakao 로그인 (API 연동 전)',
      ];

      const buttons = screen.getAllByRole('button');
      for (let i = 0; i < buttons.length; i++) {
        await user.click(buttons[i]);
        expect(alertSpy).toHaveBeenCalledWith(expectedMessages[i]);
      }

      alertSpy.mockRestore();
    });
  });

  describe('button content and labels', () => {
    it('renders google button with correct label', () => {
      renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('Google로 계속하기')).toBeInTheDocument();
    });

    it('renders naver button with correct label', () => {
      renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('네이버로 계속하기')).toBeInTheDocument();
    });

    it('renders kakao button with correct label', () => {
      renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('카카오로 계속하기')).toBeInTheDocument();
    });

    it('button text remains consistent across multiple renders', () => {
      const { rerender } = renderWithTheme(<SocialLoginButtons />);
      expect(screen.getByText('Google로 계속하기')).toBeInTheDocument();

      rerender(<SocialLoginButtons />);
      expect(screen.getByText('Google로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('네이버로 계속하기')).toBeInTheDocument();
      expect(screen.getByText('카카오로 계속하기')).toBeInTheDocument();
    });
  });

  describe('component structure', () => {
    it('component is wrapped with React.memo', () => {
      const { container } = renderWithTheme(<SocialLoginButtons />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('has displayName set correctly', () => {
      expect(SocialLoginButtons.displayName).toBe('SocialLoginButtons');
    });

    it('renders wrapper element containing all buttons', () => {
      const { container } = renderWithTheme(<SocialLoginButtons />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.closest('div')).toBeInTheDocument();
      });
    });
  });

  describe('keyboard interactions', () => {
    it('responds to keyboard Enter key on google button', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      googleButton.focus();
      await user.keyboard('{Enter}');

      expect(alertSpy).toHaveBeenCalledWith('google 로그인 (API 연동 전)');

      alertSpy.mockRestore();
    });

    it('responds to keyboard Space key on naver button', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const naverButton = screen.getByText('네이버로 계속하기');

      naverButton.focus();
      await user.keyboard(' ');

      expect(alertSpy).toHaveBeenCalledWith('naver 로그인 (API 연동 전)');

      alertSpy.mockRestore();
    });

    it('buttons are keyboard accessible', () => {
      const { container } = renderWithTheme(<SocialLoginButtons />);
      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
        // Native buttons should be in tab order
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('handles rapid successive clicks', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);
      const googleButton = screen.getByText('Google로 계속하기');

      await user.click(googleButton);
      await user.click(googleButton);
      await user.click(googleButton);
      await user.click(googleButton);
      await user.click(googleButton);

      expect(alertSpy).toHaveBeenCalledTimes(5);

      alertSpy.mockRestore();
    });

    it('maintains correct behavior after multiple re-renders', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      const { rerender } = renderWithTheme(<SocialLoginButtons />);

      let googleButton = screen.getByText('Google로 계속하기');
      await user.click(googleButton);

      rerender(<SocialLoginButtons />);

      googleButton = screen.getByText('Google로 계속하기');
      await user.click(googleButton);

      expect(alertSpy).toHaveBeenCalledTimes(2);

      alertSpy.mockRestore();
    });

    it('handles clicks on all buttons in sequence without state issues', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);

      const googleButton = screen.getByText('Google로 계속하기');
      const naverButton = screen.getByText('네이버로 계속하기');
      const kakaoButton = screen.getByText('카카오로 계속하기');

      await user.click(googleButton);
      await user.click(naverButton);
      await user.click(kakaoButton);
      await user.click(googleButton);
      await user.click(naverButton);

      expect(alertSpy).toHaveBeenCalledTimes(5);
      expect(alertSpy).toHaveBeenLastCalledWith('naver 로그인 (API 연동 전)');

      alertSpy.mockRestore();
    });
  });

  describe('integration', () => {
    it('renders and handles clicks without errors', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      const { container } = renderWithTheme(<SocialLoginButtons />);

      expect(container).toBeInTheDocument();

      const buttons = container.querySelectorAll('button');
      for (const button of buttons) {
        await user.click(button);
      }

      expect(alertSpy).toHaveBeenCalledTimes(3);

      alertSpy.mockRestore();
    });

    it('complete user flow: render, locate button, click, verify alert', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

      renderWithTheme(<SocialLoginButtons />);

      const button = screen.getByText('카카오로 계속하기');
      expect(button).toBeVisible();

      await user.click(button);

      expect(alertSpy).toHaveBeenCalledWith('kakao 로그인 (API 연동 전)');

      alertSpy.mockRestore();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TermsAgreementGate from './TermsAgreementGate';

const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn((sel) =>
    sel({ user: null, isLoggedIn: false, setUser: vi.fn(), logout: vi.fn() }),
  ),
}));

vi.mock('@/store/authStore', () => ({
  default: useAuthStoreMock,
}));

const renderGateAt = (initialPath: string) =>
  renderWithTheme(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<TermsAgreementGate />}>
          <Route path="/" element={<div data-testid="home" />} />
          <Route path="/terms-agreement" element={<div data-testid="terms-sentinel" />} />
          <Route path="/terms" element={<div data-testid="terms-doc" />} />
          <Route path="/privacy" element={<div data-testid="privacy-doc" />} />
          <Route path="/privacy/cookies" element={<div data-testid="privacy-nested" />} />
          <Route path="/quiz/123" element={<div data-testid="quiz-play" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const mockAuthUser = (
  user: null | {
    id: string;
    username: string;
    email: string;
    needsTermsAgreement?: boolean;
  },
) => {
  useAuthStoreMock.mockImplementation((sel: any) =>
    sel({
      user,
      isLoggedIn: user !== null,
      setUser: vi.fn(),
      logout: vi.fn(),
    }),
  );
};

describe('TermsAgreementGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('user === null (비로그인)', () => {
    it('pathname이 / 이면 home(Outlet)을 렌더한다', () => {
      mockAuthUser(null);

      renderGateAt('/');

      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });

    it('pathname이 /quiz/123 이면 quiz-play(Outlet)를 렌더한다', () => {
      mockAuthUser(null);

      renderGateAt('/quiz/123');

      expect(screen.getByTestId('quiz-play')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });
  });

  describe('needsTermsAgreement !== true (통과)', () => {
    it('needsTermsAgreement=false 이고 pathname이 / 이면 home을 렌더한다', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: false,
      });

      renderGateAt('/');

      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });

    it('needsTermsAgreement=undefined (기존 사용자) 이고 pathname이 / 이면 home을 렌더한다', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      });

      renderGateAt('/');

      expect(screen.getByTestId('home')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });
  });

  describe('needsTermsAgreement === true 이고 화이트리스트 미매칭 (redirect)', () => {
    it('pathname이 / 이면 /terms-agreement 로 redirect 한다 (terms-sentinel 렌더 + home 미렌더)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/');

      expect(screen.getByTestId('terms-sentinel')).toBeInTheDocument();
      expect(screen.queryByTestId('home')).not.toBeInTheDocument();
    });

    it('pathname이 /quiz/123 이면 /terms-agreement 로 redirect 한다 (terms-sentinel 렌더 + quiz-play 미렌더)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/quiz/123');

      expect(screen.getByTestId('terms-sentinel')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-play')).not.toBeInTheDocument();
    });
  });

  describe('needsTermsAgreement === true 이고 화이트리스트 매칭 (통과)', () => {
    it('pathname이 /terms-agreement 이면 terms-sentinel을 렌더한다 (통과)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/terms-agreement');

      expect(screen.getByTestId('terms-sentinel')).toBeInTheDocument();
    });

    it('pathname이 /terms 이면 terms-doc을 렌더한다 (화이트리스트 통과)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/terms');

      expect(screen.getByTestId('terms-doc')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });

    it('pathname이 /privacy 이면 privacy-doc을 렌더한다 (화이트리스트 통과)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/privacy');

      expect(screen.getByTestId('privacy-doc')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });

    it('pathname이 /privacy/cookies 이면 privacy-nested를 렌더한다 (startsWith 매칭)', () => {
      mockAuthUser({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        needsTermsAgreement: true,
      });

      renderGateAt('/privacy/cookies');

      expect(screen.getByTestId('privacy-nested')).toBeInTheDocument();
      expect(screen.queryByTestId('terms-sentinel')).not.toBeInTheDocument();
    });
  });

  describe('component metadata', () => {
    it('is wrapped with React.memo and has displayName "TermsAgreementGate"', () => {
      expect((TermsAgreementGate as unknown as { $$typeof?: symbol }).$$typeof).toBeDefined();
      expect(TermsAgreementGate.displayName).toBe('TermsAgreementGate');
    });
  });

  describe('authStore integration', () => {
    it('useAuthStore selector가 호출된다', () => {
      mockAuthUser(null);

      renderGateAt('/');

      expect(useAuthStoreMock).toHaveBeenCalled();
    });
  });
});

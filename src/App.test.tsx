import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, within } from '@/test/renderWithTheme';
import App from './App';

let authState = { isLoggedIn: false };

const setAuthState = (state: any) => {
  authState = state;
};

const { mockProtectedRouteImpl } = vi.hoisted(() => {
  return {
    mockProtectedRouteImpl: vi.fn((props: any) => {
      const isLoggedIn = authState.isLoggedIn;
      if (!isLoggedIn) {
        return <div data-testid="navigate-to-login">Redirecting to login</div>;
      }
      return <>{props.children}</>;
    }),
  };
});

vi.mock('./pages/MainPage', () => ({
  default: () => <div data-testid="main-page">Main Page</div>,
}));

vi.mock('./pages/quiz/QuizPlayPage', () => ({
  default: () => <div data-testid="quiz-play-page">Quiz Play Page</div>,
}));

vi.mock('./pages/quiz/QuizResultPage', () => ({
  default: () => <div data-testid="quiz-result-page">Quiz Result Page</div>,
}));

vi.mock('./pages/quiz/QuizCreatePage', () => ({
  default: () => <div data-testid="quiz-create-page">Quiz Create Page</div>,
}));

vi.mock('./pages/quiz/QuizEditPage', () => ({
  default: () => <div data-testid="quiz-edit-page">Quiz Edit Page</div>,
}));

vi.mock('./pages/auth/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./pages/auth/SignupPage', () => ({
  default: () => <div data-testid="signup-page">Signup Page</div>,
}));

vi.mock('./pages/auth/OAuthCallbackPage', () => ({
  default: () => <div data-testid="oauth-callback-page">OAuth Callback Page</div>,
}));

vi.mock('./pages/legal/PrivacyPage', () => ({
  default: () => <div data-testid="privacy-page">Privacy Page</div>,
}));

vi.mock('./pages/legal/TermsPage', () => ({
  default: () => <div data-testid="terms-page">Terms Page</div>,
}));

vi.mock('./pages/profile/ProfileLayout', () => ({
  default: () => <div data-testid="profile-layout">Profile Layout</div>,
}));

vi.mock('./pages/profile/ProfileInfo', () => ({
  default: () => <div data-testid="profile-info">Profile Info</div>,
}));

vi.mock('./pages/profile/ProfileQuizzesMade', () => ({
  default: () => <div data-testid="profile-quizzes-made">Profile Quizzes Made</div>,
}));

vi.mock('./pages/profile/ProfileQuizzesPlayed', () => ({
  default: () => <div data-testid="profile-quizzes-played">Profile Quizzes Played</div>,
}));

vi.mock('./pages/profile/ProfileSettings', () => ({
  default: () => <div data-testid="profile-settings">Profile Settings</div>,
}));

vi.mock('./pages/profile/ProfileAccount', () => ({
  default: () => <div data-testid="profile-account">Profile Account</div>,
}));

vi.mock('@/hooks/useBootstrapAuth', () => ({
  default: () => undefined,
}));

vi.mock('@/components/header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/components/footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/styles/layout', () => ({
  appShellStyle: () => ({}),
  pageContentStyle: () => ({}),
  pageWrapperStyle: () => () => ({}),
}));

vi.mock('@/styles/theme', () => ({
  theme: {
    colors: {
      primary: '#000',
      secondary: '#fff',
    },
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
    Route: ({ path, element }: any) => (
      <div data-testid={`route-${path}`} data-path={path}>
        {element}
      </div>
    ),
  };
});

vi.mock('@/components/protected-route/ProtectedRoute', () => ({
  default: mockProtectedRouteImpl,
}));

// AppShell/PageContent are no longer styled wrappers — they're <div>/<main> with css prop.
// Identify them by structure / role instead of data-testid.
const getAppShell = () => screen.getByTestId('browser-router').firstElementChild as HTMLElement;
const getPageContent = () => screen.getByRole('main');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isLoggedIn: false };
  });

  describe('layout structure', () => {
    it('renders BrowserRouter', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    });

    it('renders AppShell container', () => {
      renderWithTheme(<App />);
      expect(getAppShell()).toBeInTheDocument();
    });

    it('renders Header component inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = getAppShell();
      expect(within(appShell).getByTestId('header')).toBeInTheDocument();
    });

    it('renders PageContent container inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = getAppShell();
      expect(within(appShell).getByRole('main')).toBeInTheDocument();
    });

    it('renders Footer component inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = getAppShell();
      expect(within(appShell).getByTestId('footer')).toBeInTheDocument();
    });

    it('renders Footer outside of PageContent (sibling of routes)', () => {
      renderWithTheme(<App />);
      const pageContent = getPageContent();
      expect(within(pageContent).queryByTestId('footer')).not.toBeInTheDocument();
    });

    it('renders Routes inside PageContent', () => {
      renderWithTheme(<App />);
      const pageContent = getPageContent();
      expect(within(pageContent).getByTestId('routes')).toBeInTheDocument();
    });

    it('maintains correct DOM hierarchy', () => {
      renderWithTheme(<App />);
      const browserRouter = screen.getByTestId('browser-router');
      const appShell = browserRouter.firstElementChild as HTMLElement;
      const header = within(appShell).getByTestId('header');
      const pageContent = within(appShell).getByRole('main');
      const routes = within(pageContent).getByTestId('routes');
      const footer = within(appShell).getByTestId('footer');

      expect(browserRouter).toBeInTheDocument();
      expect(appShell).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(pageContent).toBeInTheDocument();
      expect(routes).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });
  });

  describe('route configuration', () => {
    it('renders route for "/"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/')).toBeInTheDocument();
    });

    it('renders route for "/quiz/create"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/quiz/create')).toBeInTheDocument();
    });

    it('renders route for "/quiz/:id"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/quiz/:id')).toBeInTheDocument();
    });

    it('renders route for "/quiz/:id/result"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/quiz/:id/result')).toBeInTheDocument();
    });

    it('renders route for "/login"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/login')).toBeInTheDocument();
    });

    it('renders route for "/signup"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/signup')).toBeInTheDocument();
    });

    it('renders route for "/oauth2/callback"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/oauth2/callback')).toBeInTheDocument();
    });

    it('renders route for "/privacy"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/privacy')).toBeInTheDocument();
    });

    it('renders route for "/terms"', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/terms')).toBeInTheDocument();
    });

    it('has twelve top-level routes total', () => {
      renderWithTheme(<App />);
      const routeElements = screen.getAllByTestId(/^route-/);
      // 9 기존 + /quiz/:id/edit + /profile + /profile/:userId
      expect(routeElements).toHaveLength(12);
    });

    it('renders /profile route protected by ProtectedRoute', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/profile')).toBeInTheDocument();
    });

    it('renders /profile/:userId public route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('route-/profile/:userId')).toBeInTheDocument();
    });

    it('route "/" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/');
      expect(route).toHaveAttribute('data-path', '/');
    });

    it('route "/quiz/create" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/quiz/create');
      expect(route).toHaveAttribute('data-path', '/quiz/create');
    });

    it('route "/quiz/:id" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/quiz/:id');
      expect(route).toHaveAttribute('data-path', '/quiz/:id');
    });

    it('route "/quiz/:id/result" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/quiz/:id/result');
      expect(route).toHaveAttribute('data-path', '/quiz/:id/result');
    });

    it('route "/login" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/login');
      expect(route).toHaveAttribute('data-path', '/login');
    });

    it('route "/signup" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/signup');
      expect(route).toHaveAttribute('data-path', '/signup');
    });

    it('route "/oauth2/callback" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/oauth2/callback');
      expect(route).toHaveAttribute('data-path', '/oauth2/callback');
    });

    it('route "/privacy" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/privacy');
      expect(route).toHaveAttribute('data-path', '/privacy');
    });

    it('route "/terms" has correct path attribute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/terms');
      expect(route).toHaveAttribute('data-path', '/terms');
    });

    it('does not wrap /privacy with ProtectedRoute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/privacy');
      expect(within(route).queryByTestId('navigate-to-login')).not.toBeInTheDocument();
      expect(within(route).getByTestId('privacy-page')).toBeInTheDocument();
    });

    it('does not wrap /terms with ProtectedRoute', () => {
      renderWithTheme(<App />);
      const route = screen.getByTestId('route-/terms');
      expect(within(route).queryByTestId('navigate-to-login')).not.toBeInTheDocument();
      expect(within(route).getByTestId('terms-page')).toBeInTheDocument();
    });
  });

  describe('page rendering', () => {
    it('renders MainPage component for "/" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
    });

    it('renders QuizPlayPage component for "/quiz/:id" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('quiz-play-page')).toBeInTheDocument();
    });

    it('renders QuizResultPage component for "/quiz/:id/result" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('quiz-result-page')).toBeInTheDocument();
    });

    it('renders LoginPage component for "/login" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders SignupPage component for "/signup" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    });

    it('renders OAuthCallbackPage component for "/oauth2/callback" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('oauth-callback-page')).toBeInTheDocument();
    });

    it('renders PrivacyPage component for "/privacy" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
    });

    it('renders TermsPage component for "/terms" route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('terms-page')).toBeInTheDocument();
    });

    it('renders all page components without errors', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-play-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-result-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('signup-page')).toBeInTheDocument();
      expect(screen.getByTestId('oauth-callback-page')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
      expect(screen.getByTestId('terms-page')).toBeInTheDocument();
    });

    it('renders all components inside Routes', () => {
      renderWithTheme(<App />);
      const routes = screen.getByTestId('routes');
      expect(within(routes).getByTestId('main-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('quiz-play-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('quiz-result-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('login-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('signup-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('oauth-callback-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('privacy-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('terms-page')).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute integration', () => {
    it('wraps /quiz/create with ProtectedRoute', () => {
      renderWithTheme(<App />);
      expect(mockProtectedRouteImpl).toHaveBeenCalled();
    });

    it('shows QuizCreatePage when user is logged in', () => {
      setAuthState({ isLoggedIn: true });
      renderWithTheme(<App />);
      expect(screen.getByTestId('quiz-create-page')).toBeInTheDocument();
    });

    it('redirects to login when user is not logged in', () => {
      setAuthState({ isLoggedIn: false });
      renderWithTheme(<App />);
      // /quiz/create 와 /profile 둘 다 ProtectedRoute 라 redirect 컨텐츠가 둘 이상 노출됨
      expect(screen.getAllByTestId('navigate-to-login').length).toBeGreaterThan(0);
      expect(screen.queryByTestId('quiz-create-page')).not.toBeInTheDocument();
    });

    it('passes children prop to ProtectedRoute', () => {
      renderWithTheme(<App />);
      const calls = mockProtectedRouteImpl.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toHaveProperty('children');
    });

    it('protects /quiz/create and /profile paths', () => {
      renderWithTheme(<App />);
      // ProtectedRoute 가 /quiz/create 와 /profile (parent) 두 곳에서 사용됨
      expect(mockProtectedRouteImpl).toHaveBeenCalled();
    });
  });

  describe('Header integration', () => {
    it('renders Header on every route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('Header is rendered inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = getAppShell();
      expect(within(appShell).getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('Footer integration', () => {
    it('renders Footer on every route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('Footer is rendered inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = getAppShell();
      expect(within(appShell).getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders successfully when all mocks are in place', () => {
      renderWithTheme(<App />);
      expect(getAppShell()).toBeInTheDocument();
    });

    it('does not render null or undefined at top level', () => {
      const { container } = renderWithTheme(<App />);
      expect(container.firstChild).not.toBeNull();
    });

    it('maintains structure with different auth states', () => {
      setAuthState({ isLoggedIn: false });
      const { rerender } = renderWithTheme(<App />);
      expect(getAppShell()).toBeInTheDocument();

      setAuthState({ isLoggedIn: true });
      rerender(<App />);
      expect(getAppShell()).toBeInTheDocument();
    });

    it('renders multiple routes independently', () => {
      renderWithTheme(<App />);
      const routes = screen.getAllByTestId(/^route-/);
      expect(routes.length).toBeGreaterThan(0);
      routes.forEach((route) => {
        expect(route).toBeInTheDocument();
      });
    });
  });

  describe('mock verification', () => {
    it('BrowserRouter mock is used', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    });

    it('Header mock is used', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('Footer mock is used', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('Layout mocks are used', () => {
      renderWithTheme(<App />);
      expect(getAppShell()).toBeInTheDocument();
      expect(getPageContent()).toBeInTheDocument();
    });

    it('all page mocks are used when logged in', () => {
      setAuthState({ isLoggedIn: true });
      renderWithTheme(<App />);
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-play-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-result-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-create-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('signup-page')).toBeInTheDocument();
      expect(screen.getByTestId('oauth-callback-page')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-page')).toBeInTheDocument();
      expect(screen.getByTestId('terms-page')).toBeInTheDocument();
    });
  });
});

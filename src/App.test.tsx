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

vi.mock('./pages/QuizPlayPage', () => ({
  default: () => <div data-testid="quiz-play-page">Quiz Play Page</div>,
}));

vi.mock('./pages/QuizResultPage', () => ({
  default: () => <div data-testid="quiz-result-page">Quiz Result Page</div>,
}));

vi.mock('./pages/QuizCreatePage', () => ({
  default: () => <div data-testid="quiz-create-page">Quiz Create Page</div>,
}));

vi.mock('./pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./pages/SignupPage', () => ({
  default: () => <div data-testid="signup-page">Signup Page</div>,
}));

vi.mock('@/components/header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock('@/styles/layout', () => ({
  AppShell: ({ children }: any) => <div data-testid="app-shell">{children}</div>,
  PageContent: ({ children }: any) => <div data-testid="page-content">{children}</div>,
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
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });

    it('renders Header component inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = screen.getByTestId('app-shell');
      expect(within(appShell).getByTestId('header')).toBeInTheDocument();
    });

    it('renders PageContent container inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = screen.getByTestId('app-shell');
      expect(within(appShell).getByTestId('page-content')).toBeInTheDocument();
    });

    it('renders Routes inside PageContent', () => {
      renderWithTheme(<App />);
      const pageContent = screen.getByTestId('page-content');
      expect(within(pageContent).getByTestId('routes')).toBeInTheDocument();
    });

    it('maintains correct DOM hierarchy', () => {
      renderWithTheme(<App />);
      const browserRouter = screen.getByTestId('browser-router');
      const appShell = within(browserRouter).getByTestId('app-shell');
      const header = within(appShell).getByTestId('header');
      const pageContent = within(appShell).getByTestId('page-content');
      const routes = within(pageContent).getByTestId('routes');

      expect(browserRouter).toBeInTheDocument();
      expect(appShell).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(pageContent).toBeInTheDocument();
      expect(routes).toBeInTheDocument();
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

    it('has six routes total', () => {
      renderWithTheme(<App />);
      const routeElements = screen.getAllByTestId(/^route-/);
      expect(routeElements).toHaveLength(6);
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

    it('renders all page components without errors', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('main-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-play-page')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-result-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    });

    it('renders all components inside Routes', () => {
      renderWithTheme(<App />);
      const routes = screen.getByTestId('routes');
      expect(within(routes).getByTestId('main-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('quiz-play-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('quiz-result-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('login-page')).toBeInTheDocument();
      expect(within(routes).getByTestId('signup-page')).toBeInTheDocument();
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
      expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-create-page')).not.toBeInTheDocument();
    });

    it('passes children prop to ProtectedRoute', () => {
      renderWithTheme(<App />);
      const calls = mockProtectedRouteImpl.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toHaveProperty('children');
    });

    it('only protects /quiz/create path', () => {
      renderWithTheme(<App />);
      expect(mockProtectedRouteImpl).toHaveBeenCalledTimes(1);
    });
  });

  describe('Header integration', () => {
    it('renders Header on every route', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('Header is rendered inside AppShell', () => {
      renderWithTheme(<App />);
      const appShell = screen.getByTestId('app-shell');
      expect(within(appShell).getByTestId('header')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders successfully when all mocks are in place', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });

    it('does not render null or undefined at top level', () => {
      const { container } = renderWithTheme(<App />);
      expect(container.firstChild).not.toBeNull();
    });

    it('maintains structure with different auth states', () => {
      setAuthState({ isLoggedIn: false });
      const { rerender } = renderWithTheme(<App />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();

      setAuthState({ isLoggedIn: true });
      rerender(<App />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
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

    it('Layout mocks are used', () => {
      renderWithTheme(<App />);
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
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
    });
  });
});

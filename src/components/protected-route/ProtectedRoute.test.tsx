import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn((sel) =>
    sel({ user: null, isLoggedIn: false, setUser: vi.fn(), logout: vi.fn() }),
  ),
}));

vi.mock('@/store/authStore', () => ({
  default: useAuthStoreMock,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when isLoggedIn is false', () => {
    beforeEach(() => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({ user: null, isLoggedIn: false, setUser: vi.fn(), logout: vi.fn() }),
      );
    });

    it('does not render children content', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="protected-child">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
    });

    it('does not render children text', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <span>Secret Information</span>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByText('Secret Information')).not.toBeInTheDocument();
    });

    it('prevents rendering of complex nested children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div>
              <h1 data-testid="header-title">Secret Title</h1>
              <p data-testid="main-content">Secret area</p>
            </div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('header-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('main-content')).not.toBeInTheDocument();
    });

    it('triggers redirect when children are provided', () => {
      const { container } = renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    it('handles empty children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <></>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByText(/./)).toBeNull();
    });
  });

  describe('when isLoggedIn is true', () => {
    beforeEach(() => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );
    });

    it('renders children content', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="protected-child">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('protected-child')).toBeInTheDocument();
    });

    it('renders children text', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <span>Dashboard Page</span>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
            <div data-testid="child-3">Child 3</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('renders complex nested children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div>
              <header>
                <h1>Welcome</h1>
              </header>
              <main>
                <p data-testid="main-content">Protected area</p>
              </main>
            </div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('renders children even with falsy values', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            {null}
            {undefined}
            <div data-testid="actual-content">Real Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('actual-content')).toBeInTheDocument();
    });

    it('accepts string as children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>Direct string content</ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('Direct string content')).toBeInTheDocument();
    });

    it('accepts number as children', () => {
      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>{42}</ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('accepts boolean as children without crashing', () => {
      const { container } = renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            {true}
            {false}
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(container).toBeInTheDocument();
    });

    it('handles large component trees', () => {
      const LargeTree = () => (
        <div>
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} data-testid={`item-${i}`}>
              Item {i}
            </div>
          ))}
        </div>
      );

      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <LargeTree />
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-99')).toBeInTheDocument();
    });
  });

  describe('authStore integration', () => {
    it('reads isLoggedIn state from authStore', () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(useAuthStoreMock).toHaveBeenCalled();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('handles state change from true to false', () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      const { rerender } = renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();

      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({ user: null, isLoggedIn: false, setUser: vi.fn(), logout: vi.fn() }),
      );

      rerender(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('handles state change from false to true', () => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({ user: null, isLoggedIn: false, setUser: vi.fn(), logout: vi.fn() }),
      );

      const { rerender } = renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();

      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );

      rerender(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute>
            <div data-testid="content">Content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('component metadata', () => {
    it('is wrapped with React.memo', () => {
      expect(ProtectedRoute.$$typeof).toBeDefined();
    });

    it('has displayName set to ProtectedRoute', () => {
      expect(ProtectedRoute.displayName).toBe('ProtectedRoute');
    });
  });

  describe('children types', () => {
    beforeEach(() => {
      useAuthStoreMock.mockImplementation((sel: any) =>
        sel({
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          isLoggedIn: true,
          setUser: vi.fn(),
          logout: vi.fn(),
        }),
      );
    });

    it('accepts React.ReactNode children type', () => {
      const children = <div data-testid="test">Test</div>;

      renderWithTheme(
        <MemoryRouter initialEntries={['/quiz/create']}>
          <ProtectedRoute children={children} />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('test')).toBeInTheDocument();
    });
  });
});

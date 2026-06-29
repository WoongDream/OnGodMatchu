import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { PublicProfileSummary } from '@/types';
import PublicProfileLayout from './PublicProfileLayout';

// ── useProfileSummary mock ───────────────────────────────────────────────────
const mockUseProfileSummary = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useProfileSummary', () => ({
  default: mockUseProfileSummary,
}));

// ── ProfileCard mock (자식 컴포넌트는 단순화) ─────────────────────────────────
vi.mock('@/components/profile-card', () => ({
  default: ({
    nickname,
    imageUrl,
    bio,
    isProfilePublic,
    stats,
  }: {
    nickname: string;
    imageUrl?: string | null;
    bio?: string;
    isProfilePublic: boolean;
    stats?: { totalQuizCount: number; solvedCount: number };
  }) => (
    <div
      data-testid="profile-card"
      data-nickname={nickname}
      data-image-url={imageUrl ?? ''}
      data-bio={bio ?? ''}
      data-is-public={String(isProfilePublic)}
      data-quiz-count={stats?.totalQuizCount ?? ''}
      data-solved-count={stats?.solvedCount ?? ''}
    />
  ),
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const makeSummary = (overrides?: Partial<PublicProfileSummary>): PublicProfileSummary => ({
  userId: 'pub-1',
  nickname: '테스터',
  profileImageUrl: 'https://example.com/avatar.png',
  bio: '안녕하세요',
  isProfilePublic: true,
  solvedCount: 7,
  avgSolveRate: 73,
  quizCount: 5,
  totalPlayCount: 100,
  totalStarCount: 30,
  ...overrides,
});

const renderLayout = (path = '/u/pub-1') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/u/:publicId" element={<PublicProfileLayout />}>
            <Route index element={<div data-testid="outlet-child">Outlet 내용</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('PublicProfileLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로딩 상태', () => {
    it('isLoading=true 이면 "프로필을 불러오는 중..." 텍스트가 보인다', () => {
      mockUseProfileSummary.mockReturnValue({ summary: undefined, isLoading: true, error: null });
      renderLayout();
      expect(screen.getByText('프로필을 불러오는 중...')).toBeInTheDocument();
    });

    it('로딩 중에는 ProfileCard 가 렌더되지 않는다', () => {
      mockUseProfileSummary.mockReturnValue({ summary: undefined, isLoading: true, error: null });
      renderLayout();
      expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    });
  });

  describe('에러 / 미존재', () => {
    it('error 발생 시 "프로필을 불러오지 못했습니다." 안내가 보인다', () => {
      mockUseProfileSummary.mockReturnValue({
        summary: undefined,
        isLoading: false,
        error: new Error('서버 에러'),
      });
      renderLayout();
      expect(screen.getByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.getByText('홈으로')).toBeInTheDocument();
    });

    it('summary=undefined(error 없음)일 때도 안내가 보인다', () => {
      mockUseProfileSummary.mockReturnValue({ summary: undefined, isLoading: false, error: null });
      renderLayout();
      expect(screen.getByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });

  describe('비공개 프로필', () => {
    it('isProfilePublic=false 이면 "비공개 프로필입니다." 안내가 보인다', () => {
      mockUseProfileSummary.mockReturnValue({
        summary: makeSummary({ isProfilePublic: false }),
        isLoading: false,
        error: null,
      });
      renderLayout();
      expect(screen.getByText('비공개 프로필입니다.')).toBeInTheDocument();
      expect(screen.getByText('홈으로')).toBeInTheDocument();
    });

    it('비공개면 ProfileCard 가 렌더되지 않는다', () => {
      mockUseProfileSummary.mockReturnValue({
        summary: makeSummary({ isProfilePublic: false }),
        isLoading: false,
        error: null,
      });
      renderLayout();
      expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    });
  });

  describe('정상 렌더 (공개 프로필)', () => {
    beforeEach(() => {
      mockUseProfileSummary.mockReturnValue({
        summary: makeSummary(),
        isLoading: false,
        error: null,
      });
    });

    it('ProfileCard 에 닉네임과 카운트(quizCount/solvedCount)가 전달된다', () => {
      renderLayout();
      const card = screen.getByTestId('profile-card');
      expect(card).toHaveAttribute('data-nickname', '테스터');
      expect(card).toHaveAttribute('data-quiz-count', '5');
      expect(card).toHaveAttribute('data-solved-count', '7');
    });

    it('사이드 nav 에 만든/푼 퀴즈 링크와 카운트가 렌더된다', () => {
      renderLayout();
      const madeLink = screen.getByRole('link', { name: /만든 퀴즈/ });
      const playedLink = screen.getByRole('link', { name: /푼 퀴즈/ });
      expect(madeLink).toHaveAttribute('href', expect.stringContaining('quizzes-made'));
      expect(playedLink).toHaveAttribute('href', expect.stringContaining('quizzes-played'));
      // 만든 퀴즈 count=quizCount(5), 푼 퀴즈 count=solvedCount(7)
      expect(madeLink).toHaveTextContent('5');
      expect(playedLink).toHaveTextContent('7');
    });

    it('Outlet 영역(자식 라우트)이 렌더된다', () => {
      renderLayout();
      expect(screen.getByTestId('outlet-child')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('displayName 이 "PublicProfileLayout" 이다', () => {
      expect(PublicProfileLayout.displayName).toBe('PublicProfileLayout');
    });
  });
});

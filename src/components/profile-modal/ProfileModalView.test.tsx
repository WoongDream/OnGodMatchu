import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import ProfileModalView from './ProfileModalView';
import type { PublicProfileSummary } from '@/types';

const PUBLIC_SUMMARY: PublicProfileSummary = {
  userId: 'u1',
  nickname: '지호',
  profileImageUrl: '',
  bio: '소개',
  isProfilePublic: true,
  solvedCount: 209,
  avgSolveRate: 71,
  quizCount: 27,
  totalPlayCount: 23104,
  totalStarCount: 1840,
};

const PRIVATE_SUMMARY: PublicProfileSummary = {
  ...PUBLIC_SUMMARY,
  isProfilePublic: false,
};

const noop = () => {};

describe('ProfileModalView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displayName 이 "ProfileModalView" 이다', () => {
    expect(ProfileModalView.displayName).toBe('ProfileModalView');
  });

  describe('isOpen=false', () => {
    it('아무것도 렌더되지 않는다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen={false}
          onClose={noop}
          summary={PUBLIC_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('지호')).not.toBeInTheDocument();
    });
  });

  describe('공개 프로필 (isProfilePublic=true)', () => {
    it('닉네임과 통계 라벨이 렌더된다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={PUBLIC_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('지호')).toBeInTheDocument();
      expect(screen.getByText('풀어봄')).toBeInTheDocument();
      expect(screen.getByText('만든 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('받은 스타')).toBeInTheDocument();
    });

    it('"프로필 보러가기" 버튼이 노출된다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={PUBLIC_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByRole('button', { name: '프로필 보러가기' })).toBeInTheDocument();
    });

    it('"프로필 보러가기" 클릭 시 onGoProfile 이 호출된다', async () => {
      const user = userEvent.setup();
      const onGoProfile = vi.fn();
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={PUBLIC_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={onGoProfile}
        />,
      );

      await user.click(screen.getByRole('button', { name: '프로필 보러가기' }));

      expect(onGoProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('비공개 프로필 (isProfilePublic=false)', () => {
    it('통계는 보이지만 "프로필 보러가기" 버튼은 없다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={PRIVATE_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('지호')).toBeInTheDocument();
      expect(screen.getByText('풀어봄')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '프로필 보러가기' })).not.toBeInTheDocument();
    });
  });

  describe('역할 배지 — summary.role 전달', () => {
    it("summary.role='OWNER' 이면 'OWNER' 배지 텍스트가 노출된다", () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={{ ...PUBLIC_SUMMARY, role: 'OWNER' }}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it("summary.role='ADMIN' 이면 'ADMIN' 배지 텍스트가 노출된다", () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={{ ...PUBLIC_SUMMARY, role: 'ADMIN' }}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
    });

    it('summary.role 이 없으면 역할 배지 텍스트가 미노출된다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={PUBLIC_SUMMARY}
          isLoading={false}
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true 면 "불러오는 중..." 이 표시된다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={undefined}
          isLoading
          error={false}
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
      expect(screen.queryByText('지호')).not.toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error=true 면 에러 문구가 표시된다', () => {
      renderWithTheme(
        <ProfileModalView
          isOpen
          onClose={noop}
          summary={undefined}
          isLoading={false}
          error
          onGoProfile={noop}
        />,
      );

      expect(screen.getByText('프로필을 불러오지 못했어요.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '프로필 보러가기' })).not.toBeInTheDocument();
    });
  });
});

import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import { formatCount } from '@/lib/format/count';
import ProfileCard from './ProfileCard';
import type { MyQuizzesAggregate } from '@/types';

const FULL_STATS: MyQuizzesAggregate = {
  totalQuizCount: 12,
  totalPlayCount: 10739,
  totalShareCount: 305,
  totalStarCount: 88,
  totalCommentCount: 47,
  weeklyPlayCount: 1204,
  avgCorrectRate: 72,
  solvedCount: 348,
  avgSolveRate: 63.6,
};

describe('ProfileCard', () => {
  describe('displayName', () => {
    it('displayName 이 "ProfileCard" 이다', () => {
      expect(ProfileCard.displayName).toBe('ProfileCard');
    });
  });

  describe('닉네임 / 프로필 이미지', () => {
    it('nickname 텍스트가 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
    });

    it('imageUrl 이 없으면 ProfileImage fallback(role="img") 이 렌더된다', () => {
      // ProfileImage 는 imageUrl 이 없으면 nickname 이니셜 기반 fallback(role="img")을 렌더한다.
      renderWithTheme(<ProfileCard nickname="프로필유저" isProfilePublic={false} />);
      expect(screen.getByRole('img', { name: '프로필유저 프로필 이미지' })).toBeInTheDocument();
    });

    it('imageUrl 이 있으면 img 요소가 렌더된다', () => {
      renderWithTheme(
        <ProfileCard
          nickname="프로필유저"
          imageUrl="https://example.com/avatar.png"
          isProfilePublic={false}
        />,
      );
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    });
  });

  describe('isProfilePublic Badge', () => {
    it('isProfilePublic=true 이면 "공개" Badge 가 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={true} />);
      expect(screen.getByText('공개')).toBeInTheDocument();
      expect(screen.queryByText('비공개')).not.toBeInTheDocument();
    });

    it('isProfilePublic=false 이면 "비공개" Badge 가 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.getByText('비공개')).toBeInTheDocument();
      expect(screen.queryByText('공개')).not.toBeInTheDocument();
    });
  });

  describe('bio', () => {
    it('bio 가 있으면 렌더된다', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" bio="안녕하세요" isProfilePublic={false} />,
      );
      expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    });

    it('bio 가 없으면 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.queryByText('안녕하세요')).not.toBeInTheDocument();
    });
  });

  describe('stats 없을 때', () => {
    it('"플레이 기록" 블록이 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.queryByText('플레이 기록')).not.toBeInTheDocument();
    });

    it('"만든 퀴즈" 블록이 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.queryByText('만든 퀴즈')).not.toBeInTheDocument();
    });

    it('stat 라벨들이 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.queryByText('풀어봄')).not.toBeInTheDocument();
      expect(screen.queryByText('정답률')).not.toBeInTheDocument();
      expect(screen.queryByText('총 개수')).not.toBeInTheDocument();
      expect(screen.queryByText('총 플레이')).not.toBeInTheDocument();
      expect(screen.queryByText('받은 스타')).not.toBeInTheDocument();
    });
  });

  describe('stats 있을 때 — 블록 / 라벨 노출', () => {
    it('"플레이 기록" 과 "만든 퀴즈" 블록이 렌더된다', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
      );
      expect(screen.getByText('플레이 기록')).toBeInTheDocument();
      expect(screen.getByText('만든 퀴즈')).toBeInTheDocument();
    });

    it.each([['풀어봄'], ['정답률'], ['총 개수'], ['총 플레이'], ['받은 스타']])(
      '"%s" 라벨이 렌더된다',
      (label) => {
        renderWithTheme(
          <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
        );
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  describe('stats 있을 때 — 값 포맷 (formatCount)', () => {
    it('풀어봄 = formatCount(solvedCount) → solvedCount=348 → "348"', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
      );
      expect(screen.getByText(formatCount(348))).toBeInTheDocument();
      expect(formatCount(348)).toBe('348');
    });

    it('solvedCount 미지정이면 풀어봄 = formatCount(0) → "0"', () => {
      const rest = { ...FULL_STATS };
      delete rest.solvedCount;
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} stats={rest} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(formatCount(0)).toBe('0');
    });

    it('총 플레이 = formatCount(totalPlayCount) → 10739 → "10.7k"', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
      );
      expect(screen.getByText(formatCount(10739))).toBeInTheDocument();
      expect(formatCount(10739)).toBe('10.7k');
    });

    it('총 개수 = formatCount(totalQuizCount) → 12 → "12"', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
      );
      expect(screen.getByText(formatCount(12))).toBeInTheDocument();
      expect(formatCount(12)).toBe('12');
    });

    it('받은 스타 = formatCount(totalStarCount) → 88 → "88"', () => {
      renderWithTheme(
        <ProfileCard nickname="테스트유저" isProfilePublic={false} stats={FULL_STATS} />,
      );
      expect(screen.getByText(formatCount(88))).toBeInTheDocument();
      expect(formatCount(88)).toBe('88');
    });

    it('큰 값도 단축 표기된다 — totalPlayCount=1_500_000 → "1.5m"', () => {
      renderWithTheme(
        <ProfileCard
          nickname="테스트유저"
          isProfilePublic={false}
          stats={{ ...FULL_STATS, totalPlayCount: 1_500_000 }}
        />,
      );
      expect(screen.getByText('1.5m')).toBeInTheDocument();
      expect(formatCount(1_500_000)).toBe('1.5m');
    });
  });

  describe('RoleBadge — role prop', () => {
    it("role='OWNER' 이면 'OWNER' 텍스트가 노출된다", () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} role="OWNER" />);
      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it("role='ADMIN' 이면 'ADMIN' 텍스트가 노출된다", () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} role="ADMIN" />);
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
    });

    it("role='USER' 이면 'OWNER'·'ADMIN' 텍스트가 미노출된다", () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} role="USER" />);
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it('role 미전달이면 배지 텍스트가 미노출된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} />);
      expect(screen.queryByText('OWNER')).not.toBeInTheDocument();
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it('role 이 있어도 닉네임과 공개 배지에 회귀가 없다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic role="OWNER" />);
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
      expect(screen.getByText('공개')).toBeInTheDocument();
      expect(screen.getByText('OWNER')).toBeInTheDocument();
    });
  });

  describe('정답률 — avgSolveRate (formatRate)', () => {
    it('avgSolveRate=63.6 → Math.round → "64%"', () => {
      renderWithTheme(
        <ProfileCard
          nickname="테스트유저"
          isProfilePublic={false}
          stats={{ ...FULL_STATS, avgSolveRate: 63.6 }}
        />,
      );
      expect(screen.getByText('64%')).toBeInTheDocument();
    });

    it('avgSolveRate=72.4 → Math.round → "72%"', () => {
      renderWithTheme(
        <ProfileCard
          nickname="테스트유저"
          isProfilePublic={false}
          stats={{ ...FULL_STATS, avgSolveRate: 72.4 }}
        />,
      );
      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('avgSolveRate=null → "—"', () => {
      renderWithTheme(
        <ProfileCard
          nickname="테스트유저"
          isProfilePublic={false}
          stats={{ ...FULL_STATS, avgSolveRate: null }}
        />,
      );
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('avgSolveRate=undefined → "—"', () => {
      const rest = { ...FULL_STATS };
      delete rest.avgSolveRate;
      renderWithTheme(<ProfileCard nickname="테스트유저" isProfilePublic={false} stats={rest} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('avgSolveRate=0 → "0%" (—가 아니다)', () => {
      renderWithTheme(
        <ProfileCard
          nickname="테스트유저"
          isProfilePublic={false}
          stats={{ ...FULL_STATS, avgSolveRate: 0 }}
        />,
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.queryByText('—')).not.toBeInTheDocument();
    });
  });
});

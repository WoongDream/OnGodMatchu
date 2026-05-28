import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import ResultActions from './ResultActions';

describe('ResultActions', () => {
  let onRetry: ReturnType<typeof vi.fn>;
  let onStar: ReturnType<typeof vi.fn>;
  let onShare: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onRetry = vi.fn();
    onStar = vi.fn();
    onShare = vi.fn();
  });

  const renderActions = (overrides: Partial<React.ComponentProps<typeof ResultActions>> = {}) => {
    const props = {
      starred: false,
      starCount: 0,
      shareCount: 0,
      onRetry,
      onStar,
      onShare,
      ...overrides,
    } as React.ComponentProps<typeof ResultActions>;
    return renderWithTheme(<ResultActions {...props} />);
  };

  describe('렌더', () => {
    it('다시 풀기 버튼과 스타/공유 chip 을 마운트한다', () => {
      renderActions();

      expect(screen.getByRole('button', { name: '다시 풀기' })).toBeInTheDocument();
      // StarButton chip 의 aria-label 은 starred=false 일 때 '좋아요'
      expect(screen.getByRole('button', { name: '좋아요' })).toBeInTheDocument();
      // ShareButton chip 의 aria-label 은 항상 '공유하기'
      expect(screen.getByRole('button', { name: '공유하기' })).toBeInTheDocument();
      // chip 내 라벨 텍스트 노출
      expect(screen.getByText('스타')).toBeInTheDocument();
      expect(screen.getByText('공유')).toBeInTheDocument();
    });

    it('displayName 이 ResultActions 이다', () => {
      expect(ResultActions.displayName).toBe('ResultActions');
    });
  });

  describe('콜백 호출', () => {
    it('다시 풀기 클릭 시 onRetry 가 호출된다', async () => {
      const user = userEvent.setup();
      renderActions();

      await user.click(screen.getByRole('button', { name: '다시 풀기' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onStar).not.toHaveBeenCalled();
      expect(onShare).not.toHaveBeenCalled();
    });

    it('스타 chip 클릭 시 onStar 가 호출된다', async () => {
      const user = userEvent.setup();
      renderActions();

      await user.click(screen.getByRole('button', { name: '좋아요' }));

      expect(onStar).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
      expect(onShare).not.toHaveBeenCalled();
    });

    it('공유 chip 클릭 시 onShare 가 호출된다', async () => {
      const user = userEvent.setup();
      renderActions();

      await user.click(screen.getByRole('button', { name: '공유하기' }));

      expect(onShare).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
      expect(onStar).not.toHaveBeenCalled();
    });
  });

  describe('starred 분기', () => {
    it('starred=false 면 aria-label 이 "좋아요" 이고 aria-pressed=false 이다', () => {
      renderActions({ starred: false });

      const starBtn = screen.getByRole('button', { name: '좋아요' });
      expect(starBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('starred=true 면 aria-label 이 "좋아요 취소" 이고 aria-pressed=true 이다', () => {
      renderActions({ starred: true });

      const starBtn = screen.getByRole('button', { name: '좋아요 취소' });
      expect(starBtn).toHaveAttribute('aria-pressed', 'true');
      // 반대 라벨은 존재하지 않아야 함
      expect(screen.queryByRole('button', { name: '좋아요' })).not.toBeInTheDocument();
    });
  });

  describe('카운트 표시', () => {
    it('starCount / shareCount 가 chip 내 텍스트로 노출된다', () => {
      renderActions({ starCount: 12, shareCount: 345 });

      // formatCount: 1000 미만은 그대로
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('345')).toBeInTheDocument();
    });

    it('0 카운트도 노출된다', () => {
      renderActions({ starCount: 0, shareCount: 0 });

      // '0' 텍스트가 두 군데(스타/공유 chip) 모두 노출
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('starDisabled 분기', () => {
    it('starDisabled=true 이면 스타 버튼이 disabled 다', () => {
      renderActions({ starDisabled: true });

      expect(screen.getByRole('button', { name: '좋아요' })).toBeDisabled();
    });

    it('starDisabled 기본값(false) 이면 활성 상태다', () => {
      renderActions();

      expect(screen.getByRole('button', { name: '좋아요' })).not.toBeDisabled();
    });

    it('starDisabled=true 이면 클릭해도 onStar 가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderActions({ starDisabled: true });

      await user.click(screen.getByRole('button', { name: '좋아요' }));

      expect(onStar).not.toHaveBeenCalled();
    });
  });
});

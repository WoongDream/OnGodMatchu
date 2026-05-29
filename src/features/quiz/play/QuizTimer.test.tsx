import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizTimer from './QuizTimer';

const RADIUS = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const getProgressCircle = (container: HTMLElement): SVGCircleElement => {
  const circles = container.querySelectorAll('circle');
  // 두 번째 circle 이 progress (첫 번째는 track)
  return circles[1] as unknown as SVGCircleElement;
};

describe('QuizTimer', () => {
  describe('렌더링', () => {
    it('남은 시간을 텍스트로 표시한다 (평시)', () => {
      renderWithTheme(<QuizTimer remainingSec={18} totalSec={20} />);
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('role=timer 와 aria-label 을 노출한다', () => {
      renderWithTheme(<QuizTimer remainingSec={18} totalSec={20} />);
      const timer = screen.getByRole('timer');
      expect(timer).toBeInTheDocument();
      expect(timer).toHaveAttribute('aria-label', '남은 시간 18초');
    });

    it('displayName 이 QuizTimer 로 설정되어 있다', () => {
      expect(QuizTimer.displayName).toBe('QuizTimer');
    });
  });

  describe('progress 계산 (stroke-dashoffset)', () => {
    it('평시 — remaining=18, total=20 이면 dashOffset = CIRCUMFERENCE * (1 - 0.9)', () => {
      const { container } = renderWithTheme(<QuizTimer remainingSec={18} totalSec={20} />);
      const progress = getProgressCircle(container);
      const expected = CIRCUMFERENCE * (1 - 18 / 20);
      expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(expected, 5);
      expect(Number(progress.getAttribute('stroke-dasharray'))).toBeCloseTo(CIRCUMFERENCE, 5);
    });

    it('0초 — dashOffset = CIRCUMFERENCE (꽉 빔)', () => {
      const { container } = renderWithTheme(<QuizTimer remainingSec={0} totalSec={20} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      const progress = getProgressCircle(container);
      expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(CIRCUMFERENCE, 5);
    });
  });

  describe('임계 분기 (critical)', () => {
    it('remaining=3 — 임계 시작 (텍스트 "3" 노출, aria-label 업데이트)', () => {
      renderWithTheme(<QuizTimer remainingSec={3} totalSec={20} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '남은 시간 3초');
    });

    it('remaining=4 — boundary 위쪽이므로 평시 (텍스트 "4" 노출, label 정상)', () => {
      renderWithTheme(<QuizTimer remainingSec={4} totalSec={20} />);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '남은 시간 4초');
    });
  });

  describe('방어 로직 (safeRemaining / totalSec 가드)', () => {
    it('음수 — remaining=-1 이면 "0" 으로 표시 (safeRemaining)', () => {
      const { container } = renderWithTheme(<QuizTimer remainingSec={-1} totalSec={20} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '남은 시간 0초');
      const progress = getProgressCircle(container);
      expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(CIRCUMFERENCE, 5);
    });

    it('totalSec=0 — ratio=0 이므로 dashOffset = CIRCUMFERENCE, 텍스트는 remainingSec 그대로', () => {
      const { container } = renderWithTheme(<QuizTimer remainingSec={10} totalSec={0} />);
      expect(screen.getByText('10')).toBeInTheDocument();
      const progress = getProgressCircle(container);
      expect(Number(progress.getAttribute('stroke-dashoffset'))).toBeCloseTo(CIRCUMFERENCE, 5);
    });
  });
});

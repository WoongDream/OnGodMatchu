import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import ResultHeader from './ResultHeader';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

describe('ResultHeader', () => {
  describe('기본 렌더', () => {
    it('정답률 % 와 본문, 상위 % 배지를 모두 렌더한다', () => {
      renderWithTheme(<ResultHeader score={12} totalQuestions={15} topPercentile={7} />);

      // 80% 정답률 (round(12/15*100) = 80)
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('정답률 %')).toBeInTheDocument();

      // 본문 (강조 span 분리되어 있어 텍스트 매칭은 노드 기준)
      expect(screen.getByText('퀴즈 결과')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText(/문제 정답!/)).toBeInTheDocument();

      // 배지
      expect(screen.getByText('▲ 상위 7 %')).toBeInTheDocument();
    });
  });

  describe('정답률 계산', () => {
    it('만점이면 100 을 표시한다', () => {
      renderWithTheme(<ResultHeader score={15} totalQuestions={15} topPercentile={1} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('▲ 상위 1 %')).toBeInTheDocument();
    });

    it('영점이면 0 을 표시한다', () => {
      renderWithTheme(<ResultHeader score={0} totalQuestions={10} topPercentile={99} />);

      // 정답률 0 과 정답 수 0 두 곳에 등장 → 최소 2개 이상
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('▲ 상위 99 %')).toBeInTheDocument();
    });

    it('totalQuestions=0 이어도 NaN 없이 0 으로 표시한다', () => {
      renderWithTheme(<ResultHeader score={0} totalQuestions={0} topPercentile={null} />);

      // 0 은 정답률 숫자, 문제 수(0), 정답 수(0) 모두에 등장. 최소 1개 이상 존재하면 충분.
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      // NaN 미발생
      expect(screen.queryByText(/NaN/)).toBeNull();
    });
  });

  describe('topPercentile 분기', () => {
    it('topPercentile=null 이면 상위 배지를 렌더하지 않는다', () => {
      renderWithTheme(<ResultHeader score={8} totalQuestions={10} topPercentile={null} />);

      expect(screen.queryByText(/상위/)).toBeNull();
    });

    it('소수점은 Math.round 로 처리한다 (7.4 → 7)', () => {
      renderWithTheme(<ResultHeader score={1} totalQuestions={10} topPercentile={7.4} />);

      expect(screen.getByText('▲ 상위 7 %')).toBeInTheDocument();
    });

    it('소수점은 Math.round 로 처리한다 (7.6 → 8)', () => {
      renderWithTheme(<ResultHeader score={1} totalQuestions={10} topPercentile={7.6} />);

      expect(screen.getByText('▲ 상위 8 %')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('section 과 circle wrapper 에 적절한 aria-label 이 부여된다', () => {
      renderWithTheme(<ResultHeader score={12} totalQuestions={15} topPercentile={7} />);

      expect(screen.getByRole('region', { name: '퀴즈 결과 요약' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: '정답률 80%' })).toBeInTheDocument();
    });
  });

  describe('SVG progress', () => {
    it('strokeDashoffset 이 CIRCUMFERENCE * (1 - ratio) 와 일치한다', () => {
      const { container } = renderWithTheme(
        <ResultHeader score={12} totalQuestions={15} topPercentile={null} />,
      );

      // track + progress 두 개의 circle. 두 번째가 progress.
      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBe(2);

      const progressCircle = circles[1];
      const expectedOffset = CIRCUMFERENCE * (1 - 0.8);
      const actualOffset = Number(progressCircle.getAttribute('stroke-dashoffset'));

      expect(actualOffset).toBeCloseTo(expectedOffset, 5);
      expect(Number(progressCircle.getAttribute('stroke-dasharray'))).toBeCloseTo(CIRCUMFERENCE, 5);
    });
  });
});

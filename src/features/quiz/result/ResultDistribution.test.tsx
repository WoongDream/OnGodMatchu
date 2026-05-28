import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen, within } from '@/test/renderWithTheme';
import ResultDistribution from './ResultDistribution';
import type { QuizScoreDistribution } from '@/types';

const buildDistribution = (counts: number[]): QuizScoreDistribution['distribution'] =>
  counts.map((count, i) => ({ score: i, count }));

const sampleData: QuizScoreDistribution = {
  totalAttempts: 12800,
  averageScore: 8.4,
  distribution: buildDistribution([0, 1, 3, 5, 8, 12, 18, 25, 30, 35, 32, 28, 22, 14, 8, 3]),
};

describe('ResultDistribution', () => {
  describe('기본 렌더', () => {
    it('헤더의 평균 점수와 응시자 수를 렌더한다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={7} />);

      expect(screen.getByText('점수 분포')).toBeInTheDocument();
      expect(screen.getByText('평균 8.4점')).toBeInTheDocument();
      expect(screen.getByText(/12\.8k명/)).toBeInTheDocument();
    });

    it('distribution 길이만큼 listitem 을 렌더한다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={7} />);

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(16);
    });
  });

  describe('평균 점수 표시', () => {
    it('정수 평균도 소수점 한 자리로 표시한다 (toFixed(1))', () => {
      const data: QuizScoreDistribution = {
        ...sampleData,
        averageScore: 8,
      };
      renderWithTheme(<ResultDistribution data={data} myScore={12} topPercentile={null} />);

      expect(screen.getByText('평균 8.0점')).toBeInTheDocument();
    });
  });

  describe('formatCount', () => {
    it('12800 은 12.8k 로 표시한다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={null} />);

      expect(screen.getByText(/12\.8k명/)).toBeInTheDocument();
    });

    it('1000 미만은 그대로 표시한다 (500 → 500)', () => {
      const data: QuizScoreDistribution = {
        ...sampleData,
        totalAttempts: 500,
      };
      renderWithTheme(<ResultDistribution data={data} myScore={12} topPercentile={null} />);

      expect(screen.getByText(/500명/)).toBeInTheDocument();
    });
  });

  describe('내 점수 강조', () => {
    it('내 점수 column 의 aria-label 에 "(내 점수)" 가 포함된다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={5} topPercentile={7} />);

      // score=5 의 count 는 sample 에서 12
      expect(screen.getByRole('listitem', { name: '5점 12명 (내 점수)' })).toBeInTheDocument();
    });

    it('내 점수 badge "내 점수 N" 이 노출된다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={5} topPercentile={7} />);

      const mineItem = screen.getByRole('listitem', { name: '5점 12명 (내 점수)' });
      expect(within(mineItem).getByText('내 점수 5')).toBeInTheDocument();
    });

    it('myScore 와 일치하지 않는 cell 의 aria-label 에는 "(내 점수)" 가 없다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={5} topPercentile={7} />);

      expect(screen.getByRole('listitem', { name: '0점 0명' })).toBeInTheDocument();
      expect(screen.queryByRole('listitem', { name: '0점 0명 (내 점수)' })).toBeNull();
    });
  });

  describe('푸터 - topPercentile', () => {
    it('topPercentile 가 주어지면 상위 % 안내문을 노출한다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={7} />);

      expect(screen.getByText('상위 7%')).toBeInTheDocument();
      expect(screen.getByText(/총 응시자 중/)).toBeInTheDocument();
      expect(screen.getByText(/점수에요/)).toBeInTheDocument();
    });

    it('topPercentile=null 이면 푸터 안내문을 노출하지 않는다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={null} />);

      expect(screen.queryByText(/상위/)).toBeNull();
      expect(screen.queryByText(/점수에요/)).toBeNull();
    });

    it('topPercentile 소수점은 Math.round 로 반올림한다 (7.6 → 8)', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={7.6} />);

      expect(screen.getByText('상위 8%')).toBeInTheDocument();
    });
  });

  describe('빈 / 0 count distribution', () => {
    it('distribution 이 비어있어도 정상 렌더한다', () => {
      const data: QuizScoreDistribution = {
        totalAttempts: 0,
        averageScore: 0,
        distribution: [],
      };
      renderWithTheme(<ResultDistribution data={data} myScore={0} topPercentile={null} />);

      // listitem 0 개, 헤더는 정상.
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      expect(screen.getByText('평균 0.0점')).toBeInTheDocument();
      // NaN 미발생
      expect(screen.queryByText(/NaN/)).toBeNull();
    });

    it('모든 count 가 0 이어도 NaN 없이 렌더한다', () => {
      const data: QuizScoreDistribution = {
        totalAttempts: 0,
        averageScore: 0,
        distribution: buildDistribution([0, 0, 0, 0]),
      };
      const { container } = renderWithTheme(
        <ResultDistribution data={data} myScore={0} topPercentile={null} />,
      );

      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      expect(container.innerHTML).not.toMatch(/NaN/);
    });
  });

  describe('접근성', () => {
    it('section / list role 과 라벨이 부여된다', () => {
      renderWithTheme(<ResultDistribution data={sampleData} myScore={12} topPercentile={7} />);

      expect(screen.getByRole('region', { name: '점수 분포' })).toBeInTheDocument();
      expect(screen.getByRole('list', { name: '점수별 응시자 수' })).toBeInTheDocument();
    });
  });
});

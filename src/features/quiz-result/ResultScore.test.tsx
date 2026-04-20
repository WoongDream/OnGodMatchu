import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import ResultScore from './ResultScore';

describe('ResultScore', () => {
  describe('rendering', () => {
    it('renders the label "최종 점수"', () => {
      renderWithTheme(<ResultScore scores={5} total={10} />);
      expect(screen.getByText('최종 점수')).toBeInTheDocument();
    });

    it('displays the score number', () => {
      renderWithTheme(<ResultScore scores={7} total={10} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays the total with slash prefix', () => {
      renderWithTheme(<ResultScore scores={7} total={10} />);
      expect(screen.getByText('/ 10')).toBeInTheDocument();
    });

    it('renders score number and total separately', () => {
      renderWithTheme(<ResultScore scores={3} total={5} />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('/ 5')).toBeInTheDocument();
    });

    it('renders with zero score', () => {
      renderWithTheme(<ResultScore scores={0} total={10} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('/ 10')).toBeInTheDocument();
    });

    it('has displayName set to ResultScore', () => {
      expect(ResultScore.displayName).toBe('ResultScore');
    });
  });

  describe('getScoreMessage - perfect score (ratio === 1.0)', () => {
    it('returns perfect message when ratio is exactly 1.0', () => {
      renderWithTheme(<ResultScore scores={10} total={10} />);
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });

    it('returns perfect message for score 5 out of 5', () => {
      renderWithTheme(<ResultScore scores={5} total={5} />);
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });

    it('returns perfect message for score 1 out of 1', () => {
      renderWithTheme(<ResultScore scores={1} total={1} />);
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });

    it('returns perfect message for large perfect score', () => {
      renderWithTheme(<ResultScore scores={100} total={100} />);
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });
  });

  describe('getScoreMessage - high score (0.8 <= ratio < 1.0)', () => {
    it('returns high score message when ratio is exactly 0.8', () => {
      renderWithTheme(<ResultScore scores={8} total={10} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('returns high score message when ratio is 0.9', () => {
      renderWithTheme(<ResultScore scores={9} total={10} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('returns high score message when ratio is 0.81', () => {
      renderWithTheme(<ResultScore scores={81} total={100} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('returns high score message for 4 out of 5', () => {
      renderWithTheme(<ResultScore scores={4} total={5} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('returns high score message just before perfect score', () => {
      renderWithTheme(<ResultScore scores={99} total={100} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });
  });

  describe('getScoreMessage - medium score (0.5 <= ratio < 0.8)', () => {
    it('returns medium score message when ratio is exactly 0.5', () => {
      renderWithTheme(<ResultScore scores={5} total={10} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('returns medium score message when ratio is 0.6', () => {
      renderWithTheme(<ResultScore scores={6} total={10} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('returns medium score message when ratio is 0.7', () => {
      renderWithTheme(<ResultScore scores={7} total={10} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('returns medium score message when ratio is 0.79 (just before high score)', () => {
      renderWithTheme(<ResultScore scores={79} total={100} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('returns medium score message for 5 out of 10', () => {
      renderWithTheme(<ResultScore scores={5} total={10} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('returns medium score message for 3 out of 5', () => {
      renderWithTheme(<ResultScore scores={3} total={5} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });
  });

  describe('getScoreMessage - low score (ratio < 0.5)', () => {
    it('returns low score message when ratio is below 0.5', () => {
      renderWithTheme(<ResultScore scores={4} total={10} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });

    it('returns low score message when ratio is 0.49', () => {
      renderWithTheme(<ResultScore scores={49} total={100} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });

    it('returns low score message when ratio is 0.1', () => {
      renderWithTheme(<ResultScore scores={1} total={10} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });

    it('returns low score message when ratio is 0', () => {
      renderWithTheme(<ResultScore scores={0} total={10} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });

    it('returns low score message for 2 out of 5', () => {
      renderWithTheme(<ResultScore scores={2} total={5} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });

    it('returns low score message for 1 out of 3', () => {
      renderWithTheme(<ResultScore scores={1} total={3} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();
    });
  });

  describe('score message logic - boundary conditions', () => {
    it('switches from low to medium at exactly 0.5 ratio', () => {
      const { rerender } = renderWithTheme(<ResultScore scores={4} total={10} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();

      rerender(<ResultScore scores={5} total={10} />);
      expect(screen.queryByText('다음엔 더 잘 할 수 있어요 💪')).not.toBeInTheDocument();
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('switches from medium to high at exactly 0.8 ratio', () => {
      const { rerender } = renderWithTheme(<ResultScore scores={7} total={10} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();

      rerender(<ResultScore scores={8} total={10} />);
      expect(screen.queryByText('절반 이상 맞췄어요! 🙂')).not.toBeInTheDocument();
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('switches from high to perfect at exactly 1.0 ratio', () => {
      const { rerender } = renderWithTheme(<ResultScore scores={9} total={10} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();

      rerender(<ResultScore scores={10} total={10} />);
      expect(screen.queryByText('거의 다 맞췴어요! 대단해요 👏')).not.toBeInTheDocument();
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });
  });

  describe('component composition', () => {
    it('renders all required elements together', () => {
      renderWithTheme(<ResultScore scores={7} total={10} />);
      expect(screen.getByText('최종 점수')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('/ 10')).toBeInTheDocument();
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('updates message when props change', () => {
      const { rerender } = renderWithTheme(<ResultScore scores={4} total={10} />);
      expect(screen.getByText('다음엔 더 잘 할 수 있어요 💪')).toBeInTheDocument();

      rerender(<ResultScore scores={10} total={10} />);
      expect(screen.queryByText('다음엔 더 잘 할 수 있어요 💪')).not.toBeInTheDocument();
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });

    it('updates score display when props change', () => {
      const { rerender } = renderWithTheme(<ResultScore scores={3} total={10} />);
      expect(screen.getByText('3')).toBeInTheDocument();

      rerender(<ResultScore scores={8} total={10} />);
      expect(screen.queryByText('3')).not.toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('edge cases with different total values', () => {
    it('handles single question quiz', () => {
      renderWithTheme(<ResultScore scores={1} total={1} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 1')).toBeInTheDocument();
      expect(screen.getByText('완벽해요! 천재인가요? 🎉')).toBeInTheDocument();
    });

    it('handles two question quiz at 0.5 ratio', () => {
      renderWithTheme(<ResultScore scores={1} total={2} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('/ 2')).toBeInTheDocument();
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('handles large quiz (100 questions)', () => {
      renderWithTheme(<ResultScore scores={80} total={100} />);
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('/ 100')).toBeInTheDocument();
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('handles very large quiz (1000 questions)', () => {
      renderWithTheme(<ResultScore scores={500} total={1000} />);
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('/ 1000')).toBeInTheDocument();
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });
  });

  describe('floating point ratio precision', () => {
    it('correctly handles ratio 0.8 with 5 questions', () => {
      renderWithTheme(<ResultScore scores={4} total={5} />);
      expect(screen.getByText('거의 다 맞췄어요! 대단해요 👏')).toBeInTheDocument();
    });

    it('correctly handles ratio 0.5 with 3 questions', () => {
      renderWithTheme(<ResultScore scores={1} total={2} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('correctly handles ratio 0.75 with 4 questions', () => {
      renderWithTheme(<ResultScore scores={3} total={4} />);
      expect(screen.getByText('절반 이상 맞췄어요! 🙂')).toBeInTheDocument();
    });

    it('correctly handles ratio 0.99 with 100 questions', () => {
      const { container } = renderWithTheme(<ResultScore scores={99} total={100} />);
      expect(container.textContent).toContain('거의 다 맞췄어요! 대단해요 👏');
    });
  });
});

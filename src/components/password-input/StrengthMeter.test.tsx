import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import StrengthMeter from './StrengthMeter';
import type { PasswordStrengthScore } from './PasswordInput.type';

describe('StrengthMeter', () => {
  describe('강도 라벨 렌더', () => {
    const CASES: [PasswordStrengthScore, string][] = [
      [0, '매우 약함'],
      [1, '약함'],
      [2, '보통'],
      [3, '좋음'],
      [4, '매우 강함'],
    ];

    it.each(CASES)('score %i → "%s" 라벨을 렌더한다', (score, label) => {
      renderWithTheme(<StrengthMeter score={score} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('crackTimesDisplay', () => {
    it('crackTimesDisplay prop 이 있으면 "예상 해독 시간: ..." 텍스트를 렌더한다', () => {
      renderWithTheme(<StrengthMeter score={2} crackTimesDisplay="3 hours" />);
      expect(screen.getByText('예상 해독 시간: 3 hours')).toBeInTheDocument();
    });

    it('crackTimesDisplay prop 이 없으면 해독 시간 텍스트를 렌더하지 않는다', () => {
      renderWithTheme(<StrengthMeter score={2} />);
      expect(screen.queryByText(/예상 해독 시간/)).not.toBeInTheDocument();
    });

    it('crackTimesDisplay 가 빈 문자열이면 해독 시간 텍스트를 렌더하지 않는다', () => {
      renderWithTheme(<StrengthMeter score={2} crackTimesDisplay="" />);
      expect(screen.queryByText(/예상 해독 시간/)).not.toBeInTheDocument();
    });
  });

  describe('feedbackText', () => {
    it('feedbackText 가 주어지면 "💡 {text}" 형태로 렌더된다', () => {
      renderWithTheme(<StrengthMeter score={0} feedbackText="더 길게 입력해보세요" />);
      expect(screen.getByText('💡 더 길게 입력해보세요')).toBeInTheDocument();
    });

    it('feedbackText 내용이 화면에 포함된다 (부분 일치)', () => {
      renderWithTheme(<StrengthMeter score={1} feedbackText="숫자와 특수문자를 추가해보세요" />);
      expect(screen.getByText(/숫자와 특수문자를 추가해보세요/)).toBeInTheDocument();
    });

    it('feedbackText 가 undefined 면 피드백 라인이 렌더되지 않는다', () => {
      renderWithTheme(<StrengthMeter score={2} />);
      expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    });

    it('feedbackText 가 빈 문자열이면 피드백 라인이 렌더되지 않는다', () => {
      renderWithTheme(<StrengthMeter score={3} feedbackText="" />);
      expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    });
  });

  describe('ARIA', () => {
    it('progressbar role 이 렌더된다', () => {
      renderWithTheme(<StrengthMeter score={3} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('aria-valuenow 가 score 와 일치한다', () => {
      renderWithTheme(<StrengthMeter score={3} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '3');
    });

    it('aria-valuemin 은 0 이다', () => {
      renderWithTheme(<StrengthMeter score={0} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0');
    });

    it('aria-valuemax 는 4 이다', () => {
      renderWithTheme(<StrengthMeter score={4} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4');
    });
  });
});

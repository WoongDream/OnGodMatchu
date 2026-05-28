import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import QuizFeedback from './QuizFeedback';

describe('QuizFeedback', () => {
  describe('정답 상태', () => {
    it('정답일 때 "정답입니다" 와 정답 텍스트(라벨+값)가 노출되고, "내 답변" 은 노출되지 않는다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByText('정답입니다')).toBeInTheDocument();
      // 정답일 때도 "정답 {answer}" 노출 — 라벨과 값이 별도 span 으로 분리되어 있음
      expect(screen.getByText('정답')).toBeInTheDocument();
      expect(screen.getByText('짱구')).toBeInTheDocument();
      // "내 답변" 라벨은 정답일 때 노출되지 않는다
      expect(screen.queryByText('내 답변')).not.toBeInTheDocument();
    });
  });

  describe('오답 상태', () => {
    it('오답일 때 "오답입니다" + "정답 짱구" + "내 답변 철수" 가 모두 노출된다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={false}
          answer="짱구"
          userAnswer="철수"
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByText('오답입니다')).toBeInTheDocument();
      expect(screen.getByText('정답')).toBeInTheDocument();
      expect(screen.getByText('짱구')).toBeInTheDocument();
      expect(screen.getByText('내 답변')).toBeInTheDocument();
      expect(screen.getByText('철수')).toBeInTheDocument();
    });

    it('시간 초과로 userAnswer 가 빈 문자열이면 "내 답변 (미입력)" 으로 노출된다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={false}
          answer="짱구"
          userAnswer=""
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByText('내 답변')).toBeInTheDocument();
      expect(screen.getByText('(미입력)')).toBeInTheDocument();
    });

    it('userAnswer 가 공백 문자열뿐이어도 "(미입력)" 으로 처리된다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={false}
          answer="짱구"
          userAnswer="   "
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByText('(미입력)')).toBeInTheDocument();
    });
  });

  describe('onNext 동작', () => {
    it('다음 버튼을 클릭하면 onNext 가 호출된다', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={onNext}
          nextAriaLabel="다음 문제"
        />,
      );

      const nextButton = screen.getByLabelText('다음 문제');
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('nextAriaLabel', () => {
    it('nextAriaLabel="다음 문제" 일 때 해당 라벨로 버튼이 노출된다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByLabelText('다음 문제')).toBeInTheDocument();
    });

    it('nextAriaLabel="결과 보기" 일 때 해당 라벨로 버튼이 노출된다 (마지막 문항)', () => {
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={vi.fn()}
          nextAriaLabel="결과 보기"
        />,
      );

      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();
    });
  });

  describe('nextDisabled', () => {
    it('nextDisabled=true 면 다음 버튼이 disabled 된다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
          nextDisabled={true}
        />,
      );

      expect(screen.getByLabelText('다음 문제')).toBeDisabled();
    });

    it('nextDisabled 미전달(기본값 false) 시 다음 버튼은 활성 상태이다', () => {
      renderWithTheme(
        <QuizFeedback
          correct={true}
          answer="짱구"
          userAnswer="짱구"
          onNext={vi.fn()}
          nextAriaLabel="다음 문제"
        />,
      );

      expect(screen.getByLabelText('다음 문제')).not.toBeDisabled();
    });
  });

  describe('displayName', () => {
    it('displayName 이 QuizFeedback 으로 설정되어 있다', () => {
      expect(QuizFeedback.displayName).toBe('QuizFeedback');
    });
  });
});

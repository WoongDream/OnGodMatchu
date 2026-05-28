import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import QuizCreateStepper from './QuizCreateStepper';

describe('QuizCreateStepper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더', () => {
    it('nav 에 aria-label "퀴즈 만들기 진행" 이 설정된다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="info" />);
      expect(screen.getByRole('navigation', { name: '퀴즈 만들기 진행' })).toBeInTheDocument();
    });

    it('두 단계 라벨 (퀴즈 정보, 문제 목록) 이 모두 노출된다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="info" />);
      expect(screen.getByText('퀴즈 정보')).toBeInTheDocument();
      expect(screen.getByText('문제 목록')).toBeInTheDocument();
    });
  });

  describe('currentStep="info"', () => {
    it('info step 이 aria-current="step" 으로 표시된다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="info" />);
      const infoButton = screen.getByRole('button', { name: /퀴즈 정보/ });
      expect(infoButton).toHaveAttribute('aria-current', 'step');
    });

    it('questions step 은 aria-current 가 없다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="info" />);
      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).not.toHaveAttribute('aria-current');
    });

    it('info step circle 에 숫자 1 이 노출된다 (CheckIcon 아님)', () => {
      const { container } = renderWithTheme(<QuizCreateStepper currentStep="info" />);
      // current 일 때는 step.order 가 노출 — info=1
      const infoButton = screen.getByRole('button', { name: /퀴즈 정보/ });
      expect(infoButton).toHaveTextContent('1');
      // current 상태는 CheckIcon 을 노출하지 않는다
      expect(container.querySelector('svg')).toBeNull();
    });

    it('questions step circle 에 숫자 2 가 노출된다 (todo)', () => {
      renderWithTheme(<QuizCreateStepper currentStep="info" />);
      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).toHaveTextContent('2');
    });

    it('questions (todo) step 은 항상 disabled 이다', () => {
      const onStepClick = vi.fn();
      renderWithTheme(<QuizCreateStepper currentStep="info" onStepClick={onStepClick} />);
      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).toBeDisabled();
    });
  });

  describe('currentStep="questions"', () => {
    it('questions step 이 aria-current="step" 으로 표시된다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="questions" />);
      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).toHaveAttribute('aria-current', 'step');
    });

    it('info step 은 done 상태로 CheckIcon SVG 가 노출된다', () => {
      const { container } = renderWithTheme(<QuizCreateStepper currentStep="questions" />);
      const infoButton = screen.getByRole('button', { name: /퀴즈 정보/ });
      // CheckIcon (svg) 가 info 버튼 내부에 존재
      expect(infoButton.querySelector('svg')).not.toBeNull();
      // 전체적으로도 svg 가 1개 (CheckIcon) 존재
      expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
    });

    it('onStepClick 이 미지정이면 done step (info) 버튼이 disabled 이다', () => {
      renderWithTheme(<QuizCreateStepper currentStep="questions" />);
      const infoButton = screen.getByRole('button', { name: /퀴즈 정보/ });
      expect(infoButton).toBeDisabled();
    });

    it('onStepClick 이 지정되면 done step (info) 버튼이 enabled 이고 클릭 시 콜백이 호출된다', async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();
      renderWithTheme(<QuizCreateStepper currentStep="questions" onStepClick={onStepClick} />);

      const infoButton = screen.getByRole('button', { name: /퀴즈 정보/ });
      expect(infoButton).not.toBeDisabled();

      await user.click(infoButton);
      expect(onStepClick).toHaveBeenCalledTimes(1);
      expect(onStepClick).toHaveBeenCalledWith('info');
    });

    it('현재 step (questions) 은 onStepClick 이 있어도 disabled 이다 (current 는 done 이 아님)', () => {
      const onStepClick = vi.fn();
      renderWithTheme(<QuizCreateStepper currentStep="questions" onStepClick={onStepClick} />);
      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).toBeDisabled();
    });
  });

  describe('todo step 클릭 무효', () => {
    it('currentStep="info" 일 때 questions (todo) 는 onStepClick 이 있어도 disabled 이다', async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();
      renderWithTheme(<QuizCreateStepper currentStep="info" onStepClick={onStepClick} />);

      const questionsButton = screen.getByRole('button', { name: /문제 목록/ });
      expect(questionsButton).toBeDisabled();
      // disabled 버튼 클릭은 무시된다
      await user.click(questionsButton);
      expect(onStepClick).not.toHaveBeenCalled();
    });
  });

  describe('memo / displayName', () => {
    it('displayName 이 QuizCreateStepper 이다', () => {
      expect(QuizCreateStepper.displayName).toBe('QuizCreateStepper');
    });
  });
});

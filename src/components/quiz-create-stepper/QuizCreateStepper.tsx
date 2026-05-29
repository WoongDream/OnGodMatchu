import { memo, Fragment } from 'react';
import { CheckIcon } from '@/components/icon';
import {
  QUIZ_CREATE_STEPS,
  type QuizCreateStepKey,
  type QuizCreateStepperProps,
} from './QuizCreateStepper.type';
import {
  wrapperStyle,
  stepButtonStyle,
  stepCircleStyle,
  stepLabelStyle,
  connectorStyle,
} from './QuizCreateStepper.style';

const resolveState = (
  currentStep: QuizCreateStepKey,
  stepKey: QuizCreateStepKey,
): 'current' | 'done' | 'todo' => {
  if (currentStep === stepKey) {
    return 'current';
  }
  const currentOrder = QUIZ_CREATE_STEPS.find((s) => s.key === currentStep)?.order ?? 1;
  const stepOrder = QUIZ_CREATE_STEPS.find((s) => s.key === stepKey)?.order ?? 1;
  return stepOrder < currentOrder ? 'done' : 'todo';
};

const QuizCreateStepper = memo(({ currentStep, onStepClick }: QuizCreateStepperProps) => {
  return (
    <nav css={wrapperStyle} aria-label="퀴즈 만들기 진행">
      {QUIZ_CREATE_STEPS.map((step, idx) => {
        const state = resolveState(currentStep, step.key);
        const interactive = !!onStepClick && state === 'done';
        return (
          <Fragment key={step.key}>
            <button
              type="button"
              css={stepButtonStyle}
              onClick={interactive ? () => onStepClick?.(step.key) : undefined}
              disabled={!interactive}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span css={stepCircleStyle(state)} aria-hidden="true">
                {state === 'done' ? <CheckIcon size={14} /> : step.order}
              </span>
              <span css={stepLabelStyle(state)}>{step.label}</span>
            </button>
            {idx < QUIZ_CREATE_STEPS.length - 1 && <span css={connectorStyle} aria-hidden="true" />}
          </Fragment>
        );
      })}
    </nav>
  );
});

QuizCreateStepper.displayName = 'QuizCreateStepper';
export default QuizCreateStepper;

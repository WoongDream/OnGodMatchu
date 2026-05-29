export type QuizCreateStepKey = 'info' | 'questions';

export type QuizCreateStepperProps = {
  currentStep: QuizCreateStepKey;
  onStepClick?: (step: QuizCreateStepKey) => void;
};

export type StepDef = {
  key: QuizCreateStepKey;
  order: number;
  label: string;
};

export const QUIZ_CREATE_STEPS: StepDef[] = [
  { key: 'info', order: 1, label: '퀴즈 정보' },
  { key: 'questions', order: 2, label: '문제 목록' },
];

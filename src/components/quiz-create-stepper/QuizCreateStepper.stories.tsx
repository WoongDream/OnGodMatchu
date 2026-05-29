import type { Meta, StoryObj } from '@storybook/react-vite';
import QuizCreateStepper from './QuizCreateStepper';

const meta: Meta<typeof QuizCreateStepper> = {
  title: 'Components/QuizCreateStepper',
  component: QuizCreateStepper,
};
export default meta;

type Story = StoryObj<typeof QuizCreateStepper>;

export const StepInfo: Story = {
  args: { currentStep: 'info' },
};

export const StepQuestions: Story = {
  args: { currentStep: 'questions' },
};

export const ClickableBack: Story = {
  args: {
    currentStep: 'questions',
    onStepClick: (step) => alert(`step click: ${step}`),
  },
};

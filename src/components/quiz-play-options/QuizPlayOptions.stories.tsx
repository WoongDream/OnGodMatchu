import type { Meta, StoryObj } from '@storybook/react-vite';
import QuizPlayOptions from './QuizPlayOptions';

const meta: Meta<typeof QuizPlayOptions> = {
  title: 'Components/QuizPlayOptions',
  component: QuizPlayOptions,
  args: { onStart: () => {} },
};

export default meta;

type Story = StoryObj<typeof QuizPlayOptions>;

export const Large: Story = { args: { questionCount: 218 } };
export const TwentyAvailable: Story = { args: { questionCount: 20 } };
export const TenOnly: Story = { args: { questionCount: 10 } };

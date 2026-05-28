import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import LoginPromptModal from './LoginPromptModal';

const meta: Meta<typeof LoginPromptModal> = {
  title: 'Components/LoginPromptModal',
  component: LoginPromptModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: { isOpen: true, onClose: () => {} },
};

export default meta;

type Story = StoryObj<typeof LoginPromptModal>;

export const Default: Story = {};
export const StarPrompt: Story = {
  args: {
    title: '로그인이 필요해요',
    message: '로그인하고 스타를 눌러 좋아하는 퀴즈를 모아보세요.',
  },
};

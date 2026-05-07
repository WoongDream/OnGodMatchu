import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';

const meta: Meta<typeof ProfileSidebar> = {
  title: 'Components/ProfileSidebar',
  component: ProfileSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/profile']}>
        <div style={{ width: 240 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProfileSidebar>;

export const MyProfile: Story = {
  args: {
    isMe: true,
    stats: { playCount: 348, correctRate: 64, createdQuizCount: 12 },
  },
};

export const OtherProfile: Story = {
  args: {
    isMe: false,
    userId: 42,
    stats: { playCount: 100, correctRate: 70, createdQuizCount: 5 },
  },
};

export const NoStats: Story = {
  args: {
    isMe: true,
  },
};

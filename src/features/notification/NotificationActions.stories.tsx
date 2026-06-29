import type { Meta, StoryObj } from '@storybook/react-vite';
import NotificationActions from './NotificationActions';

const meta: Meta<typeof NotificationActions> = {
  title: 'Features/Notification/NotificationActions',
  component: NotificationActions,
  tags: ['autodocs'],
  args: {
    onConfirm: () => {},
    onInquiry: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: '22rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NotificationActions>;

/** INFO(안내) — [확인]만. */
export const Info: Story = {
  args: { type: 'INFO' },
};

/** WARNING(경고) — [확인][문의하기]. */
export const Warning: Story = {
  args: { type: 'WARNING' },
};

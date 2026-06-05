import type { Meta, StoryObj } from '@storybook/react-vite';
import InquiryStatusBadge from './InquiryStatusBadge';

const meta: Meta<typeof InquiryStatusBadge> = {
  title: 'components/InquiryStatusBadge',
  component: InquiryStatusBadge,
};
export default meta;

type Story = StoryObj<typeof InquiryStatusBadge>;

export const Pending: Story = { args: { status: 'PENDING' } };
export const InProgress: Story = { args: { status: 'IN_PROGRESS' } };
export const Done: Story = { args: { status: 'DONE' } };

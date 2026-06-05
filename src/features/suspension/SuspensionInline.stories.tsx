import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import SuspensionInline from './SuspensionInline';

const meta: Meta<typeof SuspensionInline> = {
  title: 'Features/Suspension/SuspensionInline',
  component: SuspensionInline,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SuspensionInline>;

export const WithUntil: Story = {
  args: { until: '2026-12-31' },
};

export const WithoutUntil: Story = {
  args: { until: null },
};

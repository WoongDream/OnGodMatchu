import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'components/AdminSidebar',
  component: AdminSidebar,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/admin/notices']}>
        <div style={{ width: '16rem' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof AdminSidebar>;

export const Default: Story = {};

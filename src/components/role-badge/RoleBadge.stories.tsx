import type { Meta, StoryObj } from '@storybook/react-vite';
import RoleBadge from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Components/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'select', options: ['OWNER', 'ADMIN', 'USER'] },
  },
};

export default meta;

type Story = StoryObj<typeof RoleBadge>;

export const Owner: Story = {
  args: { role: 'OWNER' },
};

export const Admin: Story = {
  args: { role: 'ADMIN' },
};

/** USER/미지정은 렌더되지 않는다 (null). */
export const User: Story = {
  args: { role: 'USER' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <RoleBadge role="OWNER" />
      <RoleBadge role="ADMIN" />
      <RoleBadge role="USER" />
    </div>
  ),
};

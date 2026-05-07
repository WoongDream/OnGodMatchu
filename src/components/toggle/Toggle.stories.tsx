import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Toggle from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Toggle>;

const Interactive = ({
  initial = false,
  disabled = false,
}: {
  initial?: boolean;
  disabled?: boolean;
}) => {
  const [checked, setChecked] = useState(initial);
  return (
    <Toggle checked={checked} onChange={setChecked} disabled={disabled} ariaLabel="공개 설정" />
  );
};

export const Off: Story = {
  render: () => <Interactive initial={false} />,
};

export const On: Story = {
  render: () => <Interactive initial={true} />,
};

export const Disabled: Story = {
  render: () => <Interactive initial={true} disabled />,
};

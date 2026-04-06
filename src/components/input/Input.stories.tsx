import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password'],
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <Input {...args} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: '입력하세요',
  },
};

export const WithLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <Input {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '이메일',
    placeholder: 'example@email.com',
    type: 'email',
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <Input {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '이메일',
    placeholder: 'example@email.com',
    error: '올바른 이메일 형식이 아닙니다.',
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <Input {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '이메일',
    placeholder: '입력 불가',
    disabled: true,
  },
};

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PasswordInput from './PasswordInput';
import type { PasswordRuleStatus } from './PasswordInput.type';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    showStrengthMeter: { control: 'boolean' },
    showChecklist: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

const PENDING_RULE: PasswordRuleStatus = { lengthOk: false, notBreached: null };
const PASS_RULE: PasswordRuleStatus = { lengthOk: true, notBreached: null };
const BREACH_RULE: PasswordRuleStatus = { lengthOk: true, notBreached: false };

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: { label: '비밀번호', placeholder: '비밀번호 입력', ruleStatus: PENDING_RULE },
};

export const TypingWeak: Story = {
  render: (args) => {
    const [value, setValue] = useState('password');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: { label: '비밀번호', placeholder: '비밀번호 입력', ruleStatus: PENDING_RULE },
};

export const TypingFair: Story = {
  render: (args) => {
    const [value, setValue] = useState('Password1234');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: { label: '비밀번호', placeholder: '비밀번호 입력', ruleStatus: PASS_RULE },
};

export const TypingStrong: Story = {
  render: (args) => {
    const [value, setValue] = useState('내고양이는오늘도잠만잔다');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: { label: '비밀번호', placeholder: '비밀번호 입력', ruleStatus: PASS_RULE },
};

export const Revealed: Story = {
  render: (args) => {
    const [value, setValue] = useState('내고양이는오늘도잠만잔다');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호 (토글 클릭하여 평문 확인)',
    placeholder: '비밀번호 입력',
    ruleStatus: PASS_RULE,
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState('abc');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호 입력',
    error: '비밀번호가 정책에 맞지 않습니다.',
    ruleStatus: PENDING_RULE,
  },
};

export const BreachDetected: Story = {
  render: (args) => {
    const [value, setValue] = useState('qwerty12345');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호 입력',
    error: '이 비밀번호는 외부 유출 이력이 있어요. 다른 비밀번호를 사용해주세요.',
    ruleStatus: BREACH_RULE,
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState('내고양이는오늘도잠만잔다');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호 입력',
    disabled: true,
    ruleStatus: { lengthOk: true, notBreached: null },
  },
};

export const WithoutChecklist: Story = {
  render: (args) => {
    const [value, setValue] = useState('Password1234');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호 입력',
    showChecklist: false,
    ruleStatus: PENDING_RULE,
  },
};

export const WithoutMeter: Story = {
  render: (args) => {
    const [value, setValue] = useState('Password1234');
    return <PasswordInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: '비밀번호',
    placeholder: '비밀번호 입력',
    showStrengthMeter: false,
    ruleStatus: PENDING_RULE,
  },
};

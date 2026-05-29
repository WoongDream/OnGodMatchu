import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import ToastContainer from './ToastContainer';
import useToastStore from './toastStore';
import type { ToastVariant } from './Toast.type';

const Demo = ({ variant }: { variant: ToastVariant }) => {
  const show = useToastStore((s) => s.show);
  useEffect(() => {
    show('링크가 복사되었어요', { variant, durationMs: 99999 });
  }, [show, variant]);
  return <ToastContainer />;
};

const meta: Meta<typeof Demo> = {
  title: 'Components/Toast',
  component: Demo,
};

export default meta;

type Story = StoryObj<typeof Demo>;
export const Success: Story = { args: { variant: 'success' } };
export const Info: Story = { args: { variant: 'info' } };
export const Error: Story = { args: { variant: 'error' } };

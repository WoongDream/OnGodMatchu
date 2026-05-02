import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import useAuthStore from '@/store/authStore';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Header>;

const AuthSetter = ({ loggedIn }: { loggedIn: boolean }) => {
  useEffect(() => {
    if (loggedIn) {
      useAuthStore.setState({
        user: { id: 1, email: 'demo@ongodmatchu.com', nickname: 'demo' } as never,
        isLoggedIn: true,
      });
    } else {
      useAuthStore.setState({ user: null, isLoggedIn: false });
    }
    return () => {
      useAuthStore.setState({ user: null, isLoggedIn: false });
    };
  }, [loggedIn]);
  return <Header />;
};

export const LoggedOut: Story = {
  render: () => <AuthSetter loggedIn={false} />,
};

export const LoggedIn: Story = {
  render: () => <AuthSetter loggedIn={true} />,
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import ProfileImage from './ProfileImage';

const meta: Meta<typeof ProfileImage> = {
  title: 'Components/ProfileImage',
  component: ProfileImage,
  tags: ['autodocs'],
  argTypes: {
    nickname: { control: 'text' },
    imageUrl: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;

type Story = StoryObj<typeof ProfileImage>;

export const InitialKorean: Story = {
  args: {
    nickname: '우진',
    size: 'lg',
  },
};

export const InitialEnglish: Story = {
  args: {
    nickname: 'Woong',
    size: 'lg',
  },
};

export const InitialNumber: Story = {
  args: {
    nickname: '404',
    size: 'lg',
  },
};

export const WithImage: Story = {
  args: {
    nickname: '우진',
    imageUrl: 'https://i.pravatar.cc/150?img=12',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <ProfileImage nickname="우진" size="sm" />
      <ProfileImage nickname="우진" size="md" />
      <ProfileImage nickname="우진" size="lg" />
      <ProfileImage nickname="우진" size="xl" />
    </div>
  ),
};

export const PaletteVariety: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {['우진', 'Alice', 'Bob', '민지', '재훈', '404', 'cat', '데이터'].map((n) => (
        <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ProfileImage nickname={n} size="lg" />
          <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ImageUpload from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Components/ImageUpload',
  component: ImageUpload,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ImageUpload>;

export const Default: Story = {
  render: () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
      <div style={{ maxWidth: '480px' }}>
        <ImageUpload
          previewUrl={previewUrl}
          onChange={(_, url) => setPreviewUrl(url)}
          onRemove={() => setPreviewUrl(null)}
          label="이미지 업로드"
        />
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  render: () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
      <div style={{ maxWidth: '480px' }}>
        <ImageUpload
          previewUrl={previewUrl}
          onChange={(_, url) => setPreviewUrl(url)}
          onRemove={() => setPreviewUrl(null)}
        />
      </div>
    );
  },
};

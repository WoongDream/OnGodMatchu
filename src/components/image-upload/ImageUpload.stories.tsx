import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EMPTY_SLOT, applyEditResult, type ImageSlot } from '@/lib/image/imageSlot';
import type { ImageEditResult } from '@/components/image-edit-modal';
import ImageUpload from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Components/ImageUpload',
  component: ImageUpload,
  tags: ['autodocs'],
  args: {
    slot: EMPTY_SLOT,
    aspect: 16 / 9,
    onApply: () => {},
    onRemove: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof ImageUpload>;

const SAMPLE_PREVIEW =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const Default: Story = {
  args: {
    label: '이미지 업로드',
  },
  render: (args) => {
    const [slot, setSlot] = useState<ImageSlot>(EMPTY_SLOT);

    return (
      <div style={{ maxWidth: '480px' }}>
        <ImageUpload
          {...args}
          slot={slot}
          onApply={(result: ImageEditResult) => setSlot((prev) => applyEditResult(prev, result))}
          onRemove={() => setSlot(EMPTY_SLOT)}
        />
      </div>
    );
  },
};

export const WithoutLabel: Story = {
  render: (args) => {
    const [slot, setSlot] = useState<ImageSlot>(EMPTY_SLOT);

    return (
      <div style={{ maxWidth: '480px' }}>
        <ImageUpload
          {...args}
          slot={slot}
          onApply={(result: ImageEditResult) => setSlot((prev) => applyEditResult(prev, result))}
          onRemove={() => setSlot(EMPTY_SLOT)}
        />
      </div>
    );
  },
};

export const WithImage: Story = {
  args: {
    label: '이미지 업로드',
    slot: { ...EMPTY_SLOT, previewUrl: SAMPLE_PREVIEW },
  },
  render: (args) => (
    <div style={{ maxWidth: '480px' }}>
      <ImageUpload {...args} />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    label: '이미지 업로드',
    invalid: true,
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import ImageEditModal from './ImageEditModal';

// 자기완결 SVG data URL (same-origin → canvas 비오염). naturalWidth/Height 명시.
const sampleSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fcd34d"/><stop offset="0.5" stop-color="#c4b5fd"/>
      <stop offset="1" stop-color="#93c5fd"/></linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <text x="400" y="310" font-size="48" text-anchor="middle" fill="#1f2937">800 × 600</text>
  </svg>`,
)}`;

const meta: Meta<typeof ImageEditModal> = {
  title: 'Components/ImageEditModal',
  component: ImageEditModal,
  args: {
    isOpen: true,
    src: sampleSrc,
    aspect: 16 / 9,
    fileName: 'my-photo.svg',
    onCancel: () => {},
    onApply: (result) => console.log('apply', result),
    onDelete: () => console.log('delete'),
  },
};

export default meta;

type Story = StoryObj<typeof ImageEditModal>;

/** 썸네일·문제·정답 이미지 — 16:9 잠금. */
export const Thumbnail: Story = {};

/** 프로필 이미지 — 1:1 잠금. */
export const Profile: Story = {
  args: { aspect: 1, fileName: 'avatar.svg' },
};

/** 재편집 — 기존 변환 복원 + 「이미지 삭제」 노출 (canDelete). */
export const ReEdit: Story = {
  args: {
    canDelete: true,
    initialTransform: {
      v: 1,
      flipH: true,
      rotate: 90,
      crop: { x: 0.1, y: 0.1, width: 0.6, height: 0.3375 },
    },
  },
};

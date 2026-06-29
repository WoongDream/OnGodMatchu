import { memo } from 'react';
import type { NoticeStatus } from '@/types';
import { wrapperStyle, dotStyle, type NoticeTone } from './NoticeStatusBadge.style';

export type NoticeStatusBadgeProps = {
  status: NoticeStatus;
  pinned?: boolean;
};

/** 고정(게시+pinned) / 게시 / 임시저장 3종 상태 배지. BO 리스트·상세 공용. */
const resolve = (status: NoticeStatus, pinned: boolean): { tone: NoticeTone; label: string } => {
  if (status === 'PUBLISHED' && pinned) {
    return { tone: 'pinned', label: '고정' };
  }
  if (status === 'PUBLISHED') {
    return { tone: 'published', label: '게시' };
  }
  return { tone: 'draft', label: '임시저장' };
};

const NoticeStatusBadge = memo(({ status, pinned = false }: NoticeStatusBadgeProps) => {
  const { tone, label } = resolve(status, pinned);
  return (
    <span css={wrapperStyle}>
      <span css={dotStyle(tone)} aria-hidden="true" />
      {label}
    </span>
  );
});

NoticeStatusBadge.displayName = 'NoticeStatusBadge';
export default NoticeStatusBadge;

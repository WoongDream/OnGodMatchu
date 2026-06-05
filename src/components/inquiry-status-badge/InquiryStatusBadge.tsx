import { memo } from 'react';
import type { InquiryStatus } from '@/types';
import { wrapperStyle, dotStyle } from './InquiryStatusBadge.style';

export type InquiryStatusBadgeProps = {
  status: InquiryStatus;
};

const LABELS: Record<InquiryStatus, string> = {
  PENDING: '대기',
  IN_PROGRESS: '처리중',
  DONE: '완료',
};

/** 문의 처리 상태 배지 — 대기(노랑)/처리중(파랑)/완료(초록). 사용자 카드·BO 리스트/상세 공용. */
const InquiryStatusBadge = memo(({ status }: InquiryStatusBadgeProps) => (
  <span css={wrapperStyle}>
    <span css={dotStyle(status)} aria-hidden="true" />
    {LABELS[status]}
  </span>
));

InquiryStatusBadge.displayName = 'InquiryStatusBadge';
export default InquiryStatusBadge;

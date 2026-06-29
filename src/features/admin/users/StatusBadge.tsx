import { memo } from 'react';
import type { UserStatus } from '@/types';
import { dotStyle, labelStyle, wrapperStyle } from './StatusBadge.style';

type Props = { status: UserStatus };

const LABEL: Record<UserStatus, string> = {
  ACTIVE: '정상',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
};

/** 상태 표시 — 색 점 + 라벨 (정상/정지/탈퇴). */
const StatusBadge = memo(({ status }: Props) => (
  <span css={wrapperStyle}>
    <span css={(theme) => dotStyle(theme, status)} aria-hidden="true" />
    <span css={(theme) => labelStyle(theme, status)}>{LABEL[status]}</span>
  </span>
));

StatusBadge.displayName = 'StatusBadge';
export default StatusBadge;

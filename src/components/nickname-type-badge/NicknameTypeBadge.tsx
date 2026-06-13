import { memo } from 'react';
import type { NicknameRuleType } from '@/types';
import { wrapperStyle, dotStyle, type NicknameTone } from './NicknameTypeBadge.style';

export type NicknameTypeBadgeProps = {
  type: NicknameRuleType;
};

/** 예약(파랑) / 금지(빨강) 2종 유형 배지. BO 리스트·수정 공용. */
const resolve = (type: NicknameRuleType): { tone: NicknameTone; label: string } =>
  type === 'FORBIDDEN' ? { tone: 'forbidden', label: '금지' } : { tone: 'reserved', label: '예약' };

const NicknameTypeBadge = memo(({ type }: NicknameTypeBadgeProps) => {
  const { tone, label } = resolve(type);
  return (
    <span css={wrapperStyle}>
      <span css={dotStyle(tone)} aria-hidden="true" />
      {label}
    </span>
  );
});

NicknameTypeBadge.displayName = 'NicknameTypeBadge';
export default NicknameTypeBadge;

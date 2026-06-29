import { memo } from 'react';
import { badgeStyle } from './SuspensionBadge.style';

type Props = { until?: string | null };

/** 정지 상태 표시 pill — "정지됨 · ~YYYY-MM-DD까지". */
const SuspensionBadge = memo(({ until }: Props) => (
  <span css={badgeStyle}>정지됨{until ? ` · ~${until.slice(0, 10)}까지` : ''}</span>
));

SuspensionBadge.displayName = 'SuspensionBadge';
export default SuspensionBadge;

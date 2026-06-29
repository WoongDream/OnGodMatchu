import { memo } from 'react';
import SuspensionBadge from './SuspensionBadge';
import { noticeStyle, noticeTextStyle } from './SuspensionNotice.style';

type Props = { until?: string | null; message?: string };

/** 정지 안내 배너 — 기능이 비활성화된 화면 상단에 노출. */
const SuspensionNotice = memo(({ until, message }: Props) => (
  <div css={noticeStyle} role="alert">
    <SuspensionBadge until={until} />
    <p css={noticeTextStyle}>{message ?? '정지된 계정은 이 기능을 사용할 수 없어요.'}</p>
  </div>
));

SuspensionNotice.displayName = 'SuspensionNotice';
export default SuspensionNotice;

import { memo } from 'react';
import { Link } from 'react-router-dom';
import SuspensionBadge from './SuspensionBadge';
import { inlineStyle, inquiryLinkStyle } from './SuspensionInline.style';

type Props = { until?: string | null };

/** 정지 배지 + 문의하기 버튼. 제목 옆에 함께 노출. */
const SuspensionInline = memo(({ until }: Props) => (
  <span css={inlineStyle}>
    <SuspensionBadge until={until} />
    <Link to="/inquiry" css={inquiryLinkStyle}>
      문의하기
    </Link>
  </span>
));

SuspensionInline.displayName = 'SuspensionInline';
export default SuspensionInline;

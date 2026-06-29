import { memo } from 'react';
import { CrownIcon } from '@/components/icon';
import type { RoleBadgeProps } from './RoleBadge.type';
import { badgeStyle, LABEL } from './RoleBadge.style';

/**
 * 프로필/프로필 모달 닉네임 위에 노출하는 역할 배지. OWNER(보라)/ADMIN(파랑) 만 렌더하고,
 * USER 또는 미지정이면 null. admin 관리 테이블의 RoleBadge(USER 포함·텍스트만)와 용도가 달라 별개 컴포넌트.
 */
const RoleBadge = memo(({ role }: RoleBadgeProps) => {
  if (role !== 'OWNER' && role !== 'ADMIN') {
    return null;
  }
  return (
    <span css={(theme) => badgeStyle(theme, role)}>
      <CrownIcon size={12} aria-hidden />
      {LABEL[role]}
    </span>
  );
});

RoleBadge.displayName = 'RoleBadge';
export default RoleBadge;

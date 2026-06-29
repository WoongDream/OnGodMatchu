import { memo } from 'react';
import type { Role } from '@/types';
import { roleBadgeStyle } from './RoleBadge.style';

type Props = { role: Role };

/** 역할 pill — OWNER(보라)/ADMIN(파랑)/USER(회색). */
const RoleBadge = memo(({ role }: Props) => (
  <span css={(theme) => roleBadgeStyle(theme, role)}>{role}</span>
));

RoleBadge.displayName = 'RoleBadge';
export default RoleBadge;

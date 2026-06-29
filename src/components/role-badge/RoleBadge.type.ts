import type { Role } from '@/types';

export type RoleBadgeProps = {
  /** OWNER/ADMIN 만 배지를 렌더한다. USER 또는 미지정이면 아무것도 그리지 않음. */
  role?: Role | null;
};

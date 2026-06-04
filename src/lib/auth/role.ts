import type { Role, User } from '@/types';

/** 역할 계층 레벨 (USER < ADMIN < OWNER). */
const LEVEL: Record<Role, number> = { USER: 0, ADMIN: 1, OWNER: 2 };

type RoleLike = Pick<User, 'role'> | null | undefined;
type ManageActor = Pick<User, 'role' | 'userId'> | null | undefined;
type ManageTarget = Pick<User, 'role' | 'status' | 'userId'>;

/** 응답에 role 이 없으면 least-privilege 로 USER 취급. */
export const roleOf = (user: RoleLike): Role => user?.role ?? 'USER';

/** user 의 역할이 min 이상인가. */
export const hasRole = (user: RoleLike, min: Role): boolean => LEVEL[roleOf(user)] >= LEVEL[min];

export const isAdmin = (user: RoleLike): boolean => hasRole(user, 'ADMIN');
export const isOwner = (user: RoleLike): boolean => hasRole(user, 'OWNER');

/** 정지 상태인가 (BO/쓰기 액션 안내용). */
export const isSuspended = (user: Pick<User, 'status'> | null | undefined): boolean =>
  user?.status === 'SUSPENDED';

/**
 * 정지/해제 가능 여부 — BE `AdminAuthorization.assertCanSuspend` 미러. UI 버튼 노출/비활성 판단 전용,
 * 실제 검증은 BE 가 담당한다.
 * - 대상이 탈퇴(WITHDRAWN) 또는 OWNER 면 불가
 * - 자기 자신 불가
 * - ADMIN 은 USER 만, OWNER 는 USER/ADMIN
 */
export const canSuspendUser = (actor: ManageActor, target: ManageTarget): boolean => {
  if (target.status === 'WITHDRAWN') {
    return false;
  }
  if (roleOf(target) === 'OWNER') {
    return false;
  }
  if (actor?.userId && actor.userId === target.userId) {
    return false;
  }
  const actorRole = roleOf(actor);
  if (actorRole === 'OWNER') {
    return true;
  }
  if (actorRole === 'ADMIN') {
    return roleOf(target) === 'USER';
  }
  return false;
};

/**
 * 권한 임명/해임 가능 여부 — BE `AdminAuthorization.assertCanChangeRole` 미러(자가 사임 제외).
 * 역할 변경은 OWNER 전용. 대상이 탈퇴/OWNER 면 불가.
 */
export const canChangeRole = (actor: ManageActor, target: ManageTarget): boolean => {
  if (target.status === 'WITHDRAWN') {
    return false;
  }
  if (roleOf(target) === 'OWNER') {
    return false;
  }
  return roleOf(actor) === 'OWNER';
};

/** ADMIN 본인의 자가 사임(ADMIN→USER) 가능 여부. */
export const canSelfResign = (user: ManageActor): boolean => roleOf(user) === 'ADMIN';

import { describe, it, expect } from 'vitest';
import type { Role, User } from '@/types';
import {
  roleOf,
  hasRole,
  isAdmin,
  isOwner,
  isSuspended,
  canSuspendUser,
  canChangeRole,
  canSelfResign,
} from './role';

type Actor = Pick<User, 'role' | 'userId'>;
type Target = Pick<User, 'role' | 'status' | 'userId'>;

const actor = (role: Role | undefined, userId?: string): Actor => ({ role, userId });
const target = (
  role: Role | undefined,
  status: User['status'] = 'ACTIVE',
  userId?: string,
): Target => ({ role, status, userId });

describe('roleOf', () => {
  it('role 이 있으면 그대로 반환한다', () => {
    expect(roleOf({ role: 'ADMIN' })).toBe('ADMIN');
    expect(roleOf({ role: 'OWNER' })).toBe('OWNER');
    expect(roleOf({ role: 'USER' })).toBe('USER');
  });

  it('role 이 없으면 USER 로 간주한다 (least-privilege)', () => {
    expect(roleOf({ role: undefined })).toBe('USER');
  });

  it('null/undefined 사용자는 USER 로 간주한다', () => {
    expect(roleOf(null)).toBe('USER');
    expect(roleOf(undefined)).toBe('USER');
  });
});

describe('hasRole', () => {
  it('OWNER 는 ADMIN 이상 요구를 만족한다', () => {
    expect(hasRole({ role: 'OWNER' }, 'ADMIN')).toBe(true);
    expect(hasRole({ role: 'OWNER' }, 'OWNER')).toBe(true);
    expect(hasRole({ role: 'OWNER' }, 'USER')).toBe(true);
  });

  it('ADMIN 은 ADMIN 이하만 만족한다', () => {
    expect(hasRole({ role: 'ADMIN' }, 'USER')).toBe(true);
    expect(hasRole({ role: 'ADMIN' }, 'ADMIN')).toBe(true);
    expect(hasRole({ role: 'ADMIN' }, 'OWNER')).toBe(false);
  });

  it('USER 는 USER 만 만족한다', () => {
    expect(hasRole({ role: 'USER' }, 'USER')).toBe(true);
    expect(hasRole({ role: 'USER' }, 'ADMIN')).toBe(false);
    expect(hasRole({ role: 'USER' }, 'OWNER')).toBe(false);
  });

  it('null 사용자는 USER 로 간주되어 ADMIN 요구를 만족하지 못한다', () => {
    expect(hasRole(null, 'ADMIN')).toBe(false);
    expect(hasRole(null, 'USER')).toBe(true);
  });
});

describe('isAdmin', () => {
  it('ADMIN/OWNER 는 true', () => {
    expect(isAdmin({ role: 'ADMIN' })).toBe(true);
    expect(isAdmin({ role: 'OWNER' })).toBe(true);
  });

  it('USER 와 null 은 false', () => {
    expect(isAdmin({ role: 'USER' })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe('isOwner', () => {
  it('OWNER 만 true', () => {
    expect(isOwner({ role: 'OWNER' })).toBe(true);
    expect(isOwner({ role: 'ADMIN' })).toBe(false);
    expect(isOwner({ role: 'USER' })).toBe(false);
    expect(isOwner(null)).toBe(false);
  });
});

describe('isSuspended', () => {
  it('status 가 SUSPENDED 면 true', () => {
    expect(isSuspended({ status: 'SUSPENDED' })).toBe(true);
  });

  it('ACTIVE/WITHDRAWN 은 false', () => {
    expect(isSuspended({ status: 'ACTIVE' })).toBe(false);
    expect(isSuspended({ status: 'WITHDRAWN' })).toBe(false);
  });

  it('status 없음/null/undefined 는 false', () => {
    expect(isSuspended({ status: undefined })).toBe(false);
    expect(isSuspended(null)).toBe(false);
    expect(isSuspended(undefined)).toBe(false);
  });
});

describe('canSuspendUser', () => {
  it('대상이 탈퇴(WITHDRAWN)면 불가', () => {
    expect(canSuspendUser(actor('OWNER'), target('USER', 'WITHDRAWN'))).toBe(false);
  });

  it('대상이 OWNER 면 불가', () => {
    expect(canSuspendUser(actor('OWNER'), target('OWNER'))).toBe(false);
  });

  it('자기 자신은 불가', () => {
    expect(canSuspendUser(actor('OWNER', 'u1'), target('ADMIN', 'ACTIVE', 'u1'))).toBe(false);
  });

  it('OWNER 는 USER 를 정지할 수 있다', () => {
    expect(canSuspendUser(actor('OWNER'), target('USER'))).toBe(true);
  });

  it('OWNER 는 ADMIN 을 정지할 수 있다', () => {
    expect(canSuspendUser(actor('OWNER'), target('ADMIN'))).toBe(true);
  });

  it('ADMIN 은 USER 만 정지할 수 있다', () => {
    expect(canSuspendUser(actor('ADMIN'), target('USER'))).toBe(true);
  });

  it('ADMIN 은 다른 ADMIN 을 정지할 수 없다', () => {
    expect(canSuspendUser(actor('ADMIN'), target('ADMIN'))).toBe(false);
  });

  it('USER 는 누구도 정지할 수 없다', () => {
    expect(canSuspendUser(actor('USER'), target('USER'))).toBe(false);
  });

  it('actor 가 null 이면 불가', () => {
    expect(canSuspendUser(null, target('USER'))).toBe(false);
  });

  it('userId 가 둘 다 없으면 자기자신 체크를 건너뛴다', () => {
    expect(canSuspendUser(actor('OWNER'), target('USER'))).toBe(true);
  });
});

describe('canChangeRole', () => {
  it('대상이 탈퇴면 불가', () => {
    expect(canChangeRole(actor('OWNER'), target('USER', 'WITHDRAWN'))).toBe(false);
  });

  it('대상이 OWNER 면 불가', () => {
    expect(canChangeRole(actor('OWNER'), target('OWNER'))).toBe(false);
  });

  it('OWNER 는 USER/ADMIN 의 역할을 변경할 수 있다', () => {
    expect(canChangeRole(actor('OWNER'), target('USER'))).toBe(true);
    expect(canChangeRole(actor('OWNER'), target('ADMIN'))).toBe(true);
  });

  it('ADMIN 은 역할을 변경할 수 없다', () => {
    expect(canChangeRole(actor('ADMIN'), target('USER'))).toBe(false);
  });

  it('USER 는 역할을 변경할 수 없다', () => {
    expect(canChangeRole(actor('USER'), target('USER'))).toBe(false);
  });

  it('actor 가 null 이면 불가', () => {
    expect(canChangeRole(null, target('USER'))).toBe(false);
  });
});

describe('canSelfResign', () => {
  it('ADMIN 본인만 자가 사임 가능', () => {
    expect(canSelfResign(actor('ADMIN'))).toBe(true);
  });

  it('OWNER/USER 는 자가 사임 불가', () => {
    expect(canSelfResign(actor('OWNER'))).toBe(false);
    expect(canSelfResign(actor('USER'))).toBe(false);
  });

  it('null/undefined 는 USER 로 간주되어 불가', () => {
    expect(canSelfResign(null)).toBe(false);
    expect(canSelfResign(undefined)).toBe(false);
  });
});

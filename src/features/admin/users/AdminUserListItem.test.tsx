import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import type { AdminUser } from '@/api/admin';
import AdminUserListItem from './AdminUserListItem';

const createUser = (overrides?: Partial<AdminUser>): AdminUser => ({
  userId: 'u-1',
  nickname: '홍길동',
  email: 'gildong@example.com',
  profileImageUrl: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'kakao',
  createdAt: '2024-03-15T08:30:00Z',
  withdrawnAt: null,
  ...overrides,
});

describe('AdminUserListItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더', () => {
    it('닉네임이 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem user={createUser()} onSelect={vi.fn()} onNotify={vi.fn()} />,
      );
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('role(RoleBadge) 이 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ role: 'ADMIN' })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('status(StatusBadge) 라벨이 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ status: 'SUSPENDED' })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByText('정지')).toBeInTheDocument();
    });

    it('가입일이 YYYY-MM-DD 로 잘려서 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ createdAt: '2024-03-15T08:30:00Z' })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByText('2024-03-15')).toBeInTheDocument();
    });

    it('imageUrl 이 없으면 ProfileImage fallback(role="img") 이 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ profileImageUrl: null })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByRole('img', { name: '홍길동 프로필 이미지' })).toBeInTheDocument();
    });

    it('imageUrl 이 있으면 img 요소가 src 로 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ profileImageUrl: 'https://example.com/a.png' })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/a.png');
    });

    it('「알림 보내기」 버튼이 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem user={createUser()} onSelect={vi.fn()} onNotify={vi.fn()} />,
      );
      expect(screen.getByRole('button', { name: '알림 보내기' })).toBeInTheDocument();
    });
  });

  describe('콜백', () => {
    it('행 클릭 시 onSelect(userId) 가 호출된다', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ userId: 'u-42' })}
          onSelect={onSelect}
          onNotify={vi.fn()}
        />,
      );
      await user.click(screen.getByRole('button', { name: /홍길동/ }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('u-42');
    });

    it('Enter 키로 행을 활성화하면 onSelect 가 호출된다', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ userId: 'u-7' })}
          onSelect={onSelect}
          onNotify={vi.fn()}
        />,
      );
      screen.getByRole('button', { name: /홍길동/ }).focus();
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith('u-7');
    });

    it('알림 버튼 클릭 시 onNotify(user) 가 호출되고 onSelect 는 호출되지 않는다 (stopPropagation)', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onNotify = vi.fn();
      const target = createUser({ userId: 'u-9' });
      renderWithTheme(<AdminUserListItem user={target} onSelect={onSelect} onNotify={onNotify} />);
      await user.click(screen.getByRole('button', { name: '알림 보내기' }));
      expect(onNotify).toHaveBeenCalledTimes(1);
      expect(onNotify).toHaveBeenCalledWith(target);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('탈퇴 유저', () => {
    it('status 가 WITHDRAWN 이면 「알림 보내기」 버튼이 렌더되지 않는다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({ status: 'WITHDRAWN', withdrawnAt: '2024-04-01T00:00:00Z' })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.queryByText('알림 보내기')).toBeNull();
    });

    it('WITHDRAWN 유저는 원본 닉네임 대신 "탈퇴한 유저 정보 삭제됨" 이 표시된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({
            nickname: 'deleted_8f3a1c',
            status: 'WITHDRAWN',
            withdrawnAt: '2024-04-01T00:00:00Z',
          })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      expect(screen.getByText('탈퇴한 유저 정보 삭제됨')).toBeInTheDocument();
      expect(screen.queryByText('deleted_8f3a1c')).toBeNull();
    });

    it('WITHDRAWN 유저는 imageUrl 이 있어도 "탈" 이니셜 fallback 아바타가 렌더된다', () => {
      renderWithTheme(
        <AdminUserListItem
          user={createUser({
            nickname: 'deleted_8f3a1c',
            profileImageUrl: 'https://example.com/a.png',
            status: 'WITHDRAWN',
            withdrawnAt: '2024-04-01T00:00:00Z',
          })}
          onSelect={vi.fn()}
          onNotify={vi.fn()}
        />,
      );
      const avatar = screen.getByRole('img', { name: '탈퇴한 사용자 프로필 이미지' });
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('탈');
    });

    it('WITHDRAWN 유저도 행 클릭 시 onSelect(userId) 가 호출된다', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderWithTheme(
        <AdminUserListItem
          user={createUser({
            userId: 'u-99',
            nickname: 'deleted_8f3a1c',
            status: 'WITHDRAWN',
            withdrawnAt: '2024-04-01T00:00:00Z',
          })}
          onSelect={onSelect}
          onNotify={vi.fn()}
        />,
      );
      await user.click(screen.getByRole('button', { name: /탈퇴한 유저 정보 삭제됨/ }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('u-99');
    });
  });

  describe('displayName', () => {
    it('displayName 이 "AdminUserListItem" 이다', () => {
      expect(AdminUserListItem.displayName).toBe('AdminUserListItem');
    });
  });
});

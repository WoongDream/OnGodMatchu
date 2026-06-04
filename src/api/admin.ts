import instance from './instance';
import type {
  Role,
  UserStatus,
  BoNotice,
  BoNoticeListItem,
  NoticeFilter,
  NoticeStats,
  NoticeStatus,
} from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type AdminUser = {
  userId: string;
  nickname: string;
  email: string;
  role: Role;
  status: UserStatus;
  suspendedUntil: string | null;
  provider: string;
  createdAt: string;
};

export type AdminUserQuery = {
  status?: UserStatus;
  role?: Role;
  query?: string;
  page?: number;
  size?: number;
};

export const getAdminUsers = async (q?: AdminUserQuery): Promise<Page<AdminUser>> => {
  const res = await instance.get<ApiResponse<Page<AdminUser>>>('/api/admin/users', { params: q });
  return res.data.data;
};

export const suspendUser = async (publicId: string, days: number): Promise<AdminUser> => {
  const res = await instance.post<ApiResponse<AdminUser>>(`/api/admin/users/${publicId}/suspend`, {
    days,
  });
  return res.data.data;
};

export const unsuspendUser = async (publicId: string): Promise<AdminUser> => {
  const res = await instance.post<ApiResponse<AdminUser>>(`/api/admin/users/${publicId}/unsuspend`);
  return res.data.data;
};

export const changeUserRole = async (publicId: string, role: Role): Promise<AdminUser> => {
  const res = await instance.patch<ApiResponse<AdminUser>>(`/api/admin/users/${publicId}/role`, {
    role,
  });
  return res.data.data;
};

// ── 공지 관리 (OWNER 전용) ────────────────────────────────────────────────

export type BoNoticeQuery = {
  filter?: NoticeFilter;
  query?: string;
  page?: number;
  size?: number;
};

export type NoticeCreatePayload = {
  title: string;
  content: string;
  status: NoticeStatus;
  pinned: boolean;
};

export type NoticeUpdatePayload = {
  title?: string;
  content?: string;
  status?: NoticeStatus;
  pinned?: boolean;
};

export const getBoNotices = async (q?: BoNoticeQuery): Promise<Page<BoNoticeListItem>> => {
  const res = await instance.get<ApiResponse<Page<BoNoticeListItem>>>('/api/admin/notices', {
    params: q,
  });
  return res.data.data;
};

export const getBoNoticeStats = async (): Promise<NoticeStats> => {
  const res = await instance.get<ApiResponse<NoticeStats>>('/api/admin/notices/stats');
  return res.data.data;
};

export const getBoNotice = async (id: number): Promise<BoNotice> => {
  const res = await instance.get<ApiResponse<BoNotice>>(`/api/admin/notices/${id}`);
  return res.data.data;
};

export const createNotice = async (payload: NoticeCreatePayload): Promise<BoNotice> => {
  const res = await instance.post<ApiResponse<BoNotice>>('/api/admin/notices', payload);
  return res.data.data;
};

export const updateNotice = async (id: number, payload: NoticeUpdatePayload): Promise<BoNotice> => {
  const res = await instance.patch<ApiResponse<BoNotice>>(`/api/admin/notices/${id}`, payload);
  return res.data.data;
};

export const deleteNotice = async (id: number): Promise<void> => {
  await instance.delete(`/api/admin/notices/${id}`);
};

export type AdminErrorCode = 'FORBIDDEN' | 'TARGET_INVALID' | 'SUSPENDED' | 'NOT_FOUND' | 'UNKNOWN';

/** BE RBAC 에러 코드 → FE 표시용 매핑. */
export const mapAdminError = (error: unknown): AdminErrorCode => {
  const err = error as { response?: { status?: number; data?: { error?: { code?: string } } } };
  const code = err.response?.data?.error?.code;
  const status = err.response?.status;
  if (code === 'ADMIN_FORBIDDEN' || status === 403) {
    return 'FORBIDDEN';
  }
  if (code === 'ADMIN_TARGET_INVALID') {
    return 'TARGET_INVALID';
  }
  if (code === 'ACCOUNT_SUSPENDED') {
    return 'SUSPENDED';
  }
  if (code === 'USER_NOT_FOUND' || status === 404) {
    return 'NOT_FOUND';
  }
  return 'UNKNOWN';
};

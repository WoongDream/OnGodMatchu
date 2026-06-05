import instance from './instance';
import type {
  Role,
  UserStatus,
  BoNotice,
  BoNoticeListItem,
  NoticeFilter,
  NoticeStats,
  NoticeStatus,
  NotificationDraft,
  UserNotification,
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
  /** 프로필 이미지 presigned URL. 목록 조회에서만 채워짐. null/미포함이면 이니셜 fallback. */
  profileImageUrl?: string | null;
  role: Role;
  status: UserStatus;
  suspendedUntil: string | null;
  provider: string;
  createdAt: string;
  /** 탈퇴 시각(ISO). 탈퇴 유저만 값, 그 외 null. */
  withdrawnAt: string | null;
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

// ── 유저 상세 / 통계 / 이력 / 알림 ─────────────────────────────────────────

export type AdminUserDetail = {
  userId: string;
  nickname: string;
  email: string;
  profileImageUrl: string;
  bio: string | null;
  role: Role;
  status: UserStatus;
  suspendedUntil: string | null;
  provider: string;
  createdAt: string;
  /** 탈퇴 시각(ISO). 탈퇴 유저만 값, 그 외 null. */
  withdrawnAt: string | null;
  /** 본인이 푼 횟수. */
  solvedCount: number;
  /** 본인 평균 정답률(0~100). 시도 0이면 null. */
  avgSolveRate: number | null;
  /** 만든 퀴즈 총 개수. */
  quizCount: number;
  totalPlayCount: number;
  totalStarCount: number;
};

export type AdminUserSummary = {
  totalUsers: number;
  ownerCount: number;
  adminCount: number;
  userCount: number;
  suspendedCount: number;
  newThisMonth: number;
};

export type MonthlyUserStat = {
  /** yyyy-MM. */
  yearMonth: string;
  cumulative: number;
  newCount: number;
  churnCount: number;
};

export type AdminUserHistory = {
  id: number;
  actorId: string;
  actorNickname: string;
  actorRole: Role;
  /** 변경 유형. 알림만 보낸 경우 null. */
  changeType: string | null;
  changeTypeLabel: string | null;
  detail: string | null;
  /** 관련 알림. 없으면 null. */
  notification: UserNotification | null;
  createdAt: string;
};

export type AdminSuspensionUpdate = {
  suspend: boolean;
  /** suspend=true 시 정지 종료일(ISO). */
  until?: string;
};

/** 유저 수정 화면 "변경사항 저장" 페이로드 — 변경 항목만 채워 보낸다. */
export type AdminUserUpdatePayload = {
  role?: Role;
  suspension?: AdminSuspensionUpdate;
  resetProfileImage?: boolean;
  resetNickname?: boolean;
  resetBio?: boolean;
  /** 함께 보낼 알림. 없으면 알림 없이 저장. */
  notification?: NotificationDraft;
};

export const getAdminUserSummary = async (): Promise<AdminUserSummary> => {
  const res = await instance.get<ApiResponse<AdminUserSummary>>('/api/admin/users/stats/summary');
  return res.data.data;
};

export const getMonthlyUserStats = async (months = 6): Promise<MonthlyUserStat[]> => {
  const res = await instance.get<ApiResponse<MonthlyUserStat[]>>('/api/admin/users/stats/monthly', {
    params: { months },
  });
  return res.data.data;
};

export const getAdminUserDetail = async (publicId: string): Promise<AdminUserDetail> => {
  const res = await instance.get<ApiResponse<AdminUserDetail>>(`/api/admin/users/${publicId}`);
  return res.data.data;
};

export const updateAdminUser = async (
  publicId: string,
  payload: AdminUserUpdatePayload,
): Promise<AdminUser> => {
  const res = await instance.patch<ApiResponse<AdminUser>>(`/api/admin/users/${publicId}`, payload);
  return res.data.data;
};

/** 변경 없이 알림만 발송 (조회 리스트 "알림 보내기"). */
export const sendUserNotification = async (
  publicId: string,
  draft: NotificationDraft,
): Promise<AdminUser> => {
  const res = await instance.post<ApiResponse<AdminUser>>(
    `/api/admin/users/${publicId}/notifications`,
    draft,
  );
  return res.data.data;
};

export const getAdminUserHistories = async (
  publicId: string,
  q?: { page?: number; size?: number },
): Promise<Page<AdminUserHistory>> => {
  const res = await instance.get<ApiResponse<Page<AdminUserHistory>>>(
    `/api/admin/users/${publicId}/histories`,
    { params: q },
  );
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

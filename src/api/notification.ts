import instance from './instance';
import type { UserNotification } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

/** 받은 알림 목록 페이지 (Spring Page 중 필요한 필드만). */
export type ReceivedNotificationPage = {
  content: UserNotification[];
  totalElements: number;
  last: boolean;
};

/** 로그인/폴링 시 띄울 미확인 알림 (오래된 순). */
export const getPendingNotifications = async (): Promise<UserNotification[]> => {
  const res = await instance.get<ApiResponse<UserNotification[]>>(
    '/api/users/me/notifications/pending',
  );
  return res.data.data;
};

/** 받은 알림 전체 (최신순, read 무관). 받은 알림 화면용 페이지네이션. */
export const getReceivedNotifications = async (params?: {
  page?: number;
  size?: number;
}): Promise<ReceivedNotificationPage> => {
  const res = await instance.get<ApiResponse<ReceivedNotificationPage>>(
    '/api/users/me/notifications',
    { params: { page: params?.page ?? 0, size: params?.size ?? 20 } },
  );
  return res.data.data;
};

/** 알림 확인 처리 (본인만). */
export const markNotificationRead = async (id: number): Promise<void> => {
  await instance.post(`/api/users/me/notifications/${id}/read`);
};

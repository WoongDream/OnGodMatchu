import instance from './instance';
import type { UserNotification } from '@/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

/** 로그인/폴링 시 띄울 미확인 알림 (오래된 순). */
export const getPendingNotifications = async (): Promise<UserNotification[]> => {
  const res = await instance.get<ApiResponse<UserNotification[]>>(
    '/api/users/me/notifications/pending',
  );
  return res.data.data;
};

/** 알림 확인 처리 (본인만). */
export const markNotificationRead = async (id: number): Promise<void> => {
  await instance.post(`/api/users/me/notifications/${id}/read`);
};

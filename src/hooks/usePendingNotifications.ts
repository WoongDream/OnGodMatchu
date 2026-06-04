import { useCallback } from 'react';
import useSWR from 'swr';
import { getPendingNotifications } from '@/api/notification';
import type { UserNotification } from '@/types';

export type UsePendingNotificationsReturn = {
  notifications: UserNotification[];
  isLoading: boolean;
  error: unknown;
  refresh: () => void;
};

/** 로그인(부트스트랩) 시 + 주기 폴링으로 미확인 알림 조회. enabled=false(비로그인) 면 호출하지 않음. */
const POLL_INTERVAL_MS = 60_000;

const usePendingNotifications = (enabled: boolean): UsePendingNotificationsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ['notifications', 'pending'] : null,
    getPendingNotifications,
    { refreshInterval: POLL_INTERVAL_MS, revalidateOnFocus: true },
  );

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return { notifications: data ?? [], isLoading, error, refresh };
};

export default usePendingNotifications;

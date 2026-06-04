import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import usePendingNotifications from '@/hooks/usePendingNotifications';
import { markNotificationRead } from '@/api/notification';
import type { UserNotification } from '@/types';
import NotificationModal from './NotificationModal';

/**
 * 로그인 사용자의 미확인 알림을 순차 modal 로 표시. 로그인/부트스트랩 시 + 주기 폴링으로 받아 큐로 처리한다. 확인/다음 시 read 처리하고, 이미 처리한 id 는
 * 재폴링에도 다시 띄우지 않는다.
 */
const NotificationQueue = memo(() => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { notifications, refresh } = usePendingNotifications(isLoggedIn);
  const navigate = useNavigate();

  const [queue, setQueue] = useState<UserNotification[]>([]);
  const [index, setIndex] = useState(0);
  const processedRef = useRef<Set<number>>(new Set());

  // 로그아웃 시 상태 초기화.
  useEffect(() => {
    if (!isLoggedIn) {
      setQueue([]);
      setIndex(0);
      processedRef.current = new Set();
    }
  }, [isLoggedIn]);

  // 새 미확인 알림이 도착하고 현재 표시 중인 큐가 없으면 적재 (이미 처리한 id 제외).
  useEffect(() => {
    if (queue.length > 0) {
      return;
    }
    const fresh = notifications.filter((n) => !processedRef.current.has(n.id));
    if (fresh.length > 0) {
      setQueue(fresh);
      setIndex(0);
    }
  }, [notifications, queue.length]);

  const consume = useCallback((id: number) => {
    processedRef.current.add(id);
    void markNotificationRead(id).catch(() => {});
  }, []);

  const finish = useCallback(() => {
    setQueue([]);
    setIndex(0);
    void refresh();
  }, [refresh]);

  if (!isLoggedIn || queue.length === 0) {
    return null;
  }
  const current = queue[index];
  if (!current) {
    return null;
  }

  const advance = () => {
    consume(current.id);
    if (index < queue.length - 1) {
      setIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const inquiry = () => {
    consume(current.id);
    finish();
    navigate('/inquiry');
  };

  return (
    <NotificationModal
      notification={current}
      total={queue.length}
      index={index}
      onNext={advance}
      onConfirm={advance}
      onInquiry={inquiry}
    />
  );
});

NotificationQueue.displayName = 'NotificationQueue';
export default NotificationQueue;

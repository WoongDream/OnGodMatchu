import { memo, useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import NotificationListItem from '@/features/notification/NotificationListItem';
import ReceivedNotificationModal from '@/features/notification/ReceivedNotificationModal';
import useReceivedNotifications from '@/hooks/useReceivedNotifications';
import type { User, UserNotification } from '@/types';
import {
  countStyle,
  emptyStyle,
  listStyle,
  messageStyle,
  sentinelStyle,
  titleStyle,
  wrapperStyle,
} from './ProfileNotifications.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const ProfileNotifications = memo(() => {
  const { isMe } = useOutletContext<OutletContext>();

  const { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore } =
    useReceivedNotifications();

  const [selected, setSelected] = useState<UserNotification | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasNext) {
      return;
    }
    const target = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNext, loadMore, items.length]);

  if (!isMe) {
    return <Navigate to=".." replace />;
  }

  const isInitialLoad = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <h2 css={titleStyle}>받은 알림</h2>
      <span css={countStyle}>전체 {totalElements}개</span>

      {error ? (
        <p css={messageStyle}>받은 알림을 불러오지 못했습니다.</p>
      ) : isInitialLoad ? (
        <p css={messageStyle}>불러오는 중...</p>
      ) : isEmpty ? (
        <div css={emptyStyle}>
          <p>아직 받은 알림이 없어요.</p>
        </div>
      ) : (
        <div css={listStyle}>
          {items.map((notification) => (
            <NotificationListItem
              key={notification.id}
              notification={notification}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {hasNext && !isInitialLoad && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span>불러오는 중...</span>}
        </div>
      )}

      {selected && (
        <ReceivedNotificationModal notification={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
});

ProfileNotifications.displayName = 'ProfileNotifications';
export default ProfileNotifications;

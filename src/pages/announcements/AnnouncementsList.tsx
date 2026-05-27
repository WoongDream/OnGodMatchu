import { memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnnouncementIcon } from '@/components/icon';
import useNoticesInfinite from '@/hooks/useNoticesInfinite';
import {
  pageStyle,
  headerStyle,
  headerIconStyle,
  titleStyle,
  subtitleStyle,
  listStyle,
  rowStyle,
  rowTitleStyle,
  rowDateStyle,
  loadingStyle,
  emptyStyle,
  sentinelStyle,
} from './AnnouncementsList.style';

const formatDate = (iso: string): string => iso.slice(0, 10);

const AnnouncementsList = memo(() => {
  const { items, isLoading, isLoadingMore, hasNext, loadMore, error } = useNoticesInfinite({
    kind: 'announcements',
  });
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

  return (
    <section css={pageStyle}>
      <header css={headerStyle}>
        <span css={headerIconStyle}>
          <AnnouncementIcon size={22} />
        </span>
        <div>
          <h1 css={titleStyle}>공지사항</h1>
          <p css={subtitleStyle}>서비스 점검 · 정책 변경 · 주요 안내사항을 알려드려요.</p>
        </div>
      </header>

      {isLoading && items.length === 0 ? (
        <div css={loadingStyle}>불러오는 중...</div>
      ) : error ? (
        <div css={emptyStyle}>공지사항을 불러오지 못했습니다.</div>
      ) : items.length === 0 ? (
        <div css={emptyStyle}>아직 등록된 공지사항이 없어요.</div>
      ) : (
        <ul css={listStyle}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/announcements/notices/${item.id}`} css={rowStyle}>
                <span css={rowTitleStyle}>{item.title}</span>
                <span css={rowDateStyle}>{formatDate(item.publishedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasNext && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span css={loadingStyle}>불러오는 중...</span>}
        </div>
      )}
    </section>
  );
});

AnnouncementsList.displayName = 'AnnouncementsList';
export default AnnouncementsList;

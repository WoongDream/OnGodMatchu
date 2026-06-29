import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button';
import { ArrowRightIcon } from '@/components/icon';
import Input from '@/components/input';
import NoticeStatusBadge from '@/components/notice-status-badge';
import useBoNotices from '@/hooks/useBoNotices';
import useBoNoticeStats from '@/hooks/useBoNoticeStats';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import type { NoticeFilter } from '@/types';
import {
  pageStyle,
  ownerBannerStyle,
  ownerTagStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  statsGridStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
  statHintStyle,
  filterBarStyle,
  searchWrapStyle,
  tabsStyle,
  tabButtonStyle,
  tableStyle,
  tableHeadStyle,
  rowStyle,
  rowTitleStyle,
  cellMutedStyle,
  chevronStyle,
  loadingStyle,
  emptyStyle,
  errorStyle,
  sentinelStyle,
} from './BoNoticeListPage.style';

const formatDate = (iso: string): string => iso.slice(0, 10);

const BoNoticeListPage = memo(() => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NoticeFilter>('ALL');
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);

  const { stats } = useBoNoticeStats();
  const { items, isLoading, isLoadingMore, hasNext, loadMore, error } = useBoNotices({
    filter,
    query,
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

  const total = stats?.total ?? 0;
  const published = stats?.published ?? 0;
  const pinned = stats?.pinned ?? 0;
  const draft = stats?.draft ?? 0;

  const tabs = useMemo(
    () =>
      [
        { value: 'ALL', label: '전체', count: total },
        { value: 'PINNED', label: '고정', count: pinned },
        { value: 'PUBLISHED', label: '게시', count: published },
        { value: 'DRAFT', label: '임시저장', count: draft },
      ] as const,
    [total, pinned, published, draft],
  );

  return (
    <section css={pageStyle}>
      <div css={ownerBannerStyle}>
        <span css={ownerTagStyle}>OWNER</span>
        공지사항 관리의 모든 기능은 OWNER만 사용할 수 있어요.
      </div>

      <header css={headerStyle}>
        <div>
          <h1 css={titleStyle}>공지사항 관리</h1>
          <p css={subtitleStyle}>공지 작성·게시·고정 상태를 관리하고 노출 여부를 제어해요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/notices/new')}>
          새 공지 작성
        </Button>
      </header>

      <div css={statsGridStyle}>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>전체 공지</span>
          <span css={statValueStyle}>{total.toLocaleString()}</span>
        </div>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>게시 중</span>
          <span css={statValueStyle}>{published.toLocaleString()}</span>
          <span css={statHintStyle}>노출</span>
        </div>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>고정</span>
          <span css={statValueStyle}>{pinned.toLocaleString()}</span>
        </div>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>임시저장</span>
          <span css={statValueStyle}>{draft.toLocaleString()}</span>
          <span css={statHintStyle}>작성 중</span>
        </div>
      </div>

      <div css={filterBarStyle}>
        <div css={searchWrapStyle}>
          <Input value={search} onChange={setSearch} placeholder="공지 제목 검색" />
        </div>
        <div css={tabsStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              css={(theme) => tabButtonStyle(theme, filter === tab.value)}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label} {tab.count.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <div css={loadingStyle}>불러오는 중...</div>
      ) : error ? (
        <div css={errorStyle}>공지를 불러오지 못했어요.</div>
      ) : items.length === 0 ? (
        <div css={emptyStyle}>아직 등록된 공지가 없어요.</div>
      ) : (
        <div css={tableStyle}>
          <div css={tableHeadStyle}>
            <span>제목</span>
            <span>상태</span>
            <span>조회수</span>
            <span>작성일</span>
            <span aria-hidden="true" />
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              css={rowStyle}
              onClick={() => navigate(`/admin/notices/${item.id}`)}
            >
              <span css={rowTitleStyle}>{item.title}</span>
              <span>
                <NoticeStatusBadge status={item.status} pinned={item.pinned} />
              </span>
              <span css={cellMutedStyle}>{item.viewCount.toLocaleString()}</span>
              <span css={cellMutedStyle}>{formatDate(item.createdAt)}</span>
              <span css={chevronStyle}>
                <ArrowRightIcon size={16} />
              </span>
            </button>
          ))}
        </div>
      )}

      {hasNext && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span css={loadingStyle}>불러오는 중...</span>}
        </div>
      )}
    </section>
  );
});

BoNoticeListPage.displayName = 'BoNoticeListPage';
export default BoNoticeListPage;

import { memo, useEffect, useRef, useState } from 'react';
import useBoInquiries from '@/hooks/useBoInquiries';
import useBoInquiryStats from '@/hooks/useBoInquiryStats';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import type { InquiryFilter, InquiryStats } from '@/types';
import AdminInquiryListItem from '@/features/admin/inquiries/AdminInquiryListItem';
import { inquiryGridColumns } from '@/features/admin/inquiries/AdminInquiryListItem.style';
import {
  cardLabelStyle,
  cardStyle,
  cardValueStyle,
  emptyStyle,
  footerCountStyle,
  listHeaderStyle,
  pageStyle,
  searchInputStyle,
  sentinelStyle,
  statsGridStyle,
  subtitleStyle,
  tabButtonStyle,
  tabCountStyle,
  tabsStyle,
  titleStyle,
} from './BoInquiriesPage.style';

/** 필터 탭 — 전체/대기/처리중에만 카운트 뱃지(완료는 stats 미제공 항목 없이 표시만). */
type FilterTab = { filter: InquiryFilter; label: string; countKey?: keyof InquiryStats };

const TABS: FilterTab[] = [
  { filter: 'ALL', label: '전체' },
  { filter: 'PENDING', label: '대기', countKey: 'pending' },
  { filter: 'IN_PROGRESS', label: '처리중', countKey: 'inProgress' },
  { filter: 'DONE', label: '완료' },
];

const BoInquiriesPage = memo(() => {
  const [filter, setFilter] = useState<InquiryFilter>('ALL');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { stats } = useBoInquiryStats();
  const { items, totalElements, isLoading, hasNext, loadMore, error } = useBoInquiries({
    filter,
    query: debouncedSearch || undefined,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNext) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNext, loadMore, items.length]);

  return (
    <div css={pageStyle}>
      <h1 css={titleStyle}>문의사항 관리</h1>
      <p css={subtitleStyle}>접수된 문의를 시간 순으로 확인하고 상세에서 답변해요.</p>

      <div css={statsGridStyle}>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>전체 문의</span>
          <span css={cardValueStyle}>{(stats?.total ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>대기</span>
          <span css={cardValueStyle}>{(stats?.pending ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>처리중</span>
          <span css={cardValueStyle}>{(stats?.inProgress ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>완료</span>
          <span css={cardValueStyle}>{(stats?.done ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div css={tabsStyle}>
        <input
          css={searchInputStyle}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="문의 제목 검색"
        />
        {TABS.map((tab) => {
          const active = tab.filter === filter;
          const count = tab.countKey ? stats?.[tab.countKey] : undefined;
          return (
            <button
              key={tab.filter}
              type="button"
              css={(theme) => tabButtonStyle(theme, active)}
              onClick={() => setFilter(tab.filter)}
            >
              {tab.label}
              {count !== undefined ? (
                <span css={(theme) => tabCountStyle(theme, active)}>{count.toLocaleString()}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div css={(theme) => listHeaderStyle(theme, inquiryGridColumns)}>
        <span>제목</span>
        <span>문의한 유저</span>
        <span>상태</span>
        <span>접수일</span>
        <span />
      </div>

      {items.map((item) => (
        <AdminInquiryListItem key={item.id} item={item} />
      ))}

      {!isLoading && items.length === 0 ? (
        <p css={emptyStyle}>{error ? '목록을 불러오지 못했어요.' : '조건에 맞는 문의가 없어요.'}</p>
      ) : null}

      <div ref={sentinelRef} css={sentinelStyle}>
        {hasNext ? '스크롤하면 더 불러와요' : null}
      </div>

      <p css={footerCountStyle}>
        전체 {totalElements.toLocaleString()}건 중 {items.length.toLocaleString()}건 · 스크롤하면 더
        불러와요
      </p>
    </div>
  );
});

BoInquiriesPage.displayName = 'BoInquiriesPage';
export default BoInquiriesPage;

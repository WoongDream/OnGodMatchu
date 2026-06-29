import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button';
import { ArrowRightIcon } from '@/components/icon';
import Input from '@/components/input';
import NicknameTypeBadge from '@/components/nickname-type-badge';
import useBoNicknames from '@/hooks/useBoNicknames';
import useBoNicknameStats from '@/hooks/useBoNicknameStats';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import type { NicknameMatchType, NicknameRuleFilter } from '@/types';
import {
  pageStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  statsGridStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
  filterBarStyle,
  searchWrapStyle,
  tabsStyle,
  tabButtonStyle,
  tableStyle,
  tableHeadStyle,
  rowStyle,
  rowValueStyle,
  cellMutedStyle,
  chevronStyle,
  loadingStyle,
  emptyStyle,
  errorStyle,
  sentinelStyle,
} from './BoNicknamesPage.style';

const MATCH_LABELS: Record<NicknameMatchType, string> = {
  EXACT: '완전일치',
  PREFIX: '접두일치',
  CONTAINS: '부분일치',
};

const formatDate = (iso: string): string => iso.slice(0, 10);

const BoNicknamesPage = memo(() => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NicknameRuleFilter>('ALL');
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);

  const { stats } = useBoNicknameStats();
  const { items, totalElements, isLoading, isLoadingMore, hasNext, loadMore, error } =
    useBoNicknames({ filter, query });

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
  const forbidden = stats?.forbidden ?? 0;
  const reserved = stats?.reserved ?? 0;

  const tabs = useMemo(
    () =>
      [
        { value: 'ALL', label: '전체', count: total },
        { value: 'FORBIDDEN', label: '금지', count: forbidden },
        { value: 'RESERVED', label: '예약', count: reserved },
      ] as const,
    [total, forbidden, reserved],
  );

  return (
    <section css={pageStyle}>
      <header css={headerStyle}>
        <div>
          <h1 css={titleStyle}>닉네임 관리</h1>
          <p css={subtitleStyle}>사칭·악용을 막기 위해 사용할 수 없는 닉네임을 관리해요.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/nicknames/new')}>
          닉네임 추가
        </Button>
      </header>

      <div css={statsGridStyle}>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>전체 규칙</span>
          <span css={statValueStyle}>{total.toLocaleString()}</span>
        </div>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>금지</span>
          <span css={statValueStyle}>{forbidden.toLocaleString()}</span>
        </div>
        <div css={statCardStyle}>
          <span css={statLabelStyle}>예약</span>
          <span css={statValueStyle}>{reserved.toLocaleString()}</span>
        </div>
      </div>

      <div css={filterBarStyle}>
        <div css={searchWrapStyle}>
          <Input value={search} onChange={setSearch} placeholder="닉네임 · 패턴 검색" />
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
        <div css={errorStyle}>닉네임 규칙을 불러오지 못했어요.</div>
      ) : items.length === 0 ? (
        <div css={emptyStyle}>아직 등록된 닉네임 규칙이 없어요.</div>
      ) : (
        <div css={tableStyle}>
          <div css={tableHeadStyle}>
            <span>닉네임 · 패턴</span>
            <span>유형</span>
            <span>매칭</span>
            <span>사유</span>
            <span>등록일</span>
            <span aria-hidden="true" />
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              css={rowStyle}
              onClick={() => navigate(`/admin/nicknames/${item.id}`)}
            >
              <span css={rowValueStyle}>{item.value}</span>
              <span>
                <NicknameTypeBadge type={item.type} />
              </span>
              <span css={cellMutedStyle}>{MATCH_LABELS[item.matchType]}</span>
              <span css={cellMutedStyle}>{item.reason ?? '—'}</span>
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

      {!isLoading && !error && items.length > 0 && (
        <p css={loadingStyle}>
          전체 {totalElements.toLocaleString()}건 중 {items.length.toLocaleString()}건
          {hasNext ? ' · 스크롤하면 더 불러와요' : ''}
        </p>
      )}
    </section>
  );
});

BoNicknamesPage.displayName = 'BoNicknamesPage';
export default BoNicknamesPage;

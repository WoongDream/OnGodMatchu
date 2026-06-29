import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminUsers from '@/hooks/useAdminUsers';
import useAdminUserSummary from '@/hooks/useAdminUserSummary';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import { useToast } from '@/components/toast';
import { mapAdminError, sendUserNotification } from '@/api/admin';
import type { AdminUser } from '@/api/admin';
import type { NotificationDraft, Role, UserStatus } from '@/types';
import AdminUserListItem from '@/features/admin/users/AdminUserListItem';
import MonthlyUserStatsModal from '@/features/admin/users/MonthlyUserStatsModal';
import NotificationComposeModal from '@/features/admin/users/NotificationComposeModal';
import { userGridColumns } from '@/features/admin/users/AdminUserListItem.style';
import {
  bannerStyle,
  cardLabelRowStyle,
  cardLabelStyle,
  cardStyle,
  cardSubStyle,
  cardValueStyle,
  chevronBoxStyle,
  clickableCardStyle,
  emptyStyle,
  footerCountStyle,
  listHeaderStyle,
  pageStyle,
  searchInputStyle,
  sentinelStyle,
  statsGridStyle,
  subtitleStyle,
  tabButtonStyle,
  tabsStyle,
  titleStyle,
} from './BoUsersPage.style';

type Tab = { key: string; label: string; role?: Role; status?: UserStatus };

const TABS: Tab[] = [
  { key: 'all', label: '전체' },
  { key: 'owner', label: 'OWNER', role: 'OWNER' },
  { key: 'admin', label: 'ADMIN', role: 'ADMIN' },
  { key: 'user', label: 'USER', role: 'USER' },
  { key: 'suspended', label: '정지', status: 'SUSPENDED' },
  { key: 'withdrawn', label: '탈퇴', status: 'WITHDRAWN' },
];

const BoUsersPage = memo(() => {
  const navigate = useNavigate();
  const toast = useToast();

  const [tabKey, setTabKey] = useState('all');
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<AdminUser | null>(null);
  const [isSending, setIsSending] = useState(false);

  const tab = useMemo(() => TABS.find((t) => t.key === tabKey) ?? TABS[0], [tabKey]);

  const { summary } = useAdminUserSummary();
  const { items, totalElements, isLoading, hasNext, loadMore, error } = useAdminUsers({
    role: tab.role,
    status: tab.status,
    query: query || undefined,
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

  const handleSend = async (draft: NotificationDraft) => {
    if (!notifyTarget) {
      return;
    }
    setIsSending(true);
    try {
      await sendUserNotification(notifyTarget.userId, draft);
      toast.success('알림을 보냈어요.');
      setNotifyTarget(null);
    } catch (e) {
      const code = mapAdminError(e);
      toast.error(
        code === 'TARGET_INVALID'
          ? '탈퇴한 사용자에게는 보낼 수 없어요.'
          : '알림 발송에 실패했어요.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div css={pageStyle}>
      <div css={bannerStyle}>
        OWNER · ADMIN 임명/해제는 OWNER만 할 수 있어요. 그 외 유저 관리 기능은 ADMIN도 사용할 수
        있어요.
      </div>

      <h1 css={titleStyle}>유저 관리</h1>
      <p css={subtitleStyle}>가입 유저의 활동을 확인하고 역할·계정 상태를 관리해요.</p>

      <div css={statsGridStyle}>
        <button
          type="button"
          css={[cardStyle, clickableCardStyle]}
          onClick={() => setMonthlyOpen(true)}
        >
          <span css={cardLabelRowStyle}>
            <span>전체 유저</span>
            <span css={chevronBoxStyle} aria-hidden="true">
              ›
            </span>
          </span>
          <span css={cardValueStyle}>{(summary?.totalUsers ?? 0).toLocaleString()}</span>
          <span css={cardSubStyle}>+{(summary?.newThisMonth ?? 0).toLocaleString()} 이번 달</span>
        </button>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>OWNER</span>
          <span css={cardValueStyle}>{(summary?.ownerCount ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>ADMIN</span>
          <span css={cardValueStyle}>{(summary?.adminCount ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>USER</span>
          <span css={cardValueStyle}>{(summary?.userCount ?? 0).toLocaleString()}</span>
        </div>
        <div css={cardStyle}>
          <span css={cardLabelStyle}>정지</span>
          <span css={cardValueStyle}>{(summary?.suspendedCount ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div css={tabsStyle}>
        <input
          css={searchInputStyle}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="닉네임 · 이메일 검색"
        />
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            css={(theme) => tabButtonStyle(theme, t.key === tabKey)}
            onClick={() => setTabKey(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div css={(theme) => listHeaderStyle(theme, userGridColumns)}>
        <span>유저</span>
        <span>역할</span>
        <span>가입일</span>
        <span>상태</span>
        <span />
      </div>

      {items.map((u) => (
        <AdminUserListItem
          key={u.userId}
          user={u}
          onSelect={(id) => navigate(`/admin/users/${id}`)}
          onNotify={setNotifyTarget}
        />
      ))}

      {!isLoading && items.length === 0 ? (
        <p css={emptyStyle}>{error ? '목록을 불러오지 못했어요.' : '조건에 맞는 유저가 없어요.'}</p>
      ) : null}

      <div ref={sentinelRef} css={sentinelStyle}>
        {hasNext ? '스크롤하면 더 불러와요' : null}
      </div>

      <p css={footerCountStyle}>
        전체 {totalElements.toLocaleString()}건 중 {items.length.toLocaleString()}건
      </p>

      <MonthlyUserStatsModal isOpen={monthlyOpen} onClose={() => setMonthlyOpen(false)} />
      {notifyTarget ? (
        <NotificationComposeModal
          isOpen
          onClose={() => setNotifyTarget(null)}
          recipient={{ nickname: notifyTarget.nickname, email: notifyTarget.email }}
          isSubmitting={isSending}
          onSend={handleSend}
        />
      ) : null}
    </div>
  );
});

BoUsersPage.displayName = 'BoUsersPage';
export default BoUsersPage;

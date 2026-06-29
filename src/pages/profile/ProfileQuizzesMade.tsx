import { memo, useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@/components/button';
import ChipButton from '@/components/chip-button';
import Dropdown from '@/components/dropdown';
import MyQuizStats from '@/components/my-quiz-stats';
import MyQuizList from '@/components/my-quiz-list';
import { useToast } from '@/components/toast';
import useMyQuizzes from '@/hooks/useMyQuizzes';
import useMyQuizzesAggregate from '@/hooks/useMyQuizzesAggregate';
import useAuthStore from '@/store/authStore';
import { isSuspended } from '@/lib/auth/role';
import SuspensionInline from '@/features/suspension/SuspensionInline';
import { disabledSurfaceStyle } from '@/features/suspension/style';
import type { MyQuizzesSort, MyQuizzesVisibilityFilter } from '@/api/quiz';
import type { User } from '@/types';
import {
  wrapperStyle,
  interactiveAreaStyle,
  headerRowStyle,
  titleStyle,
  newButtonWrapperStyle,
  filterRowStyle,
  chipsStyle,
  moreRowStyle,
  errorStyle,
  loadingStyle,
  emptyActionRowStyle,
  emptyTextStyle,
} from './ProfileQuizzesMade.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const SORT_OPTIONS: ReadonlyArray<{ value: MyQuizzesSort; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'plays', label: '플레이순' },
  { value: 'shares', label: '공유하기순' },
  { value: 'stars', label: '스타순' },
  { value: 'comments', label: '댓글순' },
];

const PAGE_SIZE = 6;

const ProfileQuizzesMade = memo(() => {
  const { isMe } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const suspended = isSuspended(user);
  const [visibility, setVisibility] = useState<MyQuizzesVisibilityFilter>('all');
  const [sort, setSort] = useState<MyQuizzesSort>('latest');
  const [size, setSize] = useState(PAGE_SIZE);

  const { stats, isLoading: isStatsLoading } = useMyQuizzesAggregate();
  const { items, totalElements, isLoading, error, isMutating, remove } = useMyQuizzes({
    visibility,
    sort,
    size,
    page: 0,
  });

  const handleEdit = useCallback((quizId: number) => navigate(`/quiz/${quizId}/edit`), [navigate]);

  const handleDelete = useCallback(
    async (quizId: number) => {
      const ok = await remove(quizId);
      if (ok) {
        toast.success('퀴즈를 삭제했어요.');
      } else {
        toast.error('퀴즈 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
    },
    [remove, toast],
  );

  const handleCreate = useCallback(() => navigate('/quiz/create'), [navigate]);

  const visibilityCounts = useMemo(() => {
    if (!stats) {
      return { all: 0, public: 0, private: 0 };
    }
    return { all: stats.totalQuizCount, public: 0, private: 0 };
  }, [stats]);

  if (!isMe) {
    return <Navigate to=".." replace />;
  }

  const showMore = items.length < totalElements;
  const isInitialLoad = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <header css={headerRowStyle}>
        <div css={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h2 css={titleStyle}>내가 만든 퀴즈</h2>
          {suspended ? <SuspensionInline until={user?.suspendedUntil} /> : null}
        </div>
        {suspended ? null : (
          <div css={newButtonWrapperStyle}>
            <Button variant="primary" onClick={handleCreate}>
              + 새 퀴즈
            </Button>
          </div>
        )}
      </header>

      <MyQuizStats stats={stats} isLoading={isStatsLoading} />

      <div css={[interactiveAreaStyle, suspended && disabledSurfaceStyle]}>
        <div css={filterRowStyle}>
          <div css={chipsStyle} role="tablist" aria-label="공개 여부 필터">
            <ChipButton active={visibility === 'all'} onClick={() => setVisibility('all')}>
              전체 {visibilityCounts.all}
            </ChipButton>
            <ChipButton active={visibility === 'public'} onClick={() => setVisibility('public')}>
              공개
            </ChipButton>
            <ChipButton active={visibility === 'private'} onClick={() => setVisibility('private')}>
              비공개
            </ChipButton>
          </div>
          <Dropdown<MyQuizzesSort>
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
            ariaLabel="정렬 기준"
          />
        </div>

        {error ? <p css={errorStyle}>퀴즈 목록을 불러오지 못했습니다.</p> : null}
        {isInitialLoad && <p css={loadingStyle}>불러오는 중...</p>}

        {!isInitialLoad && !error && (
          <>
            {isEmpty ? (
              <div css={emptyActionRowStyle}>
                <p css={emptyTextStyle}>아직 만든 퀴즈가 없습니다.</p>
                <Button variant="primary" onClick={handleCreate}>
                  퀴즈 만들기
                </Button>
              </div>
            ) : (
              <MyQuizList
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isMutating={isMutating}
              />
            )}

            {showMore && (
              <div css={moreRowStyle}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSize((s) => s + PAGE_SIZE)}
                  disabled={isLoading}
                >
                  더 보기 ({items.length} / {totalElements})
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
});

ProfileQuizzesMade.displayName = 'ProfileQuizzesMade';
export default ProfileQuizzesMade;

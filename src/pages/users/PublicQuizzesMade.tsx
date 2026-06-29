import { memo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@/components/button';
import Dropdown from '@/components/dropdown';
import MyQuizList from '@/components/my-quiz-list';
import useMyQuizzes from '@/hooks/useMyQuizzes';
import type { MyQuizzesSort } from '@/api/quiz';
import type { PublicProfileContext } from './PublicProfileLayout';
import {
  wrapperStyle,
  headerRowStyle,
  titleStyle,
  filterRowStyle,
  moreRowStyle,
  errorStyle,
  loadingStyle,
  emptyTextStyle,
} from '@/pages/profile/ProfileQuizzesMade.style';
import { countStyle } from '@/pages/profile/ProfileQuizzesPlayed.style';

const SORT_OPTIONS: ReadonlyArray<{ value: MyQuizzesSort; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'plays', label: '플레이순' },
  { value: 'shares', label: '공유하기순' },
  { value: 'stars', label: '스타순' },
  { value: 'comments', label: '댓글순' },
];

const PAGE_SIZE = 6;

const PublicQuizzesMade = memo(() => {
  const { publicId, summary } = useOutletContext<PublicProfileContext>();
  const navigate = useNavigate();
  const [sort, setSort] = useState<MyQuizzesSort>('latest');
  const [size, setSize] = useState(PAGE_SIZE);

  const { items, totalElements, isLoading, error } = useMyQuizzes({
    userId: publicId,
    sort,
    size,
    page: 0,
  });

  const showMore = items.length < totalElements;
  const isInitialLoad = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <header css={headerRowStyle}>
        <h2 css={titleStyle}>{summary.nickname}님이 만든 퀴즈</h2>
      </header>

      <div css={filterRowStyle}>
        <span css={countStyle}>전체 {totalElements}개</span>
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
            <p css={emptyTextStyle}>아직 만든 퀴즈가 없어요.</p>
          ) : (
            <MyQuizList
              items={items}
              readOnly
              onOpen={(quizId) => navigate(`/quiz/${quizId}`)}
              emptyLabel="아직 만든 퀴즈가 없어요."
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
    </section>
  );
});

PublicQuizzesMade.displayName = 'PublicQuizzesMade';
export default PublicQuizzesMade;

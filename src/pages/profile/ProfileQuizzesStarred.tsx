import { memo, useEffect, useRef, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import Input from '@/components/input';
import QuizList from '@/features/quiz/list/QuizList';
import useStarredQuizzes from '@/hooks/useStarredQuizzes';
import type { User } from '@/types';
import {
  countStyle,
  emptyStyle,
  messageStyle,
  searchBoxStyle,
  sentinelStyle,
  titleStyle,
  toolbarStyle,
  wrapperStyle,
} from './ProfileQuizzesStarred.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

const ProfileQuizzesStarred = memo(() => {
  const { isMe } = useOutletContext<OutletContext>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore, removeQuiz } =
    useStarredQuizzes({ title: debouncedSearch });

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
  const isSearching = debouncedSearch.trim() !== '';
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <h2 css={titleStyle}>스타 준 퀴즈</h2>

      <div css={toolbarStyle}>
        <span css={countStyle}>전체 {totalElements}개</span>
        <div css={searchBoxStyle()}>
          <Input value={search} onChange={setSearch} placeholder="퀴즈 제목으로 찾기" />
        </div>
      </div>

      {error ? (
        <p css={messageStyle}>스타 준 퀴즈를 불러오지 못했습니다.</p>
      ) : isInitialLoad ? (
        <p css={messageStyle}>불러오는 중...</p>
      ) : isEmpty ? (
        <div css={emptyStyle}>
          <p>{isSearching ? '검색 결과가 없어요.' : '아직 스타 준 퀴즈가 없어요.'}</p>
        </div>
      ) : (
        <QuizList
          quizzes={items}
          onStarToggled={(quizId, nextStarred) => {
            if (!nextStarred) {
              removeQuiz(quizId);
            }
          }}
        />
      )}

      {hasNext && !isInitialLoad && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span>불러오는 중...</span>}
        </div>
      )}
    </section>
  );
});

ProfileQuizzesStarred.displayName = 'ProfileQuizzesStarred';
export default ProfileQuizzesStarred;

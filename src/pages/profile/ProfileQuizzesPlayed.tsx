import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Button from '@/components/button';
import Input from '@/components/input';
import PlayedQuizCard from '@/features/quiz/played/PlayedQuizCard';
import useMyAttemptsInfinite from '@/hooks/useMyAttemptsInfinite';
import type { User } from '@/types';
import {
  countStyle,
  emptyStyle,
  listStyle,
  messageStyle,
  searchBoxStyle,
  sentinelStyle,
  statBlockStyle,
  statLabelStyle,
  statsRowStyle,
  statValueStyle,
  titleStyle,
  toolbarStyle,
  wrapperStyle,
} from './ProfileQuizzesPlayed.style';

type OutletContext = {
  profile: User;
  isMe: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

const ProfileQuizzesPlayed = memo(() => {
  const { userId } = useParams<{ userId?: string }>();
  const { profile, isMe } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { items, totalElements, isLoading, isLoadingMore, hasNext, error, loadMore } =
    useMyAttemptsInfinite({
      userId: isMe ? undefined : userId,
      title: debouncedSearch,
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

  const stats = profile.stats;
  const isInitialLoad = isLoading && items.length === 0;
  const isSearching = debouncedSearch.trim() !== '';
  const isEmpty = !isLoading && items.length === 0 && !error;

  return (
    <section css={wrapperStyle}>
      <h2 css={titleStyle}>내가 푼 퀴즈</h2>

      {isMe && stats && (
        <div css={statsRowStyle}>
          <div css={statBlockStyle}>
            <span css={statLabelStyle}>푼 퀴즈</span>
            <span css={statValueStyle}>{stats.playCount}</span>
          </div>
          <div css={statBlockStyle}>
            <span css={statLabelStyle}>평균 정답률</span>
            <span css={statValueStyle}>
              {stats.correctRate != null ? `${Math.round(stats.correctRate)}%` : '—'}
            </span>
          </div>
        </div>
      )}

      <div css={toolbarStyle}>
        <span css={countStyle}>전체 {totalElements}개</span>
        <div css={searchBoxStyle()}>
          <Input value={search} onChange={setSearch} placeholder="퀴즈 제목으로 찾기" />
        </div>
      </div>

      {error ? (
        <p css={messageStyle}>풀이 기록을 불러오지 못했습니다.</p>
      ) : isInitialLoad ? (
        <p css={messageStyle}>불러오는 중...</p>
      ) : isEmpty ? (
        <div css={emptyStyle}>
          <p>{isSearching ? '검색 결과가 없어요.' : '아직 푼 퀴즈가 없어요.'}</p>
          {!isSearching && (
            <Button variant="primary" onClick={() => navigate('/quiz')}>
              퀴즈 풀러 가기
            </Button>
          )}
        </div>
      ) : (
        <div css={listStyle}>
          {items.map((attempt) => (
            <PlayedQuizCard
              key={attempt.quizId}
              attempt={attempt}
              onClick={(quizId) => navigate(`/quiz/${quizId}`)}
            />
          ))}
        </div>
      )}

      {hasNext && !isInitialLoad && (
        <div ref={sentinelRef} css={sentinelStyle}>
          {isLoadingMore && <span>불러오는 중...</span>}
        </div>
      )}
    </section>
  );
});

ProfileQuizzesPlayed.displayName = 'ProfileQuizzesPlayed';
export default ProfileQuizzesPlayed;

import useSWR from 'swr';
import { getVisitorSummary, type VisitorSummary } from '@/api/stats';

const REFRESH_INTERVAL_MS = 60_000;

type UseVisitorSummaryReturn = {
  data: VisitorSummary | undefined;
  isLoading: boolean;
  error: unknown;
};

/**
 * 헤더 방문자 블록용 요약 데이터. 60초 간격 자동 refresh.
 * 비로그인 허용 — 인증 실패 등은 SWR error 로 노출. 호출자는 error 시 graceful fallback (블록 숨김/축소).
 */
const useVisitorSummary = (): UseVisitorSummaryReturn => {
  const { data, error, isLoading } = useSWR<VisitorSummary>(
    ['stats', 'visitors'],
    () => getVisitorSummary(),
    {
      refreshInterval: REFRESH_INTERVAL_MS,
      revalidateOnFocus: false,
    },
  );

  return { data, isLoading, error };
};

export default useVisitorSummary;

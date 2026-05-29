import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { recordVisit } from '@/api/visit';
import { isTrackedPath } from '@/lib/analytics/trackedPaths';

const DEBOUNCE_MS = 300;

/**
 * SPA 라우팅 변경 시 트래킹 대상 path 를 BE 에 비동기 기록.
 * 같은 pathname 연속 발화는 1회로 합치고, 빠른 라우팅 사이의 중간 경로는 debounce 로 흡수.
 * BrowserRouter 컨텍스트 안에서만 호출 가능 (`useLocation` 사용).
 */
const usePageViewTracker = (): void => {
  const { pathname } = useLocation();
  const lastTrackedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isTrackedPath(pathname)) {
      return;
    }
    if (lastTrackedRef.current === pathname) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      lastTrackedRef.current = pathname;
      recordVisit(pathname);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);
};

export default usePageViewTracker;

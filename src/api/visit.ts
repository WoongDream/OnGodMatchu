import instance from './instance';

/**
 * SPA 페이지 방문 1건 기록. 비동기 fire-and-forget — 호출자는 결과를 기다리지 않는다.
 * anon_id 쿠키는 `withCredentials` 로 자동 동봉되고, 로그인 사용자면 user_id 도 함께 적재된다.
 * 네트워크/인증 실패는 silent — 트래킹이 사용자 흐름을 방해하지 않는다.
 */
export const recordVisit = (path: string): void => {
  if (!path) {
    return;
  }
  void instance.post('/api/visits', { path }).catch(() => {
    // silent
  });
};

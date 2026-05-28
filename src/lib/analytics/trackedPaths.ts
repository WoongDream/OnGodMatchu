/**
 * SPA 페이지 방문 트래킹 대상 매처. 라우트별 명시적 패턴.
 *
 * 트래킹 ON: 메인 `/quiz`, 퀴즈 상세 `/quiz/:id`, 공지/릴리즈 노트 목록·상세
 * 트래킹 OFF: 인증/프로필/편집/약관 페이지, 퀴즈 풀이 자식 라우트 (`/play`, `/result`, `/edit`),
 *            정적 리소스/API 경로
 */
const TRACKED_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/quiz$/,
  /^\/quiz\/[^/]+$/,
  /^\/announcements$/,
  /^\/announcements\/notices$/,
  /^\/announcements\/notices\/[^/]+$/,
  /^\/announcements\/release-notes$/,
  /^\/announcements\/release-notes\/[^/]+$/,
];

/** `/quiz/:id` 정규식이 `/quiz/create` 도 매칭하므로 명시적으로 제외. */
const EXCLUDED_PATTERNS: ReadonlyArray<RegExp> = [/^\/quiz\/create$/];

export const isTrackedPath = (pathname: string): boolean => {
  if (!pathname || !pathname.startsWith('/')) {
    return false;
  }
  if (EXCLUDED_PATTERNS.some((p) => p.test(pathname))) {
    return false;
  }
  return TRACKED_PATTERNS.some((p) => p.test(pathname));
};

# Backend API 연동 가이드

같은 어긋남(추측 → 400/403)을 반복하지 않기 위한 체크리스트 + 트러블슈팅 카탈로그.

본 문서 위치: `OnGodMatchu-FE/docs/api-integration.md` (FE 사용 측 관점).

BE 측 단일 진실 원천 (BE 레포 `OnGodMatchu-BE/docs/`):
- `api-development.md` — 응답 컨벤션·인증·rate limit·테스트 등 종합 가이드
- `error-codes.md` — ErrorCode 카탈로그
- `conventions.md` — 코드 스타일

「발생한 어긋남」 패턴은 BE 측 `api-development.md` 11. FAQ 와 미러링. 새 케이스 발생 시 양쪽 PR 본문에 「상대 레포 가이드 갱신 필요?」 체크.

## 새 BE API 추가 전 확인 (필수)

1. **Swagger 먼저** — `http://localhost:8080/swagger-ui/index.html#/` 에 정의가 있으면 그게 우선 진실.
2. BE PR 본문 `## API 변경` 섹션 확인 — BE 컨벤션상 응답 record 필드 추가/변경/삭제와 에러 코드 추가 시 PR 본문에 명시. **BREAKING** 표시 있으면 FE 동시 배포 필요.
3. BE 측에 명시적으로 확인할 4가지 (Swagger 만으로 부족할 때):
   - Request body 스키마 (필드명·타입·필수 여부)
   - Request headers (`Content-Type` 외 BE/S3 가 검사하는 커스텀 헤더)
   - Response 스키마 (성공·에러 모두)
   - 에러 코드 표 (`status` + `body.error.code` 매핑)
4. presigned URL 패턴이면 — `X-Amz-SignedHeaders` 에 잡힌 헤더는 PUT 시 **모두** 부착해야 S3 가 허용.

## 응답 컨벤션 (BE 약속)

### 래핑

모든 응답은 `ApiResponse` 형식. FE `src/api/instance.ts` 의 호출이 항상 `res.data.data` 를 unwrap.

```jsonc
// 성공
{ "success": true, "data": { ... } }
// 실패
{ "success": false, "error": { "code": "QUIZ_NOT_FOUND", "message": "..." } }
```

### Page<T> 스키마

목록 조회는 Spring Data 기본:

```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false,
  "empty": false
}
```

쿼리 파라미터 = `?page=0&size=20`. **`?sort=field,desc` Spring 기본 형식은 미사용** — endpoint 별로 명시 enum (`?sort=latest|plays|...`) 만 의미 있음.

### 시간 포맷

ISO 8601 + offset — `2026-05-07T10:00:00+09:00` (서버 KST). `new Date(value)` 그대로 사용 가능 (Safari iOS UTC 해석 이슈 없음).

대상 필드: `User.createdAt` / `Quiz.createdAt`·`updatedAt` / `Comment.createdAt`·`updatedAt` 등 모든 응답 시간 필드.

(과거 BE 가 `LocalDateTime` 으로 타임존 없이 보내던 시기가 있었음. 2026-05 이후 응답은 모두 offset 포함이라 클라이언트 측 KST 명시 변환 불필요.)

### nullable 의미

| 의미 | 값 |
|---|---|
| 측정값이 0 (좋아요 0개, 시도 1+정답 0) | **`0`** |
| 데이터 자체가 없음 (시도 0 → 정답률 산출 불가) | **`null`** |
| 옵셔널 boolean — 비로그인 뷰어가 모르는 상태 | **`null`** |
| 옵셔널 boolean — 로그인 뷰어의 상태 | **`true`/`false`** |

예:
- `Quiz.starCount = 0` (없음) / `MyQuizListItemResponse.correctRate = null` (산출 불가) / `correctRate = 0.0` (모두 오답)
- `Quiz.isStarred`: 비로그인 → `null`, 로그인 + 누름 → `true`, 로그인 + 안 누름 → `false`. 향후 `isOwner` 등 옵셔널 boolean 동일 패턴.

## 인증 / 토큰

| 토큰 | TTL |
|---|---|
| accessToken | 30분 |
| refreshToken | 14일 |

헤더: `Authorization: Bearer <accessToken>`.

### Refresh 흐름 (`src/api/instance.ts`)

`POST /api/auth/refresh { refreshToken }` 성공 시 새 access + refresh 한 쌍. 실패 코드 (모두 401):

| code | 의미 | FE 동작 |
|---|---|---|
| `UNAUTHORIZED` | catch-all 401 | refresh 시도 → 실패 시 재로그인 |
| `INVALID_TOKEN` | RT 위조/형식 오류 | 재로그인 |
| `TOKEN_EXPIRED` | RT 만료 | 재로그인 |
| `REFRESH_TOKEN_NOT_FOUND` | DB 에 RT 없음 (이미 무효화됨) | 재로그인 |

→ 인터셉터는 4종 동일하게 처리해도 무방. 재로그인은 `clearAuthSession()` + `/login` redirect.

## Rate Limit

| Endpoint | 제한 | 응답 |
|---|---|---|
| `POST /api/auth/send-verification-code` | 이메일별 60s 쿨다운 / 1h 5회, IP별 1h 10회 | 429 + `Retry-After` 헤더 + `error.retryAfter` (초) |

FE 처리 패턴 — `error.retryAfter` 초 카운트다운 노출. 현재 다른 endpoint 에는 RL 미적용 (BE 후속 작업 예정).

## 표준 패턴 (코드 링크)

새 흐름 만들기 전에 비슷한 기존 패턴부터 미러링.

- **이미지 업로드 (presigned PUT)**: `src/api/upload.ts` (퀴즈) / `src/hooks/useProfileImage.ts` (프로필)
- **에러 코드 매핑**: `src/api/user.ts` 의 `mapUserError` / `src/hooks/useCreateQuiz.ts` 의 `resolveCreateError`
- **SWR + 낙관적 업데이트**: `src/hooks/useUpdateProfile.ts` (`mutate(key, fn, { optimisticData, rollbackOnError, revalidate: false })`)
- **인터셉터 (401 → refresh)**: `src/api/instance.ts`

## ErrorCode 카탈로그

전체 표는 BE 레포 `OnGodMatchu-BE/docs/error-codes.md` 가 진실 원천. 자주 쓰는 매핑 패턴:

| status | FE 처리 |
|---|---|
| 400 (`INVALID_INPUT` 등) | 폼 인라인 에러 / 사용자 입력 재검토 안내 |
| 401 (`UNAUTHORIZED`/`INVALID_TOKEN`/`TOKEN_EXPIRED`/`REFRESH_TOKEN_NOT_FOUND`) | 4종 동일 — refresh 시도 → 실패 시 재로그인 |
| 403 (`QUIZ_FORBIDDEN`/`COMMENT_FORBIDDEN`/`UPLOAD_FORBIDDEN`) | "권한 없음" 안내 |
| 404 (`*_NOT_FOUND`) | 페이지/목록 갱신, 비공개 리소스도 404 (`QUIZ_NOT_FOUND`) |
| 409 (`EMAIL_ALREADY_EXISTS`/`NICKNAME_ALREADY_EXISTS`) | 폼 인라인 에러 (중복) |
| 422 (`PASSWORD_BREACHED`/`UPLOAD_VERIFICATION_FAILED`) | 비즈니스 위반 안내 |
| 429 (`RATE_LIMITED`) | `error.retryAfter` 카운트다운 |

## S3 / 이미지

### Presigned PUT 3단계 (업로드)

1. `POST /api/upload/presigned` (퀴즈) 또는 `POST /api/users/me/profile-image` (프로필) → `{ uploadUrl, key, expiresIn, requiredHeaders }`
2. FE 가 `uploadUrl` 로 PUT — **`requiredHeaders` 의 모든 헤더 부착 필수** (보통 `Content-Type` + `x-amz-tagging: status=pending`)
3. `PATCH /api/upload/complete` (퀴즈) 또는 `PATCH /api/users/me/profile-image { key }` (프로필) → BE 가 HEAD 검증 + 태그 제거 + DB COMPLETED

### Presigned PUT 만료 후 재발급

Presigned PUT URL TTL = 10분. 사용자가 페이지 열어둔 채 PUT 시도하면 만료 가능. 권장:

- 업로드 시작 시점에 다시 발급 (FE 가 캐싱하지 말고 매번 호출)
- 또는 PUT 403 받았을 때 1회만 재발급 후 재시도 (무한 루프 방지)

### Presigned GET URL 정책 (이미지 표시)

응답의 `thumbnailUrl` / `profileImageUrl` 등은 **Presigned GET URL** — 영구 public URL 아님.

- TTL **1시간** — 응답 받은 즉시 표시·사용 가정
- 응답마다 새 URL (서명 시각이 매번 다름) → 같은 리소스라도 매 요청마다 query string 이 달라짐
- **한 응답 내 같은 key 는 동일 URL** (BE `batchPresignViewUrls` 가 묶어 처리) — 같은 페이지 안에선 일관됨
- 페이지 새로고침 시 새 URL → **브라우저 캐시 미스가 의도된 동작**. 트래픽 절약하려면 SWR / React Query 등 데이터 캐시 또는 short-term 메모리 캐시로 응답 자체를 캐싱

`User.profileImageUrl` 은 BE 가 가입 시점부터 자동 SVG 생성 + DELETE 후에도 default 폴백 → **항상 non-null 보장**. FE 의 `ProfileImage` 이니셜 fallback 은 방어적 코드 수준 (정상 흐름에선 사용 안 됨).

### 자주 빠뜨리는 항목

- PUT 헤더의 `x-amz-tagging` 누락 → 403
- presigned 발급 시 보낸 `contentType` 과 PUT 의 `Content-Type` 불일치 → 서명 불일치 403
- key 를 BE 검증 단계 (`/complete`) 없이 그대로 사용 → BE 가 차단

## 트러블슈팅 카탈로그

| 증상 | 원인 후보 | 점검 |
|------|---------|------|
| 400 + `Content-Length: 0` | request body 누락 | Swagger / BE 에 body 스펙 확인 후 채워보내기 |
| S3 403 (PUT) | `SignedHeaders` 미일치 | presigned URL 의 `X-Amz-SignedHeaders` 의 헤더 모두 PUT 에 부착 |
| S3 403 (response body 가 XML) | 서명·만료·권한 | 서명·`X-Amz-Expires` 만료 / 키 prefix 정책 / CORS 별개 |
| 401 무한 루프 | refresh 토큰도 만료 | `src/api/instance.ts` 의 refresh 인터셉터 동작 확인 |
| CORS preflight 실패 | BE Origin 화이트리스트 | BE 측 CORS 설정에 dev origin 포함 확인 |
| 응답이 `data.data` 가 아님 | BE 버그 (모든 응답이 `ApiResponse<T>` 래핑이 컨벤션) | 별도 처리하지 말고 **BE 에 즉시 알리기** — 401 도 `ApiAuthenticationEntryPoint` 통해 ApiResponse 통일됨 |
| 페이지네이션 정렬 무시됨 | Spring 기본 `?sort=field,desc` 미사용 | endpoint 의 `?sort=` enum 키 (예: `latest`/`plays`) 사용 |
| 404 인데 권한 문제처럼 보임 | PRIVATE 리소스 외부 뷰어 차단을 404 로 통일 | 의도된 동작 — 본인 토큰으로 접근 시 정상 200 |
| 같은 이미지인데 매 요청마다 URL 다름 | presigned GET URL TTL 1시간 매번 새 서명 | 의도된 동작 — 응답 자체를 캐싱(SWR/React Query)하면 query string 도 안정 |

## 기록 — 발생한 어긋남 (재발 방지용)

새 케이스가 생길 때마다 **위에서부터** 한 줄로 추가. 원인·교훈 위주, 디버깅 과정 X.

- **2026-05-07** S3 PUT 403 — 프로필 presigned URL 의 `X-Amz-SignedHeaders=content-type;host;x-amz-tagging` 인데 FE 가 `x-amz-tagging` 누락. **교훈**: presigned URL 의 SignedHeaders 를 항상 확인. BE 가 응답에 `requiredHeaders` 를 동봉하면 그걸 그대로 사용.
- **2026-05-07** POST `/api/users/me/profile-image` 400 — body 없이 호출. BE 는 `{filename, contentType, sizeBytes?}` 를 기대. **교훈**: 퀴즈 presigned 흐름(`src/api/upload.ts`)이 이미 동일 패턴인데 미러링 안 함. 새 업로드 흐름은 기존 흐름부터 확인.
- **2026-05-07** PATCH `/api/users/me/visibility` 500 — FE 가 별도 visibility endpoint 가정했으나 BE 는 `PATCH /api/users/me { isProfilePublic }` 로 통합. **교훈**: 새 endpoint 는 BE 에 먼저 물어보기. FE 추측 endpoint 만들지 말 것.

## 사용 흐름

1. 새 BE API 작업이 잡히면 이 문서의 체크리스트를 BE 와 미리 맞춰본다.
2. 비슷한 기존 패턴이 있으면 그쪽 코드를 먼저 읽는다 (표준 패턴 섹션).
3. 작업 중 새 어긋남이 생기면 「발생한 어긋남」 맨 위에 한 줄 추가하고 PR 본문에도 짧게 남긴다.
4. 가이드를 갱신하는 PR 이면 본문에 한 줄 메모해서 상대 레포에도 알려준다 (BE: `api-development.md` 11. FAQ / FE: 본 문서). 같은 케이스가 양쪽에서 발생하는 경우가 많아서 한쪽만 갱신되면 누락됨.

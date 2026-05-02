# Image Management

OnGodMatchu 의 이미지 업로드/조회 아키텍처 가이드.

## 개요

S3 **private** 버킷에 이미지를 보관하고, 업로드는 **PUT presigned URL**, 조회는 BE 가 응답에 매번 새로 만들어주는 **GET signed URL** 로 처리한다. FE 와 DB 는 만료성이 있는 URL 을 **저장하지 않는다** — 항상 영구 식별자인 `key` 만 저장한다.

```
[FE] ──① POST /api/upload/presigned (file meta) ──> [BE]
[FE] <── { uploadUrl, key, expiresIn } ──────────── [BE]
[FE] ──② PUT uploadUrl (binary, Content-Type, x-amz-tagging) ─> [S3]
[FE] ──③ PATCH /api/upload/complete { key } ──────> [BE]   # 업로드 완료 알림
[FE] ──④ POST /api/quizzes { ..., imageKey } ─────> [BE]   # key 만 저장

[FE] ──⑤ GET /api/quizzes/{id} ───────────────────> [BE]
[FE] <── { ..., imageKey, imageUrl(fresh signed) } [BE]    # 응답에 동적 URL 동봉
[FE] ──⑥ <img src={imageUrl}> ────────────────────> [S3]
```

## 핵심 원칙

| 원칙 | 이유 |
|------|------|
| DB 에는 `*Key` 만 저장 | signed URL 은 만료시간이 있어 저장하면 시간 경과 후 깨짐 |
| 응답에 `*Key` + `*Url` 페어로 내려옴 | FE 는 표시용 `*Url` 그대로 사용 (BE 가 매번 fresh URL 생성) |
| 퀴즈 저장 payload 는 `*Key` 사용 | URL 이 아니라 key 를 보내야 정답 |
| FE 검증 (5MB · image/jpeg/png/webp) | UX 용 1차 차단. BE 가 presigned 발급 시 / complete 시 재검증 (3중 검증) |
| 업로드 직후 미리보기는 `URL.createObjectURL(file)` | signed URL 발급 비용 없이 로컬에서 바로 표시 |

## 폴더 컨벤션

`POST /api/upload/presigned` 의 `folder` 는 자유 입력이지만 다음 3개 값으로 통일한다. 슬래시·`../` 등 경로 조작 문자 금지.

| folder | 용도 |
|--------|------|
| `quiz-thumbnails` | 퀴즈 카드 썸네일 |
| `quiz-questions` | 문제 이미지 |
| `quiz-answers` | 정답 이미지 (정답 이미지가 문제 이미지와 다를 때만) |

## 만료 시간

| URL | TTL | 용도 |
|-----|-----|------|
| PUT `uploadUrl` | 10분 | presigned 발급 후 10분 내 PUT 완료해야 함 |
| GET `viewUrl` | 1시간 | BE 가 퀴즈 응답에 매번 새로 생성해서 동봉 |

## API 엔드포인트

### 1) PUT presigned URL 발급

```
POST /api/upload/presigned
Body: { filename: string, contentType: string, size: number }
Resp: { uploadUrl: string, key: string, expiresIn: number }
```

### 2) S3 PUT (FE → S3 직접)

`uploadUrl` 에 두 헤더와 함께 binary PUT:

| 헤더 | 값 | 비고 |
|------|----|------|
| `Content-Type` | `file.type` | BE 가 발급 시 서명에 박아둠. 누락·불일치 시 403 |
| `x-amz-tagging` | `status=pending` | BE 가 서명에 포함하는 태깅. 누락 시 403. 운영 S3 라이프사이클 룰과 1:1 매칭되어 사실상 고정값 (`PRESIGNED_PUT_TAGGING` 상수) |

`/api/upload/complete` 가 호출되면 BE 가 이 태그를 정식 상태로 갱신.

### 3) 업로드 완료 알림

```
PATCH /api/upload/complete
Body: { key: string }
Resp: { success: boolean }
```

### 4) 단독 GET signed URL 발급 (필요 시만)

```
GET /api/upload/signed?key=...
Resp: { viewUrl: string, key: string, expiresIn: number, expiresAt: string }
```

> 일반 퀴즈 조회 응답에는 `imageUrl` 이 이미 포함됨 → 이 엔드포인트는 거의 쓸 일 없음.  
> 업로드 직후 미리보기처럼 퀴즈 저장 전 임시 표시는 `URL.createObjectURL(file)` 로 충분.

### 5) 퀴즈 저장 페이로드

```ts
POST /api/quizzes
{
  title: string,
  description?: string,
  category: Category,
  thumbnailKey?: string,        // ← URL 아님, key
  questions: Array<{
    imageKey?: string,
    answerImageKey?: string,    // imageKey 와 동일하면 같은 값 재사용
    questionText?: string,
    answer: string,
  }>
}
```

### 6) 퀴즈 조회 응답

```ts
GET /api/quizzes/{id}
{
  id, title, description, category,
  thumbnailKey: string | null,
  thumbnailUrl: string | null,    // BE 가 매번 fresh signed URL 생성
  questions: Array<{
    id, orderNum, questionText, answer,
    imageKey: string | null,
    imageUrl: string | null,
    answerImageKey: string | null,
    answerImageUrl: string | null,
  }>
}
```

## FE 구성요소

| 파일 | 역할 |
|------|------|
| `src/api/upload.ts` | `requestUploadUrl(file)`, `uploadFileToPresignedUrl(file, url)`, `notifyUploadComplete(key)`, `getViewUrl(key)`, `uploadImage(file)` |
| `src/components/image-upload/ImageUpload.tsx` | 파일 선택 + 로컬 미리보기 + 클라이언트 검증 |
| `src/components/image-upload/ImageUpload.policy.ts` | `validateImageFile(file)` — MIME/사이즈 화이트리스트 |
| `src/hooks/useUploadImage.ts` | File → key 단일 액션 (presigned + PUT + complete 알림 묶음) |
| `src/hooks/useCreateQuiz.ts` | 모든 이미지 병렬 업로드 → key 들을 모아 createQuiz 호출 |
| `src/types/quiz.ts` | `Quiz`/`Question` 에 `*Key` (저장/요청용) + `*Url` (응답/표시용) 페어로 분리 |

### 업로드 흐름 코드 (요약)

```ts
// src/api/upload.ts
export const uploadImage = async (file: File): Promise<string> => {
  const { uploadUrl, key } = await requestUploadUrl(file);
  await uploadFileToPresignedUrl(file, uploadUrl);
  await notifyUploadComplete(key);
  return key;
};
```

### 퀴즈 저장 흐름 코드 (요약)

```ts
// src/hooks/useCreateQuiz.ts
const [thumbnailKey, questionImageKeys, answerImageKeys] = await Promise.all([
  thumbnailFile ? uploadImage(thumbnailFile) : null,
  Promise.all(questions.map((q) => (q.imageFile ? uploadImage(q.imageFile) : null))),
  Promise.all(
    questions.map((q) =>
      q.answerImageSameAsQuestion ? null : q.answerImageFile ? uploadImage(q.answerImageFile) : null,
    ),
  ),
]);

await createQuiz({
  title, description, category,
  thumbnailKey: thumbnailKey ?? undefined,
  questions: questions.map((q, i) => ({
    imageKey: questionImageKeys[i] ?? undefined,
    answerImageKey: q.answerImageSameAsQuestion
      ? (questionImageKeys[i] ?? undefined)
      : (answerImageKeys[i] ?? undefined),
    questionText: q.questionText.trim() || undefined,
    answer: q.answer.trim(),
  })),
});
```

`answerImageSameAsQuestion=true` 면 정답 이미지를 별도 업로드하지 않고 문제 이미지의 key 를 재사용한다 (S3 중복 업로드 회피).

## 클라이언트 검증

| 항목 | 값 |
|------|-----|
| 허용 MIME | `image/jpeg`, `image/png`, `image/webp` |
| 최대 용량 | 5MB (`5 * 1024 * 1024` bytes) |
| 검증 위치 | `src/components/image-upload/ImageUpload.policy.ts` `validateImageFile()` |

검증 실패 시 `ImageUpload` 가 인라인 에러 메시지 표시, `onChange` 미호출. 이 1차 차단을 우회하더라도 BE 가 presigned 발급 시·complete 시 재검증한다.

## 에러 처리

### 업로드 단계 (`useUploadImage`)

| code | 발생 조건 |
|------|-----------|
| `PRESIGNED_FAILED` | `POST /api/upload/presigned` 실패 |
| `PUT_FAILED` | S3 PUT 실패 (Content-Type 불일치 / `x-amz-tagging` 누락 / 만료 / 네트워크) |
| `COMPLETE_NOTIFY_FAILED` | `PATCH /api/upload/complete` 실패 |
| `NETWORK` | 위 외 axios 가 아닌 에러 |

### 퀴즈 저장 단계 (`useCreateQuiz`)

| HTTP | code | 발생 조건 |
|------|------|-----------|
| 400 | `INVALID_INPUT` | validation 실패 (title / category / questions / answer) |
| 400 | `INVALID_CATEGORY` | 화이트리스트 외 카테고리 키 |
| 401 | `UNAUTHORIZED` | JWT 만료/누락. 자동으로 `/login` 이동 |
| 404 | `USER_NOT_FOUND` | 토큰 유저 DB 미존재 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 예외 |
| - | `IMAGE_UPLOAD_FAILED` | 위 업로드 단계 실패가 createQuiz 까지 전파 |
| - | `NETWORK` | axios 가 아닌 에러 |

## 표시 사이트

이미지 표시 컴포넌트는 응답의 `*Url` 필드를 그대로 사용한다. `*Key` 는 표시에 쓰지 않는다.

```tsx
// 예: src/features/quiz-list/QuizCard.tsx
{quiz.thumbnailUrl && <img src={quiz.thumbnailUrl} alt={quiz.title} />}

// 예: src/features/quiz-play/QuizQuestion.tsx
{question.imageUrl && <img src={question.imageUrl} alt="문제 이미지" />}
```

페이지 진입할 때마다 BE 가 새 signed URL 을 생성해 주므로 FE 캐싱·갱신 로직 불필요. 단, 페이지를 1시간 이상 켜둔 채로 두면 URL 이 만료될 수 있으므로 새로고침 또는 라우트 재진입으로 새 URL 을 받는다.

## S3 / CORS

운영 도메인(`ongodmatchu.com`, `www.ongodmatchu.com`) 과 로컬(`http://localhost:5173`) 에서 PUT 가능하도록 BE 가 버킷 CORS 설정 완료.

확인 항목 (브라우저 Network 탭):
- `OPTIONS` preflight → 200
- `PUT` 본요청 → 200/204

## 보안 노트

- ❌ DB / payload 에 signed URL **저장 금지** — 만료시간 때문에 시간 경과 후 깨짐
- ❌ 로그·분석 도구에 raw signed URL 그대로 보내지 말 것 — URL 자체에 민감정보는 없으나 만료 전엔 어디서든 동작
- ✅ `User.id` (BIGSERIAL) 외부 노출 금지 — S3 key 내 식별자는 `User.publicId` (UUID) 만 사용 (BE 책임 영역, FE 는 직접 만들지 않음)
- ✅ PUT 시 `Content-Type` + `x-amz-tagging` 헤더 모두 필수 → 누락/오류 시 403

## 트러블슈팅

### PUT 시 403 반환

흔한 원인:
1. `Content-Type` 헤더 누락/불일치 — `file.type` 그대로 보냈는지 확인
2. `x-amz-tagging: status=pending` 누락 — `PRESIGNED_PUT_TAGGING` 상수 사용 확인
3. presigned URL 만료 (10분 초과) — 다시 발급

### 이미지가 안 보임 (퀴즈 상세에서)

페이지를 너무 오래 켜둬서 GET signed URL 이 만료된 경우. 새로고침으로 새 URL 받음. 운영에서 빈번하면 BE 만료시간 늘리거나 FE 가 응답 캐시 무효화 트리거 필요.

### 업로드 직후 미리보기가 안 보임

`URL.createObjectURL(file)` 사용. signed URL 받으려고 하지 말 것 — 비용 낭비. 업로드는 백그라운드로 진행 중이라도 미리보기는 즉시 표시 가능.

### `INVALID_TYPE` / `TOO_LARGE` 인라인 에러

FE 1차 검증에서 차단됨. `ImageUpload.policy.ts` 의 `ALLOWED_MIME_TYPES` / `MAX_FILE_SIZE_BYTES` 참고. 정책 변경 시 BE 도 같이 바꿔야 함.

## 참고

- API 스펙: `http://localhost:8080/swagger-ui/index.html#/`
- 관련 commit: `e2e010c` (퀴즈 생성 API 연동 — presigned 업로드 + key 기반 페이로드)

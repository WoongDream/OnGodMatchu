# quiz-autogen — 퀴즈 자동 생성 게시 도구

Claude Opus 가 주제선정 → 이미지수집 → 텍스트생성을 수행하고, 개인 계정으로 프로덕션에
**비공개(PRIVATE)** 퀴즈를 올린다. 사람은 프로덕션 "내가 만든 퀴즈"에서 검토 후 공개한다.

UGC 방식 — 관리자 계정이 아니라 **본인 일반 계정**으로 게시한다. 앱(BE/FE) 코드는 건드리지 않고
기존 공개 API(`/api/upload/*`, `/api/quizzes`)를 일반 유저처럼 호출한다.

## 두 조각

| 조각 | 역할 |
|---|---|
| 스킬 `/quiz-autogen` (`~/.claude/skills/quiz-autogen/SKILL.md`) | Opus 하네스. 수집·생성 후 `staging/<run>/` 작성, 이어서 `publish.ts` 실행 |
| `publish.ts` (이 폴더) | 결정적 게시. 매니페스트 검증 → 이미지 업로드 → `POST /api/quizzes`(PRIVATE) |

## 실행

보통은 Claude Code 에서 `/quiz-autogen 국기로 나라 맞히기 15문항` 한 번이면 생성→게시까지 끝난다.
게시만 따로 돌리려면:

```bash
cd OnGodMatchu-FE
ONGOD_API_BASE=https://api.ongodmatchu.com \
ONGOD_ACCESS_TOKEN=<토큰> \
npx tsx tools/quiz-autogen/publish.ts tools/quiz-autogen/staging/<run>/
# 또는: npm run quiz:publish -- tools/quiz-autogen/staging/<run>/
```

## 환경변수

같은 폴더에 `.env.local` (gitignore 의 `*.local` 로 무시됨) 을 두면 자동 로드된다. 실제 env 가 우선.

```
ONGOD_API_BASE=https://api.ongodmatchu.com
ONGOD_ACCESS_TOKEN=eyJ...            # 브라우저 localStorage 의 accessToken
ONGOD_WEB_BASE=https://ongodmatchu.com   # (선택) 검토 링크용, 기본값 동일
```

### 토큰 발급 (v1 — 수동)

BE 인증이 OAuth2(Google/Kakao/Naver) 전용이라 헤드리스 로그인이 어렵다. v1 은 수동 토큰:

1. 브라우저로 **게시에 쓸 개인 계정**으로 ongodmatchu.com 로그인
2. DevTools → Application → Local Storage → `accessToken` 값 복사
3. `.env.local` 의 `ONGOD_ACCESS_TOKEN` 에 붙여넣기

토큰은 만료된다. 401 이 나면 다시 발급하고, 한 번에 15~20문항 정도의 작은 배치로 돌린다.

## staging 매니페스트 (`quiz.json`)

이미지 경로는 staging 디렉토리 기준 상대경로. `sourceUrl`/`license` 는 검토·감사용이며 BE 로 전송하지 않는다.

```jsonc
{
  "title": "국기로 나라 맞히기",
  "description": "국기를 보고 나라 이름을 맞혀보세요.",
  "category": "general",              // game/music/culture/broadcast/general/comic/food/person/sports/meme
  "visibility": "PRIVATE",            // publish.ts 가 항상 PRIVATE 로 강제(검토 전 노출 방지)
  "thumbnail": "images/thumb.webp",   // 또는 null
  "questions": [
    {
      "image": "images/q01.webp",     // 또는 null (image 또는 questionText 중 하나는 필수)
      "questionText": "이 국기의 나라는?",  // 또는 null
      "answer": "대한민국",            // 필수, 간결한 표준 표기
      "answerImage": "images/a01.webp",   // 또는 null
      "sourceUrl": "https://commons.wikimedia.org/...",
      "license": "Public domain"
    }
  ]
}
```

publish.ts 는 게시 전 다음을 검증한다: `title` 존재, `category` 가 유효 key, `questions` 비어있지
않음, 각 문항 `answer` 존재 + (`image` 또는 `questionText`) 존재, 참조 이미지 파일 실재.

## 검토·공개

게시 후 출력되는 링크(`/profile/quizzes-made`) → 비공개 필터에서 새 퀴즈 확인 → 한 문항 풀어
이미지 렌더·채점 확인 → 기존 공개 토글로 PUBLIC 전환.

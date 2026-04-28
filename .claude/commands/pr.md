---
description: 현재 브랜치를 dev 로 PR 생성 (코드리뷰 자동 실행 안 함)
---

다음 단계를 순서대로 실행:

1. `git fetch origin dev` 로 base 갱신.
2. `git push -u origin HEAD` 로 현재 브랜치를 원격에 올린다 (이미 올라가 있으면 빠르게 통과).
3. `git log origin/dev..HEAD --oneline` 와 `git diff origin/dev...HEAD --stat` 로 변경 요약만 확인. 본문 작성에 더 필요하면 좁혀서 `git diff origin/dev...HEAD -- <path>`.
4. `gh pr create --base dev` 실행:
   - Title: `[type] 변경 내용` (type: feat | fix | refactor | style | docs | chore | remove)
   - Body: 무엇/왜를 bullet 로. Claude·AI attribution 금지.
5. 종료. 코드 리뷰 자동 실행하지 않음 (필요할 때 사용자가 `/code-review` 직접 호출).

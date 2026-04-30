---
description: lint/format 자동 수정 후 [type] message 형식으로 커밋 (push/test 없음)
---

다음 단계를 순서대로 실행:

1. `npm run lint:fix && npm run format` — 실패 시에만 출력 확인.
2. `git add .` 로 스테이징.
3. `git diff --staged --stat` 로 변경 파일/라인 수만 먼저 본다. 변경이 작아 보이면 그때만 `git diff --staged` (또는 특정 경로 `git diff --staged -- <path>`) 로 좁혀서 본다. 큰 변경에서 무조건 full diff 금지.
4. `TODO.md` 의 `## 진행 중` 섹션에서 이번 커밋에 해당하는 항목을 찾아 `## 완료` 로 이동하고 `[ ]` → `[x]` 처리. 매칭되는 항목이 없으면 건너뜀 (새 항목 추가 금지 — `/todo` 영역). 변경이 있으면 `git add TODO.md`.
5. `[type] message` 형식으로 커밋 (type: feat | fix | refactor | style | docs | chore | remove).
6. 푸시하지 않음. 테스트 자동 실행하지 않음 (필요 시 IDE/터미널에서 직접).

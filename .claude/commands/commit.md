---
description: lint/format 자동 수정 후 [type] message 형식으로 커밋 생성 (push 없음)
---

Run the following steps in order:
1. Run `npm run lint:fix` and `npm run format` to fix all lint and formatting issues
2. Run `git add -u` to re-stage any files changed by lint/format
3. Run `git diff --staged` to review what will be committed
4. Write a commit message following this format: `[type] message`
   - type: feat | fix | refactor | style | docs | chore | remove
   - message: concise description of the change
5. Commit with `git commit -m "..."`

Do NOT push. Stop after the commit is complete.

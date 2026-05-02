## Absolute Rules
- Wrap every component with `React.memo`
- New file in `components/` → always add `.stories.tsx`
- Emotion `css` prop only — no `styled` components (style files export `(theme) => css\`...\`` functions; JSX uses semantic tags with `css={fooStyle}`)

## Commands
`npm run dev` · `build` · `lint:fix` · `storybook`

## Domain
Korean quiz app — create & share image/text short-answer quizzes

## Agents
- Test writing → always use `unit-test-generator` agent

## Git Workflow
- Commit → always use `/commit` skill
- PR → always use `/pr` skill
- TODO 정리 → `/todo` skill (구현 금지, TODO.md 갱신 전용)

## References
Architecture: `docs/architecture.md`
Conventions: `docs/conventions.md`
Backend API (Swagger): `http://localhost:8080/swagger-ui/index.html#/`

## Absolute Rules
- Wrap every component with `React.memo`
- New file in `components/` → always add `.stories.tsx`
- Emotion `styled` only — no `css` prop

## Architecture
`components/`(shared UI) · `features/`(page UI) · `pages/`(routes)
Folder: `index.ts` · `Component.tsx` · `.style.ts` · `.type.ts`

## Commands
`npm run dev` · `build` · `lint:fix` · `storybook`

## Domain
Korean quiz app — create & share image/text short-answer quizzes

## Conventions
File order: type → body → `export default` → styles
Props: `ComponentNameProps` / Emotion styled: `$` prefix
Handlers: `on*` props → `handle*` functions
Commit: `[feat|fix|refactor|style|docs|chore|remove] message`

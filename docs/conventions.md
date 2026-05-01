# 개발 컨벤션

## 가장 중요

기본적으로 ESLint / Prettier 설정을 준수한다.

```bash
npm run lint       # ESLint 검사
npm run lint:fix   # ESLint 자동 수정
npm run format     # Prettier 포맷
```

---

## 명명 규칙

### 디렉토리

케밥 케이스로 작성한다.

```
components/quiz-card/
```

### 컴포넌트

대문자로 시작하는 파스칼 케이스로 작성한다.
함수 표현식(화살표 함수) 방식으로 작성한다.

```tsx
// X
function HomePage() { ... }

// O
const HomePage = () => { ... }
```

### Props

`type`을 우선 사용하고, 필요한 경우에만 `interface`를 사용한다.
Props 이름은 `컴포넌트명 + Props`로 작성한다.
컴포넌트 선언부에서 구조 분해 할당을 사용한다.

```tsx
// X
const HomePage = (props: HomePageProps) => {
  const { size } = props;
};

// O
type HomePageProps = {
  size: number;
};

const HomePage = ({ size }: HomePageProps) => { ... };
```

### 이벤트

- 이벤트 프로퍼티는 `on`으로 시작한다.
- 이벤트 핸들러는 `handle`로 시작하고 이벤트 종류를 마지막에 붙인다.

```tsx
type ButtonProps = {
  onClick: () => void;
};

const handleAddClick = () => { ... };
return <button onClick={handleAddClick} />;
```

### 상수 / 변수

- 상수는 대문자 스네이크 케이스로 작성한다.
- 변수는 카멜 케이스로 작성한다.

```ts
const MAX_COUNT = 50;
const userName = 'name';
```

---

## 시맨틱 HTML

의미에 맞는 HTML 태그를 적극 활용한다.
`div`, `span`은 의미 없는 레이아웃 컨테이너에만 사용한다.

| 상황 | 태그 |
|------|------|
| 사이드바 / 메뉴 | `nav` |
| 메인 콘텐츠 영역 | `main` |
| 섹션 제목 | `h1` ~ `h6` |
| 목록 | `ul` / `ol` |
| 목록 아이템 | `li` |
| 선택 가능한 목록 | `ul role="listbox"` |
| 선택 가능한 목록 아이템 | `li role="option" aria-selected` |
| 버튼 | `button` |
| 텍스트 입력 | `textarea` / `input` |

---

## 코드 스타일

### useState

- 원시 타입은 타입 추론을 활용한다.
- 커스텀 타입은 초기값을 명시한다.

```tsx
const [count, setCount] = useState(0);

const initialPosition = { x: 0, y: 0 };
const [position, setPosition] = useState<Position>(initialPosition);
```

### 중괄호

`if`, `for`, `while` 등 사용 시 반드시 중괄호를 포함한다.

```tsx
// X
if (isError) return null;

// O
if (isError) {
  return null;
}
```

### Optional Chaining

조건문 대신 Optional Chaining을 적극 활용한다.

```tsx
// X
if (onClick) {
  onClick();
}

// O
onClick?.();
```

---

## Emotion 스타일

`styled` 컴포넌트 대신 `css` literal 을 우선 사용한다.
사용처 JSX 에는 시맨틱 태그를 직접 작성하고 `css` prop 으로 스타일을 부착한다.

```tsx
// X — styled 컴포넌트
const Wrapper = styled.div`
  color: ${({ theme }) => theme.colors.fg.primary};
`;
<Wrapper>...</Wrapper>;

// O — css literal + 시맨틱 태그
import { css, type Theme } from '@emotion/react';

const wrapperStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.primary};
`;
<section css={wrapperStyle}>...</section>;
```

`vite.config.ts` 의 React 플러그인과 `tsconfig.app.json` 에 `jsxImportSource: '@emotion/react'` 가 설정되어 있어,
별도 `/** @jsxImportSource ... */` pragma 없이 모든 `.tsx` 에서 `css` prop 을 사용할 수 있다.

### 정적 / 동적 / props 기반 패턴

```tsx
// 정적 (테마·props 무관)
export const dividerStyle = css`
  height: 1px;
  background: #e4e4e7;
`;

// 테마 의존 — Emotion 이 함수에 자동으로 theme 주입
export const wrapperStyle = (theme: Theme) => css`
  background: ${theme.colors.bg.secondary};
`;
<section css={wrapperStyle}>;

// props + 테마 — 함수를 한 번 더 감싼다
export const fillStyle = (percent: number) => (theme: Theme) => css`
  width: ${percent}%;
  background: ${theme.colors.accent.primary};
`;
<div css={fillStyle(percent)}>;

// 조건부 — 배열로 합성
<button css={[buttonBaseStyle, isPrimary && primaryButtonStyle]} />;
```

### `text()` 헬퍼

`@/styles/text` 의 `text` 는 `({ size, weight, ... }) => ({ theme }) => css\`...\`` 형태이다.
style 함수 내부에서 다음과 같이 호출한다.

```tsx
export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;
```

### 금지 사항

- `@emotion/styled` 직접 import 및 `styled.X` / `styled(Component)` 사용 금지
- `$` prefix transient props · `shouldForwardProp` 사용 금지 (props 는 React 컴포넌트 레벨에서만 다루고 DOM 에 새지 않도록 함)

---

## 공통 컴포넌트 파일 구조

컴포넌트별 폴더를 만들고 파일을 분리한다.
분리된 파일 간 import는 alias 없이 상대경로를 사용한다.

```
components/button/
├── index.ts          # export
├── Button.tsx        # 컴포넌트 및 핵심 로직
├── Button.style.ts   # css literal 함수/상수 모음
└── Button.type.ts    # Props 등 타입
```

```ts
// X
import type { ButtonProps } from '@/components/button/Button.type';

// O
import type { ButtonProps } from './Button.type';
```

---

## 커밋 메시지

### 형식

```
[type] 변경 내용 요약
```

### 타입 정의

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `style` | 포맷, 세미콜론 등 코드 스타일 변경 |
| `docs` | 문서 추가/수정 |
| `chore` | 패키지 설치, 설정 파일 등 기타 |
| `remove` | 파일/코드 삭제 |

### 예시

```
[feat] 퀴즈 목록 카드 컴포넌트 추가
[fix] 정답 제출 시 빈 문자열 전송되는 버그 수정
[chore] ESLint / Prettier 설정 추가
[docs] CONVENTIONS.md 작성
[remove] 사용하지 않는 assets 삭제
```

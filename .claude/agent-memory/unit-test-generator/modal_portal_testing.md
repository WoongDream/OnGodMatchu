---
name: Modal & Portal Component Testing Patterns
description: Key patterns for testing createPortal modals — focus trap with fireEvent, overlay click with e.target===e.currentTarget, memo+mock state change limitation
type: feedback
---

## createPortal 테스트
- createPortal은 jsdom 에서 document.body 에 실제 삽입되므로 별도 mock 불필요
- `screen.getByRole('dialog')` 로 정상적으로 쿼리 가능

## focus trap Tab wrap 테스트
- `userEvent.tab()` 은 브라우저 기본 Tab 동작을 시뮬레이션하므로 Modal 의 `document.addEventListener('keydown', ...)` 핸들러와 충돌할 수 있다
- 올바른 방법: `fireEvent.keyDown(document, { key: 'Tab', shiftKey: false/true })` 로 document 에 직접 keydown 이벤트를 발생시킨다
- 이렇게 하면 Modal 의 핸들러가 정확히 트리거되고 `e.preventDefault()` + 수동 focus 이동이 동작한다
- focusable 요소 순서는 `dialog.querySelectorAll(FOCUSABLE_SELECTOR).filter(el => !el.hasAttribute('disabled'))` 로 구한다 (Modal 내부와 동일한 방식)

**Why:** `userEvent.tab()` 은 Tab keydown → 브라우저 포커스 이동 두 단계로 동작하는데, Modal 핸들러가 의도대로 preventDefault 하지 않으면 기본 Tab 동작이 일어나 wrap이 작동하지 않는다.

**How to apply:** focus trap을 가진 모달 컴포넌트 테스트 시 Tab wrap은 항상 `fireEvent.keyDown(document, ...)` 사용.

## overlay 클릭 테스트
- Modal 의 overlay 클릭 조건: `closeOnOverlay && e.target === e.currentTarget`
- `fireEvent.click(overlay, { target: overlay })` 로 `e.target === e.currentTarget` 조건을 충족시킨다

## React.memo + vi.mock module-level state 변경 한계
- `vi.mock` factory 에서 module-level `hookState` 변수를 참조할 때 `setHookState` 후 `rerender` 해도 React.memo 가 re-render 를 스킵하거나 useEffect dependency 변경이 트리거되지 않을 수 있다
- 해결책: 해당 상태를 **마운트 시점에 미리 세팅** 후 렌더 — 마운트 후 즉시 실행되는 useEffect 가 올바르게 트리거된다
- 예: `errorCode=INVALID_CURRENT_PASSWORD` → `setHookState(...)` 후 `renderWithTheme(...)` 호출

**Why:** mock된 훅은 실제 React state를 사용하지 않아서 React re-render를 자동으로 트리거하지 않는다.

---
name: ImageUpload Component Testing Patterns
description: Comprehensive test suite for file upload component with URL.createObjectURL, event handling, and lifecycle testing
type: reference
---

## Test File
`src/components/image-upload/ImageUpload.test.tsx` — 820 lines, 55 tests across 14 describe blocks

## Key Testing Patterns Used

### 1. File Upload Testing
- Mock `URL.createObjectURL` globally in `beforeEach`
- Mock returns consistent test URL: `'blob:mock-url'`
- Test both PNG, JPEG, WEBP file types
- Verify file object is passed unchanged to callback
- Clear input.value after upload to allow re-selection: `inputRef.current.value = ''`

### 2. Preview Image Rendering
- Conditional rendering based on `previewUrl` prop (null vs string)
- Test with data URLs: `data:image/png;base64,...`
- Test with blob URLs: `blob:...`
- Verify src attribute matches preview URL exactly

### 3. Remove Button
- Only renders when `previewUrl` exists
- Calls `onRemove()`, NOT `onChange()`
- Uses `e.preventDefault()` and `e.stopPropagation()` in handler
- Should not be rendered without preview

### 4. Label & Accessibility
- Optional label prop renders label element with unique ID
- Empty string label treated as falsy (not rendered)
- aria-labelledby set only when label exists
- Preview image has alt text: `"업로드 이미지 미리보기"`
- Remove button is keyboard accessible (Enter key)

### 5. Edge Cases
- Empty file names: `new File([], '')`
- Long file names: 300+ character strings
- Special characters in names: Korean, symbols, spaces
- Large files: Mock size property to 100MB
- Rapid upload/remove cycles

### 6. Integration Flows
Test full lifecycle: upload → preview → remove → upload again
- Verify placeholder visibility switches correctly
- Verify callbacks called in correct sequence
- Verify state consistency across re-renders

### 7. Prop Changes
- Update preview when previewUrl prop changes
- Update label when label prop changes
- Test labeled ↔ unlabeled transitions
- Test callback updates (onChange/onRemove)
- Verify only new callback fires, not old

## Query Selectors Used
```javascript
// File input (inside label)
const fileInput = screen.getByRole('button')
  .closest('label')
  ?.querySelector('input[type="file"]') as HTMLInputElement;

// Remove button
screen.getByRole('button', { name: '✕' })

// Preview image
screen.getByAltText('업로드 이미지 미리보기')

// Label
screen.getByText('Label text')
```

## Mock Strategy
- Mock `global.URL.createObjectURL` to return constant `'blob:mock-url'`
- Use `vi.clearAllMocks()` before each test
- Use `vi.restoreAllMocks()` after each test
- Create File objects with `new File(['content'], 'name.ext', { type: 'image/...' })`

## Testing React.memo
```javascript
expect(ImageUpload.$$typeof).toBe(Symbol.for('react.memo'));
expect(ImageUpload.displayName).toBe('ImageUpload');
```

## Known Issues
- Project has Vitest ESM/CJS compatibility issue (blocking test execution)
- Tests are TypeScript-valid but cannot run until resolved
- Workaround: Manual testing or fix @csstools/css-calc dependency

## File Structure
- Component: `/src/components/image-upload/ImageUpload.tsx`
- Types: `/src/components/image-upload/ImageUpload.type.ts`
- Styles: `/src/components/image-upload/ImageUpload.style.ts` (not read)
- Test: `/src/components/image-upload/ImageUpload.test.tsx`

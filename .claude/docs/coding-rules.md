# 코딩 규칙

## 파일 네이밍

| 타입 | 형식 | 예시 |
|------|------|------|
| 컴포넌트 | kebab-case.tsx | `date-picker.tsx` |
| 스타일 | 컴포넌트명.module.scss | `date-picker.module.scss` |
| 타입 | PascalCase | `DatePickerProps` |
| 함수 | camelCase | `handleDateChange` |
| 상수 | UPPER_SNAKE_CASE | `DEFAULT_FORMAT` |

---

## React 컴포넌트

### 기본 구조
```tsx
import styles from './component.module.scss';

interface ComponentProps {
  // Props 정의
}

export function Component({ ...props }: ComponentProps) {
  return (
    <div className={styles.container}>
      {/* 내용 */}
    </div>
  );
}
```

### Props 규칙
- 필수 props는 기본값 없이
- 선택적 props는 `?` 사용
- 콜백은 `on` 접두사: `onChange`, `onClick`
- boolean은 `is`, `has`, `show` 접두사

### Export
```typescript
// index.ts
export { Component } from './atom/component';
export type { ComponentProps } from './atom/component';
```

---

## SCSS 스타일

### CSS 변수 사용
```scss
.container {
  color: var(--color-text-body);
  background: var(--color-bg-block);
  padding: var(--spacing-4);
  border-radius: var(--radius-3);
}
```

### SCSS 함수
```scss
@use 'podo-ui/mixin' as *;

.card {
  padding: s(5);              // 간격 함수
  background: color(primary); // 색상 함수
  border-radius: r(3);        // 반경 함수
}
```

### BEM 네이밍
```scss
.datepicker {
  // Block

  &__header {
    // Element
  }

  &__body {
    // Element
  }

  &--active {
    // Modifier
  }

  &--disabled {
    // Modifier
  }
}
```

---

## Zod 검증

### Input 컴포넌트
```tsx
import { z } from 'zod';

const emailSchema = z.string().email('유효한 이메일을 입력하세요');

<Input
  value={email}
  validator={emailSchema}
  onChange={setEmail}
/>
```

### 커스텀 검증
```tsx
const passwordSchema = z
  .string()
  .min(8, '8자 이상')
  .regex(/[A-Z]/, '대문자 포함')
  .regex(/[0-9]/, '숫자 포함');
```

---

## 타입스크립트

### 인터페이스 vs 타입
```typescript
// 컴포넌트 Props → interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
}

// 유니온 타입 → type
type ButtonVariant = 'primary' | 'secondary' | 'danger';
```

### 제네릭 사용
```typescript
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}
```

---

## 금지 사항

1. **인라인 스타일 금지**: CSS Modules 사용
2. **any 타입 금지**: 명시적 타입 선언
3. **하드코딩 금지**: CSS 변수 또는 상수 사용
4. **console.log 금지**: 커밋 전 제거
5. **주석 처리 코드 금지**: 삭제하거나 구현

---

## 권장 사항

1. **작은 컴포넌트**: 100줄 이하 유지
2. **단일 책임**: 한 컴포넌트 = 한 역할
3. **Props 최소화**: 5개 이하 권장
4. **Early Return**: 조건부 렌더링 시 사용
5. **Memoization**: 무거운 연산에 useMemo/useCallback

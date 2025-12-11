# 코딩 컨벤션

## React 컴포넌트

### 파일 구조
```
react/atom/
├── 컴포넌트명.tsx           # 컴포넌트 파일
└── 컴포넌트명.module.scss   # 스타일 파일
```

### 컴포넌트 작성
```tsx
import styles from './컴포넌트명.module.scss';

interface 컴포넌트Props {
  // Props 정의
}

export function 컴포넌트({ ...props }: 컴포넌트Props) {
  return (
    <div className={styles.container}>
      {/* 내용 */}
    </div>
  );
}
```

### Export
`index.ts`에 컴포넌트 export 추가:
```typescript
export { 컴포넌트 } from './atom/컴포넌트명';
```

---

## SCSS 스타일

### CSS 변수 사용
```scss
.container {
  color: var(--color-text-body);
  background: var(--color-bg-block);
  padding: var(--spacing-4);
}
```

### BEM 네이밍
```scss
.datepicker {
  &__header { }
  &__body { }
  &--active { }
}
```

### Mixin 활용
```scss
@use 'podo-ui/mixin' as *;

.card {
  padding: s(5);
  background: color(primary-base);
  border-radius: r(3);
}
```

---

## Vanilla JS 컴포넌트

### CSS 변수 폴백
```css
background: var(--color-primary, #7c3aed);
```

### UMD 포맷
CDN 배포용으로 UMD 포맷 사용

---

## 파일 배치

| 타입 | 위치 |
|------|------|
| 단순 UI 요소 | `react/atom/` |
| 복합 컴포넌트 | `react/molecule/` |
| SCSS 변수 | `scss/_variables.scss` |
| SCSS 믹스인 | `scss/_mixin.scss` |
| Vanilla JS | `vanilla/` |
| CDN 파일 | `cdn/` |

---

## 문서 페이지

### 위치
```
src/app/components/{컴포넌트명}/page.tsx
```

### 구조
1. 제목 + 설명
2. 기본 사용법 + 코드
3. 라이브 예제
4. Props 테이블
5. 추가 기능별 섹션

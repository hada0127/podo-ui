# Podo UI

> SCSS Module 기반 디자인 시스템

[English](./README.md) | 한국어

## 설치

```bash
npm install podo-ui
```

## 빠른 시작

### Global SCSS 적용

```typescript
// main.tsx
import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // Vite 사용 시
```

### SCSS Module에서 사용

```scss
// component.module.scss
@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);
  margin: s(4);
  border-radius: r(2);
}
```

### React 컴포넌트

```tsx
// Named imports로 개별 컴포넌트 가져오기
import { Input, Textarea, Editor, EditorView, Field, Pagination } from 'podo-ui';

// 또는 개별 컴포넌트 직접 import (레거시 방식)
import Input from 'podo-ui/react/atom/input';
import Field from 'podo-ui/react/molecule/field';
```

## 주요 기능

- CSS 클래스 기반 디자인 시스템
- 반응형 그리드 시스템 (PC 12, Tablet 6, Mobile 4)
- 색상 시스템 및 다크 모드 지원
- React 컴포넌트 제공 (Input, Textarea, Editor, Field)

## 문서

상세한 사용법은 [공식 설명서](https://podoui.com)를 참고하세요.

## 링크

- [공식 설명서](https://podoui.com)
- [GitHub 저장소](https://github.com/hada0127/podo-ui)
- [이슈 제보](https://github.com/hada0127/podo-ui/issues)

## 라이선스

MIT

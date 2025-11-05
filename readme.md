# Podo UI

> SCSS Module 기반 디자인 시스템

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
// Atomic 컴포넌트
import Input from 'podo-ui/react/atom/input';
import Textarea from 'podo-ui/react/atom/textarea';
import Editor from 'podo-ui/react/atom/editor';
import EditorView from 'podo-ui/react/atom/editor-view';

// Molecule 컴포넌트
import Field from 'podo-ui/react/molecule/field';
import Pagination from 'podo-ui/react/molecule/pagination';
import Toast from 'podo-ui/react/molecule/toast';
import ToastProvider from 'podo-ui/react/molecule/toast-provider';

// SCSS 모듈도 함께 import (Next.js에서)
import 'podo-ui/dist/react/atom/input.module.scss';
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

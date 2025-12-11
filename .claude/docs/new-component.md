# 새 컴포넌트 추가 가이드

## 체크리스트

- [ ] 1. 컴포넌트 파일 생성
- [ ] 2. 스타일 파일 생성
- [ ] 3. Export 추가
- [ ] 4. 문서 페이지 생성
- [ ] 5. 번역 파일 추가
- [ ] 6. 네비게이션 업데이트
- [ ] 7. AI 레퍼런스 JSON 추가

---

## 1. 컴포넌트 파일 생성

### 위치 선택
| 타입 | 위치 | 기준 |
|------|------|------|
| Atom | `react/atom/` | 독립적, 단순 UI |
| Molecule | `react/molecule/` | 조합, 복잡한 상태 |

### 템플릿
```tsx
// react/atom/my-component.tsx
import { forwardRef } from 'react';
import styles from './my-component.module.scss';

export interface MyComponentProps {
  /** 필수 prop 설명 */
  value: string;
  /** 선택적 prop 설명 */
  disabled?: boolean;
  /** 콜백 설명 */
  onChange?: (value: string) => void;
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ value, disabled = false, onChange }, ref) => {
    return (
      <div
        ref={ref}
        className={styles.container}
        data-disabled={disabled || undefined}
      >
        {value}
      </div>
    );
  }
);

MyComponent.displayName = 'MyComponent';
```

---

## 2. 스타일 파일 생성

```scss
// react/atom/my-component.module.scss
@use '../../mixin' as *;

.container {
  display: flex;
  padding: s(3);
  background: color(bg-block);
  border: 1px solid color(border);
  border-radius: r(2);

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

---

## 3. Export 추가

```typescript
// index.ts
export { MyComponent } from './atom/my-component';
export type { MyComponentProps } from './atom/my-component';
```

---

## 4. 문서 페이지 생성

```tsx
// src/app/components/my-component/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { MyComponent } from 'podo-ui';

export default function MyComponentPage() {
  const t = useTranslations('myComponent');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <MyComponent value="예시" />
      </section>
    </div>
  );
}
```

---

## 5. 번역 파일 추가

```json
// i18n/locales/ko/myComponent.json
{
  "title": "MyComponent",
  "description": "컴포넌트 설명",
  "basicUsage": {
    "title": "기본 사용법",
    "description": "기본 예시입니다."
  }
}
```

```json
// i18n/locales/en/myComponent.json
{
  "title": "MyComponent",
  "description": "Component description",
  "basicUsage": {
    "title": "Basic Usage",
    "description": "Basic example."
  }
}
```

---

## 6. 네비게이션 업데이트

```tsx
// src/components/Navigation.tsx
const components = [
  // ... 기존 항목
  { name: 'MyComponent', href: '/components/my-component' },
];
```

---

## 참고 파일

| 참고 대상 | 파일 경로 |
|-----------|-----------|
| 단순 컴포넌트 | `react/atom/input.tsx` |
| 복잡한 컴포넌트 | `react/molecule/datepicker.tsx` |
| 스타일 | `react/atom/input.module.scss` |
| 문서 | `src/app/components/input/page.tsx` |

---

## 7. AI 레퍼런스 JSON 추가

새 컴포넌트를 AI가 활용할 수 있도록 JSON 레퍼런스를 추가합니다.

### 7.1 컴포넌트 JSON 생성

```json
// public/ai/components/my-component.json
{
  "name": "MyComponent",
  "category": "atom",
  "description": "컴포넌트 용도 설명",
  "import": {
    "react": "import { MyComponent } from 'podo-ui'",
    "scss": "@use 'podo-ui/scss/atom/my-component'"
  },
  "props": [
    { "name": "value", "type": "string", "required": true, "description": "표시할 값" },
    { "name": "disabled", "type": "boolean", "required": false, "default": "false", "description": "비활성화 여부" },
    { "name": "onChange", "type": "(value: string) => void", "required": false, "description": "값 변경 콜백" }
  ],
  "cssClasses": [
    { "class": "my-component", "description": "기본 스타일" }
  ],
  "examples": [
    {
      "title": "Basic",
      "code": "<MyComponent value=\"hello\" />"
    }
  ],
  "related": ["input", "field"]
}
```

### 7.2 ai.json 인덱스에 추가

```json
// public/ai.json의 modules.components에 추가
{
  "modules": {
    "components": {
      "myComponent": "/ai/components/my-component.json"
    }
  }
}
```

---

## Vanilla JS 버전 (선택)

CDN 지원이 필요한 경우:

1. `vanilla/{component}.js` 생성
2. `vanilla/{component}.css` 생성
3. `npm run build:cdn-js` 실행
4. 문서에 CDN 사용법 추가

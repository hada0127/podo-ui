# DocTabs 컴포넌트 가이드

## 개요
DocTabs는 문서 사이트의 예제 페이지에서 SCSS / React / CDN 탭을 표시하기 위한 전용 컴포넌트입니다.

## 파일 위치
- 컴포넌트: `src/components/DocTabs.tsx`
- 스타일: `src/components/DocTabs.module.scss`

## 사용법

### Import
```tsx
import DocTabs from '../../../components/DocTabs';
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `DocTabItem[]` | required | 표시할 탭 배열 |
| `defaultTab` | `'scss' \| 'react' \| 'cdn'` | 첫 번째 탭 | 기본 활성 탭 |

### DocTabItem 인터페이스
```tsx
interface DocTabItem {
  key: 'scss' | 'react' | 'cdn';
  label: string;
  content: React.ReactNode;
}
```

### 기본 예제
```tsx
<DocTabs
  tabs={[
    {
      key: 'scss',
      label: 'SCSS',
      content: <ScssContent />,
    },
    {
      key: 'react',
      label: 'React',
      content: <ReactContent />,
    },
    {
      key: 'cdn',
      label: 'CDN',
      content: <CdnContent />,
    },
  ]}
  defaultTab="scss"
/>
```

## 특징
1. **URL 해시 동기화**: `#scss`, `#react`, `#cdn`으로 직접 링크 가능
2. **콘텐츠가 있는 탭만 표시**: tabs 배열에 전달된 탭만 렌더링
3. **podo-ui 스타일 사용**: 기존 `ul.tabs` CSS 클래스 활용

## 탭 내부 구조 가이드

### SCSS 탭 구조
```tsx
<>
  <section>
    <h2>Import</h2>
    <CodeBlock language="scss" code={`@use 'podo-ui/scss/...';`} />
  </section>

  <section>
    <h2>기본 사용법</h2>
    <CodeBlock title="HTML" language="html" code={`...`} />
    <div className={styles.demo}>...</div>
  </section>

  <section>
    <h2>변형/옵션</h2>
    <CodeBlock ... />
    <div className={styles.demo}>...</div>
  </section>

  <section>
    <h2>커스텀 스타일링</h2>
    <CodeBlock title="SCSS" language="scss" code={`...`} />
  </section>
</>
```

### React 탭 구조
```tsx
<>
  <section>
    <h2>Import</h2>
    <CodeBlock language="tsx" code={`import { Component } from 'podo-ui';`} />
  </section>

  <section>
    <h2>Props</h2>
    <table className={styles.propsTable}>...</table>
  </section>

  <section>
    <h2>기본 사용법</h2>
    <CodeBlock title="React" language="tsx" code={`...`} />
    <div className={styles.demo}>
      <Component ... />
    </div>
  </section>

  <section>
    <h2>고급 예제</h2>
    <CodeBlock ... />
    <div className={styles.demo}>...</div>
  </section>
</>
```

### CDN 탭 구조
```tsx
<>
  <section>
    <h2>CSS/JS 로드</h2>
    <CodeBlock title="HTML" language="html" code={`
<link rel="stylesheet" href="https://unpkg.com/podo-ui/dist/component.min.css">
<script src="https://unpkg.com/podo-ui/dist/component.min.js"></script>
    `} />
  </section>

  <section>
    <h2>HTML 사용법</h2>
    <CodeBlock title="HTML" language="html" code={`...`} />
    <div className={styles.demo}>...</div>
  </section>

  <section>
    <h2>JavaScript API</h2>
    <CodeBlock title="JavaScript" language="javascript" code={`...`} />
  </section>
</>
```

## 관련 문서
- [예제 페이지 구조 가이드](./page-structure.md)
- [CodeBlock 컴포넌트](../components/CodeBlock.tsx)

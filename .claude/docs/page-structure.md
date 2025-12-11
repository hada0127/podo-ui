# 예제 페이지 구조 가이드

## 개요
podo-ui 문서 사이트의 모든 예제 페이지는 일관된 구조를 따릅니다.

## 페이지 기본 구조

```
+Page.tsx
├── 헤더 섹션
│   ├── h1: 컴포넌트명
│   └── p: 1줄 설명
├── 개요 섹션 (선택)
│   └── 주요 특징/사용 시나리오
└── DocTabs
    ├── SCSS 탭 (HTML + CSS 클래스)
    ├── React 탭 (podo-ui React 컴포넌트)
    └── CDN 탭 (Vanilla JS)
```

## 템플릿 코드

```tsx
import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function ComponentPage() {
  const { t } = useTranslation('componentName');

  return (
    <>
      {/* 헤더 섹션 */}
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      {/* DocTabs - 콘텐츠가 있는 탭만 포함 */}
      <DocTabs
        tabs={[
          { key: 'scss', label: 'SCSS', content: <ScssContent t={t} /> },
          { key: 'react', label: 'React', content: <ReactContent t={t} /> },
          // CDN이 있는 경우만 추가
          // { key: 'cdn', label: 'CDN', content: <CdnContent t={t} /> },
        ]}
        defaultTab="scss"
      />
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/...';`} />
      </section>

      <section>
        <h2>기본 사용법</h2>
        <CodeBlock title="HTML" language="html" code={`...`} />
        <div className={styles.demo}>
          <div className={styles.demoTitle}>Demo</div>
          {/* 실제 HTML 데모 */}
        </div>
      </section>

      {/* 추가 섹션들 */}
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Component } from 'podo-ui';`} />
      </section>

      <section>
        <h2>Props</h2>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {/* Props 행들 */}
          </tbody>
        </table>
      </section>

      <section>
        <h2>기본 사용법</h2>
        <CodeBlock title="React" language="tsx" code={`...`} />
        <div className={styles.demo}>
          <div className={styles.demoTitle}>Demo</div>
          {/* React 컴포넌트 데모 */}
        </div>
      </section>
    </>
  );
}
```

## 탭 포함 기준

| 컴포넌트 유형 | SCSS | React | CDN |
|--------------|------|-------|-----|
| Button, Input 등 기본 컴포넌트 | ✅ | ✅ | - |
| DatePicker, Toast 등 복잡한 컴포넌트 | ✅ | ✅ | ✅ |
| Foundation (Colors, Spacing 등) | ✅ | - | - |
| Utilities (Border, Display 등) | ✅ | - | - |
| Getting Started 페이지 | 별도 구조 | - | - |

## 스타일 가이드

### 필수 스타일 클래스
```scss
// Page.module.scss
@use '../../../../mixin' as *;
@use '../../common-page' as *;

.section {
  @include section-responsive;
}

.demo {
  margin-top: s(5);
  padding: s(5);
  background: color(bg-reverse-wb);
  border: 1px solid color(default-outline);
  border-radius: r(4);
}

.demoTitle {
  @include p3-semibold;
  margin-bottom: s(4);
  color: color(default-deep-base);
}

.propsTable {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: s(4);

  th, td {
    @include p3;
    padding: s(3) s(4);
    text-align: left;
    border-bottom: 1px solid color(border);
  }

  th {
    @include p3-semibold;
    background: color(bg-block);
  }

  td code {
    @include p4;
    background: color(default-fill);
    padding: s(1) s(2);
    border-radius: r(2);
  }
}
```

## 관련 문서
- [DocTabs 컴포넌트 가이드](./doc-tabs.md)
- [새 컴포넌트 추가 가이드](./new-component.md)

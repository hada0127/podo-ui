'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './page.module.scss';

export default function Usage() {
  const t = useTranslations('usage');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>CSS 클래스 사용하기</h2>
        <p>
          Podo UI는 CSS 우선 접근 방식을 사용합니다. 대부분의 스타일은 HTML 클래스를 통해 적용됩니다.
        </p>

        <h3>버튼 예제</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <button className="primary">Primary Button</button>
            <button className="info">Info Button</button>
            <button className="danger">Danger Button</button>
          </div>
          <div className={styles.codeBlock}>
            <pre><code>{`<button class="primary">Primary Button</button>
<button class="info">Info Button</button>
<button class="danger">Danger Button</button>`}</code></pre>
          </div>
        </div>

        <h3>버튼 변형</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <button className="primary-fill">Primary Fill</button>
            <button className="primary-border">Primary Border</button>
            <button className="primary-text">Primary Text</button>
          </div>
          <div className={styles.codeBlock}>
            <pre><code>{`<button class="primary-fill">Primary Fill</button>
<button class="primary-border">Primary Border</button>
<button class="primary-text">Primary Text</button>`}</code></pre>
          </div>
        </div>

        <h3>Input 예제</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <input type="text" placeholder="기본 Input" />
            <input type="text" className="success" placeholder="Success Input" />
            <input type="text" className="danger" placeholder="Danger Input" />
          </div>
          <div className={styles.codeBlock}>
            <pre><code>{`<input type="text" placeholder="기본 Input" />
<input type="text" class="success" placeholder="Success Input" />
<input type="text" class="danger" placeholder="Danger Input" />`}</code></pre>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS 함수와 믹스인</h2>
        <p>
          SCSS 모듈에서 Podo UI의 디자인 토큰을 사용하여 커스텀 스타일을 작성할 수 있습니다.
        </p>

        <h3>컬러 함수</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  background: color(primary-base);      // Primary 색상
  color: color(primary-reverse);        // Primary 반전 색상
  border: 1px solid color(primary-outline);

  &:hover {
    background: color(primary-hover);   // Primary hover 색상
  }
}`}</code></pre>
        </div>

        <h3>간격 함수 (Spacing)</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  margin: s(4);          // 12px
  padding: s(6);         // 20px
  gap: s(3);            // 8px

  // 0-13까지 사용 가능
  margin-top: s(8);     // 28px
}`}</code></pre>
        </div>

        <h3>Border Radius 함수</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  border-radius: r(2);   // 4px
  border-radius: r(3);   // 8px
  border-radius: r(4);   // 12px
}`}</code></pre>
        </div>

        <h3>타이포그래피 믹스인</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.title {
  @include display1;     // 가장 큰 제목
}

.heading {
  @include display4;     // 중간 크기 제목
}

.body {
  @include p2;          // 본문 텍스트
}

.caption {
  @include p5;          // 작은 텍스트
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React 컴포넌트</h2>
        <p>
          일부 복잡한 컴포넌트는 React 컴포넌트로 제공됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>일반 React</div>
          <pre><code>{`import { Input, Textarea, Editor, Field } from 'podo-ui';

function MyForm() {
  return (
    <Field label="이름" required>
      <Input placeholder="이름을 입력하세요" />
    </Field>
  );
}`}</code></pre>
        </div>

      </section>

      <section className={styles.section}>
        <h2>테마 (Light/Dark Mode)</h2>
        <p>
          Podo UI는 라이트 모드와 다크 모드를 자동으로 지원합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>테마 설정</div>
          <pre><code>{`// 라이트 모드로 설정
document.documentElement.setAttribute('data-color-mode', 'light');

// 다크 모드로 설정
document.documentElement.setAttribute('data-color-mode', 'dark');

// 시스템 설정 따르기
document.documentElement.setAttribute('data-color-mode', '');`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>참고:</strong> 모든 색상은 <code>color()</code> 함수를 사용하면 자동으로 테마에 대응됩니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>다음 단계</h2>
        <p>더 자세한 내용은 각 섹션의 문서를 참고하세요:</p>

        <div className={styles.linkGrid}>
          <Link href="/foundation/colors" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-ellipse"></i>
            </div>
            <div>
              <h3>컬러 시스템</h3>
              <p>8가지 시맨틱 컬러와 변형</p>
            </div>
            <i className="icon-arrow-right"></i>
          </Link>

          <Link href="/foundation/typography" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-text"></i>
            </div>
            <div>
              <h3>타이포그래피</h3>
              <p>폰트 스타일과 믹스인</p>
            </div>
            <i className="icon-arrow-right"></i>
          </Link>

          <Link href="/foundation/icons" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-star"></i>
            </div>
            <div>
              <h3>아이콘</h3>
              <p>119개 아이콘 폰트</p>
            </div>
            <i className="icon-arrow-right"></i>
          </Link>

          <Link href="/components/button" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-layers"></i>
            </div>
            <div>
              <h3>컴포넌트</h3>
              <p>UI 컴포넌트 둘러보기</p>
            </div>
            <i className="icon-arrow-right"></i>
          </Link>
        </div>
      </section>
    </>
  );
}

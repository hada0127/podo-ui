import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Installation() {
  return (
    <>
      <PageHeader
        title="설치"
        description="Podo UI를 프로젝트에 설치하고 설정하는 방법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>NPM 설치</h2>
        <p>npm, yarn, 또는 pnpm을 사용하여 Podo UI를 설치할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <pre><code>npm install podo-ui</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <pre><code>yarn add podo-ui</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <pre><code>pnpm add podo-ui</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>기본 설정</h2>

        <h3>1. Global SCSS 적용</h3>
        <p>애플리케이션의 진입점에서 전역 스타일을 import합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>main.tsx 또는 App.tsx</div>
          <pre><code>{`import 'podo-ui/global.scss';`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>참고:</strong> global.scss는 리셋, 컬러, 레이아웃, 타이포그래피, 아이콘, 버튼, 폼 등 모든 기본 스타일을 포함합니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>2. Vite 프로젝트 추가 설정</h3>

        <div className={styles.warning}>
          <i className="icon-warning"></i>
          <div>
            <strong>중요:</strong> Vite를 사용하는 경우 폰트 경로 재정의가 필요합니다!
          </div>
        </div>

        <p>Vite에서는 node_modules 내의 상대 경로를 올바르게 처리하지 못할 수 있습니다. vite-fonts.scss를 추가로 import하세요:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>main.tsx (Vite)</div>
          <pre><code>{`import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // Vite용 폰트 경로 재정의`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>참고:</strong> Next.js나 Create React App 등 다른 번들러는 vite-fonts.scss 없이 사용 가능합니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>3. SCSS Module에서 변수/함수/믹스인 사용</h3>
        <p>컴포넌트의 SCSS 모듈에서 Podo UI의 함수와 믹스인을 사용하려면 다음과 같이 import합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);        // 컬러 함수
  margin: s(4);                 // 간격 함수 (12px)
  border-radius: r(2);          // 반경 함수
  @include p2;                  // 타이포그래피 믹스인
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React 컴포넌트 사용</h2>
        <p>Podo UI는 일부 React 컴포넌트를 제공합니다. 다음과 같이 import하여 사용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>일반 React 프로젝트</div>
          <pre><code>{`import { Input, Textarea, Editor, Field } from 'podo-ui/react';`}</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>Next.js 프로젝트</div>
          <pre><code>{`import { Input, Textarea, Editor, Field } from 'podo-ui/next';`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>참고:</strong> Next.js용 export는 'use client' 지시어가 포함되어 있으며, Editor 컴포넌트는 SSR이 비활성화되어 있습니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>다음 단계</h2>
        <p>설치가 완료되었습니다! 이제 다음 문서를 참고하여 Podo UI를 사용해보세요:</p>

        <div className={styles.linkGrid}>
          <a href="/getting-started/usage" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-file"></i>
            </div>
            <div>
              <h4>사용법</h4>
              <p>기본 사용법과 예제</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/foundation/colors" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-ellipse"></i>
            </div>
            <div>
              <h4>컬러 시스템</h4>
              <p>테마와 컬러 사용법</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/components/button" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-layers"></i>
            </div>
            <div>
              <h4>컴포넌트</h4>
              <p>UI 컴포넌트 둘러보기</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>
        </div>
      </section>
    </>
  );
}

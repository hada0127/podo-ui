'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Border() {
  const t = useTranslations('border');
  return (
    <>
      <section className={styles.section}>
        <h1>테두리</h1>
        <p>Podo UI의 Border 유틸리티 클래스 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML 요소에 테두리 관련 클래스를 추가하여 다양한 테두리 스타일을 적용할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 테두리 -->
<div class="border">테두리</div>

<!-- 방향별 테두리 -->
<div class="border-top">상단 테두리</div>
<div class="border-right">우측 테두리</div>
<div class="border-bottom">하단 테두리</div>
<div class="border-left">좌측 테두리</div>

<!-- 테두리 없음 -->
<div class="border-none">테두리 없음</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.borderGrid}>
            <div className={styles.borderBox} style={{ border: '1px solid' }}>
              전체 테두리
            </div>
            <div className={styles.borderBox} style={{ borderTop: '1px solid' }}>
              상단 테두리
            </div>
            <div className={styles.borderBox} style={{ borderRight: '1px solid' }}>
              우측 테두리
            </div>
            <div className={styles.borderBox} style={{ borderBottom: '1px solid' }}>
              하단 테두리
            </div>
            <div className={styles.borderBox} style={{ borderLeft: '1px solid' }}>
              좌측 테두리
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 테두리를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.card {
  border: 1px solid color(border);
  border-radius: r(3);
  padding: s(5);
}

.divider {
  border-bottom: 1px solid color(border);
  margin: s(5) 0;
}

.customBorder {
  border: 2px solid color(primary);
  border-radius: r(4);
}

// 조건부 테두리
.item {
  &:not(:last-child) {
    border-bottom: 1px solid color(border);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>테두리 색상</h2>
        <p>Podo UI의 시맨틱 컬러를 테두리에 사용할 수 있습니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.borderGrid}>
            <div className={styles.borderBox} style={{ border: '2px solid var(--primary)' }}>
              Primary
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--success)' }}>
              Success
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--warning)' }}>
              Warning
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--danger)' }}>
              Danger
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.primaryBorder {
  border: 2px solid color(primary);
}

.successBorder {
  border: 2px solid color(success);
}

.warningBorder {
  border: 2px solid color(warning);
}

.dangerBorder {
  border: 2px solid color(danger);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 예제</h2>
        <p>테두리를 활용한 카드 컴포넌트 예제:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.cardExample}>
            <div className={styles.card}>
              <h2>기본 카드</h2>
              <p>기본 테두리 스타일을 사용한 카드입니다.</p>
            </div>
            <div className={styles.card} style={{ borderColor: 'var(--primary)' }}>
              <h2>Primary 카드</h2>
              <p>Primary 색상의 테두리를 사용한 카드입니다.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

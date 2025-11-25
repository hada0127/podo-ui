'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Border() {
  const t = useTranslations('border');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>
          {t('basicUsage.description')}
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
          <div className={styles.demoTitle}>{t('basicUsage.demoTitle')}</div>
          <div className={styles.borderGrid}>
            <div className={styles.borderBox} style={{ border: '1px solid' }}>
              {t('basicUsage.examples.all')}
            </div>
            <div className={styles.borderBox} style={{ borderTop: '1px solid' }}>
              {t('basicUsage.examples.top')}
            </div>
            <div className={styles.borderBox} style={{ borderRight: '1px solid' }}>
              {t('basicUsage.examples.right')}
            </div>
            <div className={styles.borderBox} style={{ borderBottom: '1px solid' }}>
              {t('basicUsage.examples.bottom')}
            </div>
            <div className={styles.borderBox} style={{ borderLeft: '1px solid' }}>
              {t('basicUsage.examples.left')}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scssUsage.title')}</h2>
        <p>{t('scssUsage.description')}</p>

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
        <h2>{t('colors.title')}</h2>
        <p>{t('colors.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('colors.demoTitle')}</div>
          <div className={styles.borderGrid}>
            <div className={styles.borderBox} style={{ border: '2px solid var(--color-primary)' }}>
              Primary
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--color-success)' }}>
              Success
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--color-warning)' }}>
              Warning
            </div>
            <div className={styles.borderBox} style={{ border: '2px solid var(--color-danger)' }}>
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
        <h2>{t('realWorld.title')}</h2>
        <p>{t('realWorld.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('realWorld.demoTitle')}</div>
          <div className={styles.cardExample}>
            <div className={styles.card}>
              <h2>{t('realWorld.cards.basic.title')}</h2>
              <p>{t('realWorld.cards.basic.description')}</p>
            </div>
            <div className={styles.card} style={{ borderColor: 'var(--color-primary)' }}>
              <h2>{t('realWorld.cards.primary.title')}</h2>
              <p>{t('realWorld.cards.primary.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

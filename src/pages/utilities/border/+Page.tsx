import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Border() {
  const { t } = useTranslation('border');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <DocTabs
        tabs={[
          {
            key: 'scss',
            label: 'SCSS',
            content: <ScssContent t={t} />,
          },
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
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>
          {t('basicUsage.description')}
        </p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ` + t('code.defaultBorder') + ` -->
<div class="border">Border</div>

<!-- ` + t('code.directionalBorder') + ` -->
<div class="border-top">` + t('code.topBorder') + `</div>
<div class="border-right">` + t('code.rightBorder') + `</div>
<div class="border-bottom">` + t('code.bottomBorder') + `</div>
<div class="border-left">` + t('code.leftBorder') + `</div>

<!-- ` + t('code.noBorder') + ` -->
<div class="border-none">` + t('code.noBorder') + `</div>`}
        />

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

      <section>
        <h2>{t('scssUsage.title')}</h2>
        <p>{t('scssUsage.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

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

// ` + t('code.conditionalBorder') + `
.item {
  &:not(:last-child) {
    border-bottom: 1px solid color(border);
  }
}`}
        />
      </section>

      <section>
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

        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

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
}`}
        />
      </section>

      <section>
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

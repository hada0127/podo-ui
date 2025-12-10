import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Spacing() {
  const { t } = useTranslation('spacing');

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
  const spacingValues = [
    { key: 0, value: '0' },
    { key: 1, value: '2px' },
    { key: 2, value: '4px' },
    { key: 3, value: '8px' },
    { key: 4, value: '12px' },
    { key: 5, value: '16px' },
    { key: 6, value: '24px' },
    { key: 7, value: '32px' },
    { key: 8, value: '40px' },
    { key: 9, value: '48px' },
    { key: 10, value: '64px' },
    { key: 11, value: '80px' },
    { key: 12, value: '96px' },
    { key: 13, value: '160px' },
  ];

  const radiusValues = [
    { key: 0, value: '0' },
    { key: 1, value: '2px' },
    { key: 2, value: '4px' },
    { key: 3, value: '6px' },
    { key: 4, value: '8px' },
    { key: 5, value: '12px' },
    { key: 6, value: '20px' },
    { key: 'full', value: '9999px' },
  ];

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('sections.spacingSystem.title')}</h2>
        <p>{t('sections.spacingSystem.description')}</p>
      </section>

      <section>
        <h2>{t('sections.spacingValues.title')}</h2>
        <p>{t('sections.spacingValues.description')}</p>

        <div className={styles.spacingGrid}>
          {spacingValues.map((spacing) => (
            <div key={spacing.key} className={styles.spacingCard}>
              <div className={styles.spacingInfo}>
                <div className={styles.spacingKey}>s({spacing.key})</div>
                <div className={styles.spacingValue}>{spacing.value}</div>
              </div>
              <div className={styles.spacingPreview}>
                <div
                  className={styles.spacingBar}
                  style={{ width: spacing.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.scssUsage.title')}</h2>
        <p>{t('sections.scssUsage.description')}</p>

        <CodeBlock
          title={t('sections.scssUsage.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.container {
  // ` + t('code.margin') + `
  margin: s(4);           // 12px
  margin-top: s(5);       // 16px
  margin-bottom: s(6);    // 24px

  // ` + t('code.padding') + `
  padding: s(3) s(5);     // 8px 16px
  padding-left: s(4);     // 12px

  // ` + t('code.gap') + `
  gap: s(3);              // 8px

  // ` + t('code.multipleProps') + `
  border-width: s(1);     // 2px
  min-height: s(10);      // 64px
}`}
        />
      </section>

      <section>
        <h2>{t('sections.cssClasses.title')}</h2>
        <p>{t('sections.cssClasses.description')}</p>

        <CodeBlock
          title={t('sections.cssClasses.codeHeader')}
          language="html"
          code={`<!-- ` + t('code.margin') + ` -->
<div class="m-4">Margin 12px</div>
<div class="m-t-5">Margin Top 16px</div>
<div class="m-b-6">Margin Bottom 24px</div>
<div class="m-l-4">Margin Left 12px</div>
<div class="m-r-4">Margin Right 12px</div>

<!-- ` + t('code.padding') + ` -->
<div class="p-4">Padding 12px</div>
<div class="p-t-5">Padding Top 16px</div>
<div class="p-b-6">Padding Bottom 24px</div>
<div class="p-l-4">Padding Left 12px</div>
<div class="p-r-4">Padding Right 12px</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.cssClasses.demoTitle')}</div>
          <div className={styles.spacingDemo}>
            <div className="p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              Padding 12px (p-4)
            </div>
            <div className="p-6" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              Padding 24px (p-6)
            </div>
            <div className="p-8" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              Padding 40px (p-8)
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sections.borderRadius.title')}</h2>
        <p>{t('sections.borderRadius.description')}</p>

        <div className={styles.radiusGrid}>
          {radiusValues.map((radius) => (
            <div key={radius.key} className={styles.radiusCard}>
              <div className={styles.radiusInfo}>
                <div className={styles.radiusKey}>r({radius.key})</div>
                <div className={styles.radiusValue}>{radius.value}</div>
              </div>
              <div className={styles.radiusPreview}>
                <div
                  className={styles.radiusBox}
                  style={{ borderRadius: radius.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.borderRadiusScss.title')}</h2>

        <CodeBlock
          title={t('sections.borderRadiusScss.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.card {
  border-radius: r(4);    // 8px
}

.button {
  border-radius: r(2);    // 4px
}

.avatar {
  border-radius: r(full); // 9999px (원형)
}

.input {
  border-radius: r(3);    // 6px
}

.modal {
  border-radius: r(5);    // 12px
}`}
        />
      </section>

      <section>
        <h2>{t('sections.borderRadiusClasses.title')}</h2>

        <CodeBlock
          title={t('sections.borderRadiusClasses.codeHeader')}
          language="html"
          code={`<div class="r-0">No Radius</div>
<div class="r-2">Radius 4px</div>
<div class="r-4">Radius 8px</div>
<div class="r-full">Radius Full (${t('code.circular')})</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.borderRadiusClasses.demoTitle')}</div>
          <div className={styles.radiusDemo}>
            <div className="r-0 p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              r-0
            </div>
            <div className="r-2 p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              r-2 (4px)
            </div>
            <div className="r-4 p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              r-4 (8px)
            </div>
            <div className="r-6 p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed' }}>
              r-6 (20px)
            </div>
            <div className="r-full p-4" style={{ background: '#f3e8ff', border: '1px solid #7c3aed', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              r-full
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sections.practicalExample.title')}</h2>
        <p>{t('sections.practicalExample.description')}</p>

        <CodeBlock
          title={t('sections.practicalExample.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.card {
  padding: s(6);
  margin-bottom: s(5);
  border-radius: r(4);
  background: color(bg-modal);
  border: 1px solid color(default-outline);

  .cardHeader {
    margin-bottom: s(4);
    padding-bottom: s(3);
    border-bottom: 1px solid color(default-outline);
  }

  .cardTitle {
    @include display6;
    margin-bottom: s(2);
  }

  .cardContent {
    @include p3;
    line-height: 1.6;
  }

  .cardFooter {
    margin-top: s(5);
    padding-top: s(4);
    border-top: 1px solid color(default-outline);
    display: flex;
    gap: s(3);
  }
}`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.practicalExample.demoTitle')}</div>
          <div className={styles.cardExample}>
            <div className={styles.cardHeader}>
              <h2>{t('sections.practicalExample.cardTitle')}</h2>
            </div>
            <div className={styles.cardContent}>
              {t('sections.practicalExample.cardContent')}
            </div>
            <div className={styles.cardFooter}>
              <button className="primary">{t('sections.practicalExample.confirm')}</button>
              <button className="default-deep">{t('sections.practicalExample.cancel')}</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('sections.note.title')}</strong> {t('sections.note.description')}
          </div>
        </div>
      </section>
    </>
  );
}

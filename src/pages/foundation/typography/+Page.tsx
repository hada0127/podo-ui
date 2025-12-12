import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Typography() {
  const { t } = useTranslation('typography');

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
  const displayStyles = [
    { name: 'display1', fontSize: '60px', fontWeight: 600, lineHeight: 1.2, mobile: '36px' },
    { name: 'display2', fontSize: '54px', fontWeight: 600, lineHeight: 1.2, mobile: '32px' },
    { name: 'display3', fontSize: '48px', fontWeight: 600, lineHeight: 1.2, mobile: '28px' },
    { name: 'display4', fontSize: '42px', fontWeight: 600, lineHeight: 1.2, mobile: '24px' },
    { name: 'display5', fontSize: '36px', fontWeight: 600, lineHeight: 1.2, mobile: '20px' },
    { name: 'display6', fontSize: '24px', fontWeight: 600, lineHeight: 1.4, mobile: '18px' },
    { name: 'display7', fontSize: '20px', fontWeight: 600, lineHeight: 1.6, mobile: '16px' },
  ];

  const paragraphStyles = [
    { name: 'p1', fontSize: '24px', fontWeight: 400, lineHeight: 1.4, mobile: '20px' },
    { name: 'p2', fontSize: '20px', fontWeight: 400, lineHeight: 1.6, mobile: '16px' },
    { name: 'p3', fontSize: '16px', fontWeight: 400, lineHeight: 1.6, mobile: '14px' },
    { name: 'p3-semibold', fontSize: '16px', fontWeight: 600, lineHeight: 1.6, mobile: '14px' },
    { name: 'p4', fontSize: '14px', fontWeight: 400, lineHeight: 1.6, mobile: '12px' },
    { name: 'p4-semibold', fontSize: '14px', fontWeight: 600, lineHeight: 1.6, mobile: '12px' },
    { name: 'p5', fontSize: '12px', fontWeight: 400, lineHeight: 1.6, mobile: '12px' },
    { name: 'p5-semibold', fontSize: '12px', fontWeight: 600, lineHeight: 1.6, mobile: '12px' },
  ];

  const headingStyles = [
    { name: 'h1', fontSize: '54px', fontWeight: 600, lineHeight: 1.2, mobile: '24px' },
    { name: 'h2', fontSize: '42px', fontWeight: 600, lineHeight: 1.2, mobile: '18px' },
    { name: 'h3', fontSize: '36px', fontWeight: 600, lineHeight: 1.2, mobile: '16px' },
  ];

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('sections.typographySystem.title')}</h2>
        <p>{t('sections.typographySystem.description')}</p>
      </section>

      <section>
        <h2>{t('sections.displayStyles.title')}</h2>
        <p>{t('sections.displayStyles.description')}</p>

        <div className={styles.typeGrid}>
          {displayStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                <div className={style.name}>{t('sections.displayStyles.sampleText')}</div>
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>{t('specs.size')}</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>{t('specs.weight')}</strong> {style.fontWeight}</div>
                  <div><strong>{t('specs.lineHeight')}</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.paragraphStyles.title')}</h2>
        <p>{t('sections.paragraphStyles.description')}</p>

        <div className={styles.typeGrid}>
          {paragraphStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                <div className={style.name}>
                  {t('sections.paragraphStyles.sampleText')}
                </div>
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>{t('specs.size')}</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>{t('specs.weight')}</strong> {style.fontWeight}</div>
                  <div><strong>{t('specs.lineHeight')}</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.headingStyles.title')}</h2>
        <p>{t('sections.headingStyles.description')}</p>

        <div className={styles.typeGrid}>
          {headingStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                {style.name === 'h1' && <h2>Heading 1</h2>}
                {style.name === 'h2' && <h2>Heading 2</h2>}
                {style.name === 'h3' && <h2>Heading 3</h2>}
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>{t('specs.size')}</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>{t('specs.weight')}</strong> {style.fontWeight}</div>
                  <div><strong>{t('specs.lineHeight')}</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.cssClasses.title')}</h2>
        <p>{t('sections.cssClasses.description')}</p>

        <CodeBlock
          title={t('sections.cssClasses.codeHeader')}
          language="html"
          code={`<!-- Display styles -->
<div class="display1">Large heading</div>
<div class="display4">Medium heading</div>
<div class="display7">Small heading</div>

<!-- Paragraph styles -->
<p class="p1">Large body text</p>
<p class="p3">Regular body text</p>
<p class="p3-semibold">Bold body text</p>
<p class="p5">Small body text</p>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.cssClasses.demoTitle')}</div>
          <div className="display4" style={{ marginBottom: '16px' }}>{t('sections.cssClasses.sampleHeading')}</div>
          <div className="p2" style={{ marginBottom: '12px' }}>{t('sections.cssClasses.sampleP2')}</div>
          <div className="p3">{t('sections.cssClasses.sampleP3')}</div>
          <div className="p3-semibold">{t('sections.cssClasses.sampleP3Semibold')}</div>
        </div>
      </section>

      <section>
        <h2>{t('sections.scssUsage.title')}</h2>
        <p>{t('sections.scssUsage.description')}</p>

        <CodeBlock
          title={t('sections.scssUsage.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.title {
  @include display3;
  margin-bottom: s(5);
}

.subtitle {
  @include display6;
  color: color(default-deep);
}

.body {
  @include p3;
  line-height: 1.8;
}

.caption {
  @include p5;
  color: color(default);
}`}
        />
      </section>

      <section>
        <h2>{t('sections.fontFamily.title')}</h2>
        <p>{t('sections.fontFamily.description')}</p>

        <CodeBlock
          title={t('sections.fontFamily.codeHeader')}
          language="css"
          code={`:root {
  --base-font-family: 'Pretendard', sans-serif;
}

/* Custom font usage */
:root {
  --base-font-family: 'Your Custom Font', -apple-system, sans-serif;
}`}
        />
      </section>

      <section>
        <h2>{t('sections.responsive.title')}</h2>
        <p>{t('sections.responsive.description')}</p>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('sections.responsive.note')}</strong> {t('sections.responsive.noteDescription')}
          </div>
        </div>
      </section>
    </>
  );
}

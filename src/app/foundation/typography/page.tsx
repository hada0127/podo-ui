'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Typography() {
  const t = useTranslations('typography');

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
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.typographySystem.title')}</h2>
        <p>
          {t('sections.typographySystem.description')}
        </p>
      </section>

      <section className={styles.section}>
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

      <section className={styles.section}>
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

      <section className={styles.section}>
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

      <section className={styles.section}>
        <h2>{t('sections.cssClasses.title')}</h2>
        <p>{t('sections.cssClasses.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.cssClasses.codeHeader')}</div>
          <pre><code>{`<!-- Display 스타일 -->
<div class="display1">대형 제목</div>
<div class="display4">중형 제목</div>
<div class="display7">소형 제목</div>

<!-- Paragraph 스타일 -->
<p class="p1">큰 본문 텍스트</p>
<p class="p3">일반 본문 텍스트</p>
<p class="p3-semibold">강조된 본문 텍스트</p>
<p class="p5">작은 본문 텍스트</p>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.cssClasses.demoTitle')}</div>
          <div className="display4" style={{ marginBottom: '16px' }}>{t('sections.cssClasses.sampleHeading')}</div>
          <div className="p2" style={{ marginBottom: '12px' }}>{t('sections.cssClasses.sampleP2')}</div>
          <div className="p3">{t('sections.cssClasses.sampleP3')}</div>
          <div className="p3-semibold">{t('sections.cssClasses.sampleP3Semibold')}</div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.scssUsage.title')}</h2>
        <p>{t('sections.scssUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.scssUsage.codeHeader')}</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

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
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.fontFamily.title')}</h2>
        <p>{t('sections.fontFamily.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.fontFamily.codeHeader')}</div>
          <pre><code>{`:root {
  --base-font-family: 'Pretendard', sans-serif;
}

/* 커스텀 폰트 사용 */
:root {
  --base-font-family: 'Your Custom Font', -apple-system, sans-serif;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
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

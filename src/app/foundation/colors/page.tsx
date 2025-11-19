'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Colors() {
  const t = useTranslations('colors');

  const colors = [
    { name: 'primary', label: t('colors.primary.label'), description: t('colors.primary.description') },
    { name: 'default', label: t('colors.default.label'), description: t('colors.default.description') },
    { name: 'default-deep', label: t('colors.default-deep.label'), description: t('colors.default-deep.description') },
    { name: 'info', label: t('colors.info.label'), description: t('colors.info.description') },
    { name: 'link', label: t('colors.link.label'), description: t('colors.link.description') },
    { name: 'success', label: t('colors.success.label'), description: t('colors.success.description') },
    { name: 'warning', label: t('colors.warning.label'), description: t('colors.warning.description') },
    { name: 'danger', label: t('colors.danger.label'), description: t('colors.danger.description') },
  ];

  const variants = [
    { name: 'base', label: t('variants.base.label'), description: t('variants.base.description') },
    { name: 'hover', label: t('variants.hover.label'), description: t('variants.hover.description') },
    { name: 'pressed', label: t('variants.pressed.label'), description: t('variants.pressed.description') },
    { name: 'focus', label: t('variants.focus.label'), description: t('variants.focus.description') },
    { name: 'fill', label: t('variants.fill.label'), description: t('variants.fill.description') },
    { name: 'reverse', label: t('variants.reverse.label'), description: t('variants.reverse.description') },
    { name: 'outline', label: t('variants.outline.label'), description: t('variants.outline.description') },
  ];

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.colorSystem.title')}</h2>
        <p>
          {t('sections.colorSystem.description')}
        </p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.colorPalette.title')}</h2>
        <div className={styles.colorGrid}>
          {colors.map((color) => (
            <div key={color.name} className={styles.colorCard}>
              <div className={styles.colorPreview} data-color={color.name}></div>
              <div className={styles.colorInfo}>
                <h3>{color.label}</h3>
                <p className={styles.colorName}>{color.name}</p>
                <p className={styles.colorDesc}>{color.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.colorVariants.title')}</h2>
        <p>{t('sections.colorVariants.description')}</p>

        <div className={styles.variantsGrid}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantSwatch} data-variant={variant.name}></div>
              <div className={styles.variantInfo}>
                <h3>{variant.label}</h3>
                <p>{variant.description}</p>
                <code>primary-{variant.name}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.scssUsage.title')}</h2>
        <p>{t('sections.scssUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.scssUsage.codeHeader')}</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.button {
  // 기본 색상
  background: color(primary);
  color: color(primary-reverse);
  border: 1px solid color(primary);

  // 호버 상태
  &:hover {
    background: color(primary-hover);
    border-color: color(primary-hover);
  }

  // 눌림 상태
  &:active {
    background: color(primary-pressed);
  }

  // 포커스 상태
  &:focus {
    outline: 2px solid color(primary-outline);
  }
}

// Fill 스타일 버튼
.buttonFill {
  background: color(primary-fill);
  color: color(primary);
  border: 1px solid color(primary-outline);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.cssClasses.title')}</h2>
        <p>{t('sections.cssClasses.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.cssClasses.codeHeader')}</div>
          <pre><code>{`<!-- 텍스트 색상 -->
<div class="primary">Primary 색상 텍스트</div>
<div class="danger">Danger 색상 텍스트</div>

<!-- 배경 색상 -->
<div class="bg-primary">Primary 배경</div>
<div class="bg-success-fill">Success Fill 배경</div>

<!-- 테두리 색상 -->
<div class="border-primary">Primary 테두리</div>
<div class="border-warning">Warning 테두리</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.cssClasses.demoTitle')}</div>
          <div className={styles.demoGrid}>
            <div className="primary">Primary Text</div>
            <div className="info">Info Text</div>
            <div className="success">Success Text</div>
            <div className="warning">Warning Text</div>
            <div className="danger">Danger Text</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.darkMode.title')}</h2>
        <p>
          {t('sections.darkMode.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.darkMode.codeHeader')}</div>
          <pre><code>{`// Light 모드
document.documentElement.setAttribute('data-color-mode', 'light');

// Dark 모드
document.documentElement.setAttribute('data-color-mode', 'dark');

// 자동 (브라우저 설정 따름)
document.documentElement.setAttribute('data-color-mode', '');`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('sections.darkMode.note')}</strong> {t('sections.darkMode.noteDescription')}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.colorSwatches.title')}</h2>
        <p>{t('sections.colorSwatches.description')}</p>

        {colors.map((color) => (
          <div key={color.name} className={styles.swatchSection}>
            <h3>{color.label} ({color.name})</h3>
            <div className={styles.swatchGrid}>
              {variants.map((variant) => (
                <div key={variant.name} className={styles.swatchItem}>
                  <div
                    className={styles.swatchColor}
                    data-color={color.name}
                    data-variant={variant.name}
                  ></div>
                  <div className={styles.swatchLabel}>
                    <div>{variant.label}</div>
                    <code>{color.name}-{variant.name}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

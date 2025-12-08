import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function Elevation() {
  const { t } = useTranslation('elevation');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('background.title')}</h2>
        <p>
          {t('background.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.container {
  background: color(bg-modal);
}

.card {
  background: color(bg-block);
}

.elevated {
  background: color(bg-elevation);
}

.elevated1 {
  background: color(bg-elevation-1);
}

.disabled {
  background: color(bg-disabled);
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('background.demoTitle')}</div>
          <div className={styles.bgGrid}>
            <div className={styles.bgBox} style={{ background: 'var(--bg-modal)' }}>
              <strong>bg-modal</strong>
              <span>{t('background.bgModal')}</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-block)' }}>
              <strong>bg-block</strong>
              <span>{t('background.bgBlock')}</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-elevation)' }}>
              <strong>bg-elevation</strong>
              <span>{t('background.bgElevation')}</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-elevation-1)' }}>
              <strong>bg-elevation-1</strong>
              <span>{t('background.bgElevation1')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('elevation.title')}</h2>
        <p>
          {t('elevation.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('elevation.demoTitle')}</div>
          <div className={styles.elevationExample}>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-modal)' }}>
              <h2>{t('elevation.level0.title')}</h2>
              <p>{t('elevation.level0.description')}</p>
            </div>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-elevation)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2>{t('elevation.level1.title')}</h2>
              <p>{t('elevation.level1.description')}</p>
            </div>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-elevation-1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h2>{t('elevation.level2.title')}</h2>
              <p>{t('elevation.level2.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('shadow.title')}</h2>
        <p>{t('shadow.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.card {
  background: color(bg-modal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.floatingButton {
  background: color(primary);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);

  &:hover {
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
  }
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('shadow.demoTitle')}</div>
          <div className={styles.shadowGrid}>
            <div className={styles.shadowBox} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              Shadow 1
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Shadow 2
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              Shadow 3
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
              Shadow 4
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('realWorld.title')}</h2>
        <p>{t('realWorld.description')}</p>

        <div className={styles.demo}>
          <div className={styles.cardShowcase}>
            <div className={styles.showcaseCard}>
              <h2>{t('realWorld.cards.basic.title')}</h2>
              <p>{t('realWorld.cards.basic.description')}</p>
            </div>
            <div className={styles.showcaseCard} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2>{t('realWorld.cards.shadow.title')}</h2>
              <p>{t('realWorld.cards.shadow.description')}</p>
            </div>
            <div className={styles.showcaseCard} style={{ background: 'var(--bg-elevation)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h2>{t('realWorld.cards.elevated.title')}</h2>
              <p>{t('realWorld.cards.elevated.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

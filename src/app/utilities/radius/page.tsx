'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Radius() {
  const t = useTranslations('radius');
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
          <pre><code>{`<div class="r-0">반경 없음</div>
<div class="r-2">반경 4px</div>
<div class="r-4">반경 8px</div>
<div class="r-full">완전히 둥글게</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('allValues.title')}</h2>
        <p>{t('allValues.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('allValues.demoTitle')}</div>
          <div className={styles.radiusGrid}>
            <div className={styles.radiusBox} style={{ borderRadius: '0' }}>
              <div>r-0</div>
              <span>0px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '2px' }}>
              <div>r-1</div>
              <span>2px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '4px' }}>
              <div>r-2</div>
              <span>4px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '6px' }}>
              <div>r-3</div>
              <span>6px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '8px' }}>
              <div>r-4</div>
              <span>8px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '12px' }}>
              <div>r-5</div>
              <span>12px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '20px' }}>
              <div>r-6</div>
              <span>20px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '9999px' }}>
              <div>r-full</div>
              <span>9999px</span>
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

.button {
  border-radius: r(2);  // 4px
}

.card {
  border-radius: r(4);  // 8px
}

.modal {
  border-radius: r(5);  // 12px
}

.avatar {
  border-radius: r(full);  // 완전히 둥글게
  width: 40px;
  height: 40px;
}

.badge {
  border-radius: r(6);  // 20px
  padding: s(2) s(4);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('realWorld.title')}</h2>
        <p>{t('realWorld.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('realWorld.buttonDemo')}</div>
          <div className={styles.buttonExample}>
            <button style={{ borderRadius: '4px' }}>r-2 {t('realWorld.button')}</button>
            <button style={{ borderRadius: '8px' }}>r-4 {t('realWorld.button')}</button>
            <button style={{ borderRadius: '9999px' }}>r-full {t('realWorld.button')}</button>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('realWorld.cardDemo')}</div>
          <div className={styles.cardExample}>
            <div className={styles.card} style={{ borderRadius: '6px' }}>
              <h2>{t('realWorld.card.r3.title')}</h2>
              <p>{t('realWorld.card.r3.description')}</p>
            </div>
            <div className={styles.card} style={{ borderRadius: '12px' }}>
              <h2>{t('realWorld.card.r5.title')}</h2>
              <p>{t('realWorld.card.r5.description')}</p>
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('realWorld.avatarDemo')}</div>
          <div className={styles.avatarExample}>
            <div className={styles.avatar} style={{ borderRadius: '8px' }}>
              <span>A</span>
            </div>
            <div className={styles.avatar} style={{ borderRadius: '9999px' }}>
              <span>B</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

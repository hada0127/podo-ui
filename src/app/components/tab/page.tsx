'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Tab() {
  const t = useTranslations('tab');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.basicUsage.title')}</h2>
        <p>
          <code>ul.tabs</code> {t('sections.basicUsage.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.basicUsage.codeHeader')}</div>
          <pre><code>{`<ul class="tabs">
  <li class="on">
    <a href="#tab1">${t('tabs.tab1')}</a>
  </li>
  <li>
    <a href="#tab2">${t('tabs.tab2')}</a>
  </li>
  <li>
    <a href="#tab3">${t('tabs.tab3')}</a>
  </li>
</ul>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demoTitle')}</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">{t('tabs.tab1')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.tab2')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.tab3')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.fillStyle.title')}</h2>
        <p>
          <code>.fill</code> {t('sections.fillStyle.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.fillStyle.codeHeader')}</div>
          <pre><code>{`<ul class="tabs fill">
  <li class="on">
    <a href="#tab1">${t('tabs.home')}</a>
  </li>
  <li>
    <a href="#tab2">${t('tabs.profile')}</a>
  </li>
  <li>
    <a href="#tab3">${t('tabs.settings')}</a>
  </li>
</ul>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.fillStyle.demoTitle')}</div>
          <ul className="tabs fill">
            <li className="on">
              <a href="#tab1">{t('tabs.home')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.profile')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.settings')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.manyTabs.title')}</h2>
        <p>{t('sections.manyTabs.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.manyTabs.demoTitle')}</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">{t('tabs.all')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.notice')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.event')}</a>
            </li>
            <li>
              <a href="#tab4">{t('tabs.promotion')}</a>
            </li>
            <li>
              <a href="#tab5">{t('tabs.faq')}</a>
            </li>
            <li>
              <a href="#tab6">{t('tabs.customerService')}</a>
            </li>
            <li>
              <a href="#tab7">{t('tabs.inquiry')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.practicalExample.title')}</h2>
        <p>{t('sections.practicalExample.description')}</p>

        <div className={styles.demo}>
          <ul className="tabs">
            <li className="on">
              <a href="#overview">{t('tabs.overview')}</a>
            </li>
            <li>
              <a href="#features">{t('tabs.features')}</a>
            </li>
            <li>
              <a href="#pricing">{t('tabs.pricing')}</a>
            </li>
          </ul>

          <div className={styles.tabContent}>
            <div className={styles.tabPanel}>
              <h2>{t('content.overviewTitle')}</h2>
              <p>{t('content.overviewContent')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.scssUsage.title')}</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('sections.scssUsage.codeHeader')}</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

ul.tabs {
  padding: 0;
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px inset color(border);

  // ${t('sections.scssUsage.fillStyleComment')}
  &.fill > li {
    flex: 1;
  }

  > li {
    text-align: center;
    padding: 0;

    > a {
      @include p3;
      display: block;
      padding: s(2) s(5);
      color: color(text-sub);

      &:hover {
        color: inherit;
      }

      &:focus-visible:not(:disabled) {
        outline: 4px solid color(primary-outline);
      }
    }

    // ${t('sections.scssUsage.activeTabComment')}
    &.on > a {
      @include p3-semibold;
      color: color(primary) !important;
      border-bottom: 1px inset color(primary);
      margin-bottom: -1px;
    }
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

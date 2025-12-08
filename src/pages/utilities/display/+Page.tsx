import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function Display() {
  const { t } = useTranslation('display');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('hideClasses.title')}</h2>
        <p>
          {t('hideClasses.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ` + t('code.hideAll') + ` -->
<div class="hide">` + t('code.alwaysHidden') + `</div>

<!-- ` + t('code.hidePCOnly') + ` -->
<div class="hide-pc">` + t('code.hidePCOnlyText') + `</div>

<!-- ` + t('code.hideTBOnly') + ` -->
<div class="hide-tb">` + t('code.hideTBOnlyText') + `</div>

<!-- ` + t('code.hideMOOnly') + ` -->
<div class="hide-mo">` + t('code.hideMOOnlyText') + `</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('hideClasses.demoTitle')}</div>
          <div className={styles.hideDemo}>
            <div className="hide-pc">
              <div className={styles.demoBox}>{t('hideClasses.examples.hidePC')}</div>
            </div>
            <div className="hide-tb">
              <div className={styles.demoBox}>{t('hideClasses.examples.hideTB')}</div>
            </div>
            <div className="hide-mo">
              <div className={styles.demoBox}>{t('hideClasses.examples.hideMO')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('breakpoints.title')}</h2>
        <p>{t('breakpoints.description')}</p>
        <ul>
          <li><strong>PC:</strong> {t('breakpoints.pc')}</li>
          <li><strong>Tablet:</strong> {t('breakpoints.tablet')}</li>
          <li><strong>Mobile:</strong> {t('breakpoints.mobile')}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t('mediaQuery.title')}</h2>
        <p>{t('mediaQuery.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.container {
  padding: s(8);

  // ` + t('code.pcMedia') + `
  @include pc {
    max-width: 1200px;
    margin: 0 auto;
  }

  // ` + t('code.tbMedia') + `
  @include tb {
    padding: s(6);
  }

  // ` + t('code.moMedia') + `
  @include mo {
    padding: s(4);
  }
}

.sidebar {
  display: block;

  @include mo {
    display: none; // ` + t('code.hideMobile') + `
  }
}

.mobileMenu {
  display: none;

  @include mo {
    display: block; // ` + t('code.showMobile') + `
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('currentSize.title')}</h2>
        <p>{t('currentSize.description')}</p>

        <div className={styles.demo}>
          <div className={styles.deviceIndicator}>
            <div className="hide-tb hide-mo">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>{t('currentSize.pc.label')}</strong>
                  <p>{t('currentSize.pc.size')}</p>
                </div>
              </div>
            </div>
            <div className="hide-pc hide-mo">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>{t('currentSize.tablet.label')}</strong>
                  <p>{t('currentSize.tablet.size')}</p>
                </div>
              </div>
            </div>
            <div className="hide-pc hide-tb">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>{t('currentSize.mobile.label')}</strong>
                  <p>{t('currentSize.mobile.size')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('realWorld.title')}</h2>
        <p>{t('realWorld.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ` + t('code.desktopNav') + ` -->
<nav class="hide-mo">
  <a href="/">` + t('code.home') + `</a>
  <a href="/about">` + t('code.about') + `</a>
  <a href="/contact">` + t('code.contact') + `</a>
</nav>

<!-- ` + t('code.mobileHamburger') + ` -->
<button class="hide-pc hide-tb">
  <i class="icon-menu"></i>
</button>

<!-- ` + t('code.responsiveGrid') + ` -->
<section class="grid">
  <div class="w-4 hide-mo">` + t('code.sidebarHideMobile') + `</div>
  <div class="w-8">` + t('code.mainContent') + `</div>
</section>`}</code></pre>
        </div>
      </section>
    </>
  );
}

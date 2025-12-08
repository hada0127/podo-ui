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
          <pre><code>{`<!-- 모든 디바이스에서 숨김 -->
<div class="hide">항상 숨김</div>

<!-- PC에서만 숨김 (1280px 이상) -->
<div class="hide-pc">PC에서만 숨김</div>

<!-- Tablet에서만 숨김 (768px ~ 1279px) -->
<div class="hide-tb">Tablet에서만 숨김</div>

<!-- Mobile에서만 숨김 (767px 이하) -->
<div class="hide-mo">Mobile에서만 숨김</div>`}</code></pre>
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

  // PC (1280px 이상)
  @include pc {
    max-width: 1200px;
    margin: 0 auto;
  }

  // Tablet (768px ~ 1279px)
  @include tb {
    padding: s(6);
  }

  // Mobile (767px 이하)
  @include mo {
    padding: s(4);
  }
}

.sidebar {
  display: block;

  @include mo {
    display: none; // 모바일에서 숨김
  }
}

.mobileMenu {
  display: none;

  @include mo {
    display: block; // 모바일에서만 표시
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
          <pre><code>{`<!-- 데스크톱 네비게이션 -->
<nav class="hide-mo">
  <a href="/">홈</a>
  <a href="/about">소개</a>
  <a href="/contact">연락처</a>
</nav>

<!-- 모바일 햄버거 메뉴 -->
<button class="hide-pc hide-tb">
  <i class="icon-menu"></i>
</button>

<!-- 반응형 그리드 -->
<section class="grid">
  <div class="w-4 hide-mo">사이드바 (모바일에서 숨김)</div>
  <div class="w-8">메인 컨텐츠</div>
</section>`}</code></pre>
        </div>
      </section>
    </>
  );
}

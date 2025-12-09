import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import styles from './Page.module.scss';

export default function Icons() {
  const { t } = useTranslation('icons');
  const icons = [
    'star', 'star-fill', 'exchange-horizontally', 'exchange-vertical', 'new-window', 'tag',
    'notification', 'notification-stroke', 'mail', 'global', 'trash', 'dm', 'currency', 'print',
    'gps', 'ellipse', 'ellipse-stroke', 'facebook', 'naver', 'insta', 'tiktok', 'apple', 'google',
    'youtube', 'kakao', 'x', 'arrow-dropdown', 'arrow-dropdown-up', 'check-small', 'check', 'show',
    'hidden', 'fordid', 'upload-cloud', 'share', 'excel', 'cancel', 'arrow-left', 'arrow-right',
    'arrow-up', 'arrow-down', 'download', 'upload', 'link-alt', 'link', 'edit', 'pin', 'flag',
    'hand', 'zoom-in', 'zoom-out', 'chart', 'temperature', 'turbine', 'layers', 'compass',
    'flag-finish', 'pressure', 'pyramid-chart', 'ruler', 'contour', 'plus', 'minus', 'warning',
    'user-stroke', 'user', 'menu', 'time', 'search', 'close', 'info', 'danger', 'danger-fill',
    'expand-left', 'expand-right', 'expand-up', 'expand-down', 'calendar', 'paper', 'import',
    'export', 'img', 'favorite', 'favorite-fill', 'phone', 'phone-stroke', 'home',
    'expand-up-double', 'expand-down-double', 'expand-left-double', 'expand-right-double',
    'setting-stroke', 'setting', 'email', 'more-horizontal', 'more', 'help', 'check-circle-stroke',
    'check-circle-fill', 'map', 'refresh', 'drag', 'clip', 'file', 'card', 'car', 'handle',
    'counselor', 'chart-bar', 'coin', 'receipt', 'briefcase', 'arrow-dropdown-left',
    'arrow-dropdown-right', 'lock', 'unlock', 'save', 'database', 'undo', 'redo', 'unlink-alt',
    'youtube-stroke', 'horizontalLine', 'gap', 'clipboard', 'inputForm', 'copy', 'text', 'logout',
    'detailView', 'company', 'landing', 'code', 'footer', 'click',
    'align-left', 'align-center', 'align-right', 'input',
    'margin-right', 'margin-top', 'margin-left', 'margin-bottom',
    'login', 'margin-horizontal', 'margin-vertical',
  ];

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.iconSystem.title')}</h2>
        <p>
          {t('sections.iconSystem.description')}
        </p>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.htmlUsage.title')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('sections.htmlUsage.description') }} />

        <CodeBlock
          title={t('sections.htmlUsage.codeHeader')}
          language="html"
          code={`<i class="icon-star"></i>
<i class="icon-search"></i>
<i class="icon-check"></i>
<i class="icon-close"></i>

<!-- 크기 조정 -->
<i class="icon-star" style="font-size: 24px;"></i>
<i class="icon-star" style="font-size: 32px;"></i>

<!-- 색상 조정 -->
<i class="icon-star primary"></i>
<i class="icon-star success"></i>
<i class="icon-star danger"></i>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.htmlUsage.demoTitle')}</div>
          <div className={styles.iconDemo}>
            <i className="icon-star"></i>
            <i className="icon-search"></i>
            <i className="icon-check"></i>
            <i className="icon-close"></i>
            <i className="icon-star primary" style={{ fontSize: '32px' }}></i>
            <i className="icon-check success" style={{ fontSize: '32px' }}></i>
            <i className="icon-danger danger" style={{ fontSize: '32px' }}></i>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.reactUsage.title')}</h2>

        <CodeBlock
          title={t('sections.reactUsage.codeHeader')}
          language="tsx"
          code={`export default function MyComponent() {
  return (
    <div>
      <i className="icon-star"></i>
      <i className="icon-search"></i>

      {/* 스타일 적용 */}
      <i className="icon-check" style={{ fontSize: '24px', color: 'green' }}></i>

      {/* CSS 클래스와 함께 사용 */}
      <i className="icon-warning warning"></i>
    </div>
  );
}`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('sections.scssUsage.title')}</h2>

        <CodeBlock
          title={t('sections.scssUsage.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.button {
  display: inline-flex;
  align-items: center;
  gap: s(2);

  i {
    font-size: 20px;
    color: color(primary);
  }
}

.iconWrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: r(full);
  background: color(primary-fill);

  i {
    font-size: 20px;
    color: color(primary);
  }
}`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('sections.allIcons.title')} ({icons.length}{t('sections.allIcons.count')})</h2>
        <p>{t('sections.allIcons.description')}</p>

        <div className={styles.iconGrid}>
          {icons.map((icon) => (
            <button
              key={icon}
              className={styles.iconCard}
              onClick={() => {
                navigator.clipboard.writeText(`icon-${icon}`);
                alert(`Copied: icon-${icon}`);
              }}
            >
              <div className={styles.iconPreview}>
                <i className={`icon-${icon}`}></i>
              </div>
              <div className={styles.iconName}>icon-{icon}</div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sections.categories.title')}</h2>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.generalUI')}</h2>
          <div className={styles.iconList}>
            {['search', 'close', 'check', 'plus', 'minus', 'menu', 'more', 'more-horizontal', 'undo', 'redo', 'copy', 'clipboard', 'text', 'logout'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.arrows')}</h2>
          <div className={styles.iconList}>
            {['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'arrow-dropdown', 'arrow-dropdown-up', 'expand-left', 'expand-right', 'expand-up', 'expand-down'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.fileDocument')}</h2>
          <div className={styles.iconList}>
            {['file', 'paper', 'folder', 'upload', 'download', 'import', 'export', 'save', 'database', 'code'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.socialMedia')}</h2>
          <div className={styles.iconList}>
            {['facebook', 'naver', 'insta', 'tiktok', 'youtube', 'youtube-stroke', 'kakao', 'x', 'apple', 'google'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.status')}</h2>
          <div className={styles.iconList}>
            {['info', 'warning', 'danger', 'danger-fill', 'check-circle-stroke', 'check-circle-fill'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h2>{t('sections.categories.etc')}</h2>
          <div className={styles.iconList}>
            {['unlink-alt', 'horizontalLine', 'gap', 'inputForm', 'detailView', 'company', 'landing', 'footer', 'click', 'align-left', 'align-center', 'align-right', 'input', 'margin-right', 'margin-top', 'margin-left', 'margin-bottom', 'login', 'margin-horizontal', 'margin-vertical'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
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

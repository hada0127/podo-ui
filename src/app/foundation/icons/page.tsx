'use client';

import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Icons() {
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
    'arrow-dropdown-right', 'lock', 'unlock', 'save',
  ];

  return (
    <>
      <PageHeader
        title="아이콘"
        description="Podo UI가 제공하는 119개의 아이콘과 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>아이콘 시스템</h2>
        <p>
          Podo UI는 총 119개의 아이콘 폰트를 제공합니다. 모든 아이콘은 벡터 기반으로 제작되어 크기와 색상을 자유롭게 조정할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>HTML에서 사용하기</h2>
        <p><code>&lt;i&gt;</code> 태그에 <code>icon-*</code> 클래스를 추가하여 아이콘을 사용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<i class="icon-star"></i>
<i class="icon-search"></i>
<i class="icon-check"></i>
<i class="icon-close"></i>

<!-- 크기 조정 -->
<i class="icon-star" style="font-size: 24px;"></i>
<i class="icon-star" style="font-size: 32px;"></i>

<!-- 색상 조정 -->
<i class="icon-star primary"></i>
<i class="icon-star success"></i>
<i class="icon-star danger"></i>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
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
        <h2>React/TSX에서 사용하기</h2>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`export default function MyComponent() {
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
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

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
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>전체 아이콘 ({icons.length}개)</h2>
        <p>아이콘을 클릭하면 클래스명이 클립보드에 복사됩니다.</p>

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
        <h2>아이콘 카테고리</h2>

        <div className={styles.categorySection}>
          <h3>일반 UI</h3>
          <div className={styles.iconList}>
            {['search', 'close', 'check', 'plus', 'minus', 'menu', 'more', 'more-horizontal'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h3>화살표</h3>
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
          <h3>파일 & 문서</h3>
          <div className={styles.iconList}>
            {['file', 'paper', 'folder', 'upload', 'download', 'import', 'export', 'save'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h3>소셜 미디어</h3>
          <div className={styles.iconList}>
            {['facebook', 'naver', 'insta', 'tiktok', 'youtube', 'kakao', 'x', 'apple', 'google'].map(icon => (
              <div key={icon} className={styles.iconItem}>
                <i className={`icon-${icon}`}></i>
                <span>icon-{icon}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categorySection}>
          <h3>상태</h3>
          <div className={styles.iconList}>
            {['info', 'warning', 'danger', 'danger-fill', 'check-circle-stroke', 'check-circle-fill'].map(icon => (
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
            <strong>팁:</strong> 아이콘은 폰트 기반이므로 <code>font-size</code>와 <code>color</code> 속성으로 크기와 색상을 자유롭게 조정할 수 있습니다.
          </div>
        </div>
      </section>
    </>
  );
}

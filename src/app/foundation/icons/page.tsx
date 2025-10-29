import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Icons() {
  // All 119 icons from icon-name.scss
  const icons = [
    'star', 'star-fill', 'exchange-horizontally', 'exchange-vertical', 'new-window',
    'tag', 'notification', 'notification-stroke', 'mail', 'global',
    'trash', 'dm', 'currency', 'print', 'gps',
    'ellipse', 'ellipse-stroke', 'facebook', 'naver', 'insta',
    'tiktok', 'apple', 'google', 'youtube', 'kakao',
    'x', 'arrow-dropdown', 'arrow-dropdown-up', 'check-small', 'check',
    'show', 'hidden', 'fordid', 'upload-cloud', 'share',
    'excel', 'cancel', 'arrow-left', 'arrow-right', 'arrow-up',
    'arrow-down', 'download', 'upload', 'link-alt', 'link',
    'edit', 'pin', 'flag', 'hand', 'zoom-in',
    'zoom-out', 'chart', 'temperature', 'turbine', 'layers',
    'compass', 'flag-finish', 'pressure', 'pyramid-chart', 'ruler',
    'contour', 'plus', 'minus', 'warning', 'user-stroke',
    'user', 'menu', 'time', 'search', 'close',
    'info', 'danger', 'danger-fill', 'expand-left', 'expand-right',
    'expand-up', 'expand-down', 'calendar', 'paper', 'import',
    'export', 'img', 'favorite', 'favorite-fill', 'phone',
    'phone-stroke', 'home', 'expand-up-double', 'expand-down-double', 'expand-left-double',
    'expand-right-double', 'setting-stroke', 'setting', 'email', 'more-horizontal',
    'more', 'help', 'check-circle-stroke', 'check-circle-fill', 'map',
    'refresh', 'drag', 'clip', 'file', 'card',
    'car', 'handle', 'counselor', 'chart-bar', 'coin',
    'receipt', 'briefcase', 'arrow-dropdown-left', 'arrow-dropdown-right', 'lock',
    'unlock', 'save',
  ];

  const sizes = [
    { name: 'xs', label: 'Extra Small', size: '12px' },
    { name: 'sm', label: 'Small', size: '16px' },
    { name: 'md', label: 'Medium', size: '24px' },
    { name: 'lg', label: 'Large', size: '32px' },
  ];

  return (
    <>
      <PageHeader
        title="Icons"
        description="Podo UI의 아이콘 시스템과 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>아이콘 시스템</h2>
        <p>
          Podo UI는 커스텀 아이콘 폰트를 사용하여 119개의 아이콘을 제공합니다.
          벡터 기반으로 제작되어 모든 해상도에서 선명하게 표시되며, CSS로 쉽게 스타일링할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>i 태그에 icon- 접두사와 함께 아이콘 이름을 클래스로 추가합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<i class="icon-star"></i>
<i class="icon-heart"></i>
<i class="icon-search"></i>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.iconDemo}>
            <i className="icon-star"></i>
            <i className="icon-favorite-fill"></i>
            <i className="icon-search"></i>
            <i className="icon-mail"></i>
            <i className="icon-user"></i>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘 크기</h2>
        <p>CSS font-size 속성으로 아이콘 크기를 조절할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<i class="icon-star" style="font-size: 12px;"></i>  <!-- Extra Small -->
<i class="icon-star" style="font-size: 16px;"></i>  <!-- Small -->
<i class="icon-star" style="font-size: 24px;"></i>  <!-- Medium -->
<i class="icon-star" style="font-size: 32px;"></i>  <!-- Large -->`}</code></pre>
        </div>

        <div className={styles.sizeGrid}>
          {sizes.map((size) => (
            <div key={size.name} className={styles.sizeCard}>
              <i className="icon-star" style={{ fontSize: size.size }}></i>
              <div className={styles.sizeInfo}>
                <h4>{size.label}</h4>
                <code>{size.size}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘 색상</h2>
        <p>CSS color 속성이나 컬러 클래스로 아이콘 색상을 변경할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- CSS color 속성 -->
<i class="icon-star" style="color: #7c3aed;"></i>

<!-- 컬러 클래스 -->
<i class="icon-star primary"></i>
<i class="icon-star danger"></i>
<i class="icon-star success"></i>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.iconDemo}>
            <i className="icon-star primary" style={{ fontSize: '32px' }}></i>
            <i className="icon-favorite-fill danger" style={{ fontSize: '32px' }}></i>
            <i className="icon-check-circle-fill success" style={{ fontSize: '32px' }}></i>
            <i className="icon-info info" style={{ fontSize: '32px' }}></i>
            <i className="icon-warning warning" style={{ fontSize: '32px' }}></i>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>버튼과 함께 사용</h2>
        <p>버튼 내부에 아이콘을 추가하여 더욱 직관적인 UI를 만들 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<button class="primary">
  <i class="icon-plus"></i>
  새로 만들기
</button>

<button class="danger">
  <i class="icon-trash"></i>
  삭제
</button>

<button class="success">
  <i class="icon-download"></i>
  다운로드
</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.buttonDemo}>
            <button className="primary">
              <i className="icon-plus"></i>
              새로 만들기
            </button>
            <button className="danger">
              <i className="icon-trash"></i>
              삭제
            </button>
            <button className="success">
              <i className="icon-download"></i>
              다운로드
            </button>
            <button className="info">
              <i className="icon-search"></i>
              검색
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>전체 아이콘 목록</h2>
        <p>119개의 모든 아이콘을 확인하고 클릭하여 이름을 복사하세요:</p>

        <div className={styles.iconGrid}>
          {icons.map((icon) => (
            <div
              key={icon}
              className={styles.iconCard}
              onClick={() => {
                navigator.clipboard.writeText(`icon-${icon}`);
              }}
              title="클릭하여 클래스명 복사"
            >
              <i className={`icon-${icon}`}></i>
              <span>{icon}</span>
            </div>
          ))}
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>팁:</strong> 아이콘 카드를 클릭하면 클래스명이 클립보드에 복사됩니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 아이콘을 스타일링할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.button {
  display: flex;
  align-items: center;
  gap: s(2);

  i {
    font-size: 16px;
    color: color(primary-base);
  }

  &:hover i {
    color: color(primary-hover);
  }
}

.iconButton {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: r(2);
  background: color(primary-fill);
  color: color(primary-base);
  border: 1px solid color(primary-outline);
  cursor: pointer;
  transition: all 0.3s;

  i {
    font-size: 20px;
  }

  &:hover {
    background: color(primary-base);
    color: color(primary-reverse);
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

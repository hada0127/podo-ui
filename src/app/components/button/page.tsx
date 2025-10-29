import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Button() {
  const variants = [
    { name: 'primary', label: 'Primary', description: '주요 액션' },
    { name: 'default', label: 'Default', description: '기본 버튼' },
    { name: 'info', label: 'Info', description: '정보성 액션' },
    { name: 'link', label: 'Link', description: '링크형 액션' },
    { name: 'success', label: 'Success', description: '성공/완료 액션' },
    { name: 'warning', label: 'Warning', description: '경고 액션' },
    { name: 'danger', label: 'Danger', description: '위험/삭제 액션' },
  ];

  const buttonStyles = [
    { suffix: '', label: 'Solid', description: '기본 스타일' },
    { suffix: '-fill', label: 'Fill', description: '연한 배경' },
    { suffix: '-border', label: 'Border', description: '테두리만' },
    { suffix: '-text', label: 'Text', description: '텍스트만' },
  ];

  return (
    <>
      <PageHeader
        title="Button"
        description="Podo UI의 버튼 컴포넌트와 다양한 변형 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML button 태그에 컬러 클래스를 추가하여 버튼을 만들 수 있습니다.
          클래스명만으로 다양한 스타일의 버튼을 구현할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<button>기본 버튼</button>
<button class="primary">Primary 버튼</button>
<button class="danger">Danger 버튼</button>
<button disabled>비활성화 버튼</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.buttonGroup}>
            <button>기본 버튼</button>
            <button className="primary">Primary 버튼</button>
            <button className="danger">Danger 버튼</button>
            <button disabled>비활성화 버튼</button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>버튼 변형</h2>
        <p>7가지 시맨틱 컬러로 다양한 목적의 버튼을 만들 수 있습니다:</p>

        <div className={styles.variantsShowcase}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantHeader}>
                <h3>{variant.label}</h3>
                <p>{variant.description}</p>
              </div>
              <button className={variant.name}>{variant.label} 버튼</button>
            </div>
          ))}
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<button class="primary">Primary</button>
<button class="default">Default</button>
<button class="info">Info</button>
<button class="link">Link</button>
<button class="success">Success</button>
<button class="warning">Warning</button>
<button class="danger">Danger</button>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>버튼 스타일</h2>
        <p>각 컬러 변형마다 4가지 스타일(Solid, Fill, Border, Text)을 사용할 수 있습니다:</p>

        {buttonStyles.map((style) => (
          <div key={style.suffix} className={styles.styleSection}>
            <h3>{style.label} Style</h3>
            <p>{style.description}</p>

            <div className={styles.buttonGroup}>
              {variants.map((variant) => (
                <button key={variant.name} className={`${variant.name}${style.suffix}`}>
                  {variant.label}
                </button>
              ))}
            </div>

            <div className={styles.codeBlock}>
              <pre><code>{`<button class="primary${style.suffix}">${style.label}</button>
<button class="success${style.suffix}">${style.label}</button>
<button class="danger${style.suffix}">${style.label}</button>`}</code></pre>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>버튼 크기</h2>
        <p>CSS를 사용하여 버튼의 크기를 조절할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Small -->
<button class="primary" style="padding: 0.5rem 1rem; font-size: 0.875rem">
  Small Button
</button>

<!-- Medium (기본) -->
<button class="primary">
  Medium Button
</button>

<!-- Large -->
<button class="primary" style="padding: 1rem 2rem; font-size: 1.125rem">
  Large Button
</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.sizeDemo}>
            <button className="primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Small Button
            </button>
            <button className="primary">
              Medium Button
            </button>
            <button className="primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Large Button
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘과 함께 사용</h2>
        <p>버튼 내부에 아이콘을 추가하여 더욱 직관적인 UI를 만들 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<button class="primary">
  <i class="icon-plus"></i>
  새로 만들기
</button>

<button class="success">
  <i class="icon-check"></i>
  확인
</button>

<button class="danger">
  <i class="icon-trash"></i>
  삭제
</button>

<!-- 아이콘만 -->
<button class="primary">
  <i class="icon-search"></i>
</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.iconButtonDemo}>
            <button className="primary">
              <i className="icon-plus"></i>
              새로 만들기
            </button>
            <button className="success">
              <i className="icon-check"></i>
              확인
            </button>
            <button className="danger">
              <i className="icon-trash"></i>
              삭제
            </button>
            <button className="info">
              <i className="icon-download"></i>
              다운로드
            </button>
            <button className="primary">
              <i className="icon-search"></i>
            </button>
            <button className="danger">
              <i className="icon-close"></i>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>비활성화 상태</h2>
        <p>disabled 속성을 추가하여 버튼을 비활성화할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<button class="primary" disabled>Disabled</button>
<button class="success" disabled>Disabled</button>
<button class="danger" disabled>Disabled</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.buttonGroup}>
            <button className="primary" disabled>Primary</button>
            <button className="default" disabled>Default</button>
            <button className="success" disabled>Success</button>
            <button className="danger" disabled>Danger</button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>버튼 그룹</h2>
        <p>여러 버튼을 그룹으로 묶어 사용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div style="display: flex; gap: 0.5rem;">
  <button class="primary">저장</button>
  <button class="default">취소</button>
</div>

<div style="display: flex; gap: 0.5rem;">
  <button class="primary">
    <i class="icon-arrow-left"></i>
    이전
  </button>
  <button class="primary">
    다음
    <i class="icon-arrow-right"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.groupDemo}>
            <div className={styles.buttonRow}>
              <button className="primary">저장</button>
              <button className="default">취소</button>
            </div>
            <div className={styles.buttonRow}>
              <button className="primary">
                <i className="icon-arrow-left"></i>
                이전
              </button>
              <button className="primary">
                다음
                <i className="icon-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 버튼 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.customButton {
  display: flex;
  align-items: center;
  gap: s(2);
  padding: s(3) s(5);
  background: color(primary-base);
  color: color(primary-reverse);
  border: none;
  border-radius: r(3);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: color(primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    background: color(primary-pressed);
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  i {
    font-size: 16px;
  }
}

.iconOnlyButton {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: color(primary-fill);
  color: color(primary-base);
  border: 1px solid color(primary-outline);
  border-radius: r(2);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: color(primary-base);
    color: color(primary-reverse);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>전체 변형 쇼케이스</h2>
        <p>모든 컬러 변형과 스타일을 한눈에 확인하세요:</p>

        <div className={styles.showcase}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.showcaseRow}>
              <div className={styles.showcaseLabel}>
                <strong>{variant.label}</strong>
                <span>{variant.description}</span>
              </div>
              <div className={styles.showcaseButtons}>
                <button className={variant.name}>Solid</button>
                <button className={`${variant.name}-fill`}>Fill</button>
                <button className={`${variant.name}-border`}>Border</button>
                <button className={`${variant.name}-text`}>Text</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

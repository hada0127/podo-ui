import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Colors() {
  const colors = [
    { name: 'primary', label: 'Primary', description: '주요 액션 및 브랜드 색상' },
    { name: 'default', label: 'Default', description: '기본 UI 요소' },
    { name: 'default-deep', label: 'Default Deep', description: '강조된 기본 색상' },
    { name: 'info', label: 'Info', description: '정보성 메시지' },
    { name: 'link', label: 'Link', description: '링크 및 네비게이션' },
    { name: 'success', label: 'Success', description: '성공 상태 표시' },
    { name: 'warning', label: 'Warning', description: '경고 메시지' },
    { name: 'danger', label: 'Danger', description: '위험/오류 상태' },
  ];

  const variants = [
    { name: 'base', label: 'Base', description: '기본 색상' },
    { name: 'hover', label: 'Hover', description: '호버 상태' },
    { name: 'pressed', label: 'Pressed', description: '눌림 상태' },
    { name: 'focus', label: 'Focus', description: '포커스 상태' },
    { name: 'fill', label: 'Fill', description: '배경 색상' },
    { name: 'reverse', label: 'Reverse', description: '반전 색상 (텍스트)' },
    { name: 'outline', label: 'Outline', description: '아웃라인 색상' },
  ];

  return (
    <>
      <PageHeader
        title="Colors"
        description="Podo UI의 시맨틱 컬러 시스템과 테마 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>색상 시스템</h2>
        <p>
          Podo UI는 8가지 시맨틱 컬러를 제공하며, 각 컬러는 7가지 변형(base, hover, pressed, focus, fill, reverse, outline)을 가집니다.
          CSS 변수 기반으로 구축되어 있어 라이트/다크 모드를 쉽게 전환할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>컬러 팔레트</h2>
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
        <h2>컬러 변형</h2>
        <p>각 컬러는 다양한 상태에 대응하는 7가지 변형을 제공합니다:</p>

        <div className={styles.variantsGrid}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantSwatch} data-variant={variant.name}></div>
              <div className={styles.variantInfo}>
                <h4>{variant.label}</h4>
                <p>{variant.description}</p>
                <code>primary-{variant.name}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 color() 함수를 사용하여 컬러를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.button {
  // 기본 색상
  background: color(primary-base);
  color: color(primary-reverse);
  border: 1px solid color(primary-base);

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
  color: color(primary-base);
  border: 1px solid color(primary-outline);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>CSS 클래스로 사용하기</h2>
        <p>HTML 요소에 직접 컬러 클래스를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
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
          <div className={styles.demoTitle}>실제 예제:</div>
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
        <h2>다크 모드</h2>
        <p>
          Podo UI는 자동으로 다크 모드를 지원합니다.
          오른쪽 상단의 테마 토글 버튼을 클릭하여 라이트/다크 모드를 전환해보세요.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
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
            <strong>팁:</strong> CSS 변수 기반으로 구축되어 있어 페이지 새로고침 없이 즉시 테마가 전환됩니다.
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>전체 컬러 스와치</h2>
        <p>모든 컬러와 변형을 한눈에 확인하세요:</p>

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

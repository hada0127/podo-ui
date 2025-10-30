import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Responsive() {
  return (
    <>
      <PageHeader
        title="반응형"
        description="Podo UI의 반응형 디자인 시스템과 미디어 쿼리 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>브레이크포인트</h2>
        <p>
          Podo UI는 3가지 브레이크포인트를 제공합니다: PC, Tablet, Mobile.
          각 디바이스에 최적화된 레이아웃을 쉽게 구성할 수 있습니다.
        </p>

        <div className={styles.breakpointGrid}>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h3>PC</h3>
            <p className={styles.breakpointValue}>1280px 이상</p>
            <code>@include pc</code>
          </div>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h3>Tablet</h3>
            <p className={styles.breakpointValue}>768px ~ 1279px</p>
            <code>@include tb</code>
          </div>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h3>Mobile</h3>
            <p className={styles.breakpointValue}>767px 이하</p>
            <code>@include mo</code>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS 미디어 쿼리 믹스인</h2>
        <p>SCSS에서 미디어 쿼리 믹스인을 사용하여 반응형 스타일을 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.container {
  padding: s(8);
  font-size: 18px;

  // Tablet (768px ~ 1279px)
  @include tb {
    padding: s(6);
    font-size: 16px;
  }

  // Mobile (767px 이하)
  @include mo {
    padding: s(4);
    font-size: 14px;
  }

  // PC (1280px 이상)
  @include pc {
    max-width: 1200px;
    margin: 0 auto;
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>반응형 숨김</h2>
        <p>특정 디바이스에서만 요소를 숨기는 클래스를 제공합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 모든 디바이스에서 숨김 -->
<div class="hide">항상 숨김</div>

<!-- PC에서만 숨김 -->
<div class="hide-pc">PC에서만 숨김</div>

<!-- Tablet에서만 숨김 -->
<div class="hide-tb">Tablet에서만 숨김</div>

<!-- Mobile에서만 숨김 -->
<div class="hide-mo">Mobile에서만 숨김</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (창 크기를 조절해보세요):</div>
          <div className={styles.hideDemo}>
            <div className="hide-pc"><div className={styles.demoBox}>PC에서 숨김</div></div>
            <div className="hide-tb"><div className={styles.demoBox}>Tablet에서 숨김</div></div>
            <div className="hide-mo"><div className={styles.demoBox}>Mobile에서 숨김</div></div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>반응형 그리드 예제</h2>
        <p>그리드 시스템은 자동으로 반응형으로 동작합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- PC: 12칸, Tablet: 6칸, Mobile: 4칸으로 자동 조정 -->
<section class="grid">
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
</section>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <section className="grid">
            <div className="w-3"><div className={styles.gridItem}>w-3 (25%)</div></div>
            <div className="w-3"><div className={styles.gridItem}>w-3 (25%)</div></div>
            <div className="w-3"><div className={styles.gridItem}>w-3 (25%)</div></div>
            <div className="w-3"><div className={styles.gridItem}>w-3 (25%)</div></div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <h2>반응형 타이포그래피</h2>
        <p>모든 타이포그래피 스타일은 자동으로 모바일에서 작아집니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>예시</div>
          <pre><code>{`// display1
PC: 60px → Mobile: 36px

// display4
PC: 42px → Mobile: 24px

// h1
PC: 54px → Mobile: 24px

// p3
PC: 16px → Mobile: 14px`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <h1>H1 제목 (PC: 54px, Mobile: 24px)</h1>
          <p className="p3">P3 본문 (PC: 16px, Mobile: 14px)</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>모바일 최소 너비</h2>
        <p>모바일 디바이스의 최소 너비는 375px로 설정되어 있습니다.</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>device.scss</div>
          <pre><code>{`$min-mo: 375px;  // 최소 모바일 너비`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 반응형 예제</h2>
        <p>실제 프로젝트에서 사용하는 반응형 레이아웃 예제:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.header {
  padding: s(6);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include tb {
    padding: s(5);
  }

  @include mo {
    padding: s(4);
    flex-direction: column;
    gap: s(3);
  }
}

.nav {
  display: flex;
  gap: s(5);

  @include mo {
    flex-direction: column;
    gap: s(3);
    width: 100%;
  }
}

.card {
  padding: s(6);
  border-radius: r(4);

  @include tb {
    padding: s(5);
  }

  @include mo {
    padding: s(4);
    border-radius: r(3);
  }
}

.sidebar {
  width: 300px;

  @include tb {
    width: 250px;
  }

  @include mo {
    width: 100%;
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>팁:</strong> 브라우저 개발자 도구의 반응형 모드를 사용하여 다양한 디바이스에서의 레이아웃을 테스트해보세요.
            Chrome: Ctrl/Cmd + Shift + M
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>현재 화면 크기 확인</h2>
        <div className={styles.deviceIndicator}>
          <div className={styles.deviceInfo + ' hide-tb hide-mo'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>현재: PC</strong>
              <p>1280px 이상</p>
            </div>
          </div>
          <div className={styles.deviceInfo + ' hide-pc hide-mo'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>현재: Tablet</strong>
              <p>768px ~ 1279px</p>
            </div>
          </div>
          <div className={styles.deviceInfo + ' hide-pc hide-tb'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>현재: Mobile</strong>
              <p>767px 이하</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

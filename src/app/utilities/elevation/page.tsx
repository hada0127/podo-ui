import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Elevation() {
  return (
    <>
      <PageHeader
        title="배경 & 입체감"
        description="Podo UI의 Background와 Elevation 유틸리티 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>배경 색상</h2>
        <p>
          Podo UI는 다양한 배경 색상을 제공합니다. 각 배경은 테마에 따라 자동으로 조정됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.container {
  background: color(bg-modal);
}

.card {
  background: color(bg-block);
}

.elevated {
  background: color(bg-elevation);
}

.elevated1 {
  background: color(bg-elevation-1);
}

.disabled {
  background: color(bg-disabled);
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>배경 색상 예제:</div>
          <div className={styles.bgGrid}>
            <div className={styles.bgBox} style={{ background: 'var(--bg-modal)' }}>
              <strong>bg-modal</strong>
              <span>모달/카드 배경</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-block)' }}>
              <strong>bg-block</strong>
              <span>블록 요소 배경</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-elevation)' }}>
              <strong>bg-elevation</strong>
              <span>입체감 배경</span>
            </div>
            <div className={styles.bgBox} style={{ background: 'var(--bg-elevation-1)' }}>
              <strong>bg-elevation-1</strong>
              <span>입체감 배경 1단계</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>입체감 (Elevation)</h2>
        <p>
          배경색의 미묘한 차이로 레이어 간의 깊이감을 표현할 수 있습니다.
          elevation 값이 높을수록 위에 떠있는 느낌을 줍니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>입체감 예제:</div>
          <div className={styles.elevationExample}>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-modal)' }}>
              <h3>Level 0</h3>
              <p>기본 배경</p>
            </div>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-elevation)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3>Level 1</h3>
              <p>약간 띄워진 느낌</p>
            </div>
            <div className={styles.elevationCard} style={{ background: 'var(--bg-elevation-1)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3>Level 2</h3>
              <p>더 띄워진 느낌</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>그림자 효과</h2>
        <p>배경색과 함께 box-shadow를 사용하여 입체감을 강조할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.card {
  background: color(bg-modal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.floatingButton {
  background: color(primary);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);

  &:hover {
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
  }
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>그림자 예제 (마우스를 올려보세요):</div>
          <div className={styles.shadowGrid}>
            <div className={styles.shadowBox} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              Shadow 1
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Shadow 2
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              Shadow 3
            </div>
            <div className={styles.shadowBox} style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
              Shadow 4
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 예제</h2>
        <p>배경과 입체감을 활용한 카드 디자인:</p>

        <div className={styles.demo}>
          <div className={styles.cardShowcase}>
            <div className={styles.showcaseCard}>
              <h3>기본 카드</h3>
              <p>bg-modal 배경과 기본 테두리</p>
            </div>
            <div className={styles.showcaseCard} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3>그림자 카드</h3>
              <p>bg-modal 배경과 그림자 효과</p>
            </div>
            <div className={styles.showcaseCard} style={{ background: 'var(--bg-elevation)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <h3>입체 카드</h3>
              <p>bg-elevation 배경과 강한 그림자</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

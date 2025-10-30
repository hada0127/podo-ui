import styles from './page.module.scss';

export default function Typography() {
  const displayStyles = [
    { name: 'display1', fontSize: '60px', fontWeight: 600, lineHeight: 1.2, mobile: '36px' },
    { name: 'display2', fontSize: '54px', fontWeight: 600, lineHeight: 1.2, mobile: '32px' },
    { name: 'display3', fontSize: '48px', fontWeight: 600, lineHeight: 1.2, mobile: '28px' },
    { name: 'display4', fontSize: '42px', fontWeight: 600, lineHeight: 1.2, mobile: '24px' },
    { name: 'display5', fontSize: '36px', fontWeight: 600, lineHeight: 1.2, mobile: '20px' },
    { name: 'display6', fontSize: '24px', fontWeight: 600, lineHeight: 1.4, mobile: '18px' },
    { name: 'display7', fontSize: '20px', fontWeight: 600, lineHeight: 1.6, mobile: '16px' },
  ];

  const paragraphStyles = [
    { name: 'p1', fontSize: '24px', fontWeight: 400, lineHeight: 1.4, mobile: '20px' },
    { name: 'p2', fontSize: '20px', fontWeight: 400, lineHeight: 1.6, mobile: '16px' },
    { name: 'p3', fontSize: '16px', fontWeight: 400, lineHeight: 1.6, mobile: '14px' },
    { name: 'p3-semibold', fontSize: '16px', fontWeight: 600, lineHeight: 1.6, mobile: '14px' },
    { name: 'p4', fontSize: '14px', fontWeight: 400, lineHeight: 1.6, mobile: '12px' },
    { name: 'p4-semibold', fontSize: '14px', fontWeight: 600, lineHeight: 1.6, mobile: '12px' },
    { name: 'p5', fontSize: '12px', fontWeight: 400, lineHeight: 1.6, mobile: '12px' },
    { name: 'p5-semibold', fontSize: '12px', fontWeight: 600, lineHeight: 1.6, mobile: '12px' },
  ];

  const headingStyles = [
    { name: 'h1', fontSize: '54px', fontWeight: 600, lineHeight: 1.2, mobile: '24px' },
    { name: 'h2', fontSize: '42px', fontWeight: 600, lineHeight: 1.2, mobile: '18px' },
    { name: 'h3', fontSize: '36px', fontWeight: 600, lineHeight: 1.2, mobile: '16px' },
  ];

  return (
    <>
      <section className={styles.section}>
        <h1>타이포그래피</h1>
        <p>Podo UI의 타이포그래피 시스템과 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>타이포그래피 시스템</h2>
        <p>
          Podo UI는 Display, Paragraph, Heading 스타일을 제공하며, 각 스타일은 모바일 환경에 맞춰 자동으로 조정됩니다.
          Pretendard 폰트를 기본으로 사용합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Display 스타일</h2>
        <p>대형 제목과 히어로 섹션에 사용되는 Display 스타일입니다.</p>

        <div className={styles.typeGrid}>
          {displayStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                <div className={style.name}>타이포그래피</div>
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>Size:</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>Weight:</strong> {style.fontWeight}</div>
                  <div><strong>Line Height:</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Paragraph 스타일</h2>
        <p>본문과 설명 텍스트에 사용되는 Paragraph 스타일입니다.</p>

        <div className={styles.typeGrid}>
          {paragraphStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                <div className={style.name}>
                  본문 텍스트는 읽기 쉽고 명확해야 합니다.
                </div>
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>Size:</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>Weight:</strong> {style.fontWeight}</div>
                  <div><strong>Line Height:</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Heading 스타일</h2>
        <p>기본 HTML 태그에 자동으로 적용되는 스타일입니다.</p>

        <div className={styles.typeGrid}>
          {headingStyles.map((style) => (
            <div key={style.name} className={styles.typeCard}>
              <div className={styles.typePreview}>
                {style.name === 'h1' && <h2>Heading 1</h2>}
                {style.name === 'h2' && <h2>Heading 2</h2>}
                {style.name === 'h3' && <h2>Heading 3</h2>}
              </div>
              <div className={styles.typeInfo}>
                <h2>{style.name}</h2>
                <div className={styles.typeSpecs}>
                  <div><strong>Size:</strong> {style.fontSize} (Mobile: {style.mobile})</div>
                  <div><strong>Weight:</strong> {style.fontWeight}</div>
                  <div><strong>Line Height:</strong> {style.lineHeight}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>CSS 클래스로 사용하기</h2>
        <p>HTML 요소에 직접 타이포그래피 클래스를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Display 스타일 -->
<div class="display1">대형 제목</div>
<div class="display4">중형 제목</div>
<div class="display7">소형 제목</div>

<!-- Paragraph 스타일 -->
<p class="p1">큰 본문 텍스트</p>
<p class="p3">일반 본문 텍스트</p>
<p class="p3-semibold">강조된 본문 텍스트</p>
<p class="p5">작은 본문 텍스트</p>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className="display4" style={{ marginBottom: '16px' }}>Display 4 제목</div>
          <div className="p2" style={{ marginBottom: '12px' }}>P2 크기의 본문 텍스트입니다.</div>
          <div className="p3">P3 크기의 본문 텍스트입니다.</div>
          <div className="p3-semibold">P3 Semibold 강조된 텍스트입니다.</div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 믹스인을 사용하여 타이포그래피를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.title {
  @include display3;
  margin-bottom: s(5);
}

.subtitle {
  @include display6;
  color: color(default-deep);
}

.body {
  @include p3;
  line-height: 1.8;
}

.caption {
  @include p5;
  color: color(default);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>폰트 패밀리</h2>
        <p>기본 폰트로 Pretendard를 사용하며, CSS 변수로 커스터마이징이 가능합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>CSS</div>
          <pre><code>{`:root {
  --base-font-family: 'Pretendard', sans-serif;
}

/* 커스텀 폰트 사용 */
:root {
  --base-font-family: 'Your Custom Font', -apple-system, sans-serif;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>반응형</h2>
        <p>모든 타이포그래피 스타일은 모바일 환경에 맞춰 자동으로 크기가 조정됩니다.</p>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>팁:</strong> 모바일 브레이크포인트는 768px 이하입니다. 창 크기를 조정하여 타이포그래피 변화를 확인해보세요.
          </div>
        </div>
      </section>
    </>
  );
}

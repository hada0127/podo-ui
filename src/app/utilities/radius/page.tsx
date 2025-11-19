'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Radius() {
  const t = useTranslations('radius');
  return (
    <>
      <section className={styles.section}>
        <h1>모서리 반경</h1>
        <p>Podo UI의 Border Radius 유틸리티 클래스 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          Podo UI는 0부터 full까지 8단계의 border-radius 값을 제공합니다.
          <code>r()</code> 함수 또는 CSS 클래스로 사용할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="r-0">반경 없음</div>
<div class="r-2">반경 4px</div>
<div class="r-4">반경 8px</div>
<div class="r-full">완전히 둥글게</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>모든 반경 값</h2>
        <p>사용 가능한 모든 border-radius 값입니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.radiusGrid}>
            <div className={styles.radiusBox} style={{ borderRadius: '0' }}>
              <div>r-0</div>
              <span>0px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '2px' }}>
              <div>r-1</div>
              <span>2px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '4px' }}>
              <div>r-2</div>
              <span>4px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '6px' }}>
              <div>r-3</div>
              <span>6px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '8px' }}>
              <div>r-4</div>
              <span>8px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '12px' }}>
              <div>r-5</div>
              <span>12px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '20px' }}>
              <div>r-6</div>
              <span>20px</span>
            </div>
            <div className={styles.radiusBox} style={{ borderRadius: '9999px' }}>
              <div>r-full</div>
              <span>9999px</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 <code>r()</code> 함수를 사용하여 border-radius를 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.button {
  border-radius: r(2);  // 4px
}

.card {
  border-radius: r(4);  // 8px
}

.modal {
  border-radius: r(5);  // 12px
}

.avatar {
  border-radius: r(full);  // 완전히 둥글게
  width: 40px;
  height: 40px;
}

.badge {
  border-radius: r(6);  // 20px
  padding: s(2) s(4);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 예제</h2>
        <p>다양한 border-radius를 활용한 예제:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>버튼 예제:</div>
          <div className={styles.buttonExample}>
            <button style={{ borderRadius: '4px' }}>r-2 버튼</button>
            <button style={{ borderRadius: '8px' }}>r-4 버튼</button>
            <button style={{ borderRadius: '9999px' }}>r-full 버튼</button>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>카드 예제:</div>
          <div className={styles.cardExample}>
            <div className={styles.card} style={{ borderRadius: '6px' }}>
              <h2>r-3 카드</h2>
              <p>6px 반경의 모서리</p>
            </div>
            <div className={styles.card} style={{ borderRadius: '12px' }}>
              <h2>r-5 카드</h2>
              <p>12px 반경의 모서리</p>
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>아바타 예제:</div>
          <div className={styles.avatarExample}>
            <div className={styles.avatar} style={{ borderRadius: '8px' }}>
              <span>A</span>
            </div>
            <div className={styles.avatar} style={{ borderRadius: '9999px' }}>
              <span>B</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

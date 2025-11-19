'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Grid() {
  const t = useTranslations('grid');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>그리드 시스템</h2>
        <p>
          Podo UI는 반응형 그리드 시스템을 제공합니다.
          PC에서는 12칸, 태블릿에서는 6칸, 모바일에서는 4칸으로 자동 조정됩니다.
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="12">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>PC (1280px~)</h2>
            <p>12칸 그리드</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>Tablet (768px~1279px)</h2>
            <p>6칸 그리드</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>Mobile (~767px)</h2>
            <p>4칸 그리드</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>기본 그리드</h2>
        <p>grid 클래스를 사용하여 자동 반응형 그리드를 생성합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<section class="grid">
  <div class="w-4">4칸 (33.33%)</div>
  <div class="w-4">4칸 (33.33%)</div>
  <div class="w-4">4칸 (33.33%)</div>
  <div class="w-6">6칸 (50%)</div>
  <div class="w-6">6칸 (50%)</div>
  <div class="w-12">12칸 (100%)</div>
</section>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <section className="grid">
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-6">
              <div className={styles.gridItem}>w-6</div>
            </div>
            <div className="w-6">
              <div className={styles.gridItem}>w-6</div>
            </div>
            <div className="w-12">
              <div className={styles.gridItem}>w-12</div>
            </div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <h2>그리드 칸 크기</h2>
        <p>w-1부터 w-12까지 사용 가능합니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>모든 칸 크기:</div>
          <section className="grid">
            <div className="w-12"><div className={styles.gridItem}>w-12 (100%)</div></div>
            <div className="w-11"><div className={styles.gridItem}>w-11</div></div>
            <div className="w-1"><div className={styles.gridItem}>w-1</div></div>
            <div className="w-10"><div className={styles.gridItem}>w-10</div></div>
            <div className="w-2"><div className={styles.gridItem}>w-2</div></div>
            <div className="w-9"><div className={styles.gridItem}>w-9</div></div>
            <div className="w-3"><div className={styles.gridItem}>w-3</div></div>
            <div className="w-8"><div className={styles.gridItem}>w-8</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-7"><div className={styles.gridItem}>w-7</div></div>
            <div className="w-5"><div className={styles.gridItem}>w-5</div></div>
            <div className="w-6"><div className={styles.gridItem}>w-6</div></div>
            <div className="w-6"><div className={styles.gridItem}>w-6</div></div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <h2>고정 칼럼 그리드</h2>
        <p>grid-fix-N 클래스를 사용하여 고정된 칼럼 수의 그리드를 만들 수 있습니다 (2~6칸):</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 2칸 고정 그리드 -->
<section class="grid grid-fix-2">
  <div class="w-1_2">50%</div>
  <div class="w-1_2">50%</div>
</section>

<!-- 3칸 고정 그리드 -->
<section class="grid grid-fix-3">
  <div class="w-1_3">33.33%</div>
  <div class="w-2_3">66.67%</div>
</section>

<!-- 4칸 고정 그리드 -->
<section class="grid grid-fix-4">
  <div class="w-1_4">25%</div>
  <div class="w-3_4">75%</div>
</section>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>2칸 고정 (grid-fix-2):</div>
          <section className="grid grid-fix-2">
            <div className="w-1_2"><div className={styles.gridItem}>w-1_2 (50%)</div></div>
            <div className="w-1_2"><div className={styles.gridItem}>w-1_2 (50%)</div></div>
          </section>

          <div className={styles.demoTitle}>3칸 고정 (grid-fix-3):</div>
          <section className="grid grid-fix-3">
            <div className="w-1_3"><div className={styles.gridItem}>w-1_3</div></div>
            <div className="w-2_3"><div className={styles.gridItem}>w-2_3</div></div>
          </section>

          <div className={styles.demoTitle}>4칸 고정 (grid-fix-4):</div>
          <section className="grid grid-fix-4">
            <div className="w-1_4"><div className={styles.gridItem}>w-1_4</div></div>
            <div className="w-1_4"><div className={styles.gridItem}>w-1_4</div></div>
            <div className="w-2_4"><div className={styles.gridItem}>w-2_4</div></div>
          </section>

          <div className={styles.demoTitle}>5칸 고정 (grid-fix-5):</div>
          <section className="grid grid-fix-5">
            <div className="w-2_5"><div className={styles.gridItem}>w-2_5</div></div>
            <div className="w-3_5"><div className={styles.gridItem}>w-3_5</div></div>
          </section>

          <div className={styles.demoTitle}>6칸 고정 (grid-fix-6):</div>
          <section className="grid grid-fix-6">
            <div className="w-2_6"><div className={styles.gridItem}>w-2_6</div></div>
            <div className="w-4_6"><div className={styles.gridItem}>w-4_6</div></div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <h2>전체 너비</h2>
        <p>w-full 클래스는 현재 그리드의 전체 너비를 차지합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<section class="grid">
  <div class="w-4">4칸</div>
  <div class="w-4">4칸</div>
  <div class="w-4">4칸</div>
  <div class="w-full">전체 너비 (PC: 12칸, Tablet: 6칸, Mobile: 4칸)</div>
</section>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <section className="grid">
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-full"><div className={styles.gridItem}>w-full</div></div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <h2>반응형 동작</h2>
        <p>그리드는 화면 크기에 따라 자동으로 조정됩니다. 브라우저 창 크기를 조절하여 확인해보세요:</p>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>브레이크포인트:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>PC: 1280px 이상 (12칸 그리드, 간격 24px)</li>
              <li>Tablet: 768px ~ 1279px (6칸 그리드, 간격 16px)</li>
              <li>Mobile: 767px 이하 (4칸 그리드, 간격 16px)</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

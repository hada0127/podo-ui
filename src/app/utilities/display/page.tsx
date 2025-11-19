'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Display() {
  const t = useTranslations('display');
  return (
    <>
      <section className={styles.section}>
        <h1>표시 & 가시성</h1>
        <p>Podo UI의 Display와 Visibility 유틸리티 클래스 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>반응형 숨김 클래스</h2>
        <p>
          특정 디바이스에서만 요소를 숨기는 클래스를 제공합니다.
          브라우저 창 크기를 조절하여 확인해보세요.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 모든 디바이스에서 숨김 -->
<div class="hide">항상 숨김</div>

<!-- PC에서만 숨김 (1280px 이상) -->
<div class="hide-pc">PC에서만 숨김</div>

<!-- Tablet에서만 숨김 (768px ~ 1279px) -->
<div class="hide-tb">Tablet에서만 숨김</div>

<!-- Mobile에서만 숨김 (767px 이하) -->
<div class="hide-mo">Mobile에서만 숨김</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (창 크기를 조절해보세요):</div>
          <div className={styles.hideDemo}>
            <div className="hide-pc">
              <div className={styles.demoBox}>PC에서 숨김</div>
            </div>
            <div className="hide-tb">
              <div className={styles.demoBox}>Tablet에서 숨김</div>
            </div>
            <div className="hide-mo">
              <div className={styles.demoBox}>Mobile에서 숨김</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>브레이크포인트</h2>
        <p>Podo UI의 반응형 브레이크포인트:</p>
        <ul>
          <li><strong>PC:</strong> 1280px 이상</li>
          <li><strong>Tablet:</strong> 768px ~ 1279px</li>
          <li><strong>Mobile:</strong> 767px 이하</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>SCSS 미디어 쿼리</h2>
        <p>SCSS에서 미디어 쿼리 믹스인을 사용하여 반응형 스타일을 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.container {
  padding: s(8);

  // PC (1280px 이상)
  @include pc {
    max-width: 1200px;
    margin: 0 auto;
  }

  // Tablet (768px ~ 1279px)
  @include tb {
    padding: s(6);
  }

  // Mobile (767px 이하)
  @include mo {
    padding: s(4);
  }
}

.sidebar {
  display: block;

  @include mo {
    display: none; // 모바일에서 숨김
  }
}

.mobileMenu {
  display: none;

  @include mo {
    display: block; // 모바일에서만 표시
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>현재 화면 크기</h2>
        <p>현재 보고 계신 화면의 디바이스 타입입니다:</p>

        <div className={styles.demo}>
          <div className={styles.deviceIndicator}>
            <div className="hide-tb hide-mo">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>현재: PC</strong>
                  <p>1280px 이상</p>
                </div>
              </div>
            </div>
            <div className="hide-pc hide-mo">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>현재: Tablet</strong>
                  <p>768px ~ 1279px</p>
                </div>
              </div>
            </div>
            <div className="hide-pc hide-tb">
              <div className={styles.deviceBox}>
                <i className="icon-menu"></i>
                <div>
                  <strong>현재: Mobile</strong>
                  <p>767px 이하</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 예제</h2>
        <p>반응형 레이아웃 예제:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 데스크톱 네비게이션 -->
<nav class="hide-mo">
  <a href="/">홈</a>
  <a href="/about">소개</a>
  <a href="/contact">연락처</a>
</nav>

<!-- 모바일 햄버거 메뉴 -->
<button class="hide-pc hide-tb">
  <i class="icon-menu"></i>
</button>

<!-- 반응형 그리드 -->
<section class="grid">
  <div class="w-4 hide-mo">사이드바 (모바일에서 숨김)</div>
  <div class="w-8">메인 컨텐츠</div>
</section>`}</code></pre>
        </div>
      </section>
    </>
  );
}

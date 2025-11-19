'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Tab() {
  const t = useTranslations('tab');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          <code>ul.tabs</code> 구조를 사용하면 탭 네비게이션 스타일이 자동으로 적용됩니다.
          활성화된 탭에는 <code>.on</code> 클래스를 추가합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<ul class="tabs">
  <li class="on">
    <a href="#tab1">탭 1</a>
  </li>
  <li>
    <a href="#tab2">탭 2</a>
  </li>
  <li>
    <a href="#tab3">탭 3</a>
  </li>
</ul>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">탭 1</a>
            </li>
            <li>
              <a href="#tab2">탭 2</a>
            </li>
            <li>
              <a href="#tab3">탭 3</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Fill 스타일</h2>
        <p>
          <code>.fill</code> 클래스를 추가하면 각 탭이 동일한 너비로 확장되어 전체 너비를 채웁니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<ul class="tabs fill">
  <li class="on">
    <a href="#tab1">홈</a>
  </li>
  <li>
    <a href="#tab2">프로필</a>
  </li>
  <li>
    <a href="#tab3">설정</a>
  </li>
</ul>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <ul className="tabs fill">
            <li className="on">
              <a href="#tab1">홈</a>
            </li>
            <li>
              <a href="#tab2">프로필</a>
            </li>
            <li>
              <a href="#tab3">설정</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>많은 탭</h2>
        <p>탭이 많을 경우 자동으로 가로 스크롤이 가능합니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">전체</a>
            </li>
            <li>
              <a href="#tab2">공지사항</a>
            </li>
            <li>
              <a href="#tab3">이벤트</a>
            </li>
            <li>
              <a href="#tab4">프로모션</a>
            </li>
            <li>
              <a href="#tab5">FAQ</a>
            </li>
            <li>
              <a href="#tab6">고객센터</a>
            </li>
            <li>
              <a href="#tab7">문의</a>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실제 사용 예제</h2>
        <p>탭과 콘텐츠를 함께 사용한 예제입니다:</p>

        <div className={styles.demo}>
          <ul className="tabs">
            <li className="on">
              <a href="#overview">개요</a>
            </li>
            <li>
              <a href="#features">기능</a>
            </li>
            <li>
              <a href="#pricing">가격</a>
            </li>
          </ul>

          <div className={styles.tabContent}>
            <div className={styles.tabPanel}>
              <h2>개요</h2>
              <p>Podo UI는 현대적인 디자인 시스템입니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

ul.tabs {
  padding: 0;
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px inset color(border);

  // Fill 스타일
  &.fill > li {
    flex: 1;
  }

  > li {
    text-align: center;
    padding: 0;

    > a {
      @include p3;
      display: block;
      padding: s(2) s(5);
      color: color(text-sub);

      &:hover {
        color: inherit;
      }

      &:focus-visible:not(:disabled) {
        outline: 4px solid color(primary-outline);
      }
    }

    // 활성 탭
    &.on > a {
      @include p3-semibold;
      color: color(primary) !important;
      border-bottom: 1px inset color(primary);
      margin-bottom: -1px;
    }
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Select() {
  const t = useTranslations('select');
  return (
    <>
      <section className={styles.section}>
        <h1>선택</h1>
        <p>Podo UI의 Select 컴포넌트와 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML select 태그를 사용하여 드롭다운 선택 메뉴를 만들 수 있습니다.
          Podo UI는 커스텀 화살표 아이콘과 스타일을 자동으로 적용합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<select>
  <option value="" disabled selected>선택하세요</option>
  <option value="1">옵션 1</option>
  <option value="2">옵션 2</option>
  <option value="3">옵션 3</option>
</select>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.selectGroup}>
            <select>
              <option value="" disabled selected>선택하세요</option>
              <option value="1">옵션 1</option>
              <option value="2">옵션 2</option>
              <option value="3">옵션 3</option>
            </select>
            <select defaultValue="2">
              <option value="1">서울</option>
              <option value="2">부산</option>
              <option value="3">대구</option>
              <option value="4">인천</option>
            </select>
            <select disabled>
              <option>비활성화</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Placeholder 스타일</h2>
        <p>
          첫 번째 option에 <code>value=""</code>, <code>disabled</code>, <code>selected</code> 속성을 함께 사용하면
          placeholder처럼 보이며, 선택 후 자동으로 숨겨집니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<select>
  <option value="" disabled selected>카테고리를 선택하세요</option>
  <option value="electronics">전자제품</option>
  <option value="fashion">패션</option>
  <option value="food">식품</option>
</select>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.selectGroup}>
            <select>
              <option value="" disabled selected>카테고리를 선택하세요</option>
              <option value="electronics">전자제품</option>
              <option value="fashion">패션</option>
              <option value="food">식품</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘과 함께 사용</h2>
        <p>
          <code>.with-icon</code> 클래스로 감싸면 왼쪽에 아이콘을 추가할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="with-icon">
  <i class="icon-user"></i>
  <select>
    <option value="" disabled selected>사용자 선택</option>
    <option value="admin">관리자</option>
    <option value="user">일반 사용자</option>
    <option value="guest">게스트</option>
  </select>
</div>

<div class="with-icon">
  <i class="icon-globe"></i>
  <select>
    <option value="" disabled selected>언어 선택</option>
    <option value="ko">한국어</option>
    <option value="en">English</option>
    <option value="ja">日本語</option>
  </select>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.selectGroup}>
            <div className="with-icon">
              <i className="icon-user"></i>
              <select>
                <option value="" disabled selected>사용자 선택</option>
                <option value="admin">관리자</option>
                <option value="user">일반 사용자</option>
                <option value="guest">게스트</option>
              </select>
            </div>
            <div className="with-icon">
              <i className="icon-globe"></i>
              <select>
                <option value="" disabled selected>언어 선택</option>
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Select 상태</h2>
        <p>다양한 상태의 select를 사용할 수 있습니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.selectGroup}>
            <div>
              <label className={styles.label}>기본</label>
              <select>
                <option value="" disabled selected>옵션 선택</option>
                <option value="1">옵션 1</option>
                <option value="2">옵션 2</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>비활성화</label>
              <select disabled>
                <option>비활성화된 select</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>다중 선택</label>
              <select multiple size={4}>
                <option value="1">옵션 1</option>
                <option value="2">옵션 2</option>
                <option value="3">옵션 3</option>
                <option value="4">옵션 4</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 select 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.customSelect {
  padding: s(3) s(7) s(3) s(5);
  border: 1px solid color(border);
  border-radius: r(3);
  background: color(bg-block);
  color: color(default-deep-base);
  outline: none;
  appearance: none;
  cursor: pointer;

  // 커스텀 화살표 (자동 포함됨)
  background-image: url('data:image/svg+xml,...');
  background-repeat: no-repeat;
  background-position: right 11px center;

  &:focus-visible:not(:disabled) {
    outline: 4px solid color(primary-outline);
  }

  &:disabled {
    color: color(text-action-disabled);
    background-color: color(bg-disabled);
    cursor: not-allowed;
  }
}

// 아이콘과 함께 사용
.withIcon {
  position: relative;
  display: inline-block;

  > i {
    position: absolute;
    left: s(3);
    top: 50%;
    transform: translateY(-50%);
    color: color(text-action);
    pointer-events: none;
  }

  > select {
    padding-left: s(8);
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

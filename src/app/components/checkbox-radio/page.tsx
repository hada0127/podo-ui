'use client';

import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function CheckboxRadio() {
  return (
    <>
      <PageHeader
        title="체크박스 & 라디오"
        description="Podo UI의 Checkbox와 Radio 컴포넌트 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>Checkbox 기본 사용법</h2>
        <p>
          HTML checkbox input을 사용하면 Podo UI의 커스텀 스타일이 자동으로 적용됩니다.
          SVG 기반의 체크 아이콘이 포함되어 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<label>
  <input type="checkbox" />
  체크박스 옵션
</label>

<label>
  <input type="checkbox" checked />
  체크된 상태
</label>

<label>
  <input type="checkbox" disabled />
  비활성화
</label>

<label>
  <input type="checkbox" checked disabled />
  체크됨 + 비활성화
</label>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" />
              체크박스 옵션
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              체크된 상태
            </label>
            <label>
              <input type="checkbox" disabled />
              비활성화
            </label>
            <label>
              <input type="checkbox" defaultChecked disabled />
              체크됨 + 비활성화
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Indeterminate 상태</h2>
        <p>
          JavaScript로 <code>indeterminate</code> 상태를 설정할 수 있습니다.
          부분 선택 상태를 나타낼 때 유용합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
          <pre><code>{`const checkbox = document.querySelector('#myCheckbox');
checkbox.indeterminate = true;`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                ref={(el) => el && (el.indeterminate = true)}
              />
              Indeterminate 상태
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Radio 기본 사용법</h2>
        <p>
          Radio 버튼은 여러 옵션 중 하나만 선택할 수 있습니다.
          같은 <code>name</code> 속성을 가진 radio들이 하나의 그룹을 형성합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<label>
  <input type="radio" name="option" value="1" checked />
  옵션 1
</label>

<label>
  <input type="radio" name="option" value="2" />
  옵션 2
</label>

<label>
  <input type="radio" name="option" value="3" />
  옵션 3
</label>

<label>
  <input type="radio" name="option" value="4" disabled />
  비활성화된 옵션
</label>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.radioGroup}>
            <label>
              <input type="radio" name="example1" value="1" defaultChecked />
              옵션 1
            </label>
            <label>
              <input type="radio" name="example1" value="2" />
              옵션 2
            </label>
            <label>
              <input type="radio" name="example1" value="3" />
              옵션 3
            </label>
            <label>
              <input type="radio" name="example1" value="4" disabled />
              비활성화된 옵션
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Checkbox 그룹 예제</h2>
        <p>여러 개의 체크박스를 사용한 실제 예제입니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>관심 분야 선택:</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" name="interests" value="design" />
              디자인
            </label>
            <label>
              <input type="checkbox" name="interests" value="development" />
              개발
            </label>
            <label>
              <input type="checkbox" name="interests" value="marketing" />
              마케팅
            </label>
            <label>
              <input type="checkbox" name="interests" value="business" />
              비즈니스
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Radio 그룹 예제</h2>
        <p>여러 개의 라디오 버튼을 사용한 실제 예제입니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>결제 방법 선택:</div>
          <div className={styles.radioGroup}>
            <label>
              <input type="radio" name="payment" value="card" defaultChecked />
              신용카드
            </label>
            <label>
              <input type="radio" name="payment" value="bank" />
              계좌이체
            </label>
            <label>
              <input type="radio" name="payment" value="mobile" />
              휴대폰 결제
            </label>
            <label>
              <input type="radio" name="payment" value="kakao" />
              카카오페이
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>체크박스와 라디오의 스타일은 자동으로 적용되지만, 추가 커스터마이징이 가능합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.checkboxWrapper {
  display: flex;
  flex-direction: column;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    gap: s(2);
    cursor: pointer;
    user-select: none;

    input[type='checkbox'] {
      margin-right: s(2);
    }

    &:hover {
      color: color(primary);
    }
  }
}

.radioWrapper {
  display: flex;
  flex-direction: column;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    cursor: pointer;

    input[type='radio'] {
      margin-right: s(2);
    }
  }
}

// 커스텀 스타일
.customCheckbox {
  input[type='checkbox']:focus-visible {
    outline: 4px solid color(primary-outline);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>다크 모드</h2>
        <p>
          Podo UI는 체크박스와 라디오 버튼에 대한 다크 모드를 자동으로 지원합니다.
          오른쪽 상단의 테마 토글 버튼으로 확인해보세요.
        </p>
      </section>
    </>
  );
}

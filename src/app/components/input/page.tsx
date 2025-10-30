import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Input() {
  return (
    <>
      <PageHeader
        title="입력"
        description="Podo UI의 Input 컴포넌트와 다양한 변형 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML input 태그를 사용하여 텍스트 입력 필드를 만들 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="text" placeholder="텍스트를 입력하세요" />
<input type="email" placeholder="이메일을 입력하세요" />
<input type="password" placeholder="비밀번호를 입력하세요" />
<input type="number" placeholder="숫자를 입력하세요" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="텍스트를 입력하세요" />
            <input type="email" placeholder="이메일을 입력하세요" />
            <input type="password" placeholder="비밀번호를 입력하세요" />
            <input type="number" placeholder="숫자를 입력하세요" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input 타입</h2>
        <p>다양한 input 타입을 지원합니다:</p>

        <div className={styles.typeGrid}>
          <div className={styles.typeCard}>
            <label>Text</label>
            <input type="text" placeholder="일반 텍스트" />
          </div>
          <div className={styles.typeCard}>
            <label>Email</label>
            <input type="email" placeholder="example@email.com" />
          </div>
          <div className={styles.typeCard}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className={styles.typeCard}>
            <label>Number</label>
            <input type="number" placeholder="123" />
          </div>
          <div className={styles.typeCard}>
            <label>Tel</label>
            <input type="tel" placeholder="010-1234-5678" />
          </div>
          <div className={styles.typeCard}>
            <label>URL</label>
            <input type="url" placeholder="https://example.com" />
          </div>
          <div className={styles.typeCard}>
            <label>Date</label>
            <input type="date" />
          </div>
          <div className={styles.typeCard}>
            <label>Time</label>
            <input type="time" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input 상태</h2>
        <p>다양한 상태의 input을 사용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 -->
<input type="text" placeholder="기본 상태" />

<!-- 비활성화 -->
<input type="text" placeholder="비활성화" disabled />

<!-- 읽기 전용 -->
<input type="text" value="읽기 전용" readonly />

<!-- 필수 -->
<input type="text" placeholder="필수 입력" required />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="기본 상태" />
            <input type="text" placeholder="비활성화" disabled />
            <input type="text" value="읽기 전용" readOnly />
            <input type="text" placeholder="필수 입력" required />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘과 함께 사용</h2>
        <p>input 필드에 아이콘을 추가하여 더욱 직관적인 UI를 만들 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="input-wrapper">
  <i class="icon-search"></i>
  <input type="text" placeholder="검색..." />
</div>

<div class="input-wrapper">
  <i class="icon-mail"></i>
  <input type="email" placeholder="이메일" />
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <i className="icon-search"></i>
              <input type="text" placeholder="검색..." />
            </div>
            <div className={styles.inputWrapper}>
              <i className="icon-mail"></i>
              <input type="email" placeholder="이메일" />
            </div>
            <div className={styles.inputWrapper}>
              <i className="icon-user"></i>
              <input type="text" placeholder="사용자명" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 input 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.inputWrapper {
  position: relative;
  display: inline-flex;
  align-items: center;

  i {
    position: absolute;
    left: s(4);
    font-size: 18px;
    color: color(default-base);
  }

  input {
    padding-left: s(10);
  }
}

.customInput {
  width: 100%;
  padding: s(3) s(4);
  border: 1px solid color(default-outline);
  border-radius: r(3);
  background: color(bg-modal);
  color: color(default-deep-base);
  transition: all 0.3s;

  &:focus {
    border-color: color(primary-base);
    outline: none;
    box-shadow: 0 0 0 3px color(primary-fill);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: color(default-base);
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

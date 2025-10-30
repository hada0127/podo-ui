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
        <h2>지원하는 Input 타입</h2>
        <p>Podo UI는 다음 12가지 input 타입을 지원합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="text" placeholder="일반 텍스트" />
<input type="email" placeholder="이메일" />
<input type="password" placeholder="비밀번호" />
<input type="number" placeholder="숫자" />
<input type="tel" placeholder="전화번호" />
<input type="url" placeholder="URL" />
<input type="search" placeholder="검색" />
<input type="date" />
<input type="time" />
<input type="month" />
<input type="week" />
<input type="datetime-local" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <label>text</label>
              <input type="text" placeholder="일반 텍스트" />
            </div>
            <div className={styles.typeCard}>
              <label>email</label>
              <input type="email" placeholder="example@email.com" />
            </div>
            <div className={styles.typeCard}>
              <label>password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className={styles.typeCard}>
              <label>number</label>
              <input type="number" placeholder="123" />
            </div>
            <div className={styles.typeCard}>
              <label>tel</label>
              <input type="tel" placeholder="010-1234-5678" />
            </div>
            <div className={styles.typeCard}>
              <label>url</label>
              <input type="url" placeholder="https://example.com" />
            </div>
            <div className={styles.typeCard}>
              <label>search</label>
              <input type="search" placeholder="검색..." />
            </div>
            <div className={styles.typeCard}>
              <label>date</label>
              <input type="date" />
            </div>
            <div className={styles.typeCard}>
              <label>time</label>
              <input type="time" />
            </div>
            <div className={styles.typeCard}>
              <label>month</label>
              <input type="month" />
            </div>
            <div className={styles.typeCard}>
              <label>week</label>
              <input type="week" />
            </div>
            <div className={styles.typeCard}>
              <label>datetime-local</label>
              <input type="datetime-local" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input 상태</h2>
        <p>
          <code>.success</code>, <code>.danger</code> 클래스로 유효성 검증 상태를 표시할 수 있으며,
          <code>disabled</code>, <code>readonly</code> 속성으로 비활성화 및 읽기 전용 상태를 만들 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 -->
<input type="text" placeholder="기본 상태" />

<!-- 성공 (유효한 입력) -->
<input type="text" class="success" value="valid@email.com" />

<!-- 위험 (유효하지 않은 입력) -->
<input type="text" class="danger" value="invalid-email" />

<!-- 비활성화 -->
<input type="text" placeholder="비활성화" disabled />

<!-- 읽기 전용 -->
<input type="text" value="읽기 전용 텍스트" readonly />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="기본 상태" />
            <input type="text" className="success" value="valid@email.com" />
            <input type="text" className="danger" value="invalid-email" />
            <input type="text" placeholder="비활성화" disabled />
            <input type="text" value="읽기 전용 텍스트" readOnly />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// Success 상태 (border: 1px solid color('success'))
input.success {
  border-color: color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

// Danger 상태 (border: 1px solid color('danger'))
input.danger {
  border-color: color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// Disabled 상태
input:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// Read-only 상태
input:read-only {
  border: none;
  cursor: default;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input 변형</h2>
        <p>
          <code>.fill</code>, <code>.text</code>, <code>.underline</code> 클래스로 다양한 스타일 변형을 사용할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 -->
<input type="text" placeholder="기본 스타일" />

<!-- Fill (채워진 배경) -->
<input type="text" class="fill" placeholder="채워진 배경" />

<!-- Text (테두리 없음) -->
<input type="text" class="text" placeholder="텍스트만" />

<!-- Underline (밑줄만) -->
<input type="text" class="underline" placeholder="밑줄 스타일" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="기본 스타일" />
            <input type="text" className="fill" placeholder="채워진 배경" />
            <input type="text" className="text" placeholder="텍스트만" />
            <input type="text" className="underline" placeholder="밑줄 스타일" />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// Fill 변형 (background-color: color('default-fill'))
input.fill {
  background-color: color('default-fill');
}

// Text 변형 (border: none)
input.text {
  border: none;
}

// Underline 변형 (border-bottom만 표시, border-radius: 0)
input.underline {
  border: none;
  border-bottom: 1px solid color('border-disabled');
  border-radius: 0;

  &:focus-visible:not(:disabled) {
    border-bottom-color: color('primary-base');
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Input 크기</h2>
        <p>
          <code>.md</code>, <code>.lg</code> 클래스로 더 큰 크기의 input을 만들 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 크기 (padding: s(3) s(4), border-radius: r(3)) -->
<input type="text" placeholder="기본 크기" />

<!-- 중간 크기 (padding: s(4) s(4), border-radius: r(5)) -->
<input type="text" class="md" placeholder="중간 크기" />

<!-- 큰 크기 (padding: s(5) s(4), border-radius: r(6)) -->
<input type="text" class="lg" placeholder="큰 크기" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="기본 크기" />
            <input type="text" className="md" placeholder="중간 크기" />
            <input type="text" className="lg" placeholder="큰 크기" />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// 기본 크기
input {
  padding: s(3) s(4);
  border-radius: r(3);
}

// 중간 크기
input.md {
  padding: s(4) s(4);
  border-radius: r(5);
}

// 큰 크기
input.lg {
  padding: s(5) s(4);
  border-radius: r(6);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘과 함께 사용</h2>
        <p>
          <code>.with-icon</code> 또는 <code>.with-right-icon</code> 래퍼를 사용하여
          input 필드 왼쪽이나 오른쪽에 아이콘을 배치할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 왼쪽 아이콘 (input padding-left: s(8), 아이콘 left: s(3)) -->
<div class="with-icon">
  <i class="icon-search"></i>
  <input type="text" placeholder="검색..." />
</div>

<!-- 오른쪽 아이콘 (input padding-right: s(7), 아이콘 right: s(3)) -->
<div class="with-right-icon">
  <input type="email" placeholder="이메일" />
  <i class="icon-mail"></i>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <div className="with-icon">
              <i className="icon-search"></i>
              <input type="text" placeholder="검색..." />
            </div>
            <div className="with-icon">
              <i className="icon-user"></i>
              <input type="text" placeholder="사용자명" />
            </div>
            <div className="with-right-icon">
              <input type="email" placeholder="이메일" />
              <i className="icon-mail"></i>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// 왼쪽 아이콘
.with-icon {
  position: relative;

  > i {
    position: absolute;
    left: s(3);
    top: 50%;
    transform: translateY(-50%);
  }

  > input {
    padding-left: s(8);  // 아이콘 공간 확보
  }
}

// 오른쪽 아이콘
.with-right-icon {
  position: relative;

  > i {
    position: absolute;
    right: s(3);
    top: 50%;
    transform: translateY(-50%);
  }

  > input {
    padding-right: s(7);  // 아이콘 공간 확보
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 실제 input.scss 소스를 참조하여 스타일을 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

// 기본 input 스타일
input[type='text'],
input[type='email'],
input[type='password'] {
  @include p3;
  padding: s(3) s(4);
  background-color: color('bg-block');
  border-radius: r(3);
  border: 1px solid color('border-disabled');

  &:focus-visible:not(:disabled) {
    border-color: color('primary-base');
    outline: 4px solid color('primary-outline');
  }

  &::placeholder {
    color: color('placeholder');
  }
}

// Success/Danger 상태
input.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

input.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// 크기 변형
input.md {
  padding: s(4) s(4);
  border-radius: r(5);
}

input.lg {
  padding: s(5) s(4);
  border-radius: r(6);
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

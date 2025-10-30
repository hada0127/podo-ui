import PageHeader from '@/components/PageHeader';
import styles from './page.module.scss';

export default function Textarea() {
  return (
    <>
      <PageHeader
        title="텍스트 영역"
        description="Podo UI의 Textarea 컴포넌트와 사용법을 안내합니다"
      />

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML textarea 태그를 사용하여 여러 줄의 텍스트를 입력할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<textarea placeholder="내용을 입력하세요"></textarea>
<textarea placeholder="내용을 입력하세요" rows="5"></textarea>
<textarea placeholder="비활성화" disabled></textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.textareaGroup}>
            <textarea placeholder="내용을 입력하세요"></textarea>
            <textarea placeholder="내용을 입력하세요" rows={5}></textarea>
            <textarea placeholder="비활성화" disabled></textarea>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Textarea 크기 조절</h2>
        <p>
          <code>.resize-none</code> 클래스를 사용하여 크기 조절을 방지할 수 있습니다.
          기본적으로 textarea는 사용자가 크기를 조절할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 (크기 조절 가능) -->
<textarea rows="4" placeholder="크기 조절 가능"></textarea>

<!-- 크기 조절 방지 (resize: none) -->
<textarea class="resize-none" rows="4" placeholder="크기 고정"></textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.textareaGroup}>
            <div>
              <label className={styles.label}>크기 조절 가능</label>
              <textarea rows={4} placeholder="크기 조절 가능"></textarea>
            </div>
            <div>
              <label className={styles.label}>크기 고정 (.resize-none)</label>
              <textarea className="resize-none" rows={4} placeholder="크기 고정"></textarea>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`textarea.resize-none {
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Textarea 상태</h2>
        <p>
          <code>.success</code>, <code>.danger</code> 클래스로 유효성 검증 상태를 표시할 수 있으며,
          <code>disabled</code>, <code>readonly</code> 속성으로 비활성화 및 읽기 전용 상태를 만들 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 기본 -->
<textarea placeholder="기본 상태"></textarea>

<!-- 성공 (유효한 입력) -->
<textarea class="success">유효한 내용입니다.</textarea>

<!-- 위험 (유효하지 않은 입력) -->
<textarea class="danger">유효하지 않은 내용입니다.</textarea>

<!-- 비활성화 -->
<textarea placeholder="비활성화" disabled></textarea>

<!-- 읽기 전용 -->
<textarea readonly>읽기 전용 텍스트입니다.</textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.textareaGroup}>
            <div>
              <label className={styles.label}>기본 상태</label>
              <textarea rows={3} placeholder="기본 상태"></textarea>
            </div>
            <div>
              <label className={styles.label}>성공 상태 (.success)</label>
              <textarea className="success" rows={3} value="유효한 내용입니다." readOnly></textarea>
            </div>
            <div>
              <label className={styles.label}>위험 상태 (.danger)</label>
              <textarea className="danger" rows={3} value="유효하지 않은 내용입니다." readOnly></textarea>
            </div>
            <div>
              <label className={styles.label}>비활성화 (disabled)</label>
              <textarea rows={3} placeholder="비활성화" disabled></textarea>
            </div>
            <div>
              <label className={styles.label}>읽기 전용 (readonly)</label>
              <textarea className="resize-none" rows={3} readOnly value="읽기 전용 텍스트입니다."></textarea>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// Success 상태 (border: 1px solid color('success'))
textarea.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

// Danger 상태 (border: 1px solid color('danger'))
textarea.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// Disabled 상태
textarea:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// Read-only 상태 (border: none, resize: none)
textarea:read-only {
  border: none;
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 실제 textarea.scss 소스를 참조하여 스타일을 적용할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

// 기본 textarea 스타일
textarea {
  @include p3;
  padding: s(3) s(4);
  background-color: color('bg-block');
  border: 1px solid color('border');
  border-radius: r(2);

  &:focus-visible:not(:disabled) {
    border-color: color('primary-base');
    outline: 4px solid color('primary-outline');
  }

  &::placeholder {
    color: color('placeholder');
  }
}

// 크기 조절 방지
textarea.resize-none {
  resize: none;
}

// Success/Danger 상태
textarea.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

textarea.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// 비활성화 상태
textarea:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// 읽기 전용 상태
textarea:read-only {
  border: none;
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실전 예제</h2>
        <p>다양한 상황에서 textarea를 활용한 예제입니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>댓글 입력 폼:</div>
          <div style={{ maxWidth: '600px' }}>
            <textarea
              rows={4}
              placeholder="댓글을 입력하세요..."
              style={{ width: '100%', marginBottom: '8px' }}
            ></textarea>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--default-base)' }}>
              0 / 500자
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>피드백 폼:</div>
          <div style={{ maxWidth: '600px' }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>
              의견을 남겨주세요 *
            </label>
            <textarea
              className="resize-none"
              rows={6}
              placeholder="여러분의 소중한 의견을 들려주세요."
              style={{ width: '100%' }}
            ></textarea>
          </div>
        </div>
      </section>
    </>
  );
}

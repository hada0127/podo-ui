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
        <h2>Textarea 속성</h2>
        <p>다양한 속성으로 textarea를 제어할 수 있습니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.textareaGroup}>
            <div>
              <label className={styles.label}>기본 (3줄)</label>
              <textarea rows={3} placeholder="기본 textarea"></textarea>
            </div>
            <div>
              <label className={styles.label}>고정 크기 (resize 방지)</label>
              <textarea rows={4} style={{ resize: 'none' }} placeholder="크기 고정"></textarea>
            </div>
            <div>
              <label className={styles.label}>최대 길이 제한 (100자)</label>
              <textarea rows={4} maxLength={100} placeholder="최대 100자까지 입력 가능"></textarea>
            </div>
            <div>
              <label className={styles.label}>읽기 전용</label>
              <textarea rows={3} readOnly value="읽기 전용 텍스트입니다."></textarea>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 textarea 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.customTextarea {
  width: 100%;
  min-height: 120px;
  padding: s(4);
  border: 1px solid color(default-outline);
  border-radius: r(3);
  background: color(bg-modal);
  color: color(default-deep-base);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
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

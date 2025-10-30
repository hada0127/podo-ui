import styles from '../input/page.module.scss';

export default function File() {
  return (
    <>
      <section className={styles.section}>
        <h1>파일 업로드</h1>
        <p>Podo UI의 File Input 컴포넌트와 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML <code>input[type="file"]</code>을 사용하면 Podo UI의 커스텀 스타일이 자동으로 적용됩니다.
          업로드 클라우드 아이콘이 포함되어 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="file" />
<input type="file" multiple />
<input type="file" accept="image/*" />
<input type="file" disabled />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="file" />
            <input type="file" multiple />
            <input type="file" accept="image/*" />
            <input type="file" disabled />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>파일 타입 제한</h2>
        <p><code>accept</code> 속성으로 특정 파일 타입만 선택할 수 있도록 제한할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- 이미지만 -->
<input type="file" accept="image/*" />

<!-- PDF만 -->
<input type="file" accept=".pdf" />

<!-- 문서 파일 -->
<input type="file" accept=".doc,.docx,.pdf" />

<!-- 비디오만 -->
<input type="file" accept="video/*" />`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>다중 파일 선택</h2>
        <p><code>multiple</code> 속성으로 여러 파일을 동시에 선택할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="file" multiple />
<input type="file" accept="image/*" multiple />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.inputGroup}>
            <input type="file" multiple />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.fileInput {
  width: 100%;
  padding: s(3) s(4);
  border: 1px solid color(border-disabled);
  border-radius: r(3);
  background: color(bg-block);

  &::before {
    content: icon(upload-cloud);
    font-family: 'podo-ui-icon';
    font-size: 24px;
    color: color(default-deep-reverse);
  }

  &::file-selector-button {
    padding: s(3) s(8);
    border: none;
    border-radius: r(3) 0 0 r(3);
    background-color: color(default-deep);
    color: color(default-deep-reverse);
    cursor: pointer;
  }

  &:disabled {
    cursor: not-allowed;

    &::file-selector-button {
      background-color: color(bg-disabled);
      color: color(text-action-disabled);
    }
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

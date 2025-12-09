import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileInput } from 'podo-ui';
import styles from '../input/Page.module.scss';

export default function File() {
  const { t } = useTranslation('file');
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('react.title')}</h2>
        <p>{t('react.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>React</div>
          <pre><code>{`import { FileInput } from 'podo-ui'

const [files, setFiles] = useState<File[]>([]);

// 기본 사용
<FileInput onChange={(e) => console.log(e.target.files)} />

// 이미지만 허용
<FileInput accept="image/*" />

// 다중 선택 + 콜백
<FileInput
  multiple
  accept="image/*"
  onFileSelect={(files) => setFiles(files)}
/>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.callback.title')}</div>
          <div className={styles.inputGroup}>
            <FileInput
              multiple
              accept="image/*"
              onFileSelect={(selectedFiles) => setFiles(selectedFiles)}
            />
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              <strong>{t('react.selectedFiles')}:</strong>{' '}
              {files.length > 0
                ? files.map((f) => f.name).join(', ')
                : t('react.noFiles')}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<input type="file" />
<input type="file" multiple />
<input type="file" accept="image/*" />
<input type="file" disabled />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="file" />
            <input type="file" multiple />
            <input type="file" accept="image/*" />
            <input type="file" disabled />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('fileTypes.title')}</h2>
        <p>{t('fileTypes.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
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
        <h2>{t('multiple.title')}</h2>
        <p>{t('multiple.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<input type="file" multiple />
<input type="file" accept="image/*" multiple />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="file" multiple />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
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

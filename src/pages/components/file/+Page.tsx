import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileInput from '../../../components/FileInput';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function File() {
  const { t } = useTranslation('file');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <DocTabs
        tabs={[
          {
            key: 'scss',
            label: 'SCSS',
            content: <ScssContent t={t} />,
          },
          {
            key: 'react',
            label: 'React',
            content: <ReactContent t={t} />,
          },
        ]}
        defaultTab="scss"
      />
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<input type="file" />
<input type="file" multiple />
<input type="file" accept="image/*" />
<input type="file" disabled />`}
        />

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

      <section>
        <h2>{t('fileTypes.title')}</h2>
        <p>{t('fileTypes.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<!-- Images only -->
<input type="file" accept="image/*" />

<!-- PDF only -->
<input type="file" accept=".pdf" />

<!-- Documents -->
<input type="file" accept=".doc,.docx,.pdf" />

<!-- Videos only -->
<input type="file" accept="video/*" />`}
        />
      </section>

      <section>
        <h2>{t('multiple.title')}</h2>
        <p>{t('multiple.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<input type="file" multiple />
<input type="file" accept="image/*" multiple />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="file" multiple />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

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
}`}
        />
      </section>
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { FileInput } from 'podo-ui';`} />
      </section>

      <section>
        <h2>Props</h2>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>accept</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.accept')}</td>
            </tr>
            <tr>
              <td><code>multiple</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('react.props.multiple')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(e: ChangeEvent) =&gt; void</code></td>
              <td>-</td>
              <td>{t('react.props.onChange')}</td>
            </tr>
            <tr>
              <td><code>onFileSelect</code></td>
              <td><code>(files: File[]) =&gt; void</code></td>
              <td>-</td>
              <td>{t('react.props.onFileSelect')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('react.props.disabled')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.title')}</h2>
        <p>{t('react.description')}</p>

        <CodeBlock
          title="React"
          language="tsx"
          code={`import { FileInput } from 'podo-ui'

const [files, setFiles] = useState<File[]>([]);

// Basic usage
<FileInput onChange={(e) => console.log(e.target.files)} />

// Images only
<FileInput accept="image/*" />

// Multiple selection + callback
<FileInput
  multiple
  accept="image/*"
  onFileSelect={(files) => setFiles(files)}
/>`}
        />

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
    </>
  );
}

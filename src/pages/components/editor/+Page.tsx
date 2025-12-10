import { useState } from 'react';
import Editor from '../../../../react/atom/editor';
import EditorView from '../../../../react/atom/editor-view';
import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function EditorPage() {
  const { t } = useTranslation('editor');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <DocTabs
        tabs={[
          {
            key: 'react',
            label: 'React',
            content: <ReactContent t={t} />,
          },
        ]}
        defaultTab="react"
      />
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  const [content, setContent] = useState('');
  const [content2, setContent2] = useState('');
  const [content3, setContent3] = useState('');
  const [basicContent, setBasicContent] = useState('');
  const [advancedContent, setAdvancedContent] = useState('');

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Editor, EditorView } from 'podo-ui';`} />
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
              <td><code>value</code></td>
              <td><code>string</code></td>
              <td><code>''</code></td>
              <td>{t('props.value')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>function</code></td>
              <td>-</td>
              <td>{t('props.onChange')}</td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td><code>string | 'contents'</code></td>
              <td><code>'400px'</code></td>
              <td>{t('props.height')}</td>
            </tr>
            <tr>
              <td><code>minHeight</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.minHeight')}</td>
            </tr>
            <tr>
              <td><code>maxHeight</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.maxHeight')}</td>
            </tr>
            <tr>
              <td><code>width</code></td>
              <td><code>string</code></td>
              <td><code>'100%'</code></td>
              <td>{t('props.width')}</td>
            </tr>
            <tr>
              <td><code>resizable</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.resizable')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td><code>''</code></td>
              <td>{t('props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>validator</code></td>
              <td><code>z.ZodType</code></td>
              <td>-</td>
              <td>{t('props.validator')}</td>
            </tr>
            <tr>
              <td><code>toolbar</code></td>
              <td><code>ToolbarItem[]</code></td>
              <td>-</td>
              <td>{t('props.toolbar')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="tsx"
          code={`import { Editor } from 'podo-ui';

export default function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <Editor
      value={content}
      onChange={setContent}
      height="400px"
      placeholder="${t('overview.placeholder')}"
    />
  );
}`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <Editor
            value={content}
            onChange={setContent}
            height="400px"
            placeholder={t('overview.placeholder')}
          />
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.preview')}</div>
          <EditorView value={content} />
        </div>
      </section>

      <section>
        <h2>{t('features.title')}</h2>
        <ul>
          <li>{t('features.textFormat')}</li>
          <li>{t('features.font')}</li>
          <li>{t('features.paragraph')}</li>
          <li>{t('features.color')}</li>
          <li>{t('features.align')}</li>
          <li>{t('features.list')}</li>
          <li>{t('features.table')}</li>
          <li>{t('features.hr')}</li>
          <li>{t('features.link')}</li>
          <li>{t('features.youtube')}</li>
          <li>{t('features.code')}</li>
          <li>{t('features.format')}</li>
          <li>{t('features.undo')}</li>
        </ul>
      </section>

      <section>
        <h2>{t('height.title')}</h2>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="tsx"
          code={`<Editor
  value={content}
  onChange={setContent}
  height="contents"
  minHeight="150px"
  maxHeight="500px"
  placeholder="${t('height.autoPlaceholder')}"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('height.auto')}</div>
          <Editor
            value={content2}
            onChange={setContent2}
            height="contents"
            minHeight="150px"
            maxHeight="500px"
            placeholder={t('height.autoPlaceholder')}
          />
        </div>
      </section>

      <section>
        <h2>{t('resizable.title')}</h2>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="tsx"
          code={`<Editor
  value={content}
  onChange={setContent}
  height="300px"
  minHeight="200px"
  maxHeight="600px"
  resizable={true}
  placeholder="${t('resizable.placeholder')}"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('resizable.description')}</div>
          <Editor
            value={content3}
            onChange={setContent3}
            height="300px"
            minHeight="200px"
            maxHeight="600px"
            resizable={true}
            placeholder={t('resizable.placeholder')}
          />
        </div>
      </section>

      <section>
        <h2>{t('toolbar.title')}</h2>
        <p>{t('toolbar.description')}</p>
        <p><strong>{t('toolbar.note')}</strong></p>

        <h3>{t('toolbar.availableItems')}</h3>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>'undo-redo'</code></td>
              <td>{t('toolbar.items.undoRedo')}</td>
            </tr>
            <tr>
              <td><code>'paragraph'</code></td>
              <td>{t('toolbar.items.paragraph')}</td>
            </tr>
            <tr>
              <td><code>'text-style'</code></td>
              <td>{t('toolbar.items.textStyle')}</td>
            </tr>
            <tr>
              <td><code>'color'</code></td>
              <td>{t('toolbar.items.color')}</td>
            </tr>
            <tr>
              <td><code>'align'</code></td>
              <td>{t('toolbar.items.align')}</td>
            </tr>
            <tr>
              <td><code>'list'</code></td>
              <td>{t('toolbar.items.list')}</td>
            </tr>
            <tr>
              <td><code>'hr'</code></td>
              <td>{t('toolbar.items.hr')}</td>
            </tr>
            <tr>
              <td><code>'table'</code></td>
              <td>{t('toolbar.items.table')}</td>
            </tr>
            <tr>
              <td><code>'link'</code></td>
              <td>{t('toolbar.items.link')}</td>
            </tr>
            <tr>
              <td><code>'image'</code></td>
              <td>{t('toolbar.items.image')}</td>
            </tr>
            <tr>
              <td><code>'youtube'</code></td>
              <td>{t('toolbar.items.youtube')}</td>
            </tr>
            <tr>
              <td><code>'format'</code></td>
              <td>{t('toolbar.items.format')}</td>
            </tr>
            <tr>
              <td><code>'code'</code></td>
              <td>{t('toolbar.items.code')}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('toolbar.basicEditor')}</div>
          <Editor
            value={basicContent}
            onChange={setBasicContent}
            height="300px"
            placeholder={t('toolbar.basicPlaceholder')}
            toolbar={['undo-redo', 'text-style', 'paragraph', 'color']}
          />
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('toolbar.advancedEditor')}</div>
          <Editor
            value={advancedContent}
            onChange={setAdvancedContent}
            height="300px"
            placeholder={t('toolbar.advancedPlaceholder')}
            toolbar={[
              'undo-redo',
              'paragraph',
              'text-style',
              'color',
              'align',
              'list',
              'hr',
              'table',
              'link',
              'image',
              'code'
            ]}
          />
        </div>
      </section>

      <section>
        <h2>{t('editorView.title')}</h2>
        <p>{t('editorView.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="tsx"
          code={`import { EditorView } from 'podo-ui';

export default function MyComponent() {
  const htmlContent = '<h1>제목</h1><p>본문 내용</p>';

  return (
    <EditorView value={htmlContent} />
  );
}`}
        />

        <h3>{t('editorView.props.title')}</h3>
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
              <td><code>value</code></td>
              <td><code>string</code></td>
              <td><code>''</code></td>
              <td>{t('editorView.props.value')}</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('editorView.props.className')}</td>
            </tr>
          </tbody>
        </table>

        <h3>{t('editorView.features.title')}</h3>
        <ul>
          <li>{t('editorView.features.formatting')}</li>
          <li>{t('editorView.features.darkMode')}</li>
          <li>{t('editorView.features.code')}</li>
          <li>{t('editorView.features.responsive')}</li>
          <li>{t('editorView.features.readOnly')}</li>
        </ul>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('editorView.preview')}</div>
          <div style={{
            padding: '20px',
            background: 'var(--bg-elevation)',
            borderRadius: '8px'
          }}>
            <EditorView value={content} />
          </div>
        </div>
      </section>
    </>
  );
}

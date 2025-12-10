import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea as TextareaComponent } from 'podo-ui';
import { z } from 'zod';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Textarea() {
  const { t } = useTranslation('textarea');
  const [content, setContent] = useState('');

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
            content: <ReactContent t={t} content={content} setContent={setContent} />,
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
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/textarea';`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<textarea placeholder="${t('basicUsage.placeholders.content')}"></textarea>
<textarea placeholder="${t('basicUsage.placeholders.content')}" rows="5"></textarea>
<textarea placeholder="${t('basicUsage.placeholders.disabled')}" disabled></textarea>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <textarea placeholder={t('basicUsage.placeholders.content')}></textarea>
            <textarea placeholder={t('basicUsage.placeholders.content')} rows={5}></textarea>
            <textarea placeholder={t('basicUsage.placeholders.disabled')} disabled></textarea>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<textarea placeholder="${t('states.default')}"></textarea>
<textarea class="success">${t('states.successText')}</textarea>
<textarea class="danger">${t('states.dangerText')}</textarea>
<textarea disabled></textarea>
<textarea readonly>${t('states.readonlyText')}</textarea>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <textarea rows={3} placeholder={t('states.default')}></textarea>
            <textarea className="success" rows={3} defaultValue={t('states.successText')} readOnly></textarea>
            <textarea className="danger" rows={3} defaultValue={t('states.dangerText')} readOnly></textarea>
            <textarea rows={3} placeholder={t('states.disabled')} disabled></textarea>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('resize.title')}</h2>
        <p>{t('resize.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('resize.resizable')} -->
<textarea rows="4"></textarea>

<!-- ${t('resize.fixed')} -->
<textarea class="resize-none" rows="4"></textarea>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <textarea rows={4} placeholder={t('resize.placeholders.resizable')}></textarea>
            <textarea className="resize-none" rows={4} placeholder={t('resize.placeholders.fixed')}></textarea>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

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

textarea.resize-none {
  resize: none;
}

textarea.success {
  border: 1px solid color('success');
}

textarea.danger {
  border: 1px solid color('danger');
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  content: string;
  setContent: (v: string) => void;
}

function ReactContent({ t, content, setContent }: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Textarea } from 'podo-ui';`} />
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
              <td>-</td>
              <td>입력값</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(e: ChangeEvent) =&gt; void</code></td>
              <td>-</td>
              <td>값 변경 핸들러</td>
            </tr>
            <tr>
              <td><code>validator</code></td>
              <td><code>ZodSchema</code></td>
              <td>-</td>
              <td>Zod 검증 스키마</td>
            </tr>
            <tr>
              <td><code>rows</code></td>
              <td><code>number</code></td>
              <td>3</td>
              <td>표시 행 수</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Zod 검증</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Textarea } from 'podo-ui';
import { z } from 'zod';

<Textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  validator={z.string().min(10, '${t('react.minLength')}')}
  placeholder="내용을 입력하세요..."
  rows={4}
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.validation.title')}</div>
          <div className={styles.textareaGroup}>
            <TextareaComponent
              value={content}
              onChange={(e) => setContent(e.target.value)}
              validator={z.string().min(10, t('react.minLength'))}
              placeholder="내용을 입력하세요..."
              rows={4}
            />
          </div>
        </div>
      </section>
    </>
  );
}

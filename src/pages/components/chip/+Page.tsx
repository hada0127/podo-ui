import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '../../../../react/atom/chip';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function ChipPage() {
  const { t } = useTranslation('chip');
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'Next.js' },
  ]);

  const handleDelete = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

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
            content: <ReactContent t={t} tags={tags} handleDelete={handleDelete} />,
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
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/chip';`} />
      </section>

      <section>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="chip">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<div class="chip green">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('overview.basicExample')}</div>
          <div className={styles.chipRow}>
            <div className="chip">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('type.title')}</h2>
        <p>{t('type.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- Default type -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- Fill type -->
<div class="chip fill blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- Border type -->
<div class="chip border blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.default')}</div>
          <div className={styles.chipRow}>
            <div className="chip">{t('labels.label')}</div>
            <div className="chip blue">{t('labels.label')}</div>
            <div className="chip green">{t('labels.label')}</div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.fill')}</div>
          <div className={styles.chipRow}>
            <div className="chip fill">{t('labels.label')}</div>
            <div className="chip fill blue">{t('labels.label')}</div>
            <div className="chip fill green">{t('labels.label')}</div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.border')}</div>
          <div className={styles.chipRow}>
            <div className="chip border">{t('labels.label')}</div>
            <div className="chip border blue">{t('labels.label')}</div>
            <div className="chip border green">{t('labels.label')}</div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('size.title')}</h2>
        <p>{t('size.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="chip sm blue">${t('size.small')}</div>
<div class="chip blue">${t('size.medium')}</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('size.comparison')}</div>
          <div className={styles.chipRow}>
            <div className="chip sm blue">
              <i className="icon icon-ellipse" />
              {t('size.small')}
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('size.medium')}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('round.title')}</h2>
        <p>{t('round.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- Default -->
<div class="chip blue">${t('labels.label')}</div>

<!-- Round -->
<div class="chip round blue">${t('labels.label')}</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('round.comparison')}</div>
          <div className={styles.chipRow}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('round.default')}
            </div>
            <div className="chip round blue">
              <i className="icon icon-ellipse" />
              {t('round.rounded')}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('delete.title')}</h2>
        <p>{t('delete.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
  <button aria-label="${t('delete.ariaLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('delete.withButton')}</div>
          <div className={styles.chipRow}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
            <div className="chip round green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  tags: { id: number; label: string }[];
  handleDelete: (id: number) => void;
}

function ReactContent({ t, tags, handleDelete }: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Chip } from 'podo-ui';`} />
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
              <td><code>children</code></td>
              <td><code>ReactNode</code></td>
              <td>-</td>
              <td>{t('props.children')}</td>
            </tr>
            <tr>
              <td><code>theme</code></td>
              <td><code>'default' | 'blue' | 'green' | 'orange' | 'red'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.theme')}</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>'default' | 'fill' | 'border'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>'sm' | 'md'</code></td>
              <td><code>'md'</code></td>
              <td>{t('props.size')}</td>
            </tr>
            <tr>
              <td><code>round</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.round')}</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.icon')}</td>
            </tr>
            <tr>
              <td><code>onDelete</code></td>
              <td><code>() =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onDelete')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.basicUsage')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Chip } from 'podo-ui';

<Chip theme="blue" icon="icon-ellipse">
  ${t('labels.label')}
</Chip>

<Chip theme="green" icon="icon-ellipse">
  ${t('labels.label')}
</Chip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Chip Demo</div>
          <div className={styles.chipRow}>
            <Chip theme="blue" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
            <Chip theme="green" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
            <Chip theme="orange" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.withDelete')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`const [tags, setTags] = useState([
  { id: 1, label: 'React' },
  { id: 2, label: 'TypeScript' },
]);

{tags.map((tag) => (
  <Chip
    key={tag.id}
    theme="blue"
    round
    icon="icon-ellipse"
    onDelete={() => handleDelete(tag.id)}
  >
    {tag.label}
  </Chip>
))}`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Deletable Chips</div>
          <div className={styles.chipRow}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                theme="blue"
                round
                icon="icon-ellipse"
                onDelete={() => handleDelete(tag.id)}
              >
                {tag.label}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.variants')}</h2>
        <div className={styles.demo}>
          <div className={styles.demoTitle}>Variants</div>
          <div className={styles.chipRow}>
            <Chip size="sm" theme="blue" icon="icon-user">
              {t('labels.small')}
            </Chip>
            <Chip theme="green" type="fill" icon="icon-check">
              {t('labels.fillType')}
            </Chip>
            <Chip theme="orange" type="border" round>
              {t('labels.borderRound')}
            </Chip>
            <Chip theme="red" icon="icon-warning" onDelete={() => {}}>
              {t('labels.withDelete')}
            </Chip>
          </div>
        </div>
      </section>
    </>
  );
}

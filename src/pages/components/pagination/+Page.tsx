import { useState } from 'react';
import Pagination from '../../../../react/molecule/pagination';
import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function PaginationPage() {
  const { t } = useTranslation('pagination');

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
          {
            key: 'svelte',
            label: 'Svelte',
            content: <SvelteContent t={t} />,
          },
        ]}
        defaultTab="react"
      />
    </>
  );
}

function SvelteContent({ t }: { t: (key: string, options?: object) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { Pagination } from 'podo-ui/svelte';`}
        />
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
              <td><code>currentPage</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>{t('props.currentPage')}</td>
            </tr>
            <tr>
              <td><code>totalPages</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>{t('props.totalPages')}</td>
            </tr>
            <tr>
              <td><code>onpagechange</code></td>
              <td><code>(page: number) =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onPageChange')}</td>
            </tr>
            <tr>
              <td><code>maxVisiblePages</code></td>
              <td><code>number</code></td>
              <td><code>5</code></td>
              <td>{t('props.maxVisiblePages')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Pagination } from 'podo-ui/svelte';

  let currentPage = $state(1);
</script>

<Pagination
  bind:currentPage
  totalPages={10}
  onpagechange={(page) => currentPage = page}
/>

<p>Current page: {currentPage}</p>`}
        />
      </section>

      <section>
        <h2>{t('customVisiblePages.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Pagination
  bind:currentPage
  totalPages={15}
  maxVisiblePages={3}
  onpagechange={(page) => currentPage = page}
/>`}
        />
      </section>
    </>
  );
}

function ReactContent({ t }: { t: (key: string, options?: object) => string }) {
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(3);
  const [currentPage3, setCurrentPage3] = useState(7);

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Pagination } from 'podo-ui';`} />
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
              <td><code>currentPage</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>{t('props.currentPage')}</td>
            </tr>
            <tr>
              <td><code>totalPages</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>{t('props.totalPages')}</td>
            </tr>
            <tr>
              <td><code>onPageChange</code></td>
              <td><code>(page: number) =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onPageChange')}</td>
            </tr>
            <tr>
              <td><code>maxVisiblePages</code></td>
              <td><code>number</code></td>
              <td><code>5</code></td>
              <td>{t('props.maxVisiblePages')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>
          <code>currentPage</code>, <code>totalPages</code>, <code>onPageChange</code> {t('basicUsage.description')}
        </p>

        <CodeBlock
          title={t('basicUsage.codeHeader')}
          language="tsx"
          code={`import { useState } from 'react';
import { Pagination } from 'podo-ui';

export default function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={10}
      onPageChange={setCurrentPage}
    />
  );
}`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('basicUsage.demoTitle')}</div>
          <Pagination
            currentPage={currentPage1}
            totalPages={10}
            onPageChange={setCurrentPage1}
          />
          <p className={styles.demoInfo}>{t('basicUsage.currentPage', { page: currentPage1 })}</p>
        </div>
      </section>

      <section>
        <h2>{t('manyPages.title')}</h2>
        <p>{t('manyPages.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('manyPages.demoTitle')}</div>
          <Pagination
            currentPage={currentPage2}
            totalPages={20}
            onPageChange={setCurrentPage2}
          />
          <p className={styles.demoInfo}>{t('manyPages.currentPage', { page: currentPage2 })}</p>
        </div>
      </section>

      <section>
        <h2>{t('customVisiblePages.title')}</h2>
        <p>
          <code>maxVisiblePages</code> {t('customVisiblePages.description')}
        </p>

        <CodeBlock
          title={t('customVisiblePages.codeHeader')}
          language="tsx"
          code={`<Pagination
  currentPage={currentPage}
  totalPages={15}
  onPageChange={setCurrentPage}
  maxVisiblePages={3}
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('customVisiblePages.demoTitle')}</div>
          <Pagination
            currentPage={currentPage3}
            totalPages={15}
            onPageChange={setCurrentPage3}
            maxVisiblePages={3}
          />
          <p className={styles.demoInfo}>{t('customVisiblePages.currentPage', { page: currentPage3 })}</p>
        </div>
      </section>

      <section>
        <h2>{t('features.title')}</h2>
        <ul>
          <li>{t('features.prevNext')}</li>
          <li>{t('features.directSelection')}</li>
          <li>{t('features.visualHighlight')}</li>
          <li>{t('features.grouping')}</li>
          <li>{t('features.autoDisable')}</li>
          <li>{t('features.accessibility')}</li>
        </ul>
      </section>

      <section>
        <h2>{t('example.title')}</h2>
        <p>{t('example.description')}</p>

        <CodeBlock
          title={t('example.codeHeader')}
          language="tsx"
          code={`import { useState } from 'react';
import { Pagination } from 'podo-ui';

export default function DataList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ${t('example.commentAllData')}
  const allItems = Array.from({ length: 95 }, (_, i) => \`Item \${i + 1}\`);

  // ${t('example.commentExtractCurrentPageData')}
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = allItems.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  return (
    <div>
      <ul>
        {currentItems.map((item, index) => (
          <li key={startIndex + index}>{item}</li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}`}
        />
      </section>
    </>
  );
}

'use client';

import { useState } from 'react';
import Pagination from '../../../../react/molecule/pagination';
import { useTranslations } from 'next-intl';
import styles from '../input/page.module.scss';

export default function PaginationPage() {
  const t = useTranslations('pagination');
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(3);
  const [currentPage3, setCurrentPage3] = useState(7);

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('overview.title')}</h2>
        <p>
          {t('overview.description')}
        </p>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>
          <code>currentPage</code>, <code>totalPages</code>, <code>onPageChange</code> {t('basicUsage.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('basicUsage.demoTitle')}</div>
          <Pagination
            currentPage={currentPage1}
            totalPages={10}
            onPageChange={setCurrentPage1}
          />
          <p className={styles.demoInfo}>{t('basicUsage.currentPage', { page: currentPage1 })}</p>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('basicUsage.codeHeader')}</div>
          <pre><code>{`import { useState } from 'react';
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
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('manyPages.title')}</h2>
        <p>
          {t('manyPages.description')}
        </p>

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

      <section className={styles.section}>
        <h2>{t('customVisiblePages.title')}</h2>
        <p>
          <code>maxVisiblePages</code> {t('customVisiblePages.description')}
        </p>

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

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('customVisiblePages.codeHeader')}</div>
          <pre><code>{`<Pagination
  currentPage={currentPage}
  totalPages={15}
  onPageChange={setCurrentPage}
  maxVisiblePages={3}
/>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('props.title')}</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('props.codeHeader')}</div>
          <pre><code>{`interface PaginationProps {
  currentPage: number;        // ${t('props.currentPage')}
  totalPages: number;         // ${t('props.totalPages')}
  onPageChange: (page: number) => void;  // ${t('props.onPageChange')}
  maxVisiblePages?: number;   // ${t('props.maxVisiblePages')}
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
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

      <section className={styles.section}>
        <h2>{t('example.title')}</h2>
        <p>{t('example.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('example.codeHeader')}</div>
          <pre><code>{`import { useState } from 'react';
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
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

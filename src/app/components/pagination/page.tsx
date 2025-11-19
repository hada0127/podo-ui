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
        <h2>개요</h2>
        <p>
          Pagination 컴포넌트는 많은 데이터를 여러 페이지로 나누어 표시할 때 사용합니다.
          이전/다음 버튼과 페이지 번호 버튼을 제공하며, 현재 페이지를 시각적으로 강조합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          <code>currentPage</code>, <code>totalPages</code>, <code>onPageChange</code> props를 전달하여 사용합니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (총 10페이지):</div>
          <Pagination
            currentPage={currentPage1}
            totalPages={10}
            onPageChange={setCurrentPage1}
          />
          <p className={styles.demoInfo}>현재 페이지: {currentPage1}</p>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
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
        <h2>많은 페이지 수</h2>
        <p>
          페이지가 많을 경우 기본적으로 5개씩 묶어서 표시됩니다.
          현재 페이지가 속한 그룹의 페이지들만 보여집니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (총 20페이지):</div>
          <Pagination
            currentPage={currentPage2}
            totalPages={20}
            onPageChange={setCurrentPage2}
          />
          <p className={styles.demoInfo}>현재 페이지: {currentPage2}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>표시 페이지 수 변경</h2>
        <p>
          <code>maxVisiblePages</code> prop으로 한 번에 표시할 최대 페이지 수를 조절할 수 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (한 번에 3개씩 표시):</div>
          <Pagination
            currentPage={currentPage3}
            totalPages={15}
            onPageChange={setCurrentPage3}
            maxVisiblePages={3}
          />
          <p className={styles.demoInfo}>현재 페이지: {currentPage3}</p>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`<Pagination
  currentPage={currentPage}
  totalPages={15}
  onPageChange={setCurrentPage}
  maxVisiblePages={3}
/>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Props</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>PaginationProps</div>
          <pre><code>{`interface PaginationProps {
  currentPage: number;        // 현재 페이지 (1부터 시작)
  totalPages: number;         // 전체 페이지 수
  onPageChange: (page: number) => void;  // 페이지 변경 콜백
  maxVisiblePages?: number;   // 표시할 최대 페이지 수 (기본: 5)
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 기능</h2>
        <ul>
          <li>이전/다음 페이지 이동 버튼</li>
          <li>페이지 번호 직접 선택</li>
          <li>현재 페이지 시각적 강조</li>
          <li>페이지 그룹화 (5개씩 또는 사용자 지정)</li>
          <li>첫 페이지/마지막 페이지에서 버튼 자동 비활성화</li>
          <li>접근성(Accessibility) 지원</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>실제 사용 예제</h2>
        <p>데이터 목록과 함께 사용하는 완전한 예제입니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>list-with-pagination.tsx</div>
          <pre><code>{`import { useState } from 'react';
import { Pagination } from 'podo-ui';

export default function DataList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 전체 데이터
  const allItems = Array.from({ length: 95 }, (_, i) => \`Item \${i + 1}\`);

  // 현재 페이지의 데이터만 추출
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

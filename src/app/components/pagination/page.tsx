import styles from '../input/page.module.scss';

export default function Pagination() {
  return (
    <>
      <section className={styles.section}>
        <h1>페이지네이션</h1>
        <p>Podo UI의 Pagination 컴포넌트 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>개요</h2>
        <p>
          Pagination 컴포넌트는 많은 양의 데이터를 페이지 단위로 나누어 표시할 때 사용합니다.
          현재는 React 컴포넌트로만 제공됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>React 컴포넌트로 페이지네이션을 쉽게 구현할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import { Pagination } from 'podo-ui/react';
import { useState } from 'react';

export default function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div>
      {/* 데이터 표시 영역 */}
      <div>
        <p>현재 페이지: {currentPage}</p>
        {/* 여기에 페이지별 데이터 표시 */}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        current={currentPage}
        total={totalPages}
        onChange={setCurrentPage}
      />
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 Props</h2>
        <ul>
          <li><code>current:</code> 현재 페이지 번호</li>
          <li><code>total:</code> 전체 페이지 수</li>
          <li><code>onChange:</code> 페이지 변경 시 호출되는 함수</li>
          <li><code>pageSize:</code> 한 페이지에 표시할 항목 수 (선택사항)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>사용 예제</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>실제 사용 예제</div>
          <pre><code>{`// 데이터 목록과 함께 사용
const [page, setPage] = useState(1);
const itemsPerPage = 10;
const totalItems = 100;
const totalPages = Math.ceil(totalItems / itemsPerPage);

// 현재 페이지의 데이터 계산
const startIndex = (page - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentData = allData.slice(startIndex, endIndex);

return (
  <div>
    {/* 데이터 목록 */}
    <ul>
      {currentData.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>

    {/* 페이지네이션 */}
    <Pagination
      current={page}
      total={totalPages}
      onChange={setPage}
    />
  </div>
);`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>특징</h2>
        <ul>
          <li>이전/다음 페이지 버튼 자동 표시</li>
          <li>현재 페이지 강조 표시</li>
          <li>페이지 번호 클릭으로 직접 이동</li>
          <li>첫 페이지/마지막 페이지로 빠르게 이동</li>
        </ul>
      </section>
    </>
  );
}

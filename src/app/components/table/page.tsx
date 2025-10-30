import styles from './page.module.scss';

export default function Table() {
  return (
    <>
      <section className={styles.section}>
        <h1>테이블</h1>
        <p>Podo UI의 Table 컴포넌트와 다양한 변형 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          HTML table 태그를 사용하면 Podo UI의 기본 스타일이 자동으로 적용됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<table>
  <thead>
    <tr>
      <th>이름</th>
      <th>이메일</th>
      <th>역할</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>홍길동</td>
      <td>hong@example.com</td>
      <td>관리자</td>
    </tr>
    <tr>
      <td>김철수</td>
      <td>kim@example.com</td>
      <td>사용자</td>
    </tr>
  </tbody>
</table>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>홍길동</td>
                <td>hong@example.com</td>
                <td>관리자</td>
              </tr>
              <tr>
                <td>김철수</td>
                <td>kim@example.com</td>
                <td>사용자</td>
              </tr>
              <tr>
                <td>이영희</td>
                <td>lee@example.com</td>
                <td>사용자</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>List 스타일</h2>
        <p>
          <code>.list</code> 클래스를 추가하면 행에 호버 효과가 적용되어 클릭 가능한 목록처럼 보입니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (행에 마우스를 올려보세요):</div>
          <table className="list">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>공지사항 제목입니다</td>
                <td>관리자</td>
                <td>2024-01-15</td>
              </tr>
              <tr>
                <td>게시글 제목입니다</td>
                <td>사용자1</td>
                <td>2024-01-14</td>
              </tr>
              <tr>
                <td>또 다른 게시글</td>
                <td>사용자2</td>
                <td>2024-01-13</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Border 스타일</h2>
        <p>
          <code>.border</code> 클래스를 추가하면 각 셀에 하단 테두리가 표시됩니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <table className="border">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격</th>
                <th>재고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>상품 A</td>
                <td>10,000원</td>
                <td>50</td>
              </tr>
              <tr>
                <td>상품 B</td>
                <td>20,000원</td>
                <td>30</td>
              </tr>
              <tr>
                <td>상품 C</td>
                <td>15,000원</td>
                <td>100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Fill 스타일</h2>
        <p>
          <code>.fill</code> 클래스를 추가하면 행에 배경색이 적용됩니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <table className="fill">
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>홍길동</td>
                <td>개발팀</td>
                <td>팀장</td>
              </tr>
              <tr>
                <td>김철수</td>
                <td>디자인팀</td>
                <td>대리</td>
              </tr>
              <tr>
                <td>이영희</td>
                <td>마케팅팀</td>
                <td>과장</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>복합 스타일</h2>
        <p>
          여러 클래스를 조합하여 사용할 수 있습니다. <code>.list.fill</code>은 배경색과 호버 효과를 모두 적용합니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제 (.list.fill):</div>
          <table className="list fill">
            <thead>
              <tr>
                <th>순위</th>
                <th>이름</th>
                <th>점수</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>김OO</td>
                <td>95</td>
              </tr>
              <tr>
                <td>2</td>
                <td>이OO</td>
                <td>92</td>
              </tr>
              <tr>
                <td>3</td>
                <td>박OO</td>
                <td>88</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

table {
  width: 100%;
  border-collapse: separate;
  border-radius: r(2);
  border: 1px solid color(border);

  // 리스트 스타일 (호버 효과)
  &.list > tbody > tr {
    &:hover {
      cursor: pointer;
      background-color: color(default-fill);
    }
  }

  // 테두리 스타일
  &.border > thead,
  &.border > tbody {
    > tr > th,
    > tr > td {
      border-bottom: 1px solid color(border);
    }
  }

  // Fill 스타일
  &.fill > thead,
  &.fill > tbody {
    > tr {
      background-color: color(default-fill);
    }
  }

  // 셀 패딩
  > thead,
  > tbody {
    > tr {
      > th,
      > td {
        padding: s(3) s(4);
        text-align: left;
      }
    }
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

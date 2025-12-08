import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function Table() {
  const { t } = useTranslation('table');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>
          {t('basicUsage.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('basicUsage.codeHeader')}</div>
          <pre><code>{`<table>
  <thead>
    <tr>
      <th>${t('basicUsage.table.name')}</th>
      <th>${t('basicUsage.table.email')}</th>
      <th>${t('basicUsage.table.role')}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${t('basicUsage.table.data.user1.name')}</td>
      <td>${t('basicUsage.table.data.user1.email')}</td>
      <td>${t('basicUsage.table.data.user1.role')}</td>
    </tr>
    <tr>
      <td>${t('basicUsage.table.data.user2.name')}</td>
      <td>${t('basicUsage.table.data.user2.email')}</td>
      <td>${t('basicUsage.table.data.user2.role')}</td>
    </tr>
  </tbody>
</table>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('basicUsage.demoTitle')}</div>
          <table>
            <thead>
              <tr>
                <th>{t('basicUsage.table.name')}</th>
                <th>{t('basicUsage.table.email')}</th>
                <th>{t('basicUsage.table.role')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('basicUsage.table.data.user1.name')}</td>
                <td>{t('basicUsage.table.data.user1.email')}</td>
                <td>{t('basicUsage.table.data.user1.role')}</td>
              </tr>
              <tr>
                <td>{t('basicUsage.table.data.user2.name')}</td>
                <td>{t('basicUsage.table.data.user2.email')}</td>
                <td>{t('basicUsage.table.data.user2.role')}</td>
              </tr>
              <tr>
                <td>{t('basicUsage.table.data.user3.name')}</td>
                <td>{t('basicUsage.table.data.user3.email')}</td>
                <td>{t('basicUsage.table.data.user3.role')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('listStyle.title')}</h2>
        <p>
          {t('listStyle.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('listStyle.demoTitle')}</div>
          <table className="list">
            <thead>
              <tr>
                <th>{t('listStyle.table.title')}</th>
                <th>{t('listStyle.table.author')}</th>
                <th>{t('listStyle.table.date')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('listStyle.table.data.post1.title')}</td>
                <td>{t('listStyle.table.data.post1.author')}</td>
                <td>{t('listStyle.table.data.post1.date')}</td>
              </tr>
              <tr>
                <td>{t('listStyle.table.data.post2.title')}</td>
                <td>{t('listStyle.table.data.post2.author')}</td>
                <td>{t('listStyle.table.data.post2.date')}</td>
              </tr>
              <tr>
                <td>{t('listStyle.table.data.post3.title')}</td>
                <td>{t('listStyle.table.data.post3.author')}</td>
                <td>{t('listStyle.table.data.post3.date')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('borderStyle.title')}</h2>
        <p>
          {t('borderStyle.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('borderStyle.demoTitle')}</div>
          <table className="border">
            <thead>
              <tr>
                <th>{t('borderStyle.table.product')}</th>
                <th>{t('borderStyle.table.price')}</th>
                <th>{t('borderStyle.table.stock')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('borderStyle.table.data.product1.name')}</td>
                <td>{t('borderStyle.table.data.product1.price')}</td>
                <td>{t('borderStyle.table.data.product1.stock')}</td>
              </tr>
              <tr>
                <td>{t('borderStyle.table.data.product2.name')}</td>
                <td>{t('borderStyle.table.data.product2.price')}</td>
                <td>{t('borderStyle.table.data.product2.stock')}</td>
              </tr>
              <tr>
                <td>{t('borderStyle.table.data.product3.name')}</td>
                <td>{t('borderStyle.table.data.product3.price')}</td>
                <td>{t('borderStyle.table.data.product3.stock')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('fillStyle.title')}</h2>
        <p>
          {t('fillStyle.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('fillStyle.demoTitle')}</div>
          <table className="fill">
            <thead>
              <tr>
                <th>{t('fillStyle.table.name')}</th>
                <th>{t('fillStyle.table.department')}</th>
                <th>{t('fillStyle.table.position')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('fillStyle.table.data.employee1.name')}</td>
                <td>{t('fillStyle.table.data.employee1.department')}</td>
                <td>{t('fillStyle.table.data.employee1.position')}</td>
              </tr>
              <tr>
                <td>{t('fillStyle.table.data.employee2.name')}</td>
                <td>{t('fillStyle.table.data.employee2.department')}</td>
                <td>{t('fillStyle.table.data.employee2.position')}</td>
              </tr>
              <tr>
                <td>{t('fillStyle.table.data.employee3.name')}</td>
                <td>{t('fillStyle.table.data.employee3.department')}</td>
                <td>{t('fillStyle.table.data.employee3.position')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('combinedStyle.title')}</h2>
        <p>
          {t('combinedStyle.description')}
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('combinedStyle.demoTitle')}</div>
          <table className="list fill">
            <thead>
              <tr>
                <th>{t('combinedStyle.table.rank')}</th>
                <th>{t('combinedStyle.table.name')}</th>
                <th>{t('combinedStyle.table.score')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('combinedStyle.table.data.rank1.rank')}</td>
                <td>{t('combinedStyle.table.data.rank1.name')}</td>
                <td>{t('combinedStyle.table.data.rank1.score')}</td>
              </tr>
              <tr>
                <td>{t('combinedStyle.table.data.rank2.rank')}</td>
                <td>{t('combinedStyle.table.data.rank2.name')}</td>
                <td>{t('combinedStyle.table.data.rank2.score')}</td>
              </tr>
              <tr>
                <td>{t('combinedStyle.table.data.rank3.rank')}</td>
                <td>{t('combinedStyle.table.data.rank3.name')}</td>
                <td>{t('combinedStyle.table.data.rank3.score')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scssUsage.title')}</h2>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('scssUsage.codeHeader')}</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

table {
  width: 100%;
  border-collapse: separate;
  border-radius: r(2);
  border: 1px solid color(border);

  // ${t('scssUsage.comments.listStyle')}
  &.list > tbody > tr {
    &:hover {
      cursor: pointer;
      background-color: color(default-fill);
    }
  }

  // ${t('scssUsage.comments.borderStyle')}
  &.border > thead,
  &.border > tbody {
    > tr > th,
    > tr > td {
      border-bottom: 1px solid color(border);
    }
  }

  // ${t('scssUsage.comments.fillStyle')}
  &.fill > thead,
  &.fill > tbody {
    > tr {
      background-color: color(default-fill);
    }
  }

  // ${t('scssUsage.comments.cellPadding')}
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

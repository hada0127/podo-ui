import { useTranslation } from 'react-i18next';
import Field from '../../../../react/molecule/field';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function FieldPage() {
  const { t } = useTranslation('field');

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
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/molecule/field';`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="field">
  <label>${t('overview.email.label')}</label>
  <div class="child">
    <input type="email" placeholder="${t('overview.email.placeholder')}" />
  </div>
  <div class="helper">${t('overview.email.helper')}</div>
</div>

<div class="field">
  <label>${t('overview.password.label')}</label>
  <div class="child">
    <input type="password" placeholder="${t('overview.password.placeholder')}" />
  </div>
  <div class="helper">${t('overview.password.helper')}</div>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.fieldGroup}>
            <div className="field">
              <label>{t('overview.email.label')}</label>
              <div className="child">
                <input type="email" placeholder={t('overview.email.placeholder')} />
              </div>
              <div className="helper">{t('overview.email.helper')}</div>
            </div>
            <div className="field">
              <label>{t('overview.password.label')}</label>
              <div className="child">
                <input type="password" placeholder={t('overview.password.placeholder')} />
              </div>
              <div className="helper">{t('overview.password.helper')}</div>
            </div>
            <div className="field">
              <label>{t('overview.category.label')}</label>
              <div className="child">
                <select>
                  <option value="">{t('overview.category.placeholder')}</option>
                  <option value="1">{t('overview.category.option')} 1</option>
                  <option value="2">{t('overview.category.option')} 2</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: s(3);

  // Child element wrapper
  > div.child {
    width: 100%;

    > :not(:last-child) {
      display: inline-block;
      margin-right: s(5);
    }
  }

  // Helper text
  > div.helper {
    @include p4;
    color: color(text-sub);
  }
}`}
        />
      </section>
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Field } from 'podo-ui';`} />
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
              <td><code>label</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.label')}</td>
            </tr>
            <tr>
              <td><code>helper</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.helper')}</td>
            </tr>
            <tr>
              <td><code>children</code></td>
              <td><code>ReactNode</code></td>
              <td>required</td>
              <td>{t('react.props.children')}</td>
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
          code={`import { Field } from 'podo-ui';

<Field label="${t('overview.email.label')}" helper="${t('overview.email.helper')}">
  <input type="email" placeholder="${t('overview.email.placeholder')}" />
</Field>

<Field label="${t('overview.password.label')}" helper="${t('overview.password.helper')}">
  <input type="password" placeholder="${t('overview.password.placeholder')}" />
</Field>

<Field label="${t('overview.category.label')}">
  <select>
    <option value="" disabled selected>${t('overview.category.placeholder')}</option>
    <option value="1">${t('overview.category.option')} 1</option>
    <option value="2">${t('overview.category.option')} 2</option>
  </select>
</Field>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Field Demo</div>
          <div className={styles.fieldGroup}>
            <Field label={t('overview.email.label')} helper={t('overview.email.helper')}>
              <input type="email" placeholder={t('overview.email.placeholder')} />
            </Field>
            <Field label={t('overview.password.label')} helper={t('overview.password.helper')}>
              <input type="password" placeholder={t('overview.password.placeholder')} />
            </Field>
            <Field label={t('overview.category.label')}>
              <select>
                <option value="">{t('overview.category.placeholder')}</option>
                <option value="1">{t('overview.category.option')} 1</option>
                <option value="2">{t('overview.category.option')} 2</option>
              </select>
            </Field>
          </div>
        </div>
      </section>
    </>
  );
}

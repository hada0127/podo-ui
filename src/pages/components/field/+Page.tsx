import Field from '../../../../react/molecule/field';
import { useTranslation } from 'react-i18next';
import styles from '../input/Page.module.scss';

export default function FieldPage() {
  const { t } = useTranslation('field');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
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
                <option value="3">{t('overview.category.option')} 3</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('react.title')}</h2>
        <p>{t('react.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`import { Field } from 'podo-ui';

export default function MyForm() {
  return (
    <div>
      <Field label="${t('overview.email.label')}" helper="${t('overview.email.helper')}">
        <input type="email" placeholder="${t('overview.email.placeholder')}" />
      </Field>

      <Field label="${t('overview.password.label')}" helper="${t('overview.password.helper')}">
        <input type="password" placeholder="${t('overview.password.placeholder')}" />
      </Field>

      <Field label="${t('react.description2.label')}" helper="${t('react.description2.helper')}">
        <textarea rows={4} placeholder="${t('react.description2.placeholder')}"></textarea>
      </Field>

      <Field label="${t('overview.category.label')}">
        <select>
          <option value="" disabled selected>${t('overview.category.placeholder')}</option>
          <option value="1">${t('overview.category.option')} 1</option>
          <option value="2">${t('overview.category.option')} 2</option>
        </select>
      </Field>
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('structure.title')}</h2>
        <p>{t('structure.description')}</p>
        <ul>
          <li><strong>label:</strong> {t('structure.label')}</li>
          <li><strong>children:</strong> {t('structure.children')}</li>
          <li><strong>helper:</strong> {t('structure.helper')}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>field.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.style {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: s(3);

  // ` + t('code.childElement') + `
  > div.child {
    width: 100%;

    > :not(:last-child) {
      display: inline-block;
      margin-right: s(5);
    }
  }

  // ` + t('code.helperText') + `
  > div.helper {
    @include p4;
    color: color(text-sub);
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

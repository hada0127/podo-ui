import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import styles from './Page.module.scss';

export default function Label() {
  const { t } = useTranslation('label');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<label>${t('basicUsage.examples.username')}</label>
<label>${t('basicUsage.examples.email')}</label>
<label>${t('basicUsage.examples.password')}</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.labelGroup}>
            <label>{t('basicUsage.examples.username')}</label>
            <label>{t('basicUsage.examples.email')}</label>
            <label>{t('basicUsage.examples.password')}</label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<label class="sm">${t('sizes.small')}</label>
<label>${t('sizes.medium')}</label>
<label class="lg">${t('sizes.large')}</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.labelRow}>
            <label className="sm">{t('sizes.small')}</label>
            <label>{t('sizes.medium')}</label>
            <label className="lg">{t('sizes.large')}</label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('styles.title')}</h2>
        <p>{t('styles.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<label>${t('styles.normal')}</label>
<label class="semibold">${t('styles.semibold')}</label>
<label class="disabled">${t('styles.disabled')}</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.labelRow}>
            <label>{t('styles.normal')}</label>
            <label className="semibold">{t('styles.semibold')}</label>
            <label className="disabled">{t('styles.disabled')}</label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('required.title')}</h2>
        <p>{t('required.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<label>${t('required.email')} <span class="required">*</span></label>
<label>${t('required.phone')} <span class="required">*</span></label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.labelGroup}>
            <label>{t('required.email')} <span className="required">*</span></label>
            <label>{t('required.phone')} <span className="required">*</span></label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('withInput.title')}</h2>
        <p>{t('withInput.description')}</p>

        <CodeBlock
          title={t('demo.codeHeader')}
          language="html"
          code={`<label for="email">${t('withInput.email')} <span class="required">*</span></label>
<input id="email" type="email" placeholder="example@email.com" />

<label for="username">${t('withInput.username')}</label>
<input id="username" type="text" placeholder="${t('basicUsage.examples.username')}" />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldItem}>
              <label htmlFor="email">{t('withInput.email')} <span className="required">*</span></label>
              <input id="email" type="email" placeholder="example@email.com" />
            </div>
            <div className={styles.fieldItem}>
              <label htmlFor="username">{t('withInput.username')}</label>
              <input id="username" type="text" placeholder={t('basicUsage.examples.username')} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

// ${t('code.labelStyle')}
label {
  @include p3;
  color: color(default-deep-base);

  // Size variants
  &.sm {
    @include p4;
  }

  &.lg {
    @include p2;
  }

  // Semibold
  &.semibold {
    @include p3-semibold;
  }

  // Disabled
  &.disabled {
    color: color(placeholder);
    cursor: not-allowed;
  }

  // Required indicator
  .required {
    color: color(danger);
    margin-left: s(1);
  }
}`}
        />
      </section>
    </>
  );
}

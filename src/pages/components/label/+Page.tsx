import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Label() {
  const { t } = useTranslation('label');

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
            key: 'svelte',
            label: 'Svelte',
            content: <SvelteContent t={t} />,
          },
        ]}
        defaultTab="scss"
      />
    </>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { Label } from 'podo-ui/svelte';`}
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
              <td><code>size</code></td>
              <td><code>'sm' | 'md' | 'lg'</code></td>
              <td>'md'</td>
              <td>{t('sizes.description')}</td>
            </tr>
            <tr>
              <td><code>semibold</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('styles.semibold')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('styles.disabled')}</td>
            </tr>
            <tr>
              <td><code>required</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('required.description')}</td>
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
  import { Label } from 'podo-ui/svelte';
</script>

<Label>Username</Label>
<Label>Email</Label>
<Label>Password</Label>`}
        />
      </section>

      <section>
        <h2>{t('sizes.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Label size="sm">Small Label</Label>
<Label size="md">Medium Label</Label>
<Label size="lg">Large Label</Label>`}
        />
      </section>

      <section>
        <h2>{t('styles.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Label>Normal</Label>
<Label semibold>Semibold</Label>
<Label disabled>Disabled</Label>`}
        />
      </section>

      <section>
        <h2>{t('required.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Label required>Email</Label>
<Label required>Phone</Label>`}
        />
      </section>

      <section>
        <h2>{t('withInput.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Label, Input } from 'podo-ui/svelte';
</script>

<Label for="email" required>Email</Label>
<Input id="email" type="email" placeholder="example@email.com" />

<Label for="username">Username</Label>
<Input id="username" type="text" placeholder="Enter username" />`}
        />
      </section>
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/label';`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
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

      <section>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <CodeBlock
          title="HTML"
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

      <section>
        <h2>{t('styles.title')}</h2>
        <p>{t('styles.description')}</p>

        <CodeBlock
          title="HTML"
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

      <section>
        <h2>{t('required.title')}</h2>
        <p>{t('required.description')}</p>

        <CodeBlock
          title="HTML"
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

      <section>
        <h2>{t('withInput.title')}</h2>
        <p>{t('withInput.description')}</p>

        <CodeBlock
          title="HTML"
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

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

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

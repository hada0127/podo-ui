import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Toggle() {
  const { t } = useTranslation('toggle');

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
          code={`import { Toggle } from 'podo-ui/svelte';`}
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
              <td><code>checked</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('basicUsage.examples.option')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('basicUsage.examples.disabled')}</td>
            </tr>
            <tr>
              <td><code>onchange</code></td>
              <td><code>(e: Event) =&gt; void</code></td>
              <td>-</td>
              <td>Change handler</td>
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
  import { Toggle } from 'podo-ui/svelte';

  let enabled = $state(false);
</script>

<Toggle bind:checked={enabled} />
<Toggle checked disabled />
<Toggle disabled />`}
        />
      </section>

      <section>
        <h2>{t('practicalExample.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Toggle } from 'podo-ui/svelte';

  let emailNotification = $state(true);
  let pushNotification = $state(false);
</script>

<div class="settings">
  <div class="setting-item">
    <span>Email Notification</span>
    <Toggle bind:checked={emailNotification} />
  </div>
  <div class="setting-item">
    <span>Push Notification</span>
    <Toggle bind:checked={pushNotification} />
  </div>
</div>`}
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
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/toggle';`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<label>
  <input type="checkbox" class="toggle" />
  ${t('basicUsage.examples.option')}
</label>

<label>
  <input type="checkbox" class="toggle" checked />
  ${t('basicUsage.examples.on')}
</label>

<label>
  <input type="checkbox" class="toggle" disabled />
  ${t('basicUsage.examples.disabled')}
</label>

<label>
  <input type="checkbox" class="toggle" checked disabled />
  ${t('basicUsage.examples.onDisabled')}
</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.toggleGroup}>
            <label>
              <input type="checkbox" className="toggle" />
              {t('basicUsage.examples.option')}
            </label>
            <label>
              <input type="checkbox" className="toggle" defaultChecked />
              {t('basicUsage.examples.on')}
            </label>
            <label>
              <input type="checkbox" className="toggle" disabled />
              {t('basicUsage.examples.disabled')}
            </label>
            <label>
              <input type="checkbox" className="toggle" defaultChecked disabled />
              {t('basicUsage.examples.onDisabled')}
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('practicalExample.title')}</h2>
        <p>{t('practicalExample.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('practicalExample.notificationSettings')}</div>
          <div className={styles.settingsGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>{t('practicalExample.emailNotification.title')}</strong>
                <span>{t('practicalExample.emailNotification.description')}</span>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>{t('practicalExample.pushNotification.title')}</strong>
                <span>{t('practicalExample.pushNotification.description')}</span>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>{t('practicalExample.smsNotification.title')}</strong>
                <span>{t('practicalExample.smsNotification.description')}</span>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>{t('practicalExample.marketing.title')}</strong>
                <span>{t('practicalExample.marketing.description')}</span>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('accessibility.title')}</h2>
        <p>{t('accessibility.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('accessibility.keyboardDemo')}</div>
          <div className={styles.toggleGroup}>
            <label>
              <input type="checkbox" className="toggle" />
              {t('accessibility.focusable')} 1
            </label>
            <label>
              <input type="checkbox" className="toggle" />
              {t('accessibility.focusable')} 2
            </label>
            <label>
              <input type="checkbox" className="toggle" />
              {t('accessibility.focusable')} 3
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.toggleWrapper {
  display: flex;
  align-items: center;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    gap: s(2);
    cursor: pointer;
    user-select: none;
  }
}

// Toggle custom style
.toggle {
  appearance: none;
  position: relative;
  border-radius: r(full);
  width: 33px;
  height: 20px;
  background-color: color(bg-toggle);
  cursor: pointer;
  transition: 0.15s;

  &::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: 0.15s;
  }

  &:checked {
    background-color: color(info);

    &::before {
      left: auto;
      right: 3px;
    }
  }

  &:disabled {
    background-color: color(bg-disabled);
    cursor: not-allowed;

    &::before {
      background-color: color(bg-toggle);
    }
  }

  &:focus-visible:not(:disabled) {
    outline: 4px solid color(primary-outline);
  }
}`}
        />
      </section>

      <section>
        <h2>{t('darkMode.title')}</h2>
        <p>{t('darkMode.description')}</p>
      </section>
    </>
  );
}

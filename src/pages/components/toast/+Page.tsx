import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';
import { ToastProvider, useToast } from '../../../../react/molecule/toast-provider';

export default function Toast() {
  const { t } = useTranslation('toast');

  return (
    <ToastProvider>
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
            {
              key: 'svelte',
              label: 'Svelte',
              content: <SvelteContent t={t} />,
            },
          ]}
          defaultTab="scss"
        />
      </>
    </ToastProvider>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { ToastProvider, useToast } from 'podo-ui/svelte';`}
        />
      </section>

      <section>
        <h2>Props</h2>
        <h3>ToastProvider</h3>
        <p>{t('sections.reactUsage.step1Description')}</p>

        <h3>useToast</h3>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Method</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>showToast</code></td>
              <td><code>(options: ToastOptions) =&gt; void</code></td>
              <td>Show a toast notification</td>
            </tr>
          </tbody>
        </table>

        <h3>ToastOptions</h3>
        <table className={styles.propsTable}>
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>message</code></td>
              <td><code>string</code></td>
              <td>required</td>
              <td>{t('sections.reactUsage.messageRequired')}</td>
            </tr>
            <tr>
              <td><code>header</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('sections.reactUsage.headerOptional')}</td>
            </tr>
            <tr>
              <td><code>theme</code></td>
              <td><code>'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger'</code></td>
              <td><code>'default'</code></td>
              <td>Toast color theme</td>
            </tr>
            <tr>
              <td><code>border</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('sections.reactUsage.borderOption')}</td>
            </tr>
            <tr>
              <td><code>long</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('sections.reactUsage.longOption')}</td>
            </tr>
            <tr>
              <td><code>duration</code></td>
              <td><code>number</code></td>
              <td><code>3000</code></td>
              <td>{t('sections.reactUsage.durationOption')}</td>
            </tr>
            <tr>
              <td><code>position</code></td>
              <td><code>string</code></td>
              <td><code>'top-right'</code></td>
              <td>9 positions available</td>
            </tr>
            <tr>
              <td><code>width</code></td>
              <td><code>string | number</code></td>
              <td>-</td>
              <td>{t('sections.reactUsage.widthOption')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('sections.reactUsage.step1Title')}</h2>
        <p>{t('sections.reactUsage.step1Description')}</p>

        <CodeBlock
          title="+layout.svelte"
          language="svelte"
          code={`<script lang="ts">
  import { ToastProvider } from 'podo-ui/svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<ToastProvider>
  {@render children()}
</ToastProvider>`}
        />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step2Title')}</h2>
        <p>{t('sections.reactUsage.step2Description')}</p>

        <CodeBlock
          title="Component.svelte"
          language="svelte"
          code={`<script lang="ts">
  import { useToast } from 'podo-ui/svelte';

  const { showToast } = useToast();

  function handleClick() {
    showToast({
      message: '${t('sections.reactUsage.savedMessage')}',
      header: '${t('variants.success.label')}',
      theme: 'success',
      border: false,
      position: 'top-right',
      duration: 3000,
    });
  }
</script>

<button onclick={handleClick}>${t('sections.reactUsage.saveButton')}</button>`}
        />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step4Title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { useToast } from 'podo-ui/svelte';

  const { showToast } = useToast();

  // ${t('sections.reactUsage.exampleComment1')}
  function showSuccess() {
    showToast({
      message: '${t('sections.reactUsage.exampleMessage1')}',
      theme: 'success',
      position: 'top-right',
    });
  }

  // ${t('sections.reactUsage.exampleComment2')}
  function showInfo() {
    showToast({
      header: '${t('sections.reactUsage.exampleHeader2')}',
      message: '${t('sections.reactUsage.exampleMessage2')}',
      theme: 'info',
      border: true,
      position: 'bottom-center',
    });
  }

  // ${t('sections.reactUsage.exampleComment3')}
  function showLong() {
    showToast({
      message: '${t('sections.reactUsage.exampleMessage3')}',
      theme: 'success',
      long: true,
      position: 'bottom-right',
      duration: 2000,
    });
  }

  // ${t('sections.reactUsage.exampleComment5')}
  function showManualClose() {
    showToast({
      header: '${t('sections.reactUsage.exampleHeader5')}',
      message: '${t('sections.reactUsage.exampleMessage5')}',
      theme: 'warning',
      duration: 0,
      position: 'center',
    });
  }
</script>

<button onclick={showSuccess}>Success Toast</button>
<button onclick={showInfo}>Info Toast</button>
<button onclick={showLong}>Long Toast</button>
<button onclick={showManualClose}>Manual Close Toast</button>`}
        />
      </section>

      <section>
        <h2>Position Options</h2>
        <CodeBlock
          language="typescript"
          code={`type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';`}
        />
      </section>
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  const variants = [
    { name: 'default', label: t('variants.default.label'), description: t('variants.default.description') },
    { name: 'primary', label: t('variants.primary.label'), description: t('variants.primary.description') },
    { name: 'info', label: t('variants.info.label'), description: t('variants.info.description') },
    { name: 'success', label: t('variants.success.label'), description: t('variants.success.description') },
    { name: 'warning', label: t('variants.warning.label'), description: t('variants.warning.description') },
    { name: 'danger', label: t('variants.danger.label'), description: t('variants.danger.description') },
  ];

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('sections.basicUsage.title')}</h2>
        <p>{t('sections.basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="toast">
  <i class="icon-info"></i>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button aria-label="${t('sections.basicUsage.closeLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demo')}</div>
          <div className="toast">
            <i className="icon-info"></i>
            <div className="toast-content">
              <div className="toast-header">Header</div>
              <div className="toast-body">Lorem ipsum dolor sit amet</div>
            </div>
            <button aria-label={t('sections.basicUsage.closeLabel')}></button>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sections.styleProperties.title')}</h2>
        <p>{t('sections.styleProperties.description')}</p>

        <h3>{t('sections.styleProperties.borderProperty')}</h3>
        <ul>
          <li><strong>{t('sections.styleProperties.borderFalseDefault')}</strong></li>
          <li><strong>{t('sections.styleProperties.borderTrue')}</strong></li>
        </ul>

        <h3>{t('sections.styleProperties.longProperty')}</h3>
        <ul>
          <li><strong>{t('sections.styleProperties.longFalseDefault')}</strong></li>
          <li><strong>{t('sections.styleProperties.longTrue')}</strong></li>
        </ul>

        <h3>{t('sections.styleProperties.borderFalseAccent')}</h3>
        <p>{t('sections.styleProperties.borderFalseDescription')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('sections.styleProperties.commentBorderFalse')} -->
<div class="toast info">
  <i class="icon-info"></i>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button aria-label="${t('sections.basicUsage.closeLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demo')}</div>
          <div className={styles.toastGroup}>
            <div className="toast info">
              <i className="icon-info"></i>
              <div className="toast-content">
                <div className="toast-header">Header</div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button aria-label={t('sections.basicUsage.closeLabel')}></button>
            </div>
          </div>
        </div>

        <h3>{t('sections.styleProperties.borderTrueOutline')}</h3>
        <p>{t('sections.styleProperties.borderTrueDescription')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('sections.styleProperties.commentBorderTrue')} -->
<div class="toast border info">
  <i class="icon-info"></i>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button aria-label="${t('sections.basicUsage.closeLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demo')}</div>
          <div className={styles.toastGroup}>
            <div className="toast border info">
              <i className="icon-info"></i>
              <div className="toast-content">
                <div className="toast-header">Header</div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button aria-label={t('sections.basicUsage.closeLabel')}></button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sections.longStyle.title')}</h2>
        <p>{t('sections.longStyle.description')}</p>

        <h3>{t('sections.longStyle.longTrueBorderFalse')}</h3>
        <p>{t('sections.longStyle.longTrueBorderFalseDescription')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('sections.longStyle.commentLongTrueBorderFalse')} -->
<div class="toast long info">
  <i class="icon-info"></i>
  <div class="toast-content">
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button aria-label="${t('sections.basicUsage.closeLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demo')}</div>
          <div className={styles.toastGroup}>
            <div className="toast long info">
              <i className="icon-info"></i>
              <div className="toast-content">
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button aria-label={t('sections.basicUsage.closeLabel')}></button>
            </div>
          </div>
        </div>

        <h3>{t('sections.longStyle.longTrueBorderTrue')}</h3>
        <p>{t('sections.longStyle.longTrueBorderTrueDescription')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('sections.longStyle.commentLongTrueBorderTrue')} -->
<div class="toast long border success">
  <i class="icon-check"></i>
  <div class="toast-content">
    <div class="toast-body">${t('sections.longStyle.fileUploadSuccess')}</div>
  </div>
  <button aria-label="${t('sections.basicUsage.closeLabel')}"></button>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demo')}</div>
          <div className={styles.toastGroup}>
            <div className="toast long border success">
              <i className="icon-check"></i>
              <div className="toast-content">
                <div className="toast-body">{t('sections.longStyle.fileUploadSuccess')}</div>
              </div>
              <button aria-label={t('sections.basicUsage.closeLabel')}></button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sections.colorVariants.title')}</h2>
        <p>{t('sections.colorVariants.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- Default -->
<div class="toast default">...</div>

<!-- Info -->
<div class="toast info">...</div>

<!-- Success -->
<div class="toast success">...</div>

<!-- Warning -->
<div class="toast warning">...</div>

<!-- Danger -->
<div class="toast danger">...</div>`}
        />

        <div className={styles.variantsShowcase}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantHeader}>
                <h3>{variant.label}</h3>
                <p>{variant.description}</p>
              </div>
              <div className={styles.variantExamples}>
                <div className={`toast ${variant.name}`}>
                  <i className="icon-info"></i>
                  <div className="toast-content">
                    <div className="toast-header">{variant.label}</div>
                    <div className="toast-body">{t('sections.styleProperties.borderFalseAccentBorder')}</div>
                  </div>
                  <button aria-label={t('sections.basicUsage.closeLabel')}></button>
                </div>
                <div className={`toast border ${variant.name}`}>
                  <i className="icon-info"></i>
                  <div className="toast-content">
                    <div className="toast-header">{variant.label}</div>
                    <div className="toast-body">{t('sections.styleProperties.borderTrueOutlineBorder')}</div>
                  </div>
                  <button aria-label={t('sections.basicUsage.closeLabel')}></button>
                </div>
                <div className={`toast long ${variant.name}`}>
                  <i className="icon-info"></i>
                  <div className="toast-content">
                    <div className="toast-body">{t('sections.colorVariants.longBorderFalse')}</div>
                  </div>
                  <button aria-label={t('sections.basicUsage.closeLabel')}></button>
                </div>
                <div className={`toast long border ${variant.name}`}>
                  <i className="icon-info"></i>
                  <div className="toast-content">
                    <div className="toast-body">{t('sections.colorVariants.longBorderTrue')}</div>
                  </div>
                  <button aria-label={t('sections.basicUsage.closeLabel')}></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('sections.scssUsage.title')}</h2>
        <p>{t('sections.scssUsage.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.customToast {
  display: flex;
  align-items: flex-start;
  gap: s(3);
  padding: s(4);
  border-radius: r(2);
  background-color: color('bg-elevation-1');
  border: 1px solid color('border');
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .icon {
    color: color('info');
  }

  .content {
    flex: 1;
  }

  .header {
    font-weight: 600;
    color: color('text-body');
    margin-bottom: s(1);
  }

  .body {
    color: color('text-body');
  }

  .close {
    cursor: pointer;
    color: color('text-action');

    &:hover {
      color: color('text-action-hover');
    }
  }
}`}
        />
      </section>
    </>
  );
}

function ToastExamples({ t }: { t: (key: string) => string }) {
  const { showToast } = useToast();

  const examples = [
    {
      label: t('examples.borderFalseSuccessTopRight'),
      onClick: () => {
        showToast({
          header: t('examples.success'),
          message: t('examples.successMessage'),
          theme: 'success',
          border: false,
          position: 'top-right',
          duration: 3000,
        });
      },
    },
    {
      label: t('examples.borderTrueInfoTopCenter'),
      onClick: () => {
        showToast({
          header: t('examples.notification'),
          message: t('examples.newMessageNotification'),
          theme: 'info',
          border: true,
          position: 'top-center',
          duration: 3000,
        });
      },
    },
    {
      label: t('examples.longTrueWarningBottomRight'),
      onClick: () => {
        showToast({
          message: t('examples.unsavedChanges'),
          theme: 'warning',
          border: false,
          long: true,
          position: 'bottom-right',
          duration: 4000,
        });
      },
    },
    {
      label: t('examples.longTrueBorderTrueDangerBottomCenter'),
      onClick: () => {
        showToast({
          message: t('examples.errorOccurred'),
          theme: 'danger',
          border: true,
          long: true,
          position: 'bottom-center',
          duration: 3000,
        });
      },
    },
    {
      label: t('examples.primaryCenterManualClose'),
      onClick: () => {
        showToast({
          header: t('examples.importantNotification'),
          message: t('examples.manualCloseMessage'),
          theme: 'primary',
          border: false,
          position: 'center',
          duration: 0,
          width: 400,
        });
      },
    },
    {
      label: t('examples.customWidthBottomLeft'),
      onClick: () => {
        showToast({
          header: t('examples.wideToast'),
          message: t('examples.wideToastMessage'),
          theme: 'info',
          border: true,
          position: 'bottom-left',
          duration: 3000,
          width: 500,
        });
      },
    },
  ];

  return (
    <div className={styles.examplesSection}>
      <div className={styles.examplesGrid}>
        {examples.map((example, index) => (
          <button
            key={index}
            className="primary"
            onClick={example.onClick}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { ToastProvider, useToast } from 'podo-ui';`} />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step1Title')}</h2>
        <p>{t('sections.reactUsage.step1Description')}</p>

        <CodeBlock
          title="app/layout.tsx"
          language="tsx"
          code={`import { ToastProvider } from 'podo-ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}`}
        />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step2Title')}</h2>
        <p>{t('sections.reactUsage.step2Description')}</p>

        <CodeBlock
          title="component.tsx"
          language="tsx"
          code={`import { useToast } from 'podo-ui';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast({
      message: '${t('sections.reactUsage.savedMessage')}',
      header: '${t('variants.success.label')}',
      theme: 'success',
      border: false,
      position: 'top-right',
      duration: 3000,
    });
  };

  return <button onClick={handleClick}>${t('sections.reactUsage.saveButton')}</button>;
}`}
        />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step3Title')}</h2>
        <CodeBlock
          title="TypeScript"
          language="typescript"
          code={`interface ToastOptions {
  message: string;           // ${t('sections.reactUsage.messageRequired')}
  header?: string;           // ${t('sections.reactUsage.headerOptional')}
  theme?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
  border?: boolean;          // ${t('sections.reactUsage.borderOption')}
  long?: boolean;            // ${t('sections.reactUsage.longOption')}
  duration?: number;         // ${t('sections.reactUsage.durationOption')}
  width?: string | number;   // ${t('sections.reactUsage.widthOption')}
  position?: 'top-left' | 'top-center' | 'top-right'
           | 'center-left' | 'center' | 'center-right'
           | 'bottom-left' | 'bottom-center' | 'bottom-right';
}`}
        />
      </section>

      <section>
        <h2>{t('sections.reactComponentExample.title')}</h2>
        <p>{t('sections.reactComponentExample.description')}</p>

        <ToastExamples t={t} />
      </section>

      <section>
        <h2>{t('sections.reactUsage.step4Title')}</h2>
        <CodeBlock
          title="TypeScript"
          language="typescript"
          code={`// ${t('sections.reactUsage.exampleComment1')}
showToast({
  message: '${t('sections.reactUsage.exampleMessage1')}',
  theme: 'success',
  position: 'top-right',
});

// ${t('sections.reactUsage.exampleComment2')}
showToast({
  header: '${t('sections.reactUsage.exampleHeader2')}',
  message: '${t('sections.reactUsage.exampleMessage2')}',
  theme: 'info',
  border: true,
  position: 'bottom-center',
});

// ${t('sections.reactUsage.exampleComment3')}
showToast({
  message: '${t('sections.reactUsage.exampleMessage3')}',
  theme: 'success',
  long: true,
  position: 'bottom-right',
  duration: 2000,
});

// ${t('sections.reactUsage.exampleComment4')}
showToast({
  message: '${t('sections.reactUsage.exampleMessage4')}',
  width: 400,
  position: 'top-center',
});

// ${t('sections.reactUsage.exampleComment5')}
showToast({
  header: '${t('sections.reactUsage.exampleHeader5')}',
  message: '${t('sections.reactUsage.exampleMessage5')}',
  theme: 'warning',
  duration: 0,
  position: 'center',
});`}
        />
      </section>
    </>
  );
}

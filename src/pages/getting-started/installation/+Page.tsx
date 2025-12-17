import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Installation() {
  const { t } = useTranslation('installation');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <DocTabs
        tabs={[
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
          {
            key: 'cdn',
            label: 'CDN',
            content: <CdnContent t={t} />,
          },
        ]}
        defaultTab="react"
      />
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>{t('npm.title')}</h2>
        <p>{t('npm.description')}</p>

        <CodeBlock language="bash" code="npm install podo-ui" />
        <CodeBlock language="bash" code="yarn add podo-ui" />
        <CodeBlock language="bash" code="pnpm add podo-ui" />
      </section>

      <section>
        <h2>{t('setup.title')}</h2>

        <h3>{t('setup.globalScss.title')}</h3>
        <p>{t('setup.globalScss.description')}</p>

        <CodeBlock
          title={t('setup.globalScss.codeHeader')}
          language="tsx"
          code={`import 'podo-ui/global.scss';`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.globalScss.note.title')}</strong> {t('setup.globalScss.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h3>{t('setup.vite.title')}</h3>

        <div className={styles.warning}>
          <i className="icon-warning"></i>
          <div>
            <strong>{t('setup.vite.warning.title')}</strong> {t('setup.vite.warning.content')}
          </div>
        </div>

        <p>{t('setup.vite.description')}</p>

        <CodeBlock
          title={t('setup.vite.codeHeader')}
          language="tsx"
          code={`import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // ${t('setup.vite.codeComment')}`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.vite.note.title')}</strong> {t('setup.vite.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h3>{t('setup.scssModule.title')}</h3>
        <p>{t('setup.scssModule.description')}</p>

        <CodeBlock
          title={t('setup.scssModule.codeHeader')}
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);        // ${t('setup.scssModule.comments.color')}
  margin: s(4);                 // ${t('setup.scssModule.comments.spacing')}
  border-radius: r(2);          // ${t('setup.scssModule.comments.radius')}
  @include p2;                  // ${t('setup.scssModule.comments.typography')}
}`}
        />
      </section>

      <section>
        <h2>{t('reactComponents.title')}</h2>
        <p>{t('reactComponents.description')}</p>

        <CodeBlock
          title={t('reactComponents.codeHeader')}
          language="tsx"
          code={`import { Input, Textarea, Editor, Field, Toast, Chip } from 'podo-ui';`}
        />
      </section>

      <section>
        <h2>{t('nextSteps.title')}</h2>
        <p>{t('nextSteps.description')}</p>

        <div className={styles.linkGrid}>
          <a href="/getting-started/usage" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-file"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.usage.title')}</h3>
              <p>{t('nextSteps.links.usage.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/foundation/colors" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-ellipse"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.colors.title')}</h3>
              <p>{t('nextSteps.links.colors.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/components/button" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-layers"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.components.title')}</h3>
              <p>{t('nextSteps.links.components.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>
        </div>
      </section>
    </>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>{t('npm.title')}</h2>
        <p>{t('npm.description')}</p>

        <CodeBlock language="bash" code="npm install podo-ui" />
        <CodeBlock language="bash" code="yarn add podo-ui" />
        <CodeBlock language="bash" code="pnpm add podo-ui" />
      </section>

      <section>
        <h2>{t('setup.title')}</h2>

        <h3>{t('setup.globalScss.title')}</h3>
        <p>{t('setup.globalScss.description')}</p>

        <CodeBlock
          title="src/app.html or +layout.svelte"
          language="svelte"
          code={`<script>
  import 'podo-ui/global.scss';
</script>`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.globalScss.note.title')}</strong> {t('setup.globalScss.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h3>{t('setup.vite.title')}</h3>

        <div className={styles.warning}>
          <i className="icon-warning"></i>
          <div>
            <strong>{t('setup.vite.warning.title')}</strong> {t('setup.vite.warning.content')}
          </div>
        </div>

        <p>{t('setup.vite.description')}</p>

        <CodeBlock
          title="src/routes/+layout.svelte"
          language="svelte"
          code={`<script>
  import 'podo-ui/global.scss';
  import 'podo-ui/vite-fonts.scss'; // ${t('setup.vite.codeComment')}
</script>

{@render children()}`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.vite.note.title')}</strong> {t('setup.vite.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h3>{t('setup.scssModule.title')}</h3>
        <p>{t('setup.scssModule.description')}</p>

        <CodeBlock
          title="MyComponent.svelte"
          language="svelte"
          code={`<style lang="scss">
  @use 'podo-ui/mixin' as *;

  .myComponent {
    color: color(primary);        // ${t('setup.scssModule.comments.color')}
    margin: s(4);                 // ${t('setup.scssModule.comments.spacing')}
    border-radius: r(2);          // ${t('setup.scssModule.comments.radius')}
    @include p2;                  // ${t('setup.scssModule.comments.typography')}
  }
</style>`}
        />
      </section>

      <section>
        <h2>Svelte Components</h2>
        <p>Svelte 5 runes mode components are available from the <code>/svelte</code> path.</p>

        <CodeBlock
          title="Import"
          language="svelte"
          code={`<script lang="ts">
  import { Input, Textarea, Editor, Field, Toast, Chip } from 'podo-ui/svelte';
</script>`}
        />
      </section>

      <section>
        <h2>{t('nextSteps.title')}</h2>
        <p>{t('nextSteps.description')}</p>

        <div className={styles.linkGrid}>
          <a href="/getting-started/usage" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-file"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.usage.title')}</h3>
              <p>{t('nextSteps.links.usage.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/foundation/colors" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-ellipse"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.colors.title')}</h3>
              <p>{t('nextSteps.links.colors.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/components/button" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-layers"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.components.title')}</h3>
              <p>{t('nextSteps.links.components.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>
        </div>
      </section>
    </>
  );
}

function CdnContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>{t('cdn.title')}</h2>
        <p>{t('cdn.description')}</p>

        <h3>{t('cdn.cssTitle')}</h3>
        <p>{t('cdn.cssDescription')}</p>
        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- Podo UI Global CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-ui.min.css">`}
        />

        <h3>{t('cdn.datepickerTitle')}</h3>
        <p>{t('cdn.datepickerDescription')}</p>
        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- DatePicker CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.css">

<!-- DatePicker JS -->
<script src="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.js"></script>

<div id="my-datepicker"></div>

<script>
  const picker = new PodoDatePicker('#my-datepicker', {
    type: 'date',
    onChange: function(value) {
      console.log(value);
    }
  });
</script>`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('cdn.note.title')}</strong> {t('cdn.note.content')}
          </div>
        </div>
      </section>
    </>
  );
}

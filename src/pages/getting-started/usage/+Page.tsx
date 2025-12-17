import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Usage() {
  const { t } = useTranslation('usage');

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

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/mixin' as *;`} />
      </section>

      <section>
        <h2>{t('cssClasses.title')}</h2>
        <p>
          {t('cssClasses.description')}
        </p>

        <h3>{t('cssClasses.buttonExample.title')}</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <button className="primary">Primary Button</button>
            <button className="info">Info Button</button>
            <button className="danger">Danger Button</button>
          </div>
          <CodeBlock
            language="html"
            code={`<button class="primary">Primary Button</button>
<button class="info">Info Button</button>
<button class="danger">Danger Button</button>`}
          />
        </div>

        <h3>{t('cssClasses.buttonVariants.title')}</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <button className="primary-fill">Primary Fill</button>
            <button className="primary-border">Primary Border</button>
            <button className="primary-text">Primary Text</button>
          </div>
          <CodeBlock
            language="html"
            code={`<button class="primary-fill">Primary Fill</button>
<button class="primary-border">Primary Border</button>
<button class="primary-text">Primary Text</button>`}
          />
        </div>

        <h3>{t('cssClasses.inputExample.title')}</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <input type="text" placeholder={t('cssClasses.inputExample.placeholderDefault')} />
            <input type="text" className="success" placeholder="Success Input" />
            <input type="text" className="danger" placeholder="Danger Input" />
          </div>
          <CodeBlock
            language="html"
            code={`<input type="text" placeholder="${t('cssClasses.inputExample.placeholderDefault')}" />
<input type="text" class="success" placeholder="Success Input" />
<input type="text" class="danger" placeholder="Danger Input" />`}
          />
        </div>
      </section>

      <section>
        <h2>{t('scssFunctions.title')}</h2>
        <p>
          {t('scssFunctions.description')}
        </p>

        <h3>{t('scssFunctions.colorFunction.title')}</h3>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.myComponent {
  background: color(primary-base);      // ${t('scssFunctions.colorFunction.comments.primaryColor')}
  color: color(primary-reverse);        // ${t('scssFunctions.colorFunction.comments.reverseColor')}
  border: 1px solid color(primary-outline);

  &:hover {
    background: color(primary-hover);   // ${t('scssFunctions.colorFunction.comments.hoverColor')}
  }
}`}
        />

        <h3>{t('scssFunctions.spacingFunction.title')}</h3>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.myComponent {
  margin: s(4);          // ${t('scssFunctions.spacingFunction.comments.margin')}
  padding: s(6);         // ${t('scssFunctions.spacingFunction.comments.padding')}
  gap: s(3);            // ${t('scssFunctions.spacingFunction.comments.gap')}

  // ${t('scssFunctions.spacingFunction.comments.available')}
  margin-top: s(8);     // ${t('scssFunctions.spacingFunction.comments.marginTop')}
}`}
        />

        <h3>{t('scssFunctions.radiusFunction.title')}</h3>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.myComponent {
  border-radius: r(2);   // ${t('scssFunctions.radiusFunction.comments.r2')}
  border-radius: r(3);   // ${t('scssFunctions.radiusFunction.comments.r3')}
  border-radius: r(4);   // ${t('scssFunctions.radiusFunction.comments.r4')}
}`}
        />

        <h3>{t('scssFunctions.typographyMixin.title')}</h3>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.title {
  @include display1;     // ${t('scssFunctions.typographyMixin.comments.display1')}
}

.heading {
  @include display4;     // ${t('scssFunctions.typographyMixin.comments.display4')}
}

.body {
  @include p2;          // ${t('scssFunctions.typographyMixin.comments.p2')}
}

.caption {
  @include p5;          // ${t('scssFunctions.typographyMixin.comments.p5')}
}`}
        />
      </section>

      <section>
        <h2>{t('theme.title')}</h2>
        <p>
          {t('theme.description')}
        </p>

        <CodeBlock
          title={t('theme.codeHeader')}
          language="javascript"
          code={`// ${t('theme.comments.light')}
document.documentElement.setAttribute('data-color-mode', 'light');

// ${t('theme.comments.dark')}
document.documentElement.setAttribute('data-color-mode', 'dark');

// ${t('theme.comments.system')}
document.documentElement.setAttribute('data-color-mode', '');`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('theme.note.title')}</strong> {t('theme.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h2>{t('nextSteps.title')}</h2>
        <p>{t('nextSteps.description')}</p>

        <div className={styles.linkGrid}>
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

          <a href="/foundation/typography" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-text"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.typography.title')}</h3>
              <p>{t('nextSteps.links.typography.description')}</p>
            </div>
            <i className="icon-arrow-right"></i>
          </a>

          <a href="/foundation/icons" className={styles.linkCard}>
            <div className={styles.linkIcon}>
              <i className="icon-star"></i>
            </div>
            <div>
              <h3>{t('nextSteps.links.icons.title')}</h3>
              <p>{t('nextSteps.links.icons.description')}</p>
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

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="tsx"
          code={`import { Input, Textarea, Editor, Field } from 'podo-ui';`}
        />
      </section>

      <section>
        <h2>{t('reactComponents.title')}</h2>
        <p>
          {t('reactComponents.description')}
        </p>

        <CodeBlock
          title={t('reactComponents.codeHeader')}
          language="tsx"
          code={`import { Input, Textarea, Editor, Field } from 'podo-ui';

function MyForm() {
  return (
    <Field label="${t('reactComponents.example.label')}" required>
      <Input placeholder="${t('reactComponents.example.placeholder')}" />
    </Field>
  );
}`}
        />
      </section>

      <section>
        <h2>{t('theme.title')}</h2>
        <p>
          {t('theme.description')}
        </p>

        <CodeBlock
          title={t('theme.codeHeader')}
          language="javascript"
          code={`// ${t('theme.comments.light')}
document.documentElement.setAttribute('data-color-mode', 'light');

// ${t('theme.comments.dark')}
document.documentElement.setAttribute('data-color-mode', 'dark');

// ${t('theme.comments.system')}
document.documentElement.setAttribute('data-color-mode', '');`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('theme.note.title')}</strong> {t('theme.note.content')}
          </div>
        </div>
      </section>
    </>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="svelte"
          code={`<script lang="ts">
  import { Input, Textarea, Editor, Field } from 'podo-ui/svelte';
</script>`}
        />
      </section>

      <section>
        <h2>Svelte Components</h2>
        <p>
          Svelte 5 runes mode components are available from the <code>/svelte</code> path.
          All components support two-way binding with <code>bind:</code> syntax.
        </p>

        <CodeBlock
          title="Basic Form Example"
          language="svelte"
          code={`<script lang="ts">
  import { Input, Textarea, Editor, Field } from 'podo-ui/svelte';

  let name = $state('');
  let description = $state('');
</script>

<Field label="${t('reactComponents.example.label')}" required>
  <Input bind:value={name} placeholder="${t('reactComponents.example.placeholder')}" />
</Field>

<Field label="Description">
  <Textarea bind:value={description} placeholder="Enter description" />
</Field>`}
        />
      </section>

      <section>
        <h2>Svelte 5 Runes Mode</h2>
        <p>
          podo-ui Svelte components use Svelte 5 runes mode with <code>$state()</code>, <code>$derived()</code>, and <code>$effect()</code>.
        </p>

        <CodeBlock
          title="State Management"
          language="svelte"
          code={`<script lang="ts">
  import { Input, Button } from 'podo-ui/svelte';

  let value = $state('');
  let isValid = $derived(value.length >= 3);
</script>

<Input bind:value placeholder="Enter at least 3 characters" />
<Button disabled={!isValid}>Submit</Button>`}
        />
      </section>

      <section>
        <h2>{t('theme.title')}</h2>
        <p>
          {t('theme.description')}
        </p>

        <CodeBlock
          title="Theme Toggle"
          language="svelte"
          code={`<script lang="ts">
  let theme = $state<'light' | 'dark' | ''>('');

  function setTheme(mode: 'light' | 'dark' | '') {
    theme = mode;
    document.documentElement.setAttribute('data-color-mode', mode);
  }
</script>

<button onclick={() => setTheme('light')}>Light</button>
<button onclick={() => setTheme('dark')}>Dark</button>
<button onclick={() => setTheme('')}>System</button>`}
        />

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('theme.note.title')}</strong> {t('theme.note.content')}
          </div>
        </div>
      </section>

      <section>
        <h2>Available Components</h2>
        <p>All React components are available in Svelte with the same functionality.</p>

        <CodeBlock
          title="All Components"
          language="svelte"
          code={`<script lang="ts">
  // Atom Components
  import {
    Button, Label, Input, Textarea, Checkbox, Radio,
    Select, Toggle, File, Avatar, Chip, Tooltip
  } from 'podo-ui/svelte';

  // Molecule Components
  import {
    Field, Pagination, Tab, Table, Toast, ToastProvider,
    DatePicker, Editor, EditorView
  } from 'podo-ui/svelte';
</script>`}
        />
      </section>
    </>
  );
}

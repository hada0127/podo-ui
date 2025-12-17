import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button as ButtonComponent } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Button() {
  const { t } = useTranslation('button');
  const [loading, setLoading] = useState(false);

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
            content: <ReactContent t={t} loading={loading} setLoading={setLoading} />,
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
  const variants = [
    { name: 'primary', key: 'primary' },
    { name: '', key: 'default' },
    { name: 'default-deep', key: 'defaultDeep' },
    { name: 'info', key: 'info' },
    { name: 'link', key: 'link' },
    { name: 'success', key: 'success' },
    { name: 'warning', key: 'warning' },
    { name: 'danger', key: 'danger' },
  ];

  const getClassName = (variant: string, style: string) => {
    return `${variant}${style}`.trim();
  };

  const getCodeClass = (variant: string, style: string) => {
    const cls = getClassName(variant, style);
    return cls ? ` class="${cls}"` : '';
  };

  const buttonStyles = [
    { suffix: '', key: 'solid' },
    { suffix: ' fill', key: 'fill' },
    { suffix: ' border', key: 'border' },
    { suffix: ' text', key: 'text' },
  ];

  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/scss/atom/button';`}
        />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<button>${t('basicUsage.examples.basic')}</button>
<button class="primary">${t('basicUsage.examples.primary')}</button>
<button class="danger">${t('basicUsage.examples.danger')}</button>
<button disabled>${t('basicUsage.examples.disabled')}</button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.buttonGroup}>
            <button>{t('basicUsage.examples.basic')}</button>
            <button className="primary">{t('basicUsage.examples.primary')}</button>
            <button className="danger">{t('basicUsage.examples.danger')}</button>
            <button disabled>{t('basicUsage.examples.disabled')}</button>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('variants.title')}</h2>
        <p>{t('variants.description')}</p>

        <div className={styles.variantsShowcase}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantHeader}>
                <h3>{t(`variants.${variant.key}.label`)}</h3>
                <p>{t(`variants.${variant.key}.description`)}</p>
              </div>
              <button className={variant.name || undefined}>{t(`variants.${variant.key}.label`)}</button>
            </div>
          ))}
        </div>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<button class="primary">Primary</button>
<button>Default</button>
<button class="default-deep">Default Deep</button>
<button class="info">Info</button>
<button class="link">Link</button>
<button class="success">Success</button>
<button class="warning">Warning</button>
<button class="danger">Danger</button>`}
        />
      </section>

      <section>
        <h2>{t('styles.title')}</h2>
        <p>{t('styles.description')}</p>

        {buttonStyles.map((style) => (
          <div key={style.suffix} className={styles.styleSection}>
            <h3>{t(`styles.${style.key}.label`)}</h3>
            <p>{t(`styles.${style.key}.description`)}</p>

            <div className={styles.buttonGroup}>
              {variants.map((variant) => (
                <button key={variant.key} className={getClassName(variant.name, style.suffix) || undefined}>
                  {t(`variants.${variant.key}.label`)}
                </button>
              ))}
            </div>

            <CodeBlock
              language="html"
              code={variants.map((variant) =>
                `<button${getCodeClass(variant.name, style.suffix)}>${t(`variants.${variant.key}.label`)}</button>`
              ).join('\n')}
            />
          </div>
        ))}
      </section>

      <section>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<button class="primary xxs">xxs Button</button>
<button class="primary xs">xs Button</button>
<button class="primary sm">sm Button</button>
<button class="primary md">md Button</button>
<button class="primary lg">lg Button</button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.sizeDemo}>
            <button className="primary xxs">xxs Button</button>
            <button className="primary xs">xs Button</button>
            <button className="primary sm">sm Button</button>
            <button className="primary md">md Button</button>
            <button className="primary lg">lg Button</button>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('icons.title')}</h2>
        <p>{t('icons.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<button class="primary">
  <i class="icon-plus"></i>
  ${t('icons.examples.create')}
</button>

<button class="success">
  <i class="icon-check"></i>
  ${t('icons.examples.confirm')}
</button>

<!-- Icon only -->
<button class="primary">
  <i class="icon-search"></i>
</button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.iconButtonDemo}>
            <button className="primary">
              <i className="icon-plus"></i>
              {t('icons.examples.create')}
            </button>
            <button className="success">
              <i className="icon-check"></i>
              {t('icons.examples.confirm')}
            </button>
            <button className="danger">
              <i className="icon-trash"></i>
              {t('icons.examples.delete')}
            </button>
            <button className="primary">
              <i className="icon-search"></i>
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.customButton {
  display: flex;
  align-items: center;
  gap: s(2);
  padding: s(3) s(5);
  background: color(primary-base);
  color: color(primary-reverse);
  border: none;
  border-radius: r(3);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: color(primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    background: color(primary-pressed);
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}`}
        />
      </section>

      <section>
        <h2>{t('showcase.title')}</h2>
        <p>{t('showcase.description')}</p>

        <div className={styles.showcase}>
          {variants.map((variant) => (
            <div key={variant.key} className={styles.showcaseRow}>
              <div className={styles.showcaseLabel}>
                <strong>{t(`variants.${variant.key}.label`)}</strong>
                <span>{t(`variants.${variant.key}.description`)}</span>
              </div>
              <div className={styles.showcaseButtons}>
                <button className={variant.name || undefined}>Solid</button>
                <button className={getClassName(variant.name, ' fill') || undefined}>Fill</button>
                <button className={getClassName(variant.name, ' border') || undefined}>Border</button>
                <button className={getClassName(variant.name, ' text') || undefined}>Text</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { Button } from 'podo-ui/svelte';`}
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
              <td><code>theme</code></td>
              <td><code>'primary' | 'success' | 'warning' | 'danger' | 'info' | 'link'</code></td>
              <td>-</td>
              <td>{t('react.props.theme')}</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td><code>'solid' | 'fill' | 'border' | 'text'</code></td>
              <td>'solid'</td>
              <td>{t('react.props.variant')}</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>'xxs' | 'xs' | 'sm' | 'md' | 'lg'</code></td>
              <td>'sm'</td>
              <td>{t('react.props.size')}</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.icon')}</td>
            </tr>
            <tr>
              <td><code>rightIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.rightIcon')}</td>
            </tr>
            <tr>
              <td><code>loading</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.loading')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.disabled')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.sections.basicUsage')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Button } from 'podo-ui/svelte';
</script>

<!-- Basic -->
<Button theme="primary">Primary</Button>
<Button theme="danger" variant="border">Danger Border</Button>

<!-- With Icons -->
<Button theme="primary" icon="icon-plus">Create</Button>
<Button theme="success" icon="icon-check" rightIcon="icon-arrow-right">Confirm</Button>

<!-- Sizes -->
<Button theme="primary" size="xxs">XXS</Button>
<Button theme="primary" size="lg">Large</Button>

<!-- Loading -->
<Button theme="primary" loading>Loading...</Button>`}
        />
      </section>

      <section>
        <h2>{t('react.sections.iconsAndLoading')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Button } from 'podo-ui/svelte';

  let loading = $state(false);

  function handleClick() {
    loading = true;
    setTimeout(() => loading = false, 2000);
  }
</script>

<Button theme="primary" icon="icon-plus">Create</Button>
<Button theme="success" icon="icon-check">Confirm</Button>
<Button theme="primary" {loading} onclick={handleClick}>
  {loading ? 'Loading...' : 'Click to Load'}
</Button>`}
        />
      </section>

      <section>
        <h2>{t('react.sections.sizes')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Button } from 'podo-ui/svelte';
</script>

<Button theme="primary" size="xxs">XXS</Button>
<Button theme="primary" size="xs">XS</Button>
<Button theme="primary" size="sm">SM (Default)</Button>
<Button theme="primary" size="md">MD</Button>
<Button theme="primary" size="lg">LG</Button>`}
        />
      </section>

      <section>
        <h2>Snippets (Children)</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Button } from 'podo-ui/svelte';
</script>

<!-- Text content -->
<Button theme="primary">Click me</Button>

<!-- With custom content -->
<Button theme="success">
  <span>Custom</span> Content
</Button>`}
        />
      </section>
    </>
  );
}

function ReactContent({ t, loading, setLoading }: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="tsx"
          code={`import { Button } from 'podo-ui';`}
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
              <td><code>theme</code></td>
              <td><code>'primary' | 'success' | 'warning' | 'danger' | 'info' | 'link'</code></td>
              <td>-</td>
              <td>{t('react.props.theme')}</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td><code>'solid' | 'fill' | 'border' | 'text'</code></td>
              <td>'solid'</td>
              <td>{t('react.props.variant')}</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>'xxs' | 'xs' | 'sm' | 'md' | 'lg'</code></td>
              <td>'sm'</td>
              <td>{t('react.props.size')}</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.icon')}</td>
            </tr>
            <tr>
              <td><code>rightIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.rightIcon')}</td>
            </tr>
            <tr>
              <td><code>loading</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.loading')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.disabled')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.sections.basicUsage')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Button } from 'podo-ui';

// Basic
<Button theme="primary">Primary</Button>
<Button theme="danger" variant="border">Danger Border</Button>

// With Icons
<Button theme="primary" icon="icon-plus">Create</Button>
<Button theme="success" icon="icon-check" rightIcon="icon-arrow-right">Confirm</Button>

// Sizes
<Button theme="primary" size="xxs">XXS</Button>
<Button theme="primary" size="lg">Large</Button>

// Loading
<Button theme="primary" loading>Loading...</Button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Button Demo</div>
          <div className={styles.buttonGroup}>
            <ButtonComponent theme="primary">Primary</ButtonComponent>
            <ButtonComponent theme="success">Success</ButtonComponent>
            <ButtonComponent theme="danger" variant="border">Danger Border</ButtonComponent>
            <ButtonComponent theme="info" variant="fill">Info Fill</ButtonComponent>
            <ButtonComponent theme="warning" variant="text">Warning Text</ButtonComponent>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.sections.iconsAndLoading')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Button theme="primary" icon="icon-plus">Create</Button>
<Button theme="success" icon="icon-check">Confirm</Button>
<Button
  theme="primary"
  loading={loading}
  onClick={() => setLoading(true)}
>
  {loading ? 'Loading...' : 'Click to Load'}
</Button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>With Icons & Loading</div>
          <div className={styles.buttonGroup}>
            <ButtonComponent theme="primary" icon="icon-plus">Create</ButtonComponent>
            <ButtonComponent theme="success" icon="icon-check">Confirm</ButtonComponent>
            <ButtonComponent
              theme="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
              }}
            >
              {loading ? 'Loading...' : 'Click to Load'}
            </ButtonComponent>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.sections.sizes')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Button theme="primary" size="xxs">XXS</Button>
<Button theme="primary" size="xs">XS</Button>
<Button theme="primary" size="sm">SM (Default)</Button>
<Button theme="primary" size="md">MD</Button>
<Button theme="primary" size="lg">LG</Button>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Sizes</div>
          <div className={styles.sizeDemo}>
            <ButtonComponent theme="primary" size="xxs">XXS</ButtonComponent>
            <ButtonComponent theme="primary" size="xs">XS</ButtonComponent>
            <ButtonComponent theme="primary" size="sm">SM (Default)</ButtonComponent>
            <ButtonComponent theme="primary" size="md">MD</ButtonComponent>
            <ButtonComponent theme="primary" size="lg">LG</ButtonComponent>
          </div>
        </div>
      </section>
    </>
  );
}

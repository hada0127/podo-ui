import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button as ButtonComponent } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
import styles from './Page.module.scss';

export default function Button() {
  const { t } = useTranslation('button');
  const [loading, setLoading] = useState(false);

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

  // Helper to generate class string (removes leading/trailing spaces)
  const getClassName = (variant: string, style: string) => {
    return `${variant}${style}`.trim();
  };

  // Helper to generate code example class attribute
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
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>React Component</h2>
        <p>podo-ui React 컴포넌트를 사용한 예제입니다.</p>

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

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<button>${t('basicUsage.examples.basic')}</button>
<button class="primary">${t('basicUsage.examples.primary')}</button>
<button class="danger">${t('basicUsage.examples.danger')}</button>
<button disabled>${t('basicUsage.examples.disabled')}</button>`}</code></pre>
        </div>

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

      <section className={styles.section}>
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

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<button class="primary">Primary</button>
<button>Default</button>
<button class="default-deep">Default Deep</button>
<button class="info">Info</button>
<button class="link">Link</button>
<button class="success">Success</button>
<button class="warning">Warning</button>
<button class="danger">Danger</button>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
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

            <div className={styles.codeBlock}>
              <pre><code>{variants.map((variant) =>
                `<button${getCodeClass(variant.name, style.suffix)}>${t(`variants.${variant.key}.label`)}</button>`
              ).join('\n')}</code></pre>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<button class="primary xxs">
  xxs Button
</button>

<button class="primary xs">
  xs Button
</button>

<button class="primary sm">
  sm Button
</button>

<button class="primary md">
  md Button
</button>

<button class="primary lg">
  lg Button
</button>
`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.sizeDemo}>
            <button className="primary xxs">
              xxs Button
            </button>

            <button className="primary xs">
              xs Button
            </button>

            <button className="primary sm">
              sm Button
            </button>

            <button className="primary md">
              md Button
            </button>

            <button className="primary lg">
              lg Button
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('alignment.title')}</h2>
        <p>{t('alignment.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<!-- ${t('alignment.center')} -->
<button class="primary">${t('alignment.center')}</button>

<!-- ${t('alignment.left')} -->
<button class="primary text-left">${t('alignment.left')}</button>

<!-- ${t('alignment.right')} -->
<button class="primary text-right">${t('alignment.right')}</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.alignDemo}>
            <button className="primary" style={{ width: '200px' }}>
              {t('alignment.center')}
            </button>
            <button className="primary text-left" style={{ width: '200px' }}>
              {t('alignment.left')}
            </button>
            <button className="primary text-right" style={{ width: '200px' }}>
              {t('alignment.right')}
            </button>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('alignment.withIcons')}</div>
          <div className={styles.alignDemo}>
            <button className="success text-left" style={{ width: '200px' }}>
              <i className="icon-check"></i>
              {t('alignment.left')}
            </button>
            <button className="info" style={{ width: '200px' }}>
              <i className="icon-download"></i>
              {t('alignment.center')}
            </button>
            <button className="warning text-right" style={{ width: '200px' }}>
              {t('alignment.right')}
              <i className="icon-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('icons.title')}</h2>
        <p>{t('icons.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<button class="primary">
  <i class="icon-plus"></i>
  ${t('icons.examples.create')}
</button>

<button class="success">
  <i class="icon-check"></i>
  ${t('icons.examples.confirm')}
</button>

<button class="danger">
  <i class="icon-trash"></i>
  ${t('icons.examples.delete')}
</button>

<!-- Text style -->
<button class="primary text">
  <i class="icon-plus"></i>
  ${t('icons.examples.create')}
</button>

<!-- Icon only -->
<button class="primary">
  <i class="icon-search"></i>
</button>`}</code></pre>
        </div>

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
            <button className="info">
              <i className="icon-download"></i>
              {t('icons.examples.download')}
            </button>
            <button className="primary text">
              <i className="icon-plus"></i>
              {t('icons.examples.create')}
            </button>
            <button className="danger text">
              <i className="icon-trash"></i>
              {t('icons.examples.delete')}
            </button>
            <button className="primary">
              <i className="icon-search"></i>
            </button>
            <button className="danger">
              <i className="icon-close"></i>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('disabled.title')}</h2>
        <p>{t('disabled.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<button class="primary" disabled>Disabled</button>
<button class="success" disabled>Disabled</button>
<button class="danger" disabled>Disabled</button>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.buttonGroup}>
            <button className="primary" disabled>Primary</button>
            <button className="default" disabled>Default</button>
            <button className="success" disabled>Success</button>
            <button className="danger" disabled>Danger</button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('groups.title')}</h2>
        <p>{t('groups.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('demo.codeHeader')}</div>
          <pre><code>{`<div style="display: flex; gap: 0.5rem;">
  <button class="primary">${t('groups.examples.save')}</button>
  <button class="default">${t('groups.examples.cancel')}</button>
</div>

<div style="display: flex; gap: 0.5rem;">
  <button class="primary">
    <i class="icon-arrow-left"></i>
    ${t('groups.examples.previous')}
  </button>
  <button class="primary">
    ${t('groups.examples.next')}
    <i class="icon-arrow-right"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.groupDemo}>
            <div className={styles.buttonRow}>
              <button className="primary">{t('groups.examples.save')}</button>
              <button className="default">{t('groups.examples.cancel')}</button>
            </div>
            <div className={styles.buttonRow}>
              <button className="primary">
                <i className="icon-arrow-left"></i>
                {t('groups.examples.previous')}
              </button>
              <button className="primary">
                {t('groups.examples.next')}
                <i className="icon-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

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
    transform: none;
  }

  i {
    font-size: 16px;
  }
}

.iconOnlyButton {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: color(primary-fill);
  color: color(primary-base);
  border: 1px solid color(primary-outline);
  border-radius: r(2);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: color(primary-base);
    color: color(primary-reverse);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
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

import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function Usage() {
  const { t } = useTranslation('usage');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
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
          <div className={styles.codeBlock}>
            <pre><code>{`<button class="primary">Primary Button</button>
<button class="info">Info Button</button>
<button class="danger">Danger Button</button>`}</code></pre>
          </div>
        </div>

        <h3>{t('cssClasses.buttonVariants.title')}</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <button className="primary-fill">Primary Fill</button>
            <button className="primary-border">Primary Border</button>
            <button className="primary-text">Primary Text</button>
          </div>
          <div className={styles.codeBlock}>
            <pre><code>{`<button class="primary-fill">Primary Fill</button>
<button class="primary-border">Primary Border</button>
<button class="primary-text">Primary Text</button>`}</code></pre>
          </div>
        </div>

        <h3>{t('cssClasses.inputExample.title')}</h3>
        <div className={styles.example}>
          <div className={styles.preview}>
            <input type="text" placeholder={t('cssClasses.inputExample.placeholderDefault')} />
            <input type="text" className="success" placeholder="Success Input" />
            <input type="text" className="danger" placeholder="Danger Input" />
          </div>
          <div className={styles.codeBlock}>
            <pre><code>{`<input type="text" placeholder="${t('cssClasses.inputExample.placeholderDefault')}" />
<input type="text" class="success" placeholder="Success Input" />
<input type="text" class="danger" placeholder="Danger Input" />`}</code></pre>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scssFunctions.title')}</h2>
        <p>
          {t('scssFunctions.description')}
        </p>

        <h3>{t('scssFunctions.colorFunction.title')}</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  background: color(primary-base);      // ${t('scssFunctions.colorFunction.comments.primaryColor')}
  color: color(primary-reverse);        // ${t('scssFunctions.colorFunction.comments.reverseColor')}
  border: 1px solid color(primary-outline);

  &:hover {
    background: color(primary-hover);   // ${t('scssFunctions.colorFunction.comments.hoverColor')}
  }
}`}</code></pre>
        </div>

        <h3>{t('scssFunctions.spacingFunction.title')}</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  margin: s(4);          // ${t('scssFunctions.spacingFunction.comments.margin')}
  padding: s(6);         // ${t('scssFunctions.spacingFunction.comments.padding')}
  gap: s(3);            // ${t('scssFunctions.spacingFunction.comments.gap')}

  // ${t('scssFunctions.spacingFunction.comments.available')}
  margin-top: s(8);     // ${t('scssFunctions.spacingFunction.comments.marginTop')}
}`}</code></pre>
        </div>

        <h3>{t('scssFunctions.radiusFunction.title')}</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  border-radius: r(2);   // ${t('scssFunctions.radiusFunction.comments.r2')}
  border-radius: r(3);   // ${t('scssFunctions.radiusFunction.comments.r3')}
  border-radius: r(4);   // ${t('scssFunctions.radiusFunction.comments.r4')}
}`}</code></pre>
        </div>

        <h3>{t('scssFunctions.typographyMixin.title')}</h3>
        <div className={styles.codeBlock}>
          <pre><code>{`@use 'podo-ui/mixin' as *;

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
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('reactComponents.title')}</h2>
        <p>
          {t('reactComponents.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('reactComponents.codeHeader')}</div>
          <pre><code>{`import { Input, Textarea, Editor, Field } from 'podo-ui';

function MyForm() {
  return (
    <Field label="${t('reactComponents.example.label')}" required>
      <Input placeholder="${t('reactComponents.example.placeholder')}" />
    </Field>
  );
}`}</code></pre>
        </div>

      </section>

      <section className={styles.section}>
        <h2>{t('theme.title')}</h2>
        <p>
          {t('theme.description')}
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('theme.codeHeader')}</div>
          <pre><code>{`// ${t('theme.comments.light')}
document.documentElement.setAttribute('data-color-mode', 'light');

// ${t('theme.comments.dark')}
document.documentElement.setAttribute('data-color-mode', 'dark');

// ${t('theme.comments.system')}
document.documentElement.setAttribute('data-color-mode', '');`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('theme.note.title')}</strong> {t('theme.note.content')}
          </div>
        </div>
      </section>

      <section className={styles.section}>
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

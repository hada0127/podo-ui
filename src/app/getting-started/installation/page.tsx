'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Installation() {
  const t = useTranslations('installation');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('npm.title')}</h2>
        <p>{t('npm.description')}</p>

        <div className={styles.codeBlock}>
          <pre><code>npm install podo-ui</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <pre><code>yarn add podo-ui</code></pre>
        </div>

        <div className={styles.codeBlock}>
          <pre><code>pnpm add podo-ui</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('setup.title')}</h2>

        <h3>{t('setup.globalScss.title')}</h3>
        <p>{t('setup.globalScss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('setup.globalScss.codeHeader')}</div>
          <pre><code>{`import 'podo-ui/global.scss';`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.globalScss.note.title')}</strong> {t('setup.globalScss.note.content')}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>{t('setup.vite.title')}</h3>

        <div className={styles.warning}>
          <i className="icon-warning"></i>
          <div>
            <strong>{t('setup.vite.warning.title')}</strong> {t('setup.vite.warning.content')}
          </div>
        </div>

        <p>{t('setup.vite.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('setup.vite.codeHeader')}</div>
          <pre><code>{`import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // ${t('setup.vite.codeComment')}`}</code></pre>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('setup.vite.note.title')}</strong> {t('setup.vite.note.content')}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3>{t('setup.scssModule.title')}</h3>
        <p>{t('setup.scssModule.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('setup.scssModule.codeHeader')}</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);        // ${t('setup.scssModule.comments.color')}
  margin: s(4);                 // ${t('setup.scssModule.comments.spacing')}
  border-radius: r(2);          // ${t('setup.scssModule.comments.radius')}
  @include p2;                  // ${t('setup.scssModule.comments.typography')}
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('reactComponents.title')}</h2>
        <p>{t('reactComponents.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>{t('reactComponents.codeHeader')}</div>
          <pre><code>{`import { Input, Textarea, Editor, Field, Toast, Chip } from 'podo-ui';`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
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

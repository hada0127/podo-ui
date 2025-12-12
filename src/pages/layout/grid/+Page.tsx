import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Grid() {
  const { t } = useTranslation('grid');

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
        <h2>{t('gridSystem.title')}</h2>
        <p>
          {t('gridSystem.description')}
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="12">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>{t('gridSystem.pc.title')}</h2>
            <p>{t('gridSystem.pc.columns')}</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>{t('gridSystem.tablet.title')}</h2>
            <p>{t('gridSystem.tablet.columns')}</p>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.gridPreview} data-cols="4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.gridCol}></div>
              ))}
            </div>
            <h2>{t('gridSystem.mobile.title')}</h2>
            <p>{t('gridSystem.mobile.columns')}</p>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('basicGrid.title')}</h2>
        <p>{t('basicGrid.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<section class="grid">
  <div class="w-4">${t('code.columns')}</div>
  <div class="w-4">${t('code.columns')}</div>
  <div class="w-4">${t('code.columns')}</div>
  <div class="w-6">${t('code.sixColumns')}</div>
  <div class="w-6">${t('code.sixColumns')}</div>
  <div class="w-12">${t('code.twelveColumns')}</div>
</section>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('basicGrid.example')}</div>
          <section className="grid">
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-4">
              <div className={styles.gridItem}>w-4</div>
            </div>
            <div className="w-6">
              <div className={styles.gridItem}>w-6</div>
            </div>
            <div className="w-6">
              <div className={styles.gridItem}>w-6</div>
            </div>
            <div className="w-12">
              <div className={styles.gridItem}>w-12</div>
            </div>
          </section>
        </div>
      </section>

      <section>
        <h2>{t('gridSize.title')}</h2>
        <p>{t('gridSize.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('gridSize.allSizes')}</div>
          <section className="grid">
            <div className="w-12"><div className={styles.gridItem}>w-12 (100%)</div></div>
            <div className="w-11"><div className={styles.gridItem}>w-11</div></div>
            <div className="w-1"><div className={styles.gridItem}>w-1</div></div>
            <div className="w-10"><div className={styles.gridItem}>w-10</div></div>
            <div className="w-2"><div className={styles.gridItem}>w-2</div></div>
            <div className="w-9"><div className={styles.gridItem}>w-9</div></div>
            <div className="w-3"><div className={styles.gridItem}>w-3</div></div>
            <div className="w-8"><div className={styles.gridItem}>w-8</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-7"><div className={styles.gridItem}>w-7</div></div>
            <div className="w-5"><div className={styles.gridItem}>w-5</div></div>
            <div className="w-6"><div className={styles.gridItem}>w-6</div></div>
            <div className="w-6"><div className={styles.gridItem}>w-6</div></div>
          </section>
        </div>
      </section>

      <section>
        <h2>{t('fixedGrid.title')}</h2>
        <p>{t('fixedGrid.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('code.twoColumnFixed')} -->
<section class="grid grid-fix-2">
  <div class="w-1_2">50%</div>
  <div class="w-1_2">50%</div>
</section>

<!-- ${t('code.threeColumnFixed')} -->
<section class="grid grid-fix-3">
  <div class="w-1_3">33.33%</div>
  <div class="w-2_3">66.67%</div>
</section>

<!-- ${t('code.fourColumnFixed')} -->
<section class="grid grid-fix-4">
  <div class="w-1_4">25%</div>
  <div class="w-3_4">75%</div>
</section>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('fixedGrid.twoColumn')}</div>
          <section className="grid grid-fix-2">
            <div className="w-1_2"><div className={styles.gridItem}>w-1_2 (50%)</div></div>
            <div className="w-1_2"><div className={styles.gridItem}>w-1_2 (50%)</div></div>
          </section>

          <div className={styles.demoTitle}>{t('fixedGrid.threeColumn')}</div>
          <section className="grid grid-fix-3">
            <div className="w-1_3"><div className={styles.gridItem}>w-1_3</div></div>
            <div className="w-2_3"><div className={styles.gridItem}>w-2_3</div></div>
          </section>

          <div className={styles.demoTitle}>{t('fixedGrid.fourColumn')}</div>
          <section className="grid grid-fix-4">
            <div className="w-1_4"><div className={styles.gridItem}>w-1_4</div></div>
            <div className="w-1_4"><div className={styles.gridItem}>w-1_4</div></div>
            <div className="w-2_4"><div className={styles.gridItem}>w-2_4</div></div>
          </section>

          <div className={styles.demoTitle}>{t('fixedGrid.fiveColumn')}</div>
          <section className="grid grid-fix-5">
            <div className="w-2_5"><div className={styles.gridItem}>w-2_5</div></div>
            <div className="w-3_5"><div className={styles.gridItem}>w-3_5</div></div>
          </section>

          <div className={styles.demoTitle}>{t('fixedGrid.sixColumn')}</div>
          <section className="grid grid-fix-6">
            <div className="w-2_6"><div className={styles.gridItem}>w-2_6</div></div>
            <div className="w-4_6"><div className={styles.gridItem}>w-4_6</div></div>
          </section>
        </div>
      </section>

      <section>
        <h2>{t('fullWidth.title')}</h2>
        <p>{t('fullWidth.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<section class="grid">
  <div class="w-4">${t('code.fourColumns')}</div>
  <div class="w-4">${t('code.fourColumns')}</div>
  <div class="w-4">${t('code.fourColumns')}</div>
  <div class="w-full">${t('code.fullWidth')}</div>
</section>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('fullWidth.example')}</div>
          <section className="grid">
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-4"><div className={styles.gridItem}>w-4</div></div>
            <div className="w-full"><div className={styles.gridItem}>w-full</div></div>
          </section>
        </div>
      </section>

      <section>
        <h2>{t('responsive.title')}</h2>
        <p>{t('responsive.description')}</p>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('responsive.breakpoints')}</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>{t('responsive.pc')}</li>
              <li>{t('responsive.tablet')}</li>
              <li>{t('responsive.mobile')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('objectWidth.title')}</h2>
        <p>{t('objectWidth.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- Use outside grid -->
<div>
  <div class="w-3">25% width</div>
  <div class="w-6">50% width</div>
  <div class="w-9">75% width</div>
  <div class="w-12">100% width</div>
  <div class="w-full">100% width</div>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('objectWidth.example')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="w-3"><div className={styles.gridItem}>w-3 (25%)</div></div>
            <div className="w-6"><div className={styles.gridItem}>w-6 (50%)</div></div>
            <div className="w-9"><div className={styles.gridItem}>w-9 (75%)</div></div>
            <div className="w-12"><div className={styles.gridItem}>w-12 (100%)</div></div>
            <div className="w-full"><div className={styles.gridItem}>w-full (100%)</div></div>
          </div>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <span>{t('objectWidth.note')}</span>
        </div>
      </section>

      <section>
        <h2>{t('pixelWidth.title')}</h2>
        <p>{t('pixelWidth.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="w-100px">100px width</div>
<div class="w-200px">200px width</div>
<div class="w-300px">300px width</div>
<div class="w-500px">500px width</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('pixelWidth.example')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="w-100px"><div className={styles.gridItem}>w-100px</div></div>
            <div className="w-200px"><div className={styles.gridItem}>w-200px</div></div>
            <div className="w-300px"><div className={styles.gridItem}>w-300px</div></div>
            <div className="w-500px"><div className={styles.gridItem}>w-500px</div></div>
          </div>
        </div>

        <div className={styles.note}>
          <i className="icon-info"></i>
          <span>{t('pixelWidth.note')}</span>
        </div>
      </section>
    </>
  );
}

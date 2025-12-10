import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Responsive() {
  const { t } = useTranslation('responsive');

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
        <h2>{t('breakpoints.title')}</h2>
        <p>
          {t('breakpoints.description')}
        </p>

        <div className={styles.breakpointGrid}>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h2>{t('breakpoints.pc.title')}</h2>
            <p className={styles.breakpointValue}>{t('breakpoints.pc.range')}</p>
            <code>@include pc</code>
          </div>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h2>{t('breakpoints.tablet.title')}</h2>
            <p className={styles.breakpointValue}>{t('breakpoints.tablet.range')}</p>
            <code>@include tb</code>
          </div>
          <div className={styles.breakpointCard}>
            <div className={styles.breakpointIcon}>
              <i className="icon-menu"></i>
            </div>
            <h2>{t('breakpoints.mobile.title')}</h2>
            <p className={styles.breakpointValue}>{t('breakpoints.mobile.range')}</p>
            <code>@include mo</code>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('mediaQueries.title')}</h2>
        <p>{t('mediaQueries.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.container {
  padding: s(8);
  font-size: 18px;

  // ` + t('code.tbMedia') + `
  @include tb {
    padding: s(6);
    font-size: 16px;
  }

  // ` + t('code.moMedia') + `
  @include mo {
    padding: s(4);
    font-size: 14px;
  }

  // ` + t('code.pcMedia') + `
  @include pc {
    max-width: 1200px;
    margin: 0 auto;
  }
}`}
        />
      </section>

      <section>
        <h2>{t('hiding.title')}</h2>
        <p>{t('hiding.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('hiding.alwaysHide')} -->
<div class="hide">${t('hiding.alwaysHide')}</div>

<!-- ${t('hiding.hideOnPcOnly')} -->
<div class="hide-pc">${t('hiding.hideOnPcOnly')}</div>

<!-- ${t('hiding.hideOnTabletOnly')} -->
<div class="hide-tb">${t('hiding.hideOnTabletOnly')}</div>

<!-- ${t('hiding.hideOnMobileOnly')} -->
<div class="hide-mo">${t('hiding.hideOnMobileOnly')}</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('hiding.example')}</div>
          <div className={styles.hideDemo}>
            <div className="hide-pc"><div className={styles.demoBox}>{t('hiding.hideOnPc')}</div></div>
            <div className="hide-tb"><div className={styles.demoBox}>{t('hiding.hideOnTablet')}</div></div>
            <div className="hide-mo"><div className={styles.demoBox}>{t('hiding.hideOnMobile')}</div></div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('gridExample.title')}</h2>
        <p>{t('gridExample.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('code.autoAdjust')} -->
<section class="grid">
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
  <div class="w-3">25%</div>
</section>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('gridExample.example')}</div>
          <section className="grid">
            <div className="w-3"><div className={styles.gridItem}>{t('code.w3')}</div></div>
            <div className="w-3"><div className={styles.gridItem}>{t('code.w3')}</div></div>
            <div className="w-3"><div className={styles.gridItem}>{t('code.w3')}</div></div>
            <div className="w-3"><div className={styles.gridItem}>{t('code.w3')}</div></div>
          </section>
        </div>
      </section>

      <section>
        <h2>{t('typography.title')}</h2>
        <p>{t('typography.description')}</p>

        <CodeBlock
          title={t('code.example')}
          language="scss"
          code={`// display1
PC: 60px → Mobile: 36px

// display4
PC: 42px → Mobile: 24px

// h1
PC: 54px → Mobile: 24px

// p3
PC: 16px → Mobile: 14px`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('typography.example')}</div>
          <h2>{t('typography.h1Example')}</h2>
          <p className="p3">{t('typography.p3Example')}</p>
        </div>
      </section>

      <section>
        <h2>{t('minWidth.title')}</h2>
        <p>{t('minWidth.description')}</p>

        <CodeBlock
          title="device.scss"
          language="scss"
          code={`$min-mo: 375px;  // ` + t('code.minMobileWidth')}
        />
      </section>

      <section>
        <h2>{t('practicalExample.title')}</h2>
        <p>{t('practicalExample.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.header {
  padding: s(6);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include tb {
    padding: s(5);
  }

  @include mo {
    padding: s(4);
    flex-direction: column;
    gap: s(3);
  }
}

.nav {
  display: flex;
  gap: s(5);

  @include mo {
    flex-direction: column;
    gap: s(3);
    width: 100%;
  }
}

.card {
  padding: s(6);
  border-radius: r(4);

  @include tb {
    padding: s(5);
  }

  @include mo {
    padding: s(4);
    border-radius: r(3);
  }
}

.sidebar {
  width: 300px;

  @include tb {
    width: 250px;
  }

  @include mo {
    width: 100%;
  }
}`}
        />
      </section>

      <section>
        <div className={styles.note}>
          <i className="icon-info"></i>
          <div>
            <strong>{t('tip.title')}</strong> {t('tip.description')}
          </div>
        </div>
      </section>

      <section>
        <h2>{t('currentDevice.title')}</h2>
        <div className={styles.deviceIndicator}>
          <div className={styles.deviceInfo + ' hide-tb hide-mo'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>{t('currentDevice.pc')}</strong>
              <p>{t('currentDevice.pcRange')}</p>
            </div>
          </div>
          <div className={styles.deviceInfo + ' hide-pc hide-mo'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>{t('currentDevice.tablet')}</strong>
              <p>{t('currentDevice.tabletRange')}</p>
            </div>
          </div>
          <div className={styles.deviceInfo + ' hide-pc hide-tb'}>
            <div className={styles.deviceIcon}>
              <i className="icon-menu"></i>
            </div>
            <div>
              <strong>{t('currentDevice.mobile')}</strong>
              <p>{t('currentDevice.mobileRange')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

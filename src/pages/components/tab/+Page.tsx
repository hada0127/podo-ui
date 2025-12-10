import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function TabPage() {
  const { t } = useTranslation('tab');
  const [activeKey, setActiveKey] = useState('overview');

  const tabItems = [
    { key: 'overview', label: t('tabs.overview') },
    { key: 'features', label: t('tabs.features') },
    { key: 'pricing', label: t('tabs.pricing') },
  ];

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
            content: (
              <ReactContent
                t={t}
                activeKey={activeKey}
                setActiveKey={setActiveKey}
                tabItems={tabItems}
              />
            ),
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
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/scss/molecule/tab';`}
        />
      </section>

      <section>
        <h2>{t('sections.basicUsage.title')}</h2>
        <p>
          <code>ul.tabs</code> {t('sections.basicUsage.description')}
        </p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<ul class="tabs">
  <li class="on">
    <a href="#tab1">${t('tabs.tab1')}</a>
  </li>
  <li>
    <a href="#tab2">${t('tabs.tab2')}</a>
  </li>
  <li>
    <a href="#tab3">${t('tabs.tab3')}</a>
  </li>
</ul>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.basicUsage.demoTitle')}</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">{t('tabs.tab1')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.tab2')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.tab3')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>{t('sections.fillStyle.title')}</h2>
        <p>
          <code>.fill</code> {t('sections.fillStyle.description')}
        </p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<ul class="tabs fill">
  <li class="on">
    <a href="#tab1">${t('tabs.home')}</a>
  </li>
  <li>
    <a href="#tab2">${t('tabs.profile')}</a>
  </li>
  <li>
    <a href="#tab3">${t('tabs.settings')}</a>
  </li>
</ul>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.fillStyle.demoTitle')}</div>
          <ul className="tabs fill">
            <li className="on">
              <a href="#tab1">{t('tabs.home')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.profile')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.settings')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>{t('sections.manyTabs.title')}</h2>
        <p>{t('sections.manyTabs.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sections.manyTabs.demoTitle')}</div>
          <ul className="tabs">
            <li className="on">
              <a href="#tab1">{t('tabs.all')}</a>
            </li>
            <li>
              <a href="#tab2">{t('tabs.notice')}</a>
            </li>
            <li>
              <a href="#tab3">{t('tabs.event')}</a>
            </li>
            <li>
              <a href="#tab4">{t('tabs.promotion')}</a>
            </li>
            <li>
              <a href="#tab5">{t('tabs.faq')}</a>
            </li>
            <li>
              <a href="#tab6">{t('tabs.customerService')}</a>
            </li>
            <li>
              <a href="#tab7">{t('tabs.inquiry')}</a>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2>{t('sections.scssUsage.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

ul.tabs {
  padding: 0;
  display: flex;
  justify-content: flex-start;
  border-bottom: 1px inset color(border);

  // ${t('sections.scssUsage.fillStyleComment')}
  &.fill > li {
    flex: 1;
  }

  > li {
    text-align: center;
    padding: 0;

    > a {
      @include p3;
      display: block;
      padding: s(2) s(5);
      color: color(text-sub);

      &:hover {
        color: inherit;
      }

      &:focus-visible:not(:disabled) {
        outline: 4px solid color(primary-outline);
      }
    }

    // ${t('sections.scssUsage.activeTabComment')}
    &.on > a {
      @include p3-semibold;
      color: color(primary) !important;
      border-bottom: 1px inset color(primary);
      margin-bottom: -1px;
    }
  }
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  activeKey: string;
  setActiveKey: (key: string) => void;
  tabItems: { key: string; label: string }[];
}

function ReactContent({ t, activeKey, setActiveKey, tabItems }: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="tsx"
          code={`import { Tab } from 'podo-ui';`}
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
              <td><code>items</code></td>
              <td><code>TabItem[]</code></td>
              <td>required</td>
              <td>탭 아이템 배열 (key, label 필수)</td>
            </tr>
            <tr>
              <td><code>activeKey</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>활성 탭 키 (controlled)</td>
            </tr>
            <tr>
              <td><code>defaultActiveKey</code></td>
              <td><code>string</code></td>
              <td>첫 번째 탭</td>
              <td>기본 활성 탭 키 (uncontrolled)</td>
            </tr>
            <tr>
              <td><code>fill</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>탭 너비 균등 분배</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(key: string) =&gt; void</code></td>
              <td>-</td>
              <td>탭 변경 콜백</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>기본 사용법</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`const [activeKey, setActiveKey] = useState('overview');

const tabItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'features', label: 'Features' },
  { key: 'pricing', label: 'Pricing' },
];

<Tab
  items={tabItems}
  activeKey={activeKey}
  onChange={setActiveKey}
/>

<Tab.Panel tabKey="overview" activeKey={activeKey}>
  Overview content here
</Tab.Panel>
<Tab.Panel tabKey="features" activeKey={activeKey}>
  Features content here
</Tab.Panel>
<Tab.Panel tabKey="pricing" activeKey={activeKey}>
  Pricing content here
</Tab.Panel>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Tab Demo</div>
          <Tab items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
          <div className={styles.tabContent}>
            <Tab.Panel tabKey="overview" activeKey={activeKey}>
              <div className={styles.tabPanel}>
                <h2>{t('content.overviewTitle')}</h2>
                <p>{t('content.overviewContent')}</p>
              </div>
            </Tab.Panel>
            <Tab.Panel tabKey="features" activeKey={activeKey}>
              <div className={styles.tabPanel}>
                <h2>{t('content.featuresTitle')}</h2>
                <p>{t('content.featuresContent')}</p>
              </div>
            </Tab.Panel>
            <Tab.Panel tabKey="pricing" activeKey={activeKey}>
              <div className={styles.tabPanel}>
                <h2>{t('content.pricingTitle')}</h2>
                <p>{t('content.pricingContent')}</p>
              </div>
            </Tab.Panel>
          </div>
        </div>
      </section>

      <section>
        <h2>Fill 모드</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Tab
  items={[
    { key: 'left', label: 'Left' },
    { key: 'right', label: 'Right' },
  ]}
  fill
  defaultActiveKey="left"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Fill Mode Demo</div>
          <Tab
            items={[
              { key: 'left', label: 'Left' },
              { key: 'right', label: 'Right' },
            ]}
            fill
            defaultActiveKey="left"
          />
        </div>
      </section>

      <section>
        <h2>Disabled 탭</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Tab
  items={[
    { key: 'active', label: 'Active' },
    { key: 'disabled', label: 'Disabled', disabled: true },
    { key: 'another', label: 'Another' },
  ]}
  defaultActiveKey="active"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Disabled Tab Demo</div>
          <Tab
            items={[
              { key: 'active', label: 'Active' },
              { key: 'disabled', label: 'Disabled', disabled: true },
              { key: 'another', label: 'Another' },
            ]}
            defaultActiveKey="active"
          />
        </div>
      </section>
    </>
  );
}

import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import Tooltip from '../../../../react/atom/tooltip';
import styles from './Page.module.scss';

export default function TooltipPage() {
  const { t } = useTranslation('tooltip');

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
        ]}
        defaultTab="react"
      />
    </>
  );
}

function SvelteContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="typescript"
          code={`import { Tooltip } from 'podo-ui/svelte';`}
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
              <td><code>content</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.content')}</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td><code>'default' | 'info'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.variant')}</td>
            </tr>
            <tr>
              <td><code>position</code></td>
              <td><code>'top' | 'bottom' | 'left' | 'right' | ...</code></td>
              <td><code>'top'</code></td>
              <td>{t('props.position')}</td>
            </tr>
            <tr>
              <td><code>offset</code></td>
              <td><code>number</code></td>
              <td><code>8</code></td>
              <td>{t('props.offset')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('overview.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Tooltip } from 'podo-ui/svelte';
</script>

<Tooltip content="Additional information" variant="default">
  <button>Hover me</button>
</Tooltip>

<Tooltip content="Important notice" variant="info">
  <i class="icon-info"></i>
</Tooltip>`}
        />
      </section>

      <section>
        <h2>{t('positions.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Tooltip content="Top" position="top">
  <button>Top</button>
</Tooltip>

<Tooltip content="Bottom" position="bottom">
  <button>Bottom</button>
</Tooltip>

<Tooltip content="Left" position="left">
  <button>Left</button>
</Tooltip>

<Tooltip content="Right" position="right">
  <button>Right</button>
</Tooltip>`}
        />
      </section>

      <section>
        <h2>{t('controlled.title')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Tooltip } from 'podo-ui/svelte';

  let show = $state(false);
</script>

<!-- Always visible -->
<Tooltip content="Always visible" isVisible={true}>
  <button>Always Visible</button>
</Tooltip>

<!-- Controlled with state -->
<Tooltip content="Controlled" isVisible={show}>
  <button onclick={() => show = !show}>Toggle</button>
</Tooltip>`}
        />
      </section>
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Tooltip } from 'podo-ui';`} />
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
              <td><code>children</code></td>
              <td><code>React.ReactNode</code></td>
              <td>-</td>
              <td>{t('props.children')}</td>
            </tr>
            <tr>
              <td><code>content</code></td>
              <td><code>React.ReactNode</code></td>
              <td>-</td>
              <td>{t('props.content')}</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td><code>'default' | 'info'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.variant')}</td>
            </tr>
            <tr>
              <td><code>position</code></td>
              <td><code>'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom'</code></td>
              <td><code>'top'</code></td>
              <td>{t('props.position')}</td>
            </tr>
            <tr>
              <td><code>offset</code></td>
              <td><code>number</code></td>
              <td><code>8</code></td>
              <td>{t('props.offset')}</td>
            </tr>
            <tr>
              <td><code>isVisible</code></td>
              <td><code>boolean</code></td>
              <td><code>undefined</code></td>
              <td>{t('props.isVisible')}</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td><code>''</code></td>
              <td>{t('props.className')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <CodeBlock
          title="basic.tsx"
          language="tsx"
          code={`import { Tooltip } from 'podo-ui';

// Wrap a button
<Tooltip content="Additional information" variant="default">
  <button>Hover me</button>
</Tooltip>

// Wrap an icon
<Tooltip content="Important notice" variant="info">
  <i className="icon-info" />
</Tooltip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('overview.basicExample')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.additionalInfo')} variant="default" position="top">
              <button className={styles.demoButton}>Hover me</button>
            </Tooltip>
            <Tooltip content={t('demo.importantNotice')} variant="info" position="top">
              <i className="icon-info" style={{ fontSize: '24px', cursor: 'pointer' }}></i>
            </Tooltip>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('variants.title')}</h2>
        <p>{t('variants.description')}</p>

        <CodeBlock
          title="variants.tsx"
          language="tsx"
          code={`// Default variant (dark gray background)
<Tooltip content="Default tooltip" variant="default">
  <button>Default</button>
</Tooltip>

// Info variant (blue background)
<Tooltip content="Info tooltip" variant="info">
  <button>Info</button>
</Tooltip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('variants.default')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.defaultTooltip')} variant="default" position="top">
              <button className={styles.demoButton}>Default</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('variants.info')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.infoTooltip')} variant="info" position="top">
              <button className={styles.demoButton}>Info</button>
            </Tooltip>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('positions.title')}</h2>
        <p>{t('positions.description')}</p>

        <CodeBlock
          title="positions.tsx"
          language="tsx"
          code={`// Top positions
<Tooltip content="Tooltip" position="topLeft"><button>Top Left</button></Tooltip>
<Tooltip content="Tooltip" position="top"><button>Top</button></Tooltip>
<Tooltip content="Tooltip" position="topRight"><button>Top Right</button></Tooltip>

// Bottom positions
<Tooltip content="Tooltip" position="bottomLeft"><button>Bottom Left</button></Tooltip>
<Tooltip content="Tooltip" position="bottom"><button>Bottom</button></Tooltip>
<Tooltip content="Tooltip" position="bottomRight"><button>Bottom Right</button></Tooltip>

// Left positions
<Tooltip content="Tooltip" position="leftTop"><button>Left Top</button></Tooltip>
<Tooltip content="Tooltip" position="left"><button>Left</button></Tooltip>
<Tooltip content="Tooltip" position="leftBottom"><button>Left Bottom</button></Tooltip>

// Right positions
<Tooltip content="Tooltip" position="rightTop"><button>Right Top</button></Tooltip>
<Tooltip content="Tooltip" position="right"><button>Right</button></Tooltip>
<Tooltip content="Tooltip" position="rightBottom"><button>Right Bottom</button></Tooltip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.top')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.topLeft')} variant="default" position="topLeft">
              <button className={styles.demoButton}>Top Left</button>
            </Tooltip>
            <Tooltip content={t('demo.topCenter')} variant="default" position="top">
              <button className={styles.demoButton}>Top</button>
            </Tooltip>
            <Tooltip content={t('demo.topRight')} variant="default" position="topRight">
              <button className={styles.demoButton}>Top Right</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.bottom')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.bottomLeft')} variant="default" position="bottomLeft">
              <button className={styles.demoButton}>Bottom Left</button>
            </Tooltip>
            <Tooltip content={t('demo.bottomCenter')} variant="default" position="bottom">
              <button className={styles.demoButton}>Bottom</button>
            </Tooltip>
            <Tooltip content={t('demo.bottomRight')} variant="default" position="bottomRight">
              <button className={styles.demoButton}>Bottom Right</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.left')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.leftTop')} variant="default" position="leftTop">
              <button className={styles.demoButton}>Left Top</button>
            </Tooltip>
            <Tooltip content={t('demo.leftCenter')} variant="default" position="left">
              <button className={styles.demoButton}>Left</button>
            </Tooltip>
            <Tooltip content={t('demo.leftBottom')} variant="default" position="leftBottom">
              <button className={styles.demoButton}>Left Bottom</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.right')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.rightTop')} variant="default" position="rightTop">
              <button className={styles.demoButton}>Right Top</button>
            </Tooltip>
            <Tooltip content={t('demo.rightCenter')} variant="default" position="right">
              <button className={styles.demoButton}>Right</button>
            </Tooltip>
            <Tooltip content={t('demo.rightBottom')} variant="default" position="rightBottom">
              <button className={styles.demoButton}>Right Bottom</button>
            </Tooltip>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('customContent.title')}</h2>
        <p>{t('customContent.description')}</p>

        <CodeBlock
          title="custom-content.tsx"
          language="tsx"
          code={`// With custom JSX structure
<Tooltip content={
  <>
    <strong>Help</strong>
    <br />
    Detailed description
  </>
}>
  <button>Custom JSX</button>
</Tooltip>

// With custom inline styles
<Tooltip content={
  <div style={{ color: '#ffd700' }}>
    <strong>⚠️ Important</strong>
    <br />
    Caution
  </div>
} variant="info">
  <button>Custom Style</button>
</Tooltip>

// With custom offset (default: 8px)
<Tooltip content="Tooltip far away" offset={20}>
  <button>Offset 20px</button>
</Tooltip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('customContent.example')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip
              content={
                <>
                  <strong>{t('demo.help')}</strong>
                  <br />
                  {t('demo.detailedDescription')}
                </>
              }
              variant="default"
              position="top"
            >
              <button className={styles.demoButton}>Custom JSX</button>
            </Tooltip>
            <Tooltip
              content={
                <div style={{ color: '#ffd700' }}>
                  <strong>⚠️ {t('demo.important')}</strong>
                  <br />
                  {t('demo.cannotBeUndone')}
                </div>
              }
              variant="info"
              position="top"
            >
              <button className={styles.demoButton}>Custom Style</button>
            </Tooltip>
            <Tooltip content={t('demo.tooltipFarAway')} variant="default" position="top" offset={20}>
              <button className={styles.demoButton}>Offset 20px</button>
            </Tooltip>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('controlled.title')}</h2>
        <p>{t('controlled.description')}</p>

        <CodeBlock
          title="controlled.tsx"
          language="tsx"
          code={`// Always visible (without hover)
<Tooltip content="Always visible" isVisible={true}>
  <button>Always Visible</button>
</Tooltip>

// Disabled (hover doesn't work)
<Tooltip content="Hover disabled" isVisible={false}>
  <button>Disabled</button>
</Tooltip>

// Controlled with state
const [show, setShow] = useState(false);

<Tooltip content="Controlled by state" isVisible={show}>
  <button onClick={() => setShow(!show)}>
    Toggle
  </button>
</Tooltip>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('controlled.example')}</div>
          <div className={styles.tooltipRow}>
            <Tooltip content={t('demo.alwaysVisible')} variant="default" position="top" isVisible={true}>
              <button className={styles.demoButton}>Always Visible</button>
            </Tooltip>
            <Tooltip content={t('demo.hoverDisabled')} variant="info" position="top" isVisible={false}>
              <button className={styles.demoButton}>Disabled Hover</button>
            </Tooltip>
          </div>
        </div>
      </section>
    </>
  );
}

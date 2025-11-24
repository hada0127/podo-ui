'use client';

import { useTranslations } from 'next-intl';
import Tooltip from '../../../../react/atom/tooltip';
import styles from '../input/page.module.scss';

export default function TooltipPage() {
  const t = useTranslations('tooltip');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('overview.basicExample')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="추가 정보입니다" variant="default" position="top">
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>
            </Tooltip>
            <Tooltip content="중요한 안내사항" variant="info" position="top">
              <i className="icon-info" style={{ fontSize: '24px', cursor: 'pointer' }}></i>
            </Tooltip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>basic.tsx</div>
          <pre><code>{`import { Tooltip } from 'podo-ui';

// Wrap a button
<Tooltip content="추가 정보입니다" variant="default">
  <button>Hover me</button>
</Tooltip>

// Wrap an icon
<Tooltip content="중요한 안내사항" variant="info">
  <i className="icon-info" />
</Tooltip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('variants.title')}</h2>
        <p>{t('variants.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('variants.default')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Tooltip content="기본 툴팁입니다" variant="default" position="top">
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Default</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('variants.info')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Tooltip content="정보 툴팁입니다" variant="info" position="top">
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Info</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>variants.tsx</div>
          <pre><code>{`// Default variant (dark gray background)
<Tooltip content="기본 툴팁" variant="default">
  <button>Default</button>
</Tooltip>

// Info variant (blue background)
<Tooltip content="정보 툴팁" variant="info">
  <button>Info</button>
</Tooltip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('positions.title')}</h2>
        <p>{t('positions.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.top')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="왼쪽 상단" variant="default" position="topLeft">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Top Left</button>
            </Tooltip>
            <Tooltip content="중앙 상단" variant="default" position="top">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Top</button>
            </Tooltip>
            <Tooltip content="오른쪽 상단" variant="default" position="topRight">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Top Right</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.bottom')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="왼쪽 하단" variant="default" position="bottomLeft">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Bottom Left</button>
            </Tooltip>
            <Tooltip content="중앙 하단" variant="default" position="bottom">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Bottom</button>
            </Tooltip>
            <Tooltip content="오른쪽 하단" variant="default" position="bottomRight">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Bottom Right</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.left')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="왼쪽 상단" variant="default" position="leftTop">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Left Top</button>
            </Tooltip>
            <Tooltip content="왼쪽 중앙" variant="default" position="left">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Left</button>
            </Tooltip>
            <Tooltip content="왼쪽 하단" variant="default" position="leftBottom">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Left Bottom</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('positions.right')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="오른쪽 상단" variant="default" position="rightTop">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Right Top</button>
            </Tooltip>
            <Tooltip content="오른쪽 중앙" variant="default" position="right">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Right</button>
            </Tooltip>
            <Tooltip content="오른쪽 하단" variant="default" position="rightBottom">
              <button style={{ padding: '8px', cursor: 'pointer' }}>Right Bottom</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>positions.tsx</div>
          <pre><code>{`// Top positions
<Tooltip content="툴팁" position="topLeft"><button>Top Left</button></Tooltip>
<Tooltip content="툴팁" position="top"><button>Top</button></Tooltip>
<Tooltip content="툴팁" position="topRight"><button>Top Right</button></Tooltip>

// Bottom positions
<Tooltip content="툴팁" position="bottomLeft"><button>Bottom Left</button></Tooltip>
<Tooltip content="툴팁" position="bottom"><button>Bottom</button></Tooltip>
<Tooltip content="툴팁" position="bottomRight"><button>Bottom Right</button></Tooltip>

// Left positions
<Tooltip content="툴팁" position="leftTop"><button>Left Top</button></Tooltip>
<Tooltip content="툴팁" position="left"><button>Left</button></Tooltip>
<Tooltip content="툴팁" position="leftBottom"><button>Left Bottom</button></Tooltip>

// Right positions
<Tooltip content="툴팁" position="rightTop"><button>Right Top</button></Tooltip>
<Tooltip content="툴팁" position="right"><button>Right</button></Tooltip>
<Tooltip content="툴팁" position="rightBottom"><button>Right Bottom</button></Tooltip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('customContent.title')}</h2>
        <p>{t('customContent.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('customContent.example')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip
              content={
                <>
                  <strong>도움말</strong>
                  <br />
                  이 버튼을 클릭하면 작업이 실행됩니다
                </>
              }
              variant="default"
              position="top"
            >
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Custom JSX</button>
            </Tooltip>
            <Tooltip
              content={
                <div style={{ color: '#ffd700' }}>
                  <strong>⚠️ 중요</strong>
                  <br />
                  이 기능은 되돌릴 수 없습니다
                </div>
              }
              variant="info"
              position="top"
            >
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Custom Style</button>
            </Tooltip>
            <Tooltip content="더 멀리 떨어진 툴팁" variant="default" position="top" offset={20}>
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Offset 20px</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>custom-content.tsx</div>
          <pre><code>{`// With custom JSX structure
<Tooltip content={
  <>
    <strong>도움말</strong>
    <br />
    상세 설명입니다
  </>
}>
  <button>Custom JSX</button>
</Tooltip>

// With custom inline styles
<Tooltip content={
  <div style={{ color: '#ffd700' }}>
    <strong>⚠️ 중요</strong>
    <br />
    주의사항
  </div>
} variant="info">
  <button>Custom Style</button>
</Tooltip>

// With custom offset (default: 8px)
<Tooltip content="더 멀리 떨어진 툴팁" offset={20}>
  <button>Offset 20px</button>
</Tooltip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('controlled.title')}</h2>
        <p>{t('controlled.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('controlled.example')}</div>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Tooltip content="항상 표시되는 툴팁" variant="default" position="top" isVisible={true}>
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Always Visible</button>
            </Tooltip>
            <Tooltip content="호버 불가능" variant="info" position="top" isVisible={false}>
              <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Disabled Hover</button>
            </Tooltip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>controlled.tsx</div>
          <pre><code>{`// Always visible (without hover)
<Tooltip content="항상 표시" isVisible={true}>
  <button>Always Visible</button>
</Tooltip>

// Disabled (hover doesn't work)
<Tooltip content="호버 불가능" isVisible={false}>
  <button>Disabled</button>
</Tooltip>

// Controlled with state
const [show, setShow] = useState(false);

<Tooltip content="상태로 제어" isVisible={show}>
  <button onClick={() => setShow(!show)}>
    Toggle
  </button>
</Tooltip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('props.title')}</h2>
        <table className={styles.table}>
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
    </>
  );
}

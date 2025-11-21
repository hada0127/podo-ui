'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../input/page.module.scss';
import Chip from '../../../../react/atom/chip';

export default function ChipPage() {
  const t = useTranslations('chip');
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'Next.js' },
  ]);

  const handleDelete = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>basic.html</div>
          <pre><code>{`<!-- Default theme (클래스 생략 가능) -->
<div class="chip">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- 다른 컬러 테마 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('type.title')}</h2>
        <p>{t('type.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.default')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.fill')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip fill">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip fill blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip fill green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip fill orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip fill red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('type.border')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip border">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip border blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip border green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip border orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip border red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>type.html</div>
          <pre><code>{`<!-- Default type (진한 배경 - 클래스 생략) -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- Fill type (옅은 배경) -->
<div class="chip fill blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- Border type (테두리만) -->
<div class="chip border blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('size.title')}</h2>
        <p>{t('size.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('size.comparison')}</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="chip sm blue">
              <i className="icon icon-ellipse" />
              {t('size.small')}
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('size.medium')}
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>size.html</div>
          <pre><code>{`<div class="chip sm blue">
  <i class="icon icon-ellipse"></i>
  ${t('size.small')}
</div>

<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('size.medium')}
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('icon.title')}</h2>
        <p>{t('icon.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('icon.withoutIcon')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">{t('labels.label')}</div>
            <div className="chip green">{t('labels.label')}</div>
            <div className="chip orange">{t('labels.label')}</div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('icon.defaultIcon')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('icon.customIcon')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-user" />
              {t('labels.user')}
            </div>
            <div className="chip green">
              <i className="icon icon-check" />
              {t('labels.success')}
            </div>
            <div className="chip orange">
              <i className="icon icon-warning" />
              {t('labels.warning')}
            </div>
            <div className="chip red">
              <i className="icon icon-close" />
              {t('labels.error')}
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>icon.html</div>
          <pre><code>{`<!-- 아이콘 없이 -->
<div class="chip blue">${t('labels.label')}</div>

<!-- ellipse 아이콘 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- 커스텀 아이콘 -->
<div class="chip blue">
  <i class="icon icon-user"></i>
  ${t('labels.user')}
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('round.title')}</h2>
        <p>{t('round.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('round.default')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('round.rounded')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip round blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip round green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
            <div className="chip round orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>round.html</div>
          <pre><code>{`<!-- 기본 (약간 각진 모서리) -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>

<!-- Round (완전히 둥근 모서리) -->
<div class="chip round blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('delete.title')}</h2>
        <p>{t('delete.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('delete.withButton')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
            <div className="chip round orange">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
            <div className="chip round red">
              <i className="icon icon-ellipse" />
              {t('labels.label')}
              <button aria-label={t('delete.ariaLabel')} />
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>delete.html</div>
          <pre><code>{`<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  ${t('labels.label')}
  <button aria-label="${t('delete.ariaLabel')}"></button>
</div>

<script>
  // JavaScript로 삭제 기능 구현
  document.querySelectorAll('.chip button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.target.closest('.chip').remove();
    });
  });
</script>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('react.title')}</h2>
        <p>{t('react.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.basicUsage')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip theme="blue" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
            <Chip theme="green" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
            <Chip theme="orange" icon="icon-ellipse">
              {t('labels.label')}
            </Chip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>basic.tsx</div>
          <pre><code>{`import { Chip } from 'podo-ui';

function App() {
  return (
    <>
      <Chip theme="blue" icon="icon-ellipse">
        ${t('labels.label')}
      </Chip>
      <Chip theme="green" icon="icon-ellipse">
        ${t('labels.label')}
      </Chip>
      <Chip theme="orange" icon="icon-ellipse">
        ${t('labels.label')}
      </Chip>
    </>
  );
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.withDelete')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                theme="blue"
                round
                icon="icon-ellipse"
                onDelete={() => handleDelete(tag.id)}
              >
                {tag.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>with-delete.tsx</div>
          <pre><code>{`import { useState } from 'react';
import { Chip } from 'podo-ui';

function TagList() {
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'Next.js' },
  ]);

  const handleDelete = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  return (
    <>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          theme="blue"
          round
          icon="icon-ellipse"
          onDelete={() => handleDelete(tag.id)}
        >
          {tag.label}
        </Chip>
      ))}
    </>
  );
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.variants')}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip size="sm" theme="blue" icon="icon-user">
              {t('labels.small')}
            </Chip>
            <Chip theme="green" type="fill" icon="icon-check">
              {t('labels.fillType')}
            </Chip>
            <Chip theme="orange" type="border" round>
              {t('labels.borderRound')}
            </Chip>
            <Chip theme="red" icon="icon-warning" onDelete={() => alert(t('delete.ariaLabel'))}>
              {t('labels.withDelete')}
            </Chip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>variants.tsx</div>
          <pre><code>{`<Chip size="sm" theme="blue" icon="icon-user">
  ${t('labels.small')}
</Chip>

<Chip theme="green" type="fill" icon="icon-check">
  ${t('labels.fillType')}
</Chip>

<Chip theme="orange" type="border" round>
  ${t('labels.borderRound')}
</Chip>

<Chip theme="red" icon="icon-warning" onDelete={() => alert('${t('delete.ariaLabel')}')}>
  ${t('labels.withDelete')}
</Chip>`}</code></pre>
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
              <td><code>theme</code></td>
              <td><code>'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'red'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.theme')}</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>'default' | 'fill' | 'border'</code></td>
              <td><code>'default'</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>'sm' | 'md'</code></td>
              <td><code>'md'</code></td>
              <td>{t('props.size')}</td>
            </tr>
            <tr>
              <td><code>round</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.round')}</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.icon')}</td>
            </tr>
            <tr>
              <td><code>onDelete</code></td>
              <td><code>() =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onDelete')}</td>
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

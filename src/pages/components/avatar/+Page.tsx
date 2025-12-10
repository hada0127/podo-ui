import { useTranslation } from 'react-i18next';
import Avatar from '../../../../react/atom/avatar';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function AvatarPage() {
  const { t } = useTranslation('avatar');

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
        ]}
        defaultTab="react"
      />
    </>
  );
}

function ReactContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Avatar } from 'podo-ui';`} />
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
              <td><code>type</code></td>
              <td><code>'image' | 'icon' | 'text'</code></td>
              <td><code>'icon'</code></td>
              <td>{t('props.type')}</td>
            </tr>
            <tr>
              <td><code>src</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.src')}</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td><code>'icon-user'</code></td>
              <td>{t('props.icon')}</td>
            </tr>
            <tr>
              <td><code>text</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('props.text')}</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56</code></td>
              <td><code>56</code></td>
              <td>{t('props.size')}</td>
            </tr>
            <tr>
              <td><code>activityRing</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>{t('props.activityRing')}</td>
            </tr>
            <tr>
              <td><code>alt</code></td>
              <td><code>string</code></td>
              <td><code>'Avatar'</code></td>
              <td>{t('props.alt')}</td>
            </tr>
            <tr>
              <td><code>onClick</code></td>
              <td><code>() =&gt; void</code></td>
              <td>-</td>
              <td>{t('props.onClick')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('overview.title')}</h2>
        <p>{t('overview.description')}</p>

        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Avatar } from 'podo-ui';

// Image avatar
<Avatar type="image" src="/profile.jpg" size={56} />

// Icon avatar (default)
<Avatar type="icon" icon="icon-user" size={56} />

// Text avatar
<Avatar type="text" text="AB" size={56} />

// With activity ring
<Avatar type="image" src="/profile.jpg" size={56} activityRing />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('overview.basicExample')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="image" src="/cat.jpg" size={56} />
            <Avatar type="icon" icon="icon-user" size={56} />
            <Avatar type="text" text="AB" size={56} />
            <Avatar type="image" src="/cat.jpg" size={56} activityRing />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.image')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="image" src="/cat.jpg" size={40} />
            <Avatar type="image" src="/cat.jpg" size={48} />
            <Avatar type="image" src="/cat.jpg" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.icon')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="icon" icon="icon-user" size={24} />
            <Avatar type="icon" icon="icon-user" size={32} />
            <Avatar type="icon" icon="icon-user" size={40} />
            <Avatar type="icon" icon="icon-user" size={48} />
            <Avatar type="icon" icon="icon-user" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.text')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="text" text="AB" size={24} />
            <Avatar type="text" text="CD" size={32} />
            <Avatar type="text" text="EF" size={40} />
            <Avatar type="text" text="김철" size={48} />
            <Avatar type="text" text="보라" size={56} />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sizes.allSizes')}</div>
          <div className={styles.avatarRow}>
            {[16, 20, 24, 28, 32, 36, 40, 48, 56].map((size) => (
              <div key={size} className={styles.avatarItem}>
                <Avatar type="image" src="/cat.jpg" size={size as 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56} />
                <span>{size}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>{t('activityRing.title')}</h2>
        <p>{t('activityRing.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('activityRing.default')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="image" src="/cat.jpg" size={40} />
            <Avatar type="image" src="/cat.jpg" size={48} />
            <Avatar type="image" src="/cat.jpg" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('activityRing.active')}</div>
          <div className={styles.avatarRow}>
            <Avatar type="image" src="/cat.jpg" size={40} activityRing />
            <Avatar type="image" src="/cat.jpg" size={48} activityRing />
            <Avatar type="image" src="/cat.jpg" size={56} activityRing />
          </div>
        </div>
      </section>
    </>
  );
}

import { useTranslation } from 'react-i18next';
import CodeBlock from '../../../components/CodeBlock';
import Avatar from '../../../../react/atom/avatar';
import styles from '../input/Page.module.scss';

export default function AvatarPage() {
  const { t } = useTranslation('avatar');

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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Avatar type="image" src="/cat.jpg" size={56} />
            <Avatar type="icon" icon="icon-user" size={56} />
            <Avatar type="text" text="AB" size={56} />
            <Avatar type="image" src="/cat.jpg" size={56} activityRing />
          </div>
        </div>

        <CodeBlock
          title="basic.tsx"
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
      </section>

      <section className={styles.section}>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.image')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar type="image" src="/cat.jpg" size={40} />
            <Avatar type="image" src="/cat.jpg" size={48} />
            <Avatar type="image" src="/cat.jpg" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.icon')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar type="icon" icon="icon-user" size={24} />
            <Avatar type="icon" icon="icon-user" size={32} />
            <Avatar type="icon" icon="icon-user" size={40} />
            <Avatar type="icon" icon="icon-user" size={48} />
            <Avatar type="icon" icon="icon-user" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('types.text')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar type="text" text="AB" size={24} />
            <Avatar type="text" text="CD" size={32} />
            <Avatar type="text" text="EF" size={40} />
            <Avatar type="text" text="김철" size={48} />
            <Avatar type="text" text="보라" size={56} />
          </div>
        </div>

        <CodeBlock
          title="types.tsx"
          language="tsx"
          code={`// Image type - displays user photo
<Avatar type="image" src="/profile.jpg" size={56} />

// Icon type - displays system icon with gray background
<Avatar type="icon" icon="icon-user" size={56} />

// Text type - displays initials with gray background
<Avatar type="text" text="AB" size={56} />`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('sizes.allSizes')}</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={16} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>16</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={20} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>20</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={24} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>24</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={28} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>28</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={32} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>32</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={36} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>36</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={40} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>40</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={48} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>48</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Avatar type="image" src="/cat.jpg" size={56} />
              <div style={{ fontSize: '12px', marginTop: '4px' }}>56</div>
            </div>
          </div>
        </div>

        <CodeBlock
          title="sizes.tsx"
          language="tsx"
          code={`// Available sizes: 16, 20, 24, 28, 32, 36, 40, 48, 56
<Avatar type="image" src="/profile.jpg" size={16} />
<Avatar type="image" src="/profile.jpg" size={32} />
<Avatar type="image" src="/profile.jpg" size={56} />`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('activityRing.title')}</h2>
        <p>{t('activityRing.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('activityRing.default')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar type="image" src="/cat.jpg" size={40} />
            <Avatar type="image" src="/cat.jpg" size={48} />
            <Avatar type="image" src="/cat.jpg" size={56} />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('activityRing.active')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Avatar type="image" src="/cat.jpg" size={40} activityRing />
            <Avatar type="image" src="/cat.jpg" size={48} activityRing />
            <Avatar type="image" src="/cat.jpg" size={56} activityRing />
          </div>
        </div>

        <CodeBlock
          title="activity-ring.tsx"
          language="tsx"
          code={`// Default state - no ring
<Avatar type="image" src="/profile.jpg" size={56} />

// Active state - blue ring
<Avatar type="image" src="/profile.jpg" size={56} activityRing />

// Works with all types
<Avatar type="icon" icon="icon-user" size={56} activityRing />
<Avatar type="text" text="AB" size={56} activityRing />`}
        />
      </section>

      <section className={styles.section}>
        <h2>{t('combinations.title')}</h2>
        <p>{t('combinations.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('combinations.examples')}</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Avatar type="image" src="/cat.jpg" size={32} />
            <Avatar type="icon" icon="icon-user" size={32} />
            <Avatar type="text" text="김" size={32} />
            <Avatar type="image" src="/cat.jpg" size={48} activityRing />
            <Avatar type="icon" icon="icon-user" size={48} activityRing />
            <Avatar type="text" text="AB" size={48} activityRing />
          </div>
        </div>

        <CodeBlock
          title="combinations.tsx"
          language="tsx"
          code={`// Small avatars for list items
<Avatar type="image" src="/user1.jpg" size={32} />
<Avatar type="icon" icon="icon-user" size={32} />
<Avatar type="text" text="김" size={32} />

// Medium avatars with activity ring
<Avatar type="image" src="/user2.jpg" size={48} activityRing />
<Avatar type="icon" icon="icon-user" size={48} activityRing />
<Avatar type="text" text="AB" size={48} activityRing />`}
        />
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
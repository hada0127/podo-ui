import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select as SelectComponent } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function Select() {
  const { t } = useTranslation('select');
  const [selected, setSelected] = useState('');
  const [city, setCity] = useState('seoul');

  const options = [
    { value: 'option1', label: t('basicUsage.options.option1') },
    { value: 'option2', label: t('basicUsage.options.option2') },
    { value: 'option3', label: t('basicUsage.options.option3') },
  ];

  const cityOptions = [
    { value: 'seoul', label: t('basicUsage.cities.seoul') },
    { value: 'busan', label: t('basicUsage.cities.busan') },
    { value: 'daegu', label: t('basicUsage.cities.daegu') },
    { value: 'incheon', label: t('basicUsage.cities.incheon') },
  ];

  const roleOptions = [
    { value: 'admin', label: t('icons.roles.admin') },
    { value: 'user', label: t('icons.roles.user') },
    { value: 'guest', label: t('icons.roles.guest') },
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
                selected={selected}
                setSelected={setSelected}
                city={city}
                setCity={setCity}
                options={options}
                cityOptions={cityOptions}
                roleOptions={roleOptions}
              />
            ),
          },
          {
            key: 'svelte',
            label: 'Svelte',
            content: <SvelteContent t={t} />,
          },
        ]}
        defaultTab="scss"
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
          code={`import { Select } from 'podo-ui/svelte';`}
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
              <td><code>value</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.value')}</td>
            </tr>
            <tr>
              <td><code>onchange</code></td>
              <td><code>(e: Event) =&gt; void</code></td>
              <td>-</td>
              <td>{t('react.props.onChange')}</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>{`{ value: string; label: string }[]`}</code></td>
              <td>required</td>
              <td>{t('react.props.options')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>withIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.withIcon')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.sections.basicUsage')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Select } from 'podo-ui/svelte';

  let selected = $state('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];
</script>

<Select
  bind:value={selected}
  {options}
  placeholder="Select an option"
/>`}
        />
      </section>

      <section>
        <h2>{t('react.sections.icons')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<Select
  options={roleOptions}
  withIcon="icon-user"
  placeholder="Select role"
/>`}
        />
      </section>
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/select';`} />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<select>
  <option value="" disabled selected>${t('basicUsage.options.placeholder')}</option>
  <option value="1">${t('basicUsage.options.option1')}</option>
  <option value="2">${t('basicUsage.options.option2')}</option>
  <option value="3">${t('basicUsage.options.option3')}</option>
</select>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.selectGroup}>
            <select defaultValue="">
              <option value="" disabled>{t('basicUsage.options.placeholder')}</option>
              <option value="1">{t('basicUsage.options.option1')}</option>
              <option value="2">{t('basicUsage.options.option2')}</option>
              <option value="3">{t('basicUsage.options.option3')}</option>
            </select>
            <select defaultValue="2">
              <option value="1">{t('basicUsage.cities.seoul')}</option>
              <option value="2">{t('basicUsage.cities.busan')}</option>
              <option value="3">{t('basicUsage.cities.daegu')}</option>
            </select>
            <select disabled>
              <option>{t('basicUsage.disabled')}</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('icons.title')}</h2>
        <p>{t('icons.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<div class="with-icon">
  <i class="icon-user"></i>
  <select>
    <option value="" disabled selected>${t('icons.userPlaceholder')}</option>
    <option value="admin">${t('icons.roles.admin')}</option>
    <option value="user">${t('icons.roles.user')}</option>
  </select>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.selectGroup}>
            <div className="with-icon">
              <i className="icon-user"></i>
              <select defaultValue="">
                <option value="" disabled>{t('icons.userPlaceholder')}</option>
                <option value="admin">{t('icons.roles.admin')}</option>
                <option value="user">{t('icons.roles.user')}</option>
              </select>
            </div>
            <div className="with-icon">
              <i className="icon-globe"></i>
              <select defaultValue="">
                <option value="" disabled>{t('icons.languagePlaceholder')}</option>
                <option value="ko">{t('icons.languages.ko')}</option>
                <option value="en">{t('icons.languages.en')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

select {
  padding: s(3) s(7) s(3) s(5);
  border: 1px solid color(border);
  border-radius: r(3);
  background: color(bg-block);
  appearance: none;
  cursor: pointer;

  &:focus-visible:not(:disabled) {
    outline: 4px solid color(primary-outline);
  }

  &:disabled {
    background-color: color(bg-disabled);
    cursor: not-allowed;
  }
}

.with-icon {
  position: relative;

  > i {
    position: absolute;
    left: s(3);
    top: 50%;
    transform: translateY(-50%);
  }

  > select {
    padding-left: s(8);
  }
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  selected: string;
  setSelected: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  options: { value: string; label: string }[];
  cityOptions: { value: string; label: string }[];
  roleOptions: { value: string; label: string }[];
}

function ReactContent({
  t,
  selected,
  setSelected,
  city,
  setCity,
  options,
  cityOptions,
  roleOptions,
}: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Select } from 'podo-ui';`} />
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
              <td><code>value</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.value')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(e: ChangeEvent) =&gt; void</code></td>
              <td>-</td>
              <td>{t('react.props.onChange')}</td>
            </tr>
            <tr>
              <td><code>options</code></td>
              <td><code>{`{ value: string; label: string }[]`}</code></td>
              <td>required</td>
              <td>{t('react.props.options')}</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.placeholder')}</td>
            </tr>
            <tr>
              <td><code>withIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.withIcon')}</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.disabled')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>{t('react.sections.basicUsage')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Select } from 'podo-ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

<Select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  options={options}
  placeholder="Select an option"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Select Demo</div>
          <div className={styles.selectGroup}>
            <SelectComponent
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={options}
              placeholder={t('basicUsage.options.placeholder')}
            />
            <SelectComponent
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={cityOptions}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.sections.icons')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Select
  options={roleOptions}
  withIcon="icon-user"
  placeholder="Select role"
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>With Icon</div>
          <div className={styles.selectGroup}>
            <SelectComponent
              options={roleOptions}
              withIcon="icon-user"
              placeholder={t('icons.userPlaceholder')}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.sections.disabled')}</h2>
        <div className={styles.demo}>
          <div className={styles.demoTitle}>Disabled</div>
          <div className={styles.selectGroup}>
            <SelectComponent
              options={options}
              placeholder={t('basicUsage.disabled')}
              disabled
            />
          </div>
        </div>
      </section>
    </>
  );
}

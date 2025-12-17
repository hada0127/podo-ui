import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Radio } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
import styles from './Page.module.scss';

export default function CheckboxRadio() {
  const { t } = useTranslation('checkboxRadio');
  const [checked, setChecked] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('option1');

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
                checked={checked}
                setChecked={setChecked}
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
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
          code={`import { Checkbox, Radio, RadioGroup } from 'podo-ui/svelte';`}
        />
      </section>

      <section>
        <h2>Checkbox Props</h2>
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
              <td><code>label</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.label')}</td>
            </tr>
            <tr>
              <td><code>checked</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.checked')}</td>
            </tr>
            <tr>
              <td><code>indeterminate</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.indeterminate')}</td>
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
        <h2>{t('react.sections.checkboxUsage')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Checkbox } from 'podo-ui/svelte';

  let checked = $state(false);
</script>

<Checkbox label="I agree" bind:checked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Indeterminate" indeterminate />`}
        />
      </section>

      <section>
        <h2>{t('react.sections.radioGroupUsage')}</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { RadioGroup } from 'podo-ui/svelte';

  let selected = $state('option1');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Disabled', disabled: true },
  ];
</script>

<RadioGroup
  name="myRadio"
  bind:value={selected}
  {options}
/>`}
        />
      </section>

      <section>
        <h2>Individual Radio</h2>
        <CodeBlock
          title="Svelte"
          language="svelte"
          code={`<script lang="ts">
  import { Radio } from 'podo-ui/svelte';

  let selected = $state('a');
</script>

<Radio name="group" value="a" label="Option A" bind:group={selected} />
<Radio name="group" value="b" label="Option B" bind:group={selected} />
<Radio name="group" value="c" label="Option C" bind:group={selected} />`}
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
        <CodeBlock language="scss" code={`@use 'podo-ui/scss/atom/checkbox';
@use 'podo-ui/scss/atom/radio';`} />
      </section>

      <section>
        <h2>{t('checkbox.title')}</h2>
        <p>{t('checkbox.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<label>
  <input type="checkbox" />
  ${t('checkbox.option')}
</label>

<label>
  <input type="checkbox" checked />
  ${t('checkbox.checked')}
</label>

<label>
  <input type="checkbox" disabled />
  ${t('checkbox.disabled')}
</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" />
              {t('checkbox.option')}
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              {t('checkbox.checked')}
            </label>
            <label>
              <input type="checkbox" disabled />
              {t('checkbox.disabled')}
            </label>
            <label>
              <input type="checkbox" defaultChecked disabled />
              {t('checkbox.checkedDisabled')}
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('indeterminate.title')}</h2>
        <p>{t('indeterminate.description')}</p>

        <CodeBlock
          title="JavaScript"
          language="javascript"
          code={`const checkbox = document.querySelector('#myCheckbox');
checkbox.indeterminate = true;`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                ref={(el) => {
                  if (el) el.indeterminate = true;
                }}
              />
              {t('indeterminate.state')}
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('radio.title')}</h2>
        <p>{t('radio.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<label>
  <input type="radio" name="option" value="1" checked />
  ${t('radio.option1')}
</label>

<label>
  <input type="radio" name="option" value="2" />
  ${t('radio.option2')}
</label>

<label>
  <input type="radio" name="option" value="3" disabled />
  ${t('radio.disabledOption')}
</label>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.radioGroup}>
            <label>
              <input type="radio" name="example1" value="1" defaultChecked />
              {t('radio.option1')}
            </label>
            <label>
              <input type="radio" name="example1" value="2" />
              {t('radio.option2')}
            </label>
            <label>
              <input type="radio" name="example1" value="3" />
              {t('radio.option3')}
            </label>
            <label>
              <input type="radio" name="example1" value="4" disabled />
              {t('radio.disabledOption')}
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('scss.title')}</h2>
        <CodeBlock
          title="SCSS"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.checkboxWrapper {
  display: flex;
  flex-direction: column;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    gap: s(2);
    cursor: pointer;

    &:hover {
      color: color(primary);
    }
  }
}

.radioWrapper {
  display: flex;
  flex-direction: column;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  checked: boolean;
  setChecked: (v: boolean) => void;
  selectedRadio: string;
  setSelectedRadio: (v: string) => void;
}

function ReactContent({
  t,
  checked,
  setChecked,
  selectedRadio,
  setSelectedRadio,
}: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock language="tsx" code={`import { Checkbox, Radio } from 'podo-ui';`} />
      </section>

      <section>
        <h2>Checkbox Props</h2>
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
              <td><code>label</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>{t('react.props.label')}</td>
            </tr>
            <tr>
              <td><code>checked</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.checked')}</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(e: ChangeEvent) =&gt; void</code></td>
              <td>-</td>
              <td>{t('react.props.onChange')}</td>
            </tr>
            <tr>
              <td><code>indeterminate</code></td>
              <td><code>boolean</code></td>
              <td>false</td>
              <td>{t('react.props.indeterminate')}</td>
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
        <h2>{t('react.sections.checkboxUsage')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Checkbox } from 'podo-ui';

<Checkbox
  label="I agree"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>

// Indeterminate
<Checkbox label="Select all" indeterminate={true} />

// Disabled
<Checkbox label="Disabled" disabled />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Checkbox Demo</div>
          <div className={styles.checkboxGroup}>
            <Checkbox
              label={t('react.labels.agree')}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <Checkbox label={t('react.labels.defaultCheckbox')} />
            <Checkbox label={t('react.labels.disabled')} disabled />
            <Checkbox label={t('react.labels.checkedDisabled')} checked disabled />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('react.sections.radioGroupUsage')}</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Radio } from 'podo-ui';

<Radio.Group
  name="payment"
  value={selectedRadio}
  onChange={(value) => setSelectedRadio(value)}
  options={[
    { value: 'card', label: 'Credit Card' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'mobile', label: 'Mobile Payment' },
  ]}
/>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Radio.Group Demo</div>
          <Radio.Group
            name="paymentDemo"
            value={selectedRadio}
            onChange={(value) => setSelectedRadio(value)}
            options={[
              { value: 'option1', label: t('react.labels.option1') },
              { value: 'option2', label: t('react.labels.option2') },
              { value: 'option3', label: t('react.labels.option3') },
              { value: 'option4', label: t('react.labels.disabled'), disabled: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}

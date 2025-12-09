import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select as SelectComponent } from 'podo-ui';
import CodeBlock from '../../../components/CodeBlock';
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

      <section className={styles.section}>
        <h2>React Component</h2>
        <p>podo-ui React 컴포넌트를 사용한 예제입니다.</p>

        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Select } from 'podo-ui';

const options = [
  { value: 'option1', label: '옵션 1' },
  { value: 'option2', label: '옵션 2' },
  { value: 'option3', label: '옵션 3' },
];

// Basic
<Select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  options={options}
  placeholder="옵션을 선택하세요"
/>

// With Icon
<Select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={roleOptions}
  withIcon="icon-user"
  placeholder="역할 선택"
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
            <SelectComponent
              options={roleOptions}
              withIcon="icon-user"
              placeholder={t('icons.userPlaceholder')}
            />
          </div>
        </div>

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

      <section className={styles.section}>
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
            <select>
              <option value="" disabled selected>{t('basicUsage.options.placeholder')}</option>
              <option value="1">{t('basicUsage.options.option1')}</option>
              <option value="2">{t('basicUsage.options.option2')}</option>
              <option value="3">{t('basicUsage.options.option3')}</option>
            </select>
            <select defaultValue="2">
              <option value="1">{t('basicUsage.cities.seoul')}</option>
              <option value="2">{t('basicUsage.cities.busan')}</option>
              <option value="3">{t('basicUsage.cities.daegu')}</option>
              <option value="4">{t('basicUsage.cities.incheon')}</option>
            </select>
            <select disabled>
              <option>{t('basicUsage.disabled')}</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('placeholder.title')}</h2>
        <p>{t('placeholder.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<select>
  <option value="" disabled selected>${t('placeholder.categoryPlaceholder')}</option>
  <option value="electronics">${t('placeholder.categories.electronics')}</option>
  <option value="fashion">${t('placeholder.categories.fashion')}</option>
  <option value="food">${t('placeholder.categories.food')}</option>
</select>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.selectGroup}>
            <select>
              <option value="" disabled selected>{t('placeholder.categoryPlaceholder')}</option>
              <option value="electronics">{t('placeholder.categories.electronics')}</option>
              <option value="fashion">{t('placeholder.categories.fashion')}</option>
              <option value="food">{t('placeholder.categories.food')}</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.section}>
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
    <option value="guest">${t('icons.roles.guest')}</option>
  </select>
</div>

<div class="with-icon">
  <i class="icon-globe"></i>
  <select>
    <option value="" disabled selected>${t('icons.languagePlaceholder')}</option>
    <option value="ko">${t('icons.languages.ko')}</option>
    <option value="en">${t('icons.languages.en')}</option>
    <option value="ja">${t('icons.languages.ja')}</option>
  </select>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.selectGroup}>
            <div className="with-icon">
              <i className="icon-user"></i>
              <select>
                <option value="" disabled selected>{t('icons.userPlaceholder')}</option>
                <option value="admin">{t('icons.roles.admin')}</option>
                <option value="user">{t('icons.roles.user')}</option>
                <option value="guest">{t('icons.roles.guest')}</option>
              </select>
            </div>
            <div className="with-icon">
              <i className="icon-globe"></i>
              <select>
                <option value="" disabled selected>{t('icons.languagePlaceholder')}</option>
                <option value="ko">{t('icons.languages.ko')}</option>
                <option value="en">{t('icons.languages.en')}</option>
                <option value="ja">{t('icons.languages.ja')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.selectGroup}>
            <div>
              <label className={styles.label}>{t('states.default')}</label>
              <select>
                <option value="" disabled selected>{t('states.selectOption')}</option>
                <option value="1">{t('basicUsage.options.option1')}</option>
                <option value="2">{t('basicUsage.options.option2')}</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>{t('states.disabled')}</label>
              <select disabled>
                <option>{t('states.disabledSelect')}</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>{t('states.multiple')}</label>
              <select multiple size={4}>
                <option value="1">{t('basicUsage.options.option1')}</option>
                <option value="2">{t('basicUsage.options.option2')}</option>
                <option value="3">{t('basicUsage.options.option3')}</option>
                <option value="4">{t('states.option4')}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <CodeBlock
          title="component.module.scss"
          language="scss"
          code={`@use 'podo-ui/mixin' as *;

.customSelect {
  padding: s(3) s(7) s(3) s(5);
  border: 1px solid color(border);
  border-radius: r(3);
  background: color(bg-block);
  color: color(default-deep-base);
  outline: none;
  appearance: none;
  cursor: pointer;

  // ${t('code.customArrow')}
  background-image: url('data:image/svg+xml,...');
  background-repeat: no-repeat;
  background-position: right 11px center;

  &:focus-visible:not(:disabled) {
    outline: 4px solid color(primary-outline);
  }

  &:disabled {
    color: color(text-action-disabled);
    background-color: color(bg-disabled);
    cursor: not-allowed;
  }
}

// ${t('code.withIcon')}
.withIcon {
  position: relative;
  display: inline-block;

  > i {
    position: absolute;
    left: s(3);
    top: 50%;
    transform: translateY(-50%);
    color: color(text-action);
    pointer-events: none;
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

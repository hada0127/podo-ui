import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function Select() {
  const { t } = useTranslation('select');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<select>
  <option value="" disabled selected>${t('basicUsage.options.placeholder')}</option>
  <option value="1">${t('basicUsage.options.option1')}</option>
  <option value="2">${t('basicUsage.options.option2')}</option>
  <option value="3">${t('basicUsage.options.option3')}</option>
</select>`}</code></pre>
        </div>

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

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<select>
  <option value="" disabled selected>${t('placeholder.categoryPlaceholder')}</option>
  <option value="electronics">${t('placeholder.categories.electronics')}</option>
  <option value="fashion">${t('placeholder.categories.fashion')}</option>
  <option value="food">${t('placeholder.categories.food')}</option>
</select>`}</code></pre>
        </div>

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

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="with-icon">
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
</div>`}</code></pre>
        </div>

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

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.customSelect {
  padding: s(3) s(7) s(3) s(5);
  border: 1px solid color(border);
  border-radius: r(3);
  background: color(bg-block);
  color: color(default-deep-base);
  outline: none;
  appearance: none;
  cursor: pointer;

  // 커스텀 화살표 (자동 포함됨)
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

// 아이콘과 함께 사용
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
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

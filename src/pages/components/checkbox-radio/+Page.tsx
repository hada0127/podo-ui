import { useTranslation } from 'react-i18next';
import styles from './Page.module.scss';

export default function CheckboxRadio() {
  const { t } = useTranslation('checkboxRadio');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('checkbox.title')}</h2>
        <p>{t('checkbox.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<label>
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
</label>

<label>
  <input type="checkbox" checked disabled />
  ${t('checkbox.checkedDisabled')}
</label>`}</code></pre>
        </div>

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

      <section className={styles.section}>
        <h2>{t('indeterminate.title')}</h2>
        <p>{t('indeterminate.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>JavaScript</div>
          <pre><code>{`const checkbox = document.querySelector('#myCheckbox');
checkbox.indeterminate = true;`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                ref={(el) => {
                  if (el) {
                    el.indeterminate = true;
                  }
                }}
              />
              {t('indeterminate.state')}
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('radio.title')}</h2>
        <p>{t('radio.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<label>
  <input type="radio" name="option" value="1" checked />
  ${t('radio.option1')}
</label>

<label>
  <input type="radio" name="option" value="2" />
  ${t('radio.option2')}
</label>

<label>
  <input type="radio" name="option" value="3" />
  ${t('radio.option3')}
</label>

<label>
  <input type="radio" name="option" value="4" disabled />
  ${t('radio.disabledOption')}
</label>`}</code></pre>
        </div>

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

      <section className={styles.section}>
        <h2>{t('checkboxGroup.title')}</h2>
        <p>{t('checkboxGroup.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('checkboxGroup.interests')}</div>
          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" name="interests" value="design" />
              {t('checkboxGroup.options.design')}
            </label>
            <label>
              <input type="checkbox" name="interests" value="development" />
              {t('checkboxGroup.options.development')}
            </label>
            <label>
              <input type="checkbox" name="interests" value="marketing" />
              {t('checkboxGroup.options.marketing')}
            </label>
            <label>
              <input type="checkbox" name="interests" value="business" />
              {t('checkboxGroup.options.business')}
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('radioGroup.title')}</h2>
        <p>{t('radioGroup.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('radioGroup.payment')}</div>
          <div className={styles.radioGroup}>
            <label>
              <input type="radio" name="payment" value="card" defaultChecked />
              {t('radioGroup.options.card')}
            </label>
            <label>
              <input type="radio" name="payment" value="bank" />
              {t('radioGroup.options.bank')}
            </label>
            <label>
              <input type="radio" name="payment" value="mobile" />
              {t('radioGroup.options.mobile')}
            </label>
            <label>
              <input type="radio" name="payment" value="kakao" />
              {t('radioGroup.options.kakao')}
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.checkboxWrapper {
  display: flex;
  flex-direction: column;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    gap: s(2);
    cursor: pointer;
    user-select: none;

    input[type='checkbox'] {
      margin-right: s(2);
    }

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

    input[type='radio'] {
      margin-right: s(2);
    }
  }
}

// ${t('code.customStyle')}
.customCheckbox {
  input[type='checkbox']:focus-visible {
    outline: 4px solid color(primary-outline);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('darkMode.title')}</h2>
        <p>{t('darkMode.description')}</p>
      </section>
    </>
  );
}

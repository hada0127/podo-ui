import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input as InputComponent } from 'podo-ui';
import { z } from 'zod';
import styles from './Page.module.scss';

export default function Input() {
  const { t } = useTranslation('input');
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [distance, setDistance] = useState('');

  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>{t('react.title')}</h2>
        <p>{t('react.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>React</div>
          <pre><code>{`import { Input } from 'podo-ui'
import { z } from 'zod'

// Zod 검증
<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  validator={z.string().email('올바른 이메일을 입력하세요')}
  placeholder="이메일"
/>

// 아이콘
<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  withIcon="icon-search"
  placeholder="검색..."
/>

// 단위 표시
<Input
  type="number"
  value={distance}
  onChange={(e) => setDistance(e.target.value)}
  unit="km"
  placeholder="거리"
/>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.validation.title')}</div>
          <div className={styles.inputGroup}>
            <InputComponent
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              validator={z.string().email('올바른 이메일을 입력하세요')}
              placeholder="이메일을 입력하세요"
            />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.icons.title')}</div>
          <div className={styles.inputGroup}>
            <InputComponent
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              withIcon="icon-search"
              placeholder="검색..."
            />
            <InputComponent
              value=""
              withRightIcon="icon-mail"
              placeholder="이메일"
            />
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('react.unit.title')}</div>
          <div className={styles.inputGroup}>
            <InputComponent
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              unit="km"
              placeholder="거리"
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="text" placeholder="${t('basicUsage.placeholders.text')}" />
<input type="email" placeholder="${t('basicUsage.placeholders.email')}" />
<input type="password" placeholder="${t('basicUsage.placeholders.password')}" />
<input type="number" placeholder="${t('basicUsage.placeholders.number')}" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('basicUsage.placeholders.text')} />
            <input type="email" placeholder={t('basicUsage.placeholders.email')} />
            <input type="password" placeholder={t('basicUsage.placeholders.password')} />
            <input type="number" placeholder={t('basicUsage.placeholders.number')} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<input type="text" placeholder="${t('types.placeholders.text')}" />
<input type="email" placeholder="${t('types.placeholders.email')}" />
<input type="password" placeholder="${t('types.placeholders.password')}" />
<input type="number" placeholder="${t('types.placeholders.number')}" />
<input type="tel" placeholder="${t('types.placeholders.tel')}" />
<input type="url" placeholder="${t('types.placeholders.url')}" />
<input type="search" placeholder="${t('types.placeholders.search')}" />
<input type="date" />
<input type="time" />
<input type="month" />
<input type="week" />
<input type="datetime-local" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.typeGrid}>
            <div className={styles.typeCard}>
              <label>text</label>
              <input type="text" placeholder={t('types.placeholders.text')} />
            </div>
            <div className={styles.typeCard}>
              <label>email</label>
              <input type="email" placeholder="example@email.com" />
            </div>
            <div className={styles.typeCard}>
              <label>password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className={styles.typeCard}>
              <label>number</label>
              <input type="number" placeholder="123" />
            </div>
            <div className={styles.typeCard}>
              <label>tel</label>
              <input type="tel" placeholder="010-1234-5678" />
            </div>
            <div className={styles.typeCard}>
              <label>url</label>
              <input type="url" placeholder="https://example.com" />
            </div>
            <div className={styles.typeCard}>
              <label>search</label>
              <input type="search" placeholder={t('types.placeholders.search')} />
            </div>
            <div className={styles.typeCard}>
              <label>date</label>
              <input type="date" />
            </div>
            <div className={styles.typeCard}>
              <label>time</label>
              <input type="time" />
            </div>
            <div className={styles.typeCard}>
              <label>month</label>
              <input type="month" />
            </div>
            <div className={styles.typeCard}>
              <label>week</label>
              <input type="week" />
            </div>
            <div className={styles.typeCard}>
              <label>datetime-local</label>
              <input type="datetime-local" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('states.default')} -->
<input type="text" placeholder="${t('states.default')}" />

<!-- ${t('states.success')} -->
<input type="text" class="success" value="valid@email.com" />

<!-- ${t('states.danger')} -->
<input type="text" class="danger" value="invalid-email" />

<!-- ${t('states.disabled')} -->
<input type="text" placeholder="${t('states.disabled')}" disabled />

<!-- ${t('states.readonly')} -->
<input type="text" value="${t('states.readonlyText')}" readonly />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('states.default')} />
            <input type="text" className="success" value="valid@email.com" />
            <input type="text" className="danger" value="invalid-email" />
            <input type="text" placeholder={t('states.disabled')} disabled />
            <input type="text" value={t('states.readonlyText')} readOnly />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// ${t('code.successState')} (border: 1px solid color('success'))
input.success {
  border-color: color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

// ${t('code.dangerState')} (border: 1px solid color('danger'))
input.danger {
  border-color: color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// ${t('code.disabledState')}
input:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// ${t('code.readonlyState')}
input:read-only {
  border: none;
  cursor: default;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('variants.title')}</h2>
        <p>{t('variants.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('variants.default')} -->
<input type="text" placeholder="${t('variants.default')}" />

<!-- ${t('variants.fill')} -->
<input type="text" class="fill" placeholder="${t('variants.fill')}" />

<!-- ${t('variants.text')} -->
<input type="text" class="text" placeholder="${t('variants.text')}" />

<!-- ${t('variants.underline')} -->
<input type="text" class="underline" placeholder="${t('variants.underline')}" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('variants.default')} />
            <input type="text" className="fill" placeholder={t('variants.fill')} />
            <input type="text" className="text" placeholder={t('variants.text')} />
            <input type="text" className="underline" placeholder={t('variants.underline')} />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// ${t('code.fillVariant')} (background-color: color('default-fill'))
input.fill {
  background-color: color('default-fill');
}

// ${t('code.textVariant')} (border: none)
input.text {
  border: none;
}

// ${t('code.underlineVariant')} (border-bottom only, border-radius: 0)
input.underline {
  border: none;
  border-bottom: 1px solid color('border-disabled');
  border-radius: 0;

  &:focus-visible:not(:disabled) {
    border-bottom-color: color('primary-base');
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('sizes.default')} (padding: s(3) s(4), border-radius: r(3)) -->
<input type="text" placeholder="${t('sizes.default')}" />

<!-- ${t('sizes.medium')} (padding: s(4) s(4), border-radius: r(5)) -->
<input type="text" class="md" placeholder="${t('sizes.medium')}" />

<!-- ${t('sizes.large')} (padding: s(5) s(4), border-radius: r(6)) -->
<input type="text" class="lg" placeholder="${t('sizes.large')}" />`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('sizes.default')} />
            <input type="text" className="md" placeholder={t('sizes.medium')} />
            <input type="text" className="lg" placeholder={t('sizes.large')} />
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// ${t('code.defaultSize')}
input {
  padding: s(3) s(4);
  border-radius: r(3);
}

// ${t('code.mediumSize')}
input.md {
  padding: s(4) s(4);
  border-radius: r(5);
}

// ${t('code.largeSize')}
input.lg {
  padding: s(5) s(4);
  border-radius: r(6);
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('icons.title')}</h2>
        <p>{t('icons.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('icons.leftIcon')} (input padding-left: s(8), ${t('icons.icon')} left: s(3)) -->
<div class="with-icon">
  <i class="icon-search"></i>
  <input type="text" placeholder="${t('icons.placeholders.search')}" />
</div>

<!-- ${t('icons.rightIcon')} (input padding-right: s(7), ${t('icons.icon')} right: s(3)) -->
<div class="with-right-icon">
  <input type="email" placeholder="${t('icons.placeholders.email')}" />
  <i class="icon-mail"></i>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <div className="with-icon">
              <i className="icon-search"></i>
              <input type="text" placeholder={t('icons.placeholders.search')} />
            </div>
            <div className="with-icon">
              <i className="icon-user"></i>
              <input type="text" placeholder={t('icons.placeholders.username')} />
            </div>
            <div className="with-right-icon">
              <input type="email" placeholder={t('icons.placeholders.email')} />
              <i className="icon-mail"></i>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// ${t('code.leftIcon')}
.with-icon {
  position: relative;

  > i {
    position: absolute;
    left: s(3);
    top: 50%;
    transform: translateY(-50%);
  }

  > input {
    padding-left: s(8);  // ${t('code.iconSpace')}
  }
}

// ${t('code.rightIcon')}
.with-right-icon {
  position: relative;

  > i {
    position: absolute;
    right: s(3);
    top: 50%;
    transform: translateY(-50%);
  }

  > input {
    padding-right: s(7);  // ${t('code.iconSpace')}
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

// ${t('code.defaultInputStyle')}
input[type='text'],
input[type='email'],
input[type='password'] {
  @include p3;
  padding: s(3) s(4);
  background-color: color('bg-block');
  border-radius: r(3);
  border: 1px solid color('border-disabled');

  &:focus-visible:not(:disabled) {
    border-color: color('primary-base');
    outline: 4px solid color('primary-outline');
  }

  &::placeholder {
    color: color('placeholder');
  }
}

// ${t('code.successDangerState')}
input.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

input.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// ${t('code.sizeVariant')}
input.md {
  padding: s(4) s(4);
  border-radius: r(5);
}

input.lg {
  padding: s(5) s(4);
  border-radius: r(6);
}`}</code></pre>
        </div>
      </section>
    </>
  );
}

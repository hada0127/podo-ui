import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input as InputComponent } from 'podo-ui';
import { z } from 'zod';
import CodeBlock from '../../../components/CodeBlock';
import DocTabs from '../../../components/DocTabs';
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
                email={email}
                setEmail={setEmail}
                search={search}
                setSearch={setSearch}
                distance={distance}
                setDistance={setDistance}
              />
            ),
          },
        ]}
        defaultTab="scss"
      />
    </>
  );
}

function ScssContent({ t }: { t: (key: string) => string }) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="scss"
          code={`@use 'podo-ui/scss/atom/input';`}
        />
      </section>

      <section>
        <h2>{t('basicUsage.title')}</h2>
        <p>{t('basicUsage.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<input type="text" placeholder="${t('basicUsage.placeholders.text')}" />
<input type="email" placeholder="${t('basicUsage.placeholders.email')}" />
<input type="password" placeholder="${t('basicUsage.placeholders.password')}" />
<input type="number" placeholder="${t('basicUsage.placeholders.number')}" />`}
        />

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

      <section>
        <h2>{t('types.title')}</h2>
        <p>{t('types.description')}</p>

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
              <label>date</label>
              <input type="date" />
            </div>
            <div className={styles.typeCard}>
              <label>time</label>
              <input type="time" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<!-- ${t('states.default')} -->
<input type="text" placeholder="${t('states.default')}" />

<!-- ${t('states.success')} -->
<input type="text" class="success" value="valid@email.com" />

<!-- ${t('states.danger')} -->
<input type="text" class="danger" value="invalid-email" />

<!-- ${t('states.disabled')} -->
<input type="text" placeholder="${t('states.disabled')}" disabled />

<!-- ${t('states.readonly')} -->
<input type="text" value="${t('states.readonlyText')}" readonly />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('states.default')} />
            <input type="text" className="success" defaultValue="valid@email.com" />
            <input type="text" className="danger" defaultValue="invalid-email" />
            <input type="text" placeholder={t('states.disabled')} disabled />
            <input type="text" defaultValue={t('states.readonlyText')} readOnly />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('variants.title')}</h2>
        <p>{t('variants.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<input type="text" placeholder="${t('variants.default')}" />
<input type="text" class="fill" placeholder="${t('variants.fill')}" />
<input type="text" class="text" placeholder="${t('variants.text')}" />
<input type="text" class="underline" placeholder="${t('variants.underline')}" />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('variants.default')} />
            <input type="text" className="fill" placeholder={t('variants.fill')} />
            <input type="text" className="text" placeholder={t('variants.text')} />
            <input type="text" className="underline" placeholder={t('variants.underline')} />
          </div>
        </div>
      </section>

      <section>
        <h2>{t('sizes.title')}</h2>
        <p>{t('sizes.description')}</p>

        <CodeBlock
          title="HTML"
          language="html"
          code={`<input type="text" placeholder="${t('sizes.default')}" />
<input type="text" class="md" placeholder="${t('sizes.medium')}" />
<input type="text" class="lg" placeholder="${t('sizes.large')}" />`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <input type="text" placeholder={t('sizes.default')} />
            <input type="text" className="md" placeholder={t('sizes.medium')} />
            <input type="text" className="lg" placeholder={t('sizes.large')} />
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
  <i class="icon-search"></i>
  <input type="text" placeholder="${t('icons.placeholders.search')}" />
</div>

<div class="with-right-icon">
  <input type="email" placeholder="${t('icons.placeholders.email')}" />
  <i class="icon-mail"></i>
</div>`}
        />

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.inputGroup}>
            <div className="with-icon">
              <i className="icon-search"></i>
              <input type="text" placeholder={t('icons.placeholders.search')} />
            </div>
            <div className="with-right-icon">
              <input type="email" placeholder={t('icons.placeholders.email')} />
              <i className="icon-mail"></i>
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

input.success {
  border: 1px solid color('success');
}

input.danger {
  border: 1px solid color('danger');
}`}
        />
      </section>
    </>
  );
}

interface ReactContentProps {
  t: (key: string) => string;
  email: string;
  setEmail: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  distance: string;
  setDistance: (v: string) => void;
}

function ReactContent({
  t,
  email,
  setEmail,
  search,
  setSearch,
  distance,
  setDistance,
}: ReactContentProps) {
  return (
    <>
      <section>
        <h2>Import</h2>
        <CodeBlock
          language="tsx"
          code={`import { Input } from 'podo-ui';`}
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
              <td>입력값</td>
            </tr>
            <tr>
              <td><code>onChange</code></td>
              <td><code>(e: ChangeEvent) =&gt; void</code></td>
              <td>-</td>
              <td>값 변경 핸들러</td>
            </tr>
            <tr>
              <td><code>validator</code></td>
              <td><code>ZodSchema</code></td>
              <td>-</td>
              <td>Zod 검증 스키마</td>
            </tr>
            <tr>
              <td><code>withIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>왼쪽 아이콘 클래스명</td>
            </tr>
            <tr>
              <td><code>withRightIcon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>오른쪽 아이콘 클래스명</td>
            </tr>
            <tr>
              <td><code>unit</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>단위 표시 (예: km, %)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Zod 검증</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`import { Input } from 'podo-ui';
import { z } from 'zod';

<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  validator={z.string().email('올바른 이메일을 입력하세요')}
  placeholder="이메일"
/>`}
        />

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
      </section>

      <section>
        <h2>아이콘</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  withIcon="icon-search"
  placeholder="검색..."
/>

<Input
  withRightIcon="icon-mail"
  placeholder="이메일"
/>`}
        />

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
              defaultValue=""
              withRightIcon="icon-mail"
              placeholder="이메일"
            />
          </div>
        </div>
      </section>

      <section>
        <h2>단위 표시</h2>
        <CodeBlock
          title="React"
          language="tsx"
          code={`<Input
  type="number"
  value={distance}
  onChange={(e) => setDistance(e.target.value)}
  unit="km"
  placeholder="거리"
/>`}
        />

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
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Textarea() {
  const t = useTranslations('textarea');
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
          <pre><code>{`<textarea placeholder="${t('basicUsage.placeholders.content')}"></textarea>
<textarea placeholder="${t('basicUsage.placeholders.content')}" rows="5"></textarea>
<textarea placeholder="${t('basicUsage.placeholders.disabled')}" disabled></textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <textarea placeholder={t('basicUsage.placeholders.content')}></textarea>
            <textarea placeholder={t('basicUsage.placeholders.content')} rows={5}></textarea>
            <textarea placeholder={t('basicUsage.placeholders.disabled')} disabled></textarea>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('resize.title')}</h2>
        <p>{t('resize.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('resize.resizable')} -->
<textarea rows="4" placeholder="${t('resize.placeholders.resizable')}"></textarea>

<!-- ${t('resize.fixed')} (resize: none) -->
<textarea class="resize-none" rows="4" placeholder="${t('resize.placeholders.fixed')}"></textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <div>
              <label className={styles.label}>{t('resize.resizable')}</label>
              <textarea rows={4} placeholder={t('resize.placeholders.resizable')}></textarea>
            </div>
            <div>
              <label className={styles.label}>{t('resize.fixedLabel')}</label>
              <textarea className="resize-none" rows={4} placeholder={t('resize.placeholders.fixed')}></textarea>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`textarea.resize-none {
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('states.title')}</h2>
        <p>{t('states.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- ${t('states.default')} -->
<textarea placeholder="${t('states.default')}"></textarea>

<!-- ${t('states.success')} -->
<textarea class="success">${t('states.successText')}</textarea>

<!-- ${t('states.danger')} -->
<textarea class="danger">${t('states.dangerText')}</textarea>

<!-- ${t('states.disabled')} -->
<textarea placeholder="${t('states.disabled')}" disabled></textarea>

<!-- ${t('states.readonly')} -->
<textarea readonly>${t('states.readonlyText')}</textarea>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('demo.title')}</div>
          <div className={styles.textareaGroup}>
            <div>
              <label className={styles.label}>{t('states.default')}</label>
              <textarea rows={3} placeholder={t('states.default')}></textarea>
            </div>
            <div>
              <label className={styles.label}>{t('states.successLabel')}</label>
              <textarea className="success" rows={3} value={t('states.successText')} readOnly></textarea>
            </div>
            <div>
              <label className={styles.label}>{t('states.dangerLabel')}</label>
              <textarea className="danger" rows={3} value={t('states.dangerText')} readOnly></textarea>
            </div>
            <div>
              <label className={styles.label}>{t('states.disabledLabel')}</label>
              <textarea rows={3} placeholder={t('states.disabled')} disabled></textarea>
            </div>
            <div>
              <label className={styles.label}>{t('states.readonlyLabel')}</label>
              <textarea className="resize-none" rows={3} readOnly value={t('states.readonlyText')}></textarea>
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>SCSS</div>
          <pre><code>{`// Success 상태 (border: 1px solid color('success'))
textarea.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

// Danger 상태 (border: 1px solid color('danger'))
textarea.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// Disabled 상태
textarea:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// Read-only 상태 (border: none, resize: none)
textarea:read-only {
  border: none;
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('scss.title')}</h2>
        <p>{t('scss.description')}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

// 기본 textarea 스타일
textarea {
  @include p3;
  padding: s(3) s(4);
  background-color: color('bg-block');
  border: 1px solid color('border');
  border-radius: r(2);

  &:focus-visible:not(:disabled) {
    border-color: color('primary-base');
    outline: 4px solid color('primary-outline');
  }

  &::placeholder {
    color: color('placeholder');
  }
}

// 크기 조절 방지
textarea.resize-none {
  resize: none;
}

// Success/Danger 상태
textarea.success {
  border: 1px solid color('success');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('success-outline');
  }
}

textarea.danger {
  border: 1px solid color('danger');

  &:focus-visible:not(:disabled) {
    outline: 4px solid color('danger-outline');
  }
}

// 비활성화 상태
textarea:disabled {
  background: color('bg-disabled');
  cursor: not-allowed;
}

// 읽기 전용 상태
textarea:read-only {
  border: none;
  resize: none;
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>{t('examples.title')}</h2>
        <p>{t('examples.description')}</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('examples.commentForm')}</div>
          <div style={{ maxWidth: '600px' }}>
            <textarea
              rows={4}
              placeholder={t('examples.commentPlaceholder')}
              style={{ width: '100%', marginBottom: '8px' }}
            ></textarea>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--default-base)' }}>
              {t('examples.characterCount')}
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>{t('examples.feedbackForm')}</div>
          <div style={{ maxWidth: '600px' }}>
            <label className={styles.label} style={{ display: 'block', marginBottom: '8px' }}>
              {t('examples.feedbackLabel')}
            </label>
            <textarea
              className="resize-none"
              rows={6}
              placeholder={t('examples.feedbackPlaceholder')}
              style={{ width: '100%' }}
            ></textarea>
          </div>
        </div>
      </section>
    </>
  );
}

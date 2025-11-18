'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const t = useTranslations('common');

  const changeLanguage = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        disabled={isPending || locale === 'en'}
      >
        EN
      </button>
      <button
        className={`${styles.langButton} ${locale === 'ko' ? styles.active : ''}`}
        onClick={() => changeLanguage('ko')}
        disabled={isPending || locale === 'ko'}
      >
        KO
      </button>
    </div>
  );
}

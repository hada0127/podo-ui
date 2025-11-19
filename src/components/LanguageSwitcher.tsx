'use client';

import { useTransition, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState<string>('en');
  const t = useTranslations('common');

  useEffect(() => {
    // 쿠키에서 locale 읽기
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(c => c.trim().startsWith('locale='));
    const locale = localeCookie ? localeCookie.split('=')[1] : 'en';
    setCurrentLocale(locale);
  }, []);

  const changeLanguage = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      setCurrentLocale(newLocale);
      window.location.reload();
    });
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${currentLocale === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        disabled={isPending || currentLocale === 'en'}
      >
        EN
      </button>
      <button
        className={`${styles.langButton} ${currentLocale === 'ko' ? styles.active : ''}`}
        onClick={() => changeLanguage('ko')}
        disabled={isPending || currentLocale === 'ko'}
      >
        KO
      </button>
    </div>
  );
}

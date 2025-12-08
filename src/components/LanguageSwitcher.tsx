import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  const changeLanguage = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    i18n.changeLanguage(newLocale);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${currentLocale === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
        disabled={currentLocale === 'en'}
      >
        EN
      </button>
      <button
        className={`${styles.langButton} ${currentLocale === 'ko' ? styles.active : ''}`}
        onClick={() => changeLanguage('ko')}
        disabled={currentLocale === 'ko'}
      >
        KO
      </button>
    </div>
  );
}

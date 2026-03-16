import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.scss';

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [mode, setMode] = useState<'' | 'light' | 'dark'>('');

  useEffect(() => {
    const savedMode = localStorage.getItem('color-mode') as '' | 'light' | 'dark' | null;
    if (savedMode !== null) {
      setMode(savedMode);
      if (savedMode === '') {
        document.documentElement.removeAttribute('data-color-mode');
      } else {
        document.documentElement.setAttribute('data-color-mode', savedMode);
      }
    }
  }, []);

  const handleModeChange = (newMode: '' | 'light' | 'dark') => {
    setMode(newMode);
    if (newMode === '') {
      document.documentElement.removeAttribute('data-color-mode');
    } else {
      document.documentElement.setAttribute('data-color-mode', newMode);
    }
    localStorage.setItem('color-mode', newMode);
  };

  const handleToggleMode = () => {
    if (mode === '') {
      handleModeChange('light');
    } else if (mode === 'light') {
      handleModeChange('dark');
    } else {
      handleModeChange('');
    }
  };

  const getModeLabel = () => {
    if (mode === 'light') return 'Light Mode';
    if (mode === 'dark') return 'Dark Mode';
    return 'Auto Mode';
  };

  const getModeIcon = () => {
    if (mode === 'light') return 'icon-show';
    if (mode === 'dark') return 'icon-hidden';
    return 'icon-setting-stroke';
  };

  if (compact) {
    return (
      <button
        className={styles.compactToggle}
        onClick={handleToggleMode}
        aria-label={getModeLabel()}
        title={getModeLabel()}
      >
        <i className={getModeIcon()}></i>
      </button>
    );
  }

  return (
    <div className={styles.toggle}>
      <button className={styles.currentMode} onClick={handleToggleMode}>
        <i className="icon-show"></i>
        <span>{getModeLabel()}</span>
      </button>
    </div>
  );
}

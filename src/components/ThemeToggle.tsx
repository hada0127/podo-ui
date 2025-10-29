'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.scss';

export default function ThemeToggle() {
  const [mode, setMode] = useState<'' | 'light' | 'dark'>('');

  useEffect(() => {
    const savedMode = localStorage.getItem('color-mode') as '' | 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
      document.documentElement.setAttribute('data-color-mode', savedMode);
    }
  }, []);

  const handleModeChange = (newMode: '' | 'light' | 'dark') => {
    setMode(newMode);
    document.documentElement.setAttribute('data-color-mode', newMode);
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

  return (
    <div className={styles.toggle}>
      <button className={styles.currentMode} onClick={handleToggleMode}>
        <i className="icon-show"></i>
        <span>{getModeLabel()}</span>
      </button>
    </div>
  );
}

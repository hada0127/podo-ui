import { ReactNode } from 'react';
import styles from './BrowserWindow.module.scss';

interface BrowserWindowProps {
  title?: string;
  children: ReactNode;
}

export default function BrowserWindow({ title, children }: BrowserWindowProps) {
  return (
    <div className={styles.browserWindow}>
      <div className={styles.browserHeader}>
        <div className={styles.browserDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
        {title && <div className={styles.browserTab}>{title}</div>}
      </div>
      {children}
    </div>
  );
}

import { useState, useEffect } from 'react';
import styles from './DocTabs.module.scss';

export type DocTabKey = 'scss' | 'react' | 'cdn';

export interface DocTabItem {
  key: DocTabKey;
  label: string;
  content: React.ReactNode;
}

export interface DocTabsProps {
  tabs: DocTabItem[];
  defaultTab?: DocTabKey;
}

export default function DocTabs({ tabs, defaultTab }: DocTabsProps) {
  const [activeKey, setActiveKey] = useState<DocTabKey>(
    defaultTab || tabs[0]?.key || 'scss'
  );

  // URL hash sync
  useEffect(() => {
    const hash = window.location.hash.slice(1) as DocTabKey;
    if (hash && tabs.some((tab) => tab.key === hash)) {
      setActiveKey(hash);
    }
  }, [tabs]);

  const handleTabClick = (key: DocTabKey) => {
    setActiveKey(key);
    window.history.replaceState(null, '', `#${key}`);
  };

  const activeTab = tabs.find((tab) => tab.key === activeKey);

  return (
    <div className={styles.docTabs}>
      <ul className="tabs">
        {tabs.map((tab) => (
          <li key={tab.key} className={activeKey === tab.key ? 'on' : undefined}>
            <a
              href={`#${tab.key}`}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(tab.key);
              }}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.tabContent}>{activeTab?.content}</div>
    </div>
  );
}

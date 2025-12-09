import React, { useState } from 'react';

export interface TabItem {
  /** Tab key */
  key: string;
  /** Tab label */
  label: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface TabProps {
  /** Tab items */
  items: TabItem[];
  /** Active tab key (controlled) */
  activeKey?: string;
  /** Default active tab key (uncontrolled) */
  defaultActiveKey?: string;
  /** Equal width tabs */
  fill?: boolean;
  /** Tab change callback */
  onChange?: (key: string) => void;
  /** Additional class name */
  className?: string;
}

export interface TabPanelProps {
  /** Tab key (must match Tab item key) */
  tabKey: string;
  /** Current active key */
  activeKey?: string;
  /** Panel content */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

const Tab: React.FC<TabProps> & { Panel: React.FC<TabPanelProps> } = ({
  items,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  fill,
  onChange,
  className,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || items[0]?.key
  );

  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalActiveKey(key);
    onChange?.(key);
  };

  const tabsClass = ['tabs', fill && 'fill', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ul className={tabsClass}>
      {items.map((item) => (
        <li key={item.key} className={activeKey === item.key ? 'on' : undefined}>
          <a
            href={`#${item.key}`}
            onClick={(e) => {
              e.preventDefault();
              handleClick(item.key, item.disabled);
            }}
            aria-disabled={item.disabled}
            tabIndex={item.disabled ? -1 : 0}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
};

const TabPanel: React.FC<TabPanelProps> = ({
  tabKey,
  activeKey,
  children,
  className,
}) => {
  if (tabKey !== activeKey) return null;
  return <div className={className}>{children}</div>;
};

TabPanel.displayName = 'TabPanel';

Tab.Panel = TabPanel;
Tab.displayName = 'Tab';

export default Tab;

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenuButton from './MobileMenuButton';
import styles from './Navigation.module.scss';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('navigation');

  const menuItems = [
    {
      titleKey: 'gettingStarted',
      items: [
        { labelKey: 'introduction', path: '/' },
        { labelKey: 'installation', path: '/getting-started/installation' },
        { labelKey: 'usage', path: '/getting-started/usage' },
      ],
    },
    {
      titleKey: 'foundation',
      items: [
        { labelKey: 'colors', path: '/foundation/colors' },
        { labelKey: 'typography', path: '/foundation/typography' },
        { labelKey: 'icons', path: '/foundation/icons' },
        { labelKey: 'spacing', path: '/foundation/spacing' },
      ],
    },
    {
      titleKey: 'layout',
      items: [
        { labelKey: 'grid', path: '/layout/grid' },
        { labelKey: 'responsive', path: '/layout/responsive' },
      ],
    },
    {
      titleKey: 'components',
      items: [
        { labelKey: 'avatar', path: '/components/avatar' },
        { labelKey: 'button', path: '/components/button' },
        { labelKey: 'input', path: '/components/input' },
        { labelKey: 'textarea', path: '/components/textarea' },
        { labelKey: 'select', path: '/components/select' },
        { labelKey: 'checkboxRadio', path: '/components/checkbox-radio' },
        { labelKey: 'toggle', path: '/components/toggle' },
        { labelKey: 'fileUpload', path: '/components/file' },
        { labelKey: 'editor', path: '/components/editor' },
        { labelKey: 'chip', path: '/components/chip' },
        { labelKey: 'field', path: '/components/field' },
        { labelKey: 'table', path: '/components/table' },
        { labelKey: 'tab', path: '/components/tab' },
        { labelKey: 'pagination', path: '/components/pagination' },
        { labelKey: 'toast', path: '/components/toast' },
      ],
    },
    {
      titleKey: 'utilities',
      items: [
        { labelKey: 'border', path: '/utilities/border' },
        { labelKey: 'radius', path: '/utilities/radius' },
        { labelKey: 'elevation', path: '/utilities/elevation' },
        { labelKey: 'display', path: '/utilities/display' },
      ],
    },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.mobileHeader}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="Podo UI" width={32} height={32} />
          <h1>Podo UI</h1>
        </Link>
        <MobileMenuButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </div>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo.svg" alt="Podo UI" width={32} height={32} />
            <h1>Podo UI</h1>
          </Link>
          <div className={styles.controls}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className={styles.menu}>
          {menuItems.map((section) => (
            <div key={section.titleKey} className={styles.section}>
              <h2 className={styles.sectionTitle}>{t(section.titleKey)}</h2>
              <ul className={styles.list}>
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={pathname === item.path ? styles.active : ''}
                      onClick={handleLinkClick}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

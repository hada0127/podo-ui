'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import styles from './Navigation.module.scss';

const menuItems = [
  {
    title: 'Getting Started',
    items: [
      { label: '소개', path: '/' },
      { label: '설치', path: '/getting-started/installation' },
      { label: '사용법', path: '/getting-started/usage' },
    ],
  },
  {
    title: 'Foundation',
    items: [
      { label: '컬러', path: '/foundation/colors' },
      { label: '타이포그래피', path: '/foundation/typography' },
      { label: '아이콘', path: '/foundation/icons' },
      { label: '간격', path: '/foundation/spacing' },
    ],
  },
  {
    title: 'Layout',
    items: [
      { label: '그리드', path: '/layout/grid' },
      { label: '반응형', path: '/layout/responsive' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: '버튼', path: '/components/button' },
      { label: 'Input', path: '/components/input' },
      { label: 'Textarea', path: '/components/textarea' },
      { label: 'Select', path: '/components/select' },
      { label: 'Checkbox & Radio', path: '/components/checkbox-radio' },
      { label: 'Toggle', path: '/components/toggle' },
      { label: 'File Upload', path: '/components/file' },
      { label: 'Editor', path: '/components/editor' },
      { label: 'Field', path: '/components/field' },
      { label: 'Table', path: '/components/table' },
      { label: 'Tab', path: '/components/tab' },
      { label: 'Pagination', path: '/components/pagination' },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { label: 'Border', path: '/utilities/border' },
      { label: 'Border Radius', path: '/utilities/radius' },
      { label: 'Background & Elevation', path: '/utilities/elevation' },
      { label: 'Display & Visibility', path: '/utilities/display' },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.header}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="Podo UI" width={32} height={32} />
          <h1>Podo UI</h1>
        </Link>
        <ThemeToggle />
      </div>

      <div className={styles.menu}>
        {menuItems.map((section) => (
          <div key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.list}>
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={pathname === item.path ? styles.active : ''}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

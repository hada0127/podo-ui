'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import MobileMenuButton from './MobileMenuButton';
import styles from './Navigation.module.scss';

const menuItems = [
  {
    title: '시작하기',
    items: [
      { label: '소개', path: '/' },
      { label: '설치', path: '/getting-started/installation' },
      { label: '사용법', path: '/getting-started/usage' },
    ],
  },
  {
    title: '기초',
    items: [
      { label: '컬러', path: '/foundation/colors' },
      { label: '타이포그래피', path: '/foundation/typography' },
      { label: '아이콘', path: '/foundation/icons' },
      { label: '간격', path: '/foundation/spacing' },
    ],
  },
  {
    title: '레이아웃',
    items: [
      { label: '그리드', path: '/layout/grid' },
      { label: '반응형', path: '/layout/responsive' },
    ],
  },
  {
    title: '컴포넌트',
    items: [
      { label: '버튼', path: '/components/button' },
      { label: '입력', path: '/components/input' },
      { label: '텍스트 영역', path: '/components/textarea' },
      { label: '선택', path: '/components/select' },
      { label: '체크박스 & 라디오', path: '/components/checkbox-radio' },
      { label: '토글', path: '/components/toggle' },
      { label: '파일 업로드', path: '/components/file' },
      { label: '에디터', path: '/components/editor' },
      { label: '칩', path: '/components/chip' },
      { label: '필드', path: '/components/field' },
      { label: '테이블', path: '/components/table' },
      { label: '탭', path: '/components/tab' },
      { label: '페이지네이션', path: '/components/pagination' },
      { label: '토스트', path: '/components/toast' },
    ],
  },
  {
    title: '유틸리티',
    items: [
      { label: '테두리', path: '/utilities/border' },
      { label: '모서리 반경', path: '/utilities/radius' },
      { label: '배경 & 입체감', path: '/utilities/elevation' },
      { label: '표시 & 가시성', path: '/utilities/display' },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
                      onClick={handleLinkClick}
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
    </>
  );
}

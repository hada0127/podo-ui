'use client';

import styles from './MobileMenuButton.module.scss';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      className={`${styles.menuButton} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
      aria-label="메뉴 열기/닫기"
    >
      {isOpen ? (
        <i className="icon-close"></i>
      ) : (
        <i className="icon-menu"></i>
      )}
    </button>
  );
}

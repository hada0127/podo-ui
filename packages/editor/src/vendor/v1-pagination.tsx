// VENDORED VERBATIM from main `react/molecule/pagination.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { useT } from "../i18n/context.js";
const styles: Record<string, string> = new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : '') });

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  /** Previous button icon class name */
  prevIcon?: string;
  /** Next button icon class name */
  nextIcon?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  prevIcon = 'icon-arrow-left',
  nextIcon = 'icon-arrow-right',
}: PaginationProps) {
  const t = useT();
  const getPageNumbers = () => {
    const pages: number[] = [];
    const startPage = Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      {currentPage > 1 ? (
        <button
          onClick={handlePrevious}
          className={styles.pageButton}
          aria-label={t("v1Pagination.prevPageAriaLabel")}
        >
          <i className={prevIcon}></i>
        </button>
      ) : (
        <div className={styles.pageButtonPlaceholder} />
      )}

      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`${styles.pageButton} ${
            currentPage === pageNum ? styles.active : ''
          }`}
          aria-label={t("v1Pagination.pageAriaLabel", { page: pageNum })}
          aria-current={currentPage === pageNum ? 'page' : undefined}
        >
          {pageNum}
        </button>
      ))}

      {currentPage < totalPages ? (
        <button
          onClick={handleNext}
          className={styles.pageButton}
          aria-label={t("v1Pagination.nextPageAriaLabel")}
        >
          <i className={nextIcon}></i>
        </button>
      ) : (
        <div className={styles.pageButtonPlaceholder} />
      )}
    </div>
  );
}

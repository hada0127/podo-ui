import styles from './pagination.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
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
          aria-label="이전 페이지"
        >
          <i className="icon-arrow-left"></i>
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
          aria-label={`${pageNum}페이지`}
          aria-current={currentPage === pageNum ? 'page' : undefined}
        >
          {pageNum}
        </button>
      ))}

      {currentPage < totalPages ? (
        <button
          onClick={handleNext}
          className={styles.pageButton}
          aria-label="다음 페이지"
        >
          <i className="icon-arrow-right"></i>
        </button>
      ) : (
        <div className={styles.pageButtonPlaceholder} />
      )}
    </div>
  );
}

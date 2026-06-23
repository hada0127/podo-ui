/** Strings for v1-pagination.tsx. en is the source of truth; ko mirrors it. */
export const v1PaginationEn = {
  "v1Pagination.prevPageAriaLabel": "Previous page",
  "v1Pagination.nextPageAriaLabel": "Next page",
  "v1Pagination.pageAriaLabel": "Page {page}",
} as const;

export const v1PaginationKo: Record<keyof typeof v1PaginationEn, string> = {
  "v1Pagination.prevPageAriaLabel": "이전 페이지",
  "v1Pagination.nextPageAriaLabel": "다음 페이지",
  "v1Pagination.pageAriaLabel": "{page}페이지",
};

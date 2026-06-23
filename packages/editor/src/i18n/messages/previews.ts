/** Chrome labels rendered by previews.tsx (the component preview matrix). en is
 *  the source of truth; ko mirrors it. */
export const previewsEn = {
  "previews.variantMatrix": "Variant matrix",
  "previews.preview": "preview",
} as const;

export const previewsKo: Record<keyof typeof previewsEn, string> = {
  "previews.variantMatrix": "변형 매트릭스",
  "previews.preview": "미리보기",
};

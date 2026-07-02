/** Chrome labels rendered by previews.tsx (the component preview matrix). en is
 *  the source of truth; ko mirrors it. */
export const previewsEn = {
  "previews.variantMatrix": "Variant matrix",
  "previews.preview": "preview",
  "previews.addValue": 'Add "{axis}" value',
} as const;

export const previewsKo: Record<keyof typeof previewsEn, string> = {
  "previews.variantMatrix": "변형 매트릭스",
  "previews.preview": "미리보기",
  "previews.addValue": '"{axis}" 값 추가',
};

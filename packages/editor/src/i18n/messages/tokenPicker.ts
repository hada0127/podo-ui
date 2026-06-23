/** Strings for token-picker.tsx. en is the source of truth; ko mirrors it. */
export const tokenPickerEn = {
  "tokenPicker.placeholder": "Insert token…",
  "tokenPicker.ariaLabel": "Insert token reference",
  "tokenPicker.empty": "No tokens match.",
} as const;

export const tokenPickerKo: Record<keyof typeof tokenPickerEn, string> = {
  "tokenPicker.placeholder": "토큰 삽입…",
  "tokenPicker.ariaLabel": "토큰 참조 삽입",
  "tokenPicker.empty": "일치하는 토큰이 없습니다.",
};

/** Strings for fonts.tsx. en is the source of truth; ko mirrors it. */
export const fontsEn = {
  "fonts.previewSampleText": "Aa Bb Cc 123",
} as const;

export const fontsKo: Record<keyof typeof fontsEn, string> = {
  "fonts.previewSampleText": "Aa Bb Cc 123",
};

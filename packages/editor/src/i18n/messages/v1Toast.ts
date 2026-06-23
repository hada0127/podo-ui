/** Strings for v1-toast.tsx. en is the source of truth; ko mirrors it. */
export const v1ToastEn = {
  "v1Toast.closeAriaLabel": "Close",
} as const;

export const v1ToastKo: Record<keyof typeof v1ToastEn, string> = {
  "v1Toast.closeAriaLabel": "닫기",
};

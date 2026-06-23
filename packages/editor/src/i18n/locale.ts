/**
 * Locale primitives for the editor UI.
 *
 * The editor supports two languages: English (`en`) and Korean (`ko`). The
 * active locale is resolved from (1) an explicit host-controlled prop, then
 * (2) a persisted user choice in `localStorage`, then (3) the browser language,
 * finally falling back to English.
 */
export type Locale = "en" | "ko";

export const LOCALES: readonly Locale[] = ["en", "ko"];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ko";
}

const STORAGE_KEY = "podo-editor-locale";

/** Human-facing name for each locale (used by the language toggle). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "한국어",
};

/** Read a persisted locale choice, if any. Safe in non-browser environments. */
export function readStoredLocale(): Locale | undefined {
  if (typeof localStorage === "undefined") return undefined;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : undefined;
  } catch {
    return undefined;
  }
}

/** Persist the chosen locale (best-effort; ignores storage failures). */
export function writeStoredLocale(locale: Locale): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore storage failures (private mode, disabled cookies, etc.).
  }
}

/** Infer a locale from the browser language list. Defaults to English. */
export function browserLocale(): Locale {
  if (typeof navigator !== "undefined") {
    const languages =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language];
    for (const lang of languages) {
      const normalized = (lang ?? "").toLowerCase();
      if (normalized.startsWith("ko")) return "ko";
      if (normalized.startsWith("en")) return "en";
    }
  }
  return "en";
}

/** Stored choice first, then browser language, then English. */
export function detectLocale(): Locale {
  return readStoredLocale() ?? browserLocale();
}

/**
 * React context + hooks for editor localization.
 *
 * Components call `useT()` to get a `t(key, params?)` function. When no
 * `LocaleProvider` is mounted (e.g. a component rendered standalone), `t`
 * falls back to the browser-detected locale so strings still resolve.
 */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { messages, type MessageKey } from "./catalog.js";
import { browserLocale, type Locale } from "./locale.js";

export type TranslateParams = Record<string, string | number>;

export type Translate = (key: MessageKey, params?: TranslateParams) => string;

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

/** Replace `{name}` placeholders in a template with `params` values. */
function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}

/** Resolve a key for a locale, falling back to English then to the key itself. */
export function translate(locale: Locale, key: MessageKey, params?: TranslateParams): string {
  const template = messages[locale][key] ?? messages.en[key] ?? key;
  return interpolate(template, params);
}

const defaultLocale: Locale = browserLocale();

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key, params) => translate(defaultLocale, key, params),
});

export function LocaleProvider({
  locale,
  setLocale,
  children,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  children: ReactNode;
}) {
  const t = useCallback<Translate>((key, params) => translate(locale, key, params), [locale]);
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useT(): Translate {
  return useContext(LocaleContext).t;
}

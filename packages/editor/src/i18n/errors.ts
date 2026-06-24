/**
 * Turn a thrown value into a localized, user-facing message.
 *
 * Resolution order:
 *  1. A `PodoEditError` whose `code` has a catalog entry → localized template.
 *  2. A ZodError-like value (`issues[]`) → each issue localized via its
 *     `params.i18n` code when available, else the raw issue message.
 *  3. Any other `Error` → its English `message`.
 *  4. Nothing usable → the provided fallback key.
 */
import { isPodoEditError } from "@podo/spec";
import { messages } from "./catalog.js";
import type { Translate, TranslateParams } from "./context.js";

function hasKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(messages.en, key);
}

interface ZodLikeIssue {
  message?: string;
  params?: TranslateParams & { i18n?: string };
}

function isZodLike(value: unknown): value is { issues: ZodLikeIssue[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { issues?: unknown }).issues)
  );
}

export function localizeError(error: unknown, t: Translate, fallbackKey: string): string {
  if (isPodoEditError(error)) {
    const key = `error.${error.code}`;
    return hasKey(key) ? t(key, error.params) : error.message;
  }

  if (isZodLike(error)) {
    const parts = error.issues
      .map((issue) => {
        // Guard against malformed issue entries (e.g. a null in the array).
        const code = issue?.params?.i18n;
        const key = code ? `error.${code}` : undefined;
        if (key && hasKey(key)) return t(key, issue?.params);
        return issue?.message ?? "";
      })
      .filter((part) => part.length > 0);
    if (parts.length > 0) return parts.join(" ");
  }

  if (error instanceof Error && error.message) return error.message;
  return t(fallbackKey);
}

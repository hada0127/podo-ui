/**
 * A coded, localizable error for Podo edit/validation failures.
 *
 * The thrown `message` is always a human-readable English string (so existing
 * consumers, logs, and tests keep working unchanged), while `code` + `params`
 * let a UI layer render a localized message instead. UI code should prefer the
 * code when present and fall back to `message` otherwise.
 */
export type PodoErrorParams = Record<string, string | number>;

export class PodoEditError extends Error {
  /** Stable, locale-independent identifier, e.g. "editCore.tokenValueRequired". */
  readonly code: string;
  /** Interpolation values for the localized template, e.g. { name }. */
  readonly params: PodoErrorParams;

  constructor(code: string, message: string, params: PodoErrorParams = {}) {
    super(message);
    this.name = "PodoEditError";
    this.code = code;
    this.params = params;
    // Preserve prototype chain when targeting ES5-ish runtimes / bundlers.
    Object.setPrototypeOf(this, PodoEditError.prototype);
  }
}

/**
 * Structural check so it works across package/bundle boundaries even if two
 * copies of the class exist (duck-types on `name` + `code` + `params`).
 */
export function isPodoEditError(value: unknown): value is PodoEditError {
  if (value instanceof PodoEditError) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { name?: unknown }).name === "PodoEditError" &&
    typeof (value as { code?: unknown }).code === "string" &&
    typeof (value as { params?: unknown }).params === "object"
  );
}

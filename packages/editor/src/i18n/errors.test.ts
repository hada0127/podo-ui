import { describe, expect, it } from "vitest";
import { PodoEditError } from "@podo/spec";
import { localizeError } from "./errors.js";
import { translate, type Translate } from "./context.js";

const tEn: Translate = (key, params) => translate("en", key, params);
const tKo: Translate = (key, params) => translate("ko", key, params);

describe("localizeError", () => {
  it("localizes a PodoEditError by code (distinct per locale)", () => {
    const err = new PodoEditError("editCore.tokenValueRequired", "Token value is required.");
    expect(localizeError(err, tEn, "chrome.error.tokenCreate")).toBe("Token value is required.");
    expect(localizeError(err, tKo, "chrome.error.tokenCreate")).toBe("토큰 값은 필수입니다.");
  });

  it("interpolates PodoEditError params", () => {
    const err = new PodoEditError(
      "editCore.tokenDocNotFound",
      'Token document "3" was not found.',
      { index: 3 }
    );
    expect(localizeError(err, tEn, "chrome.error.tokenCreate")).toContain('"3"');
    expect(localizeError(err, tKo, "chrome.error.tokenCreate")).toContain("토큰 문서");
    expect(localizeError(err, tKo, "chrome.error.tokenCreate")).toContain('"3"');
  });

  it("falls back to the raw message for an unknown PodoEditError code", () => {
    const err = new PodoEditError("no.such.code", "Raw english message.");
    expect(localizeError(err, tKo, "chrome.error.tokenCreate")).toBe("Raw english message.");
  });

  it("localizes ZodError-like issues via params.i18n", () => {
    const zodLike = {
      issues: [
        {
          message: 'Anatomy part name "root" must be unique.',
          params: { i18n: "spec.anatomyUnique", name: "root" },
        },
      ],
    };
    const en = localizeError(zodLike, tEn, "chrome.error.componentMeta");
    const ko = localizeError(zodLike, tKo, "chrome.error.componentMeta");
    expect(en).toContain('"root"');
    expect(ko).toContain("고유해야 합니다");
    expect(ko).toContain('"root"');
  });

  it("uses the raw issue message when no i18n code is present", () => {
    const zodLike = { issues: [{ message: "Some raw zod message." }] };
    expect(localizeError(zodLike, tKo, "chrome.error.componentMeta")).toBe("Some raw zod message.");
  });

  it("returns the message for a plain Error", () => {
    expect(localizeError(new Error("Boom."), tKo, "chrome.error.tokenCreate")).toBe("Boom.");
  });

  it("returns the localized fallback for a non-error throw", () => {
    expect(localizeError(undefined, tKo, "chrome.error.tokenCreate")).toBe(
      translate("ko", "chrome.error.tokenCreate")
    );
    expect(localizeError(null, tKo, "chrome.error.tokenCreate")).toBe(
      translate("ko", "chrome.error.tokenCreate")
    );
  });

  it("does not throw on a malformed issues array and falls back", () => {
    const malformed = { issues: [null, undefined, {}] };
    expect(localizeError(malformed, tKo, "chrome.error.tokenCreate")).toBe(
      translate("ko", "chrome.error.tokenCreate")
    );
  });
});

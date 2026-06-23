import { describe, expect, it } from "vitest";
import { messages } from "./catalog.js";
import { browserLocale, detectLocale, isLocale, LOCALES } from "./locale.js";
import { translate } from "./context.js";

describe("i18n catalog", () => {
  it("has identical key sets for every locale", () => {
    const enKeys = Object.keys(messages.en).sort();
    for (const locale of LOCALES) {
      const keys = Object.keys(messages[locale]).sort();
      expect(keys, `locale "${locale}" key set must match en`).toEqual(enKeys);
    }
  });

  it("has no empty values", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(messages[locale])) {
        expect(value.length, `${locale}:${key} must not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the same {param} placeholders across locales", () => {
    const placeholders = (value: string): string[] => (value.match(/\{(\w+)\}/g) ?? []).sort();
    for (const key of Object.keys(messages.en)) {
      const en = placeholders(messages.en[key] ?? "");
      for (const locale of LOCALES) {
        expect(placeholders(messages[locale][key] ?? ""), `${locale}:${key} placeholders`).toEqual(
          en
        );
      }
    }
  });
});

describe("translate", () => {
  it("interpolates params", () => {
    expect(translate("en", "chrome.error.colorSetExists", { name: "brand" })).toContain("brand");
    expect(translate("ko", "chrome.error.colorSetExists", { name: "brand" })).toContain("brand");
  });

  it("returns the key for an unknown key", () => {
    expect(translate("en", "definitely.missing.key")).toBe("definitely.missing.key");
  });

  it("renders distinct languages for the same key", () => {
    expect(translate("en", "chrome.panel.tokens")).not.toBe(translate("ko", "chrome.panel.tokens"));
  });
});

describe("locale detection", () => {
  it("recognizes valid locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("falls back to a supported locale", () => {
    expect(LOCALES).toContain(browserLocale());
    expect(LOCALES).toContain(detectLocale());
  });
});

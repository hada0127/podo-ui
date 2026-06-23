import type { CSSProperties } from "react";
import type { DesignToken, EmbeddedFontAsset } from "@podo/spec";
import {
  parseEditorTokenExtensions,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";
import { tokenVariationName } from "./token-lookup.js";
import { fontPreviewMetaStyle, fontPreviewSampleStyle, fontPreviewTextStyle } from "./styles.js";
import { useT } from "./i18n/context.js";

export function getEmbeddedFontAssetFromDraft(
  draft: EditorTokenDraft
): EmbeddedFontAsset | undefined {
  try {
    return getEmbeddedFontAssetFromExtensions(parseEditorTokenExtensions(draft.extensionsText));
  } catch {
    return undefined;
  }
}

export const FONT_FILE_ACCEPT = ".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf";

export function fontFormatFromFileName(fileName: string): EmbeddedFontAsset["format"] {
  const extension = fileName.split(".").at(-1)?.toLowerCase();
  if (extension === "woff2") {
    return "woff2";
  }
  if (extension === "woff") {
    return "woff";
  }
  if (extension === "ttf") {
    return "truetype";
  }
  if (extension === "otf") {
    return "opentype";
  }
  throw new Error("Font files must be .woff, .woff2, .ttf, or .otf.");
}

export function createEmbeddedFontAsset(input: {
  family: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
}): EmbeddedFontAsset {
  const family = input.family.trim();
  if (!family) {
    throw new Error("Font family is required before attaching a font file.");
  }
  if (!input.dataUrl.startsWith("data:")) {
    throw new Error("Attached font files must be stored as data URLs.");
  }
  return {
    kind: "font",
    source: "embedded",
    family,
    fileName: input.fileName,
    format: fontFormatFromFileName(input.fileName),
    mimeType: input.mimeType || mimeTypeForFontFormat(fontFormatFromFileName(input.fileName)),
    dataUrl: input.dataUrl,
  };
}

export function isEmbeddedFontAsset(value: unknown): value is EmbeddedFontAsset {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    value !== null &&
    (value as EmbeddedFontAsset).kind === "font" &&
    (value as EmbeddedFontAsset).source === "embedded" &&
    typeof (value as EmbeddedFontAsset).family === "string" &&
    typeof (value as EmbeddedFontAsset).fileName === "string" &&
    typeof (value as EmbeddedFontAsset).dataUrl === "string"
  );
}

export function upsertEmbeddedFontAssetExtension(
  extensions: DesignToken["$extensions"] | undefined,
  asset: EmbeddedFontAsset
): DesignToken["$extensions"] {
  return {
    ...(extensions ?? {}),
    podo: {
      ...(extensions?.podo ?? {}),
      fontAsset: asset,
    },
  };
}

export function removeEmbeddedFontAssetExtension(
  extensions: DesignToken["$extensions"] | undefined
): DesignToken["$extensions"] | undefined {
  if (!extensions?.podo?.fontAsset) {
    return extensions;
  }
  const nextPodo = { ...extensions.podo };
  delete nextPodo.fontAsset;
  if (!Object.keys(nextPodo).length) {
    const withoutPodo: DesignToken["$extensions"] = { ...extensions };
    delete withoutPodo.podo;
    return Object.keys(withoutPodo).length ? withoutPodo : undefined;
  }
  return { ...extensions, podo: nextPodo };
}

export function getEmbeddedFontAssetFromExtensions(
  extensions: DesignToken["$extensions"] | undefined
): EmbeddedFontAsset | undefined {
  const asset = extensions?.podo?.fontAsset;
  return isEmbeddedFontAsset(asset) ? asset : undefined;
}

/** The numeric font weights a fontFamily token declares it ships, if any. */
export function getSupportedFontWeightsFromExtensions(
  extensions: DesignToken["$extensions"] | undefined
): number[] | undefined {
  const weights = extensions?.podo?.weights;
  if (!Array.isArray(weights)) {
    return undefined;
  }
  return weights.filter((value): value is number => typeof value === "number");
}

/** Write the supported-weight set onto a fontFamily token's podo extensions. */
export function setSupportedFontWeightsExtension(
  extensions: DesignToken["$extensions"] | undefined,
  weights: number[]
): DesignToken["$extensions"] {
  const sorted = [...new Set(weights)].sort((a, b) => a - b);
  return {
    ...(extensions ?? {}),
    podo: {
      ...(extensions?.podo ?? {}),
      weights: sorted,
    },
  };
}

export function findEmbeddedFontAssetForFamily(
  records: EditorTokenRecord[],
  family: string
): EmbeddedFontAsset | undefined {
  return records
    .filter((record) => inferFontFamilyName(record.token.$value, record.path) === family)
    .map((record) => getEmbeddedFontAssetFromExtensions(record.token.$extensions))
    .find(Boolean);
}

export function inferFontFamilyName(value: unknown, path: string): string {
  if (typeof value === "string" && value.trim() && !/^\{[^}]+\}$/.test(value.trim())) {
    return value.trim();
  }
  return tokenVariationName(path)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function inferFontFamilyNameFromDraft(draft: EditorTokenDraft): string {
  const valueText = draft.valueText.trim();
  if (valueText && !/^\{[^}]+\}$/.test(valueText)) {
    return valueText;
  }
  return inferFontFamilyName(valueText, draft.path);
}

export async function createEmbeddedFontAssetFromFile(
  file: File,
  family: string
): Promise<EmbeddedFontAsset> {
  const sourceFormat = fontFormatFromFileName(file.name);
  // Auto-convert SFNT fonts (ttf/otf) to woff2 so the embedded asset is the
  // web-optimal, smallest format. Files that are already woff2 (or the rarer
  // woff, which isn't SFNT and can't be re-compressed here) are embedded as-is.
  if (sourceFormat === "truetype" || sourceFormat === "opentype") {
    try {
      const { compress } = await import("woff2-encoder");
      const sfnt = new Uint8Array(await file.arrayBuffer());
      // Copy into a fresh ArrayBuffer-backed view so it satisfies BlobPart.
      const woff2 = new Uint8Array(await compress(sfnt));
      const fileName = `${file.name.replace(/\.(ttf|otf)$/i, "")}.woff2`;
      const dataUrl = await readFileAsDataUrl(new File([woff2], fileName, { type: "font/woff2" }));
      return createEmbeddedFontAsset({ family, fileName, mimeType: "font/woff2", dataUrl });
    } catch {
      // Conversion unavailable (e.g. encoder failed to load) — embed the original.
    }
  }
  const dataUrl = await readFileAsDataUrl(file);
  return createEmbeddedFontAsset({
    family,
    fileName: file.name,
    mimeType: file.type || mimeTypeForFontFormat(sourceFormat),
    dataUrl,
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Font file could not be converted to a data URL."));
      }
    });
    reader.addEventListener("error", () => reject(new Error("Font file could not be read.")));
    reader.readAsDataURL(file);
  });
}

function mimeTypeForFontFormat(format: EmbeddedFontAsset["format"]): string {
  if (format === "woff2") {
    return "font/woff2";
  }
  if (format === "woff") {
    return "font/woff";
  }
  if (format === "truetype") {
    return "font/ttf";
  }
  return "font/otf";
}

function fontFaceName(asset: EmbeddedFontAsset): string {
  return `PodoAttachedFont-${hashString(`${asset.family}:${asset.fileName}:${asset.dataUrl}`)}`;
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function escapeCssString(value: string): string {
  return value.replace(/["\\]/g, "\\$&");
}

export function FontPreviewSample({
  family,
  asset,
  text,
  style,
  showMeta = true,
}: {
  family: string;
  asset?: EmbeddedFontAsset | undefined;
  text?: string | undefined;
  style?: CSSProperties | undefined;
  showMeta?: boolean | undefined;
}) {
  const t = useT();
  const sampleText = text ?? t("fonts.previewSampleText");
  const attachedName = asset ? fontFaceName(asset) : undefined;
  const fontFamily = attachedName
    ? `"${escapeCssString(attachedName)}", ui-sans-serif, system-ui, sans-serif`
    : `${family}, ui-sans-serif, system-ui, sans-serif`;
  return (
    <div style={fontPreviewSampleStyle}>
      {asset ? (
        <style>
          {`@font-face{font-family:"${escapeCssString(attachedName ?? "")}";src:url("${escapeCssString(
            asset.dataUrl
          )}") format("${asset.format}");font-display:swap;}`}
        </style>
      ) : null}
      <span style={{ ...fontPreviewTextStyle, ...style, fontFamily }}>{sampleText}</span>
      {showMeta ? (
        <small style={fontPreviewMetaStyle}>{asset ? asset.fileName : family}</small>
      ) : null}
    </div>
  );
}

import type { CSSProperties } from "react";
import type { DesignToken, EmbeddedFontAsset } from "@podo/spec";
import {
  parseEditorTokenExtensions,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";
import { tokenVariationName } from "./token-lookup.js";
import {
  fontAttachButtonStyle,
  fontAttachmentActionsStyle,
  fontAttachmentHeaderStyle,
  fontAttachmentPanelStyle,
  fontPreviewMetaStyle,
  fontPreviewSampleStyle,
  fontPreviewTextStyle,
  fontRemoveButtonStyle,
  hiddenFileInputStyle,
} from "./styles.js";

export function renderFontAttachmentDraftEditor(input: {
  draft: EditorTokenDraft;
  onAttach(file: File): Promise<void>;
  onRemove(): void;
}) {
  const asset = getEmbeddedFontAssetFromDraft(input.draft);
  return (
    <div style={fontAttachmentPanelStyle}>
      <div style={fontAttachmentHeaderStyle}>
        <span>{asset ? asset.fileName : "No font file attached"}</span>
        {asset ? <small>{asset.format}</small> : null}
      </div>
      <div style={fontAttachmentActionsStyle}>
        <label style={fontAttachButtonStyle}>
          Attach font file
          <input
            aria-label="Attach font file"
            type="file"
            accept={FONT_FILE_ACCEPT}
            style={hiddenFileInputStyle}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) {
                void input.onAttach(file);
              }
            }}
          />
        </label>
        {asset ? (
          <button type="button" style={fontRemoveButtonStyle} onClick={input.onRemove}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

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
  fontFormatFromFileName(file.name);
  const dataUrl = await readFileAsDataUrl(file);
  return createEmbeddedFontAsset({
    family,
    fileName: file.name,
    mimeType: file.type || mimeTypeForFontFormat(fontFormatFromFileName(file.name)),
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
  text = "Aa Bb Cc 123",
  style,
  showMeta = true,
}: {
  family: string;
  asset?: EmbeddedFontAsset | undefined;
  text?: string | undefined;
  style?: CSSProperties | undefined;
  showMeta?: boolean | undefined;
}) {
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
      <span style={{ ...fontPreviewTextStyle, ...style, fontFamily }}>{text}</span>
      {showMeta ? (
        <small style={fontPreviewMetaStyle}>{asset ? asset.fileName : family}</small>
      ) : null}
    </div>
  );
}

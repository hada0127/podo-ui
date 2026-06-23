/**
 * Assembled message catalog. Each UI domain contributes a namespaced block of
 * keys via `messages/<domain>.ts`. English is the source of truth for the key
 * set; Korean mirrors it. The en/ko key parity is asserted in i18n.test.ts.
 *
 * To add a domain: create `messages/<domain>.ts` exporting `<domain>En` and
 * `<domain>Ko`, then import and spread it below.
 */
import type { Locale } from "./locale.js";
import { chromeEn, chromeKo } from "./messages/chrome.js";
import { errorsEn, errorsKo } from "./messages/errors.js";
import { buildPanelEn, buildPanelKo } from "./messages/buildPanel.js";
import { canvasEn, canvasKo } from "./messages/canvas.js";
import { canvasPanelEn, canvasPanelKo } from "./messages/canvasPanel.js";
import { componentsEn, componentsKo } from "./messages/components.js";
import { fontsEn, fontsKo } from "./messages/fonts.js";
import { iconEditorEn, iconEditorKo } from "./messages/iconEditor.js";
import { iconsPanelEn, iconsPanelKo } from "./messages/iconsPanel.js";
import { layersEn, layersKo } from "./messages/layers.js";
import { previewsEn, previewsKo } from "./messages/previews.js";
import { projectPanelEn, projectPanelKo } from "./messages/projectPanel.js";
import { tokenEditorEn, tokenEditorKo } from "./messages/tokenEditor.js";
import { tokenPickerEn, tokenPickerKo } from "./messages/tokenPicker.js";
import { tokensPanelEn, tokensPanelKo } from "./messages/tokensPanel.js";
import { v1ChipEn, v1ChipKo } from "./messages/v1Chip.js";
import { v1EditorEn, v1EditorKo } from "./messages/v1Editor.js";
import { v1PaginationEn, v1PaginationKo } from "./messages/v1Pagination.js";
import { v1ToastEn, v1ToastKo } from "./messages/v1Toast.js";

export type MessageTable = Record<string, string>;

export const messages: Record<Locale, MessageTable> = {
  en: {
    ...chromeEn,
    ...errorsEn,
    ...buildPanelEn,
    ...canvasEn,
    ...canvasPanelEn,
    ...componentsEn,
    ...fontsEn,
    ...iconEditorEn,
    ...iconsPanelEn,
    ...layersEn,
    ...previewsEn,
    ...projectPanelEn,
    ...tokenEditorEn,
    ...tokenPickerEn,
    ...tokensPanelEn,
    ...v1ChipEn,
    ...v1EditorEn,
    ...v1PaginationEn,
    ...v1ToastEn,
  },
  ko: {
    ...chromeKo,
    ...errorsKo,
    ...buildPanelKo,
    ...canvasKo,
    ...canvasPanelKo,
    ...componentsKo,
    ...fontsKo,
    ...iconEditorKo,
    ...iconsPanelKo,
    ...layersKo,
    ...previewsKo,
    ...projectPanelKo,
    ...tokenEditorKo,
    ...tokenPickerKo,
    ...tokensPanelKo,
    ...v1ChipKo,
    ...v1EditorKo,
    ...v1PaginationKo,
    ...v1ToastKo,
  },
};

/** A catalog key. Kept as `string` so domains can be assembled incrementally. */
export type MessageKey = string;

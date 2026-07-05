import { useState, type PointerEvent } from "react";
import type { DesignToken } from "@podo/spec";
import { useLocale, useT, type Translate } from "./i18n/context.js";
import { AnchoredPortal } from "./popover.js";
import { EditorTokenRecord, serializeEditorTokenValue } from "./spec-editing.js";
import type { TokenUsage } from "./token-usage.js";
import { TokenPicker, type TokenPickerOption } from "./token-picker.js";
import {
  formatColorValue,
  hsvToRgb,
  isCssColorValue,
  isHexColorInputValue,
  isTypographyValue,
  parseColor,
  resolveTokenPath,
  resolveTokenValue,
  responsiveSizePc,
  rgbToHsv,
  tokenVariationName,
  typographyToCss,
  type HsvColor,
  type ResponsiveSize,
  type RgbaColor,
  type TokenLookup,
} from "./token-lookup.js";
import {
  colorCounterpartPath,
  TOKEN_REFERENCE_LIST_ID,
  tokenRecordKey,
  type ColorComparisonMatrixModel,
  type ComponentTokenEditorModel,
  type TokenMatrixModel,
  type TypographyTokenField,
  type TypographyWorkspaceModel,
} from "./token-model.js";
import {
  FONT_FILE_ACCEPT,
  FontPreviewSample,
  findEmbeddedFontAssetForFamily,
  getEmbeddedFontAssetFromExtensions,
  getSupportedFontWeightsFromExtensions,
  inferFontFamilyName,
} from "./fonts.js";
import {
  cardHeaderStyle,
  cardStyle,
  typographyCardStyle,
  typographyCardHeaderStyle,
  typographyCardMetaStyle,
  fontSpecimenBadgeStyle,
  fontSpecimenFieldStyle,
  fontSpecimenAssetRowStyle,
  familyListStyle,
  familyCardStyle,
  familyCardSpecimenStyle,
  familyCardBodyStyle,
  familyAddButtonStyle,
  familyWeightToggleRowStyle,
  familyWeightToggleLabelStyle,
  familyWeightChipStyle,
  familyWeightChipOnStyle,
  familyWeightChipOffStyle,
  styleCardHeaderActionsStyle,
  colorMatrixHeaderActionsStyle,
  colorVariationDeleteStyle,
  colorVariationDeleteCellStyle,
  colorGroupActionsStyle,
  colorGroupRenameButtonStyle,
  colorGroupRenameInputStyle,
  colorDeleteOverlayStyle,
  colorDeleteDialogStyle,
  colorDeleteTitleStyle,
  colorDeleteUsageListStyle,
  colorDeleteFieldLabelStyle,
  colorDeleteSelectStyle,
  colorDeleteActionsStyle,
  colorDeleteCancelStyle,
  colorDeleteConfirmStyle,
  typographyAddButtonStyle,
  typographyDeleteButtonStyle,
  scaleRampStyle,
  scaleRampRowStyle,
  scaleRampSpecimenStyle,
  scaleRampRailStyle,
  scaleRampDeleteStyle,
  scaleChipLabelStyle,
  scalarSpecimenStyle,
  scalarSpecimenBarStyle,
  scalarSpecimenBoxStyle,
  scalarSpecimenEmptyStyle,
  styleCardGridStyle,
  styleCardStyle,
  styleCardHeaderStyle,
  styleCardTitleStyle,
  styleCardNameStyle,
  typographyStyleSummaryStyle,
  styleSpecimenStyle,
  styleFieldsGridStyle,
  styleFieldStyle,
  styleFieldWideStyle,
  styleFieldLabelStyle,
  colorComparisonGridStyle,
  colorGroupCardStyle,
  colorGroupColHeadStyle,
  colorGroupCornerStyle,
  colorGroupHeaderStyle,
  colorGroupTableStyle,
  colorPickerAlphaOverlayStyle,
  colorPickerAlphaTrackStyle,
  colorPickerBackdropStyle,
  colorPickerBarThumbStyle,
  colorPickerHueStyle,
  colorPickerPopoverStyle,
  colorPickerPreviewStyle,
  colorPickerPreviewSwatchStyle,
  colorPickerStackStyle,
  colorPickerSvStyle,
  colorPickerSvThumbStyle,
  colorPickerWrapStyle,
  colorSchemeLegendStyle,
  colorSchemeLegendSwatchDarkStyle,
  colorSchemeLegendSwatchLightStyle,
  colorSideCellStyle,
  colorSideEmptyButtonStyle,
  colorSideInputStyle,
  colorSideRowStyle,
  colorSideStyle,
  colorSwatchTriggerStyle,
  colorTokenToggleStyle,
  colorTokenPickerAnchorStyle,
  colorTokenPickerPopoverStyle,
  colorVariationHeadStyle,
  colorVariationRowActiveStyle,
  codeStyle,
  componentDimensionPreviewBarStyle,
  componentNumberPreviewFillStyle,
  componentNumberPreviewTrackStyle,
  componentTokenCellStyle,
  componentTokenGroupHeaderStyle,
  componentTokenGroupListStyle,
  componentTokenGroupStyle,
  componentTokenHeaderCellStyle,
  componentTokenPreviewInlineStyle,
  componentTokenRowHeaderStyle,
  componentTokenTableScrollStyle,
  componentTokenTableStyle,
  emptyStatePanelStyle,
  fontAssetEmptyStyle,
  fontAssetNameStyle,
  fontAttachButtonStyle,
  fontRemoveButtonStyle,
  hiddenFileInputStyle,
  inlineHelpStyle,
  tokenMatrixCellActiveStyle,
  tokenMatrixCellStyle,
  tokenMatrixColorCellStyle,
  tokenMatrixColorFallbackSwatchStyle,
  tokenMatrixColorPickerStyle,
  tokenMatrixEmptyCellStyle,
  tokenMatrixHeaderCellStyle,
  tokenMatrixInputActiveStyle,
  tokenMatrixObjectCellStyle,
  tokenMatrixPanelStyle,
  tokenMatrixRowHeaderStyle,
  tokenMatrixScrollStyle,
  tokenMatrixTableStyle,
  tokenMatrixValueInputStyle,
  typographyInlineInputStyle,
  typographyTokenPathButtonActiveStyle,
  typographyTokenPathButtonStyle,
  typographyWorkspaceCountStyle,
  typographyWorkspaceHeaderStyle,
  typographyWorkspaceStyle,
} from "./styles.js";

export interface TypographyEditorInput {
  t: Translate;
  model: TypographyWorkspaceModel;
  selectedTokenKey: string | undefined;
  lookup: TokenLookup;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
  onCommitTypographyField(
    record: EditorTokenRecord,
    field: TypographyTokenField,
    valueText: string
  ): void;
  onAttachFont(record: EditorTokenRecord, file: File): Promise<void>;
  onRemoveFontAsset(record: EditorTokenRecord): void;
  onCreateToken?(input: { type: DesignToken["$type"]; path: string; valueText: string }): void;
  onDeleteToken?(record: EditorTokenRecord): void;
  onToggleFamilyWeight?(
    record: EditorTokenRecord,
    weightValue: number,
    defaultWeights: number[]
  ): void;
}

const STANDARD_WEIGHTS: Array<{ label: string; value: number }> = [
  { label: "thin", value: 100 },
  { label: "extralight", value: 200 },
  { label: "light", value: 300 },
  { label: "regular", value: 400 },
  { label: "medium", value: 500 },
  { label: "semibold", value: 600 },
  { label: "bold", value: 700 },
  { label: "extrabold", value: 800 },
  { label: "black", value: 900 },
];

/** Pick a unique font.size.* token (one step above the current max, in px). */
function nextSizeToken(
  sizes: EditorTokenRecord[],
  lookup: TokenLookup
): { path: string; valueText: string } {
  const used = sizes
    .map((record) => sizePx(record, lookup))
    .filter((value) => Number.isFinite(value));
  const usedPaths = new Set(sizes.map((record) => record.path));
  let px = used.length ? Math.round(Math.max(...used)) + 2 : 16;
  while (usedPaths.has(`font.size.${px}`)) {
    px += 1;
  }
  return { path: `font.size.${px}`, valueText: `${px}px` };
}

/** Resolve a token's value to a pixel number (NaN-safe), for sorting/preview. */
function scalarPx(record: EditorTokenRecord, lookup: TokenLookup): number {
  const value = parseFloat(String(resolveTokenValue(lookup, record.token.$value)));
  return Number.isFinite(value) ? value : 0;
}

/** Pick a unique `<type>.scale.N` token, one step above the current max value. */
function nextScalarToken(
  type: DesignToken["$type"],
  records: EditorTokenRecord[],
  lookup: TokenLookup
): { path: string; valueText: string } {
  const used = records.map((record) => scalarPx(record, lookup)).filter((value) => value > 0);
  const usedPaths = new Set(records.map((record) => record.path));
  const px = used.length ? Math.round(Math.max(...used)) + 4 : type === "radius" ? 8 : 16;
  let index = 1;
  while (usedPaths.has(`${type}.scale.${index}`)) {
    index += 1;
  }
  return { path: `${type}.scale.${index}`, valueText: `${px}px` };
}

/** A left-aligned visual sized to the token's value — bar for spacing, box for radius. */
function renderScalarSpecimen(type: DesignToken["$type"], px: number) {
  if (type === "radius") {
    return (
      <span style={scalarSpecimenStyle}>
        <span style={{ ...scalarSpecimenBoxStyle, borderRadius: Math.min(Math.max(px, 0), 28) }} />
      </span>
    );
  }
  return (
    <span style={scalarSpecimenStyle}>
      <span style={{ ...scalarSpecimenBarStyle, width: Math.min(Math.max(px, 2), 320) }} />
    </span>
  );
}

export interface ScalarScaleEditorInput {
  t: Translate;
  type: DesignToken["$type"];
  label: string;
  records: EditorTokenRecord[];
  lookup: TokenLookup;
  selectedTokenKey: string | undefined;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
  onCreateToken?(input: { type: DesignToken["$type"]; path: string; valueText: string }): void;
  onDeleteToken?(record: EditorTokenRecord): void;
}

/**
 * A flat add/edit/delete list for scalar scale tokens (spacing, radius). The base
 * token page keeps only the project-wide scale values here — like the typography
 * scale — instead of the dense matrix used for component-bound props.
 */
export function renderScalarScaleEditor(input: ScalarScaleEditorInput) {
  const sorted = [...input.records].sort(
    (a, b) => scalarPx(a, input.lookup) - scalarPx(b, input.lookup)
  );
  return (
    <div style={typographyWorkspaceStyle}>
      <section style={typographyCardStyle}>
        <div style={typographyCardHeaderStyle}>
          <span>{input.label}</span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={typographyCardMetaStyle}>
              {input.t("tokenEditor.tokenCount", { count: input.records.length })}
            </span>
            {input.onCreateToken ? (
              <button
                type="button"
                style={typographyAddButtonStyle}
                onClick={() =>
                  input.onCreateToken?.({
                    type: input.type,
                    ...nextScalarToken(input.type, input.records, input.lookup),
                  })
                }
              >
                {input.t("tokenEditor.newScalar", { label: input.label.toLowerCase() })}
              </button>
            ) : null}
          </span>
        </div>
        {sorted.length ? (
          <div style={scaleRampStyle}>
            {sorted.map((record) => {
              const valueText = serializeEditorTokenValue(record.token.$value);
              const resolved = String(resolveTokenValue(input.lookup, record.token.$value));
              return (
                <div key={tokenRecordKey(record)} style={scaleRampRowStyle}>
                  {renderScalarSpecimen(input.type, scalarPx(record, input.lookup))}
                  <div style={scaleRampRailStyle}>
                    <span style={scaleChipLabelStyle}>
                      {tokenVariationName(record.path)} · {resolved}
                    </span>
                    {renderScalarTypographyInput(record, valueText, input)}
                    {input.onDeleteToken ? (
                      <button
                        type="button"
                        style={scaleRampDeleteStyle}
                        aria-label={input.t("tokenEditor.deleteAria", { path: record.path })}
                        title={input.t("tokenEditor.deleteAria", { path: record.path })}
                        onClick={() => input.onDeleteToken?.(record)}
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={scalarSpecimenEmptyStyle}>
            {input.t("tokenEditor.emptyScalar", { label: input.label.toLowerCase() })}
          </p>
        )}
      </section>
    </div>
  );
}

/** The embedded font file attached to the weight token matching a given weight. */
function findFontAssetForWeight(
  weights: EditorTokenRecord[],
  fontWeight: string | number,
  lookup: TokenLookup
) {
  const target = String(fontWeight).trim();
  for (const record of weights) {
    const resolved = String(resolveTokenValue(lookup, record.token.$value)).trim();
    if (resolved === target) {
      const asset = getEmbeddedFontAssetFromExtensions(record.token.$extensions);
      if (asset) {
        return asset;
      }
    }
  }
  return undefined;
}

/** Pick a unique font.family.* token for a brand-new family. */
function nextFamilyToken(families: EditorTokenRecord[]): { path: string; valueText: string } {
  const usedPaths = new Set(families.map((record) => record.path));
  let index = 1;
  while (usedPaths.has(`font.family.custom-${index}`)) {
    index += 1;
  }
  return { path: `font.family.custom-${index}`, valueText: "Custom, sans-serif" };
}

/** Pick a unique typography.* token, seeded as a readable body style. */
function nextStyleToken(
  styles: EditorTokenRecord[],
  primaryFamily: string
): { path: string; valueText: string } {
  const usedPaths = new Set(styles.map((record) => record.path));
  let index = 1;
  while (usedPaths.has(`typography.custom-${index}`)) {
    index += 1;
  }
  return {
    path: `typography.custom-${index}`,
    valueText: JSON.stringify({
      fontFamily: primaryFamily,
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: 400,
      letterSpacing: "0px",
    }),
  };
}

export function renderTypographyTokenEditor(input: TypographyEditorInput) {
  const hasTypographyTokens =
    input.model.families.length ||
    input.model.weights.length ||
    input.model.sizes.length ||
    input.model.styles.length;

  if (!hasTypographyTokens) {
    return null;
  }

  const model = input.model;
  const sortedSizes = [...model.sizes].sort(
    (a, b) => sizePx(a, input.lookup) - sizePx(b, input.lookup)
  );
  const primaryFamilyName = model.families[0]
    ? inferFontFamilyName(model.families[0].token.$value, model.families[0].path)
    : "Inter";
  // The numeric weights currently defined as tokens — the default "supported" set
  // for a family that hasn't toggled its own weights yet.
  const definedWeightValues = model.weights
    .map((record) => Number(serializeEditorTokenValue(record.token.$value)))
    .filter((value) => Number.isFinite(value));

  return (
    <div style={typographyWorkspaceStyle}>
      <div style={typographyWorkspaceHeaderStyle}>
        <div>
          <strong>{input.t("tokenEditor.typographyTitle")}</strong>
          <p style={inlineHelpStyle}>{input.t("tokenEditor.typographyHelp")}</p>
        </div>
        <div style={typographyWorkspaceCountStyle}>
          <span>{input.t("tokenEditor.familiesCount", { count: model.families.length })}</span>
          <span>{input.t("tokenEditor.sizesCount", { count: model.sizes.length })}</span>
          <span>{input.t("tokenEditor.stylesCount", { count: model.styles.length })}</span>
        </div>
      </div>

      {model.families.length || input.onCreateToken ? (
        <section style={typographyCardStyle}>
          <div style={typographyCardHeaderStyle}>
            <span>{input.t("tokenEditor.fontFamilies")}</span>
            <span style={typographyCardMetaStyle}>
              {input.t("tokenEditor.familiesCount", { count: model.families.length })}
            </span>
          </div>
          <div style={familyListStyle}>
            {model.families.map((record) => {
              const valueText = serializeEditorTokenValue(record.token.$value);
              const family = inferFontFamilyName(record.token.$value, record.path);
              const asset = getEmbeddedFontAssetFromExtensions(record.token.$extensions);
              const supported =
                getSupportedFontWeightsFromExtensions(record.token.$extensions) ??
                definedWeightValues;
              return (
                <article key={tokenRecordKey(record)} style={familyCardStyle}>
                  <div style={familyCardSpecimenStyle}>
                    {asset ? <span style={fontSpecimenBadgeStyle} /> : null}
                    <FontPreviewSample family={family} asset={asset} showMeta={false} />
                    {renderTokenPathButton(record, input)}
                  </div>
                  <div style={familyCardBodyStyle}>
                    <label style={fontSpecimenFieldStyle}>
                      <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldFamily")}</span>
                      <input
                        key={`${record.path}:${valueText}`}
                        aria-label={input.t("tokenEditor.familyNameAria", { path: record.path })}
                        style={typographyInlineInputStyle}
                        defaultValue={valueText}
                        onFocus={() => input.onSelect(record)}
                        onBlur={(event) => {
                          if (event.currentTarget.value !== valueText) {
                            input.onCommitValue(record, event.currentTarget.value);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    </label>
                    <div style={fontSpecimenAssetRowStyle}>
                      <label style={fontAttachButtonStyle}>
                        {input.t("tokenEditor.attach")}
                        <input
                          aria-label={input.t("tokenEditor.familyFileAria", { path: record.path })}
                          type="file"
                          accept={FONT_FILE_ACCEPT}
                          style={hiddenFileInputStyle}
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            event.currentTarget.value = "";
                            if (file) {
                              void input.onAttachFont(record, file);
                            }
                          }}
                        />
                      </label>
                      {asset ? (
                        <>
                          <span style={fontAssetNameStyle}>{asset.fileName}</span>
                          <button
                            type="button"
                            style={fontRemoveButtonStyle}
                            onClick={() => input.onRemoveFontAsset(record)}
                          >
                            {input.t("tokenEditor.remove")}
                          </button>
                        </>
                      ) : (
                        <span style={fontAssetEmptyStyle}>{input.t("tokenEditor.noFile")}</span>
                      )}
                      {input.onDeleteToken ? (
                        <button
                          type="button"
                          style={typographyDeleteButtonStyle}
                          onClick={() => input.onDeleteToken?.(record)}
                        >
                          {input.t("tokenEditor.delete")}
                        </button>
                      ) : null}
                    </div>
                    {input.onToggleFamilyWeight ? (
                      <div>
                        <span style={familyWeightToggleLabelStyle}>
                          {input.t("tokenEditor.supportedWeights")}
                        </span>
                        <div style={familyWeightToggleRowStyle}>
                          {STANDARD_WEIGHTS.map((weight) => {
                            const on = supported.includes(weight.value);
                            return (
                              <button
                                key={weight.value}
                                type="button"
                                aria-pressed={on}
                                aria-label={input.t("tokenEditor.weightToggleAria", {
                                  family,
                                  label: weight.label,
                                  value: weight.value,
                                  state: on
                                    ? input.t("tokenEditor.weightToggleOn")
                                    : input.t("tokenEditor.weightToggleOff"),
                                })}
                                title={input.t("tokenEditor.weightToggleTitle", {
                                  label: weight.label,
                                  value: weight.value,
                                })}
                                style={{
                                  ...familyWeightChipStyle,
                                  ...(on ? familyWeightChipOnStyle : familyWeightChipOffStyle),
                                  fontWeight: weight.value,
                                }}
                                onClick={() =>
                                  input.onToggleFamilyWeight?.(
                                    record,
                                    weight.value,
                                    definedWeightValues
                                  )
                                }
                              >
                                {weight.value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          {input.onCreateToken ? (
            <button
              type="button"
              style={familyAddButtonStyle}
              onClick={() =>
                input.onCreateToken?.({
                  type: "fontFamily",
                  ...nextFamilyToken(model.families),
                })
              }
            >
              {input.t("tokenEditor.newFamily")}
            </button>
          ) : null}
        </section>
      ) : null}

      {model.sizes.length || input.onCreateToken ? (
        <section style={typographyCardStyle}>
          <div style={typographyCardHeaderStyle}>
            <span>{input.t("tokenEditor.scale")}</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={typographyCardMetaStyle}>
                {input.t("tokenEditor.sizesCount", { count: model.sizes.length })}
              </span>
              {input.onCreateToken ? (
                <button
                  type="button"
                  style={typographyAddButtonStyle}
                  onClick={() =>
                    input.onCreateToken?.({
                      type: "dimension",
                      ...nextSizeToken(model.sizes, input.lookup),
                    })
                  }
                >
                  {input.t("tokenEditor.newSize")}
                </button>
              ) : null}
            </span>
          </div>
          <div style={scaleRampStyle}>
            {sortedSizes.map((record) => {
              const valueText = serializeEditorTokenValue(record.token.$value);
              const resolved = resolveTokenValue(input.lookup, record.token.$value);
              return (
                <div key={tokenRecordKey(record)} style={scaleRampRowStyle}>
                  <span style={{ ...scaleRampSpecimenStyle, fontSize: String(resolved) }}>
                    {input.t("tokenEditor.specimenText")}
                  </span>
                  <div style={scaleRampRailStyle}>
                    <span style={scaleChipLabelStyle}>
                      {tokenVariationName(record.path)} · {String(resolved)}
                    </span>
                    {renderScalarTypographyInput(record, valueText, input)}
                    {input.onDeleteToken ? (
                      <button
                        type="button"
                        style={scaleRampDeleteStyle}
                        aria-label={input.t("tokenEditor.deleteAria", { path: record.path })}
                        title={input.t("tokenEditor.deleteAria", { path: record.path })}
                        onClick={() => input.onDeleteToken?.(record)}
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {model.styles.length || input.onCreateToken ? (
        <section style={typographyCardStyle}>
          <div style={typographyCardHeaderStyle}>
            <span>{input.t("tokenEditor.styles")}</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={typographyCardMetaStyle}>
                {input.t("tokenEditor.stylesCount", { count: model.styles.length })}
              </span>
              {input.onCreateToken ? (
                <button
                  type="button"
                  style={typographyAddButtonStyle}
                  onClick={() =>
                    input.onCreateToken?.({
                      type: "typography",
                      ...nextStyleToken(model.styles, primaryFamilyName),
                    })
                  }
                >
                  {input.t("tokenEditor.newStyle")}
                </button>
              ) : null}
            </span>
          </div>
          <div style={styleCardGridStyle}>
            {model.styles.map((record) => renderTypographyStyleCard(record, input))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function sizePx(record: EditorTokenRecord, lookup: TokenLookup): number {
  const resolved = resolveTokenValue(lookup, record.token.$value);
  const value = parseFloat(String(resolved));
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
}

function typographyStyleLabel(path: string): string {
  const segments = path.split(".").filter(Boolean);
  const trimmed = segments[0] === "typography" ? segments.slice(1) : segments;
  return (trimmed.length ? trimmed : segments).join(" / ");
}

function typographySummary(typography: {
  fontSize: ResponsiveSize;
  lineHeight: string;
  fontWeight: string | number;
}): string {
  return `${responsiveSizePc(typography.fontSize)}/${typography.lineHeight} · ${typography.fontWeight}`;
}

function renderTokenPathButton(
  record: EditorTokenRecord,
  input: Pick<Parameters<typeof renderTypographyTokenEditor>[0], "selectedTokenKey" | "onSelect">
) {
  return (
    <button
      type="button"
      style={{
        ...typographyTokenPathButtonStyle,
        ...(input.selectedTokenKey === tokenRecordKey(record)
          ? typographyTokenPathButtonActiveStyle
          : {}),
      }}
      onClick={() => input.onSelect(record)}
    >
      {record.path}
    </button>
  );
}

function renderScalarTypographyInput(
  record: EditorTokenRecord,
  valueText: string,
  input: Pick<Parameters<typeof renderTypographyTokenEditor>[0], "t" | "onSelect" | "onCommitValue">
) {
  return (
    <input
      key={`${record.path}:${valueText}`}
      aria-label={input.t("tokenEditor.valueAria", { path: record.path })}
      style={typographyInlineInputStyle}
      defaultValue={valueText}
      onFocus={() => input.onSelect(record)}
      onBlur={(event) => {
        if (event.currentTarget.value !== valueText) {
          input.onCommitValue(record, event.currentTarget.value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function renderTypographyFieldInput(
  record: EditorTokenRecord,
  field: TypographyTokenField,
  valueText: string,
  input: Pick<
    Parameters<typeof renderTypographyTokenEditor>[0],
    "t" | "onSelect" | "onCommitTypographyField"
  >
) {
  return (
    <input
      key={`${record.path}:${field}:${valueText}`}
      aria-label={input.t("tokenEditor.fieldAria", { path: record.path, field })}
      style={typographyInlineInputStyle}
      defaultValue={valueText}
      onFocus={() => input.onSelect(record)}
      onBlur={(event) => {
        if (event.currentTarget.value !== valueText) {
          input.onCommitTypographyField(record, field, event.currentTarget.value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function renderTypographyStyleCard(record: EditorTokenRecord, input: TypographyEditorInput) {
  const value = record.token.$value;
  const typography = isTypographyValue(value) ? value : undefined;
  // Prefer a per-weight font file (if one is attached to the matching weight
  // token); otherwise fall back to the family's own embedded font.
  const asset = typography
    ? (findFontAssetForWeight(input.model.weights, typography.fontWeight, input.lookup) ??
      findEmbeddedFontAssetForFamily(input.model.families, typography.fontFamily))
    : undefined;
  return (
    <article key={tokenRecordKey(record)} style={styleCardStyle}>
      <div style={styleCardHeaderStyle}>
        <div style={styleCardTitleStyle}>
          <span style={styleCardNameStyle}>{typographyStyleLabel(record.path)}</span>
          {typography ? (
            <span style={typographyStyleSummaryStyle}>{typographySummary(typography)}</span>
          ) : null}
        </div>
        <div style={styleCardHeaderActionsStyle}>
          {renderTokenPathButton(record, input)}
          {input.onDeleteToken ? (
            <button
              type="button"
              style={typographyDeleteButtonStyle}
              aria-label={input.t("tokenEditor.deleteAria", { path: record.path })}
              onClick={() => input.onDeleteToken?.(record)}
            >
              {input.t("tokenEditor.delete")}
            </button>
          ) : null}
        </div>
      </div>
      {typography ? (
        <>
          <div style={styleSpecimenStyle}>
            <FontPreviewSample
              family={typography.fontFamily}
              asset={asset}
              text={input.t("tokenEditor.specimenText")}
              style={typographyToCss(typography)}
              showMeta={false}
            />
          </div>
          <div style={styleFieldsGridStyle}>
            <label style={styleFieldWideStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldFamily")}</span>
              {renderTypographyFieldInput(record, "fontFamily", typography.fontFamily, input)}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldSize")} · pc</span>
              {renderTypographyFieldInput(
                record,
                "fontSize",
                responsiveSizePc(typography.fontSize),
                input
              )}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldSize")} · tablet</span>
              {renderTypographyFieldInput(
                record,
                "fontSize.tablet",
                typeof typography.fontSize === "object" ? (typography.fontSize.tablet ?? "") : "",
                input
              )}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldSize")} · mobile</span>
              {renderTypographyFieldInput(
                record,
                "fontSize.mobile",
                typeof typography.fontSize === "object" ? (typography.fontSize.mobile ?? "") : "",
                input
              )}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldLine")}</span>
              {renderTypographyFieldInput(record, "lineHeight", typography.lineHeight, input)}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldWeight")}</span>
              {renderTypographyFieldInput(
                record,
                "fontWeight",
                String(typography.fontWeight),
                input
              )}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldLetter")}</span>
              {renderTypographyFieldInput(record, "letterSpacing", typography.letterSpacing, input)}
            </label>
            <label style={styleFieldStyle}>
              <span style={styleFieldLabelStyle}>{input.t("tokenEditor.fieldParagraph")}</span>
              {renderTypographyFieldInput(
                record,
                "paragraphSpacing",
                typography.paragraphSpacing ?? "",
                input
              )}
            </label>
          </div>
        </>
      ) : (
        <span style={inlineHelpStyle}>{input.t("tokenEditor.styleNotTypography")}</span>
      )}
    </article>
  );
}

export function renderComponentTokenEditor(input: {
  t: Translate;
  model: ComponentTokenEditorModel;
  selectedTokenKey: string | undefined;
  lookup: TokenLookup;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
}) {
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <strong>{input.t("tokenEditor.componentTokens")}</strong>
          <p style={inlineHelpStyle}>{input.t("tokenEditor.componentTokensHelp")}</p>
        </div>
      </div>
      {input.model.groups.length ? (
        <div style={componentTokenGroupListStyle}>
          {input.model.groups.map((group) => (
            <section key={group.type} style={componentTokenGroupStyle}>
              <div style={componentTokenGroupHeaderStyle}>
                <strong>{group.type}</strong>
                <span>{input.t("tokenEditor.tokenCount", { count: group.records.length })}</span>
              </div>
              <div style={componentTokenTableScrollStyle}>
                <table style={componentTokenTableStyle}>
                  <thead>
                    <tr>
                      <th style={componentTokenHeaderCellStyle}>
                        {input.t("tokenEditor.colToken")}
                      </th>
                      <th style={componentTokenHeaderCellStyle}>
                        {input.t("tokenEditor.colValue")}
                      </th>
                      <th style={componentTokenHeaderCellStyle}>
                        {input.t("tokenEditor.colPreview")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.records.map((record) => {
                      const valueText = serializeEditorTokenValue(record.token.$value);
                      const selected = input.selectedTokenKey === tokenRecordKey(record);
                      return (
                        <tr key={tokenRecordKey(record)}>
                          <th style={componentTokenRowHeaderStyle}>
                            <button
                              type="button"
                              style={{
                                ...typographyTokenPathButtonStyle,
                                ...(selected ? typographyTokenPathButtonActiveStyle : {}),
                              }}
                              onClick={() => input.onSelect(record)}
                            >
                              {componentTokenDisplayPath(record.path, input.model.componentId)}
                            </button>
                          </th>
                          <td style={componentTokenCellStyle}>
                            <input
                              key={`${record.path}:${valueText}`}
                              aria-label={input.t("tokenEditor.valueAria", { path: record.path })}
                              list={TOKEN_REFERENCE_LIST_ID}
                              style={typographyInlineInputStyle}
                              defaultValue={valueText}
                              onFocus={() => input.onSelect(record)}
                              onBlur={(event) => {
                                if (event.currentTarget.value !== valueText) {
                                  input.onCommitValue(record, event.currentTarget.value);
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.currentTarget.blur();
                                }
                              }}
                            />
                          </td>
                          <td style={componentTokenCellStyle}>
                            {renderComponentTokenPreview(record, input.lookup)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div style={emptyStatePanelStyle}>{input.t("tokenEditor.componentTokensEmpty")}</div>
      )}
    </div>
  );
}

function componentTokenDisplayPath(path: string, componentId: string): string {
  const prefix = `component.${componentId}.`;
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

function renderComponentTokenPreview(record: EditorTokenRecord, lookup: TokenLookup) {
  const value = resolveTokenValue(lookup, record.token.$value);
  if (record.token.$type === "dimension") {
    const cssValue = String(value);
    return (
      <div style={componentTokenPreviewInlineStyle}>
        <span style={{ ...componentDimensionPreviewBarStyle, width: cssValue }} />
        <code style={codeStyle}>{cssValue}</code>
      </div>
    );
  }
  if (record.token.$type === "number") {
    const numeric = typeof value === "number" ? value : Number(value);
    const ratio = Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : 0;
    return (
      <div style={componentTokenPreviewInlineStyle}>
        <span style={componentNumberPreviewTrackStyle}>
          <span style={{ ...componentNumberPreviewFillStyle, width: `${ratio * 100}%` }} />
        </span>
        <code style={codeStyle}>{String(value)}</code>
      </div>
    );
  }
  return <code style={codeStyle}>{String(value)}</code>;
}

type TokenMatrixRow = TokenMatrixModel["rows"][number];

interface TokenMatrixSection {
  key: string;
  columns: string[];
  rows: TokenMatrixRow[];
}

// Color (and other) token matrices union every leaf key across unrelated families,
// producing a wide, mostly-empty table. Group rows that share the same set of
// columns so each family renders as its own compact, dense table instead.
function groupTokenMatrixSections(matrix: TokenMatrixModel): TokenMatrixSection[] {
  const sections = new Map<string, TokenMatrixSection>();
  const order: string[] = [];
  for (const row of matrix.rows) {
    const columns = matrix.columns.filter((column) => row.cells[column]);
    const key = JSON.stringify(columns);
    let section = sections.get(key);
    if (!section) {
      section = { key, columns, rows: [] };
      sections.set(key, section);
      order.push(key);
    }
    section.rows.push(row);
  }
  return order.map((key) => sections.get(key) as TokenMatrixSection);
}

export function renderTokenMatrixEditor(input: {
  t: Translate;
  matrix: TokenMatrixModel;
  selectedTokenKey: string | undefined;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
}) {
  if (!input.matrix.rows.length || !input.matrix.columns.length) {
    return null;
  }

  const sections = groupTokenMatrixSections(input.matrix);

  return (
    <div style={tokenMatrixPanelStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <strong>{input.t("tokenEditor.matrixTitle", { type: input.matrix.type })}</strong>
          <p style={inlineHelpStyle}>
            {input.t("tokenEditor.matrixHelp", {
              count: input.matrix.totalRecords,
              sections: sections.length,
              groupWord:
                sections.length === 1
                  ? input.t("tokenEditor.groupSingular")
                  : input.t("tokenEditor.groupPlural"),
            })}
          </p>
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.key} style={tokenMatrixScrollStyle}>
          <table style={tokenMatrixTableStyle}>
            <thead>
              <tr>
                <th style={tokenMatrixHeaderCellStyle}>{input.t("tokenEditor.colGroup")}</th>
                {section.columns.map((column) => (
                  <th key={column} style={tokenMatrixHeaderCellStyle}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.id}>
                  <th style={tokenMatrixRowHeaderStyle}>{row.label}</th>
                  {section.columns.map((column) => {
                    const record = row.cells[column];
                    return (
                      <td key={column} style={tokenMatrixCellStyle}>
                        {record ? (
                          renderTokenMatrixCell({
                            t: input.t,
                            record,
                            selected: input.selectedTokenKey === tokenRecordKey(record),
                            onSelect: input.onSelect,
                            onCommitValue: input.onCommitValue,
                          })
                        ) : (
                          <span style={tokenMatrixEmptyCellStyle}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function renderTokenMatrixCell(input: {
  t: Translate;
  record: EditorTokenRecord;
  selected: boolean;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
}) {
  const valueText = serializeEditorTokenValue(input.record.token.$value);
  const scalar =
    typeof input.record.token.$value === "string" ||
    typeof input.record.token.$value === "number" ||
    typeof input.record.token.$value === "boolean";
  const commitIfChanged = (valueTextNext: string): void => {
    if (valueTextNext !== valueText) {
      input.onCommitValue(input.record, valueTextNext);
    }
  };

  if (input.record.token.$type === "color") {
    return (
      <div
        style={{
          ...tokenMatrixColorCellStyle,
          ...(input.selected ? tokenMatrixCellActiveStyle : {}),
        }}
        onClick={() => input.onSelect(input.record)}
      >
        {isHexColorInputValue(valueText) ? (
          <input
            aria-label={input.t("tokenEditor.cellColorAria", { path: input.record.path })}
            type="color"
            style={tokenMatrixColorPickerStyle}
            value={valueText}
            onChange={(event) => input.onCommitValue(input.record, event.currentTarget.value)}
          />
        ) : (
          <span style={tokenMatrixColorFallbackSwatchStyle} />
        )}
        <input
          key={`${input.record.path}:${valueText}`}
          aria-label={input.t("tokenEditor.valueAria", { path: input.record.path })}
          list={TOKEN_REFERENCE_LIST_ID}
          style={tokenMatrixValueInputStyle}
          defaultValue={valueText}
          onFocus={() => input.onSelect(input.record)}
          onBlur={(event) => commitIfChanged(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />
      </div>
    );
  }

  if (scalar) {
    return (
      <input
        key={`${input.record.path}:${valueText}`}
        aria-label={input.t("tokenEditor.valueAria", { path: input.record.path })}
        list={TOKEN_REFERENCE_LIST_ID}
        style={{
          ...tokenMatrixValueInputStyle,
          ...(input.selected ? tokenMatrixInputActiveStyle : {}),
        }}
        defaultValue={valueText}
        onFocus={() => input.onSelect(input.record)}
        onBlur={(event) => commitIfChanged(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      style={{
        ...tokenMatrixObjectCellStyle,
        ...(input.selected ? tokenMatrixInputActiveStyle : {}),
      }}
      onClick={() => input.onSelect(input.record)}
    >
      {valueText}
    </button>
  );
}

/**
 * Color matrix grouped into cards (primary, default, …). Inside each card the
 * variations (base, hover, …) stack vertically as rows; only LIGHT and DARK
 * split into two side-by-side columns, so the table never scrolls horizontally.
 * Each side offers a native color picker AND a token-reference picker.
 */
/** Pick a unique color.custom-N.base group for a brand-new color token. */
function nextColorToken(model: ColorComparisonMatrixModel): { path: string; valueText: string } {
  const usedGroups = new Set(model.rows.map((row) => row.id));
  let index = 1;
  while (usedGroups.has(`color.custom-${index}`)) {
    index += 1;
  }
  return { path: `color.custom-${index}.base`, valueText: "#3366ff" };
}

/**
 * Replacement dialog shown when deleting a token that is still referenced. The
 * user must pick a replacement; the parent then repoints every reference before
 * removing the token so nothing is left dangling. Covers color sets/variations
 * and flat scalar scales (spacing/radius).
 */
export function TokenDeleteDialog({
  kind,
  tokenType,
  label,
  usages,
  options,
  replacement,
  onChangeReplacement,
  onCancel,
  onConfirm,
}: {
  kind: "color-variation" | "color-group" | "scalar";
  tokenType: DesignToken["$type"];
  label: string;
  usages: TokenUsage[];
  options: string[];
  replacement: string;
  onChangeReplacement: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const name = kind === "color-group" ? label.slice(label.lastIndexOf(".") + 1) : label;
  const noun =
    kind === "color-group"
      ? t("tokenEditor.nounColorSet")
      : kind === "color-variation"
        ? t("tokenEditor.nounColor")
        : tokenType === "spacing"
          ? t("tokenEditor.nounSpacing")
          : tokenType === "radius"
            ? t("tokenEditor.nounRadius")
            : t("tokenEditor.nounToken");
  // Pick the Korean object/topic particle by whether the noun ends in a consonant.
  // Particles are a Korean grammar feature only; other locales emit nothing.
  const particle = (consonant: string, vowel: string): string => {
    if (locale !== "ko") {
      return "";
    }
    const code = noun.charCodeAt(noun.length - 1);
    const hasFinal = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : true;
    return hasFinal ? consonant : vowel;
  };
  const sourceLabel = (source: TokenUsage["source"]): string =>
    source === "component"
      ? t("tokenEditor.usageSourceComponent")
      : source === "node"
        ? t("tokenEditor.usageSourcePage")
        : t("tokenEditor.usageSourceToken");
  const shown = usages.slice(0, 12);
  return (
    <div
      style={colorDeleteOverlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label={t("tokenEditor.deleteDialogAria", { noun, name })}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div style={colorDeleteDialogStyle}>
        <h2 style={colorDeleteTitleStyle}>{t("tokenEditor.deleteTitle", { noun, name })}</h2>
        <p style={inlineHelpStyle}>
          {t("tokenEditor.deleteHelpPrefix")}
          {noun}
          {particle("은", "는")}
          {t("tokenEditor.deleteHelpMiddle", { count: usages.length })}
          {noun}
          {particle("을", "를")}
          {t("tokenEditor.deleteHelpSuffix")}
        </p>
        <ul style={colorDeleteUsageListStyle}>
          {shown.map((usage, index) => (
            <li key={`${usage.source}-${usage.ownerId}-${usage.field}-${index}`}>
              {sourceLabel(usage.source)} · {usage.ownerId}
              {usage.field === "$value" ? "" : `.${usage.field}`}
            </li>
          ))}
          {usages.length > shown.length ? (
            <li>{t("tokenEditor.deleteUsageMore", { count: usages.length - shown.length })}</li>
          ) : null}
        </ul>
        <label style={colorDeleteFieldLabelStyle}>
          {t("tokenEditor.deleteReplacementLabel", { noun })}
          <select
            style={colorDeleteSelectStyle}
            value={replacement}
            aria-label={t("tokenEditor.deleteReplacementAria", { noun })}
            onChange={(event) => onChangeReplacement(event.target.value)}
          >
            {options.length === 0 ? (
              <option value="">{t("tokenEditor.deleteReplacementNone")}</option>
            ) : null}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div style={colorDeleteActionsStyle}>
          <button type="button" style={colorDeleteCancelStyle} onClick={onCancel}>
            {t("tokenEditor.cancel")}
          </button>
          <button
            type="button"
            style={colorDeleteConfirmStyle}
            disabled={!replacement}
            onClick={onConfirm}
          >
            {t("tokenEditor.deleteConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Color-set (group) header: the set name with inline rename, a variation count,
 * and a delete control. Rename/delete are routed up so the parent can rewrite
 * references and run the usage-checked deletion flow.
 */
function ColorGroupHeader({
  groupId,
  label,
  onRenameGroup,
  onDeleteGroup,
}: {
  groupId: string;
  label: string;
  onRenameGroup?: (groupId: string, nextName: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}) {
  const t = useT();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(label);
  const commit = (): void => {
    setRenaming(false);
    const next = draft.trim();
    if (next && next !== label) {
      onRenameGroup?.(groupId, next);
    } else {
      setDraft(label);
    }
  };
  return (
    <div style={colorGroupHeaderStyle}>
      {renaming ? (
        <input
          style={colorGroupRenameInputStyle}
          value={draft}
          autoFocus
          aria-label={t("tokenEditor.renameColorSetAria", { label })}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit();
            } else if (event.key === "Escape") {
              setDraft(label);
              setRenaming(false);
            }
          }}
        />
      ) : (
        <strong>{label}</strong>
      )}
      <div style={colorGroupActionsStyle}>
        {onRenameGroup && !renaming ? (
          <button
            type="button"
            style={colorGroupRenameButtonStyle}
            onClick={() => {
              setDraft(label);
              setRenaming(true);
            }}
          >
            {t("tokenEditor.rename")}
          </button>
        ) : null}
        {onDeleteGroup ? (
          <button
            type="button"
            style={colorVariationDeleteStyle}
            aria-label={t("tokenEditor.deleteColorSetAria", { label })}
            title={t("tokenEditor.deleteColorSetTitle", { groupId })}
            onClick={() => onDeleteGroup(groupId)}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function renderColorComparisonMatrix(input: {
  t: Translate;
  title?: string;
  model: ColorComparisonMatrixModel;
  lightLookup: TokenLookup;
  darkLookup: TokenLookup;
  tokenOptions: TokenPickerOption[];
  selectedTokenKey: string | undefined;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
  onCreateCounterpart(targetPath: string, seedRecord: EditorTokenRecord): void;
  onCreateToken?(input: { type: DesignToken["$type"]; path: string; valueText: string }): void;
  onDeleteVariation?(records: EditorTokenRecord[]): void;
  onDeleteGroup?(groupId: string): void;
  onRenameGroup?(groupId: string, nextName: string): void;
}) {
  if (!input.model.columns.length && !input.onCreateToken) {
    return null;
  }
  return (
    <div style={tokenMatrixPanelStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <strong>{input.title ?? input.t("tokenEditor.colorMatrix")}</strong>
          <p style={inlineHelpStyle}>
            {input.t("tokenEditor.colorMatrixHelp", {
              count: input.model.totalRecords,
              sections: input.model.rows.length,
              groupWord:
                input.model.rows.length === 1
                  ? input.t("tokenEditor.groupSingular")
                  : input.t("tokenEditor.groupPlural"),
            })}
          </p>
        </div>
        <div style={colorMatrixHeaderActionsStyle}>
          <div style={colorSchemeLegendStyle}>
            <span style={colorSchemeLegendSwatchLightStyle} />
            {input.t("tokenEditor.legendLight")}
            <span style={colorSchemeLegendSwatchDarkStyle} />
            {input.t("tokenEditor.legendDark")}
          </div>
          {input.onCreateToken ? (
            <button
              type="button"
              style={typographyAddButtonStyle}
              onClick={() =>
                input.onCreateToken?.({ type: "color", ...nextColorToken(input.model) })
              }
            >
              {input.t("tokenEditor.newColor")}
            </button>
          ) : null}
        </div>
      </div>
      <div style={colorComparisonGridStyle}>
        {input.model.rows.map((group) => {
          const variations = input.model.columns.filter((column) => group.cells[column]);
          return (
            <section key={group.id} style={colorGroupCardStyle}>
              <ColorGroupHeader
                groupId={group.id}
                label={group.label}
                {...(input.onRenameGroup ? { onRenameGroup: input.onRenameGroup } : {})}
                {...(input.onDeleteGroup ? { onDeleteGroup: input.onDeleteGroup } : {})}
              />
              <table style={colorGroupTableStyle}>
                <thead>
                  <tr>
                    <th style={colorGroupCornerStyle} />
                    <th style={colorGroupColHeadStyle}>{input.t("tokenEditor.colorColLight")}</th>
                    <th style={colorGroupColHeadStyle}>{input.t("tokenEditor.colorColDark")}</th>
                    <th style={{ width: 38 }} />
                  </tr>
                </thead>
                <tbody>
                  {variations.map((variation) => {
                    const cell = group.cells[variation];
                    if (!cell) {
                      return null;
                    }
                    const columnPath = `${group.id}.${variation}`;
                    const selected =
                      (cell.light && input.selectedTokenKey === tokenRecordKey(cell.light)) ||
                      (cell.dark && input.selectedTokenKey === tokenRecordKey(cell.dark));
                    return (
                      <tr
                        key={variation}
                        style={selected ? colorVariationRowActiveStyle : undefined}
                      >
                        <th style={colorVariationHeadStyle}>
                          <span>{variation}</span>
                        </th>
                        <td style={colorSideCellStyle}>
                          <ColorScaleSide
                            scheme="light"
                            record={cell.light}
                            counterpart={cell.dark}
                            lookup={input.lightLookup}
                            columnPath={columnPath}
                            tokenOptions={input.tokenOptions}
                            onSelect={input.onSelect}
                            onCommitValue={input.onCommitValue}
                            onCreateCounterpart={input.onCreateCounterpart}
                          />
                        </td>
                        <td style={colorSideCellStyle}>
                          <ColorScaleSide
                            scheme="dark"
                            record={cell.dark}
                            counterpart={cell.light}
                            lookup={input.darkLookup}
                            columnPath={columnPath}
                            tokenOptions={input.tokenOptions}
                            onSelect={input.onSelect}
                            onCommitValue={input.onCommitValue}
                            onCreateCounterpart={input.onCreateCounterpart}
                          />
                        </td>
                        <td style={colorVariationDeleteCellStyle}>
                          {input.onDeleteVariation ? (
                            <button
                              type="button"
                              style={colorVariationDeleteStyle}
                              aria-label={input.t("tokenEditor.deleteColorAria", { columnPath })}
                              title={input.t("tokenEditor.deleteColorTitle", { columnPath })}
                              onClick={() =>
                                input.onDeleteVariation?.(
                                  [cell.light, cell.dark].filter(
                                    (entry): entry is EditorTokenRecord => Boolean(entry)
                                  )
                                )
                              }
                            >
                              ×
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Single-step HSV color picker: a saturation/value area, a hue bar, and an alpha
 * bar — all pointer-driven so the whole color (incl. alpha) is set in one place,
 * with no nested OS color dialog. Local HSV state preserves hue at s/v extremes.
 */
export function InlineColorPicker({
  value,
  onChange,
}: {
  value: RgbaColor;
  onChange(next: RgbaColor): void;
}) {
  const t = useT();
  const [hsv, setHsv] = useState<HsvColor>(() => rgbToHsv(value));
  const [alpha, setAlpha] = useState(value.a);
  const emit = (nextHsv: HsvColor, nextAlpha: number): void => {
    onChange({ ...hsvToRgb(nextHsv), a: nextAlpha });
  };
  const fraction = (element: HTMLElement, client: number, vertical: boolean): number => {
    const rect = element.getBoundingClientRect();
    const raw = vertical ? (client - rect.top) / rect.height : (client - rect.left) / rect.width;
    return Math.max(0, Math.min(1, raw));
  };
  const hue = hsvToRgb({ h: hsv.h, s: 1, v: 1 });
  const hueColor = `rgb(${hue.r}, ${hue.g}, ${hue.b})`;
  const solid = hsvToRgb(hsv);
  const solidColor = `rgb(${solid.r}, ${solid.g}, ${solid.b})`;
  const handleSv = (event: PointerEvent<HTMLDivElement>): void => {
    const next = {
      ...hsv,
      s: fraction(event.currentTarget, event.clientX, false),
      v: 1 - fraction(event.currentTarget, event.clientY, true),
    };
    setHsv(next);
    emit(next, alpha);
  };
  const handleHue = (event: PointerEvent<HTMLDivElement>): void => {
    const next = { ...hsv, h: fraction(event.currentTarget, event.clientX, false) * 360 };
    setHsv(next);
    emit(next, alpha);
  };
  const handleAlpha = (event: PointerEvent<HTMLDivElement>): void => {
    const nextAlpha = fraction(event.currentTarget, event.clientX, false);
    setAlpha(nextAlpha);
    emit(hsv, nextAlpha);
  };
  return (
    <div style={colorPickerStackStyle}>
      <div
        aria-label={t("tokenEditor.colorPickerSaturationValue")}
        style={{
          ...colorPickerSvStyle,
          background: `linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0)), ${hueColor}`,
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handleSv(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleSv(event);
          }
        }}
      >
        <span
          style={{
            ...colorPickerSvThumbStyle,
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            background: solidColor,
          }}
        />
      </div>
      <div
        aria-label={t("tokenEditor.colorPickerHue")}
        style={colorPickerHueStyle}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handleHue(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleHue(event);
          }
        }}
      >
        <span
          style={{
            ...colorPickerBarThumbStyle,
            left: `${(hsv.h / 360) * 100}%`,
            background: hueColor,
          }}
        />
      </div>
      <div
        aria-label={t("tokenEditor.colorPickerAlpha")}
        style={colorPickerAlphaTrackStyle}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handleAlpha(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handleAlpha(event);
          }
        }}
      >
        <span
          style={{
            ...colorPickerAlphaOverlayStyle,
            background: `linear-gradient(to right, rgba(${solid.r}, ${solid.g}, ${solid.b}, 0), rgba(${solid.r}, ${solid.g}, ${solid.b}, 1))`,
          }}
        />
        <span
          style={{ ...colorPickerBarThumbStyle, left: `${alpha * 100}%`, background: solidColor }}
        />
      </div>
    </div>
  );
}

/**
 * Swatch button that opens the inline color+alpha picker popover.
 */
export function ColorSwatchPicker({
  label,
  swatchColor,
  value,
  onOpen,
  onChange,
  compact = false,
}: {
  label: string;
  swatchColor: string | undefined;
  value: RgbaColor;
  onOpen(): void;
  onChange(next: RgbaColor): void;
  /** 24px-row trigger for the Figma-density inspector rail. */
  compact?: boolean;
}) {
  const t = useT();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const preview = formatColorValue(value);
  return (
    <span
      style={compact ? { ...colorPickerWrapStyle, width: 24, height: 20 } : colorPickerWrapStyle}
    >
      <button
        type="button"
        style={{
          ...colorSwatchTriggerStyle,
          ...(compact ? { width: 24, height: 20, borderRadius: 4 } : {}),
          ...(swatchColor ? { background: swatchColor } : {}),
        }}
        title={t("tokenEditor.editColorFor", { label })}
        aria-label={t("tokenEditor.editColorFor", { label })}
        data-color-swatch={swatchColor ?? ""}
        onClick={(event) => {
          // Capture before the updater: React nulls event.currentTarget after
          // the handler; the deferred-updater path must not depend on React's
          // eager-state bailout keeping it alive.
          const element = event.currentTarget;
          onOpen();
          setAnchor((previous) => (previous ? null : element));
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setAnchor(null);
        }}
      />
      {anchor ? (
        // Portaled + fixed so the inspector rail's overflow can never clip it.
        <AnchoredPortal anchor={anchor} width={216} estimatedHeight={320} zIndex={90}>
          <div
            style={{ ...colorPickerBackdropStyle, zIndex: -1 }}
            onClick={() => setAnchor(null)}
            onContextMenu={(event) => {
              event.preventDefault();
              setAnchor(null);
            }}
          />
          <div style={{ ...colorPickerPopoverStyle, position: "static" }}>
            <InlineColorPicker value={value} onChange={onChange} />
            <div style={colorPickerPreviewStyle}>
              <span
                style={{
                  ...colorPickerPreviewSwatchStyle,
                  ...(swatchColor ? { background: swatchColor } : {}),
                }}
              />
              {preview}
            </div>
          </div>
        </AnchoredPortal>
      ) : null}
    </span>
  );
}

/**
 * Editable color value field. When the value is a token reference it shows the
 * resolved value first with the token name in parentheses — e.g.
 * "#7c3aed (color.primary.base)" — but reveals the raw "{token}" alias while
 * focused so it stays editable. Raw colors are shown/edited as-is.
 */
function ColorValueField({
  label,
  rawValue,
  displayValue,
  isReference,
  onSelect,
  onCommit,
}: {
  label: string;
  rawValue: string;
  displayValue: string;
  isReference: boolean;
  onSelect(): void;
  onCommit(next: string): void;
}) {
  const t = useT();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(rawValue);
  const shown = focused ? draft : displayValue;
  return (
    <input
      aria-label={t("tokenEditor.fieldValueAria", { label })}
      list={TOKEN_REFERENCE_LIST_ID}
      style={colorSideInputStyle}
      value={shown}
      title={
        isReference ? t("tokenEditor.referenceEditTitle", { displayValue, rawValue }) : undefined
      }
      onFocus={() => {
        setDraft(rawValue);
        setFocused(true);
        onSelect();
      }}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={(event) => {
        setFocused(false);
        if (event.currentTarget.value !== rawValue) {
          onCommit(event.currentTarget.value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function ColorScaleSide({
  scheme,
  record,
  counterpart,
  lookup,
  columnPath,
  tokenOptions,
  onSelect,
  onCommitValue,
  onCreateCounterpart,
}: {
  scheme: "light" | "dark";
  record: EditorTokenRecord | undefined;
  counterpart: EditorTokenRecord | undefined;
  lookup: TokenLookup;
  columnPath: string;
  tokenOptions: TokenPickerOption[];
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
  onCreateCounterpart(targetPath: string, seedRecord: EditorTokenRecord): void;
}) {
  const t = useT();
  const [pickerOpen, setPickerOpen] = useState(false);
  if (!record) {
    const targetPath = colorCounterpartPath(columnPath, scheme);
    return (
      <button
        type="button"
        style={colorSideEmptyButtonStyle}
        disabled={!counterpart}
        onClick={() => {
          if (counterpart) {
            onCreateCounterpart(targetPath, counterpart);
          }
        }}
      >
        {t("tokenEditor.addScheme", {
          scheme: scheme === "light" ? t("tokenEditor.schemeLight") : t("tokenEditor.schemeDark"),
        })}
      </button>
    );
  }
  const valueText = serializeEditorTokenValue(record.token.$value);
  // Resolve the swatch against the scheme-NEUTRAL path: createThemedTokenLookup
  // keys dark tokens by their neutralized ("color.*") path, so resolving by the
  // raw "dark.color.*" record path would always miss for non-hex dark tokens.
  const resolved = resolveTokenPath(lookup, columnPath);
  const swatchColor =
    typeof resolved === "string" && isCssColorValue(resolved) ? resolved : undefined;
  // RGBA basis for the picker. Prefer the literal value; fall back to the
  // resolved color so a referenced/aliased token can still be edited to a raw
  // color. The text field keeps showing the literal value (incl. "{token}").
  const editable = parseColor(valueText) ?? parseColor(swatchColor);
  const baseRgba: RgbaColor = editable ?? { r: 0, g: 0, b: 0, a: 1 };
  const commitRgba = (next: RgbaColor): void => {
    onCommitValue(record, formatColorValue(next));
  };
  const commitIfChanged = (next: string): void => {
    if (next !== valueText) {
      onCommitValue(record, next);
    }
  };
  // A token reference shows "resolved value (token name)" when not being edited.
  const isReference = valueText.startsWith("{") && valueText.endsWith("}");
  const referenceName = isReference ? valueText.slice(1, -1) : "";
  const displayValue = isReference
    ? swatchColor
      ? `${swatchColor} (${referenceName})`
      : `(${referenceName})`
    : valueText;
  return (
    <div style={colorSideStyle}>
      <div style={colorSideRowStyle}>
        <ColorSwatchPicker
          label={record.path}
          swatchColor={swatchColor}
          value={baseRgba}
          onOpen={() => onSelect(record)}
          onChange={commitRgba}
        />
        <ColorValueField
          key={`${record.path}:${valueText}`}
          label={record.path}
          rawValue={valueText}
          displayValue={displayValue}
          isReference={isReference}
          onSelect={() => onSelect(record)}
          onCommit={commitIfChanged}
        />
        <span style={colorTokenPickerAnchorStyle}>
          <button
            type="button"
            style={colorTokenToggleStyle}
            aria-label={t("tokenEditor.referenceTokenAria", { path: record.path })}
            title={t("tokenEditor.referenceTokenTitle")}
            onClick={() => {
              onSelect(record);
              setPickerOpen((open) => !open);
            }}
          >
            {"{token}"}
          </button>
          {pickerOpen ? (
            <>
              <div style={colorPickerBackdropStyle} onClick={() => setPickerOpen(false)} />
              <div style={colorTokenPickerPopoverStyle}>
                <TokenPicker
                  options={tokenOptions}
                  placeholder={t("tokenEditor.referenceTokenPlaceholder")}
                  autoFocus
                  onPick={(reference) => {
                    onCommitValue(record, reference);
                    setPickerOpen(false);
                  }}
                />
              </div>
            </>
          ) : null}
        </span>
      </div>
    </div>
  );
}

export function normalizeTokenPathLabel(path: string): string {
  const normalized = path
    .split(/[./]/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(".");
  if (!normalized) {
    throw new Error("Token path is required.");
  }
  return normalized;
}

import {
  EditorTokenDraft,
  EditorTokenRecord,
  parseEditorTokenValue,
  serializeEditorTokenValue,
} from "./spec-editing.js";
import {
  isCssColorValue,
  isHexColorInputValue,
  isTypographyValue,
  resolveTokenValue,
  typographyToCss,
  type TokenLookup,
} from "./token-lookup.js";
import {
  TOKEN_REFERENCE_LIST_ID,
  tokenRecordKey,
  type ComponentTokenEditorModel,
  type TokenMatrixModel,
  type TypographyTokenField,
  type TypographyWorkspaceModel,
} from "./token-model.js";
import {
  FONT_FILE_ACCEPT,
  FontPreviewSample,
  findEmbeddedFontAssetForFamily,
  getEmbeddedFontAssetFromDraft,
  getEmbeddedFontAssetFromExtensions,
  inferFontFamilyName,
} from "./fonts.js";
import {
  cardHeaderStyle,
  cardStyle,
  codeBlockStyle,
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
  errorTextStyle,
  fontAssetCellStyle,
  fontAssetEmptyStyle,
  fontAssetNameStyle,
  fontAttachButtonStyle,
  fontRemoveButtonStyle,
  fontSizePreviewStyle,
  fontWeightPreviewStyle,
  hiddenFileInputStyle,
  inlineHelpStyle,
  tokenColorPreviewStyle,
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
  tokenScaleBoxStyle,
  tokenScalePreviewStyle,
  tokenSwatchStyle,
  tokenTypographyPreviewStyle,
  typographyCellStyle,
  typographyHeaderCellStyle,
  typographyInlineInputStyle,
  typographyRowHeaderCellStyle,
  typographySubHeaderStyle,
  typographySubPanelStyle,
  typographyTableScrollStyle,
  typographyTableStyle,
  typographyTokenPathButtonActiveStyle,
  typographyTokenPathButtonStyle,
  typographyTwoColumnStyle,
  typographyWideTableStyle,
  typographyWorkspaceCountStyle,
  typographyWorkspaceHeaderStyle,
  typographyWorkspaceStyle,
} from "./styles.js";

export function renderTypographyTokenEditor(input: {
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
}) {
  const hasTypographyTokens =
    input.model.families.length ||
    input.model.weights.length ||
    input.model.sizes.length ||
    input.model.styles.length;

  if (!hasTypographyTokens) {
    return null;
  }

  return (
    <div style={typographyWorkspaceStyle}>
      <div style={typographyWorkspaceHeaderStyle}>
        <div>
          <strong>Typography workspace</strong>
          <p style={inlineHelpStyle}>
            Edit font families, weights, size tokens, and text styles without opening raw JSON.
          </p>
        </div>
        <div style={typographyWorkspaceCountStyle}>
          <span>{input.model.families.length} families</span>
          <span>{input.model.styles.length} styles</span>
        </div>
      </div>
      {input.model.families.length ? (
        <section style={typographySubPanelStyle}>
          <div style={typographySubHeaderStyle}>
            <strong>Font families</strong>
            <span>Attach .woff, .woff2, .ttf, or .otf files to a family token.</span>
          </div>
          <div style={typographyTableScrollStyle}>
            <table style={typographyTableStyle}>
              <thead>
                <tr>
                  <th style={typographyHeaderCellStyle}>token</th>
                  <th style={typographyHeaderCellStyle}>family</th>
                  <th style={typographyHeaderCellStyle}>font file</th>
                  <th style={typographyHeaderCellStyle}>preview</th>
                </tr>
              </thead>
              <tbody>
                {input.model.families.map((record) => {
                  const valueText = serializeEditorTokenValue(record.token.$value);
                  const family = inferFontFamilyName(record.token.$value, record.path);
                  const asset = getEmbeddedFontAssetFromExtensions(record.token.$extensions);
                  return (
                    <tr key={tokenRecordKey(record)}>
                      <th style={typographyRowHeaderCellStyle}>
                        {renderTokenPathButton(record, input)}
                      </th>
                      <td style={typographyCellStyle}>
                        <input
                          key={`${record.path}:${valueText}`}
                          aria-label={`${record.path} family`}
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
                      <td style={typographyCellStyle}>
                        <div style={fontAssetCellStyle}>
                          <label style={fontAttachButtonStyle}>
                            Attach
                            <input
                              aria-label={`${record.path} font file`}
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
                                Remove
                              </button>
                            </>
                          ) : (
                            <span style={fontAssetEmptyStyle}>No file</span>
                          )}
                        </div>
                      </td>
                      <td style={typographyCellStyle}>
                        <FontPreviewSample family={family} asset={asset} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <div style={typographyTwoColumnStyle}>
        {input.model.weights.length ? (
          <section style={typographySubPanelStyle}>
            <div style={typographySubHeaderStyle}>
              <strong>Weights</strong>
              <span>Numbers or aliases used by typography styles.</span>
            </div>
            <div style={typographyTableScrollStyle}>
              <table style={typographyTableStyle}>
                <thead>
                  <tr>
                    <th style={typographyHeaderCellStyle}>token</th>
                    <th style={typographyHeaderCellStyle}>value</th>
                    <th style={typographyHeaderCellStyle}>preview</th>
                  </tr>
                </thead>
                <tbody>
                  {input.model.weights.map((record) => {
                    const valueText = serializeEditorTokenValue(record.token.$value);
                    return (
                      <tr key={tokenRecordKey(record)}>
                        <th style={typographyRowHeaderCellStyle}>
                          {renderTokenPathButton(record, input)}
                        </th>
                        <td style={typographyCellStyle}>
                          {renderScalarTypographyInput(record, valueText, input)}
                        </td>
                        <td style={typographyCellStyle}>
                          <span style={{ ...fontWeightPreviewStyle, fontWeight: valueText }}>
                            Aa
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {input.model.sizes.length ? (
          <section style={typographySubPanelStyle}>
            <div style={typographySubHeaderStyle}>
              <strong>Font sizes</strong>
              <span>Dimension tokens marked as font size scale.</span>
            </div>
            <div style={typographyTableScrollStyle}>
              <table style={typographyTableStyle}>
                <thead>
                  <tr>
                    <th style={typographyHeaderCellStyle}>token</th>
                    <th style={typographyHeaderCellStyle}>size</th>
                    <th style={typographyHeaderCellStyle}>preview</th>
                  </tr>
                </thead>
                <tbody>
                  {input.model.sizes.map((record) => {
                    const valueText = serializeEditorTokenValue(record.token.$value);
                    const resolved = resolveTokenValue(input.lookup, record.token.$value);
                    return (
                      <tr key={tokenRecordKey(record)}>
                        <th style={typographyRowHeaderCellStyle}>
                          {renderTokenPathButton(record, input)}
                        </th>
                        <td style={typographyCellStyle}>
                          {renderScalarTypographyInput(record, valueText, input)}
                        </td>
                        <td style={typographyCellStyle}>
                          <span style={{ ...fontSizePreviewStyle, fontSize: String(resolved) }}>
                            Aa
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
      {input.model.styles.length ? (
        <section style={typographySubPanelStyle}>
          <div style={typographySubHeaderStyle}>
            <strong>Typography styles</strong>
            <span>Structured text styles edited as fields, saved back to JSON tokens.</span>
          </div>
          <div style={typographyTableScrollStyle}>
            <table style={typographyWideTableStyle}>
              <thead>
                <tr>
                  <th style={typographyHeaderCellStyle}>style</th>
                  <th style={typographyHeaderCellStyle}>family</th>
                  <th style={typographyHeaderCellStyle}>size</th>
                  <th style={typographyHeaderCellStyle}>line</th>
                  <th style={typographyHeaderCellStyle}>weight</th>
                  <th style={typographyHeaderCellStyle}>letter</th>
                  <th style={typographyHeaderCellStyle}>paragraph</th>
                  <th style={typographyHeaderCellStyle}>preview</th>
                </tr>
              </thead>
              <tbody>
                {input.model.styles.map((record) => {
                  const value = record.token.$value;
                  const typography = isTypographyValue(value) ? value : undefined;
                  const asset = typography
                    ? findEmbeddedFontAssetForFamily(input.model.families, typography.fontFamily)
                    : undefined;
                  return (
                    <tr key={tokenRecordKey(record)}>
                      <th style={typographyRowHeaderCellStyle}>
                        {renderTokenPathButton(record, input)}
                      </th>
                      {typography ? (
                        <>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "fontFamily",
                              typography.fontFamily,
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "fontSize",
                              typography.fontSize,
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "lineHeight",
                              typography.lineHeight,
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "fontWeight",
                              String(typography.fontWeight),
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "letterSpacing",
                              typography.letterSpacing,
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            {renderTypographyFieldInput(
                              record,
                              "paragraphSpacing",
                              typography.paragraphSpacing ?? "",
                              input
                            )}
                          </td>
                          <td style={typographyCellStyle}>
                            <FontPreviewSample
                              family={typography.fontFamily}
                              asset={asset}
                              text="The quick brown fox"
                              style={typographyToCss(typography)}
                              showMeta={false}
                            />
                          </td>
                        </>
                      ) : (
                        <td style={typographyCellStyle} colSpan={7}>
                          <button
                            type="button"
                            style={tokenMatrixObjectCellStyle}
                            onClick={() => input.onSelect(record)}
                          >
                            Open JSON detail
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
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
  input: Pick<Parameters<typeof renderTypographyTokenEditor>[0], "onSelect" | "onCommitValue">
) {
  return (
    <input
      key={`${record.path}:${valueText}`}
      aria-label={`${record.path} value`}
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
    "onSelect" | "onCommitTypographyField"
  >
) {
  return (
    <input
      key={`${record.path}:${field}:${valueText}`}
      aria-label={`${record.path} ${field}`}
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

export function renderComponentTokenEditor(input: {
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
          <strong>Component tokens</strong>
          <p style={inlineHelpStyle}>
            Edit local dimension and number values that belong to this component.
          </p>
        </div>
      </div>
      {input.model.groups.length ? (
        <div style={componentTokenGroupListStyle}>
          {input.model.groups.map((group) => (
            <section key={group.type} style={componentTokenGroupStyle}>
              <div style={componentTokenGroupHeaderStyle}>
                <strong>{group.type}</strong>
                <span>{group.records.length} tokens</span>
              </div>
              <div style={componentTokenTableScrollStyle}>
                <table style={componentTokenTableStyle}>
                  <thead>
                    <tr>
                      <th style={componentTokenHeaderCellStyle}>token</th>
                      <th style={componentTokenHeaderCellStyle}>value</th>
                      <th style={componentTokenHeaderCellStyle}>preview</th>
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
                              aria-label={`${record.path} value`}
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
        <div style={emptyStatePanelStyle}>
          No local dimension, number, or string tokens for this component.
        </div>
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

export function renderTokenMatrixEditor(input: {
  matrix: TokenMatrixModel;
  selectedTokenKey: string | undefined;
  onSelect(record: EditorTokenRecord): void;
  onCommitValue(record: EditorTokenRecord, valueText: string): void;
}) {
  if (!input.matrix.rows.length || !input.matrix.columns.length) {
    return null;
  }

  return (
    <div style={tokenMatrixPanelStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <strong>{input.matrix.type} matrix</strong>
          <p style={inlineHelpStyle}>
            {input.matrix.totalRecords} editable cells. Select a cell to sync the detail editor.
          </p>
        </div>
      </div>
      <div style={tokenMatrixScrollStyle}>
        <table style={tokenMatrixTableStyle}>
          <thead>
            <tr>
              <th style={tokenMatrixHeaderCellStyle}>group</th>
              {input.matrix.columns.map((column) => (
                <th key={column} style={tokenMatrixHeaderCellStyle}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {input.matrix.rows.map((row) => (
              <tr key={row.id}>
                <th style={tokenMatrixRowHeaderStyle}>{row.label}</th>
                {input.matrix.columns.map((column) => {
                  const record = row.cells[column];
                  return (
                    <td key={column} style={tokenMatrixCellStyle}>
                      {record ? (
                        renderTokenMatrixCell({
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
    </div>
  );
}

function renderTokenMatrixCell(input: {
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
            aria-label={`${input.record.path} color`}
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
          aria-label={`${input.record.path} value`}
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
        aria-label={`${input.record.path} value`}
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

export function renderTokenDraftPreview(draft: EditorTokenDraft, lookup: TokenLookup) {
  try {
    const value = resolveTokenValue(lookup, parseEditorTokenValue(draft.type, draft.valueText));
    if (draft.type === "fontFamily") {
      const asset = getEmbeddedFontAssetFromDraft(draft);
      const family = inferFontFamilyName(value, draft.path);
      return <FontPreviewSample family={family} asset={asset} text="The quick brown fox 123" />;
    }
    if (draft.type === "color" || isCssColorValue(value)) {
      const color = String(value);
      return (
        <div style={tokenColorPreviewStyle}>
          <span style={{ ...tokenSwatchStyle, background: color }} />
          <code style={codeStyle}>{color}</code>
        </div>
      );
    }
    if (draft.type === "typography" && isTypographyValue(value)) {
      return (
        <div style={tokenTypographyPreviewStyle}>
          <span style={typographyToCss(value)}>The quick brown fox jumps over the lazy dog.</span>
          <code style={codeStyle}>{JSON.stringify(value)}</code>
        </div>
      );
    }
    if (draft.type === "spacing" || draft.type === "dimension" || draft.type === "radius") {
      const cssValue = String(value);
      return (
        <div style={tokenScalePreviewStyle}>
          <span
            style={{
              ...tokenScaleBoxStyle,
              width: draft.type === "radius" ? 96 : cssValue,
              height: draft.type === "spacing" || draft.type === "dimension" ? 24 : 72,
              borderRadius: draft.type === "radius" ? cssValue : 4,
            }}
          />
          <code style={codeStyle}>{cssValue}</code>
        </div>
      );
    }
    return <code style={codeBlockStyle}>{JSON.stringify(value, null, 2)}</code>;
  } catch (error) {
    return (
      <span style={errorTextStyle}>
        {error instanceof Error ? error.message : "Preview value is invalid."}
      </span>
    );
  }
}

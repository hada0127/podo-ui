import type { Dispatch, SetStateAction } from "react";
import type { DesignToken, TokenDocument } from "@podo/spec";
import { editorTokenTypes, type EditorTokenDraft, type EditorTokenRecord } from "./spec-editing.js";
import { createNewTokenDraft } from "./drafts.js";
import {
  groupTokenRecordsByType,
  tokenRecordKey,
  type TokenMatrixModel,
  type TypographyTokenField,
  type TypographyWorkspaceModel,
} from "./token-model.js";
import { isHexColorInputValue, type TokenLookup } from "./token-lookup.js";
import {
  renderTokenDraftPreview,
  renderTokenMatrixEditor,
  renderTypographyTokenEditor,
} from "./token-editor.js";
import { renderFontAttachmentDraftEditor } from "./fonts.js";
import {
  dangerButtonStyle,
  detailPanelBodyStyle,
  disclosureStyle,
  errorBannerStyle,
  fieldStyle,
  formGridStyle,
  inputStyle,
  listStyle,
  nestedDisclosureStyle,
  nestedSummaryStyle,
  previewPanelStyle,
  rowStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  selectStyle,
  sidebarTitleStyle,
  smallButtonStyle,
  summaryStyle,
  textareaStyle,
  tokenColorInputStyle,
  tokenTypeButtonActiveStyle,
  tokenTypeButtonStyle,
  tokenTypeMetaStyle,
  tokenTypeNameStyle,
  tokenValueEditorPlainStyle,
  tokenValueEditorStyle,
  toolbarButtonStyle,
} from "./styles.js";

export function TokensPanelControls({
  tokenGroups,
  tokenDraft,
  typographyWorkspaceActive,
  setSelectedTokenKey,
  setTokenDraft,
  selectTokenType,
}: {
  tokenGroups: ReturnType<typeof groupTokenRecordsByType>;
  tokenDraft: EditorTokenDraft;
  typographyWorkspaceActive: boolean;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  setTokenDraft: Dispatch<SetStateAction<EditorTokenDraft>>;
  selectTokenType: (type: DesignToken["$type"]) => void;
}) {
  return (
    <>
      <div style={sidebarTitleStyle}>Tokens</div>
      <button
        type="button"
        style={toolbarButtonStyle}
        onClick={() => {
          setSelectedTokenKey(undefined);
          setTokenDraft(createNewTokenDraft());
        }}
      >
        New token
      </button>
      <div style={listStyle}>
        {tokenGroups.map((group) => {
          const active =
            group.type === "typography"
              ? typographyWorkspaceActive
              : tokenDraft.type === group.type;
          return (
            <button
              key={group.type}
              type="button"
              style={{
                ...tokenTypeButtonStyle,
                ...(active ? tokenTypeButtonActiveStyle : {}),
              }}
              onClick={() => selectTokenType(group.type)}
            >
              <span style={tokenTypeNameStyle}>{group.label}</span>
              <small style={tokenTypeMetaStyle}>
                {group.count} tokens / {group.sections.length} groups
              </small>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function TokensPanelWorkspace({
  tokenRecords,
  tokenDocumentsState,
  tokenDraft,
  setTokenDraft,
  tokenDraftError,
  selectedToken,
  selectedTokenKey,
  setSelectedTokenKey,
  typographyWorkspaceActive,
  typographyWorkspace,
  tokenMatrix,
  previewTokenLookup,
  saveTokenDraft,
  deleteSelectedToken,
  updateTokenMatrixCell,
  updateTypographyTokenField,
  attachFontAssetToRecord,
  removeFontAssetFromRecord,
  attachFontAssetToDraft,
  removeFontAssetFromDraft,
}: {
  tokenRecords: EditorTokenRecord[];
  tokenDocumentsState: TokenDocument[];
  tokenDraft: EditorTokenDraft;
  setTokenDraft: Dispatch<SetStateAction<EditorTokenDraft>>;
  tokenDraftError: string | undefined;
  selectedToken: EditorTokenRecord | undefined;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  typographyWorkspaceActive: boolean;
  typographyWorkspace: TypographyWorkspaceModel;
  tokenMatrix: TokenMatrixModel;
  previewTokenLookup: TokenLookup;
  saveTokenDraft: () => void;
  deleteSelectedToken: () => void;
  updateTokenMatrixCell: (record: EditorTokenRecord, valueText: string) => void;
  updateTypographyTokenField: (
    record: EditorTokenRecord,
    field: TypographyTokenField,
    valueText: string
  ) => void;
  attachFontAssetToRecord: (record: EditorTokenRecord, file: File) => Promise<void>;
  removeFontAssetFromRecord: (record: EditorTokenRecord) => void;
  attachFontAssetToDraft: (file: File) => Promise<void>;
  removeFontAssetFromDraft: () => void;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>Tokens</h1>
          <p style={sectionMetaStyle}>{tokenRecords.length} JSON token specs</p>
        </div>
        <div style={rowStyle}>
          <button type="button" style={smallButtonStyle} onClick={saveTokenDraft}>
            Save token
          </button>
          <button
            type="button"
            style={dangerButtonStyle}
            disabled={!selectedToken}
            onClick={deleteSelectedToken}
          >
            Delete
          </button>
        </div>
      </div>
      {typographyWorkspaceActive
        ? renderTypographyTokenEditor({
            model: typographyWorkspace,
            selectedTokenKey,
            lookup: previewTokenLookup,
            onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
            onCommitValue: updateTokenMatrixCell,
            onCommitTypographyField: updateTypographyTokenField,
            onAttachFont: attachFontAssetToRecord,
            onRemoveFontAsset: removeFontAssetFromRecord,
          })
        : renderTokenMatrixEditor({
            matrix: tokenMatrix,
            selectedTokenKey,
            onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
            onCommitValue: updateTokenMatrixCell,
          })}
      {tokenDraftError ? <div style={errorBannerStyle}>{tokenDraftError}</div> : null}
      <details style={disclosureStyle}>
        <summary style={summaryStyle}>Selected token detail</summary>
        <div style={detailPanelBodyStyle}>
          <div style={formGridStyle}>
            <label style={fieldStyle}>
              Path
              <input
                style={inputStyle}
                value={tokenDraft.path}
                onChange={(event) => {
                  const path = event.currentTarget.value;
                  setTokenDraft((draft) => ({ ...draft, path }));
                }}
              />
            </label>
            <label style={fieldStyle}>
              Type
              <select
                style={selectStyle}
                value={tokenDraft.type}
                onChange={(event) => {
                  const type = event.currentTarget.value as EditorTokenDraft["type"];
                  setTokenDraft((draft) => ({
                    ...draft,
                    type,
                  }));
                }}
              >
                {editorTokenTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              Value
              <div
                style={
                  tokenDraft.type === "color" ? tokenValueEditorStyle : tokenValueEditorPlainStyle
                }
              >
                {tokenDraft.type === "color" ? (
                  <input
                    aria-label="Color value"
                    type="color"
                    style={tokenColorInputStyle}
                    value={
                      isHexColorInputValue(tokenDraft.valueText) ? tokenDraft.valueText : "#000000"
                    }
                    onChange={(event) => {
                      const valueText = event.currentTarget.value;
                      setTokenDraft((draft) => ({ ...draft, valueText }));
                    }}
                  />
                ) : null}
                <textarea
                  style={{
                    ...textareaStyle,
                    minHeight: tokenDraft.type === "typography" ? 120 : 72,
                  }}
                  value={tokenDraft.valueText}
                  onChange={(event) => {
                    const valueText = event.currentTarget.value;
                    setTokenDraft((draft) => ({ ...draft, valueText }));
                  }}
                />
                {tokenDraft.type === "fontFamily"
                  ? renderFontAttachmentDraftEditor({
                      draft: tokenDraft,
                      onAttach: attachFontAssetToDraft,
                      onRemove: removeFontAssetFromDraft,
                    })
                  : null}
              </div>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              Description
              <input
                style={inputStyle}
                value={tokenDraft.description ?? ""}
                onChange={(event) => {
                  const description = event.currentTarget.value;
                  setTokenDraft((draft) => ({
                    ...draft,
                    description,
                  }));
                }}
              />
            </label>
            <details style={{ ...nestedDisclosureStyle, gridColumn: "1 / -1" }}>
              <summary style={nestedSummaryStyle}>Extensions JSON</summary>
              <textarea
                style={{ ...textareaStyle, minHeight: 120, marginTop: 8 }}
                value={tokenDraft.extensionsText ?? ""}
                onChange={(event) => {
                  const extensionsText = event.currentTarget.value;
                  setTokenDraft((draft) => ({
                    ...draft,
                    extensionsText,
                  }));
                }}
              />
            </details>
          </div>
          <div style={previewPanelStyle}>
            <strong>Preview</strong>
            {renderTokenDraftPreview(tokenDraft, previewTokenLookup)}
          </div>
        </div>
      </details>
      <details style={disclosureStyle}>
        <summary style={summaryStyle}>Document JSON</summary>
        <textarea
          style={{ ...textareaStyle, minHeight: 220 }}
          readOnly
          value={JSON.stringify(tokenDocumentsState, null, 2)}
        />
      </details>
    </section>
  );
}

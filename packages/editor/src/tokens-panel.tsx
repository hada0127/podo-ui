import type { Dispatch, SetStateAction } from "react";
import type { DesignToken } from "@podo/spec";
import { type EditorTokenDraft, type EditorTokenRecord } from "./spec-editing.js";
import {
  groupTokenRecordsByType,
  tokenRecordKey,
  type ColorComparisonMatrixModel,
  type TokenMatrixModel,
  type TypographyTokenField,
  type TypographyWorkspaceModel,
} from "./token-model.js";
import { type TokenLookup } from "./token-lookup.js";
import type { TokenPickerOption } from "./token-picker.js";
import {
  renderColorComparisonMatrix,
  renderScalarScaleEditor,
  renderTokenMatrixEditor,
  renderTypographyTokenEditor,
} from "./token-editor.js";
import {
  errorBannerStyle,
  listStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  sidebarTitleStyle,
  tokenTypeButtonActiveStyle,
  tokenTypeButtonStyle,
  tokenTypeMetaStyle,
  tokenTypeNameStyle,
} from "./styles.js";

export function TokensPanelControls({
  tokenGroups,
  tokenDraft,
  typographyWorkspaceActive,
  selectTokenType,
}: {
  tokenGroups: ReturnType<typeof groupTokenRecordsByType>;
  tokenDraft: EditorTokenDraft;
  typographyWorkspaceActive: boolean;
  selectTokenType: (type: DesignToken["$type"]) => void;
}) {
  return (
    <>
      <div style={sidebarTitleStyle}>Tokens</div>
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
  tokenDraft,
  tokenDraftError,
  selectedTokenKey,
  setSelectedTokenKey,
  typographyWorkspaceActive,
  typographyWorkspace,
  tokenMatrix,
  colorComparisonMatrix,
  colorTokenPickerOptions,
  previewTokenLookup,
  lightTokenLookup,
  darkTokenLookup,
  updateTokenMatrixCell,
  createColorCounterpart,
  updateTypographyTokenField,
  attachFontAssetToRecord,
  removeFontAssetFromRecord,
  createTypographyToken,
  deleteTokenRecord,
  deleteTokenRecords,
  toggleFamilyWeight,
}: {
  tokenRecords: EditorTokenRecord[];
  tokenDraft: EditorTokenDraft;
  tokenDraftError: string | undefined;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  typographyWorkspaceActive: boolean;
  typographyWorkspace: TypographyWorkspaceModel;
  tokenMatrix: TokenMatrixModel;
  colorComparisonMatrix: ColorComparisonMatrixModel;
  colorTokenPickerOptions: TokenPickerOption[];
  previewTokenLookup: TokenLookup;
  lightTokenLookup: TokenLookup;
  darkTokenLookup: TokenLookup;
  updateTokenMatrixCell: (record: EditorTokenRecord, valueText: string) => void;
  createColorCounterpart: (targetPath: string, seedRecord: EditorTokenRecord) => void;
  updateTypographyTokenField: (
    record: EditorTokenRecord,
    field: TypographyTokenField,
    valueText: string
  ) => void;
  attachFontAssetToRecord: (record: EditorTokenRecord, file: File) => Promise<void>;
  removeFontAssetFromRecord: (record: EditorTokenRecord) => void;
  createTypographyToken: (input: {
    type: DesignToken["$type"];
    path: string;
    valueText: string;
  }) => void;
  deleteTokenRecord: (record: EditorTokenRecord) => void;
  deleteTokenRecords: (records: EditorTokenRecord[]) => void;
  toggleFamilyWeight: (
    record: EditorTokenRecord,
    weightValue: number,
    defaultWeights: number[]
  ) => void;
}) {
  const scalarLabel = tokenDraft.type === "radius" ? "Radius" : "Spacing";
  const scalarRecords = tokenRecords.filter((record) => record.token.$type === tokenDraft.type);
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>Tokens</h1>
          <p style={sectionMetaStyle}>{tokenRecords.length} JSON token specs</p>
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
            onCreateToken: createTypographyToken,
            onDeleteToken: deleteTokenRecord,
            onToggleFamilyWeight: toggleFamilyWeight,
          })
        : tokenDraft.type === "color"
          ? renderColorComparisonMatrix({
              model: colorComparisonMatrix,
              lightLookup: lightTokenLookup,
              darkLookup: darkTokenLookup,
              tokenOptions: colorTokenPickerOptions,
              selectedTokenKey,
              onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
              onCommitValue: updateTokenMatrixCell,
              onCreateCounterpart: createColorCounterpart,
              onCreateToken: createTypographyToken,
              onDeleteVariation: deleteTokenRecords,
            })
          : tokenDraft.type === "spacing" || tokenDraft.type === "radius"
            ? renderScalarScaleEditor({
                type: tokenDraft.type,
                label: scalarLabel,
                records: scalarRecords,
                lookup: previewTokenLookup,
                selectedTokenKey,
                onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                onCommitValue: updateTokenMatrixCell,
                onCreateToken: createTypographyToken,
                onDeleteToken: deleteTokenRecord,
              })
            : renderTokenMatrixEditor({
                matrix: tokenMatrix,
                selectedTokenKey,
                onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                onCommitValue: updateTokenMatrixCell,
              })}
      {tokenDraftError ? <div style={errorBannerStyle}>{tokenDraftError}</div> : null}
    </section>
  );
}

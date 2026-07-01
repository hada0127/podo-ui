import type { Dispatch, SetStateAction } from "react";
import type { DesignToken } from "@podo/spec";
import { type EditorTokenDraft, type EditorTokenRecord } from "./spec-editing.js";
import {
  tokenRecordKey,
  type ColorComparisonMatrixModel,
  type TokenMatrixModel,
  type TokenTypeGroup,
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
import { useT } from "./i18n/context.js";

export function TokensPanelControls({
  tokenGroups,
  tokenDraft,
  typographyWorkspaceActive,
  baseColorView,
  onSelectGroup,
}: {
  tokenGroups: TokenTypeGroup[];
  tokenDraft: EditorTokenDraft;
  typographyWorkspaceActive: boolean;
  baseColorView: boolean;
  onSelectGroup: (group: TokenTypeGroup) => void;
}) {
  const t = useT();
  return (
    <>
      <div style={sidebarTitleStyle}>{t("tokensPanel.title")}</div>
      <div style={listStyle}>
        {tokenGroups.map((group) => {
          const active =
            group.view === "baseColor"
              ? baseColorView
              : group.type === "typography"
                ? typographyWorkspaceActive
                : !baseColorView && tokenDraft.type === group.type;
          return (
            <button
              key={group.view ?? group.type}
              type="button"
              style={{
                ...tokenTypeButtonStyle,
                ...(active ? tokenTypeButtonActiveStyle : {}),
              }}
              onClick={() => onSelectGroup(group)}
            >
              <span style={tokenTypeNameStyle}>{group.label}</span>
              <small style={tokenTypeMetaStyle}>
                {t("tokensPanel.groupSummary", {
                  count: group.count,
                  groups: group.sections.length,
                })}
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
  baseColorView,
  typographyWorkspace,
  tokenMatrix,
  basicColorMatrix,
  baseColorMatrix,
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
  requestDeleteColorVariation,
  requestDeleteColorGroup,
  requestDeleteScalarToken,
  renameColorGroup,
  toggleFamilyWeight,
}: {
  tokenRecords: EditorTokenRecord[];
  tokenDraft: EditorTokenDraft;
  tokenDraftError: string | undefined;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  typographyWorkspaceActive: boolean;
  baseColorView: boolean;
  typographyWorkspace: TypographyWorkspaceModel;
  tokenMatrix: TokenMatrixModel;
  basicColorMatrix: ColorComparisonMatrixModel;
  baseColorMatrix: ColorComparisonMatrixModel;
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
  requestDeleteColorVariation: (records: EditorTokenRecord[]) => void;
  requestDeleteColorGroup: (groupId: string) => void;
  requestDeleteScalarToken: (record: EditorTokenRecord) => void;
  renameColorGroup: (groupId: string, nextName: string) => void;
  toggleFamilyWeight: (
    record: EditorTokenRecord,
    weightValue: number,
    defaultWeights: number[]
  ) => void;
}) {
  const t = useT();
  const scalarLabel =
    tokenDraft.type === "radius"
      ? t("tokensPanel.scalarLabel.radius")
      : t("tokensPanel.scalarLabel.spacing");
  const scalarRecords = tokenRecords.filter((record) => record.token.$type === tokenDraft.type);
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>{t("tokensPanel.title")}</h1>
          <p style={sectionMetaStyle}>
            {t("tokensPanel.metaSpecs", { count: tokenRecords.length })}
          </p>
        </div>
      </div>
      {typographyWorkspaceActive
        ? renderTypographyTokenEditor({
            t,
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
        : baseColorView || tokenDraft.type === "color"
          ? renderColorComparisonMatrix({
              t,
              model: baseColorView ? baseColorMatrix : basicColorMatrix,
              ...(baseColorView ? { title: t("tokenEditor.baseColorMatrix") } : {}),
              lightLookup: lightTokenLookup,
              darkLookup: darkTokenLookup,
              tokenOptions: colorTokenPickerOptions,
              selectedTokenKey,
              onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
              onCommitValue: updateTokenMatrixCell,
              onCreateCounterpart: createColorCounterpart,
              onCreateToken: createTypographyToken,
              onDeleteVariation: requestDeleteColorVariation,
              onDeleteGroup: requestDeleteColorGroup,
              onRenameGroup: renameColorGroup,
            })
          : tokenDraft.type === "spacing" || tokenDraft.type === "radius"
            ? renderScalarScaleEditor({
                t,
                type: tokenDraft.type,
                label: scalarLabel,
                records: scalarRecords,
                lookup: previewTokenLookup,
                selectedTokenKey,
                onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                onCommitValue: updateTokenMatrixCell,
                onCreateToken: createTypographyToken,
                onDeleteToken: requestDeleteScalarToken,
              })
            : renderTokenMatrixEditor({
                t,
                matrix: tokenMatrix,
                selectedTokenKey,
                onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                onCommitValue: updateTokenMatrixCell,
              })}
      {tokenDraftError ? <div style={errorBannerStyle}>{tokenDraftError}</div> : null}
    </section>
  );
}

import { useState, type Dispatch, type SetStateAction } from "react";
import type { DesignToken } from "@podo/spec";
import type { EditorTokenRecord } from "./spec-editing.js";
import { inferFontFamilyName } from "./fonts.js";
import { useT } from "./i18n/context.js";
import { tokenVariationName, type TokenLookup } from "./token-lookup.js";
import { renderTypographyStyleCard, type TypographyEditorInput } from "./token-editor.js";
import {
  tokenRecordKey,
  type TypographyTokenField,
  type TypographyWorkspaceModel,
} from "./token-model.js";
import {
  fieldStyle,
  inlineHelpStyle,
  projectRoleAddButtonStyle,
  projectRoleAddCardStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  selectStyle,
  sidebarTitleStyle,
  styleCardGridStyle,
  summaryListStyle,
  typographyCardHeaderStyle,
  typographyCardMetaStyle,
  typographyCardStyle,
} from "./styles.js";

// Project-wide base text roles. Missing roles are offered as "+ Add"; the
// default values give a sensible starting scale that the project can tune.
const BASE_ROLES: Array<{
  role: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
}> = [
  { role: "h1", fontSize: "32px", lineHeight: "40px", fontWeight: 700 },
  { role: "h2", fontSize: "28px", lineHeight: "36px", fontWeight: 700 },
  { role: "h3", fontSize: "24px", lineHeight: "32px", fontWeight: 600 },
  { role: "body", fontSize: "16px", lineHeight: "24px", fontWeight: 400 },
  { role: "caption", fontSize: "12px", lineHeight: "16px", fontWeight: 400 },
];

interface ProjectPanelData {
  typographyWorkspace: TypographyWorkspaceModel;
  previewTokenLookup: TokenLookup;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  updateTokenMatrixCell: (record: EditorTokenRecord, valueText: string) => void;
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
}

function baseRoleRecord(
  model: TypographyWorkspaceModel,
  role: string
): EditorTokenRecord | undefined {
  return model.styles.find((record) => tokenVariationName(record.path) === role);
}

export function ProjectPanelControls({
  typographyWorkspace,
}: {
  typographyWorkspace: TypographyWorkspaceModel;
}) {
  const t = useT();
  const definedRoles = BASE_ROLES.filter((entry) =>
    Boolean(baseRoleRecord(typographyWorkspace, entry.role))
  ).length;
  return (
    <>
      <div style={sidebarTitleStyle}>{t("projectPanel.title")}</div>
      <div style={summaryListStyle}>
        <span>
          {t("projectPanel.baseStylesCount", {
            defined: definedRoles,
            total: BASE_ROLES.length,
          })}
        </span>
        <span>
          {t("projectPanel.fontFamiliesCount", {
            count: typographyWorkspace.families.length,
          })}
        </span>
        <span>
          {t("projectPanel.textStylesCount", {
            count: typographyWorkspace.styles.length,
          })}
        </span>
      </div>
    </>
  );
}

export function ProjectPanelWorkspace({
  typographyWorkspace,
  previewTokenLookup,
  selectedTokenKey,
  setSelectedTokenKey,
  updateTokenMatrixCell,
  updateTypographyTokenField,
  attachFontAssetToRecord,
  removeFontAssetFromRecord,
  createTypographyToken,
}: ProjectPanelData) {
  const t = useT();
  const families = typographyWorkspace.families.map((record) =>
    inferFontFamilyName(record.token.$value, record.path)
  );
  const [defaultFamily, setDefaultFamily] = useState(families[0] ?? "Inter");

  const typographyInput: TypographyEditorInput = {
    t,
    model: typographyWorkspace,
    selectedTokenKey,
    lookup: previewTokenLookup,
    onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
    onCommitValue: updateTokenMatrixCell,
    onCommitTypographyField: updateTypographyTokenField,
    onAttachFont: attachFontAssetToRecord,
    onRemoveFontAsset: removeFontAssetFromRecord,
  };

  const createRole = (entry: (typeof BASE_ROLES)[number]): void => {
    createTypographyToken({
      type: "typography",
      path: `typography.${entry.role}`,
      valueText: JSON.stringify({
        fontFamily: defaultFamily,
        fontSize: entry.fontSize,
        lineHeight: entry.lineHeight,
        fontWeight: entry.fontWeight,
        letterSpacing: "0px",
      }),
    });
  };

  // Changing the default family re-points every existing base role's fontFamily,
  // so the project's headings/body all follow the chosen font in one step.
  const applyDefaultFamily = (family: string): void => {
    setDefaultFamily(family);
    for (const entry of BASE_ROLES) {
      const record = baseRoleRecord(typographyWorkspace, entry.role);
      if (record) {
        updateTypographyTokenField(record, "fontFamily", family);
      }
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>{t("projectPanel.defaultsHeading")}</h1>
          <p style={sectionMetaStyle}>{t("projectPanel.defaultsMeta")}</p>
        </div>
      </div>

      <section style={typographyCardStyle}>
        <div style={typographyCardHeaderStyle}>
          <span>{t("projectPanel.defaultFontFamily")}</span>
          <span style={typographyCardMetaStyle}>
            {t("projectPanel.familiesAvailable", {
              count: typographyWorkspace.families.length,
            })}
          </span>
        </div>
        <label style={fieldStyle}>
          {t("projectPanel.familyLabel")}
          {families.length ? (
            <select
              aria-label={t("projectPanel.defaultFontFamily")}
              style={selectStyle}
              value={defaultFamily}
              onChange={(event) => applyDefaultFamily(event.currentTarget.value)}
            >
              {families.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>
          ) : (
            <span style={inlineHelpStyle}>{t("projectPanel.addFamilyHelp")}</span>
          )}
        </label>
      </section>

      <section style={typographyCardStyle}>
        <div style={typographyCardHeaderStyle}>
          <span>{t("projectPanel.baseTextStyles")}</span>
          <span style={typographyCardMetaStyle}>{t("projectPanel.baseTextStylesMeta")}</span>
        </div>
        <div style={styleCardGridStyle}>
          {BASE_ROLES.map((entry) => {
            const record = baseRoleRecord(typographyWorkspace, entry.role);
            if (record) {
              return renderTypographyStyleCard(record, typographyInput);
            }
            return (
              <div key={entry.role} style={projectRoleAddCardStyle}>
                <strong>{entry.role}</strong>
                <span style={inlineHelpStyle}>
                  {entry.fontSize}/{entry.lineHeight} · {entry.fontWeight}
                </span>
                <button
                  type="button"
                  style={projectRoleAddButtonStyle}
                  onClick={() => createRole(entry)}
                >
                  {t("projectPanel.addRole", { role: entry.role })}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

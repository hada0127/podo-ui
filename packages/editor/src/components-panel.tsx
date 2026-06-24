import { useState, type Dispatch, type SetStateAction } from "react";
import type { ComponentDocument } from "@podo/spec";
import { editorPropKinds, type EditorTokenRecord } from "./spec-editing.js";
import { TokenPicker, type TokenPickerOption } from "./token-picker.js";
import {
  createNewComponentPropDraft,
  createNewComponentSlotDraft,
  createNewComponentVariantDraft,
  type ComponentEditMode,
  type ComponentMetaDraft,
  type ComponentPropDraft,
  type ComponentSlotDraft,
  type ComponentVariantDraft,
} from "./drafts.js";
import { tokenRecordKey, type ComponentTokenEditorModel } from "./token-model.js";
import { cssToken, type TokenLookup } from "./token-lookup.js";
import { renderComponentTokenEditor } from "./token-editor.js";
import { renderComponentPreview, renderComponentPreviewMatrix } from "./previews.js";
import { LayersPanel } from "./component-layers.js";
import { IconPicker } from "./icon-picker.js";
import { useT, type Translate } from "./i18n/context.js";
import {
  appearanceGroupStyle,
  appearanceGroupTitleStyle,
  appearanceGroupsStyle,
  appearanceHeaderStyle,
  appearanceRemoveStyle,
  appearanceRowStyle,
  appearanceValueStyle,
  cardHeaderStyle,
  cardStyle,
  checkboxFieldStyle,
  compactFormGridStyle,
  layersColumnStyle,
  swatchStyle,
  componentEditModeBarStyle,
  componentEditModeButtonActiveStyle,
  componentEditModeButtonStyle,
  componentListButtonActiveStyle,
  componentListButtonStyle,
  componentListIdStyle,
  componentListNameStyle,
  componentListStyle,
  componentPanelWorkspaceLayout,
  componentPreviewPanelStyle,
  componentStatRowStyle,
  dangerButtonStyle,
  disclosureStyle,
  editSchemaBodyStyle,
  editorFormStyle,
  emptyListStyle,
  errorBannerStyle,
  fieldStyle,
  inputStyle,
  propLabelStyle,
  propRowStyle,
  propertiesRailStyle,
  railFieldsStyle,
  railSectionTitleStyle,
  rowStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionTitleStyle,
  selectStyle,
  stickyPreviewColumnStyle,
  sidebarTitleStyle,
  smallButtonStyle,
  summaryStyle,
  tableCellMetaStyle,
  tableCellTextStyle,
  tableRowActiveStyle,
  tableRowStyle,
  tableStyle,
  textareaStyle,
  tokenChipNameStyle,
  tokenChipStyle,
  tokenChipValueStyle,
  variantValueRowStyle,
} from "./styles.js";

const componentCategories: ComponentDocument["category"][] = [
  "atom",
  "molecule",
  "organism",
  "template",
  "layout",
  "utility",
];
const componentStatuses: ComponentDocument["status"][] = [
  "draft",
  "experimental",
  "stable",
  "deprecated",
];

// Anatomy parts double as Figma-style "layers"; entries may be plain strings or
// {name, targets} objects.
function anatomyPartNames(component: ComponentDocument): string[] {
  const parts = (component.anatomy ?? []).map((entry) =>
    typeof entry === "string" ? entry : entry.name
  );
  return parts.length ? parts : ["root"];
}

function humanizeLabel(name: string): string {
  return name.replace(/[-_.]/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

// Localized label for a known appearance property (background, borderColor,
// paddingX, …). Falls back to the humanized key for custom/unknown properties so
// the section headers and their property labels stay consistent across locales.
function appearancePropertyLabel(property: string, t: Translate): string {
  const key = `components.prop.${property.toLowerCase().replace(/[-_.\s]/g, "")}`;
  const localized = t(key);
  return localized === key ? humanizeLabel(property) : localized;
}

// Heuristic: which appearance properties are colors (swatch + color picker) vs
// dimensions/typography (value + token picker).
function isColorAppearanceProperty(property: string): boolean {
  return /(^|[.-])(background|color|fill|stroke|shadow)$|border-?color/i.test(property);
}

// Pencil/Figma-style inspector grouping: properties are organized into named
// sections instead of one flat list.
const APPEARANCE_GROUP_ORDER = [
  "Fill",
  "Stroke",
  "Corners",
  "Layout",
  "Typography",
  "Effects",
  "Other",
] as const;
// The token `$type`s a given appearance property may bind to, so the picker only
// offers matching tokens (color→color, radius→radius, padding→spacing, font→…).
function allowedTokenTypes(property: string): string[] {
  const value = property.toLowerCase();
  if (/background|^color$|fill|border-?color|stroke|shadow/.test(value)) return ["color"];
  if (/radius|corner/.test(value)) return ["radius"];
  if (/padding|gap|margin/.test(value)) return ["spacing"];
  if (/border-?width|outline-?width|width|height/.test(value)) return ["dimension"];
  if (/font-?family/.test(value)) return ["fontFamily"];
  if (/font-?weight/.test(value)) return ["fontWeight"];
  if (/typography/.test(value)) return ["typography"];
  if (/font-?size|line-?height|letter-?spacing/.test(value)) return ["dimension"];
  if (/opacity/.test(value)) return ["number"];
  return [];
}

// Structural dimensions/numbers (height, width, border-width, opacity) need not be
// tokenized — they get a raw value input instead of a token picker.
function isRawValueProperty(property: string): boolean {
  const types = allowedTokenTypes(property);
  return types.length === 1 && (types[0] === "dimension" || types[0] === "number");
}

function appearanceGroup(property: string): (typeof APPEARANCE_GROUP_ORDER)[number] {
  const value = property.toLowerCase();
  if (/radius|corner/.test(value)) return "Corners";
  if (/border|stroke|outline/.test(value)) return "Stroke";
  if (/background|^color$|fill/.test(value)) return "Fill";
  if (/font|typography|line-?height|letter/.test(value)) return "Typography";
  if (/padding|gap|margin|width|height/.test(value)) return "Layout";
  if (/opacity|shadow|blur/.test(value)) return "Effects";
  return "Other";
}

// Common appearance properties offered by the "+ Add property" control, with a
// sensible default token alias so a fresh row is immediately valid.
const COMMON_APPEARANCE_PROPERTIES: Array<{ property: string; defaultAlias: string }> = [
  { property: "background", defaultAlias: "{color.bg.modal}" },
  { property: "color", defaultAlias: "{color.text.body}" },
  { property: "border-color", defaultAlias: "{color.border.base}" },
  { property: "radius", defaultAlias: "{radius.scale.2}" },
  { property: "padding", defaultAlias: "{spacing.scale.2}" },
  { property: "gap", defaultAlias: "{spacing.scale.2}" },
  { property: "typography", defaultAlias: "{typography.paragraph.p3}" },
];

// Components whose primary text is anatomy/children (not a spec prop), so the
// preview exposes a synthetic "Text" control that feeds the reserved `text`
// selection key (renderers read it via previewText()).
const PREVIEW_TEXT_COMPONENT_IDS = new Set(["button", "chip", "label", "checkbox-radio", "toggle"]);

export function ComponentsPanelControls({
  componentSearch,
  setComponentSearch,
  filteredComponents,
  selectedComponentForSpec,
  setSelectedComponentId,
}: {
  componentSearch: string;
  setComponentSearch: Dispatch<SetStateAction<string>>;
  filteredComponents: ComponentDocument[];
  selectedComponentForSpec: ComponentDocument | undefined;
  setSelectedComponentId: Dispatch<SetStateAction<string | undefined>>;
}) {
  const t = useT();
  return (
    <>
      <div style={sidebarTitleStyle}>{t("components.heading")}</div>
      <input
        aria-label={t("components.search")}
        placeholder={t("components.search")}
        style={inputStyle}
        value={componentSearch}
        onChange={(event) => setComponentSearch(event.currentTarget.value)}
      />
      <div style={componentListStyle}>
        {filteredComponents.map((component) => (
          <button
            key={component.id}
            type="button"
            title={`${component.name} / ${component.id}`}
            style={{
              ...componentListButtonStyle,
              ...(selectedComponentForSpec?.id === component.id
                ? componentListButtonActiveStyle
                : {}),
            }}
            onClick={() => setSelectedComponentId(component.id)}
          >
            <span style={componentListNameStyle}>{component.name}</span>
            <small style={componentListIdStyle}>{component.id}</small>
          </button>
        ))}
        {filteredComponents.length ? null : (
          <span style={emptyListStyle}>{t("components.emptyList")}</span>
        )}
      </div>
    </>
  );
}

export function ComponentsPanelWorkspace({
  selectedComponentForSpec,
  componentEditMode,
  setComponentEditMode,
  componentMetaDraft,
  setComponentMetaDraft,
  componentDraftError,
  saveComponentMetaDraft,
  propDraft,
  setPropDraft,
  selectedPropName,
  setSelectedPropName,
  savePropDraft,
  deleteSelectedProp,
  variantDraft,
  setVariantDraft,
  selectedVariantName,
  setSelectedVariantName,
  saveVariantDraft,
  deleteSelectedVariant,
  slotDraft,
  setSlotDraft,
  selectedSlotName,
  setSelectedSlotName,
  saveSlotDraft,
  deleteSelectedSlot,
  selectedComponentTokenModel,
  selectedTokenKey,
  setSelectedTokenKey,
  updateTokenMatrixCell,
  updateComponentTokenBinding,
  updateComponentVariantValueTokenBinding,
  renameAnatomyPart,
  addAnatomyPart,
  removeAnatomyPart,
  reorderAnatomyPart,
  reparentAnatomyPart,
  moveAnatomyPart,
  tokenPickerOptions,
  previewTokenLookup,
  iconNames,
  effectiveComponentPreviewSelections,
  setComponentPreviewSelections,
}: {
  selectedComponentForSpec: ComponentDocument;
  componentEditMode: ComponentEditMode;
  setComponentEditMode: Dispatch<SetStateAction<ComponentEditMode>>;
  componentMetaDraft: ComponentMetaDraft;
  setComponentMetaDraft: Dispatch<SetStateAction<ComponentMetaDraft>>;
  componentDraftError: string | undefined;
  saveComponentMetaDraft: () => void;
  propDraft: ComponentPropDraft;
  setPropDraft: Dispatch<SetStateAction<ComponentPropDraft>>;
  selectedPropName: string | undefined;
  setSelectedPropName: Dispatch<SetStateAction<string | undefined>>;
  savePropDraft: () => void;
  deleteSelectedProp: () => void;
  variantDraft: ComponentVariantDraft;
  setVariantDraft: Dispatch<SetStateAction<ComponentVariantDraft>>;
  selectedVariantName: string | undefined;
  setSelectedVariantName: Dispatch<SetStateAction<string | undefined>>;
  saveVariantDraft: () => void;
  deleteSelectedVariant: () => void;
  slotDraft: ComponentSlotDraft;
  setSlotDraft: Dispatch<SetStateAction<ComponentSlotDraft>>;
  selectedSlotName: string | undefined;
  setSelectedSlotName: Dispatch<SetStateAction<string | undefined>>;
  saveSlotDraft: () => void;
  deleteSelectedSlot: () => void;
  selectedComponentTokenModel: ComponentTokenEditorModel;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  updateTokenMatrixCell: (record: EditorTokenRecord, valueText: string) => void;
  updateComponentTokenBinding: (key: string, reference: string) => void;
  updateComponentVariantValueTokenBinding: (
    variantName: string,
    value: string,
    key: string,
    reference: string
  ) => void;
  renameAnatomyPart: (fromName: string, toName: string) => void;
  addAnatomyPart: (name: string, parent?: string) => void;
  removeAnatomyPart: (partName: string) => void;
  reorderAnatomyPart: (partName: string, beforeName: string | null) => void;
  reparentAnatomyPart: (partName: string, newParent: string | null) => void;
  moveAnatomyPart: (partName: string, newParent: string | null, beforeName: string | null) => void;
  tokenPickerOptions: TokenPickerOption[];
  previewTokenLookup: TokenLookup;
  iconNames: string[];
  effectiveComponentPreviewSelections: Record<string, string>;
  setComponentPreviewSelections: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const t = useT();
  // Variant values are edited as structured rows (add/edit/delete + default
  // selection) rather than a raw comma string, while the draft keeps storing a
  // CSV `valuesText` so the save path stays unchanged.
  const variantValueRows = variantDraft.valuesText.split(",").map((value) => value.trim());
  const writeVariantValues = (rows: string[], nextDefault?: string): void => {
    setVariantDraft((draft) => {
      const valuesText = rows.join(", ");
      const defaultValue =
        nextDefault !== undefined
          ? nextDefault
          : rows.includes(draft.defaultValue)
            ? draft.defaultValue
            : (rows.find((row) => row.length > 0) ?? "");
      return { ...draft, valuesText, defaultValue };
    });
  };
  const updateVariantValue = (index: number, rawValue: string): void => {
    // Commas delimit values in the stored CSV, so a value can never contain one;
    // stripping here stops a typed comma from splitting the row mid-edit.
    const value = rawValue.replace(/,/g, "");
    const previous = variantValueRows[index];
    const rows = variantValueRows.map((row, rowIndex) => (rowIndex === index ? value : row));
    writeVariantValues(rows, variantDraft.defaultValue === previous ? value.trim() : undefined);
  };
  const removeVariantValue = (index: number): void => {
    writeVariantValues(variantValueRows.filter((_, rowIndex) => rowIndex !== index));
  };
  const addVariantValue = (): void => {
    writeVariantValues([...variantValueRows, ""]);
  };
  // Writes a variant/prop/state value into the live preview selections. Empty
  // clears the key so spec defaults take over (exactOptionalPropertyTypes-safe).
  const commitPreviewSelection = (name: string, value: string | boolean | undefined): void => {
    setComponentPreviewSelections((previous) => {
      const next = { ...previous };
      if (value === undefined || value === "") {
        delete next[name];
      } else {
        next[name] = String(value);
      }
      return next;
    });
  };
  // Figma-style layers (anatomy parts) + per-part appearance editing.
  const [selectedPart, setSelectedPart] = useState("");
  // Selection-driven right rail: "preview" (clicking the live preview) shows the
  // test controls; "design" (selecting a variant-set cell or a layer) shows that
  // selection's appearance/design properties.
  const [inspectorTarget, setInspectorTarget] = useState<"design" | "preview">("design");
  // Which appearance binding row is currently open for token picking.
  const [editingBindingKey, setEditingBindingKey] = useState<string | null>(null);
  // "Apply to" scope: base tokens, or a specific variant value (so editing a layer's
  // appearance can target just one variant like Figma). Options follow the live
  // selections, e.g. theme = primary.
  const [appearanceScope, setAppearanceScope] = useState("base");
  const anatomyParts = anatomyPartNames(selectedComponentForSpec);
  // Default to the first part that actually has appearance bindings (so e.g. toast
  // opens on its styled "toast" layer, not an empty "provider" layer).
  const partsWithBindings = new Set(
    Object.keys(selectedComponentForSpec.tokens ?? {}).map((key) => key.split(".")[0])
  );
  const activePart = anatomyParts.includes(selectedPart)
    ? selectedPart
    : (anatomyParts.find((part) => partsWithBindings.has(part)) ??
      (anatomyParts.includes("root") ? "root" : (anatomyParts[0] ?? "root")));
  const appearanceScopeOptions = selectedComponentForSpec.variants.map((variant) => {
    const value =
      effectiveComponentPreviewSelections[variant.name] ??
      variant.default ??
      variant.values[0] ??
      "";
    return { key: `${variant.name}::${value}`, label: `${variant.name} = ${value}` };
  });
  const activeScope = appearanceScopeOptions.some((option) => option.key === appearanceScope)
    ? appearanceScope
    : "base";
  // Effective bindings for the active scope: base tokens overlaid with the selected
  // variant value's overrides, so editing/removing in variant scope is reflected.
  const scopeTokens: Record<string, string> = (() => {
    const base = { ...(selectedComponentForSpec.tokens ?? {}) } as Record<string, string>;
    if (activeScope === "base") return base;
    const separator = activeScope.indexOf("::");
    const variantName = activeScope.slice(0, separator);
    const value = activeScope.slice(separator + 2);
    const variant = selectedComponentForSpec.variants.find((item) => item.name === variantName);
    return { ...base, ...((variant?.valueTokens?.[value] ?? {}) as Record<string, string>) };
  })();
  const partBindings = Object.entries(scopeTokens)
    .filter(([key]) => key.startsWith(`${activePart}.`))
    .map(([key, reference]) => ({
      key,
      property: key.slice(activePart.length + 1),
      reference: String(reference),
    }));
  const presentProperties = new Set(partBindings.map((binding) => binding.property));
  const addableProperties = COMMON_APPEARANCE_PROPERTIES.filter(
    (entry) => !presentProperties.has(entry.property)
  );
  const applyAppearanceBinding = (key: string, reference: string): void => {
    if (activeScope === "base") {
      updateComponentTokenBinding(key, reference);
      return;
    }
    const separator = activeScope.indexOf("::");
    updateComponentVariantValueTokenBinding(
      activeScope.slice(0, separator),
      activeScope.slice(separator + 2),
      key,
      reference
    );
  };
  // Picker options for an appearance field: only the GLOBAL design tokens of the
  // matching type (radius→radius.scale, spacing→spacing.scale, typography→fonts).
  // Component-local tokens (`component.*`) are excluded — you bind to the design
  // system, not a component's own derived aliases.
  const optionsForProperty = (property: string): TokenPickerOption[] => {
    const types = allowedTokenTypes(property);
    return tokenPickerOptions.filter((option) => {
      if (option.label.startsWith("component.")) return false;
      return types.length === 0 || (option.type !== undefined && types.includes(option.type));
    });
  };
  return (
    <section style={componentPanelWorkspaceLayout}>
      <aside style={layersColumnStyle}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <strong style={railSectionTitleStyle}>{t("components.layers")}</strong>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() => addAnatomyPart("layer")}
              title={t("components.addLayer")}
            >
              +
            </button>
          </div>
          <LayersPanel
            anatomy={selectedComponentForSpec.anatomy}
            selectedPart={activePart}
            onSelect={setSelectedPart}
            onRename={(from, to) => {
              renameAnatomyPart(from, to);
              setSelectedPart(to.trim() || from);
            }}
            onAdd={addAnatomyPart}
            onRemove={removeAnatomyPart}
            onReorder={reorderAnatomyPart}
            onReparent={reparentAnatomyPart}
            onMove={moveAnatomyPart}
          />
        </div>
      </aside>
      <div style={stickyPreviewColumnStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h1 style={sectionTitleStyle}>{selectedComponentForSpec.name}</h1>
            <p style={sectionMetaStyle}>{selectedComponentForSpec.id}.component.json</p>
          </div>
          <div style={componentStatRowStyle}>
            <span>
              {t("components.statProps", { count: selectedComponentForSpec.props.length })}
            </span>
            <span>
              {t("components.statVariants", { count: selectedComponentForSpec.variants.length })}
            </span>
            <span>
              {t("components.statStates", { count: selectedComponentForSpec.states.length })}
            </span>
          </div>
        </div>
        <details style={disclosureStyle}>
          <summary style={summaryStyle}>{t("components.details")}</summary>
          <div style={compactFormGridStyle}>
            <label style={fieldStyle}>
              {t("components.name")}
              <input
                style={inputStyle}
                value={componentMetaDraft.name}
                onChange={(event) => {
                  const name = event.currentTarget.value;
                  setComponentMetaDraft((draft) => ({
                    ...draft,
                    name,
                  }));
                }}
              />
            </label>
            <label style={fieldStyle}>
              {t("components.category")}
              <select
                style={selectStyle}
                value={componentMetaDraft.category}
                onChange={(event) => {
                  const category = event.currentTarget.value as ComponentDocument["category"];
                  setComponentMetaDraft((draft) => ({
                    ...draft,
                    category,
                  }));
                }}
              >
                {componentCategories.map((category) => (
                  <option key={category} value={category}>
                    {t(`components.category.${category}`)}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              {t("components.status")}
              <select
                style={selectStyle}
                value={componentMetaDraft.status}
                onChange={(event) => {
                  const status = event.currentTarget.value as ComponentDocument["status"];
                  setComponentMetaDraft((draft) => ({
                    ...draft,
                    status,
                  }));
                }}
              >
                {componentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`components.status.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              {t("components.description")}
              <input
                style={inputStyle}
                value={componentMetaDraft.description}
                onChange={(event) => {
                  const description = event.currentTarget.value;
                  setComponentMetaDraft((draft) => ({
                    ...draft,
                    description,
                  }));
                }}
              />
            </label>
            <div style={rowStyle}>
              <button type="button" style={smallButtonStyle} onClick={saveComponentMetaDraft}>
                {t("components.save")}
              </button>
            </div>
          </div>
        </details>
        <div
          style={
            inspectorTarget === "preview"
              ? { ...componentPreviewPanelStyle, outline: "2px solid #7aa7ee", outlineOffset: 2 }
              : { ...componentPreviewPanelStyle, cursor: "pointer" }
          }
          onClick={() => setInspectorTarget("preview")}
          title={t("components.previewTestHint")}
        >
          {renderComponentPreview(
            selectedComponentForSpec,
            effectiveComponentPreviewSelections,
            previewTokenLookup
          )}
        </div>
        {(() => {
          const matrix = renderComponentPreviewMatrix({
            component: selectedComponentForSpec,
            selections: effectiveComponentPreviewSelections,
            lookup: previewTokenLookup,
            onSelect: (next) => {
              setComponentPreviewSelections(next);
              setInspectorTarget("design");
            },
            t,
          });
          return matrix ? (
            <div style={componentPreviewPanelStyle}>
              <div style={cardHeaderStyle}>
                <strong style={railSectionTitleStyle}>{t("components.variantSet")}</strong>
              </div>
              {matrix}
            </div>
          ) : null;
        })()}
      </div>
      <div style={propertiesRailStyle}>
        <div style={componentEditModeBarStyle}>
          {(["design", "preview"] as const).map((target) => (
            <button
              key={target}
              type="button"
              aria-pressed={inspectorTarget === target}
              style={{
                ...componentEditModeButtonStyle,
                ...(inspectorTarget === target ? componentEditModeButtonActiveStyle : {}),
              }}
              onClick={() => setInspectorTarget(target)}
            >
              {target === "design"
                ? t("components.inspectorDesign")
                : t("components.inspectorTest")}
            </button>
          ))}
        </div>
        {inspectorTarget === "design" ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>
                {t("components.design", { part: humanizeLabel(activePart) })}
              </strong>
            </div>
            {appearanceScopeOptions.length ? (
              <label style={propRowStyle}>
                <span style={propLabelStyle}>{t("components.applyTo")}</span>
                <select
                  style={selectStyle}
                  value={activeScope}
                  onChange={(event) => setAppearanceScope(event.currentTarget.value)}
                >
                  <option value="base">{t("components.allVariantsBase")}</option>
                  {appearanceScopeOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div style={appearanceGroupsStyle}>
              {partBindings.length ? (
                APPEARANCE_GROUP_ORDER.filter((group) =>
                  partBindings.some((binding) => appearanceGroup(binding.property) === group)
                ).map((group) => (
                  <div key={group} style={appearanceGroupStyle}>
                    <span style={appearanceGroupTitleStyle}>{t(`components.group.${group}`)}</span>
                    {partBindings
                      .filter((binding) => appearanceGroup(binding.property) === group)
                      .map((binding) => {
                        const isColor = isColorAppearanceProperty(binding.property);
                        // A binding is a {token} alias or a raw CSS value.
                        const isAlias = binding.reference.startsWith("{");
                        const resolved = isAlias
                          ? cssToken(previewTokenLookup, binding.reference.slice(1, -1), "")
                          : binding.reference;
                        const tokenName = isAlias ? binding.reference.slice(1, -1) : "";
                        const raw = isRawValueProperty(binding.property);
                        return (
                          <div key={binding.key} style={appearanceRowStyle}>
                            <div style={appearanceHeaderStyle}>
                              <span style={propLabelStyle}>
                                {appearancePropertyLabel(binding.property, t)}
                              </span>
                              <button
                                type="button"
                                aria-label={t("components.removeProperty", {
                                  property: binding.property,
                                })}
                                style={appearanceRemoveStyle}
                                onClick={() => applyAppearanceBinding(binding.key, "")}
                              >
                                ×
                              </button>
                            </div>
                            {editingBindingKey === binding.key ? (
                              raw ? (
                                <input
                                  autoFocus
                                  type="text"
                                  defaultValue={binding.reference}
                                  placeholder={t("components.rawValuePlaceholder")}
                                  style={inputStyle}
                                  onBlur={(event) => {
                                    applyAppearanceBinding(binding.key, event.currentTarget.value);
                                    setEditingBindingKey(null);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") event.currentTarget.blur();
                                    if (event.key === "Escape") setEditingBindingKey(null);
                                  }}
                                />
                              ) : (
                                <TokenPicker
                                  autoFocus
                                  options={optionsForProperty(binding.property)}
                                  placeholder={tokenName}
                                  onPick={(reference) => {
                                    applyAppearanceBinding(binding.key, reference);
                                    setEditingBindingKey(null);
                                  }}
                                  onCancel={() => setEditingBindingKey(null)}
                                />
                              )
                            ) : (
                              <button
                                type="button"
                                style={tokenChipStyle}
                                title={tokenName || resolved}
                                onClick={() => setEditingBindingKey(binding.key)}
                              >
                                <span
                                  style={{
                                    ...swatchStyle,
                                    ...(isColor && resolved
                                      ? { background: resolved }
                                      : { background: "transparent", border: "none" }),
                                  }}
                                />
                                <span style={tokenChipValueStyle}>{resolved || "—"}</span>
                                <span style={tokenChipNameStyle}>{tokenName}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))
              ) : (
                <span style={appearanceValueStyle}>{t("components.noAppearanceProps")}</span>
              )}
              {addableProperties.length ? (
                <select
                  aria-label={t("components.addAppearanceProperty")}
                  style={selectStyle}
                  value=""
                  onChange={(event) => {
                    const entry = addableProperties.find(
                      (item) => item.property === event.currentTarget.value
                    );
                    if (entry) {
                      applyAppearanceBinding(`${activePart}.${entry.property}`, entry.defaultAlias);
                    }
                  }}
                >
                  <option value="">{t("components.addPropertyOption")}</option>
                  {addableProperties.map((entry) => (
                    <option key={entry.property} value={entry.property}>
                      {appearancePropertyLabel(entry.property, t)}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>
        ) : null}
        {inspectorTarget === "preview" && selectedComponentForSpec.states.length ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.state")}</strong>
            </div>
            <label style={propRowStyle}>
              <span style={propLabelStyle}>{t("components.stateLabel")}</span>
              <select
                style={selectStyle}
                value={effectiveComponentPreviewSelections.state ?? "default"}
                onChange={(event) => commitPreviewSelection("state", event.currentTarget.value)}
              >
                <option value="default">{t("components.stateDefault")}</option>
                {selectedComponentForSpec.states.map((stateItem) => (
                  <option key={stateItem.name} value={stateItem.name}>
                    {stateItem.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        {inspectorTarget === "preview" && selectedComponentForSpec.variants.length ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.variants")}</strong>
            </div>
            <div style={railFieldsStyle}>
              {selectedComponentForSpec.variants.map((variant) => (
                <label key={`variant:${variant.name}`} style={propRowStyle}>
                  <span style={propLabelStyle}>{variant.name}</span>
                  <select
                    style={selectStyle}
                    value={
                      effectiveComponentPreviewSelections[variant.name] ??
                      variant.default ??
                      variant.values[0] ??
                      ""
                    }
                    onChange={(event) =>
                      commitPreviewSelection(variant.name, event.currentTarget.value)
                    }
                  >
                    {variant.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {inspectorTarget === "preview" &&
        PREVIEW_TEXT_COMPONENT_IDS.has(selectedComponentForSpec.id) ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.previewText")}</strong>
            </div>
            <div style={railFieldsStyle}>
              <label style={propRowStyle}>
                <span style={propLabelStyle}>{t("components.previewTextLabel")}</span>
                <input
                  style={inputStyle}
                  value={effectiveComponentPreviewSelections.text ?? ""}
                  onChange={(event) => commitPreviewSelection("text", event.currentTarget.value)}
                />
              </label>
            </div>
          </div>
        ) : null}
        {inspectorTarget === "preview" ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.props")}</strong>
            </div>
            <div style={railFieldsStyle}>
              {selectedComponentForSpec.props
                .filter(
                  (prop) =>
                    !selectedComponentForSpec.variants.some((axis) => axis.name === prop.name)
                )
                .map((prop) => {
                  const propType = prop.type;
                  const raw = effectiveComponentPreviewSelections[prop.name];
                  const fallback = prop.default !== undefined ? String(prop.default) : "";
                  if (propType.kind === "enum" || propType.kind === "union") {
                    return (
                      <label key={prop.name} style={propRowStyle}>
                        <span style={propLabelStyle}>{prop.name}</span>
                        <select
                          style={selectStyle}
                          value={raw ?? fallback}
                          onChange={(event) =>
                            commitPreviewSelection(prop.name, event.currentTarget.value)
                          }
                        >
                          <option value="">—</option>
                          {propType.values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }
                  if (propType.kind === "boolean") {
                    return (
                      <label key={prop.name} style={checkboxFieldStyle}>
                        <input
                          type="checkbox"
                          checked={raw === "true" || (raw === undefined && Boolean(prop.default))}
                          onChange={(event) =>
                            commitPreviewSelection(prop.name, event.currentTarget.checked)
                          }
                        />
                        {prop.name}
                      </label>
                    );
                  }
                  if (propType.kind === "number") {
                    return (
                      <label key={prop.name} style={propRowStyle}>
                        <span style={propLabelStyle}>{prop.name}</span>
                        <input
                          type="number"
                          style={inputStyle}
                          value={raw ?? fallback}
                          onChange={(event) =>
                            commitPreviewSelection(
                              prop.name,
                              event.currentTarget.value === ""
                                ? undefined
                                : event.currentTarget.value
                            )
                          }
                        />
                      </label>
                    );
                  }
                  if (propType.kind === "string") {
                    // Icon props pick from the registered icon set; their value is
                    // the v1 icon class (icon-<name>) the renderers/components use.
                    if (/icon/i.test(prop.name)) {
                      return (
                        <label key={prop.name} style={propRowStyle}>
                          <span style={propLabelStyle}>{prop.name}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <IconPicker
                              value={raw ?? fallback}
                              iconNames={iconNames}
                              onChange={(next) => commitPreviewSelection(prop.name, next)}
                            />
                          </div>
                        </label>
                      );
                    }
                    return (
                      <label key={prop.name} style={propRowStyle}>
                        <span style={propLabelStyle}>{prop.name}</span>
                        <input
                          type="text"
                          style={inputStyle}
                          value={raw ?? fallback}
                          onChange={(event) =>
                            commitPreviewSelection(prop.name, event.currentTarget.value)
                          }
                        />
                      </label>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        ) : null}
        <details style={disclosureStyle}>
          <summary style={summaryStyle}>{t("components.editSchema")}</summary>
          <div style={editSchemaBodyStyle}>
            <div style={componentEditModeBarStyle}>
              {(["props", "variants", "slots", "tokens"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  style={{
                    ...componentEditModeButtonStyle,
                    ...(componentEditMode === mode ? componentEditModeButtonActiveStyle : {}),
                  }}
                  onClick={() => setComponentEditMode(mode)}
                >
                  {mode === "props"
                    ? t("components.tabProps", { count: selectedComponentForSpec.props.length })
                    : null}
                  {mode === "variants"
                    ? t("components.tabVariants", {
                        count: selectedComponentForSpec.variants.length,
                      })
                    : null}
                  {mode === "slots"
                    ? t("components.tabSlots", { count: selectedComponentForSpec.slots.length })
                    : null}
                  {mode === "tokens"
                    ? t("components.tabTokens", {
                        count: selectedComponentTokenModel.records.length,
                      })
                    : null}
                </button>
              ))}
            </div>
            {componentEditMode === "props" ? (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <strong style={railSectionTitleStyle}>{t("components.props")}</strong>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => {
                      setSelectedPropName(undefined);
                      setPropDraft(createNewComponentPropDraft());
                    }}
                  >
                    {t("components.newProp")}
                  </button>
                </div>
                <div style={tableStyle}>
                  {selectedComponentForSpec.props.map((prop) => (
                    <button
                      key={prop.name}
                      type="button"
                      style={{
                        ...tableRowStyle,
                        ...(selectedPropName === prop.name ? tableRowActiveStyle : {}),
                      }}
                      onClick={() => setSelectedPropName(prop.name)}
                    >
                      <span style={tableCellTextStyle}>{prop.name}</span>
                      <small style={tableCellMetaStyle}>{prop.type.kind}</small>
                    </button>
                  ))}
                </div>
                <div style={editorFormStyle}>
                  <label style={fieldStyle}>
                    {t("components.name")}
                    <input
                      style={inputStyle}
                      value={propDraft.name}
                      onChange={(event) => {
                        const name = event.currentTarget.value;
                        setPropDraft((draft) => ({ ...draft, name }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    {t("components.type")}
                    <select
                      style={selectStyle}
                      value={propDraft.kind}
                      onChange={(event) => {
                        const kind = event.currentTarget.value as ComponentPropDraft["kind"];
                        setPropDraft((draft) => ({
                          ...draft,
                          kind,
                        }));
                      }}
                    >
                      {editorPropKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={fieldStyle}>
                    {t("components.values")}
                    <input
                      style={inputStyle}
                      value={propDraft.valuesText}
                      onChange={(event) => {
                        const valuesText = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          valuesText,
                        }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    {t("components.default")}
                    <input
                      style={inputStyle}
                      value={propDraft.defaultValue}
                      onChange={(event) => {
                        const defaultValue = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          defaultValue,
                        }));
                      }}
                    />
                  </label>
                  <label style={checkboxFieldStyle}>
                    <input
                      type="checkbox"
                      checked={propDraft.required}
                      onChange={(event) => {
                        const required = event.currentTarget.checked;
                        setPropDraft((draft) => ({
                          ...draft,
                          required,
                        }));
                      }}
                    />
                    {t("components.required")}
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    {t("components.description")}
                    <input
                      style={inputStyle}
                      value={propDraft.description}
                      onChange={(event) => {
                        const description = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          description,
                        }));
                      }}
                    />
                  </label>
                  <div style={rowStyle}>
                    <button type="button" style={smallButtonStyle} onClick={savePropDraft}>
                      {t("components.saveProp")}
                    </button>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={!selectedPropName}
                      onClick={deleteSelectedProp}
                    >
                      {t("components.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {componentEditMode === "variants" ? (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <strong style={railSectionTitleStyle}>{t("components.variants")}</strong>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => {
                      setSelectedVariantName(undefined);
                      setVariantDraft(createNewComponentVariantDraft());
                    }}
                  >
                    {t("components.newVariant")}
                  </button>
                </div>
                <div style={tableStyle}>
                  {selectedComponentForSpec.variants.map((variant) => (
                    <button
                      key={variant.name}
                      type="button"
                      style={{
                        ...tableRowStyle,
                        ...(selectedVariantName === variant.name ? tableRowActiveStyle : {}),
                      }}
                      onClick={() => setSelectedVariantName(variant.name)}
                    >
                      <span style={tableCellTextStyle}>{variant.name}</span>
                      <small style={tableCellMetaStyle}>{variant.values.join(", ")}</small>
                    </button>
                  ))}
                </div>
                <div style={editorFormStyle}>
                  <label style={fieldStyle}>
                    {t("components.name")}
                    <input
                      style={inputStyle}
                      value={variantDraft.name}
                      onChange={(event) => {
                        const name = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          name,
                        }));
                      }}
                    />
                  </label>
                  <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <div style={cardHeaderStyle}>
                      <span>{t("components.valuesSelectDefault")}</span>
                      <button type="button" style={smallButtonStyle} onClick={addVariantValue}>
                        {t("components.addValue")}
                      </button>
                    </div>
                    {variantValueRows.map((value, index) => (
                      <div key={index} style={variantValueRowStyle}>
                        <input
                          type="radio"
                          name="variant-default-value"
                          aria-label={t("components.setAsDefault", {
                            value: value || t("components.valueFallback"),
                          })}
                          // Key off row index so duplicate values can't both look selected.
                          checked={
                            value.length > 0 &&
                            index === variantValueRows.indexOf(variantDraft.defaultValue)
                          }
                          disabled={value.length === 0}
                          onChange={() => writeVariantValues(variantValueRows, value)}
                        />
                        <input
                          style={inputStyle}
                          aria-label={t("components.variantValueLabel", { index: index + 1 })}
                          value={value}
                          onChange={(event) => updateVariantValue(index, event.currentTarget.value)}
                        />
                        <button
                          type="button"
                          style={smallButtonStyle}
                          aria-label={t("components.removeValue", {
                            value: value || t("components.valueFallback"),
                          })}
                          disabled={variantValueRows.length <= 1}
                          onClick={() => removeVariantValue(index)}
                        >
                          {t("components.remove")}
                        </button>
                      </div>
                    ))}
                  </div>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    {t("components.tokenBindingsJson")}
                    <textarea
                      style={textareaStyle}
                      value={variantDraft.tokensText}
                      onChange={(event) => {
                        const tokensText = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          tokensText,
                        }));
                      }}
                    />
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    {t("components.description")}
                    <input
                      style={inputStyle}
                      value={variantDraft.description}
                      onChange={(event) => {
                        const description = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          description,
                        }));
                      }}
                    />
                  </label>
                  <div style={rowStyle}>
                    <button type="button" style={smallButtonStyle} onClick={saveVariantDraft}>
                      {t("components.saveVariant")}
                    </button>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={!selectedVariantName}
                      onClick={deleteSelectedVariant}
                    >
                      {t("components.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {componentEditMode === "slots" ? (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <strong>{t("components.slots")}</strong>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => {
                      setSelectedSlotName(undefined);
                      setSlotDraft(createNewComponentSlotDraft());
                    }}
                  >
                    {t("components.newSlot")}
                  </button>
                </div>
                <div style={tableStyle}>
                  {selectedComponentForSpec.slots.map((slot) => (
                    <button
                      key={slot.name}
                      type="button"
                      style={{
                        ...tableRowStyle,
                        ...(selectedSlotName === slot.name ? tableRowActiveStyle : {}),
                      }}
                      onClick={() => setSelectedSlotName(slot.name)}
                    >
                      <span style={tableCellTextStyle}>{slot.name}</span>
                      <small style={tableCellMetaStyle}>
                        {[
                          slot.required
                            ? t("components.slotRequired")
                            : t("components.slotOptional"),
                          slot.repeated ? t("components.slotRepeated") : t("components.slotSingle"),
                        ].join(" · ")}
                      </small>
                    </button>
                  ))}
                </div>
                <div style={editorFormStyle}>
                  <label style={fieldStyle}>
                    {t("components.name")}
                    <input
                      style={inputStyle}
                      value={slotDraft.name}
                      onChange={(event) => {
                        const name = event.currentTarget.value;
                        setSlotDraft((draft) => ({ ...draft, name }));
                      }}
                    />
                  </label>
                  <label style={checkboxFieldStyle}>
                    <input
                      type="checkbox"
                      checked={slotDraft.required}
                      onChange={(event) => {
                        const required = event.currentTarget.checked;
                        setSlotDraft((draft) => ({ ...draft, required }));
                      }}
                    />
                    {t("components.required")}
                  </label>
                  <label style={checkboxFieldStyle}>
                    <input
                      type="checkbox"
                      checked={slotDraft.repeated}
                      onChange={(event) => {
                        const repeated = event.currentTarget.checked;
                        setSlotDraft((draft) => ({ ...draft, repeated }));
                      }}
                    />
                    {t("components.repeated")}
                  </label>
                  <label style={fieldStyle}>
                    {t("components.fallback")}
                    <input
                      style={inputStyle}
                      value={slotDraft.fallback}
                      onChange={(event) => {
                        const fallback = event.currentTarget.value;
                        setSlotDraft((draft) => ({ ...draft, fallback }));
                      }}
                    />
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    {t("components.description")}
                    <input
                      style={inputStyle}
                      value={slotDraft.description}
                      onChange={(event) => {
                        const description = event.currentTarget.value;
                        setSlotDraft((draft) => ({ ...draft, description }));
                      }}
                    />
                  </label>
                  <div style={rowStyle}>
                    <button type="button" style={smallButtonStyle} onClick={saveSlotDraft}>
                      {t("components.saveSlot")}
                    </button>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={!selectedSlotName}
                      onClick={deleteSelectedSlot}
                    >
                      {t("components.delete")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {componentEditMode === "tokens"
              ? renderComponentTokenEditor({
                  t,
                  model: selectedComponentTokenModel,
                  selectedTokenKey,
                  lookup: previewTokenLookup,
                  onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                  onCommitValue: updateTokenMatrixCell,
                })
              : null}
            {componentDraftError ? <div style={errorBannerStyle}>{componentDraftError}</div> : null}
            <details style={disclosureStyle}>
              <summary style={summaryStyle}>{t("components.componentJson")}</summary>
              <textarea
                style={{ ...textareaStyle, minHeight: 220 }}
                readOnly
                value={JSON.stringify(selectedComponentForSpec, null, 2)}
              />
            </details>
          </div>
        </details>
      </div>
    </section>
  );
}

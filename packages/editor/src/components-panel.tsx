import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from "react";
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
import { cssToken, formatColorValue, parseColor, type TokenLookup } from "./token-lookup.js";
import { ColorSwatchPicker, renderComponentTokenEditor } from "./token-editor.js";
import {
  componentPartForElement,
  componentPartSelector,
  EDITOR_TOOLBAR_ITEMS,
  FIELD_CONTROL_SLOT_OPTIONS,
  renderComponentPreview,
  renderComponentPreviewMatrix,
  visibleComponentAnatomy,
} from "./previews.js";
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
  layerResizeHandleStyle,
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
  editorToggleChipOnStyle,
  editorToggleChipStyle,
  editorToolbarToggleRowStyle,
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
  variantAxisBlockStyle,
  variantValueNameButtonActiveStyle,
  variantValueNameButtonStyle,
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
// dimensions/typography (value + token picker). Plain "shadow" is a full
// box-shadow value, not a color.
function isColorAppearanceProperty(property: string): boolean {
  return /(^|[.-])(background|color|fill|stroke)$|border-?color|shadow-?color/i.test(property);
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
  if (/shadow-?color/.test(value)) return ["color"];
  // Box-shadow values (shadow tokens are composite objects the CSS bridge can't
  // serialize, so shadows are edited as raw CSS — see isRawValueProperty).
  if (/^shadow$|box-?shadow/.test(value)) return ["shadow"];
  if (/background|^color$|fill|border-?color|stroke/.test(value)) return ["color"];
  if (/radius|corner/.test(value)) return ["radius"];
  if (/padding|gap|margin/.test(value)) return ["spacing"];
  if (/border-?width|outline-?width|width|height/.test(value)) return ["dimension"];
  if (/font-?family/.test(value)) return ["fontFamily"];
  if (/font-?weight/.test(value)) return ["fontWeight"];
  if (/typography/.test(value)) return ["typography"];
  if (/font-?size|line-?height|letter-?spacing/.test(value)) return ["dimension"];
  if (/text-?align/.test(value)) return ["string"];
  if (/opacity/.test(value)) return ["number"];
  return [];
}

// Structural dimensions/numbers (height, width, border-width, opacity) and raw
// CSS composites (box-shadow, text-align) need not be tokenized — they get a raw
// value input instead of a token picker.
function isRawValueProperty(property: string): boolean {
  const types = allowedTokenTypes(property);
  return (
    types.length === 1 &&
    (types[0] === "dimension" ||
      types[0] === "number" ||
      types[0] === "shadow" ||
      types[0] === "string")
  );
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
  { property: "border-width", defaultAlias: "1px" },
  { property: "radius", defaultAlias: "{radius.scale.2}" },
  { property: "width", defaultAlias: "auto" },
  { property: "height", defaultAlias: "auto" },
  { property: "padding", defaultAlias: "{spacing.scale.2}" },
  { property: "gap", defaultAlias: "{spacing.scale.2}" },
  { property: "typography", defaultAlias: "{typography.paragraph.p3}" },
  { property: "opacity", defaultAlias: "1" },
  { property: "shadow", defaultAlias: "0 2px 8px rgba(0, 0, 0, 0.16)" },
];

// Extra properties offered when the selected part actually renders text, so you
// can edit its font like a Figma text layer. (color already lives in COMMON.)
const TYPOGRAPHY_APPEARANCE_PROPERTIES: Array<{ property: string; defaultAlias: string }> = [
  { property: "font-size", defaultAlias: "14px" },
  { property: "font-weight", defaultAlias: "500" },
  { property: "font-family", defaultAlias: "inherit" },
  { property: "line-height", defaultAlias: "1.5" },
  { property: "letter-spacing", defaultAlias: "0" },
  { property: "text-align", defaultAlias: "left" },
];

// Parts that render text (so they get the typography controls above). Per known
// component; falls back to a name heuristic for anything else.
const TEXT_BEARING_PARTS: Record<string, Set<string>> = {
  datepicker: new Set([
    "trigger-date",
    "time-picker",
    "hour-select",
    "minute-select",
    "range-separator",
    "calendar-title",
    "calendar-weekday",
    "calendar-day",
    "calendar-today",
    "calendar-selected",
    "calendar-range",
    "quick-select-item",
    "action-summary",
    "reset-action",
    "apply-action",
  ]),
};

function isTextBearingPart(componentId: string, part: string): boolean {
  return (
    TEXT_BEARING_PARTS[componentId]?.has(part) ??
    /text|label|message|title|value|day|item|button|action/i.test(part)
  );
}

// Components whose primary text is anatomy/children (not a spec prop), so the
// preview exposes a synthetic "Text" control that feeds the reserved `text`
// selection key (renderers read it via previewText()).
const PREVIEW_TEXT_COMPONENT_IDS = new Set(["button", "chip", "label", "checkbox-radio", "toggle"]);

// Editing policy for functional components:
// - the WYSIWYG editor is EXCLUDED from Figma-style editing (test-only preview);
// - the datepicker is STYLE-ONLY: layers select + appearance edit, but no layer
//   structure changes and no props/variants/slots schema editing.
// Everything else gets the full editing surface.
interface ComponentEditPolicy {
  design: boolean; // layers column + design inspector
  structure: boolean; // layer add/rename/reorder/delete/flags
  schema: boolean; // props/variants/slots CRUD (Properties card + Edit schema)
}
const COMPONENT_EDIT_POLICIES: Record<string, ComponentEditPolicy> = {
  editor: { design: false, structure: false, schema: false },
  datepicker: { design: true, structure: false, schema: false },
};
function componentEditPolicy(componentId: string): ComponentEditPolicy {
  return COMPONENT_EDIT_POLICIES[componentId] ?? { design: true, structure: true, schema: true };
}

// Figma-style arrow stepping on raw dimension inputs: bump the FIRST number in
// the value (1, or 10 with Shift), preserving any unit suffix.
function stepDimensionValue(text: string, delta: number): string | undefined {
  const match = /-?\d*\.?\d+/.exec(text);
  if (!match) return undefined;
  const stepped = Math.round((Number.parseFloat(match[0]) + delta) * 100) / 100;
  return `${text.slice(0, match.index)}${stepped}${text.slice(match.index + match[0].length)}`;
}

// Unique name helper for inline "+" creation (value-2, value-3, …).
function uniqueName(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  let suffix = 2;
  while (set.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/**
 * Figma-style "Properties" card: variant axes with inline rename (double-click),
 * per-value rows (default radio · click to preview · double-click rename · ×),
 * plus add-value / add-axis. Every action commits immediately through the
 * inline variant handlers.
 */
function VariantPropertiesCard({
  component,
  selections,
  onSelectValue,
  addVariantAxis,
  renameVariantAxis,
  removeVariantAxis,
  addVariantValue,
  renameVariantValue,
  removeVariantValue,
  setVariantDefault,
}: {
  component: ComponentDocument;
  selections: Record<string, string>;
  onSelectValue: (axisName: string, value: string) => void;
  addVariantAxis: (name: string, values: string[]) => void;
  renameVariantAxis: (fromName: string, toName: string) => void;
  removeVariantAxis: (name: string) => void;
  addVariantValue: (axisName: string, value: string) => void;
  renameVariantValue: (axisName: string, fromValue: string, toValue: string) => void;
  removeVariantValue: (axisName: string, value: string) => void;
  setVariantDefault: (axisName: string, value: string) => void;
}) {
  const t = useT();
  // "axis::<name>" or "value::<axis>::<value>" while an inline rename is open.
  const [renaming, setRenaming] = useState<string | null>(null);
  const renameInput = (defaultValue: string, commit: (next: string) => void) => (
    <input
      autoFocus
      defaultValue={defaultValue}
      aria-label={t("components.name")}
      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
      onClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        // Escape marks the input cancelled so an unmount-triggered blur can't
        // commit the very rename the user just abandoned.
        if (event.currentTarget.dataset.cancelled !== "true") {
          commit(event.currentTarget.value);
        }
        setRenaming(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          event.currentTarget.dataset.cancelled = "true";
          setRenaming(null);
        }
      }}
    />
  );
  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <strong style={railSectionTitleStyle}>{t("components.propertiesHeading")}</strong>
        <button
          type="button"
          style={smallButtonStyle}
          title={t("components.addVariantAxis")}
          aria-label={t("components.addVariantAxis")}
          onClick={() =>
            addVariantAxis(
              uniqueName(
                "property",
                component.variants.map((variant) => variant.name)
              ),
              ["value-1"]
            )
          }
        >
          +
        </button>
      </div>
      {component.variants.length === 0 ? (
        <span style={appearanceValueStyle}>{t("components.noVariants")}</span>
      ) : null}
      {component.variants.map((axis) => {
        const selectedValue = selections[axis.name] ?? axis.default ?? axis.values[0] ?? "";
        return (
          <div key={axis.name} style={variantAxisBlockStyle}>
            <div style={appearanceHeaderStyle}>
              {renaming === `axis::${axis.name}` ? (
                renameInput(axis.name, (next) => renameVariantAxis(axis.name, next))
              ) : (
                <span
                  style={propLabelStyle}
                  title={t("components.renameHint")}
                  onDoubleClick={() => setRenaming(`axis::${axis.name}`)}
                >
                  {axis.name}
                </span>
              )}
              <button
                type="button"
                aria-label={t("components.deleteVariantAxis", { name: axis.name })}
                style={appearanceRemoveStyle}
                onClick={() => removeVariantAxis(axis.name)}
              >
                ×
              </button>
            </div>
            {axis.values.map((value) => (
              <div key={value} style={variantValueRowStyle}>
                <input
                  type="radio"
                  name={`podo-default-${component.id}-${axis.name}`}
                  checked={axis.default === value}
                  title={t("components.setAsDefault", { value })}
                  aria-label={t("components.setAsDefault", { value })}
                  onChange={() => setVariantDefault(axis.name, value)}
                />
                {renaming === `value::${axis.name}::${value}` ? (
                  renameInput(value, (next) => renameVariantValue(axis.name, value, next))
                ) : (
                  <button
                    type="button"
                    style={{
                      ...variantValueNameButtonStyle,
                      ...(selectedValue === value ? variantValueNameButtonActiveStyle : {}),
                    }}
                    title={t("components.renameHint")}
                    onClick={() => onSelectValue(axis.name, value)}
                    onDoubleClick={() => setRenaming(`value::${axis.name}::${value}`)}
                  >
                    {value}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t("components.removeValue", { value })}
                  style={appearanceRemoveStyle}
                  disabled={axis.values.length <= 1}
                  onClick={() => removeVariantValue(axis.name, value)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() => addVariantValue(axis.name, uniqueName("value", axis.values))}
            >
              {t("components.addValue")}
            </button>
          </div>
        );
      })}
    </div>
  );
}

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
  updateComponentStateTokenBinding,
  renameAnatomyPart,
  addAnatomyPart,
  removeAnatomyPart,
  reorderAnatomyPart,
  reparentAnatomyPart,
  moveAnatomyPart,
  duplicateAnatomyPart,
  setAnatomyPartFlags,
  addVariantAxis,
  renameVariantAxis,
  removeVariantAxis,
  addVariantValue,
  renameVariantValue,
  removeVariantValue,
  setVariantDefault,
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
  updateComponentStateTokenBinding: (stateName: string, key: string, reference: string) => void;
  renameAnatomyPart: (fromName: string, toName: string) => boolean;
  addAnatomyPart: (name: string, parent?: string) => void;
  removeAnatomyPart: (partName: string) => void;
  reorderAnatomyPart: (partName: string, beforeName: string | null) => void;
  reparentAnatomyPart: (partName: string, newParent: string | null) => void;
  moveAnatomyPart: (partName: string, newParent: string | null, beforeName: string | null) => void;
  duplicateAnatomyPart: (partName: string) => string | undefined;
  setAnatomyPartFlags: (partName: string, flags: { hidden?: boolean; locked?: boolean }) => void;
  addVariantAxis: (name: string, values: string[]) => void;
  renameVariantAxis: (fromName: string, toName: string) => void;
  removeVariantAxis: (name: string) => void;
  addVariantValue: (axisName: string, value: string) => void;
  renameVariantValue: (axisName: string, fromValue: string, toValue: string) => void;
  removeVariantValue: (axisName: string, value: string) => void;
  setVariantDefault: (axisName: string, value: string) => void;
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
  const removeVariantDraftValue = (index: number): void => {
    writeVariantValues(variantValueRows.filter((_, rowIndex) => rowIndex !== index));
  };
  const addVariantDraftValue = (): void => {
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
  // Hovered layer/part (layers row ↔ preview element, both directions).
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  // Selection-driven right rail: "preview" (clicking the live preview) shows the
  // test controls; "design" (selecting a variant-set cell or a layer) shows that
  // selection's appearance/design properties.
  const [inspectorTarget, setInspectorTarget] = useState<"design" | "preview">("design");
  // What this component allows editing (editor = test-only, datepicker = style-only).
  const policy = componentEditPolicy(selectedComponentForSpec.id);
  const effectiveInspectorTarget = policy.design ? inspectorTarget : "preview";
  // Locked layers can't be picked from the preview (Figma lock semantics); they
  // stay selectable from the layer tree.
  const lockedParts = new Set(
    selectedComponentForSpec.anatomy.filter((part) => part.locked).map((part) => part.name)
  );
  // Which appearance binding row is currently open for token picking.
  const [editingBindingKey, setEditingBindingKey] = useState<string | null>(null);
  // "Apply to" scope: base tokens, or a specific variant value (so editing a layer's
  // appearance can target just one variant like Figma). Options follow the live
  // selections, e.g. theme = primary.
  const [appearanceScope, setAppearanceScope] = useState("base");
  // Switching components resets the per-component editing state — otherwise a
  // scope like "variant::size" or an open picker row silently carries over to a
  // different component that happens to share the axis/part name.
  useEffect(() => {
    setSelectedPart("");
    setHoveredPart(null);
    setInspectorTarget("design");
    setEditingBindingKey(null);
    setAppearanceScope("base");
  }, [selectedComponentForSpec.id]);
  // Draggable layers-column width (drag the handle on its right edge).
  const [layersWidth, setLayersWidth] = useState(200);
  // Wraps the variant matrix so the layer↔preview sync effect can find and ring the
  // selected part's element inside it.
  const matrixRef = useRef<HTMLDivElement>(null);
  const startLayersResize = (event: ReactPointerEvent): void => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = layersWidth;
    const onMove = (move: PointerEvent): void =>
      setLayersWidth(Math.max(150, Math.min(460, startWidth + move.clientX - startX)));
    const onUp = (): void => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  // Layers reflect the selected variant (e.g. type=time hides the calendar parts).
  const visibleAnatomy = visibleComponentAnatomy(
    selectedComponentForSpec,
    effectiveComponentPreviewSelections
  );
  const anatomyParts = anatomyPartNames({ ...selectedComponentForSpec, anatomy: visibleAnatomy });
  // Default to the first part that actually has appearance bindings (so e.g. toast
  // opens on its styled "toast" layer, not an empty "provider" layer).
  const partsWithBindings = new Set(
    Object.keys(selectedComponentForSpec.tokens ?? {}).map((key) => key.split(".")[0])
  );
  const activePart = anatomyParts.includes(selectedPart)
    ? selectedPart
    : (anatomyParts.find((part) => partsWithBindings.has(part)) ??
      (anatomyParts.includes("root") ? "root" : (anatomyParts[0] ?? "root")));
  // Keep the layer selection and the variant-matrix preview in sync: ring ONE
  // representative element of the active part, inside the selected variant row, so
  // selecting a layer on the left highlights its element on the right (and clicking
  // an element on the right — which sets the active part — highlights here too).
  // Single element, not the whole class, so a part with many instances (calendar
  // days) doesn't light up dozens of cells at once.
  // Depend on the whole spec object (not just .id): editing a token replaces the
  // component object, so the matrix re-renders and the effect re-marks — keeping the
  // ring from going stale. The object is a stable .find() reference otherwise, so
  // this doesn't over-run. (React doesn't clobber an unchanged className on reuse;
  // when a marked node IS recreated, this re-run re-applies the mark after commit.)
  useEffect(() => {
    const root = matrixRef.current;
    if (!root) return;
    for (const className of ["podo-part-selected", "podo-part-hovered"]) {
      root
        .querySelectorAll(`.${className}`)
        .forEach((element) => element.classList.remove(className));
    }
    if (effectiveInspectorTarget !== "design") return;
    const cell = root.querySelector("[data-podo-selected-cell]") ?? root;
    const mark = (part: string | null | undefined, className: string): void => {
      if (!part) return;
      const selector = componentPartSelector(selectedComponentForSpec.id, part);
      if (!selector) return;
      const matches = Array.from(cell.querySelectorAll(selector));
      // Prefer a non-muted instance as the representative — e.g. an in-month day,
      // not a faded prev/next-month ".other" calendar cell.
      const target = matches.find((element) => !element.classList.contains("other")) ?? matches[0];
      target?.classList.add(className);
    };
    mark(activePart, "podo-part-selected");
    if (hoveredPart && hoveredPart !== activePart) mark(hoveredPart, "podo-part-hovered");
  }, [
    activePart,
    hoveredPart,
    effectiveInspectorTarget,
    selectedComponentForSpec,
    effectiveComponentPreviewSelections,
  ]);
  // Variant scopes are keyed by AXIS ("variant::size") and always target that
  // axis's currently previewed value — so switching the previewed value in the
  // Properties card re-targets editing to it (Figma: you style the selected
  // variant) instead of silently dropping the scope back to base.
  const scopedVariantValue = (axisName: string): string => {
    const axis = selectedComponentForSpec.variants.find((variant) => variant.name === axisName);
    return effectiveComponentPreviewSelections[axisName] ?? axis?.default ?? axis?.values[0] ?? "";
  };
  const appearanceScopeOptions = [
    ...selectedComponentForSpec.variants.map((variant) => ({
      key: `variant::${variant.name}`,
      label: `${variant.name} = ${scopedVariantValue(variant.name)}`,
    })),
    // Declared states are scopes too (Figma-style: style the hover/disabled look).
    ...selectedComponentForSpec.states.map((state) => ({
      key: `state::${state.name}`,
      label: `state = ${state.name}`,
    })),
  ];
  const activeScope = appearanceScopeOptions.some((option) => option.key === appearanceScope)
    ? appearanceScope
    : "base";
  // Changing scope to a state pins the preview to that state so you see what you
  // edit; only LEAVING a state scope unpins (a base↔variant switch never clears a
  // state the user pinned from the test inspector).
  const changeAppearanceScope = (next: string): void => {
    setAppearanceScope(next);
    if (next.startsWith("state::")) {
      commitPreviewSelection("state", next.slice(7));
    } else if (activeScope.startsWith("state::")) {
      commitPreviewSelection("state", undefined);
    }
  };
  // Effective bindings for the active scope: base tokens overlaid with the selected
  // variant value's (or state's) overrides, so editing/removing in scope is reflected.
  const scopeTokens: Record<string, string> = (() => {
    const base = { ...(selectedComponentForSpec.tokens ?? {}) } as Record<string, string>;
    if (activeScope === "base") return base;
    if (activeScope.startsWith("state::")) {
      const state = selectedComponentForSpec.states.find(
        (item) => item.name === activeScope.slice(7)
      );
      return { ...base, ...((state?.tokens ?? {}) as Record<string, string>) };
    }
    const axisName = activeScope.slice("variant::".length);
    const variant = selectedComponentForSpec.variants.find((item) => item.name === axisName);
    return {
      ...base,
      ...((variant?.valueTokens?.[scopedVariantValue(axisName)] ?? {}) as Record<string, string>),
    };
  })();
  const partBindings = Object.entries(scopeTokens)
    .filter(([key]) => key.startsWith(`${activePart}.`))
    .map(([key, reference]) => ({
      key,
      property: key.slice(activePart.length + 1),
      reference: String(reference),
    }));
  const presentProperties = new Set(partBindings.map((binding) => binding.property));
  // Text-bearing parts also offer typography controls (font, size, weight, line
  // height, letter spacing) — like editing a text layer in Figma.
  const appearanceCatalog = isTextBearingPart(selectedComponentForSpec.id, activePart)
    ? [...COMMON_APPEARANCE_PROPERTIES, ...TYPOGRAPHY_APPEARANCE_PROPERTIES]
    : COMMON_APPEARANCE_PROPERTIES;
  const seenProperty = new Set<string>();
  const addableProperties = appearanceCatalog.filter((entry) => {
    if (presentProperties.has(entry.property) || seenProperty.has(entry.property)) return false;
    seenProperty.add(entry.property);
    return true;
  });
  // Figma-style inspector: show EVERY relevant appearance property for the selected
  // part as an editable row — bound ones with their token/value, the rest as empty
  // placeholders you click to set. So selecting any layer always opens an editor,
  // instead of an empty "no properties" panel that hides behind a "+ Add" dropdown.
  const appearanceRows: Array<{
    key: string;
    property: string;
    reference: string;
    bound: boolean;
    defaultAlias?: string;
  }> = [
    ...partBindings.map((binding) => ({ ...binding, bound: true })),
    ...addableProperties.map((entry) => ({
      key: `${activePart}.${entry.property}`,
      property: entry.property,
      reference: "",
      bound: false,
      defaultAlias: entry.defaultAlias,
    })),
  ];
  const applyAppearanceBinding = (key: string, reference: string): void => {
    if (activeScope === "base") {
      updateComponentTokenBinding(key, reference);
      return;
    }
    if (activeScope.startsWith("state::")) {
      updateComponentStateTokenBinding(activeScope.slice(7), key, reference);
      return;
    }
    const axisName = activeScope.slice("variant::".length);
    updateComponentVariantValueTokenBinding(axisName, scopedVariantValue(axisName), key, reference);
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
    <section
      style={{
        ...componentPanelWorkspaceLayout,
        gridTemplateColumns: policy.design
          ? `${layersWidth}px minmax(0, 1fr) 320px`
          : "minmax(0, 1fr) 320px",
      }}
    >
      {policy.design ? (
        <aside style={layersColumnStyle}>
          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={startLayersResize}
            style={layerResizeHandleStyle}
          />
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.layers")}</strong>
              {policy.structure ? (
                <button
                  type="button"
                  style={smallButtonStyle}
                  onClick={() => addAnatomyPart("layer")}
                  title={t("components.addLayer")}
                >
                  +
                </button>
              ) : null}
            </div>
            <LayersPanel
              key={selectedComponentForSpec.id}
              anatomy={visibleAnatomy}
              selectedPart={activePart}
              highlightPart={hoveredPart}
              structureLocked={!policy.structure}
              onSelect={(part) => {
                // Selecting a layer is a design action: switch to the design inspector
                // so the matrix rings the matching element (it only passes selectedPart
                // through in design mode).
                setSelectedPart(part);
                setInspectorTarget("design");
              }}
              onHover={setHoveredPart}
              onRename={(from, to) => {
                // Only follow the rename when it committed — a rejected rename
                // (name collision) must not move selection to a ghost layer.
                if (renameAnatomyPart(from, to)) setSelectedPart(to.trim() || from);
              }}
              onAdd={addAnatomyPart}
              onDuplicate={(part) => {
                const copiedName = duplicateAnatomyPart(part);
                if (copiedName) setSelectedPart(copiedName);
              }}
              onRemove={removeAnatomyPart}
              onReorder={reorderAnatomyPart}
              onReparent={reparentAnatomyPart}
              onMove={moveAnatomyPart}
              onToggleHidden={(part, hidden) => setAnatomyPartFlags(part, { hidden })}
              onToggleLocked={(part, locked) => setAnatomyPartFlags(part, { locked })}
            />
          </div>
        </aside>
      ) : null}
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
            effectiveInspectorTarget === "preview"
              ? { ...componentPreviewPanelStyle, outline: "2px solid #7aa7ee", outlineOffset: 2 }
              : { ...componentPreviewPanelStyle, cursor: "pointer" }
          }
          onClick={() => setInspectorTarget("preview")}
          title={t("components.previewTestHint")}
        >
          {renderComponentPreview(
            selectedComponentForSpec,
            effectiveComponentPreviewSelections,
            previewTokenLookup,
            // Editor preview: edits inside the live editor flow back to the `value`
            // prop (and its textarea) so the inspector stays in sync.
            (value) => commitPreviewSelection("value", value)
          )}
        </div>
        {(() => {
          const matrix = renderComponentPreviewMatrix({
            component: selectedComponentForSpec,
            selections: effectiveComponentPreviewSelections,
            lookup: previewTokenLookup,
            onSelect: (next, part) => {
              setComponentPreviewSelections(next);
              // Figma-style: clicking an element in a matrix cell selects that part
              // (e.g. the calendar / time list) so its design opens directly.
              // Locked layers are skipped, like clicking a locked Figma layer.
              if (part && !lockedParts.has(part)) setSelectedPart(part);
              setInspectorTarget("design");
            },
            // Figma-style "add variant" from the set header (schema-editable only).
            ...(policy.schema
              ? {
                  onAddValue: (axisName: string) => {
                    const axis = selectedComponentForSpec.variants.find(
                      (variant) => variant.name === axisName
                    );
                    if (axis) addVariantValue(axisName, uniqueName("value", axis.values));
                  },
                }
              : {}),
            // Outline the selected part only while it's actually the editing target
            // (design mode); keeps the grid clean in preview mode. RESOLVED activePart
            // matches what the layers panel highlights. (Datepicker rings a single
            // element via the sync effect; other components' matrices ring via this.)
            ...(effectiveInspectorTarget === "design" ? { selectedPart: activePart } : {}),
            t,
          });
          return matrix ? (
            <div
              ref={matrixRef}
              style={componentPreviewPanelStyle}
              // Preview → layers hover sync (Figma highlights the layer row of the
              // element under the cursor). Locked parts don't light up.
              onMouseOver={(event) => {
                const part = componentPartForElement(
                  selectedComponentForSpec.id,
                  event.target as Element
                );
                setHoveredPart(part && !lockedParts.has(part) ? part : null);
              }}
              onMouseLeave={() => setHoveredPart(null)}
            >
              {/* Hover ring for the marked element (non-datepicker matrices have no
                  per-row style injection, so this one global rule covers them). */}
              <style>
                {
                  ".podo-part-hovered { outline: 1px solid #7aa7ee !important; outline-offset: 1px; }"
                }
              </style>
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
          {(policy.design ? (["design", "preview"] as const) : (["preview"] as const)).map(
            (target) => (
              <button
                key={target}
                type="button"
                aria-pressed={effectiveInspectorTarget === target}
                style={{
                  ...componentEditModeButtonStyle,
                  ...(effectiveInspectorTarget === target
                    ? componentEditModeButtonActiveStyle
                    : {}),
                }}
                onClick={() => setInspectorTarget(target)}
              >
                {target === "design"
                  ? t("components.inspectorDesign")
                  : t("components.inspectorTest")}
              </button>
            )
          )}
        </div>
        {!policy.design ? (
          <p style={sectionMetaStyle}>{t("components.testOnlyNote")}</p>
        ) : !policy.schema ? (
          <p style={sectionMetaStyle}>{t("components.styleOnlyNote")}</p>
        ) : null}
        {effectiveInspectorTarget === "design" && policy.schema ? (
          <VariantPropertiesCard
            key={selectedComponentForSpec.id}
            component={selectedComponentForSpec}
            selections={effectiveComponentPreviewSelections}
            onSelectValue={(axis, value) => commitPreviewSelection(axis, value)}
            addVariantAxis={addVariantAxis}
            renameVariantAxis={renameVariantAxis}
            removeVariantAxis={removeVariantAxis}
            addVariantValue={addVariantValue}
            renameVariantValue={renameVariantValue}
            removeVariantValue={removeVariantValue}
            setVariantDefault={setVariantDefault}
          />
        ) : null}
        {effectiveInspectorTarget === "design" ? (
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
                  onChange={(event) => changeAppearanceScope(event.currentTarget.value)}
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
              {appearanceRows.length ? (
                APPEARANCE_GROUP_ORDER.filter((group) =>
                  appearanceRows.some((row) => appearanceGroup(row.property) === group)
                ).map((group) => (
                  <div key={group} style={appearanceGroupStyle}>
                    <span style={appearanceGroupTitleStyle}>{t(`components.group.${group}`)}</span>
                    {appearanceRows
                      .filter((row) => appearanceGroup(row.property) === group)
                      .map((row) => {
                        const isColor = isColorAppearanceProperty(row.property);
                        // A binding is a {token} alias or a raw CSS value.
                        const isAlias = row.reference.startsWith("{");
                        const resolved = isAlias
                          ? cssToken(previewTokenLookup, row.reference.slice(1, -1), "")
                          : row.reference;
                        const tokenName = isAlias ? row.reference.slice(1, -1) : "";
                        const raw = isRawValueProperty(row.property);
                        return (
                          <div key={row.key} style={appearanceRowStyle}>
                            <div style={appearanceHeaderStyle}>
                              <span style={propLabelStyle}>
                                {appearancePropertyLabel(row.property, t)}
                              </span>
                              {row.bound ? (
                                <button
                                  type="button"
                                  aria-label={t("components.removeProperty", {
                                    property: row.property,
                                  })}
                                  style={appearanceRemoveStyle}
                                  onClick={() => applyAppearanceBinding(row.key, "")}
                                >
                                  ×
                                </button>
                              ) : null}
                            </div>
                            {editingBindingKey === row.key ? (
                              raw ? (
                                <input
                                  autoFocus
                                  type="text"
                                  // Unbound raw rows start from the catalog default (e.g. 14px)
                                  // so there's a sensible value to tweak.
                                  defaultValue={row.reference || row.defaultAlias || ""}
                                  placeholder={t("components.rawValuePlaceholder")}
                                  style={inputStyle}
                                  onBlur={(event) => {
                                    applyAppearanceBinding(row.key, event.currentTarget.value);
                                    setEditingBindingKey(null);
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") event.currentTarget.blur();
                                    if (event.key === "Escape") setEditingBindingKey(null);
                                    // Figma-style scrubbing: arrows step the first number
                                    // (Shift = ×10) and apply live so the preview follows.
                                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                      const delta =
                                        (event.key === "ArrowUp" ? 1 : -1) *
                                        (event.shiftKey ? 10 : 1);
                                      const next = stepDimensionValue(
                                        event.currentTarget.value ||
                                          row.reference ||
                                          row.defaultAlias ||
                                          "",
                                        delta
                                      );
                                      if (next !== undefined) {
                                        event.preventDefault();
                                        event.currentTarget.value = next;
                                        applyAppearanceBinding(row.key, next);
                                      }
                                    }
                                  }}
                                />
                              ) : (
                                <TokenPicker
                                  autoFocus
                                  options={optionsForProperty(row.property)}
                                  placeholder={tokenName}
                                  onPick={(reference) => {
                                    applyAppearanceBinding(row.key, reference);
                                    setEditingBindingKey(null);
                                  }}
                                  onCancel={() => setEditingBindingKey(null)}
                                />
                              )
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {isColor ? (
                                  // Figma fill row: the swatch opens the inline HSV+alpha
                                  // picker (writes a raw color, detaching any token —
                                  // same as editing a variable-bound fill in Figma);
                                  // the chip still opens the token picker.
                                  <ColorSwatchPicker
                                    label={appearancePropertyLabel(row.property, t)}
                                    swatchColor={resolved || undefined}
                                    value={parseColor(resolved) ?? { r: 127, g: 127, b: 127, a: 1 }}
                                    onOpen={() => setEditingBindingKey(null)}
                                    onChange={(next) =>
                                      applyAppearanceBinding(row.key, formatColorValue(next))
                                    }
                                  />
                                ) : null}
                                <button
                                  type="button"
                                  style={{ ...tokenChipStyle, flex: 1, minWidth: 0 }}
                                  title={tokenName || resolved || t("components.setProperty")}
                                  onClick={() => setEditingBindingKey(row.key)}
                                >
                                  {isColor ? null : (
                                    <span
                                      style={{
                                        ...swatchStyle,
                                        background: "transparent",
                                        border: "none",
                                      }}
                                    />
                                  )}
                                  <span style={tokenChipValueStyle}>{resolved || "—"}</span>
                                  <span style={tokenChipNameStyle}>{tokenName}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))
              ) : (
                <span style={appearanceValueStyle}>{t("components.noAppearanceProps")}</span>
              )}
            </div>
          </div>
        ) : null}
        {effectiveInspectorTarget === "preview" && selectedComponentForSpec.states.length ? (
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
        {effectiveInspectorTarget === "preview" && selectedComponentForSpec.variants.length ? (
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
        {effectiveInspectorTarget === "preview" &&
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
        {effectiveInspectorTarget === "preview" && selectedComponentForSpec.id === "field" ? (
          // Field is slot-driven: pick what fills the required `control` slot,
          // like slot composition on the canvas.
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.slotContent")}</strong>
            </div>
            <label style={propRowStyle}>
              <span style={propLabelStyle}>control</span>
              <select
                style={selectStyle}
                value={effectiveComponentPreviewSelections["slot:control"] ?? "input"}
                onChange={(event) =>
                  commitPreviewSelection("slot:control", event.currentTarget.value)
                }
              >
                {FIELD_CONTROL_SLOT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        {effectiveInspectorTarget === "preview" ? (
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
                    // The editor's `value` holds HTML content, so give it a
                    // multiline textarea; it stays two-way bound to the live editor.
                    if (selectedComponentForSpec.id === "editor" && prop.name === "value") {
                      return (
                        <label key={prop.name} style={{ ...propRowStyle, alignItems: "start" }}>
                          <span style={propLabelStyle}>{prop.name}</span>
                          <textarea
                            style={textareaStyle}
                            value={raw ?? fallback}
                            onChange={(event) =>
                              commitPreviewSelection(prop.name, event.currentTarget.value)
                            }
                          />
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
        {effectiveInspectorTarget === "preview" && selectedComponentForSpec.id === "editor" ? (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.editorToolbar")}</strong>
            </div>
            <div style={editorToolbarToggleRowStyle}>
              {EDITOR_TOOLBAR_ITEMS.map((item) => {
                const on = effectiveComponentPreviewSelections[`toolbar:${item}`] !== "false";
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={on}
                    style={
                      on
                        ? { ...editorToggleChipStyle, ...editorToggleChipOnStyle }
                        : editorToggleChipStyle
                    }
                    onClick={() => commitPreviewSelection(`toolbar:${item}`, on ? "false" : "")}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        {/* Style-only / test-only components hide schema editing entirely. */}
        {policy.schema ? (
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
                        <button
                          type="button"
                          style={smallButtonStyle}
                          onClick={addVariantDraftValue}
                        >
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
                            onChange={(event) =>
                              updateVariantValue(index, event.currentTarget.value)
                            }
                          />
                          <button
                            type="button"
                            style={smallButtonStyle}
                            aria-label={t("components.removeValue", {
                              value: value || t("components.valueFallback"),
                            })}
                            disabled={variantValueRows.length <= 1}
                            onClick={() => removeVariantDraftValue(index)}
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
                            slot.repeated
                              ? t("components.slotRepeated")
                              : t("components.slotSingle"),
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
        ) : null}
        {/* Outside the schema disclosure so layer/appearance errors show even for
            style-only components that hide it. */}
        {componentDraftError ? <div style={errorBannerStyle}>{componentDraftError}</div> : null}
      </div>
    </section>
  );
}

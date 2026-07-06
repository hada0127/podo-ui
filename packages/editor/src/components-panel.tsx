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
  appearanceCssProperty,
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
  alignmentDotButtonStyle,
  alignmentGridStyle,
  appearanceGroupStyle,
  appearanceGroupTitleStyle,
  appearanceGroupsStyle,
  appearanceHeaderStyle,
  appearanceRemoveStyle,
  appearanceRowStyle,
  appearanceValueStyle,
  autoLayoutRowStyle,
  autoLayoutToggleActiveStyle,
  autoLayoutToggleStyle,
  cardHeaderStyle,
  railCheckboxFieldStyle,
  layerResizeHandleStyle,
  layersColumnStyle,
  swatchStyle,
  componentEditModeBarStyle,
  componentEditModeButtonActiveStyle,
  componentEditModeButtonStyle,
  componentPanelWorkspaceLayout,
  canvasFrameLabelStyle,
  componentPreviewPanelStyle,
  componentSetFrameStyle,
  componentSetLabelStyle,
  dangerButtonStyle,
  disclosureStyle,
  editSchemaBodyStyle,
  editorToggleChipOnStyle,
  editorToggleChipStyle,
  editorToolbarToggleRowStyle,
  editorFormStyle,
  errorBannerStyle,
  railFieldStyle,
  railTextInputStyle,
  panelSectionHeaderStyle,
  pagesRowActiveStyle,
  pagesRowStyle,
  propLabelStyle,
  propRowStyle,
  propertiesRailStyle,
  railFieldsStyle,
  railInputStyle,
  railSelectStyle,
  fieldGlyphStyle,
  geometryPairStyle,
  modeChevronSelectStyle,
  railSectionStyle,
  railSectionTitleStyle,
  rowStyle,
  sectionMetaStyle,
  stickyPreviewColumnStyle,
  railButtonStyle,
  railCheckboxInputStyle,
  summaryStyle,
  tableCellMetaStyle,
  tableCellTextStyle,
  tableRowActiveStyle,
  tableRowStyle,
  tableStyle,
  railTextareaStyle,
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
export function allowedTokenTypes(property: string): string[] {
  const value = property.toLowerCase();
  if (/shadow-?color/.test(value)) return ["color"];
  // Box-shadow values are edited structurally (ShadowStackEditor) or as raw CSS.
  if (/^shadow$|box-?shadow/.test(value)) return ["shadow"];
  if (/background|^color$|fill|border-?color|stroke/.test(value)) return ["color"];
  if (/radius|corner/.test(value)) return ["radius"];
  if (/padding|gap|margin/.test(value)) return ["spacing"];
  if (
    /border-?style|text-?decoration|text-?transform|blend|blur|overflow|gradient|grid|position|^fills$|clip|mask/.test(
      value
    )
  )
    return ["string"];
  if (/border-?width|outline-?width|width|height/.test(value)) return ["dimension"];
  if (/font-?family/.test(value)) return ["fontFamily"];
  if (/font-?weight/.test(value)) return ["fontWeight"];
  if (/typography/.test(value)) return ["typography"];
  if (/font-?size|line-?height|letter-?spacing/.test(value)) return ["dimension"];
  if (/text-?align/.test(value)) return ["string"];
  if (/opacity/.test(value)) return ["number"];
  return [];
}

// Enum-valued appearance properties get a <select> instead of a free-text input
// (Figma renders these as dropdowns/segmented controls).
const ENUM_APPEARANCE_OPTIONS: Record<string, string[]> = {
  borderstyle: ["solid", "dashed", "dotted", "none"],
  textalign: ["left", "center", "right", "justify"],
  textdecoration: ["none", "underline", "line-through"],
  texttransform: ["none", "uppercase", "lowercase", "capitalize"],
  blendmode: [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ],
};
function enumOptionsForProperty(property: string): string[] | undefined {
  return ENUM_APPEARANCE_OPTIONS[normalizedProperty(property)];
}

// Structural dimensions/numbers (height, width, border-width, opacity) and raw
// CSS composites (box-shadow, text-align) need not be tokenized — they get a raw
// value input instead of a token picker.
export function isRawValueProperty(property: string): boolean {
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
  if (/background-?blur/.test(value)) return "Effects";
  if (/clip|mask/.test(value)) return "Effects";
  if (/background|^color$|^fills?$|gradient/.test(value)) return "Fill";
  if (/font|typography|line-?height|letter|text-?decoration|text-?transform/.test(value))
    return "Typography";
  if (/padding|gap|margin|width|height/.test(value)) return "Layout";
  if (/opacity|shadow|blur|blend|filter/.test(value)) return "Effects";
  return "Other";
}

// Common appearance properties offered by the "+ Add property" control, with a
// sensible default token alias so a fresh row is immediately valid.
const COMMON_APPEARANCE_PROPERTIES: Array<{ property: string; defaultAlias: string }> = [
  { property: "background", defaultAlias: "{color.bg.modal}" },
  { property: "color", defaultAlias: "{color.text.body}" },
  { property: "border-color", defaultAlias: "{color.border.base}" },
  { property: "border-width", defaultAlias: "1px" },
  { property: "border-style", defaultAlias: "solid" },
  { property: "radius", defaultAlias: "{radius.scale.2}" },
  // width/height live in the Size section (Figma resizing modes), not here.
  { property: "padding", defaultAlias: "{spacing.scale.2}" },
  { property: "gap", defaultAlias: "{spacing.scale.2}" },
  { property: "typography", defaultAlias: "{typography.paragraph.p3}" },
  { property: "opacity", defaultAlias: "1" },
  { property: "shadow", defaultAlias: "0 2px 8px rgba(0, 0, 0, 0.16)" },
  // Figma fill STACK (background-image layers + per-fill blend), structural.
  { property: "fills", defaultAlias: "linear-gradient(90deg, #7c3aed 0%, #4c9ffe 100%)" },
  // Figma masks at the CSS level (clip-path shapes).
  { property: "clip-path", defaultAlias: "inset(0 round 12px)" },
  // Figma Effects: layer blur / background blur / blend mode.
  { property: "blur", defaultAlias: "blur(4px)" },
  { property: "background-blur", defaultAlias: "blur(8px)" },
  { property: "blend-mode", defaultAlias: "normal" },
];

// Figma corner expander / individual strokes: revealed by the group-header
// toggles (or automatically when a per-corner/per-side binding already exists).
const CORNER_RADIUS_PROPERTIES: Array<{ property: string; defaultAlias: string }> = [
  { property: "border-top-left-radius", defaultAlias: "0px" },
  { property: "border-top-right-radius", defaultAlias: "0px" },
  { property: "border-bottom-right-radius", defaultAlias: "0px" },
  { property: "border-bottom-left-radius", defaultAlias: "0px" },
];
const BORDER_SIDE_WIDTH_PROPERTIES: Array<{ property: string; defaultAlias: string }> = [
  { property: "border-top-width", defaultAlias: "0px" },
  { property: "border-right-width", defaultAlias: "0px" },
  { property: "border-bottom-width", defaultAlias: "0px" },
  { property: "border-left-width", defaultAlias: "0px" },
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
  { property: "text-decoration", defaultAlias: "none" },
  { property: "text-transform", defaultAlias: "none" },
];

// Figma Auto layout: the flex properties driven by the dedicated section (never
// shown as plain appearance rows), and the spacing properties the section takes
// over WHILE auto layout is on.
const AUTO_LAYOUT_FLEX_PROPERTIES = [
  "display",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "justify-content",
] as const;
const AUTO_LAYOUT_SPACING_PROPERTIES = ["gap", "padding-x", "padding-y"] as const;
// Figma padding expander: the four independent sides (bridge keys exist).
const PADDING_SIDE_PROPERTIES = [
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
] as const;
// Figma resizing (W/H): owned by the dedicated Size section, never plain rows.
// flex / align-self encode "Fill container"; min/max live behind the Size
// section's min/max reveal; row-gap belongs to the wrap controls.
const SIZE_SECTION_PROPERTIES = ["width", "height"] as const;
const SIZE_SECTION_EXTRA_PROPERTIES = [
  "flex",
  "align-self",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "row-gap",
  "overflow",
] as const;
const normalizedProperty = (property: string): string =>
  property.toLowerCase().replace(/[-_]/g, "");
// Everything the auto layout remove (×) clears — flex AND grid encodings.
const AUTO_LAYOUT_CLEAR_PROPERTIES = [
  ...AUTO_LAYOUT_FLEX_PROPERTIES,
  "grid-template-columns",
  "grid-template-rows",
  "grid-auto-flow",
  "justify-items",
] as const;
// Absolute positioning (Size section) owns the position/inset properties.
const POSITION_PROPERTIES = ["position", "top", "right", "bottom", "left", "z-index"] as const;
// Managed by the fill stack editor alongside `fills` (index-aligned list).
const FILLS_OWNED_PROPERTIES = ["background-blend-mode"] as const;
const AUTO_LAYOUT_HIDDEN_ALWAYS = new Set(
  [
    ...AUTO_LAYOUT_CLEAR_PROPERTIES,
    ...SIZE_SECTION_PROPERTIES,
    ...SIZE_SECTION_EXTRA_PROPERTIES,
    ...POSITION_PROPERTIES,
    ...FILLS_OWNED_PROPERTIES,
  ].map(normalizedProperty)
);
const AUTO_LAYOUT_HIDDEN_ACTIVE = new Set(
  [...AUTO_LAYOUT_SPACING_PROPERTIES, ...PADDING_SIDE_PROPERTIES].map(normalizedProperty)
);

// Figma resizing modes, expressed as plain width/height CSS values so they flow
// through the same scope-aware binding pipeline as every other appearance edit:
// fixed = explicit size, hug = fit-content, fill = 100%, auto = no override
// (the component's intrinsic CSS).
// ponytail: fill maps to 100% only — Figma's fill inside a row auto-layout
// parent is really flex:1; add a parent-direction-aware mapping if needed.
export type ResizeMode = "auto" | "fixed" | "hug" | "fill";
export function resizeModeFromValue(value: string): ResizeMode {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "auto") return "auto";
  if (/^(fit|max|min)-content$/.test(trimmed)) return "hug";
  if (trimmed === "100%") return "fill";
  return "fixed";
}

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

// Sentinel for a property whose value differs across the multi-selection.
const MIXED_VALUE = "__podo-mixed__";

// In-app appearance clipboard (Figma Cmd+Alt+C / Cmd+Alt+V): the copied part's
// effective property→value map, pasted onto another layer in one batch commit.
let appearanceClipboard: Array<[property: string, reference: string]> | null = null;

// Unique name helper for inline "+" creation (value-2, value-3, …).
function uniqueName(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  let suffix = 2;
  while (set.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

// ---- Figma Effects: structured shadow stack over the box-shadow comma list ----

export interface ShadowLayer {
  inset: boolean;
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
}

/** Splits a box-shadow value into layers at TOP-LEVEL commas (rgba() safe). */
export function splitShadowLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      layers.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) layers.push(current.trim());
  return layers.filter(Boolean);
}

export function parseShadowLayer(layer: string): ShadowLayer {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of layer) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (/\s/.test(char) && depth === 0) {
      if (current) parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) parts.push(current);
  const inset = parts.includes("inset");
  const rest = parts.filter((part) => part !== "inset");
  const isLength = (part: string): boolean => /^-?(\d|\.\d)/.test(part);
  const lengths = rest.filter(isLength);
  const colorParts = rest.filter((part) => !isLength(part));
  return {
    inset,
    x: lengths[0] ?? "0px",
    y: lengths[1] ?? "0px",
    blur: lengths[2] ?? "0px",
    spread: lengths[3] ?? "0px",
    color: colorParts.join(" ") || "rgba(0, 0, 0, 0.16)",
  };
}

export function serializeShadowLayers(layers: ShadowLayer[]): string {
  return layers
    .map((layer) =>
      `${layer.inset ? "inset " : ""}${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${layer.color}`.trim()
    )
    .join(", ");
}

/** Figma-style multi-shadow editor: one row per layer with X/Y/Blur/Spread,
 *  color swatch (HSV+alpha) and an inner-shadow toggle; commits live. */
function ShadowStackEditor({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const layers = splitShadowLayers(value).map(parseShadowLayer);
  const commit = (next: ShadowLayer[]): void => {
    onChange(serializeShadowLayers(next));
  };
  const update = (index: number, patch: Partial<ShadowLayer>): void =>
    commit(layers.map((layer, i) => (i === index ? { ...layer, ...patch } : layer)));
  const offsetFields = ["x", "y", "blur", "spread"] as const;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {layers.map((layer, index) => (
        <div
          key={`${layers.length}-${index}`}
          style={{
            display: "grid",
            gap: 4,
            padding: 6,
            border: "1px solid #eceef2",
            borderRadius: 4,
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <ColorSwatchPicker
              compact
              label={t("components.shadowColor")}
              swatchColor={layer.color}
              value={parseColor(layer.color) ?? { r: 0, g: 0, b: 0, a: 0.16 }}
              onOpen={() => {}}
              onChange={(next) => update(index, { color: formatColorValue(next) })}
            />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11 }}>
              <input
                type="checkbox"
                checked={layer.inset}
                onChange={(event) => update(index, { inset: event.currentTarget.checked })}
              />
              {t("components.shadowInner")}
            </label>
            <button
              type="button"
              aria-label={t("components.shadowRemove")}
              style={{ ...appearanceRemoveStyle, marginLeft: "auto" }}
              onClick={() => commit(layers.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4 }}
          >
            {offsetFields.map((field) => (
              <label
                key={field}
                style={{ display: "grid", gap: 2, fontSize: 10, color: "#6b7280" }}
              >
                {field.toUpperCase()}
                <input
                  type="text"
                  defaultValue={layer[field]}
                  style={railInputStyle}
                  onBlur={(event) =>
                    update(index, { [field]: event.currentTarget.value } as Partial<ShadowLayer>)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      const delta = (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
                      const next = stepDimensionValue(event.currentTarget.value || "0px", delta);
                      if (next !== undefined) {
                        event.preventDefault();
                        event.currentTarget.value = next;
                        update(index, { [field]: next } as Partial<ShadowLayer>);
                      }
                    }
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          style={railButtonStyle}
          onClick={() =>
            commit([
              ...layers,
              {
                inset: false,
                x: "0px",
                y: "2px",
                blur: "8px",
                spread: "0px",
                color: "rgba(0, 0, 0, 0.16)",
              },
            ])
          }
        >
          {t("components.shadowAdd")}
        </button>
        <button type="button" style={railButtonStyle} onClick={onClose}>
          {t("components.done")}
        </button>
      </div>
    </div>
  );
}

// ---- Figma gradient fills: structured editor over CSS gradient() strings ----

export interface GradientStop {
  color: string;
  position: string;
}

export interface GradientValue {
  type: "linear" | "radial" | "conic";
  angle: string;
  stops: GradientStop[];
}

// Splits at top-level separators (commas or spaces), leaving rgba() intact.
function splitTopLevel(value: string, separator: "," | " "): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    const isSeparator = separator === "," ? char === "," : /\s/.test(char);
    if (isSeparator && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function parseGradient(value: string): GradientValue | null {
  const match = /^(linear|radial|conic)-gradient\((.*)\)$/s.exec(value.trim());
  if (!match) return null;
  const type = match[1] as GradientValue["type"];
  const args = splitTopLevel(match[2] ?? "", ",");
  let angle = "90deg";
  let stopArgs = args;
  const first = args[0]?.trim() ?? "";
  if (/deg$|^to |^from |rad$|turn$/.test(first) && type !== "radial") {
    angle = first;
    stopArgs = args.slice(1);
  }
  const stops = stopArgs.map((arg) => {
    const parts = splitTopLevel(arg, " ");
    const last = parts.at(-1) ?? "";
    const hasPosition = parts.length > 1 && /%$|px$|em$/.test(last);
    const position = hasPosition ? (parts.pop() as string) : "";
    return { color: parts.join(" "), position };
  });
  return { type, angle, stops };
}

export function serializeGradient(gradient: GradientValue): string {
  const stops = gradient.stops
    .map((stop) => `${stop.color}${stop.position ? ` ${stop.position}` : ""}`)
    .join(", ");
  if (gradient.type === "linear") return `linear-gradient(${gradient.angle}, ${stops})`;
  // Conic keeps its "from 45deg" start angle (Figma angular gradient rotation).
  if (gradient.type === "conic" && gradient.angle.startsWith("from")) {
    return `conic-gradient(${gradient.angle}, ${stops})`;
  }
  return `${gradient.type}-gradient(${stops})`;
}

const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: "90deg",
  stops: [
    { color: "#7c3aed", position: "0%" },
    { color: "#4c9ffe", position: "100%" },
  ],
};

/** Figma-style gradient editor: type, angle (linear), and a color-stop list. */
function GradientEditor({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const gradient = parseGradient(value) ?? DEFAULT_GRADIENT;
  const commit = (next: GradientValue): void => onChange(serializeGradient(next));
  const updateStop = (index: number, patch: Partial<GradientStop>): void =>
    commit({
      ...gradient,
      stops: gradient.stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)),
    });
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={autoLayoutRowStyle}>
        <select
          aria-label={t("components.gradientType")}
          style={{ ...railSelectStyle, flex: 1, minWidth: 0 }}
          value={gradient.type}
          onChange={(event) =>
            commit({ ...gradient, type: event.currentTarget.value as GradientValue["type"] })
          }
        >
          <option value="linear">linear</option>
          <option value="radial">radial</option>
          <option value="conic">conic</option>
        </select>
        {gradient.type !== "radial" ? (
          <input
            type="text"
            aria-label={t("components.gradientAngle")}
            key={gradient.type}
            defaultValue={
              gradient.type === "conic" && !gradient.angle.startsWith("from") ? "" : gradient.angle
            }
            placeholder={gradient.type === "conic" ? "from 45deg" : "90deg"}
            style={{ ...railInputStyle, width: 90, flexShrink: 0 }}
            onBlur={(event) =>
              commit({
                ...gradient,
                // Conic angles are clearable (empty = no "from …" prefix).
                angle: event.currentTarget.value || (gradient.type === "linear" ? "90deg" : ""),
              })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        ) : null}
      </div>
      {gradient.stops.map((stop, index) => (
        <div key={`${gradient.stops.length}-${index}`} style={autoLayoutRowStyle}>
          <ColorSwatchPicker
            compact
            label={t("components.gradientStop")}
            swatchColor={stop.color}
            value={parseColor(stop.color) ?? { r: 127, g: 127, b: 127, a: 1 }}
            onOpen={() => {}}
            onChange={(next) => updateStop(index, { color: formatColorValue(next) })}
          />
          <input
            type="text"
            aria-label={t("components.gradientStopPosition")}
            defaultValue={stop.position}
            placeholder="%"
            style={{ ...railInputStyle, flex: 1, minWidth: 0 }}
            onBlur={(event) => updateStop(index, { position: event.currentTarget.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <button
            type="button"
            aria-label={t("components.gradientRemoveStop")}
            style={appearanceRemoveStyle}
            disabled={gradient.stops.length <= 2}
            onClick={() =>
              commit({ ...gradient, stops: gradient.stops.filter((_, i) => i !== index) })
            }
          >
            ×
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          style={railButtonStyle}
          onClick={() =>
            commit({
              ...gradient,
              stops: [...gradient.stops, { color: "#ffffff", position: "100%" }],
            })
          }
        >
          {t("components.gradientAddStop")}
        </button>
        <button type="button" style={railButtonStyle} onClick={onClose}>
          {t("components.done")}
        </button>
      </div>
    </div>
  );
}

// ---- Figma multi-fill stack: background-image layers + per-fill blend modes ----

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

/** First stop color of a fill layer, for the row swatch. */
function fillLayerSwatch(layer: string): string | undefined {
  return parseGradient(layer)?.stops[0]?.color;
}

/**
 * Figma-style fill STACK editor. Each fill is one background-image layer
 * (solids are two-identical-stop linear-gradients) with a per-layer blend mode
 * (background-blend-mode list). Layers reorder like Figma's fill list; the top
 * fill in the list paints on top.
 */
function FillStackEditor({
  imagesValue,
  blendValue,
  onChange,
  onClose,
}: {
  imagesValue: string;
  blendValue: string;
  onChange: (images: string, blends: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const layers = splitTopLevel(imagesValue, ",");
  const blends = splitTopLevel(blendValue, ",");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const commit = (nextLayers: string[], nextBlends: string[]): void => {
    const kept = nextLayers
      .map((layer, index) => ({ layer, blend: nextBlends[index] ?? "normal" }))
      .filter(({ layer }) => layer.trim().length > 0);
    const images = kept.map(({ layer }) => layer).join(", ");
    const anyBlend = kept.some(({ blend }) => blend !== "normal");
    onChange(images, anyBlend ? kept.map(({ blend }) => blend).join(", ") : "");
  };
  const move = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= layers.length) return;
    // Uncontrolled inputs inside the expanded editor would show the swapped-in
    // layer's stale values on index reuse — collapse before reordering.
    setExpandedIndex(null);
    const nextLayers = [...layers];
    const nextBlends = layers.map((_, i) => blends[i] ?? "normal");
    [nextLayers[index], nextLayers[target]] = [
      nextLayers[target] as string,
      nextLayers[index] as string,
    ];
    [nextBlends[index], nextBlends[target]] = [
      nextBlends[target] as string,
      nextBlends[index] as string,
    ];
    commit(nextLayers, nextBlends);
  };
  const addLayer = (layer: string): void => {
    commit([layer, ...layers], ["normal", ...layers.map((_, i) => blends[i] ?? "normal")]);
    setExpandedIndex(0);
  };
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {layers.map((layer, index) => {
        const swatch = fillLayerSwatch(layer);
        return (
          <div
            key={`${layers.length}-${index}`}
            style={{
              display: "grid",
              gap: 4,
              padding: 6,
              border: "1px solid #eceef2",
              borderRadius: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <button
                type="button"
                aria-label={t("components.fillEdit", { index: index + 1 })}
                style={{
                  ...swatchStyle,
                  cursor: "pointer",
                  ...(swatch ? { background: swatch } : {}),
                }}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              />
              <select
                aria-label={t("components.fillBlendMode")}
                style={{ ...railSelectStyle, flex: 1, minWidth: 0 }}
                value={blends[index] ?? "normal"}
                onChange={(event) =>
                  commit(
                    layers,
                    layers.map((_, i) =>
                      i === index ? event.currentTarget.value : (blends[i] ?? "normal")
                    )
                  )
                }
              >
                {BLEND_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={t("components.fillMoveUp")}
                style={autoLayoutToggleStyle}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={t("components.fillMoveDown")}
                style={autoLayoutToggleStyle}
                disabled={index === layers.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={t("components.fillRemove")}
                style={appearanceRemoveStyle}
                onClick={() =>
                  commit(
                    layers.filter((_, i) => i !== index),
                    layers.map((_, i) => blends[i] ?? "normal").filter((_, i) => i !== index)
                  )
                }
              >
                ×
              </button>
            </div>
            {expandedIndex === index ? (
              <GradientEditor
                value={layer}
                onChange={(next) =>
                  commit(
                    layers.map((item, i) => (i === index ? next : item)),
                    layers.map((_, i) => blends[i] ?? "normal")
                  )
                }
                onClose={() => setExpandedIndex(null)}
              />
            ) : null}
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          style={railButtonStyle}
          onClick={() => addLayer("linear-gradient(#7c3aed, #7c3aed)")}
        >
          {t("components.fillAddSolid")}
        </button>
        <button
          type="button"
          style={railButtonStyle}
          onClick={() => addLayer("linear-gradient(90deg, #7c3aed 0%, #4c9ffe 100%)")}
        >
          {t("components.fillAddGradient")}
        </button>
        <button type="button" style={railButtonStyle} onClick={onClose}>
          {t("components.done")}
        </button>
      </div>
    </div>
  );
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
  // Figma keeps variant properties compact: one row per axis (name + current
  // value select); the value-management list opens behind a disclosure.
  const [expandedAxes, setExpandedAxes] = useState<Set<string>>(new Set());
  const toggleAxis = (name: string): void =>
    setExpandedAxes((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const renameInput = (defaultValue: string, commit: (next: string) => void) => (
    <input
      autoFocus
      defaultValue={defaultValue}
      aria-label={t("components.name")}
      style={{ ...railTextInputStyle, flex: 1, minWidth: 0 }}
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
    <div style={railSectionStyle}>
      <div style={cardHeaderStyle}>
        <strong style={railSectionTitleStyle}>{t("components.propertiesHeading")}</strong>
        <button
          type="button"
          style={railButtonStyle}
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
        const expanded = expandedAxes.has(axis.name);
        return (
          <div key={axis.name} style={variantAxisBlockStyle}>
            {/* Figma-compact axis row: disclosure · name · current-value select · ×. */}
            <div style={appearanceHeaderStyle}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-label={t("components.manageValues", { name: axis.name })}
                style={{ ...appearanceRemoveStyle, width: 14, flexShrink: 0 }}
                onClick={() => toggleAxis(axis.name)}
              >
                {expanded ? "⌄" : "›"}
              </button>
              {renaming === `axis::${axis.name}` ? (
                renameInput(axis.name, (next) => renameVariantAxis(axis.name, next))
              ) : (
                <span
                  style={{ ...propLabelStyle, flexShrink: 0, maxWidth: 96 }}
                  title={t("components.renameHint")}
                  onDoubleClick={() => setRenaming(`axis::${axis.name}`)}
                >
                  {axis.name}
                </span>
              )}
              <select
                aria-label={axis.name}
                style={{ ...railSelectStyle, flex: 1, minWidth: 0 }}
                value={selectedValue}
                onChange={(event) => onSelectValue(axis.name, event.currentTarget.value)}
              >
                {axis.values.map((value) => (
                  <option key={value} value={value}>
                    {value === axis.default ? `${value} ★` : value}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={t("components.deleteVariantAxis", { name: axis.name })}
                style={appearanceRemoveStyle}
                onClick={() => removeVariantAxis(axis.name)}
              >
                ×
              </button>
            </div>
            {expanded ? (
              <>
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
                  style={railButtonStyle}
                  onClick={() => addVariantValue(axis.name, uniqueName("value", axis.values))}
                >
                  {t("components.addValue")}
                </button>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ComponentsPanelWorkspace({
  componentSearch,
  setComponentSearch,
  filteredComponents,
  setSelectedComponentId,
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
  updateComponentBindingsBatch,
  renameAnatomyPart,
  addAnatomyPart,
  reorderAnatomyPart,
  reparentAnatomyPart,
  moveAnatomyPart,
  duplicateAnatomyParts,
  setAnatomyPartsFlags,
  removeAnatomyParts,
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
  componentSearch: string;
  setComponentSearch: Dispatch<SetStateAction<string>>;
  filteredComponents: ComponentDocument[];
  setSelectedComponentId: Dispatch<SetStateAction<string | undefined>>;
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
  updateComponentBindingsBatch: (
    scope:
      | { kind: "base" }
      | { kind: "variant"; axis: string; value: string }
      | { kind: "state"; state: string }
      | { kind: "combination"; when: Record<string, string> },
    entries: Array<[key: string, reference: string]>
  ) => void;
  renameAnatomyPart: (fromName: string, toName: string) => boolean;
  addAnatomyPart: (name: string, parent?: string) => void;
  reorderAnatomyPart: (partName: string, beforeName: string | null) => void;
  reparentAnatomyPart: (partName: string, newParent: string | null) => void;
  moveAnatomyPart: (partName: string, newParent: string | null, beforeName: string | null) => void;
  duplicateAnatomyParts: (partNames: string[]) => string[];
  setAnatomyPartsFlags: (
    partNames: string[],
    flags: { hidden?: boolean; locked?: boolean }
  ) => void;
  removeAnatomyParts: (partNames: string[]) => void;
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
  // Figma-style layers (anatomy parts) + per-part appearance editing. Ordered
  // multi-selection: the LAST entry is the primary part the sections read from;
  // edits fan out to every selected part (Figma multi-select).
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const setSelectedPart = (part: string): void => setSelectedParts(part ? [part] : []);
  const handleLayerSelect = (
    part: string,
    options?: { toggle?: boolean; range?: string[] }
  ): void => {
    setInspectorTarget("design");
    setSelectedParts((previous) => {
      // Shift+click REPLACES the selection with the anchor→target range (Figma).
      if (options?.range) return options.range;
      if (options?.toggle) {
        return previous.includes(part)
          ? previous.filter((name) => name !== part)
          : [...previous, part];
      }
      return [part];
    });
  };
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
    setSelectedParts([]);
    setHoveredPart(null);
    setInspectorTarget("design");
    setEditingBindingKey(null);
    setAppearanceScope("base");
  }, [selectedComponentForSpec.id]);
  // Draggable layers-column width (drag the handle on its right edge).
  const [layersWidth, setLayersWidth] = useState(240);
  // Wraps the variant matrix so the layer↔preview sync effect can find and ring the
  // selected part's element inside it.
  const matrixRef = useRef<HTMLDivElement>(null);
  // The stage preview wrapper: measurement/marking surface for components
  // WITHOUT a variant matrix (no variants — e.g. doc-tabs, editor).
  const stageWrapRef = useRef<HTMLDivElement>(null);
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
  // Figma-style Pages/Layers split: drag the divider under the components list
  // to trade height between the two left-panel sections.
  const [pagesHeight, setPagesHeight] = useState(192);
  const startPagesResize = (event: ReactPointerEvent): void => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = pagesHeight;
    const onMove = (move: PointerEvent): void =>
      setPagesHeight(
        Math.max(72, Math.min(window.innerHeight - 220, startHeight + move.clientY - startY))
      );
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
  const validSelectedParts = selectedParts.filter((part) => anatomyParts.includes(part));
  const primarySelected = validSelectedParts.at(-1);
  const activePart =
    primarySelected ??
    anatomyParts.find((part) => partsWithBindings.has(part)) ??
    (anatomyParts.includes("root") ? "root" : (anatomyParts[0] ?? "root"));
  // The parts an edit applies to: the multi-selection, or just the active part.
  const editTargets = validSelectedParts.length ? validSelectedParts : [activePart];
  // Bulk layer ops act on the whole selection when the target row is in it.
  const partsFor = (part: string): string[] =>
    validSelectedParts.includes(part) && validSelectedParts.length > 1
      ? validSelectedParts
      : [part];
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
    const root = matrixRef.current ?? stageWrapRef.current;
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
    for (const part of editTargets) mark(part, "podo-part-selected");
    if (hoveredPart && !editTargets.includes(hoveredPart)) mark(hoveredPart, "podo-part-hovered");
  }, [
    activePart,
    editTargets.join("|"),
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
  // The FULL current axis-value combination (compound variant condition).
  const currentCombinationWhen = (): Record<string, string> =>
    Object.fromEntries(
      selectedComponentForSpec.variants.map((variant) => [
        variant.name,
        scopedVariantValue(variant.name),
      ])
    );
  const combinationLabel = (): string =>
    selectedComponentForSpec.variants
      .map((variant) => `${variant.name}=${scopedVariantValue(variant.name)}`)
      .join(" · ");
  const whenLabel = (when: Record<string, string>): string =>
    Object.entries(when)
      .map(([axis, value]) => `${axis}=${value}`)
      .join(" · ");
  const sameWhen = (a: Record<string, string>, b: Record<string, string>): boolean =>
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([axis, value]) => b[axis] === value);
  // Combination scope keys serialize the `when` itself (sorted), so entry GC or
  // reordering in the combinations array can never re-target the active scope.
  const combinationScopeKey = (when: Record<string, string>): string =>
    `combination::${JSON.stringify(Object.fromEntries(Object.entries(when).sort(([a], [b]) => a.localeCompare(b))))}`;
  const combinationWhenForScope = (scope: string): Record<string, string> | null => {
    if (scope === "combination::current") return currentCombinationWhen();
    if (scope.startsWith("combination::")) {
      try {
        return JSON.parse(scope.slice("combination::".length)) as Record<string, string>;
      } catch {
        return null;
      }
    }
    return null;
  };
  const appearanceScopeOptions = [
    ...selectedComponentForSpec.variants.map((variant) => ({
      key: `variant::${variant.name}`,
      label: `${variant.name} = ${scopedVariantValue(variant.name)}`,
    })),
    // Compound condition: the exact current combination of ALL axes (Figma:
    // styling theme=primary AND size=lg without touching either axis alone).
    ...(selectedComponentForSpec.variants.length >= 2
      ? [
          {
            key: "combination::current",
            label: `${t("components.comboLabel")} (${combinationLabel()})`,
          },
        ]
      : []),
    // Existing (possibly partial-axis, hand-authored) combination entries.
    ...(selectedComponentForSpec.combinations ?? [])
      .map((entry) => ({
        key: combinationScopeKey(entry.when),
        label: `${t("components.comboLabel")}: ${whenLabel(entry.when)}`,
        when: entry.when,
      }))
      .filter((option) => !sameWhen(option.when, currentCombinationWhen()))
      .map(({ key, label }) => ({ key, label })),
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
    // Editing a combination pins the preview to its axis values so you see the
    // exact cell you are styling (partial-axis combos pin only their axes).
    if (next.startsWith("combination::")) {
      const when = combinationWhenForScope(next);
      for (const [axis, value] of Object.entries(when ?? {})) {
        commitPreviewSelection(axis, value);
      }
    }
  };
  // Effective bindings for the active scope: base tokens overlaid with the selected
  // variant value's (or state's) overrides, so editing/removing in scope is reflected.
  const scopeTokens: Record<string, string> = (() => {
    const base = { ...(selectedComponentForSpec.tokens ?? {}) } as Record<string, string>;
    if (activeScope === "base") return base;
    if (activeScope.startsWith("combination::")) {
      const when = combinationWhenForScope(activeScope);
      const entry = when
        ? (selectedComponentForSpec.combinations ?? []).find((combination) =>
            sameWhen(combination.when, when)
          )
        : undefined;
      return { ...base, ...((entry?.tokens ?? {}) as Record<string, string>) };
    }
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
  // Auto layout (Figma): active when the selected part has flex bindings in scope.
  const scopeValue = (property: string): string =>
    String(scopeTokens[`${activePart}.${property}`] ?? "");
  const autoLayoutActive =
    scopeValue("display") === "flex" ||
    scopeValue("display") === "grid" ||
    scopeValue("flex-direction").length > 0;
  // Flex props live only in the Auto layout section; while it's on, the section
  // also owns gap / padding X·Y so they don't appear twice.
  const sectionOwnedProperty = (property: string): boolean => {
    const normalized = normalizedProperty(property);
    return (
      AUTO_LAYOUT_HIDDEN_ALWAYS.has(normalized) ||
      (autoLayoutActive && AUTO_LAYOUT_HIDDEN_ACTIVE.has(normalized))
    );
  };
  // Union of bound properties across the multi-selection; a property whose value
  // differs between selected parts renders as "Mixed" (editing normalizes all).
  const boundProperties: string[] = [];
  const seenBoundProperty = new Set<string>();
  for (const part of editTargets) {
    for (const key of Object.keys(scopeTokens)) {
      if (!key.startsWith(`${part}.`)) continue;
      const property = key.slice(part.length + 1);
      if (sectionOwnedProperty(property) || seenBoundProperty.has(property)) continue;
      seenBoundProperty.add(property);
      boundProperties.push(property);
    }
  }
  const partBindings = boundProperties.map((property) => {
    const values = editTargets.map((part) => {
      const value = scopeTokens[`${part}.${property}`];
      return value === undefined ? undefined : String(value);
    });
    const uniform = values.every((value) => value === values[0]);
    return {
      key: `${activePart}.${property}`,
      property,
      reference: uniform ? (values[0] as string) : MIXED_VALUE,
    };
  });
  const presentProperties = new Set(partBindings.map((binding) => binding.property));
  // Figma corner/stroke/padding expanders: manual toggle, or auto-open when a
  // per-corner (per-side) binding already exists so bound rows stay visible.
  const [cornersExpanded, setCornersExpanded] = useState(false);
  // Figma-style collapsible inspector sections (Size / Auto layout / groups).
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const sectionOpen = (name: string): boolean => !collapsedSections.has(name);
  const toggleSection = (name: string): void => {
    // Collapsing unmounts any in-flight row editor WITHOUT its blur-commit —
    // clear the editing state so re-expanding can't resurrect a stale editor.
    setEditingBindingKey(null);
    setCollapsedSections((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  const sectionChevron = (name: string): string => (sectionOpen(name) ? "⌄ " : "› ");
  const [strokeSidesExpanded, setStrokeSidesExpanded] = useState(false);
  const [paddingSidesExpanded, setPaddingSidesExpanded] = useState(false);
  // Figma stroke position, detected from the current encoding: an outline-width
  // binding means outside (negative outline-offset = center); otherwise inside.
  const strokePosition: "inside" | "center" | "outside" = (() => {
    const outlineWidth = scopeValue("outline-width");
    if (!outlineWidth || outlineWidth === "0px") return "inside";
    return Number.parseFloat(scopeValue("outline-offset") || "0") < 0 ? "center" : "outside";
  })();
  const setStrokePosition = (next: "inside" | "center" | "outside"): void => {
    if (next === strokePosition) return;
    const width =
      scopeValue(strokePosition === "inside" ? "border-width" : "outline-width") || "1px";
    const color =
      scopeValue(strokePosition === "inside" ? "border-color" : "outline-color") ||
      scopeValue("border-color") ||
      "{color.border.base}";
    const style =
      scopeValue(strokePosition === "inside" ? "border-style" : "outline-style") || "solid";
    // Token-bound widths resolve through the lookup before halving.
    const resolvedWidth = width.startsWith("{")
      ? cssToken(previewTokenLookup, width.slice(1, -1), "1px")
      : width;
    const half = `-${Math.round((Number.parseFloat(resolvedWidth) || 1) * 50) / 100}px`;
    const entries: Array<[string, string]> = [];
    for (const part of editTargets) {
      if (next === "inside") {
        entries.push([`${part}.border-width`, width]);
        entries.push([`${part}.border-color`, color]);
        entries.push([`${part}.border-style`, style]);
        entries.push([`${part}.outline-style`, "none"]);
        entries.push([`${part}.outline-width`, "0px"]);
        entries.push([`${part}.outline-offset`, "0px"]);
      } else {
        entries.push([`${part}.outline-width`, width]);
        entries.push([`${part}.outline-color`, color]);
        entries.push([`${part}.outline-style`, style]);
        entries.push([`${part}.outline-offset`, next === "center" ? half : "0px"]);
        // Only silence the inner border when the inspector bound one — the
        // component's intrinsic v1 border is left alone.
        if (String(scopeTokens[`${part}.border-width`] ?? "").length > 0) {
          entries.push([`${part}.border-width`, "0px"]);
        }
      }
    }
    applyAppearanceBindings(entries);
  };
  const paddingSidesOpen =
    paddingSidesExpanded ||
    PADDING_SIDE_PROPERTIES.some((property) => scopeValue(property).length > 0);
  const hasAnyBinding = (catalog: Array<{ property: string }>): boolean =>
    catalog.some((entry) => presentProperties.has(entry.property));
  const cornersOpen = cornersExpanded || hasAnyBinding(CORNER_RADIUS_PROPERTIES);
  const strokeSidesOpen = strokeSidesExpanded || hasAnyBinding(BORDER_SIDE_WIDTH_PROPERTIES);
  // Text-bearing parts also offer typography controls (font, size, weight, line
  // height, letter spacing) — like editing a text layer in Figma.
  const appearanceCatalog = [
    ...(isTextBearingPart(selectedComponentForSpec.id, activePart)
      ? [...COMMON_APPEARANCE_PROPERTIES, ...TYPOGRAPHY_APPEARANCE_PROPERTIES]
      : COMMON_APPEARANCE_PROPERTIES),
    ...(cornersOpen ? CORNER_RADIUS_PROPERTIES : []),
    ...(strokeSidesOpen ? BORDER_SIDE_WIDTH_PROPERTIES : []),
  ];
  const seenProperty = new Set<string>();
  const addableProperties = appearanceCatalog.filter((entry) => {
    if (sectionOwnedProperty(entry.property)) return false;
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
  // Figma copy/paste appearance: copy grabs the part's EFFECTIVE bindings in the
  // active scope; paste fans them onto the target part in one commit.
  const copyPartAppearance = (part: string): void => {
    const entries = Object.entries(scopeTokens)
      .filter(([key]) => key.startsWith(`${part}.`))
      .map(
        ([key, reference]) => [key.slice(part.length + 1), String(reference)] as [string, string]
      );
    if (entries.length) appearanceClipboard = entries;
  };
  const pastePartAppearance = (part: string): void => {
    const clipboard = appearanceClipboard;
    if (!clipboard) return;
    // Fan the paste out to the whole multi-selection in ONE commit.
    applyAppearanceBindings(
      partsFor(part).flatMap((target) =>
        clipboard.map(
          ([property, reference]) => [`${target}.${property}`, reference] as [string, string]
        )
      )
    );
  };
  // Batch variant: N bindings, ONE commit (auto layout add/remove, alignment).
  const applyAppearanceBindings = (entries: Array<[key: string, reference: string]>): void => {
    if (activeScope === "base") {
      updateComponentBindingsBatch({ kind: "base" }, entries);
      return;
    }
    if (activeScope.startsWith("combination::")) {
      const when = combinationWhenForScope(activeScope);
      if (when) updateComponentBindingsBatch({ kind: "combination", when }, entries);
      return;
    }
    if (activeScope.startsWith("state::")) {
      updateComponentBindingsBatch({ kind: "state", state: activeScope.slice(7) }, entries);
      return;
    }
    const axisName = activeScope.slice("variant::".length);
    updateComponentBindingsBatch(
      { kind: "variant", axis: axisName, value: scopedVariantValue(axisName) },
      entries
    );
  };
  // Fan an edit out to every selected part (Figma multi-select editing): one
  // property value, N `<part>.<property>` bindings, ONE commit.
  const applyToSelection = (property: string, reference: string): void =>
    applyAppearanceBindings(editTargets.map((part) => [`${part}.${property}`, reference]));
  // The active scope's OWN token bucket (no base overlay): base tokens, the
  // scoped variant value's overrides, or the state's overrides. Used to decide
  // whether an "off"/"remove" edit can be expressed as a key deletion here.
  const scopeOwnTokens: Record<string, string> = (() => {
    if (activeScope === "base") {
      return (selectedComponentForSpec.tokens ?? {}) as Record<string, string>;
    }
    if (activeScope.startsWith("combination::")) {
      const when = combinationWhenForScope(activeScope);
      const entry = when
        ? (selectedComponentForSpec.combinations ?? []).find((combination) =>
            sameWhen(combination.when, when)
          )
        : undefined;
      return (entry?.tokens ?? {}) as Record<string, string>;
    }
    if (activeScope.startsWith("state::")) {
      const state = selectedComponentForSpec.states.find(
        (item) => item.name === activeScope.slice(7)
      );
      return (state?.tokens ?? {}) as Record<string, string>;
    }
    const axisName = activeScope.slice("variant::".length);
    const variant = selectedComponentForSpec.variants.find((item) => item.name === axisName);
    return (variant?.valueTokens?.[scopedVariantValue(axisName)] ?? {}) as Record<string, string>;
  })();
  // Reseed key for always-mounted inputs: distinguishes the scoped variant VALUE
  // too, so switching e.g. size md→lg remounts the fields with lg's bindings
  // instead of committing md's stale text into lg on blur.
  const scopeInstanceKey = activeScope.startsWith("variant::")
    ? `${activeScope}=${scopedVariantValue(activeScope.slice("variant::".length))}`
    : activeScope.startsWith("combination::")
      ? `combination::${whenLabel(combinationWhenForScope(activeScope) ?? {})}`
      : activeScope;
  // Figma-style Size section: W/H resizing modes (auto/fixed/hug/fill) writing
  // width/height bindings. Switching to Fixed seeds the input with the part's
  // MEASURED rendered size (like Figma showing the current px), read from the
  // selected matrix cell's representative element.
  const partElement = (part: string): Element | undefined => {
    const selector = componentPartSelector(selectedComponentForSpec.id, part);
    const root = matrixRef.current ?? stageWrapRef.current;
    if (!selector || !root) return undefined;
    const cell = root.querySelector("[data-podo-selected-cell]") ?? root;
    const matches = Array.from(cell.querySelectorAll(selector));
    return matches.find((element) => !element.classList.contains("other")) ?? matches[0];
  };
  const measurePartSize = (property: "width" | "height", part = activePart): string => {
    const fallback = property === "width" ? "100px" : "40px";
    const size = partElement(part)?.getBoundingClientRect()[property];
    return size ? `${Math.round(size)}px` : fallback;
  };
  // Figma shows the RESOLVED rendered value for unbound properties — border
  // style "none", opacity "100%", the actual radius/colors — read from the
  // selected matrix cell's live element instead of an empty "—".
  const computedPartValue = (property: string): string => {
    const cssProperty = appearanceCssProperty(property);
    const element = partElement(activePart);
    if (!cssProperty || !element) return "";
    const value = window.getComputedStyle(element).getPropertyValue(cssProperty).trim();
    if (!value) return "";
    // url(data:...) fills are unreadable and their unbreakable length can blow
    // grid tracks — Figma shows image fills as a thumbnail, we show nothing.
    if (value.includes("url(")) return "";
    if (normalizedProperty(property) === "opacity") {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? `${Math.round(numeric * 100)}%` : value;
    }
    if (isColorAppearanceProperty(property)) {
      const color = parseColor(value);
      // Fully transparent computed colors mean "no fill here" — keep the dash.
      if (!color || color.a === 0) return "";
      return formatColorValue(color);
    }
    return value;
  };
  // Offset of a part inside its anatomy parent's element (absolute positioning
  // seed). Approximation: the anatomy parent's DOM element may not be the CSS
  // offset parent; 0px fallback keeps it predictable.
  const measurePartOffset = (part: string, side: "top" | "left"): string => {
    const parentName = selectedComponentForSpec.anatomy.find(
      (entry) => entry.name === part
    )?.parent;
    const child = partElement(part)?.getBoundingClientRect();
    const parent = parentName ? partElement(parentName)?.getBoundingClientRect() : undefined;
    if (!child || !parent) return "0px";
    return `${Math.round(child[side] - parent[side])}px`;
  };
  // Direction of the anatomy PARENT's auto layout (if any) — decides how Fill
  // is encoded: flex:1 on the parent's main axis, align-self:stretch on the
  // cross axis, width/height:100% when the parent isn't a flex container.
  const flexParentDirection = (part = activePart): "row" | "column" | null => {
    const parentName = selectedComponentForSpec.anatomy.find(
      (entry) => entry.name === part
    )?.parent;
    if (!parentName) return null;
    const display = String(scopeTokens[`${parentName}.display`] ?? "");
    const direction = String(scopeTokens[`${parentName}.flex-direction`] ?? "");
    if (display !== "flex" && !direction) return null;
    return direction === "column" ? "column" : "row";
  };
  const MIN_MAX_PROPERTIES = ["min-width", "max-width", "min-height", "max-height"] as const;
  const [minMaxExpanded, setMinMaxExpanded] = useState(false);
  const minMaxOpen =
    minMaxExpanded || MIN_MAX_PROPERTIES.some((property) => scopeValue(property).length > 0);
  const renderSizeSection = () => (
    <div style={appearanceGroupStyle}>
      <div style={appearanceHeaderStyle}>
        <span style={appearanceGroupTitleStyle} onClick={() => toggleSection("size")}>
          {sectionChevron("size")}
          {t("components.size")}
        </span>
        {/* Figma "Add min/max…": reveals min/max W·H clamps. */}
        <button
          type="button"
          aria-pressed={minMaxOpen}
          aria-label={t("components.minMaxToggle")}
          title={t("components.minMaxToggle")}
          style={{
            ...autoLayoutToggleStyle,
            ...(minMaxOpen ? autoLayoutToggleActiveStyle : {}),
          }}
          onClick={() => setMinMaxExpanded(!minMaxOpen)}
        >
          min/max
        </button>
      </div>
      {sectionOpen("size") && (
        <div style={geometryPairStyle}>
          {SIZE_SECTION_PROPERTIES.map((property) => {
            const axis = property === "width" ? "W" : "H";
            const raw = scopeValue(property);
            const parentDirection = flexParentDirection();
            const axisIsMain =
              parentDirection !== null && (property === "width") === (parentDirection === "row");
            // Fill can be encoded two ways: width/height 100% (no flex parent) or
            // flex:1 / align-self:stretch inside an auto-layout parent (Figma).
            const fillByFlex =
              parentDirection !== null &&
              (!raw || raw === "auto") &&
              (axisIsMain
                ? scopeValue("flex").trim().startsWith("1")
                : scopeValue("align-self") === "stretch");
            const mode: ResizeMode = fillByFlex ? "fill" : resizeModeFromValue(raw);
            // "Auto" clears the binding — only offered where clearing actually works:
            // when this scope's own bucket holds the key (or nothing is bound at all).
            // In an overlay scope a base-inherited size can't be deleted, but picking
            // another mode overrides it, after which Auto reappears to revert that.
            const fillKey = axisIsMain ? "flex" : "align-self";
            const ownsBinding =
              `${activePart}.${property}` in scopeOwnTokens ||
              `${activePart}.${fillKey}` in scopeOwnTokens;
            // Applies the mode to EVERY selected part, each with its own parent
            // direction (a row-parent child gets flex:1 while a column-parent child
            // gets align-self:stretch in the same gesture).
            const setResizeMode = (next: ResizeMode): void => {
              const entries: Array<[string, string]> = [];
              for (const part of editTargets) {
                const partParentDirection = flexParentDirection(part);
                const partAxisIsMain =
                  partParentDirection !== null &&
                  (property === "width") === (partParentDirection === "row");
                const partFillKey = partAxisIsMain ? "flex" : "align-self";
                const key = `${part}.${property}`;
                const rawPart = String(scopeTokens[key] ?? "");
                // In overlay scopes, deleting ("") a binding the BASE owns is a
                // silent no-op — write an explicit neutral instead.
                const clearSize =
                  activeScope !== "base" && !(key in scopeOwnTokens) && rawPart ? "auto" : "";
                const fillKeyFull = `${part}.${partFillKey}`;
                const fillValueNow = String(scopeTokens[fillKeyFull] ?? "");
                const clearFill =
                  activeScope !== "base" && !(fillKeyFull in scopeOwnTokens) && fillValueNow
                    ? partAxisIsMain
                      ? "0 0 auto"
                      : "auto"
                    : "";
                // Clear any previous flex-based fill encoding for this axis first.
                if (partParentDirection !== null) entries.push([fillKeyFull, clearFill]);
                if (next === "auto") entries.push([key, clearSize]);
                else if (next === "hug") entries.push([key, "fit-content"]);
                else if (next === "fixed") entries.push([key, measurePartSize(property, part)]);
                else if (partParentDirection !== null) {
                  entries.push([key, clearSize]);
                  entries.push(
                    partAxisIsMain ? [`${part}.flex`, "1 1 0"] : [`${part}.align-self`, "stretch"]
                  );
                } else {
                  entries.push([key, "100%"]);
                }
              }
              applyAppearanceBindings(entries);
            };
            // Explicit option color: the chevron-only select hides its VALUE with
            // color:transparent, and options inherit that — keep the dropdown list
            // readable regardless.
            const optionStyle = { color: "#171a20" } as const;
            const modeOptions = (
              <>
                {mode === "auto" || ownsBinding ? (
                  <option value="auto" style={optionStyle}>
                    {t("components.resizeAuto")}
                  </option>
                ) : null}
                <option value="fixed" style={optionStyle}>
                  {t("components.resizeFixed")}
                </option>
                <option value="hug" style={optionStyle}>
                  {t("components.resizeHug")}
                </option>
                <option value="fill" style={optionStyle}>
                  {t("components.resizeFill")}
                </option>
              </>
            );
            return (
              // Figma W|H cell: in-field axis glyph; Fixed shows the number with a
              // chevron-only mode dropdown, other modes show the mode dropdown.
              <div
                key={property}
                style={{ position: "relative", display: "flex", gap: 4, minWidth: 0 }}
              >
                <span style={fieldGlyphStyle} aria-hidden>
                  {axis}
                </span>
                {mode === "fixed" ? (
                  <>
                    <input
                      // Mounts when entering Fixed (seeded from the measured/current
                      // value); reseeds on part/scope/variant-value switches.
                      key={`${activePart}:${scopeInstanceKey}:${property}`}
                      type="text"
                      aria-label={t("components.resizeValueFor", { axis })}
                      defaultValue={raw}
                      style={{ ...railInputStyle, paddingLeft: 20, flex: 1, minWidth: 0 }}
                      onBlur={(event) => applyToSelection(property, event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          const delta =
                            (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
                          const next = stepDimensionValue(
                            event.currentTarget.value || "0px",
                            delta
                          );
                          if (next !== undefined) {
                            event.preventDefault();
                            event.currentTarget.value = next;
                            applyToSelection(property, next);
                          }
                        }
                      }}
                    />
                    <select
                      aria-label={t("components.resizeModeFor", { axis })}
                      style={modeChevronSelectStyle}
                      value={mode}
                      onChange={(event) => setResizeMode(event.currentTarget.value as ResizeMode)}
                    >
                      {modeOptions}
                    </select>
                  </>
                ) : (
                  <select
                    aria-label={t("components.resizeModeFor", { axis })}
                    style={{ ...railSelectStyle, paddingLeft: 20, flex: 1, minWidth: 0 }}
                    value={mode}
                    onChange={(event) => setResizeMode(event.currentTarget.value as ResizeMode)}
                  >
                    {modeOptions}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}
      {sectionOpen("size") && minMaxOpen
        ? MIN_MAX_PROPERTIES.map((property) => (
            <label key={property} style={propRowStyle}>
              <span style={propLabelStyle}>{appearancePropertyLabel(property, t)}</span>
              <input
                key={`${activePart}:${scopeInstanceKey}:${property}`}
                type="text"
                defaultValue={scopeValue(property)}
                placeholder={t("components.rawValuePlaceholder")}
                style={{ ...railInputStyle, flex: 1, minWidth: 0 }}
                onBlur={(event) => applyToSelection(property, event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                    const delta = (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
                    const next = stepDimensionValue(event.currentTarget.value || "0px", delta);
                    if (next !== undefined) {
                      event.preventDefault();
                      event.currentTarget.value = next;
                      applyToSelection(property, next);
                    }
                  }
                }}
              />
            </label>
          ))
        : null}
      {sectionOpen("size") &&
        (() => {
          // Figma "absolute position": pulls the layer out of flow; T/R/B/L +
          // z-index inputs appear, seeded from the measured offset in its parent
          // (the anatomy parent also gains position:relative so insets anchor).
          const absolute = scopeValue("position") === "absolute";
          const overlayInherited = (part: string, property: string): boolean =>
            activeScope !== "base" &&
            !(`${part}.${property}` in scopeOwnTokens) &&
            String(scopeTokens[`${part}.${property}`] ?? "").length > 0;
          return (
            <>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <input
                  type="checkbox"
                  checked={absolute}
                  onChange={(event) => {
                    const on = event.currentTarget.checked;
                    const entries: Array<[string, string]> = [];
                    for (const part of editTargets) {
                      if (on) {
                        entries.push([`${part}.position`, "absolute"]);
                        entries.push([`${part}.top`, measurePartOffset(part, "top")]);
                        entries.push([`${part}.left`, measurePartOffset(part, "left")]);
                        const parentName = selectedComponentForSpec.anatomy.find(
                          (entry) => entry.name === part
                        )?.parent;
                        if (
                          parentName &&
                          !String(scopeTokens[`${parentName}.position`] ?? "").length
                        ) {
                          entries.push([`${parentName}.position`, "relative"]);
                        }
                      } else {
                        entries.push([
                          `${part}.position`,
                          overlayInherited(part, "position") ? "static" : "",
                        ]);
                        for (const side of ["top", "right", "bottom", "left"] as const) {
                          entries.push([
                            `${part}.${side}`,
                            overlayInherited(part, side) ? "auto" : "",
                          ]);
                        }
                        entries.push([`${part}.z-index`, ""]);
                      }
                    }
                    applyAppearanceBindings(entries);
                  }}
                />
                {t("components.absolutePosition")}
              </label>
              {absolute ? (
                <div style={geometryPairStyle}>
                  {(["top", "right", "bottom", "left", "z-index"] as const).map((property) => (
                    <label
                      key={property}
                      style={{ position: "relative", display: "flex", minWidth: 0 }}
                    >
                      <span style={fieldGlyphStyle} aria-hidden>
                        {property === "z-index" ? "Z" : property.toUpperCase().slice(0, 1)}
                      </span>
                      <input
                        key={`${activePart}:${scopeInstanceKey}:${property}`}
                        type="text"
                        aria-label={property}
                        defaultValue={scopeValue(property)}
                        placeholder={property === "z-index" ? "1" : "0px"}
                        style={{ ...railInputStyle, paddingLeft: 20, flex: 1, minWidth: 0 }}
                        onBlur={(event) => applyToSelection(property, event.currentTarget.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                            const delta =
                              (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
                            const next = stepDimensionValue(
                              event.currentTarget.value || "0px",
                              delta
                            );
                            if (next !== undefined) {
                              event.preventDefault();
                              event.currentTarget.value = next;
                              applyToSelection(property, next);
                            }
                          }
                        }}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </>
          );
        })()}
    </div>
  );
  // Figma-style Auto layout section for the selected layer. Direction / wrap /
  // spacing-mode toggles, a 9-dot alignment grid, and gap / padding X·Y inputs —
  // all writing scope-aware flex bindings through the appearance handlers.
  const renderAutoLayoutSection = () => {
    const direction = scopeValue("flex-direction") === "column" ? "column" : "row";
    // Fourth Figma layout mode: grid (display:grid + explicit templates).
    const layoutMode: "row" | "column" | "grid" =
      scopeValue("display") === "grid" ? "grid" : direction;
    const wrap = scopeValue("flex-wrap") === "wrap";
    // Removing (deleting keys) only works in the bucket that OWNS the flex
    // bindings; in an overlay scope where auto layout shines through from base,
    // deletion is a silent no-op, so the × is not offered there.
    const autoLayoutOwnedHere = ["display", "flex-direction", "grid-template-columns"].some(
      (property) => `${activePart}.${property}` in scopeOwnTokens
    );
    const normalizeAlign = (value: string): string => value.replace(/^flex-/, "");
    // Grid aligns ITEMS on the inline axis via justify-items (not content).
    const justifyProperty = layoutMode === "grid" ? "justify-items" : "justify-content";
    const justify = normalizeAlign(scopeValue(justifyProperty) || "flex-start");
    const align = normalizeAlign(scopeValue("align-items") || "flex-start");
    // "Distributed" spacing modes take over the main axis (the grid then picks
    // only the cross alignment) — Figma's packed vs space-between, plus the CSS
    // distributions Figma lacks.
    const DISTRIBUTED_JUSTIFY = ["space-between", "space-around", "space-evenly"];
    const spaceBetween = DISTRIBUTED_JUSTIFY.includes(justify);
    const AXIS_VALUES = ["flex-start", "center", "flex-end"] as const;
    const clipped = scopeValue("overflow") === "hidden";
    const spacingInput = (property: string) => (
      <label key={property} style={propRowStyle}>
        <span style={propLabelStyle}>{appearancePropertyLabel(property, t)}</span>
        <input
          // Reseed on part/scope/variant-value switches; stable while stepping
          // so focus holds.
          key={`${activePart}:${scopeInstanceKey}:${property}`}
          type="text"
          defaultValue={scopeValue(property)}
          placeholder={t("components.rawValuePlaceholder")}
          style={{ ...railInputStyle, flex: 1, minWidth: 0 }}
          onBlur={(event) => applyToSelection(property, event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              const delta = (event.key === "ArrowUp" ? 1 : -1) * (event.shiftKey ? 10 : 1);
              const next = stepDimensionValue(event.currentTarget.value || "0px", delta);
              if (next !== undefined) {
                event.preventDefault();
                event.currentTarget.value = next;
                applyToSelection(property, next);
              }
            }
          }}
        />
      </label>
    );
    return (
      <div style={appearanceGroupStyle}>
        <div style={appearanceHeaderStyle}>
          <span style={appearanceGroupTitleStyle} onClick={() => toggleSection("autolayout")}>
            {sectionChevron("autolayout")}
            {t("components.autoLayout")}
          </span>
          {autoLayoutActive ? (
            autoLayoutOwnedHere ? (
              <button
                type="button"
                aria-label={t("components.autoLayoutRemove")}
                title={t("components.autoLayoutRemove")}
                style={appearanceRemoveStyle}
                onClick={() =>
                  applyAppearanceBindings(
                    editTargets.flatMap((part) =>
                      AUTO_LAYOUT_CLEAR_PROPERTIES.map(
                        (property) => [`${part}.${property}`, ""] as [string, string]
                      )
                    )
                  )
                }
              >
                ×
              </button>
            ) : null
          ) : (
            <button
              type="button"
              aria-label={t("components.autoLayoutAdd")}
              title={t("components.autoLayoutAdd")}
              style={railButtonStyle}
              onClick={() =>
                applyAppearanceBindings(
                  editTargets.flatMap((part) => [
                    [`${part}.display`, "flex"] as [string, string],
                    [`${part}.flex-direction`, "row"] as [string, string],
                    ...(scopeValue("gap")
                      ? []
                      : [[`${part}.gap`, "{spacing.scale.2}"] as [string, string]]),
                  ])
                )
              }
            >
              +
            </button>
          )}
        </div>
        {autoLayoutActive && sectionOpen("autolayout") ? (
          <>
            <div style={autoLayoutRowStyle}>
              {(["row", "column", "grid"] as const).map((mode) => {
                const label =
                  mode === "row"
                    ? t("components.directionRow")
                    : mode === "column"
                      ? t("components.directionColumn")
                      : t("components.layoutGrid");
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={layoutMode === mode}
                    aria-label={label}
                    title={label}
                    style={{
                      ...autoLayoutToggleStyle,
                      ...(layoutMode === mode ? autoLayoutToggleActiveStyle : {}),
                    }}
                    onClick={() =>
                      applyAppearanceBindings(
                        editTargets.flatMap((part) =>
                          mode === "grid"
                            ? [
                                [`${part}.display`, "grid"] as [string, string],
                                ...(String(scopeTokens[`${part}.grid-template-columns`] ?? "")
                                  ? []
                                  : [
                                      [`${part}.grid-template-columns`, "repeat(2, 1fr)"] as [
                                        string,
                                        string,
                                      ],
                                    ]),
                              ]
                            : [
                                [`${part}.display`, "flex"] as [string, string],
                                [`${part}.flex-direction`, mode] as [string, string],
                              ]
                        )
                      )
                    }
                  >
                    {mode === "row" ? "→" : mode === "column" ? "↓" : "⊞"}
                  </button>
                );
              })}
              {layoutMode !== "grid" ? (
                <button
                  type="button"
                  aria-pressed={wrap}
                  style={{
                    ...autoLayoutToggleStyle,
                    ...(wrap ? autoLayoutToggleActiveStyle : {}),
                  }}
                  // Off writes an EXPLICIT "nowrap": deleting the key would be a
                  // silent no-op in variant/state scopes where wrap comes from base.
                  onClick={() => applyToSelection("flex-wrap", wrap ? "nowrap" : "wrap")}
                >
                  {t("components.wrap")}
                </button>
              ) : null}
              {/* Figma baseline alignment (horizontal auto layout, icon+label rows). */}
              {layoutMode === "row" ? (
                <button
                  type="button"
                  aria-pressed={align === "baseline"}
                  title={t("components.baseline")}
                  style={{
                    ...autoLayoutToggleStyle,
                    ...(align === "baseline" ? autoLayoutToggleActiveStyle : {}),
                  }}
                  onClick={() =>
                    applyToSelection(
                      "align-items",
                      align === "baseline" ? "flex-start" : "baseline"
                    )
                  }
                >
                  ↧
                </button>
              ) : null}
              {layoutMode !== "grid" ? (
                <select
                  aria-label={t("components.distribution")}
                  style={{ ...railSelectStyle, flex: 1, minWidth: 0 }}
                  value={spaceBetween ? justify : "packed"}
                  onChange={(event) =>
                    applyToSelection(
                      "justify-content",
                      event.currentTarget.value === "packed"
                        ? "flex-start"
                        : event.currentTarget.value
                    )
                  }
                >
                  <option value="packed">{t("components.packed")}</option>
                  <option value="space-between">{t("components.spaceBetween")}</option>
                  <option value="space-around">{t("components.spaceAround")}</option>
                  <option value="space-evenly">{t("components.spaceEvenly")}</option>
                </select>
              ) : null}
            </div>
            <div style={{ ...autoLayoutRowStyle, alignItems: "flex-start" }}>
              <div style={alignmentGridStyle} role="group" aria-label={t("components.alignment")}>
                {[0, 1, 2].flatMap((rowIndex) =>
                  [0, 1, 2].map((columnIndex) => {
                    // Main axis follows the direction (Figma transposes the grid);
                    // grid mode reads left-to-right (justify-items) untransposed.
                    const transpose = layoutMode === "column";
                    const mainValue = AXIS_VALUES[transpose ? rowIndex : columnIndex] as string;
                    const crossValue = AXIS_VALUES[transpose ? columnIndex : rowIndex] as string;
                    const isActive = spaceBetween
                      ? normalizeAlign(crossValue) === align
                      : normalizeAlign(mainValue) === justify &&
                        normalizeAlign(crossValue) === align;
                    return (
                      <button
                        key={`${rowIndex}-${columnIndex}`}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={t("components.alignDot", {
                          justify: normalizeAlign(mainValue),
                          align: normalizeAlign(crossValue),
                        })}
                        style={alignmentDotButtonStyle}
                        onClick={() =>
                          applyAppearanceBindings(
                            editTargets.flatMap((part) => [
                              // In space-between mode the main axis is distributed;
                              // the grid then only picks the cross alignment.
                              ...(spaceBetween
                                ? []
                                : [[`${part}.${justifyProperty}`, mainValue] as [string, string]]),
                              [`${part}.align-items`, crossValue] as [string, string],
                            ])
                          )
                        }
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 99,
                            background: isActive ? "#1d4ed8" : "#c4cad3",
                          }}
                        />
                      </button>
                    );
                  })
                )}
              </div>
              <div style={{ display: "grid", gap: 4, flex: 1, minWidth: 0 }}>
                {layoutMode === "grid" ? (
                  <>
                    {spacingInput("grid-template-columns")}
                    {spacingInput("grid-template-rows")}
                  </>
                ) : null}
                {spacingInput("gap")}
                {/* Wrap (and grid rows) unlock the independent between-row gap. */}
                {wrap || layoutMode === "grid" ? spacingInput("row-gap") : null}
                {paddingSidesOpen ? (
                  <>
                    {spacingInput("padding-top")}
                    {spacingInput("padding-right")}
                    {spacingInput("padding-bottom")}
                    {spacingInput("padding-left")}
                  </>
                ) : (
                  <>
                    {spacingInput("padding-x")}
                    {spacingInput("padding-y")}
                  </>
                )}
                <div style={autoLayoutRowStyle}>
                  {/* Figma padding expander: X/Y ↔ four independent sides. */}
                  <button
                    type="button"
                    aria-pressed={paddingSidesOpen}
                    title={t("components.paddingPerSide")}
                    style={{
                      ...autoLayoutToggleStyle,
                      ...(paddingSidesOpen ? autoLayoutToggleActiveStyle : {}),
                    }}
                    onClick={() => setPaddingSidesExpanded(!paddingSidesOpen)}
                  >
                    ⊞
                  </button>
                  {/* Figma "Clip content". Off writes an explicit visible so it
                      also works in overlay scopes. */}
                  <label
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11 }}
                  >
                    <input
                      type="checkbox"
                      checked={clipped}
                      onChange={(event) =>
                        applyToSelection(
                          "overflow",
                          event.currentTarget.checked ? "hidden" : "visible"
                        )
                      }
                    />
                    {t("components.clipContent")}
                  </label>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
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
    <section
      style={{
        ...componentPanelWorkspaceLayout,
        gridTemplateColumns: `${layersWidth}px minmax(0, 1fr) 240px`,
      }}
    >
      <aside style={layersColumnStyle}>
        <div
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startLayersResize}
          style={layerResizeHandleStyle}
        />
        {/* Figma-style single left panel: components list (Pages) over Layers. */}
        <div style={{ borderBottom: "1px solid #e6e6e6", display: "grid", minWidth: 0 }}>
          <div style={panelSectionHeaderStyle}>
            <strong style={railSectionTitleStyle}>{t("components.heading")}</strong>
          </div>
          <div style={{ padding: "0 8px 8px" }}>
            <input
              aria-label={t("components.search")}
              placeholder={t("components.search")}
              style={{ ...railTextInputStyle, width: "100%" }}
              value={componentSearch}
              onChange={(event) => setComponentSearch(event.currentTarget.value)}
            />
          </div>
          <div
            style={{
              height: pagesHeight,
              overflowY: "auto",
              display: "grid",
              alignContent: "start",
              paddingBottom: 8,
            }}
          >
            {filteredComponents.map((component) => (
              <button
                key={component.id}
                type="button"
                title={`${component.name} / ${component.id}`}
                style={
                  selectedComponentForSpec.id === component.id
                    ? { ...pagesRowStyle, ...pagesRowActiveStyle }
                    : pagesRowStyle
                }
                onClick={() => setSelectedComponentId(component.id)}
              >
                <span
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {component.name}
                </span>
              </button>
            ))}
          </div>
          {/* Figma-style Pages/Layers divider: drag to resize the list above. */}
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label={t("components.pagesResize")}
            onPointerDown={startPagesResize}
            style={{
              // position:relative makes zIndex effective, so the negative-margin
              // overlap paints ABOVE the layers header — full 7px hit zone.
              position: "relative",
              height: 7,
              margin: "-3px 0 -4px",
              cursor: "row-resize",
              zIndex: 5,
            }}
          />
        </div>
        {policy.design ? (
          <>
            <div style={panelSectionHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.layers")}</strong>
              {policy.structure ? (
                <button
                  type="button"
                  style={railButtonStyle}
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
              selectedParts={validSelectedParts.length ? validSelectedParts : [activePart]}
              highlightPart={hoveredPart}
              structureLocked={!policy.structure}
              // Selecting a layer is a design action: switch to the design
              // inspector; Shift/Cmd modifiers extend the selection (Figma).
              onSelect={handleLayerSelect}
              onHover={setHoveredPart}
              onRename={(from, to) => {
                // Only follow the rename when it committed — a rejected rename
                // (name collision) must not move selection to a ghost layer.
                if (renameAnatomyPart(from, to)) setSelectedPart(to.trim() || from);
              }}
              onAdd={addAnatomyPart}
              // Bulk ops: act on the whole multi-selection when the target row
              // is part of it (Figma right-click on a selection).
              onDuplicate={(part) => {
                const copies = duplicateAnatomyParts(partsFor(part));
                if (copies.length) setSelectedParts(copies);
              }}
              onRemove={(part) => removeAnatomyParts(partsFor(part))}
              onReorder={reorderAnatomyPart}
              onReparent={reparentAnatomyPart}
              onMove={moveAnatomyPart}
              onToggleHidden={(part, hidden) => setAnatomyPartsFlags(partsFor(part), { hidden })}
              onToggleLocked={(part, locked) => setAnatomyPartsFlags(partsFor(part), { locked })}
              onCopyAppearance={copyPartAppearance}
              onPasteAppearance={pastePartAppearance}
            />
          </>
        ) : null}
      </aside>
      <div style={stickyPreviewColumnStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={canvasFrameLabelStyle}>
            <span>{selectedComponentForSpec.name}</span>
          </div>
          <div
            ref={stageWrapRef}
            style={
              effectiveInspectorTarget === "preview"
                ? {
                    ...componentPreviewPanelStyle,
                    outline: "2px solid #0d99ff",
                    outlineOffset: 1,
                  }
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
        </div>
        {(() => {
          const matrix = renderComponentPreviewMatrix({
            component: selectedComponentForSpec,
            selections: effectiveComponentPreviewSelections,
            lookup: previewTokenLookup,
            onSelect: (next, part, modifiers) => {
              // Shift/Cmd+click extends the multi-selection WITHOUT switching the
              // previewed variant cell (Figma canvas multi-select).
              if (modifiers?.toggle && part && !lockedParts.has(part)) {
                handleLayerSelect(part, { toggle: true });
                return;
              }
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
            <div style={{ minWidth: 0 }}>
              <div style={componentSetLabelStyle}>
                <span aria-hidden>◈</span>
                <span>{t("components.variantSet")}</span>
              </div>
              <div
                ref={matrixRef}
                style={componentSetFrameStyle}
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
                    ".podo-part-hovered { outline: 1px solid #0d99ff !important; outline-offset: 1px; }"
                  }
                </style>
                {matrix}
              </div>
            </div>
          ) : null;
        })()}
      </div>
      {/* Keyed by component: switching selection unmounts open pickers/drafts in
          the rail so they can't keep editing (or writing to) the previous
          component's bindings — Figma closes inspector popovers the same way. */}
      <div style={propertiesRailStyle} key={selectedComponentForSpec?.id ?? "none"}>
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
          <div style={railSectionStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>
                {t("components.design", { part: humanizeLabel(activePart) })}
              </strong>
            </div>
            {appearanceScopeOptions.length ? (
              <label style={propRowStyle}>
                <span style={propLabelStyle}>{t("components.applyTo")}</span>
                <select
                  style={railSelectStyle}
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
            {renderSizeSection()}
            {renderAutoLayoutSection()}
            <div style={appearanceGroupsStyle}>
              {appearanceRows.length ? (
                APPEARANCE_GROUP_ORDER.filter((group) =>
                  appearanceRows.some((row) => appearanceGroup(row.property) === group)
                ).map((group) => (
                  <div key={group} style={appearanceGroupStyle}>
                    <div style={appearanceHeaderStyle}>
                      <span style={appearanceGroupTitleStyle} onClick={() => toggleSection(group)}>
                        {sectionChevron(group)}
                        {t(`components.group.${group}`)}
                      </span>
                      {/* Figma expanders: per-corner radius / per-side stroke widths. */}
                      {group === "Corners" ? (
                        <button
                          type="button"
                          aria-pressed={cornersOpen}
                          aria-label={t("components.expandCorners")}
                          title={t("components.expandCorners")}
                          style={{
                            ...autoLayoutToggleStyle,
                            ...(cornersOpen ? autoLayoutToggleActiveStyle : {}),
                          }}
                          onClick={() => setCornersExpanded(!cornersOpen)}
                        >
                          ⛶
                        </button>
                      ) : null}
                      {group === "Stroke" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          {/* Figma stroke position. inside = CSS border; outside =
                              outline (offset 0); center = outline pulled halfway in
                              via a negative offset. Translates the INSPECTOR's
                              stroke bindings only — intrinsic v1 borders are not
                              rewritten (ponytail: geometry-exact center needs a
                              vector model). */}
                          <select
                            aria-label={t("components.strokePosition")}
                            style={{ ...railSelectStyle, width: 96, flexShrink: 0 }}
                            value={strokePosition}
                            onChange={(event) =>
                              setStrokePosition(
                                event.currentTarget.value as "inside" | "center" | "outside"
                              )
                            }
                          >
                            <option value="inside">{t("components.strokeInside")}</option>
                            <option value="center">{t("components.strokeCenter")}</option>
                            <option value="outside">{t("components.strokeOutside")}</option>
                          </select>
                          <button
                            type="button"
                            aria-pressed={strokeSidesOpen}
                            aria-label={t("components.expandStrokeSides")}
                            title={t("components.expandStrokeSides")}
                            style={{
                              ...autoLayoutToggleStyle,
                              ...(strokeSidesOpen ? autoLayoutToggleActiveStyle : {}),
                            }}
                            onClick={() => setStrokeSidesExpanded(!strokeSidesOpen)}
                          >
                            ⊞
                          </button>
                        </span>
                      ) : null}
                    </div>
                    {sectionOpen(group) &&
                      appearanceRows
                        .filter((row) => appearanceGroup(row.property) === group)
                        .map((row) => {
                          const isColor = isColorAppearanceProperty(row.property);
                          const isMixed = row.reference === MIXED_VALUE;
                          // A binding is a {token} alias or a raw CSS value.
                          const isAlias = !isMixed && row.reference.startsWith("{");
                          const resolved = isMixed
                            ? t("components.mixed")
                            : isAlias
                              ? cssToken(previewTokenLookup, row.reference.slice(1, -1), "")
                              : row.reference;
                          const tokenName = isAlias ? row.reference.slice(1, -1) : "";
                          // Unbound rows display the part's computed value (muted),
                          // like Figma's inspector; editing seeds from it too.
                          const computedFallback =
                            !isMixed && !resolved ? computedPartValue(row.property) : "";
                          const raw = isRawValueProperty(row.property);
                          const enumOptions = enumOptionsForProperty(row.property);
                          const isShadowStack = normalizedProperty(row.property) === "shadow";
                          const isGradient = normalizedProperty(row.property) === "gradient";
                          const isFills = normalizedProperty(row.property) === "fills";
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
                                    onClick={() => applyToSelection(row.property, "")}
                                  >
                                    ×
                                  </button>
                                ) : null}
                              </div>
                              {editingBindingKey === row.key ? (
                                isShadowStack ? (
                                  // Figma Effects: structured multi-shadow editor over the
                                  // box-shadow comma list (X/Y/blur/spread/color/inner).
                                  <ShadowStackEditor
                                    value={isMixed ? "" : row.reference || row.defaultAlias || ""}
                                    onChange={(next) => applyToSelection(row.property, next)}
                                    onClose={() => setEditingBindingKey(null)}
                                  />
                                ) : isFills ? (
                                  // Figma fill stack: background-image layers with
                                  // per-fill blend modes, both fanned to the selection.
                                  <FillStackEditor
                                    imagesValue={isMixed ? "" : row.reference || ""}
                                    blendValue={String(
                                      scopeTokens[`${activePart}.background-blend-mode`] ?? ""
                                    )}
                                    onChange={(images, blendModes) =>
                                      applyAppearanceBindings(
                                        editTargets.flatMap((part) => [
                                          [`${part}.fills`, images] as [string, string],
                                          [`${part}.background-blend-mode`, blendModes] as [
                                            string,
                                            string,
                                          ],
                                        ])
                                      )
                                    }
                                    onClose={() => setEditingBindingKey(null)}
                                  />
                                ) : isGradient ? (
                                  // Legacy gradient binding: type/angle/stops editor over
                                  // a single CSS gradient() function string.
                                  <GradientEditor
                                    value={isMixed ? "" : row.reference || row.defaultAlias || ""}
                                    onChange={(next) => applyToSelection(row.property, next)}
                                    onClose={() => setEditingBindingKey(null)}
                                  />
                                ) : enumOptions ? (
                                  <select
                                    autoFocus
                                    style={railSelectStyle}
                                    value={
                                      !isMixed && enumOptions.includes(row.reference)
                                        ? row.reference
                                        : enumOptions.includes(computedFallback)
                                          ? computedFallback
                                          : (row.defaultAlias ?? enumOptions[0])
                                    }
                                    onChange={(event) => {
                                      applyToSelection(row.property, event.currentTarget.value);
                                      setEditingBindingKey(null);
                                    }}
                                    onBlur={() => setEditingBindingKey(null)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Escape") setEditingBindingKey(null);
                                    }}
                                  >
                                    {enumOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                ) : raw ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    // Unbound raw rows start from the catalog default (e.g. 14px)
                                    // or the part's computed value so there's something to tweak.
                                    defaultValue={
                                      isMixed
                                        ? ""
                                        : row.reference || row.defaultAlias || computedFallback
                                    }
                                    placeholder={t("components.rawValuePlaceholder")}
                                    style={railTextInputStyle}
                                    onBlur={(event) => {
                                      const next = event.currentTarget.value;
                                      // An unbound row seeded with the computed/default value
                                      // must not become a binding on blur-without-edit.
                                      const seed = isMixed
                                        ? ""
                                        : row.reference || row.defaultAlias || computedFallback;
                                      if (row.bound || next !== seed) {
                                        applyToSelection(row.property, next);
                                      }
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
                                            (isMixed ? "" : row.reference) ||
                                            row.defaultAlias ||
                                            computedFallback,
                                          delta
                                        );
                                        if (next !== undefined) {
                                          event.preventDefault();
                                          event.currentTarget.value = next;
                                          applyToSelection(row.property, next);
                                        }
                                      }
                                    }}
                                  />
                                ) : (
                                  <TokenPicker
                                    autoFocus
                                    compact
                                    options={optionsForProperty(row.property)}
                                    placeholder={tokenName}
                                    onPick={(reference) => {
                                      applyToSelection(row.property, reference);
                                      setEditingBindingKey(null);
                                    }}
                                    onCancel={() => setEditingBindingKey(null)}
                                  />
                                )
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    minWidth: 0,
                                  }}
                                >
                                  {isColor ? (
                                    // Figma fill row: the swatch opens the inline HSV+alpha
                                    // picker (writes a raw color, detaching any token —
                                    // same as editing a variable-bound fill in Figma);
                                    // the chip still opens the token picker.
                                    <ColorSwatchPicker
                                      compact
                                      label={appearancePropertyLabel(row.property, t)}
                                      swatchColor={
                                        isMixed
                                          ? undefined
                                          : resolved || computedFallback || undefined
                                      }
                                      value={
                                        (isMixed
                                          ? undefined
                                          : parseColor(resolved || computedFallback)) ?? {
                                          r: 127,
                                          g: 127,
                                          b: 127,
                                          a: 1,
                                        }
                                      }
                                      onOpen={() => setEditingBindingKey(null)}
                                      onChange={(next) =>
                                        applyToSelection(row.property, formatColorValue(next))
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
                                    <span
                                      style={
                                        !resolved && computedFallback
                                          ? { ...tokenChipValueStyle, color: "#98a1ad" }
                                          : tokenChipValueStyle
                                      }
                                    >
                                      {resolved || computedFallback || "—"}
                                    </span>
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
          <div style={railSectionStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.state")}</strong>
            </div>
            <label style={propRowStyle}>
              <span style={propLabelStyle}>{t("components.stateLabel")}</span>
              <select
                style={railSelectStyle}
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
          <div style={railSectionStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.variants")}</strong>
            </div>
            <div style={railFieldsStyle}>
              {selectedComponentForSpec.variants.map((variant) => (
                <label key={`variant:${variant.name}`} style={propRowStyle}>
                  <span style={propLabelStyle}>{variant.name}</span>
                  <select
                    style={railSelectStyle}
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
          <div style={railSectionStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.previewText")}</strong>
            </div>
            <div style={railFieldsStyle}>
              <label style={propRowStyle}>
                <span style={propLabelStyle}>{t("components.previewTextLabel")}</span>
                <input
                  style={railTextInputStyle}
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
          <div style={railSectionStyle}>
            <div style={cardHeaderStyle}>
              <strong style={railSectionTitleStyle}>{t("components.slotContent")}</strong>
            </div>
            <label style={propRowStyle}>
              <span style={propLabelStyle}>control</span>
              <select
                style={railSelectStyle}
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
          <div style={railSectionStyle}>
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
                          style={railSelectStyle}
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
                      <label key={prop.name} style={railCheckboxFieldStyle}>
                        <input
                          type="checkbox"
                          style={railCheckboxInputStyle}
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
                          style={railInputStyle}
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
                            style={railTextareaStyle}
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
                          style={railTextInputStyle}
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
          <div style={railSectionStyle}>
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
        <details style={disclosureStyle}>
          <summary style={summaryStyle}>{t("components.details")}</summary>
          <div style={editorFormStyle}>
            <label style={railFieldStyle}>
              {t("components.name")}
              <input
                style={railTextInputStyle}
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
            <label style={railFieldStyle}>
              {t("components.category")}
              <select
                style={railSelectStyle}
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
            <label style={railFieldStyle}>
              {t("components.status")}
              <select
                style={railSelectStyle}
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
            <label style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
              {t("components.description")}
              <input
                style={railTextInputStyle}
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
              <button type="button" style={railButtonStyle} onClick={saveComponentMetaDraft}>
                {t("components.save")}
              </button>
            </div>
          </div>
        </details>
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
                <div style={railSectionStyle}>
                  <div style={cardHeaderStyle}>
                    <strong style={railSectionTitleStyle}>{t("components.props")}</strong>
                    <button
                      type="button"
                      style={railButtonStyle}
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
                    <label style={railFieldStyle}>
                      {t("components.name")}
                      <input
                        style={railTextInputStyle}
                        value={propDraft.name}
                        onChange={(event) => {
                          const name = event.currentTarget.value;
                          setPropDraft((draft) => ({ ...draft, name }));
                        }}
                      />
                    </label>
                    <label style={railFieldStyle}>
                      {t("components.type")}
                      <select
                        style={railSelectStyle}
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
                    <label style={railFieldStyle}>
                      {t("components.values")}
                      <input
                        style={railTextInputStyle}
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
                    <label style={railFieldStyle}>
                      {t("components.default")}
                      <input
                        style={railTextInputStyle}
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
                    <label style={railCheckboxFieldStyle}>
                      <input
                        type="checkbox"
                        style={railCheckboxInputStyle}
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
                    <label style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
                      {t("components.description")}
                      <input
                        style={railTextInputStyle}
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
                      <button type="button" style={railButtonStyle} onClick={savePropDraft}>
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
                <div style={railSectionStyle}>
                  <div style={cardHeaderStyle}>
                    <strong style={railSectionTitleStyle}>{t("components.variants")}</strong>
                    <button
                      type="button"
                      style={railButtonStyle}
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
                    <label style={railFieldStyle}>
                      {t("components.name")}
                      <input
                        style={railTextInputStyle}
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
                    <div style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
                      <div style={cardHeaderStyle}>
                        <span>{t("components.valuesSelectDefault")}</span>
                        <button
                          type="button"
                          style={railButtonStyle}
                          onClick={addVariantDraftValue}
                        >
                          {t("components.addValue")}
                        </button>
                      </div>
                      {variantValueRows.map((value, index) => (
                        <div key={index} style={variantValueRowStyle}>
                          <input
                            type="radio"
                            name={`podo-draft-default-${selectedComponentForSpec.id}`}
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
                            style={railTextInputStyle}
                            aria-label={t("components.variantValueLabel", { index: index + 1 })}
                            value={value}
                            onChange={(event) =>
                              updateVariantValue(index, event.currentTarget.value)
                            }
                          />
                          <button
                            type="button"
                            style={appearanceRemoveStyle}
                            aria-label={t("components.removeValue", {
                              value: value || t("components.valueFallback"),
                            })}
                            disabled={variantValueRows.length <= 1}
                            onClick={() => removeVariantDraftValue(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
                      {t("components.tokenBindingsJson")}
                      <textarea
                        style={railTextareaStyle}
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
                    <label style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
                      {t("components.description")}
                      <input
                        style={railTextInputStyle}
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
                      <button type="button" style={railButtonStyle} onClick={saveVariantDraft}>
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
                <div style={railSectionStyle}>
                  <div style={cardHeaderStyle}>
                    <strong>{t("components.slots")}</strong>
                    <button
                      type="button"
                      style={railButtonStyle}
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
                    <label style={railFieldStyle}>
                      {t("components.name")}
                      <input
                        style={railTextInputStyle}
                        value={slotDraft.name}
                        onChange={(event) => {
                          const name = event.currentTarget.value;
                          setSlotDraft((draft) => ({ ...draft, name }));
                        }}
                      />
                    </label>
                    <label style={railCheckboxFieldStyle}>
                      <input
                        type="checkbox"
                        style={railCheckboxInputStyle}
                        checked={slotDraft.required}
                        onChange={(event) => {
                          const required = event.currentTarget.checked;
                          setSlotDraft((draft) => ({ ...draft, required }));
                        }}
                      />
                      {t("components.required")}
                    </label>
                    <label style={railCheckboxFieldStyle}>
                      <input
                        type="checkbox"
                        style={railCheckboxInputStyle}
                        checked={slotDraft.repeated}
                        onChange={(event) => {
                          const repeated = event.currentTarget.checked;
                          setSlotDraft((draft) => ({ ...draft, repeated }));
                        }}
                      />
                      {t("components.repeated")}
                    </label>
                    <label style={railFieldStyle}>
                      {t("components.fallback")}
                      <input
                        style={railTextInputStyle}
                        value={slotDraft.fallback}
                        onChange={(event) => {
                          const fallback = event.currentTarget.value;
                          setSlotDraft((draft) => ({ ...draft, fallback }));
                        }}
                      />
                    </label>
                    <label style={{ ...railFieldStyle, gridColumn: "1 / -1" }}>
                      {t("components.description")}
                      <input
                        style={railTextInputStyle}
                        value={slotDraft.description}
                        onChange={(event) => {
                          const description = event.currentTarget.value;
                          setSlotDraft((draft) => ({ ...draft, description }));
                        }}
                      />
                    </label>
                    <div style={rowStyle}>
                      <button type="button" style={railButtonStyle} onClick={saveSlotDraft}>
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
                  style={{ ...railTextareaStyle, minHeight: 220 }}
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

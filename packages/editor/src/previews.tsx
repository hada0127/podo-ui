import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ComponentDocument } from "@podo/spec";
import type { Translate } from "./i18n/context.js";
// Real v1 component CSS (compiled from the main branch), scoped under
// `.podo-v1-stage` so previews render with the actual v1 styling. See
// scripts/vendor-v1-css.mjs.
import "./v1-components.generated.css";
// The actual v1 rich-text editor + datepicker components, vendored verbatim, so
// the preview has ALL real features. They use plain class names that the scoped
// v1 CSS styles inside `.podo-v1-stage`.
import V1Editor from "./vendor/v1-editor/index.js";
import type { ToolbarItem } from "./vendor/v1-editor/types.js";
import V1DatePicker from "./vendor/v1-datepicker.js";
import V1Avatar from "./vendor/v1-avatar.js";
import V1Button from "./vendor/v1-button.js";
import V1Checkbox from "./vendor/v1-checkbox.js";
import V1Radio from "./vendor/v1-radio.js";
import V1Chip from "./vendor/v1-chip.js";
import V1FileInput from "./vendor/v1-file.js";
import V1Input from "./vendor/v1-input.js";
import V1Label from "./vendor/v1-label.js";
import V1Select from "./vendor/v1-select.js";
import V1Textarea from "./vendor/v1-textarea.js";
import V1Toggle from "./vendor/v1-toggle.js";
import V1Tooltip from "./vendor/v1-tooltip.js";
import V1Field from "./vendor/v1-field.js";
import V1Pagination from "./vendor/v1-pagination.js";
import V1Tab from "./vendor/v1-tab.js";
import V1Table from "./vendor/v1-table.js";
import V1Toast from "./vendor/v1-toast.js";
import {
  cssToken,
  isTypographyValue,
  resolveTokenPath,
  resolveTokenValue,
  responsiveSizePc,
  type TokenLookup,
} from "./token-lookup.js";
import {
  codeStyle,
  componentMatrixCellStyle,
  componentMatrixHeaderCellStyle,
  componentMatrixHeaderStyle,
  componentMatrixPanelStyle,
  componentMatrixPreviewButtonActiveStyle,
  componentMatrixPreviewButtonStyle,
  componentMatrixPreviewClipStyle,
  componentMatrixRowHeaderStyle,
  componentMatrixScrollStyle,
  componentMatrixTableStyle,
  componentPreviewStageStyle,
} from "./styles.js";

export const legacyComponentPreviewIds = [
  "avatar",
  "button",
  "checkbox-radio",
  "chip",
  "datepicker",
  "doc-tabs",
  "editor",
  "field",
  "file",
  "input",
  "label",
  "pagination",
  "select",
  "tab",
  "table",
  "textarea",
  "toast",
  "toggle",
  "tooltip",
] as const;

type ComponentPreviewRenderer = (
  selections: Record<string, string>,
  lookup: TokenLookup,
  // Editor preview only: lets edits made inside the live editor flow back to the
  // `value` prop (and its textarea) so the inspector stays in sync.
  onValueChange?: (value: string) => void
) => ReactNode;
type LegacyComponentPreviewId = (typeof legacyComponentPreviewIds)[number];

export function renderComponentPreview(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup,
  onValueChange?: (value: string) => void
) {
  return (
    <div
      className="podo-v1-stage podo-design-target"
      style={componentPreviewStageStyleFromTokens(lookup)}
      data-podo-preview-component-id={component.id}
      data-podo-preview-kind={componentPreviewKind(component)}
    >
      <style>
        {componentAppearanceCss(component, lookup, selections, "podo-design-target") +
          // Ring the layer-sync mark here too: for components without a variant
          // matrix (no variants, e.g. doc-tabs) the stage is the only surface
          // that can show the selected-layer ring.
          "\n" +
          selectedPartCss("podo-design-target")}
      </style>
      {renderComponentPreviewBody(component, selections, lookup, onValueChange)}
    </div>
  );
}

// Components whose preview is a full, stateful v1 app with global document
// listeners (focus, click-outside, contentEditable). Rendering several live
// instances in the variant matrix makes them fight each other, so we show only
// the single interactive preview above and skip the matrix for them.
const SINGLE_INSTANCE_PREVIEW_IDS = new Set(["editor"]);

// Small "+" beside an axis name in the matrix header (add a variant value).
const matrixAddValueButtonStyle: CSSProperties = {
  width: 16,
  height: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e6e6e6",
  borderRadius: 4,
  background: "#ffffff",
  color: "#3f3f46",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: 1,
  padding: 0,
};

// Label above each expanded picker in the datepicker design list.
const datepickerListLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#616167",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

// Prefixes EVERY comma-separated alternative of a part selector with the scope
// class. A plain `.${scope} ${selector}` prefix would scope only the first
// alternative and leak the rest document-wide (e.g. checkbox-radio's
// "input[type=checkbox]:not(.toggle), input[type=radio]").
// ponytail: naive top-level comma split — breaks if a part selector ever nests a
// comma inside :not(a, b)/:is(); none do today, revisit with a real parser then.
function scopeSelector(scope: string, selector: string): string {
  return selector
    .split(",")
    .map((alternative) => `.${scope} ${alternative.trim()}`)
    .join(", ");
}

// The CSS selector for an anatomy part, so callers (e.g. the editor's layer↔preview
// sync effect) can find that part's element in the rendered preview.
export function componentPartSelector(componentId: string, part: string): string | undefined {
  return COMPONENT_PART_SELECTORS[componentId]?.[part];
}

// Rings exactly ONE element (the `.podo-part-selected` mark), so selecting a part
// that renders many elements (e.g. calendar-day → 35 cells) highlights a single
// representative instead of lighting up the whole class. The mark is placed by the
// editor effect that keeps the layer selection and this preview in sync.
// `.podo-part-hovered` is the lighter Figma-style hover ring, marked by the same
// effect while a layer row (or preview element) is hovered.
function selectedPartCss(scope: string): string {
  return (
    `.${scope} .podo-part-selected { outline: 2px solid #0d99ff !important; outline-offset: 1px; }\n` +
    `.${scope} .podo-part-hovered { outline: 1px solid #0d99ff !important; outline-offset: 1px; }`
  );
}

export function renderComponentPreviewMatrix(input: {
  component: ComponentDocument;
  selections: Record<string, string>;
  lookup: TokenLookup;
  onSelect(
    selections: Record<string, string>,
    part?: string,
    modifiers?: { toggle?: boolean }
  ): void;
  // Figma-style "add variant" straight from the set: renders a small + next to
  // each axis name in the header. Omitted for style-only components.
  onAddValue?(axisName: string): void;
  selectedPart?: string;
  t: Translate;
}) {
  if (SINGLE_INSTANCE_PREVIEW_IDS.has(input.component.id)) {
    return null;
  }
  const rowVariant = input.component.variants[0];
  if (!rowVariant) {
    return null;
  }
  const columnVariant = input.component.variants[1];
  const columns = columnVariant?.values ?? ["preview"];
  const defaultSelections = defaultPreviewSelectionsForComponent(input.component);

  // Datepicker: expanded pickers overlap in a grid (an open calendar/range
  // overflows a narrow column), so list ONE variant per full-width row. The
  // dropdown is forced into normal flow (position:static) so each row sizes to its
  // own open picker — no overlap. Click any element to design that part.
  if (input.component.id === "datepicker") {
    return (
      <div style={componentMatrixPanelStyle}>
        <div style={componentMatrixHeaderStyle}>
          <strong>{input.t("previews.variantMatrix")}</strong>
        </div>
        <style>
          {
            ".podo-datepicker-design .dropdown{position:static !important;margin-top:8px;box-shadow:none}"
          }
        </style>
        <div style={{ display: "grid", gap: 12 }}>
          {rowVariant.values.flatMap((rowValue, rowIndex) =>
            columns.map((columnValue, columnIndex) => {
              const cellSelections = {
                ...defaultSelections,
                [rowVariant.name]: rowValue,
                ...(columnVariant ? { [columnVariant.name]: columnValue } : {}),
                previewOpen: "true",
              };
              const cellOnSelect = {
                ...input.selections,
                [rowVariant.name]: rowValue,
                ...(columnVariant ? { [columnVariant.name]: columnValue } : {}),
              };
              const selected =
                input.selections[rowVariant.name] === rowValue &&
                (!columnVariant || input.selections[columnVariant.name] === columnValue);
              const cellScope = `podo-design-row-${rowIndex}-${columnIndex}`;
              const label = columnVariant ? `${rowValue} · ${columnValue}` : rowValue;
              return (
                <div
                  key={cellScope}
                  role="button"
                  tabIndex={0}
                  // Marks the selected variant row so the layer↔preview sync effect
                  // knows which row's element to ring (the row the user is designing).
                  data-podo-selected-cell={selected ? "true" : undefined}
                  style={{
                    ...componentMatrixPreviewButtonStyle,
                    display: "block",
                    textAlign: "left",
                    ...(selected ? componentMatrixPreviewButtonActiveStyle : {}),
                  }}
                  // This row is a DESIGN surface, not a live preview: intercept in
                  // the capture phase so clicking a date / nav / time select selects
                  // that part for editing instead of operating the picker. mousedown
                  // is blocked too (stops native <select> popups, focus, drag-select).
                  onMouseDownCapture={(event) => event.preventDefault()}
                  onClickCapture={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    input.onSelect(
                      cellOnSelect,
                      componentPartForElement(input.component.id, event.target as Element),
                      // Shift/Cmd extends the layer multi-selection (Figma canvas).
                      { toggle: event.shiftKey || event.metaKey || event.ctrlKey }
                    );
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      input.onSelect(cellOnSelect);
                    }
                  }}
                >
                  <div style={datepickerListLabelStyle}>{label}</div>
                  <span className={`podo-v1-stage podo-datepicker-design ${cellScope}`}>
                    <style>
                      {/* includeBase=true: this is a design surface, so the part's
                          base appearance edits must show in every row. */}
                      {componentAppearanceCss(
                        input.component,
                        input.lookup,
                        cellSelections,
                        cellScope,
                        true
                      ) +
                        // Ring the single marked element (set by the layer↔preview sync
                        // effect): selecting a layer on the left rings its element here,
                        // and clicking an element here selects its layer. Both in sync.
                        "\n" +
                        selectedPartCss(cellScope)}
                    </style>
                    {renderComponentPreviewBody(input.component, cellSelections, input.lookup)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const addValueButton = (axisName: string): ReactNode =>
    input.onAddValue ? (
      <button
        type="button"
        style={matrixAddValueButtonStyle}
        aria-label={input.t("previews.addValue", { axis: axisName })}
        title={input.t("previews.addValue", { axis: axisName })}
        onClick={() => input.onAddValue?.(axisName)}
      >
        +
      </button>
    ) : null;

  return (
    <div style={componentMatrixPanelStyle}>
      <div style={componentMatrixHeaderStyle}>
        <strong>{input.t("previews.variantMatrix")}</strong>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {rowVariant.name}
          {addValueButton(rowVariant.name)}
          {columnVariant ? (
            <>
              {" x "}
              {columnVariant.name}
              {addValueButton(columnVariant.name)}
            </>
          ) : null}
        </span>
      </div>
      <div style={componentMatrixScrollStyle}>
        <table style={componentMatrixTableStyle}>
          <thead>
            <tr>
              {/* Corner cell pins on BOTH axes so 2-axis scrolling can't slide
                  row headers over/under it. */}
              <th style={{ ...componentMatrixHeaderCellStyle, left: 0, zIndex: 2 }}>
                {rowVariant.name}
              </th>
              {columns.map((column) => (
                <th key={column} style={componentMatrixHeaderCellStyle}>
                  {columnVariant ? column : input.t("previews.preview")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowVariant.values.map((rowValue, rowIndex) => (
              <tr key={rowValue}>
                <th style={componentMatrixRowHeaderStyle}>{rowValue}</th>
                {columns.map((columnValue, columnIndex) => {
                  // The matrix is a stable reference grid: each cell shows its own
                  // variant combo with DEFAULT content, so editing the preview's
                  // test controls (text / icon / state) never changes the matrix.
                  const cellSelections = {
                    ...defaultSelections,
                    [rowVariant.name]: rowValue,
                    ...(columnVariant ? { [columnVariant.name]: columnValue } : {}),
                  };
                  // Clicking a cell selects that variant for design — carry the
                  // current selections so the live preview keeps its overrides.
                  const cellOnSelect = {
                    ...input.selections,
                    [rowVariant.name]: rowValue,
                    ...(columnVariant ? { [columnVariant.name]: columnValue } : {}),
                  };
                  const selected =
                    input.selections[rowVariant.name] === rowValue &&
                    (!columnVariant || input.selections[columnVariant.name] === columnValue);
                  // Index-based scope class guarantees uniqueness (value-derived
                  // names could collide after sanitization).
                  const cellScope = `podo-design-cell-${rowIndex}-${columnIndex}`;
                  return (
                    <td key={columnValue} style={componentMatrixCellStyle}>
                      <div
                        role="button"
                        tabIndex={0}
                        // Measurement anchor: partElement() reads sizes/computed
                        // values from THIS cell (falls back to the first cell
                        // without it — wrong variant when a non-default is chosen).
                        data-podo-selected-cell={selected ? "true" : undefined}
                        style={{
                          ...componentMatrixPreviewButtonStyle,
                          ...(selected ? componentMatrixPreviewButtonActiveStyle : {}),
                        }}
                        onClick={(event) =>
                          input.onSelect(
                            cellOnSelect,
                            componentPartForElement(input.component.id, event.target as Element),
                            { toggle: event.shiftKey || event.metaKey || event.ctrlKey }
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            input.onSelect(cellOnSelect);
                          }
                        }}
                      >
                        <span
                          className={`podo-v1-stage ${cellScope}`}
                          style={componentMatrixPreviewClipStyle}
                        >
                          <style>
                            {componentAppearanceCss(
                              input.component,
                              input.lookup,
                              cellSelections,
                              cellScope,
                              false
                            ) +
                              // Ring the single marked element (set by the layer↔preview
                              // sync effect) — a selector-based ring would light up EVERY
                              // instance of a multi-element part (e.g. all three doc-tabs
                              // tabs), making the selected variant look differently shaped.
                              "\n" +
                              selectedPartCss(cellScope)}
                          </style>
                          {renderComponentPreviewBody(
                            input.component,
                            cellSelections,
                            input.lookup
                          )}
                        </span>
                      </div>
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

export function componentPreviewKind(component: ComponentDocument): "dedicated" | "spec-driven" {
  return isLegacyComponentPreviewId(component.id) ? "dedicated" : "spec-driven";
}

function renderComponentPreviewBody(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup,
  onValueChange?: (value: string) => void
) {
  const renderer = isLegacyComponentPreviewId(component.id)
    ? legacyComponentPreviewRenderers[component.id]
    : undefined;
  return renderer
    ? renderer(selections, lookup, onValueChange)
    : renderSpecDrivenComponentPreview(component, lookup);
}

// Components rendered as a schematic card on the canvas instead of a live
// instance: the editor/datepicker are heavy single-instance apps the user opted
// out of, and `layout` containers are structural (slot drop targets).
const CANVAS_SCHEMATIC_IDS = new Set(["editor", "datepicker"]);

export function isCanvasLiveComponent(component: ComponentDocument): boolean {
  return component.category !== "layout" && !CANVAS_SCHEMATIC_IDS.has(component.id);
}

// Renders the REAL v1 component (no preview-stage chrome) for use as a canvas
// shape body, so placed components look and read like the actual component —
// Figma-style — and update live as their props change.
export function renderComponentInstance(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup
): ReactNode {
  return (
    <div
      className="podo-v1-stage"
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      {renderComponentPreviewBody(component, selections, lookup)}
    </div>
  );
}

// Like renderComponentInstance but hugs its content (inline), for use as an
// auto-layout child inside a flex container.
export function renderComponentInline(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup
): ReactNode {
  return (
    <span className="podo-v1-stage" style={{ display: "inline-flex", alignItems: "center" }}>
      {renderComponentPreviewBody(component, selections, lookup)}
    </span>
  );
}

// Joins truthy class names; falsy entries are dropped so v1 "default" values emit
// no class (matching the v1 SCSS, which styles the bare element).
function v1Classes(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

// Preview "controls" feed runtime prop values through the selections map so the
// user can change a component's text/icon and see it applied live. Text content
// is carried on the reserved `text` key (most components render their content via
// anatomy/children, not a spec prop); icon names come straight from the string
// props (icon / rightIcon).
function previewText(s: Record<string, string>, fallback: string): string {
  const value = s.text ?? s.children;
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}
function previewIcon(s: Record<string, string>, key = "icon"): string | undefined {
  const value = s[key];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function renderButtonPreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  const icon = previewIcon(s, "icon");
  const rightIcon = previewIcon(s, "rightIcon");
  return (
    <V1Button
      theme={(s.theme ?? "default") as never}
      variant={(s.variant ?? "solid") as never}
      size={(s.size ?? "sm") as never}
      textAlign={(s.textAlign ?? s.alignment ?? "center") as never}
      loading={state === "loading" || s.loading === "true"}
      disabled={state === "disabled" || s.disabled === "true"}
      {...(icon ? { icon } : {})}
      {...(rightIcon ? { rightIcon } : {})}
    >
      {previewText(s, "Submit")}
    </V1Button>
  );
}

function renderChipPreview(s: Record<string, string>) {
  const icon = previewIcon(s, "icon");
  return (
    <V1Chip
      theme={(s.theme ?? "default") as never}
      type={(s.type ?? "default") as never}
      size={(s.size ?? "md") as never}
      round={s.shape === "round" || s.round === "true"}
      onDelete={() => {}}
      {...(icon ? { icon } : {})}
    >
      {previewText(s, "Status")}
    </V1Chip>
  );
}

function renderCheckboxRadioPreview(s: Record<string, string>) {
  const control = s.control ?? "checkbox";
  const state = s.state ?? "default";
  const checked = state === "checked" || s.checked === "true";
  const disabled = state === "disabled" || s.disabled === "true";
  const vertical = (s.layout ?? "horizontal") === "vertical" || s.vertical === "true";
  // Key on `checked` so toggling the checked control remounts the box (uncontrolled
  // defaultChecked only applies on mount) while it stays clickable in the preview.
  const checkedKey = checked ? "on" : "off";
  if (control === "radio-group") {
    return <CheckboxRadioGroupPreview vertical={vertical} disabled={disabled} />;
  }
  if (control === "radio") {
    return (
      <V1Radio
        key={checkedKey}
        name="opt"
        value="a"
        label={s.label?.trim() ? s.label : previewText(s, "Selected option")}
        defaultChecked={checked}
        disabled={disabled}
      />
    );
  }
  return (
    <V1Checkbox
      key={checkedKey}
      label={s.label?.trim() ? s.label : previewText(s, "Accept terms")}
      defaultChecked={checked}
      disabled={disabled}
      indeterminate={s.indeterminate === "true"}
    />
  );
}

function CheckboxRadioGroupPreview({
  vertical,
  disabled,
}: {
  vertical: boolean;
  disabled: boolean;
}) {
  const [value, setValue] = useState("team");
  return (
    <V1Radio.Group
      name="plan"
      vertical={vertical}
      value={value}
      onChange={setValue}
      options={[
        { value: "free", label: "Free" },
        { value: "team", label: "Team" },
        { value: "ent", label: "Enterprise", disabled },
      ]}
    />
  );
}

function renderTogglePreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  const checked = state === "checked" || s.checked === "true";
  const disabled = state === "disabled" || s.disabled === "true";
  return (
    <V1Toggle
      key={checked ? "on" : "off"}
      {...(s.label === "hidden" ? {} : { label: previewText(s, "Enable dark mode") })}
      defaultChecked={checked}
      disabled={disabled}
    />
  );
}

function renderInputPreview(s: Record<string, string>, lookup: TokenLookup) {
  const state = s.state ?? "default";
  const style = s.style ?? "border";
  const size = s.size ?? "sm";
  // Honor both the state selector and the boolean disabled/invalid prop controls.
  const disabled = state === "disabled" || s.disabled === "true";
  const invalid = state === "invalid" || s.invalid === "true";
  const className =
    v1Classes(style !== "border" && style, size !== "sm" && size, invalid && "danger") || undefined;
  // V1Input is controlled (value ?? ""), so pass `value` (not defaultValue) so the
  // value control shows. v1 has no :disabled tint, so apply bg.disabled inline.
  const value = s.value?.trim() ? s.value : "team@podo.dev";
  const withIcon = previewIcon(s, "withIcon");
  const withRightIcon = previewIcon(s, "withRightIcon");
  const unit = s.unit?.trim() ? s.unit : undefined;
  const disabledStyle = disabled
    ? { background: cssToken(lookup, "color.bg.disabled", "#f4f4f5") }
    : undefined;
  return (
    <V1Input
      {...(className ? { className } : {})}
      value={value}
      placeholder={s.placeholder?.trim() ? s.placeholder : "team@podo.dev"}
      disabled={disabled}
      {...(disabledStyle ? { style: disabledStyle } : {})}
      {...(withIcon ? { withIcon } : {})}
      {...(withRightIcon ? { withRightIcon } : {})}
      {...(unit ? { unit } : {})}
    />
  );
}

function renderSelectPreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  const disabled = state === "disabled" || s.disabled === "true";
  const value = s.value?.trim() ? s.value : "product";
  const withIcon = previewIcon(s, "withIcon") ?? (s.icon === "leading" ? "icon-user" : undefined);
  return (
    <V1Select
      key={value}
      defaultValue={value}
      disabled={disabled}
      {...(s.placeholder?.trim() ? { placeholder: s.placeholder } : {})}
      {...(withIcon ? { withIcon } : {})}
      options={[
        { value: "product", label: "Product team" },
        { value: "design", label: "Design system" },
        { value: "ops", label: "Operations" },
      ]}
    />
  );
}

function renderTextareaPreview(s: Record<string, string>) {
  // Key on the value control so it reseeds the (interactive) local state.
  return <TextareaPreviewBody s={s} key={s.value ?? ""} />;
}

function TextareaPreviewBody({ s }: { s: Record<string, string> }) {
  const [value, setValue] = useState(
    s.value?.trim()
      ? s.value
      : "Draft a concise message for the launch checklist.\nKeep tone direct and useful."
  );
  const disabled = s.state === "disabled" || s.disabled === "true";
  return (
    <V1Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      disabled={disabled}
      {...(s.placeholder?.trim() ? { placeholder: s.placeholder } : {})}
    />
  );
}

function renderFilePreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  return (
    <V1FileInput
      multiple={s.selection === "multiple" || s.multiple === "true"}
      disabled={state === "disabled" || s.disabled === "true"}
    />
  );
}

function renderLabelPreview(s: Record<string, string>) {
  return (
    <V1Label
      size={(s.size ?? "md") as never}
      semibold={s.weight === "semibold" || s.semibold === "true"}
      required={s.required === "true"}
      disabled={s.state === "disabled" || s.disabled === "true"}
    >
      {previewText(s, "Email address")}
    </V1Label>
  );
}

function renderPaginationPreview(s: Record<string, string>) {
  // Key on the page controls so the (interactive) current page reseeds.
  return <PaginationPreviewBody s={s} key={`${s.currentPage ?? ""}-${s.totalPages ?? ""}`} />;
}

function PaginationPreviewBody({ s }: { s: Record<string, string> }) {
  const total = Number.parseInt(s.totalPages ?? "", 10) || 10;
  const [page, setPage] = useState(Number.parseInt(s.currentPage ?? "", 10) || 2);
  const maxVisible = Number.parseInt(s.maxVisiblePages ?? "", 10) || undefined;
  const prevIcon = previewIcon(s, "prevIcon");
  const nextIcon = previewIcon(s, "nextIcon");
  return (
    <V1Pagination
      currentPage={page}
      totalPages={total}
      onPageChange={setPage}
      {...(maxVisible ? { maxVisiblePages: maxVisible } : {})}
      {...(prevIcon ? { prevIcon } : {})}
      {...(nextIcon ? { nextIcon } : {})}
    />
  );
}

function renderTabPreview(s: Record<string, string>) {
  const active = s.activeKey?.trim() || s.defaultActiveKey?.trim() || "overview";
  return (
    // Width context: previews shrink-wrap their content (centered grid cells,
    // where a percentage width resolves back to content size), so `.tabs.fill
    // > li { flex: 1 }` would have nothing to fill and auto/fill would render
    // identically. The definite 420px lets fill distribute; maxWidth clamps it
    // inside definite-width containers (canvas shapes, narrow stages) so it
    // can't overflow them.
    <div style={{ width: 420, maxWidth: "100%" }}>
      <V1Tab
        key={active}
        fill={s.width === "fill" || s.fill === "true"}
        defaultActiveKey={active}
        items={[
          { key: "overview", label: "Overview" },
          { key: "usage", label: "Usage" },
          { key: "changelog", label: "Changelog" },
        ]}
      />
    </div>
  );
}

function renderDocTabsPreview(s: Record<string, string>) {
  const selected = s["default-tab"] ?? (s.defaultTab?.trim() ? s.defaultTab : "scss");
  const snippet =
    selected === "react"
      ? "import { Button } from '@podo/react';"
      : selected === "cdn"
        ? '<script src="podo.js"></script>'
        : "@use '@podo/scss/button';";
  return (
    <div style={{ width: "min(520px, 100%)" }}>
      <V1Tab
        key={selected}
        defaultActiveKey={selected}
        items={[
          { key: "scss", label: "scss" },
          { key: "react", label: "react" },
          { key: "cdn", label: "cdn" },
        ]}
      />
      <div style={{ paddingTop: 16 }}>
        <code style={codeStyle}>{snippet}</code>
      </div>
    </div>
  );
}

function renderTablePreview(s: Record<string, string>) {
  const columns = [
    { key: "component", title: "Component" },
    { key: "status", title: "Status" },
    { key: "target", title: "Target" },
  ];
  const dataSource = [
    { component: "Button", status: "stable", target: "React" },
    { component: "Select", status: "stable", target: "Web" },
    { component: "Toast", status: "draft", target: "Native" },
  ];
  return (
    <div style={{ width: "min(560px, 100%)" }}>
      <V1Table
        columns={columns as never}
        dataSource={dataSource as never}
        rowKey="component"
        list={s.display === "list"}
        border={s.border === "line"}
        fill={s.fill === "row"}
      />
    </div>
  );
}

function renderToastPreview(s: Record<string, string>) {
  const long = s.length === "long";
  return (
    <V1Toast
      id="preview"
      {...(long ? {} : { header: "Changes saved" })}
      message="Token updates are ready to build into the project."
      theme={(s.theme ?? "default") as never}
      border={s.border === "border"}
      long={long}
      onClose={() => {}}
    />
  );
}

function renderTooltipPreview(s: Record<string, string>, lookup: TokenLookup) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: 120 }}>
      <V1Tooltip
        content="Use token alias paths for reuse."
        variant={(s.variant ?? "default") as never}
        position={(s.position ?? "top") as never}
      >
        <button type="button" style={previewTriggerButtonStyle(lookup)}>
          Hover target
        </button>
      </V1Tooltip>
    </div>
  );
}

const AVATAR_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23c4b5fd'/%3E%3Cstop offset='1' stop-color='%2393c5fd'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='96' height='96' fill='url(%23g)'/%3E%3C/svg%3E";

function renderAvatarPreview(s: Record<string, string>) {
  const type = (s.type ?? "icon") as never;
  const size = (Number.parseInt(s.size ?? "56", 10) || 56) as never;
  const icon = previewIcon(s, "icon");
  return (
    <V1Avatar
      type={type}
      size={size}
      {...(s.type === "text" ? { text: previewText(s, "PO") } : {})}
      {...(s.type === "icon" && icon ? { icon } : {})}
      {...(s.type === "image" ? { src: s.src?.trim() ? s.src : AVATAR_IMAGE_SRC } : {})}
      {...(s.activityRing === "true" ? { activityRing: true } : {})}
    />
  );
}

function renderEditorPreview(
  selections: Record<string, string>,
  _lookup: TokenLookup,
  onValueChange?: (value: string) => void
) {
  // Toolbar items are toggled from the right rail (see components-panel); default
  // all on — an item is hidden only when its selection is explicitly "false".
  const toolbar = EDITOR_TOOLBAR_ITEMS.filter((item) => selections[`toolbar:${item}`] !== "false");
  return (
    <EditorPreviewBody
      selections={selections}
      toolbar={toolbar}
      {...(onValueChange ? { onValueChange } : {})}
    />
  );
}

const EDITOR_INITIAL_HTML =
  "<h3>Release notes</h3><p>Write rich content here — try the full toolbar: tables, images, YouTube, links, colors and lists all work.</p>";

// The v1 editor's toolbar items, in order; exposed so the inspector can render a
// toggle per item.
export const EDITOR_TOOLBAR_ITEMS: ToolbarItem[] = [
  "undo-redo",
  "paragraph",
  "text-style",
  "color",
  "align",
  "list",
  "table",
  "link",
  "image",
  "youtube",
  "hr",
  "format",
  "code",
];

function EditorPreviewBody({
  selections,
  toolbar,
  onValueChange,
}: {
  selections: Record<string, string>;
  toolbar: ToolbarItem[];
  onValueChange?: (value: string) => void;
}) {
  // Render the REAL vendored v1 editor so every feature actually works.
  // Two-way `value`: keep local state (so typing is smooth + works even without a
  // commit callback) but push every change to onValueChange, so the `value` prop
  // and its textarea mirror edits live. An external edit of the value prop (i.e.
  // one we did NOT just emit — lastEmit distinguishes them) is adopted back into
  // the editor.
  const initial = selections.value?.trim() ? selections.value : EDITOR_INITIAL_HTML;
  const [value, setValue] = useState(initial);
  const lastEmit = useRef(initial);
  useEffect(() => {
    const incoming = selections.value ?? "";
    if (incoming && incoming !== lastEmit.current) {
      lastEmit.current = incoming;
      setValue(incoming);
    }
  }, [selections.value]);
  const handleChange = (next: string) => {
    lastEmit.current = next;
    setValue(next);
    onValueChange?.(next);
  };
  // All sizing/text props come straight from the inspector so they drive the
  // preview. minHeight/maxHeight are optional (conditional-spread to satisfy
  // exactOptionalPropertyTypes); resizable honors either the prop or the variant.
  const minHeight = selections.minHeight?.trim();
  const maxHeight = selections.maxHeight?.trim();
  const resizable = selections.resizable === "true" || selections.resize === "resizable";
  // Wide enough that the full toolbar (~960px) fits on one row when there's room;
  // the v1 toolbar keeps its flex-wrap so it drops to a second row (never cropped)
  // when the stage is narrower.
  return (
    <div style={{ width: "min(1000px, 100%)" }} className="podo-editor-preview">
      <PreviewErrorBoundary>
        <V1Editor
          value={value}
          onChange={handleChange}
          width={selections.width?.trim() || "100%"}
          height={selections.height?.trim() || "400px"}
          resizable={resizable}
          placeholder={selections.placeholder?.trim() || "내용을 입력하세요..."}
          toolbar={toolbar}
          {...(minHeight ? { minHeight } : {})}
          {...(maxHeight ? { maxHeight } : {})}
        />
      </PreviewErrorBoundary>
    </div>
  );
}

// Contains preview-component crashes so a single broken preview cannot blank the
// whole editor app, and surfaces the error message for debugging.
export class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: "#b91c1c", fontFamily: "ui-monospace, monospace" }}>
          Preview error: {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

// Variant-aware layers: which anatomy parts actually exist for the current
// variant selection (e.g. type=time has no calendar; type=date has no time
// picker). Whole subtrees are hidden together so the layer tree never orphans a
// child. Non-datepicker components return their full anatomy unchanged.
export function visibleComponentAnatomy(
  component: ComponentDocument,
  selections: Record<string, string>
): ComponentDocument["anatomy"] {
  if (component.id !== "datepicker") return component.anatomy;
  const type = selections.type ?? "date";
  const mode = selections.mode ?? "instant";
  const hasCalendar = type === "date" || type === "datetime";
  const hasTime = type === "time" || type === "datetime" || type === "hour";
  const isPeriod = mode === "period";
  const quickSelect = selections.quickSelect === "true";
  const showActions =
    selections.showActions === undefined ? isPeriod : selections.showActions === "true";
  const showNav = quickSelect && isPeriod && selections.hideNavArrow !== "true";
  const calendarParts = new Set([
    "popup",
    "calendar",
    "calendar-header",
    "calendar-nav-button",
    "calendar-title",
    "calendar-grid",
    "calendar-weekday",
    "calendar-day",
    "calendar-today",
    "calendar-selected",
    "calendar-range",
  ]);
  const isVisible = (name: string): boolean => {
    if (name === "trigger-nav-left" || name === "trigger-nav-right") return showNav;
    if (name === "trigger-icon") return !showNav;
    if (name === "trigger-date") return hasCalendar;
    if (name === "range-separator") return isPeriod;
    if (name === "time-picker" || name === "hour-select") return hasTime;
    if (name === "minute-select") return hasTime && type !== "hour";
    if (calendarParts.has(name)) return hasCalendar;
    if (name === "quick-select" || name === "quick-select-item")
      return quickSelect && isPeriod && hasCalendar;
    if (["actions", "action-summary", "reset-action", "apply-action"].includes(name))
      return showActions && hasCalendar;
    return true; // root, trigger, trigger-content
  };
  return component.anatomy.filter((part) => isVisible(part.name));
}

function renderDatePickerPreview(selections: Record<string, string>) {
  return (
    <DatePickerPreviewBody
      type={selections.type ?? "date"}
      mode={selections.mode ?? "instant"}
      direction={selections.direction ?? "down"}
      disabled={selections.state === "disabled" || selections.disabled === "true"}
      // The matrix sets this on its cells so each variant renders expanded
      // (calendar / time / range visible) for direct element selection. The single
      // top preview leaves it off, so it stays a plain interactive preview.
      previewOpen={selections.previewOpen === "true"}
      {...(selections.placeholder?.trim() ? { placeholder: selections.placeholder } : {})}
    />
  );
}

function DatePickerPreviewBody({
  type,
  mode,
  direction,
  disabled,
  placeholder,
  previewOpen = false,
}: {
  type: string;
  mode: string;
  direction: string;
  disabled: boolean;
  placeholder?: string;
  previewOpen?: boolean;
}) {
  // The v1 datepicker is CONTROLLED for the display value (in instant mode it
  // shows `value`, not internal state), so a value/onChange pair is required for
  // day/time selections to appear. No `portal` prop → the dropdown renders inline
  // within the scoped stage. `value` is reset when the axis (type/mode) changes.
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <div style={{ width: "min(440px, 100%)" }}>
      <PreviewErrorBoundary>
        <V1DatePicker
          key={`${type}-${mode}`}
          type={type as never}
          mode={mode as never}
          direction={direction as never}
          disabled={disabled}
          {...(placeholder ? { placeholder } : {})}
          {...(previewOpen ? { previewOpen: true } : {})}
          value={value as never}
          onChange={setValue as never}
        />
      </PreviewErrorBoundary>
    </div>
  );
}

// Field is a slot-composition component: its required `control` slot is
// swappable (same idea as canvas slot composition) via the reserved
// `slot:control` selection key, instead of hardcoding one child.
export const FIELD_CONTROL_SLOT_OPTIONS = [
  "input",
  "select",
  "textarea",
  "checkbox-radio",
] as const;

function FieldTextareaControl() {
  const [value, setValue] = useState("We ship the design system.");
  return <V1Textarea value={value} onChange={(event) => setValue(event.target.value)} />;
}

function renderFieldControlSlot(kind: string): ReactNode {
  switch (kind) {
    case "select":
      return (
        <V1Select
          defaultValue="product"
          options={[
            { value: "product", label: "Product team" },
            { value: "design", label: "Design system" },
            { value: "ops", label: "Operations" },
          ]}
        />
      );
    case "textarea":
      return <FieldTextareaControl />;
    case "checkbox-radio":
      return <V1Checkbox label="Subscribe to workspace updates" defaultChecked />;
    default:
      return <V1Input defaultValue="team@podo.dev" />;
  }
}

function renderFieldPreview(selections: Record<string, string>) {
  const invalid = selections.state === "invalid" || selections.invalid === "true";
  const label = selections.label?.trim() ? selections.label : "Email address";
  const required = selections.required === undefined ? true : selections.required === "true";
  const error = selections.error?.trim()
    ? selections.error
    : invalid
      ? "Enter a valid email address."
      : undefined;
  return (
    <div style={{ width: 340 }}>
      <V1Field
        label={label}
        {...(required ? { required: true } : {})}
        {...(error ? { error } : { helper: "We use this for workspace updates." })}
      >
        {renderFieldControlSlot(selections["slot:control"] ?? "input")}
      </V1Field>
    </div>
  );
}

const legacyComponentPreviewRenderers = {
  avatar: renderAvatarPreview,
  button: renderButtonPreview,
  "checkbox-radio": renderCheckboxRadioPreview,
  chip: renderChipPreview,
  datepicker: renderDatePickerPreview,
  "doc-tabs": renderDocTabsPreview,
  editor: renderEditorPreview,
  field: renderFieldPreview,
  file: renderFilePreview,
  input: renderInputPreview,
  label: renderLabelPreview,
  pagination: renderPaginationPreview,
  select: renderSelectPreview,
  tab: renderTabPreview,
  table: renderTablePreview,
  textarea: renderTextareaPreview,
  toast: renderToastPreview,
  toggle: renderTogglePreview,
  tooltip: renderTooltipPreview,
} satisfies Record<LegacyComponentPreviewId, ComponentPreviewRenderer>;

function isLegacyComponentPreviewId(id: string): id is LegacyComponentPreviewId {
  return Object.hasOwn(legacyComponentPreviewRenderers, id);
}

function renderSpecDrivenComponentPreview(component: ComponentDocument, lookup: TokenLookup) {
  const primarySlot = component.slots.find((slot) => slot.required) ?? component.slots[0];
  return (
    <div style={previewSpecSurfaceStyle(lookup)}>
      <div style={previewSpecHeaderStyle(lookup)}>{component.name}</div>
      <div style={previewSpecBodyStyle(lookup)}>
        {primarySlot ? `${primarySlot.name} slot` : (component.anatomy[0]?.name ?? "root")}
      </div>
    </div>
  );
}

// Appearance bridge: edits to a component's `<part>.<property>` bindings are
// applied to the LIVE preview by injecting a scoped `<style>` that overrides the
// real element's CSS (the v1 styles hardcode radius/spacing as px, so a CSS-var
// override is not enough — we set the property directly with `!important`).

// Maps an appearance property key (normalized: lowercased, separators removed) to
// the CSS property it controls. Typography is resolved separately.
const APPEARANCE_CSS_PROPERTY: Record<string, string> = {
  // Use background-COLOR, not the `background` shorthand: the shorthand resets
  // background-image, which wipes v1 elements that paint with one (e.g. the
  // <select> dropdown arrow, checkbox/radio marks).
  background: "background-color",
  backgroundcolor: "background-color",
  color: "color",
  bordercolor: "border-color",
  borderwidth: "border-width",
  borderradius: "border-radius",
  radius: "border-radius",
  gap: "gap",
  padding: "padding",
  paddingx: "padding-inline",
  paddingy: "padding-block",
  paddingtop: "padding-top",
  paddingright: "padding-right",
  paddingbottom: "padding-bottom",
  paddingleft: "padding-left",
  width: "width",
  height: "height",
  minheight: "min-height",
  fontsize: "font-size",
  fontweight: "font-weight",
  fontfamily: "font-family",
  lineheight: "line-height",
  letterspacing: "letter-spacing",
  opacity: "opacity",
  // Figma "Effects" / extra inspector rows.
  shadow: "box-shadow",
  boxshadow: "box-shadow",
  textalign: "text-align",
  borderstyle: "border-style",
  minwidth: "min-width",
  maxwidth: "max-width",
  maxheight: "max-height",
  // Figma Auto layout section (direction / wrap / alignment / distribution).
  display: "display",
  flexdirection: "flex-direction",
  flexwrap: "flex-wrap",
  alignitems: "align-items",
  justifycontent: "justify-content",
  // Direction-aware Fill sizing + wrap row gap + clip content.
  flex: "flex",
  alignself: "align-self",
  rowgap: "row-gap",
  columngap: "column-gap",
  overflow: "overflow",
  // Per-corner radius (Figma corner expander).
  bordertopleftradius: "border-top-left-radius",
  bordertoprightradius: "border-top-right-radius",
  borderbottomrightradius: "border-bottom-right-radius",
  borderbottomleftradius: "border-bottom-left-radius",
  // Per-side stroke widths (Figma individual strokes).
  bordertopwidth: "border-top-width",
  borderrightwidth: "border-right-width",
  borderbottomwidth: "border-bottom-width",
  borderleftwidth: "border-left-width",
  // Text panel extras.
  textdecoration: "text-decoration",
  texttransform: "text-transform",
  // Effects: layer blur / background blur / blend mode; DTCG border objects.
  blur: "filter",
  backgroundblur: "backdrop-filter",
  blendmode: "mix-blend-mode",
  mixblendmode: "mix-blend-mode",
  border: "border",
  // Gradient fills (Figma linear/radial/angular -> CSS gradients).
  gradient: "background-image",
  backgroundimage: "background-image",
  // Grid auto layout mode.
  gridtemplatecolumns: "grid-template-columns",
  gridtemplaterows: "grid-template-rows",
  gridautoflow: "grid-auto-flow",
  justifyitems: "justify-items",
  gridcolumn: "grid-column",
  gridrow: "grid-row",
  // Multi-fill stacks (background-image layer list) + per-fill blend modes.
  fills: "background-image",
  backgroundblendmode: "background-blend-mode",
  // Stroke position encodings: outline = outside/center (negative offset).
  outlinewidth: "outline-width",
  outlinecolor: "outline-color",
  outlinestyle: "outline-style",
  outlineoffset: "outline-offset",
  // Masking at the CSS level (Figma masks on DOM layers).
  clippath: "clip-path",
  maskimage: "mask-image",
  // Absolute positioning (Figma auto-layout child "absolute position").
  position: "position",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  zindex: "z-index",
};

// Per-component anatomy-part -> CSS selector (descendant of the preview). Filled
// from the vendored components + v1 CSS so overrides hit the real styled element.
// Derived from the vendored components + v1 CSS (codex/agy cross-checked). Every
// component has a `root`; sub-parts are included where they have a styled element.
const COMPONENT_PART_SELECTORS: Record<string, Record<string, string>> = {
  avatar: {
    root: ".avatar",
    image: ".avatar .image",
    icon: ".avatar i",
    text: ".avatar span",
    "activity-ring": ".activityRing",
  },
  button: {
    root: "button",
    "left-icon": "button > i:first-child",
    "right-icon": "button > i:last-child",
  },
  "checkbox-radio": {
    root: "input[type=checkbox]:not(.toggle), input[type=radio]",
    label: "input[type=checkbox] + span, input[type=radio] + span",
  },
  chip: { root: ".chip", icon: ".chip i", "delete-button": ".chip button" },
  datepicker: {
    root: ".datepicker",
    trigger: ".datepicker > .input",
    "trigger-nav-left": ".datepicker > .input .navArrowLeft",
    "trigger-nav-right": ".datepicker > .input .navArrowRight",
    "trigger-content": ".datepicker > .input .inputContent",
    "trigger-date": ".datepicker > .input .inputPart",
    "range-separator": ".datepicker > .input .separator",
    "time-picker": ".datepicker > .input .timeSection",
    "hour-select": ".datepicker > .input .timeSection select:first-of-type",
    "minute-select": ".datepicker > .input .timeSection select:last-of-type",
    "trigger-icon": ".datepicker > .input .inputIcon",
    popup: ".datepicker .dropdown",
    "quick-select": ".datepicker .dropdown .quickSelectPanel",
    "quick-select-item": ".datepicker .dropdown .quickSelectItem",
    calendar: ".datepicker .dropdown .calendar",
    "calendar-header": ".datepicker .dropdown .calendarNav",
    "calendar-nav-button": ".datepicker .dropdown .navButton",
    "calendar-title": ".datepicker .dropdown .navTitle",
    "calendar-grid": ".datepicker .dropdown .calendarGrid",
    "calendar-weekday": ".datepicker .dropdown .calendarCell.header",
    "calendar-day": ".datepicker .dropdown .calendarCell:not(.header)",
    "calendar-today": ".datepicker .dropdown .calendarCell.today",
    "calendar-selected":
      ".datepicker .dropdown .calendarCell.selected, .datepicker .dropdown .calendarCell.rangeStart, .datepicker .dropdown .calendarCell.rangeEnd",
    "calendar-range": ".datepicker .dropdown .calendarCell.inRange",
    actions: ".datepicker .dropdown .bottomActions",
    "action-summary": ".datepicker .dropdown .periodText",
    "reset-action": ".datepicker .dropdown .actionButton.reset",
    "apply-action": ".datepicker .dropdown .actionButton.apply",
  },
  "doc-tabs": { root: "ul.tabs", tab: "ul.tabs > li" },
  editor: { root: ".editor", toolbar: ".editor .toolbar", content: ".editorContent" },
  field: {
    root: ".style",
    label: ".style > label",
    control: ".style input, .style select, .style textarea",
    message: ".style .helper",
  },
  file: { root: "input[type=file]" },
  input: { root: ".style input" },
  label: { root: "label" },
  pagination: { root: ".pagination", "page-button": ".pageButton" },
  select: { root: "select" },
  tab: { root: "ul.tabs", tab: "ul.tabs > li" },
  table: { root: "table", header: "table th", row: "table tr", cell: "table td" },
  textarea: { root: "textarea" },
  toast: { root: ".toast", toast: ".toast", header: ".toast-header", message: ".toast-body" },
  toggle: { root: ".toggle" },
  tooltip: { root: ".tooltipBox" },
};

// Reverse of COMPONENT_PART_SELECTORS: which anatomy part does a clicked element
// belong to? Picks the deepest (most specific) matching selector so e.g. a click
// on a calendar cell selects "calendar", on the field selects "input", and a
// click on bare chrome falls back to "root". Used for Figma-style click-to-select
// in the variant matrix.
function componentPartMatchForElement(
  componentId: string,
  element: Element | null
): { part: string; element: Element } | undefined {
  const parts = COMPONENT_PART_SELECTORS[componentId];
  if (!parts || !element) return undefined;
  let best: { part: string; element: Element } | undefined;
  let bestDepth = -1;
  for (const [part, selector] of Object.entries(parts)) {
    const matched = element.closest(selector);
    if (!matched) continue;
    let depth = 0;
    for (let node = matched.parentElement; node; node = node.parentElement) depth += 1;
    // Deeper match wins; on a tie a non-root part beats root.
    if (depth > bestDepth || (depth === bestDepth && part !== "root")) {
      best = { part, element: matched };
      bestDepth = depth;
    }
  }
  return best;
}

// Exported so the editor shell can hover-map preview elements to layers too.
export function componentPartForElement(
  componentId: string,
  element: Element | null
): string | undefined {
  return componentPartMatchForElement(componentId, element)?.part;
}

// Exported so the inspector can read a part's COMPUTED css value as the
// displayed fallback for unbound properties (Figma shows real values, not "—").
export function appearanceCssProperty(property: string): string | undefined {
  return APPEARANCE_CSS_PROPERTY[property.toLowerCase().replace(/[-_]/g, "")];
}

// Serializes one DTCG shadow layer object ({color, offsetX, offsetY, blur,
// spread, inset?}, fields may themselves be aliases) into a box-shadow layer.
function cssShadowLayer(lookup: TokenLookup, value: Record<string, unknown>): string | undefined {
  const field = (name: string, fallback = ""): string => {
    const resolved = resolveTokenValue(lookup, value[name]);
    return typeof resolved === "string" || typeof resolved === "number"
      ? String(resolved)
      : fallback;
  };
  const color = field("color");
  const offsetX = field("offsetX", "0");
  const offsetY = field("offsetY", "0");
  if (!color) return undefined;
  const blur = field("blur", "0");
  const spread = field("spread", "0");
  return `${value.inset ? "inset " : ""}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
}

// Expands a resolved binding value into CSS declarations. Strings map 1:1 via
// APPEARANCE_CSS_PROPERTY; composite token objects (typography / shadow /
// border) — which cssToken can't stringify — expand here so bindings like
// `label.typography = {typography.paragraph.p3}` actually render.
function appearanceDeclarations(
  lookup: TokenLookup,
  property: string,
  resolvedValue: unknown
): Array<[cssProp: string, value: string]> {
  const cssProp = appearanceCssProperty(property);
  if (typeof resolvedValue === "string" || typeof resolvedValue === "number") {
    return cssProp ? [[cssProp, String(resolvedValue)]] : [];
  }
  if (isTypographyValue(resolvedValue)) {
    // Sub-fields can themselves be aliases per DTCG ({font.family.sans}) —
    // resolve each before emitting, or invalid `{…}` text lands in the CSS.
    const field = (value: unknown): string => {
      const resolved = resolveTokenValue(lookup, value);
      if (typeof resolved === "string" || typeof resolved === "number") return String(resolved);
      if (resolved && typeof resolved === "object" && "pc" in resolved) {
        return responsiveSizePc(resolved as { pc: string });
      }
      return "";
    };
    return (
      [
        ["font-family", field(resolvedValue.fontFamily)],
        ["font-size", field(resolvedValue.fontSize)],
        ["line-height", field(resolvedValue.lineHeight)],
        ["font-weight", field(resolvedValue.fontWeight)],
        ["letter-spacing", field(resolvedValue.letterSpacing)],
      ] as Array<[string, string]>
    ).filter(([, value]) => value.length > 0);
  }
  if (Array.isArray(resolvedValue)) {
    // Multi-layer shadow token.
    const layers = resolvedValue
      .map((layer) =>
        layer && typeof layer === "object"
          ? cssShadowLayer(lookup, layer as Record<string, unknown>)
          : undefined
      )
      .filter((layer): layer is string => Boolean(layer));
    return layers.length ? [["box-shadow", layers.join(", ")]] : [];
  }
  if (resolvedValue && typeof resolvedValue === "object") {
    const record = resolvedValue as Record<string, unknown>;
    if ("offsetX" in record || "offsetY" in record) {
      const layer = cssShadowLayer(lookup, record);
      return layer ? [["box-shadow", layer]] : [];
    }
    if ("width" in record && "style" in record && "color" in record) {
      // DTCG border composite.
      const part = (name: string): string => {
        const resolved = resolveTokenValue(lookup, record[name]);
        return typeof resolved === "string" || typeof resolved === "number" ? String(resolved) : "";
      };
      const serialized = `${part("width")} ${part("style")} ${part("color")}`.trim();
      return serialized ? [["border", serialized]] : [];
    }
  }
  return [];
}

// Builds the scoped override CSS for a component's appearance bindings. Scoped
// under `.podo-design-target` so only the editable preview (not matrix cells) is
// affected.
// Resolves the effective appearance bindings for the given variant/state
// selections: base component.tokens, then each selected variant axis's tokens and
// per-value valueTokens, then the selected state's tokens (later wins).
export function resolveComponentAppearance(
  component: ComponentDocument,
  selections: Record<string, string>,
  includeBase = true
): Record<string, string> {
  // Base tokens mirror the DEFAULT variant; including them in non-default matrix
  // cells would clobber each variant's intrinsic v1 colors. So cells pass
  // includeBase=false and show only their own variant/state overrides.
  const merged: Record<string, string> = includeBase ? { ...(component.tokens ?? {}) } : {};
  for (const variant of component.variants ?? []) {
    const value = selections[variant.name];
    if (!value) continue;
    Object.assign(merged, variant.tokens ?? {});
    Object.assign(merged, variant.valueTokens?.[value] ?? {});
  }
  // Compound conditions (theme=primary AND size=lg): applied when EVERY named
  // axis matches the current selection; document order, later wins.
  for (const combination of component.combinations ?? []) {
    const matches = Object.entries(combination.when).every(([axisName, value]) => {
      const axis = (component.variants ?? []).find((item) => item.name === axisName);
      const selected = selections[axisName] ?? axis?.default ?? axis?.values[0];
      return selected === value;
    });
    if (matches) Object.assign(merged, combination.tokens);
  }
  const stateName = selections.state;
  if (stateName && stateName !== "default") {
    const state = (component.states ?? []).find((item) => item.name === stateName);
    Object.assign(merged, state?.tokens ?? {});
  }
  return merged;
}

function componentAppearanceCss(
  component: ComponentDocument,
  lookup: TokenLookup,
  selections: Record<string, string>,
  scopeClass: string,
  includeBase = true
): string {
  const parts = COMPONENT_PART_SELECTORS[component.id];
  if (!parts) return "";
  const rules: string[] = [];
  // Figma-style eye toggle: hidden layers disappear from every preview surface.
  for (const part of component.anatomy) {
    if (!part.hidden) continue;
    const selector = parts[part.name];
    if (selector) {
      rules.push(`${scopeSelector(scopeClass, selector)} { display: none !important; }`);
    }
  }
  for (const [key, reference] of Object.entries(
    resolveComponentAppearance(component, selections, includeBase)
  )) {
    if (typeof reference !== "string") continue;
    const dot = key.indexOf(".");
    if (dot < 0) continue;
    const selector = parts[key.slice(0, dot)];
    if (!selector) continue;
    // A binding is either a {token} alias (resolve it — composite tokens like
    // typography/shadow expand to several declarations) or a raw CSS value.
    const isAlias = /^\{.+\}$/.test(reference);
    const resolvedValue = isAlias ? resolveTokenPath(lookup, reference.slice(1, -1)) : reference;
    const declarations = appearanceDeclarations(lookup, key.slice(dot + 1), resolvedValue).filter(
      // Guard against breaking out of the injected <style>/declaration block
      // (tag/brace escapes AND CSS comments that would swallow later rules).
      ([, value]) => value.length > 0 && !/[<>{};]|\/\*|\*\//.test(value)
    );
    if (!declarations.length) continue;
    const body = declarations.map(([prop, value]) => `${prop}: ${value} !important;`).join(" ");
    rules.push(`${scopeSelector(scopeClass, selector)} { ${body} }`);
  }
  return rules.join("\n");
}

function componentPreviewStageStyleFromTokens(lookup: TokenLookup): CSSProperties {
  return {
    ...componentPreviewStageStyle,
    background: cssToken(lookup, "color.bg.elevation", "#f8fafc"),
    color: cssToken(lookup, "color.text.body", "#171a20"),
  };
}

function previewTriggerButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 36,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    padding: `0 ${cssToken(lookup, "spacing.scale.4", "12px")}`,
  };
}

function previewSpecSurfaceStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 300,
    minHeight: 144,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    display: "grid",
    gridTemplateRows: "44px 1fr",
    overflow: "hidden",
  };
}

function previewSpecHeaderStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    padding: `0 ${cssToken(lookup, "spacing.scale.4", "12px")}`,
    background: cssToken(lookup, "color.bg.elevation", "#fafafa"),
    borderBottom: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    color: cssToken(lookup, "color.text.header", "#1c1c20"),
    fontWeight: 600,
  };
}

function previewSpecBodyStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "grid",
    placeItems: "center",
    color: cssToken(lookup, "color.text.sub", "#71717a"),
  };
}

export function defaultPreviewSelectionsForComponent(
  component: ComponentDocument
): Record<string, string> {
  const base: Record<string, string> = Object.fromEntries(
    component.variants.map((variant) => [variant.name, variant.default ?? variant.values[0] ?? ""])
  );
  // Seed the editor's `value` with demo HTML so the preview isn't blank and its
  // value textarea mirrors the editor from the start (the spec default is "").
  if (component.id === "editor") base.value = EDITOR_INITIAL_HTML;
  return base;
}

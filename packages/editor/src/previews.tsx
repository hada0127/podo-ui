import { Component, useState, type CSSProperties, type ReactNode } from "react";
import type { ComponentDocument } from "@podo/spec";
import type { Translate } from "./i18n/context.js";
// Real v1 component CSS (compiled from the main branch), scoped under
// `.podo-v1-stage` so previews render with the actual v1 styling. See
// scripts/vendor-v1-css.mjs.
import "./v1-components.generated.css";
// The actual v1 rich-text editor + datepicker components, vendored verbatim, so
// the preview has ALL real features. They use plain class names that the scoped
// v1 CSS styles inside `.podo-v1-stage`.
import V1Editor from "./vendor/v1-editor.js";
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
import { cssToken, type TokenLookup } from "./token-lookup.js";
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
  lookup: TokenLookup
) => ReactNode;
type LegacyComponentPreviewId = (typeof legacyComponentPreviewIds)[number];

export function renderComponentPreview(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup
) {
  return (
    <div
      className="podo-v1-stage podo-design-target"
      style={componentPreviewStageStyleFromTokens(lookup)}
      data-podo-preview-component-id={component.id}
      data-podo-preview-kind={componentPreviewKind(component)}
    >
      <style>{componentAppearanceCss(component, lookup, selections, "podo-design-target")}</style>
      {renderComponentPreviewBody(component, selections, lookup)}
    </div>
  );
}

// Components whose preview is a full, stateful v1 app with global document
// listeners (focus, click-outside, contentEditable). Rendering several live
// instances in the variant matrix makes them fight each other, so we show only
// the single interactive preview above and skip the matrix for them.
const SINGLE_INSTANCE_PREVIEW_IDS = new Set(["editor", "datepicker"]);

export function renderComponentPreviewMatrix(input: {
  component: ComponentDocument;
  selections: Record<string, string>;
  lookup: TokenLookup;
  onSelect(selections: Record<string, string>): void;
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
  return (
    <div style={componentMatrixPanelStyle}>
      <div style={componentMatrixHeaderStyle}>
        <strong>{input.t("previews.variantMatrix")}</strong>
        <span>
          {rowVariant.name}
          {columnVariant ? ` x ${columnVariant.name}` : ""}
        </span>
      </div>
      <div style={componentMatrixScrollStyle}>
        <table style={componentMatrixTableStyle}>
          <thead>
            <tr>
              <th style={componentMatrixHeaderCellStyle}>{rowVariant.name}</th>
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
                  const cellSelections = {
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
                        style={{
                          ...componentMatrixPreviewButtonStyle,
                          ...(selected ? componentMatrixPreviewButtonActiveStyle : {}),
                        }}
                        onClick={() => input.onSelect(cellSelections)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            input.onSelect(cellSelections);
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
                            )}
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
  lookup: TokenLookup
) {
  const renderer = isLegacyComponentPreviewId(component.id)
    ? legacyComponentPreviewRenderers[component.id]
    : undefined;
  return renderer
    ? renderer(selections, lookup)
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

function renderButtonPreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  return (
    <V1Button
      theme={(s.theme ?? "default") as never}
      variant={(s.variant ?? "solid") as never}
      size={(s.size ?? "sm") as never}
      textAlign={(s.alignment ?? "center") as never}
      loading={state === "loading"}
      disabled={state === "disabled"}
    >
      Submit
    </V1Button>
  );
}

function renderChipPreview(s: Record<string, string>) {
  return (
    <V1Chip
      theme={(s.theme ?? "default") as never}
      type={(s.type ?? "default") as never}
      size={(s.size ?? "md") as never}
      round={s.shape === "round"}
      onDelete={() => {}}
    >
      Status
    </V1Chip>
  );
}

function renderCheckboxRadioPreview(s: Record<string, string>) {
  const control = s.control ?? "checkbox";
  const state = s.state ?? "default";
  const checked = state === "checked";
  const disabled = state === "disabled";
  if (control === "radio-group") {
    return (
      <CheckboxRadioGroupPreview
        vertical={(s.layout ?? "horizontal") === "vertical"}
        disabled={disabled}
      />
    );
  }
  if (control === "radio") {
    return (
      <V1Radio
        name="opt"
        value="a"
        label="Selected option"
        defaultChecked={checked}
        disabled={disabled}
      />
    );
  }
  return <V1Checkbox label="Accept terms" defaultChecked={checked} disabled={disabled} />;
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
  return (
    <V1Toggle
      {...(s.label === "hidden" ? {} : { label: "Enable dark mode" })}
      defaultChecked={state === "checked"}
      disabled={state === "disabled"}
    />
  );
}

function renderInputPreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  const style = s.style ?? "border";
  const size = s.size ?? "sm";
  const className =
    v1Classes(
      style !== "border" && style,
      size !== "sm" && size,
      state === "invalid" && "danger"
    ) || undefined;
  return (
    <V1Input
      {...(className ? { className } : {})}
      defaultValue="team@podo.dev"
      placeholder="team@podo.dev"
      disabled={state === "disabled"}
    />
  );
}

function renderSelectPreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  return (
    <V1Select
      defaultValue="product"
      disabled={state === "disabled"}
      {...(s.icon === "leading" ? { withIcon: "icon-user" } : {})}
      options={[
        { value: "product", label: "Product team" },
        { value: "design", label: "Design system" },
        { value: "ops", label: "Operations" },
      ]}
    />
  );
}

function renderTextareaPreview() {
  return <TextareaPreviewBody />;
}

function TextareaPreviewBody() {
  const [value, setValue] = useState(
    "Draft a concise message for the launch checklist.\nKeep tone direct and useful."
  );
  return <V1Textarea value={value} onChange={(event) => setValue(event.target.value)} />;
}

function renderFilePreview(s: Record<string, string>) {
  const state = s.state ?? "default";
  return <V1FileInput multiple={s.selection === "multiple"} disabled={state === "disabled"} />;
}

function renderLabelPreview(s: Record<string, string>) {
  return (
    <V1Label
      size={(s.size ?? "md") as never}
      semibold={s.weight === "semibold" || s.semibold === "true"}
      required={s.required === "true"}
      disabled={s.state === "disabled"}
    >
      Email address
    </V1Label>
  );
}

function renderPaginationPreview() {
  return <PaginationPreviewBody />;
}

function PaginationPreviewBody() {
  const [page, setPage] = useState(2);
  return <V1Pagination currentPage={page} totalPages={10} onPageChange={setPage} />;
}

function renderTabPreview(s: Record<string, string>) {
  return (
    <V1Tab
      fill={s.width === "fill"}
      defaultActiveKey="overview"
      items={[
        { key: "overview", label: "Overview" },
        { key: "usage", label: "Usage" },
        { key: "changelog", label: "Changelog" },
      ]}
    />
  );
}

function renderDocTabsPreview(s: Record<string, string>) {
  const selected = s["default-tab"] ?? "scss";
  const snippet =
    selected === "react"
      ? "import { Button } from '@podo/react';"
      : selected === "cdn"
        ? '<script src="podo.js"></script>'
        : "@use '@podo/scss/button';";
  return (
    <div style={{ width: "min(520px, 100%)" }}>
      <V1Tab
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
  return (
    <V1Avatar
      type={type}
      size={size}
      {...(s.type === "text" ? { text: "PO" } : {})}
      {...(s.type === "image" ? { src: AVATAR_IMAGE_SRC } : {})}
    />
  );
}

function renderEditorPreview(selections: Record<string, string>) {
  return <EditorPreviewBody resizable={selections.resize === "resizable"} />;
}

const EDITOR_INITIAL_HTML =
  "<h3>Release notes</h3><p>Write rich content here — try the full toolbar: tables, images, YouTube, links, colors and lists all work.</p>";

function EditorPreviewBody({ resizable }: { resizable: boolean }) {
  // Render the REAL vendored v1 editor so every feature actually works.
  const [value, setValue] = useState(EDITOR_INITIAL_HTML);
  return (
    <div style={{ width: "min(680px, 100%)" }}>
      <PreviewErrorBoundary>
        <V1Editor value={value} onChange={setValue} height="360px" resizable={resizable} />
      </PreviewErrorBoundary>
    </div>
  );
}

// Contains preview-component crashes so a single broken preview cannot blank the
// whole editor app, and surfaces the error message for debugging.
class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
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

function renderDatePickerPreview(selections: Record<string, string>) {
  return (
    <DatePickerPreviewBody
      type={selections.type ?? "date"}
      mode={selections.mode ?? "instant"}
      direction={selections.direction ?? "down"}
      disabled={selections.state === "disabled"}
    />
  );
}

function DatePickerPreviewBody({
  type,
  mode,
  direction,
  disabled,
}: {
  type: string;
  mode: string;
  direction: string;
  disabled: boolean;
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
          value={value as never}
          onChange={setValue as never}
        />
      </PreviewErrorBoundary>
    </div>
  );
}

function renderFieldPreview(selections: Record<string, string>) {
  const invalid = selections.state === "invalid";
  return (
    <div style={{ width: 340 }}>
      <V1Field
        label="Email address"
        required
        {...(invalid
          ? { error: "Enter a valid email address." }
          : { helper: "We use this for workspace updates." })}
      >
        <V1Input defaultValue="team@podo.dev" />
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
  background: "background",
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
  opacity: "opacity",
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
  datepicker: { root: ".datepicker", input: ".datepicker .input", calendar: ".calendar" },
  "doc-tabs": { root: "ul.tabs", tab: "ul.tabs > li" },
  editor: { root: ".editor", toolbar: ".editor .toolbar", content: ".editorContent" },
  field: { root: ".style", label: ".style > label", message: ".style .helper" },
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

function appearanceCssProperty(property: string): string | undefined {
  return APPEARANCE_CSS_PROPERTY[property.toLowerCase().replace(/[-_]/g, "")];
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
  for (const [key, reference] of Object.entries(
    resolveComponentAppearance(component, selections, includeBase)
  )) {
    if (typeof reference !== "string") continue;
    const dot = key.indexOf(".");
    if (dot < 0) continue;
    const selector = parts[key.slice(0, dot)];
    const cssProp = appearanceCssProperty(key.slice(dot + 1));
    if (!selector || !cssProp) continue;
    // A binding is either a {token} alias (resolve it) or a raw CSS value (use it).
    const isAlias = /^\{.+\}$/.test(reference);
    const resolved = isAlias ? cssToken(lookup, reference.slice(1, -1), "") : reference;
    // Guard against breaking out of the injected <style>/declaration block.
    if (!resolved || /[<>{};]/.test(resolved)) continue;
    rules.push(`.${scopeClass} ${selector} { ${cssProp}: ${resolved} !important; }`);
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
  return Object.fromEntries(
    component.variants.map((variant) => [variant.name, variant.default ?? variant.values[0] ?? ""])
  );
}

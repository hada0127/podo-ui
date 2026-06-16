import type { CSSProperties, ReactNode } from "react";
import type { ComponentDocument } from "@podo/spec";
import {
  cssToken,
  resolveTokenPath,
  isTypographyValue,
  typographyToCss,
  type TokenLookup,
} from "./token-lookup.js";
import {
  buttonBasePreviewStyle,
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
  previewAvatarIconStyle,
  previewAvatarStyle,
  previewCalendarDayStyle,
  previewCalendarGridStyle,
  previewCalendarHeaderStyle,
  previewChipDeleteStyle,
  previewChipDotStyle,
  previewChipStyle,
  previewChoiceBoxStyle,
  previewChoiceDotStyle,
  previewChoiceGroupStyle,
  previewChoiceStyle,
  previewControlIconStyle,
  previewFieldMessageStyle,
  previewFieldStyle,
  previewInlineWrapStyle,
  previewLabelStyle,
  previewPaginationStyle,
  previewPopoverStackStyle,
  previewTableListStyle,
  previewToastAccentStyle,
  previewToastContentStyle,
  previewTooltipStageStyle,
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
  const stageStyle = componentPreviewStageStyleFromTokens(lookup);
  return (
    <div
      style={stageStyle}
      data-podo-preview-component-id={component.id}
      data-podo-preview-kind={componentPreviewKind(component)}
    >
      {renderComponentPreviewBody(component, selections, lookup)}
    </div>
  );
}

export function renderComponentPreviewMatrix(input: {
  component: ComponentDocument;
  selections: Record<string, string>;
  lookup: TokenLookup;
  onSelect(selections: Record<string, string>): void;
}) {
  const rowVariant = input.component.variants[0];
  if (!rowVariant) {
    return null;
  }
  const columnVariant = input.component.variants[1];
  const columns = columnVariant?.values ?? ["preview"];
  return (
    <div style={componentMatrixPanelStyle}>
      <div style={componentMatrixHeaderStyle}>
        <strong>Variant matrix</strong>
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
                  {columnVariant ? column : "preview"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowVariant.values.map((rowValue) => (
              <tr key={rowValue}>
                <th style={componentMatrixRowHeaderStyle}>{rowValue}</th>
                {columns.map((columnValue) => {
                  const cellSelections = {
                    ...input.selections,
                    [rowVariant.name]: rowValue,
                    ...(columnVariant ? { [columnVariant.name]: columnValue } : {}),
                  };
                  const selected =
                    input.selections[rowVariant.name] === rowValue &&
                    (!columnVariant || input.selections[columnVariant.name] === columnValue);
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
                        <span style={componentMatrixPreviewClipStyle}>
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

function renderButtonPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const state = selections.state ?? "default";
  const isLoading = state === "loading";
  return (
    <button type="button" style={buttonPreviewStyleFromTokens(selections, lookup)}>
      {isLoading ? "Loading..." : "Submit"}
    </button>
  );
}

function renderAvatarPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const type = selections.type ?? "icon";
  const size = Number.parseInt(selections.size ?? "56", 10) || 56;
  const ring = selections.state === "hover";
  const avatarSize = Math.max(24, Math.min(size, 72));
  return (
    <div style={previewInlineWrapStyle}>
      <div
        style={{
          ...previewAvatarStyle,
          width: avatarSize,
          height: avatarSize,
          borderRadius: cssToken(lookup, "radius.scale.full", "9999px"),
          borderColor: ring
            ? cssToken(lookup, "color.primary.base", "#7c3aed")
            : cssToken(lookup, "color.border.base", "#e4e4e7"),
          background:
            type === "image"
              ? `linear-gradient(135deg, ${cssToken(
                  lookup,
                  "color.primary.fill",
                  "#f3e8ff"
                )}, ${cssToken(lookup, "color.info.fill", "#eef6ff")})`
              : cssToken(lookup, "color.default.fill", "#f4f4f5"),
          color: cssToken(lookup, "color.text.body", "#2c2c31"),
          fontSize: Math.max(11, Math.round(avatarSize * 0.34)),
        }}
      >
        {type === "text" ? "PO" : type === "image" ? "" : <span style={previewAvatarIconStyle} />}
      </div>
    </div>
  );
}

function renderCheckboxRadioPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const control = selections.control ?? "checkbox";
  const layout = selections.layout ?? "horizontal";
  const state = selections.state ?? "default";
  const isChecked = state === "checked";
  const disabled = state === "disabled";
  const direction = layout === "vertical" ? "column" : "row";

  if (control === "radio-group") {
    return (
      <div style={{ ...previewChoiceGroupStyle, flexDirection: direction }}>
        {["Free", "Team", "Enterprise"].map((label, index) =>
          renderChoiceControl({
            key: label,
            type: "radio",
            label,
            checked: index === 1 || (isChecked && index === 0),
            disabled: disabled && index === 2,
            lookup,
          })
        )}
      </div>
    );
  }

  return (
    <div style={{ ...previewChoiceGroupStyle, flexDirection: direction }}>
      {renderChoiceControl({
        key: "accept",
        type: control === "radio" ? "radio" : "checkbox",
        label: control === "radio" ? "Selected option" : "Accept terms",
        checked: isChecked,
        disabled,
        lookup,
      })}
    </div>
  );
}

function renderChoiceControl(input: {
  key: string;
  type: "checkbox" | "radio";
  label: string;
  checked: boolean;
  disabled: boolean;
  lookup: TokenLookup;
}) {
  const active = cssToken(input.lookup, "color.primary.base", "#7c3aed");
  const muted = cssToken(input.lookup, "color.text.action-disabled", "#a1a1aa");
  return (
    <label
      key={input.key}
      style={{
        ...previewChoiceStyle,
        color: input.disabled ? muted : cssToken(input.lookup, "color.text.body", "#2c2c31"),
      }}
    >
      <span
        style={{
          ...previewChoiceBoxStyle,
          borderRadius:
            input.type === "radio" ? "9999px" : cssToken(input.lookup, "radius.scale.2", "4px"),
          borderColor: input.checked
            ? active
            : cssToken(input.lookup, "color.border.base", "#e4e4e7"),
          background: input.checked ? active : cssToken(input.lookup, "color.bg.modal", "#ffffff"),
        }}
      >
        {input.checked ? (
          <span
            style={{
              ...previewChoiceDotStyle,
              borderRadius:
                input.type === "radio" ? "9999px" : cssToken(input.lookup, "radius.scale.1", "2px"),
            }}
          />
        ) : null}
      </span>
      {input.label}
    </label>
  );
}

function renderChipPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const theme = selections.theme ?? "default";
  const type = selections.type ?? "default";
  const size = selections.size ?? "md";
  const round = selections.shape === "round";
  const tone = chipToneToColorToken(theme);
  const baseColor = cssToken(lookup, `color.${tone}.base`, "#7c3aed");
  const fillColor = cssToken(lookup, `color.${tone}.fill`, "#f4f4f5");
  const textColor =
    type === "default"
      ? cssToken(lookup, "color.text.body", "#2c2c31")
      : type === "fill"
        ? baseColor
        : baseColor;
  return (
    <span
      style={{
        ...previewChipStyle,
        minHeight: size === "sm" ? 24 : 30,
        padding: size === "sm" ? "0 8px" : "0 12px",
        borderRadius: round
          ? cssToken(lookup, "radius.scale.full", "9999px")
          : cssToken(lookup, "radius.scale.3", "6px"),
        background:
          type === "border"
            ? "transparent"
            : type === "fill"
              ? fillColor
              : cssToken(lookup, "color.default.fill", "#f4f4f5"),
        borderColor:
          type === "default" ? cssToken(lookup, "color.border.base", "#e4e4e7") : baseColor,
        color: textColor,
        ...tokenTypographyStyle(
          lookup,
          size === "sm" ? "typography.paragraph.p5-semibold" : "typography.paragraph.p4-semibold"
        ),
      }}
    >
      <span style={{ ...previewChipDotStyle, background: baseColor }} />
      Status
      <span aria-hidden="true" style={previewChipDeleteStyle}>
        x
      </span>
    </span>
  );
}

function renderDatePickerPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const type = selections.type ?? "date";
  const mode = selections.mode ?? "instant";
  const state = selections.state ?? "default";
  const open = state === "open" || state === "selected";
  const disabled = state === "disabled";
  return (
    <div style={previewPopoverStackStyle}>
      <div
        style={{
          ...inputLikePreviewStyle(lookup, state),
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <span style={previewMutedTextStyle(lookup)}>
          {type === "time"
            ? "09:30"
            : type === "hour"
              ? "09"
              : mode === "period"
                ? "2026-06-15 - 2026-06-20"
                : "2026-06-15"}
        </span>
        <span style={previewControlIconStyle}>cal</span>
      </div>
      {open ? (
        <div style={previewCalendarStyle(lookup)}>
          <div style={previewCalendarHeaderStyle}>
            <button type="button" style={previewIconButtonStyle(lookup)}>
              {"<"}
            </button>
            <strong>June 2026</strong>
            <button type="button" style={previewIconButtonStyle(lookup)}>
              {">"}
            </button>
          </div>
          <div style={previewCalendarGridStyle}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span key={`${day}-${index}`} style={previewCalendarWeekdayStyle(lookup)}>
                {day}
              </span>
            ))}
            {Array.from({ length: 21 }, (_, index) => index + 1).map((day) => {
              const selected = day === 15 || (mode === "period" && day >= 15 && day <= 20);
              return (
                <span
                  key={day}
                  style={{
                    ...previewCalendarDayStyle,
                    background: selected
                      ? cssToken(lookup, "color.primary.base", "#7c3aed")
                      : "transparent",
                    color: selected
                      ? cssToken(lookup, "color.primary.reverse", "#ffffff")
                      : cssToken(lookup, "color.text.body", "#2c2c31"),
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderDocTabsPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const selected = selections["default-tab"] ?? "scss";
  return (
    <div style={previewTabsShellStyle(lookup)}>
      <div role="tablist" style={previewTabsListStyle(lookup)}>
        {["scss", "react", "cdn"].map((tab) => renderTabButton(tab, selected === tab, lookup))}
      </div>
      <div style={previewTabPanelStyle(lookup)}>
        <code style={codeStyle}>
          {selected === "react"
            ? "import { Button } from '@podo/react';"
            : selected === "cdn"
              ? '<script src="podo.js"></script>'
              : "@use '@podo/scss/button';"}
        </code>
      </div>
    </div>
  );
}

function renderRichEditorPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const invalid = selections.state === "invalid";
  const resizable = selections.resize === "resizable";
  return (
    <div
      style={{
        ...previewEditorShellStyle(lookup),
        borderColor: invalid
          ? cssToken(lookup, "color.danger.base", "#f04646")
          : cssToken(lookup, "color.border.base", "#e4e4e7"),
      }}
    >
      <div style={previewEditorToolbarStyle(lookup)}>
        {["B", "I", "H", "Link", "Img"].map((tool) => (
          <button key={tool} type="button" style={previewToolbarButtonStyle(lookup)}>
            {tool}
          </button>
        ))}
      </div>
      <div style={previewEditorContentStyle(lookup)}>
        <strong>Release notes</strong>
        <p style={{ margin: 0 }}>Write rich content, add media, and keep validation visible.</p>
      </div>
      {resizable ? <span style={previewResizeHandleStyle(lookup)} /> : null}
    </div>
  );
}

function renderFieldPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const invalid = selections.state === "invalid";
  return (
    <div style={previewFieldStyle}>
      {renderLabelPreview({ size: "sm", weight: "semibold" }, lookup)}
      <div style={inputLikePreviewStyle(lookup, invalid ? "invalid" : "default")}>
        team@podo.dev
      </div>
      <span
        style={{
          ...previewFieldMessageStyle,
          color: invalid
            ? cssToken(lookup, "color.danger.base", "#f04646")
            : cssToken(lookup, "color.text.sub", "#71717a"),
        }}
      >
        {invalid ? "Enter a valid email address." : "We use this for workspace updates."}
      </span>
    </div>
  );
}

function renderFilePreview(selections: Record<string, string>, lookup: TokenLookup) {
  const multiple = selections.selection === "multiple";
  const disabled = selections.state === "disabled";
  return (
    <div
      style={{
        ...previewFileDropStyle(lookup),
        opacity: disabled ? 0.65 : 1,
        background: disabled
          ? cssToken(lookup, "color.bg.disabled", "#e4e4e7")
          : cssToken(lookup, "color.bg.modal", "#ffffff"),
      }}
    >
      <button type="button" style={previewSecondaryButtonStyle(lookup)} disabled={disabled}>
        Choose file
      </button>
      <div style={previewFileListStyle(lookup)}>
        <span>product-shot.png</span>
        {multiple ? <span>brand-guide.pdf</span> : null}
      </div>
    </div>
  );
}

function renderInputPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const state = selections.state ?? "default";
  const disabled = state === "disabled";
  return (
    <div
      style={{
        ...inputLikePreviewStyle(lookup, state),
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <span style={previewControlIconStyle}>@</span>
      <span>team@podo.dev</span>
      <span style={{ ...previewMutedTextStyle(lookup), marginLeft: "auto" }}>verified</span>
    </div>
  );
}

function renderLabelPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const size = selections.size ?? "md";
  const weight = selections.weight ?? (selections.semibold === "true" ? "semibold" : "regular");
  const disabled = selections.state === "disabled";
  const typographyPath =
    size === "lg"
      ? "typography.paragraph.p3"
      : size === "sm"
        ? "typography.paragraph.p5"
        : "typography.paragraph.p4";
  return (
    <label
      style={{
        ...previewLabelStyle,
        ...tokenTypographyStyle(lookup, typographyPath),
        fontWeight: weight === "semibold" ? 600 : 400,
        color: disabled
          ? cssToken(lookup, "color.text.action-disabled", "#a1a1aa")
          : cssToken(lookup, "color.text.body", "#2c2c31"),
      }}
    >
      Email address
      <span style={{ color: cssToken(lookup, "color.danger.base", "#f04646") }}>*</span>
    </label>
  );
}

function renderPaginationPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const compact = selections.density === "compact";
  const size = compact ? 30 : 36;
  return (
    <nav aria-label="Pagination preview" style={previewPaginationStyle}>
      {["<", "1", "2", "3", "...", "10", ">"].map((item) => {
        const selected = item === "2";
        const disabled = item === "<";
        return (
          <button
            key={item}
            type="button"
            disabled={disabled}
            style={{
              ...previewPageButtonStyle(lookup),
              width: item === "..." ? 24 : size,
              height: size,
              background: selected
                ? cssToken(lookup, "color.primary.base", "#7c3aed")
                : cssToken(lookup, "color.bg.modal", "#ffffff"),
              color: disabled
                ? cssToken(lookup, "color.text.action-disabled", "#a1a1aa")
                : selected
                  ? cssToken(lookup, "color.primary.reverse", "#ffffff")
                  : cssToken(lookup, "color.text.body", "#2c2c31"),
              borderColor: selected
                ? cssToken(lookup, "color.primary.base", "#7c3aed")
                : cssToken(lookup, "color.border.base", "#e4e4e7"),
            }}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
}

function renderSelectPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const state = selections.state ?? "default";
  const open = state === "open";
  const disabled = state === "disabled";
  const leading = selections.icon === "leading";
  return (
    <div style={previewPopoverStackStyle}>
      <div
        style={{
          ...inputLikePreviewStyle(lookup, state),
          opacity: disabled ? 0.65 : 1,
        }}
      >
        {leading ? <span style={previewControlIconStyle}>usr</span> : null}
        <span>Product team</span>
        <span style={{ ...previewControlIconStyle, marginLeft: "auto" }}>v</span>
      </div>
      {open ? (
        <div style={previewMenuStyle(lookup)}>
          {["Product team", "Design system", "Operations"].map((item, index) => (
            <div
              key={item}
              style={{
                ...previewMenuItemStyle(lookup),
                background:
                  index === 0 ? cssToken(lookup, "color.primary.fill", "#f3e8ff") : "transparent",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderTabPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const fill = selections.width === "fill";
  return (
    <div style={previewTabsShellStyle(lookup)}>
      <div
        role="tablist"
        style={{
          ...previewTabsListStyle(lookup),
          gridTemplateColumns: fill ? "repeat(3, 1fr)" : undefined,
          display: fill ? "grid" : "flex",
        }}
      >
        {["Overview", "Usage", "Changelog"].map((tab, index) =>
          renderTabButton(tab, index === 0, lookup)
        )}
      </div>
      <div style={previewTabPanelStyle(lookup)}>
        Component guidance and examples stay inside the selected panel.
      </div>
    </div>
  );
}

function renderTablePreview(selections: Record<string, string>, lookup: TokenLookup) {
  const asList = selections.display === "list";
  const bordered = selections.border === "line";
  const fill = selections.fill === "row";
  const rows = [
    ["Button", "stable", "React"],
    ["Select", "stable", "Web"],
    ["Toast", "draft", "Native"],
  ];
  if (asList) {
    return (
      <div style={previewTableListStyle}>
        {rows.map((row) => (
          <div key={row[0]} style={previewTableListItemStyle(lookup)}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <table
      style={{
        ...previewTableStyle(lookup),
        borderCollapse: bordered ? "collapse" : "separate",
      }}
    >
      <thead>
        <tr>
          {["Component", "Status", "Target"].map((heading) => (
            <th key={heading} style={previewTableHeaderCellStyle(lookup, bordered)}>
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={row[0]}
            style={{
              background:
                fill && rowIndex === 1
                  ? cssToken(lookup, "color.bg.elevation", "#fafafa")
                  : "transparent",
            }}
          >
            {row.map((cell) => (
              <td key={cell} style={previewTableCellStyle(lookup, bordered)}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderTextareaPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const state = selections.state ?? "default";
  return (
    <textarea
      readOnly
      value={"Draft a concise message for the launch checklist.\nKeep tone direct and useful."}
      style={previewTextareaStyle(lookup, state)}
    />
  );
}

function renderToastPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const theme = selections.theme ?? "default";
  const long = selections.length === "long";
  const tone = theme === "default" ? "default-deep" : theme;
  const accent = cssToken(lookup, `color.${tone}.base`, "#7c3aed");
  return (
    <div
      style={{
        ...previewToastStyle(lookup),
        width: long ? 420 : 320,
        borderColor: accent,
      }}
    >
      <span style={{ ...previewToastAccentStyle, background: accent }} />
      <div style={previewToastContentStyle}>
        <strong>Changes saved</strong>
        <span>Token updates are ready to build into the project.</span>
      </div>
      <button type="button" style={previewToastCloseStyle(lookup)}>
        x
      </button>
    </div>
  );
}

function renderTogglePreview(selections: Record<string, string>, lookup: TokenLookup) {
  const checked = selections.state === "checked";
  const disabled = selections.state === "disabled";
  const showLabel = selections.label !== "hidden";
  return (
    <label style={previewToggleRootStyle(lookup)}>
      <span
        style={{
          ...previewToggleTrackStyle(lookup),
          background: checked
            ? cssToken(lookup, "color.primary.base", "#7c3aed")
            : cssToken(lookup, "color.bg.toggle", "#a1a1aa"),
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <span
          style={{
            ...previewToggleThumbStyle(lookup),
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </span>
      {showLabel ? <span>Enable dark mode</span> : null}
    </label>
  );
}

function renderTooltipPreview(selections: Record<string, string>, lookup: TokenLookup) {
  const variant = selections.variant ?? "default";
  const position = selections.position ?? "top";
  const info = variant === "info";
  return (
    <div style={previewTooltipStageStyle}>
      {position.startsWith("top") || position === "left" || position === "right" ? (
        <div style={previewTooltipBubbleStyle(lookup, info)}>Use token alias paths for reuse.</div>
      ) : null}
      <button type="button" style={previewSecondaryButtonStyle(lookup)}>
        Hover target
      </button>
      {position.startsWith("bottom") ? (
        <div style={previewTooltipBubbleStyle(lookup, info)}>Use token alias paths for reuse.</div>
      ) : null}
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
  editor: renderRichEditorPreview,
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

function componentPreviewStageStyleFromTokens(lookup: TokenLookup): CSSProperties {
  return {
    ...componentPreviewStageStyle,
    background: cssToken(lookup, "color.bg.elevation", "#f8fafc"),
    color: cssToken(lookup, "color.text.body", "#171a20"),
  };
}

function buttonPreviewStyleFromTokens(
  selections: Record<string, string>,
  lookup: TokenLookup
): CSSProperties {
  const theme = selections.theme ?? "default";
  const variant = selections.variant ?? "solid";
  const size = selections.size ?? "sm";
  const state = selections.state ?? "default";
  const textAlign = selections.alignment ?? selections["text-align"] ?? "center";
  const typography = resolveTokenPath(lookup, `component.button.size.${size}.typography`);
  const typographyStyle = isTypographyValue(typography) ? typographyToCss(typography) : {};
  const references = buttonPreviewTokenReferences(selections);
  const background = cssToken(lookup, references.background, "#f4f4f5");
  const color = cssToken(lookup, references.color, "#2c2c31");
  const borderColor = cssToken(lookup, references.border, background);
  const isDisabled = state === "disabled";
  const isLoading = state === "loading";
  const isFocusVisible = state === "focusVisible";
  return {
    ...buttonBasePreviewStyle,
    ...typographyStyle,
    height: cssToken(lookup, `component.button.size.${size}.height`, "42px"),
    padding: `${cssToken(lookup, `component.button.size.${size}.paddingY`, "0px")} ${cssToken(
      lookup,
      `component.button.size.${size}.paddingX`,
      "8px"
    )}`,
    borderRadius: cssToken(lookup, `component.button.size.${size}.radius`, "6px"),
    gap: cssToken(lookup, "component.button.gap", "4px"),
    background,
    color,
    justifyContent:
      textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
    border:
      variant === "text"
        ? "1px solid transparent"
        : `${cssToken(lookup, "component.button.borderWidth", "1px")} solid ${borderColor}`,
    boxShadow: isFocusVisible
      ? `0 0 0 ${cssToken(lookup, "component.button.focusWidth", "4px")} ${cssToken(
          lookup,
          `component.button.theme.${theme}.outline`,
          "rgba(124, 58, 237, 0.3)"
        )}`
      : "none",
    cursor: isDisabled ? "not-allowed" : "default",
    opacity: isLoading ? Number(cssToken(lookup, "component.button.loading.opacity", "0.72")) : 1,
  };
}

interface ButtonPreviewTokenReferences {
  background: string;
  color: string;
  border: string;
  height: string;
  typography: string;
}

function buttonPreviewTokenReferences(
  selections: Record<string, string>
): ButtonPreviewTokenReferences {
  const theme = selections.theme ?? "default";
  const variant = selections.variant ?? "solid";
  const size = selections.size ?? "sm";
  const state = selections.state ?? "default";
  const visualPrefix =
    state === "disabled"
      ? `component.button.disabled.${variant}`
      : state === "hover" || state === "active"
        ? `component.button.theme.${theme}.${variant}.${state}`
        : `component.button.theme.${theme}.${variant}`;
  return {
    background: `${visualPrefix}.background`,
    color: `${visualPrefix}.color`,
    border: `${visualPrefix}.border`,
    height: `component.button.size.${size}.height`,
    typography: `component.button.size.${size}.typography`,
  };
}

export function defaultPreviewSelectionsForComponent(
  component: ComponentDocument
): Record<string, string> {
  return Object.fromEntries(
    component.variants.map((variant) => [variant.name, variant.default ?? variant.values[0] ?? ""])
  );
}

function chipToneToColorToken(theme: string): string {
  if (theme === "blue") return "info";
  if (theme === "green") return "success";
  if (theme === "orange" || theme === "yellow") return "warning";
  if (theme === "red") return "danger";
  return "default";
}

export function tokenTypographyStyle(
  lookup: TokenLookup,
  path: string,
  fallback: CSSProperties = {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 400,
    letterSpacing: 0,
  }
): CSSProperties {
  const value = resolveTokenPath(lookup, path);
  return isTypographyValue(value) ? typographyToCss(value) : fallback;
}

function inputLikePreviewStyle(lookup: TokenLookup, state: string): CSSProperties {
  return {
    width: 320,
    minHeight: 42,
    border: `1px solid ${
      state === "invalid"
        ? cssToken(lookup, "color.danger.base", "#f04646")
        : state === "focusVisible" || state === "open"
          ? cssToken(lookup, "color.primary.base", "#7c3aed")
          : cssToken(lookup, "color.border.base", "#e4e4e7")
    }`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background:
      state === "disabled"
        ? cssToken(lookup, "color.bg.disabled", "#e4e4e7")
        : cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    display: "flex",
    alignItems: "center",
    gap: cssToken(lookup, "spacing.scale.3", "8px"),
    padding: `${cssToken(lookup, "spacing.scale.3", "8px")} ${cssToken(
      lookup,
      "spacing.scale.4",
      "12px"
    )}`,
    boxShadow:
      state === "focusVisible"
        ? `0 0 0 4px ${cssToken(lookup, "color.primary.outline", "rgba(124, 58, 237, 0.3)")}`
        : "none",
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewMutedTextStyle(lookup: TokenLookup): CSSProperties {
  return {
    color: cssToken(lookup, "color.text.sub", "#71717a"),
  };
}

function previewIconButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 28,
    height: 28,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.2", "4px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function renderTabButton(label: string, selected: boolean, lookup: TokenLookup) {
  return (
    <button
      key={label}
      type="button"
      role="tab"
      aria-selected={selected}
      style={{
        ...previewTabButtonStyle(lookup),
        color: selected
          ? cssToken(lookup, "color.primary.base", "#7c3aed")
          : cssToken(lookup, "color.text.sub", "#71717a"),
        borderBottomColor: selected
          ? cssToken(lookup, "color.primary.base", "#7c3aed")
          : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function previewTabsShellStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: "min(520px, 100%)",
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    overflow: "hidden",
  };
}

function previewTabsListStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "flex",
    alignItems: "stretch",
    borderBottom: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    background: cssToken(lookup, "color.bg.elevation", "#fafafa"),
  };
}

function previewTabButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 42,
    border: 0,
    borderBottom: "2px solid transparent",
    background: "transparent",
    padding: `0 ${cssToken(lookup, "spacing.scale.5", "16px")}`,
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4-semibold"),
  };
}

function previewTabPanelStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 88,
    padding: cssToken(lookup, "spacing.scale.5", "16px"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewEditorShellStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: "min(560px, 100%)",
    minHeight: 220,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    overflow: "hidden",
    position: "relative",
  };
}

function previewEditorToolbarStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: `0 ${cssToken(lookup, "spacing.scale.3", "8px")}`,
    borderBottom: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    background: cssToken(lookup, "color.bg.elevation", "#fafafa"),
  };
}

function previewToolbarButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    height: 30,
    minWidth: 30,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.2", "4px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    padding: "0 8px",
  };
}

function previewEditorContentStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "grid",
    alignContent: "start",
    gap: 8,
    minHeight: 160,
    padding: cssToken(lookup, "spacing.scale.5", "16px"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewResizeHandleStyle(lookup: TokenLookup): CSSProperties {
  return {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 12,
    height: 12,
    borderRight: `2px solid ${cssToken(lookup, "color.border.pressed", "#a1a1aa")}`,
    borderBottom: `2px solid ${cssToken(lookup, "color.border.pressed", "#a1a1aa")}`,
  };
}

function previewFileDropStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 360,
    border: `1px dashed ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    padding: cssToken(lookup, "spacing.scale.5", "16px"),
    display: "grid",
    justifyItems: "center",
    gap: cssToken(lookup, "spacing.scale.3", "8px"),
  };
}

function previewSecondaryButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 36,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    padding: `0 ${cssToken(lookup, "spacing.scale.4", "12px")}`,
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4-semibold"),
  };
}

function previewFileListStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "grid",
    gap: 4,
    justifyItems: "center",
    color: cssToken(lookup, "color.text.sub", "#71717a"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p5"),
  };
}

function previewPageButtonStyle(lookup: TokenLookup): CSSProperties {
  return {
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewMenuStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 320,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    boxShadow: `0 10px 24px ${cssToken(lookup, "color.border.alpha", "rgba(0, 0, 0, 0.18)")}`,
    overflow: "hidden",
  };
}

function previewMenuItemStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    padding: `0 ${cssToken(lookup, "spacing.scale.4", "12px")}`,
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewCalendarStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 320,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    padding: cssToken(lookup, "spacing.scale.4", "12px"),
    boxShadow: `0 10px 24px ${cssToken(lookup, "color.border.alpha", "rgba(0, 0, 0, 0.18)")}`,
  };
}

function previewCalendarWeekdayStyle(lookup: TokenLookup): CSSProperties {
  return {
    color: cssToken(lookup, "color.text.sub", "#71717a"),
    textAlign: "center",
    ...tokenTypographyStyle(lookup, "typography.paragraph.p5-semibold"),
  };
}

function previewTableStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: "min(560px, 100%)",
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    overflow: "hidden",
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    borderSpacing: 0,
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewTableHeaderCellStyle(lookup: TokenLookup, bordered: boolean): CSSProperties {
  return {
    background: cssToken(lookup, "color.bg.elevation", "#fafafa"),
    borderBottom: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRight: bordered ? `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}` : 0,
    color: cssToken(lookup, "color.text.header", "#1c1c20"),
    padding: `${cssToken(lookup, "spacing.scale.3", "8px")} ${cssToken(
      lookup,
      "spacing.scale.4",
      "12px"
    )}`,
    textAlign: "left",
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4-semibold"),
  };
}

function previewTableCellStyle(lookup: TokenLookup, bordered: boolean): CSSProperties {
  return {
    borderBottom: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRight: bordered ? `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}` : 0,
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    padding: `${cssToken(lookup, "spacing.scale.3", "8px")} ${cssToken(
      lookup,
      "spacing.scale.4",
      "12px"
    )}`,
  };
}

function previewTableListItemStyle(lookup: TokenLookup): CSSProperties {
  return {
    minHeight: 54,
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    alignItems: "center",
    gap: 12,
    padding: `0 ${cssToken(lookup, "spacing.scale.4", "12px")}`,
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
  };
}

function previewTextareaStyle(lookup: TokenLookup, state: string): CSSProperties {
  return {
    width: 420,
    minHeight: 132,
    resize: "none",
    border: `1px solid ${
      state === "invalid"
        ? cssToken(lookup, "color.danger.base", "#f04646")
        : state === "focusVisible"
          ? cssToken(lookup, "color.primary.base", "#7c3aed")
          : cssToken(lookup, "color.border.base", "#e4e4e7")
    }`,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background:
      state === "disabled"
        ? cssToken(lookup, "color.bg.disabled", "#e4e4e7")
        : cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    padding: `${cssToken(lookup, "spacing.scale.3", "8px")} ${cssToken(
      lookup,
      "spacing.scale.4",
      "12px"
    )}`,
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewToastStyle(lookup: TokenLookup): CSSProperties {
  return {
    maxWidth: "100%",
    border: `1px solid ${cssToken(lookup, "color.border.base", "#e4e4e7")}`,
    borderRadius: cssToken(lookup, "radius.scale.4", "8px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    boxShadow: `0 12px 28px ${cssToken(lookup, "color.border.alpha", "rgba(0, 0, 0, 0.18)")}`,
    display: "grid",
    gridTemplateColumns: "4px minmax(0, 1fr) auto",
    overflow: "hidden",
  };
}

function previewToastCloseStyle(lookup: TokenLookup): CSSProperties {
  return {
    alignSelf: "start",
    margin: 10,
    border: 0,
    background: "transparent",
    color: cssToken(lookup, "color.text.sub", "#71717a"),
    fontSize: 16,
  };
}

function previewToggleRootStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: cssToken(lookup, "spacing.scale.3", "8px"),
    color: cssToken(lookup, "color.text.body", "#2c2c31"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

function previewToggleTrackStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 48,
    height: 28,
    borderRadius: cssToken(lookup, "radius.scale.full", "9999px"),
    padding: 3,
    display: "flex",
    alignItems: "center",
    transition: "background 120ms ease",
  };
}

function previewToggleThumbStyle(lookup: TokenLookup): CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: cssToken(lookup, "radius.scale.full", "9999px"),
    background: cssToken(lookup, "color.bg.modal", "#ffffff"),
    boxShadow: `0 1px 4px ${cssToken(lookup, "color.border.alpha", "rgba(0, 0, 0, 0.18)")}`,
    transition: "transform 120ms ease",
  };
}

function previewTooltipBubbleStyle(lookup: TokenLookup, info: boolean): CSSProperties {
  return {
    maxWidth: 260,
    borderRadius: cssToken(lookup, "radius.scale.3", "6px"),
    background: info
      ? cssToken(lookup, "color.info.base", "#1890ff")
      : cssToken(lookup, "color.default-deep.base", "#52525b"),
    color: cssToken(lookup, "color.default-deep.reverse", "#ffffff"),
    padding: `${cssToken(lookup, "spacing.scale.2", "4px")} ${cssToken(
      lookup,
      "spacing.scale.3",
      "8px"
    )}`,
    textAlign: "center",
    ...tokenTypographyStyle(lookup, "typography.paragraph.p5"),
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
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4-semibold"),
  };
}

function previewSpecBodyStyle(lookup: TokenLookup): CSSProperties {
  return {
    display: "grid",
    placeItems: "center",
    color: cssToken(lookup, "color.text.sub", "#71717a"),
    ...tokenTypographyStyle(lookup, "typography.paragraph.p4"),
  };
}

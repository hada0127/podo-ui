import type { Dispatch, SetStateAction } from "react";
import type { ComponentDocument } from "@podo/spec";
import { editorPropKinds, type EditorTokenRecord } from "./spec-editing.js";
import {
  createNewComponentPropDraft,
  createNewComponentVariantDraft,
  type ComponentEditMode,
  type ComponentMetaDraft,
  type ComponentPropDraft,
  type ComponentVariantDraft,
} from "./drafts.js";
import { tokenRecordKey, type ComponentTokenEditorModel } from "./token-model.js";
import type { TokenLookup } from "./token-lookup.js";
import { renderComponentTokenEditor } from "./token-editor.js";
import { renderComponentPreview, renderComponentPreviewMatrix } from "./previews.js";
import {
  cardHeaderStyle,
  cardStyle,
  checkboxFieldStyle,
  compactFieldStyle,
  compactFormGridStyle,
  compactSelectStyle,
  componentEditModeBarStyle,
  componentEditModeButtonActiveStyle,
  componentEditModeButtonStyle,
  componentListButtonActiveStyle,
  componentListButtonStyle,
  componentListIdStyle,
  componentListNameStyle,
  componentListStyle,
  componentPreviewPanelStyle,
  componentStatRowStyle,
  dangerButtonStyle,
  disclosureStyle,
  editorFormStyle,
  emptyListStyle,
  errorBannerStyle,
  fieldStyle,
  inputStyle,
  previewControlRowStyle,
  rowStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  selectStyle,
  sidebarTitleStyle,
  smallButtonStyle,
  summaryStyle,
  tableCellMetaStyle,
  tableCellTextStyle,
  tableRowActiveStyle,
  tableRowStyle,
  tableStyle,
  textareaStyle,
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
  return (
    <>
      <div style={sidebarTitleStyle}>Components</div>
      <input
        aria-label="Search components"
        placeholder="Search components"
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
          <span style={emptyListStyle}>No components match this search.</span>
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
  selectedComponentTokenModel,
  selectedTokenKey,
  setSelectedTokenKey,
  updateTokenMatrixCell,
  previewTokenLookup,
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
  selectedComponentTokenModel: ComponentTokenEditorModel;
  selectedTokenKey: string | undefined;
  setSelectedTokenKey: Dispatch<SetStateAction<string | undefined>>;
  updateTokenMatrixCell: (record: EditorTokenRecord, valueText: string) => void;
  previewTokenLookup: TokenLookup;
  effectiveComponentPreviewSelections: Record<string, string>;
  setComponentPreviewSelections: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>{selectedComponentForSpec.name}</h1>
          <p style={sectionMetaStyle}>{selectedComponentForSpec.id}.component.json</p>
        </div>
        <div style={componentStatRowStyle}>
          <span>{selectedComponentForSpec.props.length} props</span>
          <span>{selectedComponentForSpec.variants.length} variants</span>
          <span>{selectedComponentForSpec.states.length} states</span>
        </div>
      </div>
      <details style={disclosureStyle}>
        <summary style={summaryStyle}>Details</summary>
        <div style={compactFormGridStyle}>
          <label style={fieldStyle}>
            Name
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
            Category
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
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label style={fieldStyle}>
            Status
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
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
            Description
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
              Save
            </button>
          </div>
        </div>
      </details>
      <div style={componentPreviewPanelStyle}>
        <div style={cardHeaderStyle}>
          <strong>Preview</strong>
          <div style={previewControlRowStyle}>
            {selectedComponentForSpec.variants.map((variant) => (
              <label key={variant.name} style={compactFieldStyle}>
                {variant.name}
                <select
                  style={compactSelectStyle}
                  value={
                    effectiveComponentPreviewSelections[variant.name] ??
                    variant.default ??
                    variant.values[0] ??
                    ""
                  }
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setComponentPreviewSelections((selections) => ({
                      ...selections,
                      [variant.name]: value,
                    }));
                  }}
                >
                  {variant.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {selectedComponentForSpec.states.length ? (
              <label style={compactFieldStyle}>
                state
                <select
                  style={compactSelectStyle}
                  value={effectiveComponentPreviewSelections.state ?? "default"}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setComponentPreviewSelections((selections) => ({
                      ...selections,
                      state: value,
                    }));
                  }}
                >
                  <option value="default">default</option>
                  {selectedComponentForSpec.states.map((stateItem) => (
                    <option key={stateItem.name} value={stateItem.name}>
                      {stateItem.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>
        {renderComponentPreview(
          selectedComponentForSpec,
          effectiveComponentPreviewSelections,
          previewTokenLookup
        )}
        {renderComponentPreviewMatrix({
          component: selectedComponentForSpec,
          selections: effectiveComponentPreviewSelections,
          lookup: previewTokenLookup,
          onSelect: setComponentPreviewSelections,
        })}
      </div>
      <div style={componentEditModeBarStyle}>
        {(["props", "variants", "tokens"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            style={{
              ...componentEditModeButtonStyle,
              ...(componentEditMode === mode ? componentEditModeButtonActiveStyle : {}),
            }}
            onClick={() => setComponentEditMode(mode)}
          >
            {mode === "props" ? `Props (${selectedComponentForSpec.props.length})` : null}
            {mode === "variants" ? `Variants (${selectedComponentForSpec.variants.length})` : null}
            {mode === "tokens" ? `Tokens (${selectedComponentTokenModel.records.length})` : null}
          </button>
        ))}
      </div>
      {componentEditMode === "props" ? (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <strong>Props</strong>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() => {
                setSelectedPropName(undefined);
                setPropDraft(createNewComponentPropDraft());
              }}
            >
              New prop
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
              Name
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
              Type
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
              Values
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
              Default
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
              Required
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              Description
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
                Save prop
              </button>
              <button
                type="button"
                style={dangerButtonStyle}
                disabled={!selectedPropName}
                onClick={deleteSelectedProp}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {componentEditMode === "variants" ? (
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <strong>Variants</strong>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() => {
                setSelectedVariantName(undefined);
                setVariantDraft(createNewComponentVariantDraft());
              }}
            >
              New variant
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
              Name
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
            <label style={fieldStyle}>
              Values
              <input
                style={inputStyle}
                value={variantDraft.valuesText}
                onChange={(event) => {
                  const valuesText = event.currentTarget.value;
                  setVariantDraft((draft) => ({
                    ...draft,
                    valuesText,
                  }));
                }}
              />
            </label>
            <label style={fieldStyle}>
              Default
              <input
                style={inputStyle}
                value={variantDraft.defaultValue}
                onChange={(event) => {
                  const defaultValue = event.currentTarget.value;
                  setVariantDraft((draft) => ({
                    ...draft,
                    defaultValue,
                  }));
                }}
              />
            </label>
            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              Token bindings JSON
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
              Description
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
                Save variant
              </button>
              <button
                type="button"
                style={dangerButtonStyle}
                disabled={!selectedVariantName}
                onClick={deleteSelectedVariant}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {componentEditMode === "tokens"
        ? renderComponentTokenEditor({
            model: selectedComponentTokenModel,
            selectedTokenKey,
            lookup: previewTokenLookup,
            onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
            onCommitValue: updateTokenMatrixCell,
          })
        : null}
      {componentDraftError ? <div style={errorBannerStyle}>{componentDraftError}</div> : null}
      <details style={disclosureStyle}>
        <summary style={summaryStyle}>Component JSON</summary>
        <textarea
          style={{ ...textareaStyle, minHeight: 220 }}
          readOnly
          value={JSON.stringify(selectedComponentForSpec, null, 2)}
        />
      </details>
    </section>
  );
}

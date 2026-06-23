import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from "react";
import {
  cardStyle,
  emptyListStyle,
  errorBannerStyle,
  iconBuildPillStyle,
  iconBuildPillBusyStyle,
  iconBuildPillErrorStyle,
  iconBuildPillReadyStyle,
  iconBuildPillStaleStyle,
  iconDangerButtonStyle,
  iconDropzoneStyle,
  iconDropzoneActiveStyle,
  iconFieldInputStyle,
  iconFieldLabelStyle,
  iconGridStyle,
  iconGroupButtonStyle,
  iconGroupButtonActiveStyle,
  iconGroupCheckRowStyle,
  iconGroupChecklistStyle,
  iconGroupCountStyle,
  iconGroupListStyle,
  iconGroupSectionTitleStyle,
  iconInspectorStyle,
  iconInspectorPreviewStyle,
  iconPasteTextareaStyle,
  iconSaveButtonStyle,
  iconSaveButtonDisabledStyle,
  iconSearchInputStyle,
  iconSpecimenStripStyle,
  iconTileActiveStyle,
  iconTileCodepointStyle,
  iconTileGlyphStyle,
  iconTileNameStyle,
  iconTileStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  sidebarTitleStyle,
  toolbarButtonStyle,
} from "./styles.js";
import { isIconFontStale, type EditorIcon, type EditorIconManifest } from "./icons-model.js";
import { IconPaperEditor } from "./icon-paper-editor.js";
import { useT } from "./i18n/context.js";

export type IconBuildStatus = "ready" | "building" | "error";

export type IconDrawTarget = { mode: "new" } | { mode: "edit"; name: string };

/** Inject sizing onto a stored (viewBox-only) icon SVG for inline rendering. */
function renderableSvg(svg: string): string {
  return svg.replace(/<svg\b/i, '<svg width="100%" height="100%"');
}

function IconGlyph({ svg, style }: { svg: string; style: CSSProperties }) {
  return <span style={style} dangerouslySetInnerHTML={{ __html: renderableSvg(svg) }} />;
}

export interface IconsPanelSharedProps {
  model: EditorIconManifest;
  selectedIconName: string | undefined;
  setSelectedIconName: (name: string | undefined) => void;
  activeGroup: string | undefined;
  setActiveGroup: (group: string | undefined) => void;
}

export interface IconsPanelControlsProps extends IconsPanelSharedProps {
  buildStatus: IconBuildStatus;
  buildError: string | undefined;
  createIconGroup: (label: string) => void;
  deleteIconGroup: (name: string) => void;
  saveIconFont: () => void;
}

export function IconsPanelControls({
  model,
  activeGroup,
  setActiveGroup,
  buildStatus,
  buildError,
  createIconGroup,
  deleteIconGroup,
  saveIconFont,
}: IconsPanelControlsProps) {
  const t = useT();
  const [newGroup, setNewGroup] = useState("");
  const groupNames = Object.keys(model.groups).sort((a, b) => a.localeCompare(b));
  const stale = isIconFontStale(model);

  let pillStyle = iconBuildPillReadyStyle;
  let pillLabel = t("iconsPanel.pillReady");
  if (buildStatus === "building") {
    pillStyle = iconBuildPillBusyStyle;
    pillLabel = t("iconsPanel.pillBuilding");
  } else if (buildStatus === "error") {
    pillStyle = iconBuildPillErrorStyle;
    pillLabel = t("iconsPanel.pillError");
  } else if (stale) {
    pillStyle = iconBuildPillStaleStyle;
    pillLabel = t("iconsPanel.pillStale");
  }

  return (
    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
      <div style={sidebarTitleStyle}>{t("iconsPanel.title")}</div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ ...iconBuildPillStyle, ...pillStyle }}>{pillLabel}</span>
        <button
          type="button"
          style={
            buildStatus === "building" || (!stale && buildStatus === "ready")
              ? { ...iconSaveButtonStyle, ...iconSaveButtonDisabledStyle }
              : iconSaveButtonStyle
          }
          disabled={buildStatus === "building" || (!stale && buildStatus === "ready")}
          onClick={saveIconFont}
        >
          {t("iconsPanel.buildSave")}
        </button>
        {buildError ? (
          <div role="alert" style={errorBannerStyle}>
            {buildError}
          </div>
        ) : null}
      </div>

      <div style={iconGroupListStyle}>
        <button
          type="button"
          style={
            activeGroup === undefined
              ? { ...iconGroupButtonStyle, ...iconGroupButtonActiveStyle }
              : iconGroupButtonStyle
          }
          onClick={() => setActiveGroup(undefined)}
        >
          <span>{t("iconsPanel.allIcons")}</span>
          <span style={iconGroupCountStyle}>{Object.keys(model.icons).length}</span>
        </button>
        {groupNames.map((group) => (
          <button
            key={group}
            type="button"
            style={
              activeGroup === group
                ? { ...iconGroupButtonStyle, ...iconGroupButtonActiveStyle }
                : iconGroupButtonStyle
            }
            onClick={() => setActiveGroup(group)}
          >
            <span>{group}</span>
            <span style={iconGroupCountStyle}>{model.groups[group]?.length ?? 0}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <input
          aria-label={t("iconsPanel.newGroupName")}
          placeholder={t("iconsPanel.newGroupName")}
          value={newGroup}
          onChange={(event) => setNewGroup(event.target.value)}
          style={iconSearchInputStyle}
        />
        <button
          type="button"
          style={toolbarButtonStyle}
          onClick={() => {
            if (newGroup.trim()) {
              createIconGroup(newGroup);
              setNewGroup("");
            }
          }}
        >
          {t("iconsPanel.addGroup")}
        </button>
        {activeGroup !== undefined ? (
          <button
            type="button"
            style={iconDangerButtonStyle}
            onClick={() => {
              deleteIconGroup(activeGroup);
              setActiveGroup(undefined);
            }}
          >
            {t("iconsPanel.deleteGroup", { group: activeGroup })}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface IconsPanelWorkspaceProps extends IconsPanelSharedProps {
  iconSearch: string;
  setIconSearch: (query: string) => void;
  draftError: string | undefined;
  addIconFromSvg: (svg: string, name?: string) => void;
  renameSelectedIcon: (to: string) => void;
  replaceSelectedIconSvg: (svg: string) => void;
  updateSelectedIconTags: (tags: string[]) => void;
  updateSelectedIconDescription: (description: string) => void;
  deleteSelectedIcon: () => void;
  toggleIconGroupMembership: (group: string, name: string, member: boolean) => void;
  drawTarget: IconDrawTarget | undefined;
  openDrawNew: () => void;
  openDrawEdit: (name: string) => void;
  applyDraw: (svg: string) => void;
  closeDraw: () => void;
}

export function IconsPanelWorkspace(props: IconsPanelWorkspaceProps) {
  const t = useT();
  const {
    model,
    selectedIconName,
    setSelectedIconName,
    activeGroup,
    iconSearch,
    setIconSearch,
    draftError,
    addIconFromSvg,
  } = props;

  const query = iconSearch.trim().toLowerCase();
  const groupMembers = activeGroup ? new Set(model.groups[activeGroup] ?? []) : undefined;
  const visibleNames = Object.keys(model.icons)
    .filter((name) => (groupMembers ? groupMembers.has(name) : true))
    .filter((name) => {
      if (!query) {
        return true;
      }
      const icon = model.icons[name];
      return (
        name.toLowerCase().includes(query) ||
        (icon?.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort(
      (a, b) =>
        Number.parseInt(model.icons[a]?.codepoint ?? "0", 16) -
        Number.parseInt(model.icons[b]?.codepoint ?? "0", 16)
    );

  const selectedIcon = selectedIconName ? model.icons[selectedIconName] : undefined;

  if (props.drawTarget) {
    const editing = props.drawTarget.mode === "edit" ? props.drawTarget.name : undefined;
    const drawTitle = editing
      ? t("iconsPanel.editTitle", { name: editing })
      : t("iconsPanel.drawNewTitle");
    const initialSvg = editing ? (model.icons[editing]?.svg ?? "") : "";
    return (
      <section style={sectionStyle}>
        <header style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>{drawTitle}</h2>
            <p style={sectionMetaStyle}>{t("iconsPanel.drawMeta")}</p>
          </div>
        </header>
        <IconPaperEditor
          key={editing ?? "__new__"}
          initialSvg={initialSvg}
          title={drawTitle}
          onApply={props.applyDraw}
          onClose={props.closeDraw}
        />
      </section>
    );
  }

  return (
    <section style={sectionStyle}>
      <header style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>{t("iconsPanel.editHeading")}</h2>
          <p style={sectionMetaStyle}>
            {t("iconsPanel.editHeaderMeta", { count: Object.keys(model.icons).length })}
          </p>
        </div>
        <button type="button" style={iconSaveButtonStyle} onClick={props.openDrawNew}>
          {t("iconsPanel.drawWithVector")}
        </button>
      </header>

      <IconFontSpecimen model={model} />

      <NewIconCard onAdd={addIconFromSvg} error={draftError} />

      <input
        aria-label={t("iconsPanel.iconSearch")}
        placeholder={t("iconsPanel.searchPlaceholder")}
        value={iconSearch}
        onChange={(event) => setIconSearch(event.target.value)}
        style={iconSearchInputStyle}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedIcon
            ? "minmax(0, 1fr) minmax(260px, 320px)"
            : "minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <div style={iconGroupSectionTitleStyle}>
            {activeGroup ?? t("iconsPanel.allLabel")} · {visibleNames.length}
          </div>
          {visibleNames.length === 0 ? (
            <div style={emptyListStyle}>{t("iconsPanel.noVisibleIcons")}</div>
          ) : (
            <div style={iconGridStyle}>
              {visibleNames.map((name) => {
                const icon = model.icons[name];
                if (!icon) {
                  return null;
                }
                return (
                  <button
                    key={name}
                    type="button"
                    style={
                      selectedIconName === name
                        ? { ...iconTileStyle, ...iconTileActiveStyle }
                        : iconTileStyle
                    }
                    onClick={() => setSelectedIconName(name)}
                    title={t("iconsPanel.tileTitle", { name, codepoint: icon.codepoint })}
                  >
                    <IconGlyph svg={icon.svg} style={iconTileGlyphStyle} />
                    <span style={iconTileNameStyle}>{name}</span>
                    <span style={iconTileCodepointStyle}>U+{icon.codepoint}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedIcon && selectedIconName ? (
          <IconInspector
            key={selectedIconName}
            name={selectedIconName}
            icon={selectedIcon}
            model={model}
            onRename={props.renameSelectedIcon}
            onReplaceSvg={props.replaceSelectedIconSvg}
            onTags={props.updateSelectedIconTags}
            onDescription={props.updateSelectedIconDescription}
            onDelete={props.deleteSelectedIcon}
            onToggleGroup={props.toggleIconGroupMembership}
            onDraw={() => props.openDrawEdit(selectedIconName)}
          />
        ) : null}
      </div>
    </section>
  );
}

function IconFontSpecimen({ model }: { model: EditorIconManifest }) {
  const t = useT();
  const sample = Object.keys(model.icons).slice(0, 18);
  return (
    <div style={iconSpecimenStripStyle} aria-label={t("iconsPanel.specimenLabel")}>
      {sample.length === 0 ? (
        <span style={emptyListStyle}>{t("iconsPanel.noIcons")}</span>
      ) : (
        sample.map((name) => {
          const icon = model.icons[name];
          if (!icon) {
            return null;
          }
          return (
            <IconGlyph
              key={name}
              svg={icon.svg}
              style={{ width: 28, height: 28, color: "inherit", display: "block" }}
            />
          );
        })
      )}
    </div>
  );
}

function readFilesAsSvg(
  files: FileList | File[],
  onAdd: (svg: string, name?: string) => void
): void {
  for (const file of Array.from(files)) {
    if (!/\.svg$/i.test(file.name) && file.type !== "image/svg+xml") {
      continue;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        onAdd(reader.result, file.name.replace(/\.svg$/i, ""));
      }
    });
    reader.readAsText(file);
  }
}

function NewIconCard({
  onAdd,
  error,
}: {
  onAdd: (svg: string, name?: string) => void;
  error: string | undefined;
}) {
  const t = useT();
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files.length > 0) {
      readFilesAsSvg(event.dataTransfer.files, onAdd);
      return;
    }
    const text = event.dataTransfer.getData("text/plain");
    if (text.includes("<svg")) {
      onAdd(text, nameDraft || undefined);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files) {
      readFilesAsSvg(event.target.files, onAdd);
      event.target.value = "";
    }
  };

  const addFromPaste = (): void => {
    if (pasteText.includes("<svg")) {
      onAdd(pasteText, nameDraft || undefined);
      setPasteText("");
      setNameDraft("");
    }
  };

  return (
    <div style={cardStyle}>
      <strong>{t("iconsPanel.addIcon")}</strong>
      <div
        style={
          dragActive ? { ...iconDropzoneStyle, ...iconDropzoneActiveStyle } : iconDropzoneStyle
        }
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <span>{t("iconsPanel.dropzoneHint")}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            style={toolbarButtonStyle}
            onClick={() => fileInputRef.current?.click()}
          >
            {t("iconsPanel.chooseSvgFile")}
          </button>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
        <input
          aria-label={t("iconsPanel.newIconNameLabel")}
          placeholder={t("iconsPanel.newIconNamePlaceholder")}
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          style={iconFieldInputStyle}
        />
        <textarea
          aria-label={t("iconsPanel.pasteSvgLabel")}
          placeholder={t("iconsPanel.svgPlaceholder")}
          value={pasteText}
          onChange={(event) => setPasteText(event.target.value)}
          style={iconPasteTextareaStyle}
        />
        <div>
          <button
            type="button"
            style={
              pasteText.includes("<svg")
                ? iconSaveButtonStyle
                : { ...iconSaveButtonStyle, ...iconSaveButtonDisabledStyle }
            }
            disabled={!pasteText.includes("<svg")}
            onClick={addFromPaste}
          >
            {t("iconsPanel.addPastedSvg")}
          </button>
        </div>
      </div>
      {error ? (
        <div role="alert" style={errorBannerStyle}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

function IconInspector({
  name,
  icon,
  model,
  onRename,
  onReplaceSvg,
  onTags,
  onDescription,
  onDelete,
  onToggleGroup,
  onDraw,
}: {
  name: string;
  icon: EditorIcon;
  model: EditorIconManifest;
  onRename: (to: string) => void;
  onReplaceSvg: (svg: string) => void;
  onTags: (tags: string[]) => void;
  onDescription: (description: string) => void;
  onDelete: () => void;
  onToggleGroup: (group: string, name: string, member: boolean) => void;
  onDraw: () => void;
}) {
  const t = useT();
  const [nameDraft, setNameDraft] = useState(name);
  const [replaceText, setReplaceText] = useState("");
  const groupNames = Object.keys(model.groups).sort((a, b) => a.localeCompare(b));

  return (
    <aside style={iconInspectorStyle} aria-label={t("iconsPanel.inspectorLabel", { name })}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <IconGlyph svg={icon.svg} style={iconInspectorPreviewStyle} />
        <div style={{ display: "grid", gap: 4 }}>
          <span style={iconTileCodepointStyle}>U+{icon.codepoint}</span>
          <span style={{ fontSize: 11, color: "#9aa6b6" }}>{t("iconsPanel.codepointFixed")}</span>
        </div>
      </div>

      <button type="button" style={iconSaveButtonStyle} onClick={onDraw}>
        {t("iconsPanel.editByDrawing")}
      </button>

      <label style={{ display: "grid", gap: 4 }}>
        <span style={iconFieldLabelStyle}>{t("iconsPanel.fieldName")}</span>
        <input
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={() => {
            if (nameDraft.trim() && nameDraft !== name) {
              onRename(nameDraft);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && nameDraft.trim() && nameDraft !== name) {
              onRename(nameDraft);
            }
          }}
          style={iconFieldInputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span style={iconFieldLabelStyle}>{t("iconsPanel.fieldTags")}</span>
        <input
          value={icon.tags.join(", ")}
          onChange={(event) =>
            onTags(
              event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          }
          style={iconFieldInputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span style={iconFieldLabelStyle}>{t("iconsPanel.fieldDescription")}</span>
        <input
          value={icon.description ?? ""}
          onChange={(event) => onDescription(event.target.value)}
          style={iconFieldInputStyle}
        />
      </label>

      <div style={{ display: "grid", gap: 4 }}>
        <span style={iconFieldLabelStyle}>{t("iconsPanel.replaceSvgLabel")}</span>
        <textarea
          value={replaceText}
          placeholder={t("iconsPanel.svgPlaceholder")}
          onChange={(event) => setReplaceText(event.target.value)}
          style={iconPasteTextareaStyle}
        />
        <button
          type="button"
          style={
            replaceText.includes("<svg")
              ? toolbarButtonStyle
              : { ...toolbarButtonStyle, opacity: 0.5 }
          }
          disabled={!replaceText.includes("<svg")}
          onClick={() => {
            onReplaceSvg(replaceText);
            setReplaceText("");
          }}
        >
          {t("iconsPanel.applySvg")}
        </button>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        <span style={iconFieldLabelStyle}>{t("iconsPanel.fieldGroup")}</span>
        {groupNames.length === 0 ? (
          <span style={emptyListStyle}>{t("iconsPanel.noGroups")}</span>
        ) : (
          <div style={iconGroupChecklistStyle}>
            {groupNames.map((group) => {
              const member = (model.groups[group] ?? []).includes(name);
              return (
                <label key={group} style={iconGroupCheckRowStyle}>
                  <input
                    type="checkbox"
                    checked={member}
                    onChange={(event) => onToggleGroup(group, name, event.target.checked)}
                  />
                  <span>{group}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <button type="button" style={iconDangerButtonStyle} onClick={onDelete}>
        {t("iconsPanel.deleteIcon")}
      </button>
    </aside>
  );
}

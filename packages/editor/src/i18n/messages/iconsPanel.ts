/** Strings for icons-panel.tsx. en is the source of truth; ko mirrors it. */
export const iconsPanelEn = {
  // Build status pill + save action (controls).
  "iconsPanel.pillReady": "woff2 up to date",
  "iconsPanel.pillBuilding": "Building…",
  "iconsPanel.pillError": "Build failed",
  "iconsPanel.pillStale": "Save needed",
  "iconsPanel.title": "Icons",
  "iconsPanel.buildSave": "Build & save woff2",

  // Group list + group CRUD (controls).
  "iconsPanel.allIcons": "All icons",
  "iconsPanel.newGroupName": "New group name",
  "iconsPanel.addGroup": "+ Add group",
  "iconsPanel.deleteGroup": 'Delete "{group}" group',

  // Draw / vector editor entry (workspace).
  "iconsPanel.editTitle": '"{name}" edit',
  "iconsPanel.drawNewTitle": "Draw new icon",
  "iconsPanel.drawMeta":
    "Draw vector paths and edit with nodes, booleans, and transforms. Applying reflects on woff2 save.",

  // Workspace header + grid.
  "iconsPanel.editHeading": "Edit icons",
  "iconsPanel.editHeaderMeta": "{count} icons · added/edited/deleted, then saved as woff2.",
  "iconsPanel.drawWithVector": "+ Draw with vector",
  "iconsPanel.iconSearch": "Search icons",
  "iconsPanel.searchPlaceholder": "Search by name or tag",
  "iconsPanel.allLabel": "All",
  "iconsPanel.noVisibleIcons": "There are no icons to show.",
  "iconsPanel.tileTitle": "{name} (U+{codepoint})",

  // Specimen strip.
  "iconsPanel.specimenLabel": "Icon preview",
  "iconsPanel.noIcons": "There are no icons.",

  // New icon card.
  "iconsPanel.addIcon": "Add icon",
  "iconsPanel.dropzoneHint": "Drag an SVG file here, or paste SVG code below.",
  "iconsPanel.chooseSvgFile": "Choose SVG file",
  "iconsPanel.newIconNameLabel": "New icon name (optional)",
  "iconsPanel.newIconNamePlaceholder": "Icon name (optional, e.g. arrow-up)",
  "iconsPanel.pasteSvgLabel": "Paste SVG code",
  "iconsPanel.svgPlaceholder": '<svg viewBox="0 0 24 24">…</svg>',
  "iconsPanel.addPastedSvg": "Add pasted SVG",

  // Inspector.
  "iconsPanel.inspectorLabel": "{name} details",
  "iconsPanel.codepointFixed": "The codepoint is fixed.",
  "iconsPanel.editByDrawing": "✏️ Edit by drawing",
  "iconsPanel.fieldName": "Name",
  "iconsPanel.fieldTags": "Tags (comma-separated)",
  "iconsPanel.fieldDescription": "Description",
  "iconsPanel.replaceSvgLabel": "Replace SVG (paste)",
  "iconsPanel.applySvg": "Apply SVG",
  "iconsPanel.fieldGroup": "Group",
  "iconsPanel.noGroups": "There are no groups.",
  "iconsPanel.deleteIcon": "Delete icon",
} as const;

export const iconsPanelKo: Record<keyof typeof iconsPanelEn, string> = {
  "iconsPanel.pillReady": "woff2 최신",
  "iconsPanel.pillBuilding": "빌드 중…",
  "iconsPanel.pillError": "빌드 실패",
  "iconsPanel.pillStale": "저장 필요",
  "iconsPanel.title": "아이콘",
  "iconsPanel.buildSave": "woff2 빌드·저장",

  "iconsPanel.allIcons": "전체 아이콘",
  "iconsPanel.newGroupName": "새 그룹 이름",
  "iconsPanel.addGroup": "+ 그룹 추가",
  "iconsPanel.deleteGroup": '"{group}" 그룹 삭제',

  "iconsPanel.editTitle": '"{name}" 편집',
  "iconsPanel.drawNewTitle": "새 아이콘 그리기",
  "iconsPanel.drawMeta":
    "벡터 패스를 그리고 노드·불린·변형으로 편집하세요. 적용하면 woff2 저장 시 반영됩니다.",

  "iconsPanel.editHeading": "아이콘 편집",
  "iconsPanel.editHeaderMeta": "{count}개 아이콘 · 추가/수정/삭제 후 woff2로 저장됩니다.",
  "iconsPanel.drawWithVector": "+ 벡터로 그리기",
  "iconsPanel.iconSearch": "아이콘 검색",
  "iconsPanel.searchPlaceholder": "이름 또는 태그로 검색",
  "iconsPanel.allLabel": "전체",
  "iconsPanel.noVisibleIcons": "표시할 아이콘이 없습니다.",
  "iconsPanel.tileTitle": "{name} (U+{codepoint})",

  "iconsPanel.specimenLabel": "아이콘 미리보기",
  "iconsPanel.noIcons": "아이콘이 없습니다.",

  "iconsPanel.addIcon": "아이콘 추가",
  "iconsPanel.dropzoneHint": "SVG 파일을 끌어다 놓거나, 아래에 SVG 코드를 붙여넣으세요.",
  "iconsPanel.chooseSvgFile": "SVG 파일 선택",
  "iconsPanel.newIconNameLabel": "새 아이콘 이름 (선택)",
  "iconsPanel.newIconNamePlaceholder": "아이콘 이름 (선택, 예: arrow-up)",
  "iconsPanel.pasteSvgLabel": "SVG 코드 붙여넣기",
  "iconsPanel.svgPlaceholder": '<svg viewBox="0 0 24 24">…</svg>',
  "iconsPanel.addPastedSvg": "붙여넣은 SVG 추가",

  "iconsPanel.inspectorLabel": "{name} 상세",
  "iconsPanel.codepointFixed": "코드포인트는 고정됩니다.",
  "iconsPanel.editByDrawing": "✏️ 그리기로 편집",
  "iconsPanel.fieldName": "이름",
  "iconsPanel.fieldTags": "태그 (쉼표로 구분)",
  "iconsPanel.fieldDescription": "설명",
  "iconsPanel.replaceSvgLabel": "SVG 교체 (붙여넣기)",
  "iconsPanel.applySvg": "SVG 적용",
  "iconsPanel.fieldGroup": "그룹",
  "iconsPanel.noGroups": "그룹이 없습니다.",
  "iconsPanel.deleteIcon": "아이콘 삭제",
};

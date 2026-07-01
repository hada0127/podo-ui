/** Strings for token-editor.tsx. en is the source of truth; ko mirrors it. */
export const tokenEditorEn = {
  // TokenDeleteDialog — replacement-required deletion flow.
  "tokenEditor.nounColorSet": "color set",
  "tokenEditor.nounColor": "color",
  "tokenEditor.nounSpacing": "spacing",
  "tokenEditor.nounRadius": "radius",
  "tokenEditor.nounToken": "token",
  "tokenEditor.usageSourceComponent": "component",
  "tokenEditor.usageSourcePage": "page",
  "tokenEditor.usageSourceToken": "token",
  "tokenEditor.deleteDialogAria": "Delete {noun} {name}",
  "tokenEditor.deleteTitle": "Delete {noun} “{name}”",
  "tokenEditor.deleteHelpPrefix": "This ",
  "tokenEditor.deleteHelpMiddle": " is used in {count} place(s). Pick a replacement ",
  "tokenEditor.deleteHelpSuffix": " and then delete.",
  "tokenEditor.deleteUsageMore": "…and {count} more",
  "tokenEditor.deleteReplacementLabel": "Replacement {noun}",
  "tokenEditor.deleteReplacementAria": "Replacement {noun}",
  "tokenEditor.deleteReplacementNone": "(none)",
  "tokenEditor.cancel": "Cancel",
  "tokenEditor.deleteConfirm": "Replace and delete",

  // ColorGroupHeader — color-set rename/delete controls.
  "tokenEditor.renameColorSetAria": "Rename color set {label}",
  "tokenEditor.rename": "Rename",
  "tokenEditor.deleteColorSetAria": "Delete color set {label}",
  "tokenEditor.deleteColorSetTitle": "Delete color set {groupId}",

  // InlineColorPicker — pointer-driven HSV picker regions.
  "tokenEditor.colorPickerSaturationValue": "Saturation and value",
  "tokenEditor.colorPickerHue": "Hue",
  "tokenEditor.colorPickerAlpha": "Alpha",

  // ColorSwatchPicker — swatch trigger.
  "tokenEditor.editColorFor": "Edit color for {label}",

  // ColorValueField — editable color value input.
  "tokenEditor.fieldValueAria": "{label} value",
  "tokenEditor.referenceEditTitle": '{displayValue} — edit references "{rawValue}"',

  // ColorScaleSide — light/dark sides, token reference picker.
  "tokenEditor.schemeLight": "light",
  "tokenEditor.schemeDark": "dark",
  "tokenEditor.addScheme": "+ {scheme}",
  "tokenEditor.referenceTokenAria": "Reference a token for {path}",
  "tokenEditor.referenceTokenTitle": "Reference another color token instead of a raw color",
  "tokenEditor.referenceTokenPlaceholder": "Reference token…",

  // Shared counts and delete control across render* helpers.
  "tokenEditor.tokenCount": "{count} tokens",
  "tokenEditor.deleteAria": "Delete {path}",

  // renderScalarScaleEditor — flat scalar scale list.
  "tokenEditor.newScalar": "+ New {label}",
  "tokenEditor.emptyScalar": "No {label} tokens yet.",

  // renderTypographyTokenEditor — families/scale/styles workspace.
  "tokenEditor.typographyTitle": "Typography",
  "tokenEditor.typographyHelp":
    "Edit font families, weights, the size scale, and text styles as live specimens.",
  "tokenEditor.familiesCount": "{count} families",
  "tokenEditor.sizesCount": "{count} sizes",
  "tokenEditor.stylesCount": "{count} styles",
  "tokenEditor.fontFamilies": "Font families",
  "tokenEditor.fieldFamily": "family",
  "tokenEditor.attach": "Attach",
  "tokenEditor.familyFileAria": "{path} font file",
  "tokenEditor.familyNameAria": "{path} family",
  "tokenEditor.remove": "Remove",
  "tokenEditor.noFile": "No file",
  "tokenEditor.delete": "Delete",
  "tokenEditor.supportedWeights": "supported weights",
  "tokenEditor.weightToggleAria": "{family} {label} {value} {state}",
  "tokenEditor.weightToggleOn": "on",
  "tokenEditor.weightToggleOff": "off",
  "tokenEditor.weightToggleTitle": "{label} {value}",
  "tokenEditor.newFamily": "+ New family",
  "tokenEditor.scale": "Scale",
  "tokenEditor.newSize": "+ New size",
  "tokenEditor.styles": "Styles",
  "tokenEditor.newStyle": "+ New style",
  "tokenEditor.specimenText": "The quick brown fox jumps over the lazy dog",

  // renderScalarTypographyInput / renderTypographyFieldInput — inline value inputs.
  "tokenEditor.valueAria": "{path} value",
  "tokenEditor.fieldAria": "{path} {field}",

  // renderTypographyStyleCard — per-style card fields.
  "tokenEditor.fieldSize": "size",
  "tokenEditor.fieldLine": "line",
  "tokenEditor.fieldWeight": "weight",
  "tokenEditor.fieldLetter": "letter",
  "tokenEditor.fieldParagraph": "paragraph",
  "tokenEditor.styleNotTypography":
    "This value isn’t a typography object yet. Delete it and add a new style.",

  // renderComponentTokenEditor — local component dimension/number/string tokens.
  "tokenEditor.componentTokens": "Component tokens",
  "tokenEditor.componentTokensHelp":
    "Edit local dimension and number values that belong to this component.",
  "tokenEditor.colToken": "token",
  "tokenEditor.colValue": "value",
  "tokenEditor.colPreview": "preview",
  "tokenEditor.componentTokensEmpty":
    "No local dimension, number, or string tokens for this component.",

  // renderTokenMatrixEditor — generic token matrix.
  "tokenEditor.matrixTitle": "{type} matrix",
  "tokenEditor.matrixHelp":
    "{count} editable cells across {sections} {groupWord}. Select a cell to sync the detail editor.",
  "tokenEditor.groupSingular": "group",
  "tokenEditor.groupPlural": "groups",
  "tokenEditor.colGroup": "group",
  "tokenEditor.cellColorAria": "{path} color",

  // renderColorComparisonMatrix — color matrix header.
  "tokenEditor.colorMatrix": "color matrix",
  "tokenEditor.baseColorMatrix": "base color",
  "tokenEditor.colorMatrixHelp":
    "{count} color tokens across {sections} {groupWord}. Variations stack; light and dark sit side by side.",
  "tokenEditor.legendLight": "light",
  "tokenEditor.legendDark": "dark",
  "tokenEditor.newColor": "+ New color",
  "tokenEditor.colorColLight": "light",
  "tokenEditor.colorColDark": "dark",
  "tokenEditor.deleteColorAria": "Delete color {columnPath}",
  "tokenEditor.deleteColorTitle": "Delete {columnPath}",
} as const;

export const tokenEditorKo: Record<keyof typeof tokenEditorEn, string> = {
  "tokenEditor.nounColorSet": "색상 세트",
  "tokenEditor.nounColor": "색상",
  "tokenEditor.nounSpacing": "간격",
  "tokenEditor.nounRadius": "반경",
  "tokenEditor.nounToken": "토큰",
  "tokenEditor.usageSourceComponent": "컴포넌트",
  "tokenEditor.usageSourcePage": "페이지",
  "tokenEditor.usageSourceToken": "토큰",
  "tokenEditor.deleteDialogAria": "{noun} {name} 삭제",
  "tokenEditor.deleteTitle": "{noun} “{name}” 삭제",
  "tokenEditor.deleteHelpPrefix": "이 ",
  "tokenEditor.deleteHelpMiddle": " {count}곳에서 사용 중입니다. 대체할 ",
  "tokenEditor.deleteHelpSuffix": " 선택한 뒤 삭제하세요.",
  "tokenEditor.deleteUsageMore": "…외 {count}곳",
  "tokenEditor.deleteReplacementLabel": "대체 {noun}",
  "tokenEditor.deleteReplacementAria": "대체 {noun}",
  "tokenEditor.deleteReplacementNone": "(없음)",
  "tokenEditor.cancel": "취소",
  "tokenEditor.deleteConfirm": "대체 후 삭제",

  "tokenEditor.renameColorSetAria": "색상 세트 {label} 이름변경",
  "tokenEditor.rename": "이름변경",
  "tokenEditor.deleteColorSetAria": "색상 세트 {label} 삭제",
  "tokenEditor.deleteColorSetTitle": "색상 세트 {groupId} 삭제",

  "tokenEditor.colorPickerSaturationValue": "채도와 명도",
  "tokenEditor.colorPickerHue": "색조",
  "tokenEditor.colorPickerAlpha": "투명도",

  "tokenEditor.editColorFor": "{label} 색상 편집",

  "tokenEditor.fieldValueAria": "{label} 값",
  "tokenEditor.referenceEditTitle": '{displayValue} — 참조 "{rawValue}" 편집',

  "tokenEditor.schemeLight": "light",
  "tokenEditor.schemeDark": "dark",
  "tokenEditor.addScheme": "+ {scheme}",
  "tokenEditor.referenceTokenAria": "{path}에 사용할 토큰 참조",
  "tokenEditor.referenceTokenTitle": "원시 색상 대신 다른 색상 토큰 참조",
  "tokenEditor.referenceTokenPlaceholder": "토큰 참조…",

  "tokenEditor.tokenCount": "토큰 {count}개",
  "tokenEditor.deleteAria": "{path} 삭제",

  "tokenEditor.newScalar": "+ 새 {label}",
  "tokenEditor.emptyScalar": "{label} 토큰이 아직 없습니다.",

  "tokenEditor.typographyTitle": "타이포그래피",
  "tokenEditor.typographyHelp":
    "글꼴, 굵기, 크기 스케일, 텍스트 스타일을 라이브 견본으로 편집합니다.",
  "tokenEditor.familiesCount": "글꼴 {count}개",
  "tokenEditor.sizesCount": "크기 {count}개",
  "tokenEditor.stylesCount": "스타일 {count}개",
  "tokenEditor.fontFamilies": "글꼴",
  "tokenEditor.fieldFamily": "글꼴",
  "tokenEditor.attach": "첨부",
  "tokenEditor.familyFileAria": "{path} 글꼴 파일",
  "tokenEditor.familyNameAria": "{path} 글꼴",
  "tokenEditor.remove": "제거",
  "tokenEditor.noFile": "파일 없음",
  "tokenEditor.delete": "삭제",
  "tokenEditor.supportedWeights": "지원 굵기",
  "tokenEditor.weightToggleAria": "{family} {label} {value} {state}",
  "tokenEditor.weightToggleOn": "켜짐",
  "tokenEditor.weightToggleOff": "꺼짐",
  "tokenEditor.weightToggleTitle": "{label} {value}",
  "tokenEditor.newFamily": "+ 새 글꼴",
  "tokenEditor.scale": "스케일",
  "tokenEditor.newSize": "+ 새 크기",
  "tokenEditor.styles": "스타일",
  "tokenEditor.newStyle": "+ 새 스타일",
  "tokenEditor.specimenText": "다람쥐 헌 쳇바퀴에 타고파",

  "tokenEditor.valueAria": "{path} 값",
  "tokenEditor.fieldAria": "{path} {field}",

  "tokenEditor.fieldSize": "크기",
  "tokenEditor.fieldLine": "행간",
  "tokenEditor.fieldWeight": "굵기",
  "tokenEditor.fieldLetter": "자간",
  "tokenEditor.fieldParagraph": "문단",
  "tokenEditor.styleNotTypography":
    "이 값은 아직 타이포그래피 객체가 아닙니다. 삭제하고 새 스타일을 추가하세요.",

  "tokenEditor.componentTokens": "컴포넌트 토큰",
  "tokenEditor.componentTokensHelp": "이 컴포넌트에 속한 로컬 치수 및 숫자 값을 편집합니다.",
  "tokenEditor.colToken": "토큰",
  "tokenEditor.colValue": "값",
  "tokenEditor.colPreview": "미리보기",
  "tokenEditor.componentTokensEmpty": "이 컴포넌트에 대한 로컬 치수, 숫자, 문자열 토큰이 없습니다.",

  "tokenEditor.matrixTitle": "{type} 매트릭스",
  "tokenEditor.matrixHelp":
    "{sections} {groupWord}에 걸쳐 편집 가능한 셀 {count}개. 셀을 선택하면 상세 편집기와 동기화됩니다.",
  "tokenEditor.groupSingular": "그룹",
  "tokenEditor.groupPlural": "그룹",
  "tokenEditor.colGroup": "그룹",
  "tokenEditor.cellColorAria": "{path} 색상",

  "tokenEditor.colorMatrix": "색상 매트릭스",
  "tokenEditor.baseColorMatrix": "베이스 색상",
  "tokenEditor.colorMatrixHelp":
    "{sections} {groupWord}에 걸쳐 색상 토큰 {count}개. 변형은 세로로 쌓이고 라이트와 다크는 나란히 배치됩니다.",
  "tokenEditor.legendLight": "라이트",
  "tokenEditor.legendDark": "다크",
  "tokenEditor.newColor": "+ 새 색상",
  "tokenEditor.colorColLight": "라이트",
  "tokenEditor.colorColDark": "다크",
  "tokenEditor.deleteColorAria": "색상 {columnPath} 삭제",
  "tokenEditor.deleteColorTitle": "{columnPath} 삭제",
};

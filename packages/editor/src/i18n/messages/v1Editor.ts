/** Strings for v1-editor.tsx. en is the source of truth; ko mirrors it. */
export const v1EditorEn = {
  // Default placeholder
  "v1Editor.placeholder": "Enter content...",

  // Align option labels
  "v1Editor.alignLeft": "Align left",
  "v1Editor.alignCenter": "Align center",
  "v1Editor.alignRight": "Align right",

  // Paragraph option labels
  "v1Editor.paraH1": "Heading 1",
  "v1Editor.paraH2": "Heading 2",
  "v1Editor.paraH3": "Heading 3",
  "v1Editor.paraBody": "Body",
  "v1Editor.paraP1": "P1",
  "v1Editor.paraP2": "P2",
  "v1Editor.paraP3": "P3",
  "v1Editor.paraP3Semibold": "P3 Semibold",
  "v1Editor.paraP4": "P4",
  "v1Editor.paraP4Semibold": "P4 Semibold",
  "v1Editor.paraP5": "P5",
  "v1Editor.paraP5Semibold": "P5 Semibold",
  "v1Editor.paraFormat": "Paragraph format",

  // Alerts
  "v1Editor.alertImageLoadFailedUrl":
    "Could not load the image.\n\nPossible causes:\n1. Invalid image URL\n2. Blocked by CORS policy (external domain)\n3. Network connection problem\n4. Image does not exist\n\nURL: {url}\n\n💡 Tip: If blocked by CORS policy, please download the image and use file upload instead.",
  "v1Editor.alertImageLoadFailed":
    "Could not load the image.\n\nPossible causes:\n1. Invalid image URL\n2. Blocked by CORS policy\n3. Network connection problem\n\nURL: {src}",
  "v1Editor.alertSelectImageFile": "Please select an image file.",
  "v1Editor.alertTableMinRow": "A table must have at least 1 row.",
  "v1Editor.alertTableMinColumn": "A table must have at least 1 column.",
  "v1Editor.alertInvalidYoutubeUrl":
    "Please enter a valid YouTube URL.\n\nSupported formats:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID",

  // Toolbar button titles
  "v1Editor.undo": "Undo",
  "v1Editor.redo": "Redo",
  "v1Editor.bold": "Bold",
  "v1Editor.italic": "Italic",
  "v1Editor.underline": "Underline",
  "v1Editor.strikethrough": "Strikethrough",
  "v1Editor.fontColor": "Font color",
  "v1Editor.backgroundColor": "Background color",
  "v1Editor.list": "Bulleted list",
  "v1Editor.orderedList": "Numbered list",
  "v1Editor.hr": "Divider",
  "v1Editor.insertTable": "Insert table",
  "v1Editor.link": "Link",
  "v1Editor.image": "Image",
  "v1Editor.youtube": "YouTube",
  "v1Editor.clearFormat": "Clear formatting",
  "v1Editor.switchToEditor": "Switch to editor",
  "v1Editor.viewHtmlCode": "View HTML code",

  // Table grid selector
  "v1Editor.tableGridSize": "{rows} × {cols} table",
  "v1Editor.tableSelectSize": "Select table size",

  // Link dropdown
  "v1Editor.urlLabel": "URL",
  "v1Editor.openInNewWindow": "Open in new window",
  "v1Editor.openInCurrentWindow": "Open in current window",
  "v1Editor.cancel": "Cancel",
  "v1Editor.insert": "Insert",

  // Image / YouTube dropdown
  "v1Editor.fileUpload": "File upload",
  "v1Editor.urlInput": "URL input",
  "v1Editor.selectFile": "Select file",
  "v1Editor.imagePreviewAlt": "Preview",
  "v1Editor.sizeLabel": "Size",
  "v1Editor.sizeOriginal": "Original",
  "v1Editor.alignLabel": "Alignment",
  "v1Editor.altTextLabel": "Alt text",
  "v1Editor.imageDescriptionPlaceholder": "Image description...",
  "v1Editor.youtubeUrl": "YouTube URL",
  "v1Editor.youtubeUrlPlaceholder": "https://www.youtube.com/watch?v=... or https://youtu.be/...",

  // Edit link popup
  "v1Editor.editUrlLabel": "Edit URL",
  "v1Editor.removeLink": "Remove link",
  "v1Editor.apply": "Apply",

  // Edit popups
  "v1Editor.editImage": "Edit image",
  "v1Editor.editYoutube": "Edit YouTube",
  "v1Editor.delete": "Delete",

  // Table context menu
  "v1Editor.cellsSelected": "{count} cells selected",
  "v1Editor.cellBackgroundColor": "Cell background color",
  "v1Editor.cellBackgroundColorCount": "Cell background color ({count})",
  "v1Editor.resetBackgroundColor": "Reset background color",
  "v1Editor.cellAlignLeft": "Align left",
  "v1Editor.cellAlignCenter": "Align center",
  "v1Editor.cellAlignRight": "Align right",
  "v1Editor.addRowAbove": "Add row above",
  "v1Editor.addRowBelow": "Add row below",
  "v1Editor.deleteRow": "Delete row",
  "v1Editor.addColumnLeft": "Add column to the left",
  "v1Editor.addColumnRight": "Add column to the right",
  "v1Editor.deleteColumn": "Delete column",
} as const;

export const v1EditorKo: Record<keyof typeof v1EditorEn, string> = {
  // Default placeholder
  "v1Editor.placeholder": "내용을 입력하세요...",

  // Align option labels
  "v1Editor.alignLeft": "왼쪽 정렬",
  "v1Editor.alignCenter": "가운데 정렬",
  "v1Editor.alignRight": "오른쪽 정렬",

  // Paragraph option labels
  "v1Editor.paraH1": "제목 1",
  "v1Editor.paraH2": "제목 2",
  "v1Editor.paraH3": "제목 3",
  "v1Editor.paraBody": "본문",
  "v1Editor.paraP1": "P1",
  "v1Editor.paraP2": "P2",
  "v1Editor.paraP3": "P3",
  "v1Editor.paraP3Semibold": "P3 Semibold",
  "v1Editor.paraP4": "P4",
  "v1Editor.paraP4Semibold": "P4 Semibold",
  "v1Editor.paraP5": "P5",
  "v1Editor.paraP5Semibold": "P5 Semibold",
  "v1Editor.paraFormat": "문단 형식",

  // Alerts
  "v1Editor.alertImageLoadFailedUrl":
    "이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단 (외부 도메인)\n3. 네트워크 연결 문제\n4. 이미지가 존재하지 않음\n\nURL: {url}\n\n💡 팁: CORS 정책으로 차단된 경우, 이미지를 직접 다운로드 후 파일 업로드를 사용해주세요.",
  "v1Editor.alertImageLoadFailed":
    "이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단\n3. 네트워크 연결 문제\n\nURL: {src}",
  "v1Editor.alertSelectImageFile": "이미지 파일을 선택해주세요.",
  "v1Editor.alertTableMinRow": "표에는 최소 1개의 행이 필요합니다.",
  "v1Editor.alertTableMinColumn": "표에는 최소 1개의 열이 필요합니다.",
  "v1Editor.alertInvalidYoutubeUrl":
    "올바른 유튜브 URL을 입력해주세요.\n\n지원 형식:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID",

  // Toolbar button titles
  "v1Editor.undo": "실행 취소",
  "v1Editor.redo": "다시 실행",
  "v1Editor.bold": "굵게",
  "v1Editor.italic": "기울임",
  "v1Editor.underline": "밑줄",
  "v1Editor.strikethrough": "취소선",
  "v1Editor.fontColor": "글꼴 색상",
  "v1Editor.backgroundColor": "배경 색상",
  "v1Editor.list": "목록",
  "v1Editor.orderedList": "번호 목록",
  "v1Editor.hr": "구분선",
  "v1Editor.insertTable": "표 삽입",
  "v1Editor.link": "링크",
  "v1Editor.image": "이미지",
  "v1Editor.youtube": "유튜브",
  "v1Editor.clearFormat": "서식 지우기",
  "v1Editor.switchToEditor": "에디터로 전환",
  "v1Editor.viewHtmlCode": "HTML 코드보기",

  // Table grid selector
  "v1Editor.tableGridSize": "{rows} × {cols} 표",
  "v1Editor.tableSelectSize": "표 크기 선택",

  // Link dropdown
  "v1Editor.urlLabel": "URL",
  "v1Editor.openInNewWindow": "새 창에서 열기",
  "v1Editor.openInCurrentWindow": "현재 창에서 열기",
  "v1Editor.cancel": "취소",
  "v1Editor.insert": "삽입",

  // Image / YouTube dropdown
  "v1Editor.fileUpload": "파일 업로드",
  "v1Editor.urlInput": "URL 입력",
  "v1Editor.selectFile": "파일 선택",
  "v1Editor.imagePreviewAlt": "Preview",
  "v1Editor.sizeLabel": "크기",
  "v1Editor.sizeOriginal": "원본",
  "v1Editor.alignLabel": "정렬",
  "v1Editor.altTextLabel": "대체 텍스트",
  "v1Editor.imageDescriptionPlaceholder": "이미지 설명...",
  "v1Editor.youtubeUrl": "유튜브 URL",
  "v1Editor.youtubeUrlPlaceholder": "https://www.youtube.com/watch?v=... 또는 https://youtu.be/...",

  // Edit link popup
  "v1Editor.editUrlLabel": "URL 수정",
  "v1Editor.removeLink": "링크 삭제",
  "v1Editor.apply": "적용",

  // Edit popups
  "v1Editor.editImage": "이미지 편집",
  "v1Editor.editYoutube": "유튜브 편집",
  "v1Editor.delete": "삭제",

  // Table context menu
  "v1Editor.cellsSelected": "{count}개 셀 선택됨",
  "v1Editor.cellBackgroundColor": "셀 배경색",
  "v1Editor.cellBackgroundColorCount": "셀 배경색 ({count}개)",
  "v1Editor.resetBackgroundColor": "배경색 초기화",
  "v1Editor.cellAlignLeft": "왼쪽 정렬",
  "v1Editor.cellAlignCenter": "가운데 정렬",
  "v1Editor.cellAlignRight": "오른쪽 정렬",
  "v1Editor.addRowAbove": "위에 행 추가",
  "v1Editor.addRowBelow": "아래에 행 추가",
  "v1Editor.deleteRow": "행 삭제",
  "v1Editor.addColumnLeft": "왼쪽에 열 추가",
  "v1Editor.addColumnRight": "오른쪽에 열 추가",
  "v1Editor.deleteColumn": "열 삭제",
};

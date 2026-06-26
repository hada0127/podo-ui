// Re-vendors the v1 rich-text editor (the single-responsibility decomposition on
// `origin/dev`: react/atom/editor/{index,types,utils,constants} + hooks/*) into
// packages/editor/src/vendor/v1-editor/. Mirrors vendor-v1-css.mjs's approach:
// pulls source straight from git so it's reproducible. Adaptations vs source:
//   - the editor.module.scss CSS-module import becomes an identity `styles`
//     proxy (styles.x -> 'x'), matching the scoped plain-class v1 CSS under
//     `.podo-v1-stage` in v1-components.generated.css;
//   - relative imports get explicit .js extensions (NodeNext/ESM);
//   - each file gets @ts-nocheck + eslint-disable (vendored verbatim, not linted).
// Run: node packages/editor/scripts/vendor-v1-editor.mjs   (from the repo root)
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REF = "origin/dev";
const SRC = "react/atom/editor";
const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "..", "src", "vendor", "v1-editor");

// types/utils/constants first, then hooks, then the component that wires them.
const FILES = [
  "types.ts",
  "utils.ts",
  "constants.ts",
  "hooks/useSelectionManager.ts",
  "hooks/useEditorHistory.ts",
  "hooks/useCodeView.ts",
  "hooks/useTextStyle.ts",
  "hooks/useLinkEditor.ts",
  "hooks/useImageEditor.ts",
  "hooks/useYoutubeEditor.ts",
  "hooks/useTableEditor.ts",
  "index.tsx",
];

const STYLES_PROXY = `const __PARA_KEYS = ['p1','p2','p3','p4','p5','p1_semibold','p2_semibold','p3_semibold','p4_semibold','p5_semibold'];
// Identity style map: styles.x -> 'x' (matches the scoped plain-class v1 CSS).
// ownKeys/getOwnPropertyDescriptor expose paragraph-style keys so the toolbar's
// Object.keys(styles) paragraph detection still works.
const styles = new Proxy({}, {
  get: (_t, key) => (typeof key === 'string' ? key : ''),
  has: () => true,
  ownKeys: () => __PARA_KEYS,
  getOwnPropertyDescriptor: (_t, key) => ({ enumerable: true, configurable: true, value: typeof key === 'string' ? key : '' }),
});`;

// --- i18n: the dev source hard-codes Korean. Re-point the visible toolbar UI at
// the app's locale via t('v1Editor.X') (keys in i18n/messages/v1Editor.ts) so the
// editor follows the en/ko toggle. Toolbar button titles + the paragraph/align
// dropdown labels are covered here; interaction-only dialog/alert strings are not
// yet ported. ---
const TITLE_KEYS = {
  "실행 취소": "undo",
  "다시 실행": "redo",
  "문단 형식": "paraFormat",
  굵게: "bold",
  기울임: "italic",
  밑줄: "underline",
  취소선: "strikethrough",
  "글꼴 색상": "fontColor",
  "배경 색상": "backgroundColor",
  목록: "list",
  "번호 목록": "orderedList",
  구분선: "hr",
  "표 삽입": "insertTable",
  링크: "link",
  이미지: "image",
  유튜브: "youtube",
  "서식 지우기": "clearFormat",
  "HTML 코드보기": "viewHtmlCode",
  "에디터로 전환": "switchToEditor",
};
// Korean constants labels -> i18n keys (text-align + paragraph dropdowns; the
// `P1`..`P5` labels stay literal and t() just falls back to them).
const LABEL_KEYS = {
  "왼쪽 정렬": "alignLeft",
  "가운데 정렬": "alignCenter",
  "오른쪽 정렬": "alignRight",
  "제목 1": "paraH1",
  "제목 2": "paraH2",
  "제목 3": "paraH3",
  본문: "paraBody",
};

function i18nConstants(src) {
  for (const [ko, key] of Object.entries(LABEL_KEYS)) {
    src = src.replaceAll(`label: '${ko}'`, `label: 'v1Editor.${key}'`);
  }
  return src;
}

function i18nIndex(src) {
  // import useT (../../ — index.tsx is one level deeper than the old monolith)
  src = src.replace(
    /(import { useTableEditor } from '\.\/hooks\/useTableEditor\.js';\n)/,
    `$1import { useT } from '../../i18n/context.js';\n`
  );
  // `const t = useT()` at the top of the component body (before the first hook call)
  src = src.replace(/(\n {2}const textStyle = useTextStyle\()/, "\n  const t = useT();\n$1");
  // Toolbar button titles: title="ko" -> title={t('v1Editor.key')}
  for (const [ko, key] of Object.entries(TITLE_KEYS)) {
    src = src.replaceAll(`title="${ko}"`, `title={t('v1Editor.${key}')}`);
  }
  // Paragraph/align option labels now hold i18n keys -> translate at render.
  src = src.replaceAll("{option.label}", "{t(option.label)}");
  src = src.replaceAll("?.label || '정렬'", "?.label || 'v1Editor.alignLabel'");
  // The align trigger reads ...find(...)?.label (now a key) -> wrap with t().
  src = src.replace(
    /title=\{(alignOptions\.find\(opt => opt\.value === textStyle\.currentAlign\)\?\.label \|\| 'v1Editor\.alignLabel')\}/,
    "title={t($1)}"
  );
  // The (always-visible) paragraph trigger shows the current style's label.
  src = src.replace(
    /\{(paragraphOptions\.find\(opt => opt\.value === textStyle\.currentParagraphStyle\)\?\.label) \|\| '문단 형식'\}/,
    "{t($1 || 'v1Editor.paraFormat')}"
  );
  // Code-view toggle button title is a ternary, not a plain title="...".
  src = src.replace(
    /title=\{codeView\.isCodeView \? "에디터로 전환" : "HTML 코드보기"\}/,
    `title={codeView.isCodeView ? t('v1Editor.switchToEditor') : t('v1Editor.viewHtmlCode')}`
  );
  return src;
}

// Behavior fixes for regressions the dev refactor introduced vs the main monolith.
function patchIndexRegressions(src) {
  // Image selection: main detected clicks on a bare <img> (target.tagName ===
  // 'IMG'); the dev refactor narrowed this to target.closest('.image-wrapper'),
  // but insertImage drops a bare <img> (no .image-wrapper until handleImageClick
  // runs), so a freshly-inserted image could never be selected/resized. Restore
  // the bare-<img> path; handleImageClick wraps it on first click.
  const before = `    // 이미지 클릭 처리
    const imageWrapper = target.closest('.image-wrapper') as HTMLElement;
    if (imageWrapper && editorRef.current?.contains(imageWrapper)) {
      e.preventDefault();
      const img = imageWrapper.querySelector('img') as HTMLImageElement;
      if (img) {
        imageEditor.handleImageClick(img);
      }
      return;
    }`;
  const after = `    // 이미지 클릭 처리: 갓 삽입된 bare <img> 또는 이미 선택된(.image-wrapper) 이미지.
    // (dev 리팩터가 main 의 target.tagName === 'IMG' 감지를 .image-wrapper 한정으로 바꿔,
    // 래핑 전인 삽입 직후 이미지를 선택할 수 없던 회귀를 복구. 이미 래핑됐으면 재래핑 안 함.)
    const imageWrapper = target.closest('.image-wrapper') as HTMLElement;
    const bareImg =
      !imageWrapper && target.tagName === 'IMG' ? (target as HTMLImageElement) : null;
    if ((imageWrapper || bareImg) && editorRef.current?.contains(target)) {
      e.preventDefault();
      if (bareImg) {
        imageEditor.handleImageClick(bareImg);
      }
      return;
    }`;
  if (!src.includes(before)) {
    throw new Error("patchIndexRegressions: image-click block not found — dev source changed");
  }
  src = src.replace(before, after);

  // Image EDIT popup (shown on image select) used dead class names
  // (imageEditPopup/imageEditContent/imageEditRow/imageEditActions have no CSS)
  // plus editor-content-relative absolute positioning whose offset parent is the
  // toolbar-inclusive .editor — so it rendered unstyled and overlapping the image.
  // The youtube edit popup uses the styled imageDropdown/imageOptions/
  // imageOptionRow/imageActions classes with fixed/viewport positioning; match it.
  // (dev source bug: youtube's popup was modernized, the image popup was left behind.)
  const imgPopBefore = `        const rect = wrapper.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();
        if (!editorRect) return null;

        return (
          <div
            className={styles.imageEditPopup}
            style={{
              position: 'absolute',
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left
            }}
          >
            <div className={styles.imageEditContent}>`;
  const imgPopAfter = `        const rect = wrapper.getBoundingClientRect();
        const popupHeight = 300;
        let topPosition = rect.bottom + 10;
        if (topPosition + popupHeight > window.innerHeight) {
          topPosition = Math.max(10, rect.top - popupHeight - 10);
        }

        return (
          <div
            className={styles.imageDropdown}
            style={{
              position: 'fixed',
              top: topPosition,
              left: Math.max(10, Math.min(rect.left + rect.width / 2 - 180, window.innerWidth - 370)),
              zIndex: 9999,
              minWidth: '360px',
              maxWidth: '90%'
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>이미지 편집</h3>
            <div className={styles.imageOptions}>`;
  if (!src.includes(imgPopBefore)) {
    throw new Error("patchIndexRegressions: image edit popup block not found — dev source changed");
  }
  src = src.replace(imgPopBefore, imgPopAfter);
  src = src.replaceAll("styles.imageEditRow", "styles.imageOptionRow");
  src = src.replaceAll("styles.imageEditActions", "styles.imageActions");

  return src;
}

rmSync(OUT, { recursive: true, force: true });

for (const f of FILES) {
  let src = execSync(`git show ${REF}:${SRC}/${f}`, { encoding: "utf8" });
  // Add explicit .js to extensionless relative imports (won't touch *.scss, which
  // has a dot before the quote and is replaced separately).
  src = src.replace(/from '(\.\.?\/[a-zA-Z0-9/_-]+)'/g, "from '$1.js'");
  // Swap the CSS-module import for the identity proxy (index.tsx only).
  src = src.replace(/import styles from '\.\.\/editor\.module\.scss';/, STYLES_PROXY);
  if (f === "constants.ts") src = i18nConstants(src);
  if (f === "index.tsx") src = patchIndexRegressions(i18nIndex(src));
  const header = `// @ts-nocheck\n/* eslint-disable */\n// VENDORED from ${REF} ${SRC}/${f} — do not hand-edit; re-vendor via packages/editor/scripts/vendor-v1-editor.mjs.\n`;
  const dest = join(OUT, f);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, header + src);
  globalThis.console.log("vendored", f);
}
globalThis.console.log(`Done: ${FILES.length} files -> src/vendor/v1-editor/`);

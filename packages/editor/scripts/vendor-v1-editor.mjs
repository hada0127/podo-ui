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

rmSync(OUT, { recursive: true, force: true });

for (const f of FILES) {
  let src = execSync(`git show ${REF}:${SRC}/${f}`, { encoding: "utf8" });
  // Add explicit .js to extensionless relative imports (won't touch *.scss, which
  // has a dot before the quote and is replaced separately).
  src = src.replace(/from '(\.\.?\/[a-zA-Z0-9/_-]+)'/g, "from '$1.js'");
  // Swap the CSS-module import for the identity proxy (index.tsx only).
  src = src.replace(/import styles from '\.\.\/editor\.module\.scss';/, STYLES_PROXY);
  const header = `// @ts-nocheck\n/* eslint-disable */\n// VENDORED from ${REF} ${SRC}/${f} — do not hand-edit; re-vendor via packages/editor/scripts/vendor-v1-editor.mjs.\n`;
  const dest = join(OUT, f);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, header + src);
  globalThis.console.log("vendored", f);
}
globalThis.console.log(`Done: ${FILES.length} files -> src/vendor/v1-editor/`);

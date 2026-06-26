// Vendors the v1 (main branch) component SCSS into a single scoped CSS file the
// editor loads to render component previews with the REAL v1 styling. Every v1
// rule is nested under `.podo-v1-stage` so it cannot leak onto the editor chrome.
//
// Reproducible: it pulls the SCSS straight from `git show main:<path>`, so the
// output is derived from source. Re-run with `pnpm --filter @podo/editor gen:v1-css`.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const outFile = resolve(here, "..", "src", "v1-components.generated.css");

// Global element/class component styles (plain selectors like `button`, `.chip`).
const GLOBAL_PARTIALS = [
  "scss/button/layout",
  "scss/button/class",
  "scss/atom/chip",
  "scss/form/checkbox-radio",
  "scss/form/file",
  "scss/form/input",
  "scss/form/textarea",
  "scss/form/select",
  "scss/form/toggle",
  "scss/form/label",
  "scss/molecule/tab",
  "scss/molecule/table",
  "scss/molecule/pagination",
  "scss/molecule/toast",
];

// React CSS-module styles (local class names like `.editor`, `.toolbar`). We
// compile them as plain classes and render markup with those exact names.
const MODULE_PARTIALS = [
  "react/atom/avatar.module",
  "react/atom/tooltip.module",
  "react/atom/editor.module",
  "react/atom/input.module",
  "react/atom/textarea.module",
  "react/molecule/datepicker.module",
  "react/molecule/field.module",
  // Pagination is module-only on v1 (the global scss/molecule/pagination is
  // empty), so without this the .pageButton / .active / .pageButtonPlaceholder
  // classes the component renders get no styling and the preview looks broken.
  "react/molecule/pagination.module",
];

// v1 components assume the global reset (list-style:none, margin/padding:0,
// a{text-decoration:none}, etc.). Scoped under `.podo-v1-stage` it gives previews
// the same baseline without touching the editor chrome.
const RESET_PARTIAL = "scss/reset";

// Files we read from main and stage on disk so @use/@import relative paths resolve.
const SCSS_PATHS = [
  RESET_PARTIAL,
  "mixin", // repo-root mixin.scss that react modules @use '../../mixin'
  "scss/color/function",
  "scss/color/class",
  "scss/color/theme",
  "scss/layout/device",
  "scss/layout/spacing",
  "scss/layout/radius",
  "scss/layout/border",
  "scss/layout/bg-elevation",
  "scss/layout/hide",
  "scss/typo/font-family",
  "scss/typo/font-size",
  "scss/typo/mixin",
  "scss/icon/function",
  "scss/icon/icon-name",
  ...GLOBAL_PARTIALS,
  ...MODULE_PARTIALS,
];

// The editor JS is vendored from origin/dev (vendor-v1-editor.mjs). Pull its CSS
// from the same ref so the dropdowns/edit popups (dev positions them absolute
// under their trigger; main used position: fixed) match the markup. Everything
// else stays on main. Keyed by the full `<path>.scss` gitShow receives.
const REF_OVERRIDES = {
  "react/atom/editor.module.scss": "origin/dev",
};

function gitShow(path) {
  const ref = REF_OVERRIDES[path] ?? "main";
  return execFileSync("git", ["show", `${ref}:${path}`], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function gitShowBuffer(path) {
  return execFileSync("git", ["show", `main:${path}`], {
    cwd: repoRoot,
    maxBuffer: 64 * 1024 * 1024,
  });
}

// Strip CSS-modules-only syntax so Dart Sass emits plain class selectors.
function stripModuleSyntax(scss) {
  return scss
    .replace(/:global\s*\(\s*([^)]*?)\s*\)/g, "$1")
    .replace(/:local\s*\(\s*([^)]*?)\s*\)/g, "$1")
    .replace(/&?:global\b/g, "&")
    .replace(/&?:local\b/g, "&");
}

const work = mkdtempSync(join(tmpdir(), "podo-v1-css-"));
try {
  for (const path of SCSS_PATHS) {
    const file = `${path}.scss`;
    let contents = gitShow(file);
    if (path.endsWith(".module")) {
      contents = stripModuleSyntax(contents);
    }
    const dest = join(work, file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, contents);
  }

  // Inline the v1 icon webfont as a base64 data-URL so `<i class="icon-*">` glyphs
  // render in the editor without a separate font asset request.
  const woffB64 = gitShowBuffer("scss/icon/font/icon.woff").toString("base64");
  const iconScss = gitShow("scss/icon/icon.scss").replace(
    /url\(['"]\.\/font\/icon\.woff['"]\)/,
    `url('data:font/woff;base64,${woffB64}')`
  );
  const iconDest = join(work, "scss/icon/icon.scss");
  mkdirSync(dirname(iconDest), { recursive: true });
  writeFileSync(iconDest, iconScss);

  // `@use` the theme so :root --color-* vars exist globally (harmless: the editor
  // chrome uses inline styles, not these vars). `@use` the icon module at top level
  // so its @font-face is valid (font-face cannot be nested) and the icon glyph
  // classes are available. Component rules are nested under `.podo-v1-stage` via
  // `@import`, which scopes their bare selectors.
  const wrapper = [
    `@use 'scss/color/theme';`,
    `@use 'scss/icon/icon';`,
    `.podo-v1-stage {`,
    ...[RESET_PARTIAL, ...GLOBAL_PARTIALS, ...MODULE_PARTIALS].map((p) => `  @import '${p}';`),
    `}`,
    "",
  ].join("\n");
  const wrapperPath = join(work, "wrapper.scss");
  writeFileSync(wrapperPath, wrapper);

  const result = sass.compile(wrapperPath, {
    loadPaths: [work],
    style: "expanded",
    silenceDeprecations: ["import", "global-builtin", "color-functions", "mixed-decls"],
  });

  const header = `/* GENERATED by scripts/vendor-v1-css.mjs from main-branch v1 SCSS. Do not edit. */\n`;
  // v2-only preview supplement (NOT present in v1): v1 declares a button `loading`
  // prop and a RadioGroup `vertical` prop but ships no CSS for either — no
  // icon-loading glyph / @keyframes, and no `.radio-group` rules. These rules let
  // the editor preview render those states meaningfully. Appended after the
  // compiled v1 CSS (not added to the SCSS import) so they stay clearly v2-only
  // and survive re-vendoring from main.
  const supplement = [
    "",
    "/* --- v2 preview supplement (not in v1; see scripts/vendor-v1-css.mjs) --- */",
    "@keyframes podo-v1-spin { to { transform: rotate(360deg); } }",
    ".podo-v1-stage .icon-loading::before {",
    '  content: "";',
    "  display: inline-block;",
    "  box-sizing: border-box;",
    "  width: 1em;",
    "  height: 1em;",
    "  border: 2px solid currentColor;",
    "  border-right-color: transparent;",
    "  border-radius: 50%;",
    "  animation: podo-v1-spin 0.6s linear infinite;",
    "  vertical-align: -0.125em;",
    "}",
    ".podo-v1-stage .radio-group { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }",
    ".podo-v1-stage .radio-group.vertical { flex-direction: column; align-items: flex-start; }",
    "",
  ].join("\n");
  writeFileSync(outFile, header + result.css + "\n" + supplement);
  globalThis.console.log(`Wrote ${outFile} (${(result.css.length / 1024).toFixed(1)} KB)`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

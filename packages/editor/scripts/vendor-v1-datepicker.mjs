// Re-vendors the v1 datepicker (main:react/molecule/datepicker.tsx) into
// packages/editor/src/vendor/v1-datepicker.tsx. Reproducible: pulls the source
// straight from git. Adaptations vs source:
//   - the datepicker.module.scss CSS-module import becomes an identity `styles`
//     proxy (styles.x -> 'x'), matching the scoped plain-class v1 CSS under
//     `.podo-v1-stage` in v1-components.generated.css;
//   - a `previewOpen` prop forces the dropdown open and never lets it close
//     (outside-click or selection) so the component editor can show AND design
//     every popup part — calendar, time list, quick-select, actions — at once;
//   - @ts-nocheck + eslint-disable (vendored verbatim, not linted).
// Run: node packages/editor/scripts/vendor-v1-datepicker.mjs   (from the repo root)
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "..", "src", "vendor", "v1-datepicker.tsx");

let src = execFileSync("git", ["show", "main:react/molecule/datepicker.tsx"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

// CSS-module import -> identity proxy.
src = src.replace(
  /import styles from '\.\/datepicker\.module\.scss';/,
  "const styles: Record<string, string> = new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : '') });"
);

// previewOpen: a preview-only prop. Add it to the props, start the calendar
// dropdown open, and rewrite every "close" (setSelectingPart(null)) so it re-opens
// instead — outside-clicks (e.g. the design panel) and selections then leave the
// calendar designable. Only date/datetime have a calendar dropdown (time/hour put
// the time picker inline in the input via native selects), so gate the forced-open
// on the type to avoid showing a spurious calendar for time-only pickers. With
// previewOpen=false the behavior is identical to source.
const OPEN_EXPR = "previewOpen && (type === 'date' || type === 'datetime') ? 'date' : null";
// Declare the prop so callers (type-checked previews.tsx) can pass it.
src = src.replace(
  "export interface DatePickerProps {",
  "export interface DatePickerProps {\n  /** Preview-only: force the dropdown open so every popup part is designable. */\n  previewOpen?: boolean;"
);

const destructureAnchor = "\n  onReset,\n}) => {";
if (!src.includes(destructureAnchor)) {
  throw new Error("vendor-v1-datepicker: destructure anchor not found — re-check main source");
}
src = src.replace(destructureAnchor, "\n  onReset,\n  previewOpen = false,\n}) => {");

const stateAnchor = "const [selectingPart, setSelectingPart] = useState<SelectingPart>(null);";
if (!src.includes(stateAnchor)) {
  throw new Error("vendor-v1-datepicker: selectingPart state anchor not found");
}
src = src.replace(
  stateAnchor,
  `const [selectingPart, setSelectingPart] = useState<SelectingPart>(${OPEN_EXPR});`
);
src = src.replaceAll("setSelectingPart(null)", `setSelectingPart(${OPEN_EXPR})`);

const header =
  "// VENDORED from main react/molecule/datepicker.tsx via packages/editor/scripts/vendor-v1-datepicker.mjs.\n" +
  "// Adaptations: styles CSS-module -> identity proxy; a `previewOpen` prop forces the\n" +
  "// dropdown open + ignores outside-click/selection so the component editor can show\n" +
  "// and design every popup part at once. Do not hand-edit; re-run the script.\n" +
  "// @ts-nocheck\n/* eslint-disable */\n";
writeFileSync(OUT, header + src);
globalThis.console.log("vendored v1-datepicker.tsx");

# Legacy Component Fixture Migration

P3 migrates the v1 `public/ai/components` catalog into editable v2 component specs for the
editor. These fixtures are intentionally minimal JSON specs: they preserve catalog identity,
category mapping, primary props, variants, states, anatomy, examples, and target availability so the
editor can list, search, select, preview, and edit the components.

## Migrated Fixtures

| v1 file               | v2 fixture id    | Status   | Notes                                                                                                                  |
| --------------------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `avatar.json`         | `avatar`         | migrated | Preserves type, size, activity ring, icon, image, text, and click props.                                               |
| `button.json`         | `button`         | migrated | Full v1 theme, variant, size, state, alignment, and token matrix is covered by P2.                                     |
| `checkbox-radio.json` | `checkbox-radio` | migrated | Checkbox, Radio, and Radio.Group APIs are represented in one grouped fixture.                                          |
| `chip.json`           | `chip`           | migrated | Theme, type, size, round, icon, and delete affordance are preserved.                                                   |
| `datepicker.json`     | `datepicker`     | migrated | Mode, type, time/date limits, quick select, portal, and direction props are preserved.                                 |
| `doc-tabs.json`       | `doc-tabs`       | migrated | v1 `docs` category is mapped to v2 `utility` because v2 schema has no `docs` category.                                 |
| `editor.json`         | `editor`         | migrated | Rich text editor sizing, validation, placeholder, toolbar, and resize props are preserved.                             |
| `field.json`          | `field`          | migrated | Label, helper, error, child control, validation, value, class callback, and required props are preserved.              |
| `file.json`           | `file`           | migrated | Accept, multiple, disabled, and change handler props are preserved.                                                    |
| `input.json`          | `input`          | migrated | Value, validator, icon, unit, className, normalized `restProps`, and common input state props are preserved.           |
| `label.json`          | `label`          | migrated | Size, semibold, required, disabled, and `htmlFor` props are preserved.                                                 |
| `pagination.json`     | `pagination`     | migrated | Current/total page, visible page window, icons, and page-change handler are preserved.                                 |
| `select.json`         | `select`         | migrated | Value, options, placeholder, disabled, icon class, and change handler are preserved.                                   |
| `tab.json`            | `tab`            | migrated | Items, active/default keys, fill behavior, and normalized `onChange` prop are preserved.                               |
| `table.json`          | `table`          | migrated | Columns, data source, row key, list/border/fill variants, and row click are preserved.                                 |
| `textarea.json`       | `textarea`       | migrated | Value, validator, className, placeholder, disabled, change handler, and normalized `restProps` are preserved.          |
| `toast.json`          | `toast`          | migrated | Provider child slot, toast identity/message/header, theme, position, duration, width, and close handler are preserved. |
| `toggle.json`         | `toggle`         | migrated | Checked, label, disabled, and change handler props are preserved.                                                      |
| `tooltip.json`        | `tooltip`        | migrated | Children, rich content, variant, all v1 positions, offset, visibility, portal, and max width are preserved.            |

No v1 component files are intentionally omitted from the P3 fixture catalog.

## Deferred Scope

P3 does not claim runtime behavior parity for every component renderer. Complex behaviors such as
calendar date math, rich text editing, toast queue management, tab hash synchronization, table data
rendering, and file picker integration remain renderer or behavior-module work. The P3 fixtures only
make those components visible and editable in the v2 JSON-spec-first editor path.

The following v1 schema details are normalized for v2 validation:

- v1 `doc-tabs` category `docs` is stored as v2 `utility`.
- v1 rest props such as `...rest` are stored as `restProps`.
- v1 prop typo/alternate names such as `onChange/onchange` are stored as `onChange`.
- Grouped component APIs such as Checkbox, Radio, Radio.Group, ToastProvider, and Toast are
  represented as one component fixture when they came from one v1 catalog JSON file.

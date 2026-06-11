# Update And Migration Guide

Podo updates are designed to preserve project overrides under `.podo`.

## Dry Run

Always start with a dry run.

```sh
podo update --dry-run --to 2.1.0
```

The report explains:

- migration version range
- operations that can be applied automatically
- conflicts between local overrides and new defaults
- manual follow-up notes

## Explicit Manifest

```sh
podo update --dry-run --manifest .podo/migrations/2.1.0.json
```

Migration manifests include `from`, `to`, `operations`, `risk`, and `notes`. Operations include JSON Patch plus Podo custom operations such as `renameToken`, `moveComponentProp`, and `removeDeprecatedToken`.

## Conflict Handling

Conflicts block `podo migrate`. Typical conflicts:

- a local token override edits the same path as a package migration
- a component prop moved while a project added a different local prop with the destination name
- an icon codepoint changed without a matching lock update

Resolve conflicts by editing `.podo` JSON or by adding an explicit project migration manifest.

## Apply

```sh
podo migrate --manifest .podo/migrations/2.1.0.json
```

`podo migrate` writes only `.podo` specs and `.podo/lock.json`. After migration, run:

```sh
podo validate
podo build --dry-run
podo build
```

## Rollback

Use git as the primary rollback path:

```sh
git diff .podo
git restore --source=HEAD -- .podo
```

If a generated output changed unexpectedly, remove the generated outDir and rerun `podo build` from the reviewed `.podo` specs.

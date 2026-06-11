# Legacy Grid Compatibility

Podo v2 keeps the v1 grid system as-is for compatibility. Do not redesign it as JSON tokens in the MVP.

## Source Contract From v1

The v1 grid source is `main:scss/layout/grid.scss`.

Required behavior:

- PC: 12 columns
- Tablet: 6 columns
- Mobile: 4 columns
- `.grid` sets `display: grid`
- `.grid` uses 24px gap/padding on PC (`s(6)`)
- `.grid` uses 16px gap/padding on tablet/mobile (`s(5)`)
- `.grid.grid-fix-{2..6}` sets fixed repeated columns
- direct child `.w-{1..12}` spans columns
- direct child `.w-full` spans all available columns per breakpoint
- fraction helpers `.w-{n}_{d}` exist for denominators 2 through 6
- non-grid direct child `.w-{1..12}` maps to percentage widths
- `.w-{0..5000}px` fixed pixel utilities exist

## v2 Rule

Grid is a compatibility layer, not a new token-driven layout engine. Class names, breakpoints, and generated helper ranges must not change without a breaking migration.

The implementation may be emitted as CSS or SCSS, but the observable class behavior must match v1.

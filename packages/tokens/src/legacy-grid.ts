export interface LegacyGridOptions {
  pixelMax?: number;
}

export const legacyGridContract = {
  breakpoints: {
    pc: { minWidth: "1280px", columns: 12, gap: "24px", paddingInline: "24px" },
    tablet: {
      minWidth: "768px",
      maxWidth: "1279px",
      columns: 6,
      gap: "16px",
      paddingInline: "16px",
    },
    mobile: { maxWidth: "767px", columns: 4, gap: "16px", paddingInline: "16px" },
  },
  fixedColumns: { min: 2, max: 6 },
  spanColumns: { min: 1, max: 12 },
  pixelWidth: { min: 0, max: 5000 },
} as const;

export function emitLegacyGridScss(): string {
  // Keep the source body equivalent to main:scss/layout/grid.scss.
  return `@use './spacing' as *;
@use './device' as *;
$grid-pc: 12;
$grid-tb: 6;
$grid-mo: 4;
.grid {
  display: grid;
  grid-template-columns: repeat($grid-pc, 1fr);
  grid-gap: s(6);
  padding: 0 s(6) 0 s(6);

  @include tb {
    grid-template-columns: repeat($grid-tb, 1fr);
    grid-gap: s(5);
    padding: 0 s(5) 0 s(5);
  }
  @include mo {
    grid-template-columns: repeat($grid-mo, 1fr);
    grid-gap: s(5);
    padding: 0 s(5) 0 s(5);
  }

  @for $i from 2 through 6 {
    &.grid-fix-#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
    @for $j from 1 through $i {
      > .w-#{$j}_#{$i} {
        grid-column: span #{$j};
      }
    }
  }
  @for $i from 1 through $grid-pc {
    > .w-#{$i} {
      grid-column: span #{$i};
    }
  }

  > .w-full {
    grid-column: span $grid-pc;
    @include tb {
      grid-column: span $grid-tb;
    }
    @include mo {
      grid-column: span $grid-mo;
    }
  }
}
*:not(.grid) {
  @for $i from 1 through $grid-pc {
    > .w-#{$i} {
      width: calc(#{$i}/ 12 * 100%);
    }
  }
  > .w-full {
    width: 100%;
  }
}
* {
  @for $i from 0 through 5000 {
    &.w-#{$i}px {
      width: #{$i} + 'px';
    }
  }
}
`;
}

export function emitLegacyGridCss(options: LegacyGridOptions = {}): string {
  const pixelMax = options.pixelMax ?? legacyGridContract.pixelWidth.max;
  const lines: string[] = [
    ".grid {",
    "  display: grid;",
    "  grid-template-columns: repeat(12, 1fr);",
    "  grid-gap: 24px;",
    "  padding: 0 24px 0 24px;",
    "}",
    "",
    "@media screen and (min-width: 768px) and (max-width: 1279px) {",
    "  .grid {",
    "    grid-template-columns: repeat(6, 1fr);",
    "    grid-gap: 16px;",
    "    padding: 0 16px 0 16px;",
    "  }",
    "}",
    "",
    "@media screen and (max-width: 767px) {",
    "  .grid {",
    "    grid-template-columns: repeat(4, 1fr);",
    "    grid-gap: 16px;",
    "    padding: 0 16px 0 16px;",
    "  }",
    "}",
    "",
  ];

  for (let denominator = 2; denominator <= 6; denominator += 1) {
    lines.push(
      `.grid.grid-fix-${denominator} {`,
      `  grid-template-columns: repeat(${denominator}, 1fr);`,
      "}"
    );
    for (let numerator = 1; numerator <= denominator; numerator += 1) {
      lines.push(
        `.grid > .w-${numerator}_${denominator} {`,
        `  grid-column: span ${numerator};`,
        "}"
      );
    }
  }

  for (let span = 1; span <= 12; span += 1) {
    lines.push(`.grid > .w-${span} {`, `  grid-column: span ${span};`, "}");
  }

  lines.push(
    ".grid > .w-full {",
    "  grid-column: span 12;",
    "}",
    "@media screen and (min-width: 768px) and (max-width: 1279px) {",
    "  .grid > .w-full {",
    "    grid-column: span 6;",
    "  }",
    "}",
    "@media screen and (max-width: 767px) {",
    "  .grid > .w-full {",
    "    grid-column: span 4;",
    "  }",
    "}"
  );

  for (let span = 1; span <= 12; span += 1) {
    lines.push(`*:not(.grid) > .w-${span} {`, `  width: calc(${span}/ 12 * 100%);`, "}");
  }
  lines.push("*:not(.grid) > .w-full {", "  width: 100%;", "}");

  for (let pixel = 0; pixel <= pixelMax; pixel += 1) {
    lines.push(`*.w-${pixel}px {`, `  width: ${pixel}px;`, "}");
  }

  return `${lines.join("\n")}\n`;
}

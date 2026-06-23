// Minimal ambient declarations for the dependency-light font toolchain. Only the
// surface this package uses is declared; both libraries ship without types.

declare module "opentype.js" {
  export interface PathCommand {
    type: "M" | "L" | "C" | "Q" | "Z";
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }

  export class Path {
    commands: PathCommand[];
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
    quadTo(x1: number, y1: number, x: number, y: number): void;
    close(): void;
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number };
    toPathData(decimalPlaces?: number): string;
  }

  export class Glyph {
    constructor(options: { name: string; unicode?: number; advanceWidth: number; path: Path });
    name: string;
    unicode?: number;
    advanceWidth: number;
    path: Path;
    getPath(x: number, y: number, fontSize: number): Path;
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number };
  }

  export class Font {
    constructor(options: {
      familyName: string;
      styleName: string;
      unitsPerEm: number;
      ascender: number;
      descender: number;
      glyphs: Glyph[];
    });
    unitsPerEm: number;
    ascender: number;
    descender: number;
    glyphs: { length: number; get(index: number): Glyph };
    toArrayBuffer(): ArrayBuffer;
  }

  export function parse(buffer: ArrayBuffer): Font;

  const opentype: {
    Path: typeof Path;
    Glyph: typeof Glyph;
    Font: typeof Font;
    parse: typeof parse;
  };
  export default opentype;
}

declare module "svgpath" {
  interface SvgPath {
    abs(): SvgPath;
    rel(): SvgPath;
    unarc(): SvgPath;
    unshort(): SvgPath;
    round(precision: number): SvgPath;
    translate(x: number, y?: number): SvgPath;
    scale(sx: number, sy?: number): SvgPath;
    matrix(matrix: number[]): SvgPath;
    transform(transform: string): SvgPath;
    toString(): string;
  }
  function svgpath(path: string): SvgPath;
  export default svgpath;
}

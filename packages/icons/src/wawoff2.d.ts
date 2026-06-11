declare module "wawoff2" {
  export function compress(input: Buffer | Uint8Array): Promise<Buffer>;
  export function decompress(input: Buffer | Uint8Array): Promise<Buffer>;

  const wawoff2: {
    compress: typeof compress;
    decompress: typeof decompress;
  };

  export default wawoff2;
}

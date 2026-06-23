import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { computeIconsHash, parseIconManifest, type IconManifest } from "@podo/spec";
import { createInMemoryAdapter } from "./in-memory-adapter.js";
import { createRepoFsAdapter } from "./node.js";
import { createStudioHttpAdapter } from "./studio-http-adapter.js";

function makeManifest(): IconManifest {
  const parsed = parseIconManifest({
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: "PodoIcons",
    icons: {
      box: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
        codepoint: "E900",
        tags: [],
      },
    },
    groups: { all: ["box"] },
    codepointLock: { box: "E900" },
  });
  return {
    ...parsed,
    fontAsset: {
      kind: "font",
      source: "embedded",
      family: "PodoIcons",
      fileName: "PodoIcons.woff2",
      format: "woff2",
      mimeType: "font/woff2",
      dataUrl: "data:font/woff2;base64,d09GMgABAAAAAAA",
    },
    fontBuild: { iconsHash: computeIconsHash(parsed), unitsPerEm: 1000, glyphCount: 2 },
  };
}

describe("icon manifest persistence", () => {
  it("omits iconManifest from in-memory context until one is provided", async () => {
    const empty = createInMemoryAdapter();
    expect("iconManifest" in (await empty.loadContext())).toBe(false);

    const seeded = createInMemoryAdapter({ iconManifest: makeManifest() });
    expect((await seeded.loadContext()).iconManifest?.fontFamily).toBe("PodoIcons");
  });

  it("saves and reloads the manifest in memory, honoring dry-run", async () => {
    const adapter = createInMemoryAdapter();
    const manifest = makeManifest();

    const dry = await adapter.saveIconManifest!(manifest, { dryRun: true });
    expect(dry).toMatchObject({ ok: true, dryRun: true });
    expect("iconManifest" in (await adapter.loadContext())).toBe(false);

    await adapter.saveIconManifest!(manifest);
    expect((await adapter.loadContext()).iconManifest?.icons.box?.codepoint).toBe("E900");
  });

  it("persists the embedded manifest to disk when a path is configured", async () => {
    const root = await mkdtemp(join(tmpdir(), "podo-icon-adapter-"));
    const iconsManifestPath = join(root, "icons.manifest.json");
    const adapter = createRepoFsAdapter({
      tokensDir: join(root, "tokens"),
      componentsDir: join(root, "components"),
      iconsManifestPath,
    });
    const manifest = makeManifest();

    await adapter.saveIconManifest!(manifest);
    const written = JSON.parse(await readFile(iconsManifestPath, "utf8")) as IconManifest;
    expect(written.fontAsset?.format).toBe("woff2");
    expect((await adapter.loadContext()).iconManifest?.fontBuild?.iconsHash).toBe(
      manifest.fontBuild?.iconsHash
    );

    const noPath = createRepoFsAdapter({
      tokensDir: join(root, "tokens"),
      componentsDir: join(root, "components"),
    });
    expect(await noPath.saveIconManifest!(manifest)).toMatchObject({ ok: true });
    expect("iconManifest" in (await noPath.loadContext())).toBe(false);
  });

  it("writes the icon manifest to the canonical .podo path over studio HTTP", async () => {
    const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
    const fetchMock = async (url: string, init?: { body?: BodyInit | null }) => {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : {};
      calls.push({ url, body });
      return { ok: true, status: 200, json: async () => ({ ok: true, path: body.path }) };
    };
    const adapter = createStudioHttpAdapter({ fetch: fetchMock });
    const manifest = makeManifest();

    const result = await adapter.saveIconManifest!(manifest);
    expect(result.ok).toBe(true);
    const put = calls.find((call) => call.url.endsWith("/api/files"));
    // Must match the single path the studio server reads/validates (no `icons.` prefix).
    expect(put?.body.path).toBe(".podo/icons/manifest.json");
    expect(put?.body.contents).toBe(`${JSON.stringify(manifest, null, 2)}\n`);
    expect(put?.body.force).toBe(true);

    calls.length = 0;
    const dry = await adapter.saveIconManifest!(manifest, { dryRun: true });
    expect(dry.dryRun).toBe(true);
    expect(calls[0]?.body.dryRun).toBe(true);
  });
});

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { startStudioServer, type StudioBuildInput } from "../src/index.js";

test("drives setup, token override, and build execution in the Studio UI", async ({ page }) => {
  const root = await mkdtemp(join(tmpdir(), "podo-studio-e2e-"));
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "studio-e2e-fixture",
        type: "module",
        dependencies: { react: "^19.0.0" },
      },
      null,
      2
    )}\n`
  );

  const buildCalls: StudioBuildInput[] = [];
  const server = await startStudioServer({
    root,
    port: 0,
    actions: {
      build: async (input) => {
        buildCalls.push(input);
        return {
          dryRun: Boolean(input.dryRun),
          skipped: false,
          hash: "playwright-studio",
          files: [
            {
              path: "src/podo/tokens.css",
              action: "create",
              preview: ":root { --podo-color-text: #243042; }",
            },
          ],
        };
      },
      validate: async () => ({ ok: true, root, issues: [] }),
    },
  });

  try {
    await page.goto(server.url);
    await expect(page.getByRole("heading", { name: "Setup" })).toBeVisible();

    await page.locator("#setupTarget").selectOption("react");
    await page.locator("#setupTheme").selectOption("dashboard");
    await page.locator("#setupDark").selectOption("true");
    await page.locator("#setupOutDir").fill("src/podo");
    await page.locator("#setupGroups").fill("navigation,marketing");
    await page.locator("#saveSetup").click();

    await expect(page.locator("#status")).toContainText("Ready");
    await expect
      .poll(() => readJson(join(root, ".podo/config.json")))
      .toMatchObject({
        build: { targets: ["react"], outDir: "src/podo" },
        darkMode: { enabled: true },
        themes: { default: "dashboard" },
      });
    await expect
      .poll(() => readJson(join(root, ".podo/icons/manifest.json")))
      .toMatchObject({
        groups: { navigation: expect.any(Array), marketing: expect.any(Array) },
      });
    expect(buildCalls).toHaveLength(1);
    expect(buildCalls[0]).toMatchObject({ target: "react", outDir: "src/podo" });

    await page.locator('[data-tab="tokens"]').click();
    await expect(page.getByRole("heading", { name: "Tokens" })).toBeVisible();
    await page.locator("#darkLightText").fill("#243042");
    await page.locator("#darkDarkText").fill("#f8fafc");
    await page.locator("#saveDarkPreview").click();

    await expect(page.locator("#status")).toContainText("Ready");
    await expect
      .poll(() => readJson(join(root, ".podo/themes/studio-overrides.tokens.json")))
      .toMatchObject({
        tokens: {
          semantic: {
            color: {
              text: { default: { $type: "color", $value: "#243042" } },
              dark: { text: { default: { $type: "color", $value: "#f8fafc" } } },
            },
          },
        },
      });

    await page.locator('[data-tab="build"]').click();
    await expect(page.getByRole("heading", { name: "Build" })).toBeVisible();
    await page.locator("#buildProject").click();

    await expect(page.locator(".mono", { hasText: "src/podo/tokens.css" })).toBeVisible();
    expect(buildCalls).toHaveLength(2);
    expect(buildCalls[1]).toMatchObject({ dryRun: false });
  } finally {
    await server.close();
  }
});

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

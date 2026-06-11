#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(root, "packages");
const failures = [];

function fail(message) {
  failures.push(message);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function assertFile(path, label) {
  const fileStat = await stat(path).catch(() => undefined);
  if (!fileStat?.isFile() || fileStat.size === 0) {
    fail(`${label} is missing or empty: ${relative(root, path)}`);
    return undefined;
  }
  return fileStat;
}

async function verifyDocs() {
  const docs = [
    ["README.md", "Podo UI v2"],
    ["CHANGELOG.md", "Changelog"],
    ["LICENSE", "MIT License"],
  ];

  for (const [path, marker] of docs) {
    const absolute = join(root, path);
    await assertFile(absolute, path);
    const contents = await readFile(absolute, "utf8").catch(() => "");
    if (!contents.includes(marker)) {
      fail(`${path} must include "${marker}".`);
    }
  }
}

function assertRootScripts(rootPackage) {
  const scripts = rootPackage.scripts ?? {};
  const prepublish = scripts.prepublishOnly ?? "";
  for (const required of [
    "pnpm check",
    "pnpm test:studio:e2e",
    "pnpm build",
    "pnpm release:verify",
    "pnpm changeset:dry-run",
  ]) {
    if (!prepublish.includes(required)) {
      fail(`prepublishOnly must include ${required}.`);
    }
  }
  for (const requiredScript of ["release:verify", "changeset:dry-run", "examples:build"]) {
    if (!scripts[requiredScript]) {
      fail(`Root package.json is missing ${requiredScript}.`);
    }
  }
}

async function verifyPackage(directory) {
  const packagePath = join(packagesRoot, directory, "package.json");
  const manifest = await readJson(packagePath);
  if (!manifest.name?.startsWith("@podo/")) {
    return;
  }

  const label = `${manifest.name} package.json`;
  if (manifest.type !== "module") {
    fail(`${label} must set type: module.`);
  }
  if (manifest.license !== "MIT") {
    fail(`${label} must use MIT license.`);
  }
  if (manifest.publishConfig?.access !== "public") {
    fail(`${label} must publish with public access.`);
  }
  if (!Array.isArray(manifest.files) || !manifest.files.includes("dist")) {
    fail(`${label} must publish an explicit files allowlist containing dist.`);
  }

  const rootExport = manifest.exports?.["."];
  if (!rootExport?.import || !rootExport?.types) {
    fail(`${label} must expose import and types entries for the root export.`);
  } else {
    await assertFile(join(packagesRoot, directory, rootExport.import), `${manifest.name} import`);
    await assertFile(join(packagesRoot, directory, rootExport.types), `${manifest.name} types`);
  }

  const distFiles = await listFiles(join(packagesRoot, directory, "dist"));
  for (const file of distFiles) {
    if (/[./](?:.+\.)?test\.(?:js|d\.ts|js\.map|d\.ts\.map)$/.test(file)) {
      fail(`${manifest.name} published dist contains test output: ${file}`);
    }
    if (file.endsWith(".tsbuildinfo")) {
      fail(`${manifest.name} published dist contains TypeScript build info: ${file}`);
    }
  }

  for (const [binName, binPath] of Object.entries(manifest.bin ?? {})) {
    const absoluteBin = join(packagesRoot, directory, binPath);
    const binStat = await assertFile(absoluteBin, `${manifest.name} bin ${binName}`);
    if (!binStat) {
      continue;
    }
    if ((binStat.mode & 0o111) === 0) {
      fail(`${manifest.name} bin ${binName} must be executable.`);
    }
    const contents = await readFile(absoluteBin, "utf8");
    if (!contents.startsWith("#!/usr/bin/env node")) {
      fail(`${manifest.name} bin ${binName} must start with a node shebang.`);
    }
  }
}

async function listFiles(directory) {
  if (!(await exists(directory))) {
    fail(`Missing dist directory: ${relative(root, directory)}`);
    return [];
  }
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolute)));
    } else {
      files.push(relative(directory, absolute));
    }
  }
  return files;
}

async function verifyMcpExecution() {
  const cliBin = join(root, "packages/cli/dist/index.js");
  const result = spawnSync(process.execPath, [cliBin, "mcp", "--dry-run"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout.includes("Would start Podo MCP")) {
    fail(`podo mcp --dry-run failed: ${result.stderr || result.stdout}`);
  }

  const mcpModule = await import(pathToFileURL(join(root, "packages/mcp/dist/index.js")).href);
  if (typeof mcpModule.createPodoMcpServer !== "function") {
    fail("@podo/mcp must export createPodoMcpServer.");
    return;
  }
  mcpModule.createPodoMcpServer({ root });
}

await verifyDocs();
assertRootScripts(await readJson(join(root, "package.json")));

const packageDirectories = await readdir(packagesRoot);
for (const directory of packageDirectories) {
  await verifyPackage(directory);
}
await verifyMcpExecution();

if (failures.length) {
  process.stderr.write("Release verification failed:\n");
  for (const failure of failures) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Release verification passed for ${packageDirectories.length} packages.\n`);

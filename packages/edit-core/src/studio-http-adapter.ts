import { PodoEditError } from "@podo/spec";
import type {
  ComponentDocument,
  IconManifest,
  PageDocument,
  TokenDocument,
  ValidationIssue,
} from "@podo/spec";
import {
  type EditContext,
  type EditorCapabilities,
  type PodoSaveAdapter,
  type SaveOptions,
  type SaveResult,
  type SaveTokenInput,
} from "./adapter.js";

type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export interface StudioHttpAdapterOptions {
  /** Base URL of the studio server. Defaults to same-origin (""). */
  baseUrl?: string;
  /** Injectable fetch (defaults to globalThis.fetch); lets tests stub the network. */
  fetch?: FetchLike;
  /** Capabilities for the installed-project host. */
  capabilities?: EditorCapabilities;
}

const DEFAULT_CAPABILITIES: EditorCapabilities = {
  pageDesign: true,
  writeMode: "overrides",
  iconEditing: true,
};

interface ApiResult {
  ok?: boolean;
  path?: string;
  contents?: string;
  error?: { message?: string };
  context?: {
    components?: Array<{ document?: ComponentDocument }>;
    pages?: PageDocument[];
    files?: Array<{ path: string; kind: string }>;
  };
}

/**
 * Browser-safe {@link PodoSaveAdapter} that persists edits through the
 * installed-project studio server's existing `/api/*` routes, so the unified
 * editor writes to `.podo` overrides and the design-system build reflects them.
 * No `node:` imports — safe to bundle into the editor UI. See report.md §5 / §9.
 */
export function createStudioHttpAdapter(options: StudioHttpAdapterOptions = {}): PodoSaveAdapter {
  const baseUrl = options.baseUrl ?? "";
  const doFetch: FetchLike = options.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const capabilities = options.capabilities ?? DEFAULT_CAPABILITIES;

  async function request(path: string, init?: RequestInit): Promise<ApiResult> {
    const response = await doFetch(`${baseUrl}${path}`, init);
    let payload: ApiResult = {};
    try {
      payload = (await response.json()) as ApiResult;
    } catch {
      payload = {};
    }
    if (!response.ok || payload.ok === false) {
      if (payload.error?.message) {
        throw new Error(payload.error.message);
      }
      throw new PodoEditError(
        "editCore.studioRequestFailed",
        `Studio request failed (${response.status}).`,
        { status: response.status }
      );
    }
    return payload;
  }

  function jsonInit(method: string, body: unknown): RequestInit {
    return {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    };
  }

  async function putFile(path: string, contents: string, opts: SaveOptions): Promise<SaveResult> {
    // Editor writes intentionally overwrite their own .podo override files, so
    // default force to true (the studio rejects writes over existing files
    // otherwise, which would break the second save). dryRun still plans only.
    const payload = await request(
      "/api/files",
      jsonInit("PUT", { path, contents, dryRun: opts.dryRun, force: opts.force ?? true })
    );
    return { ok: true, ...(opts.dryRun ? { dryRun: true } : {}), path: payload.path ?? path };
  }

  return {
    async loadContext(): Promise<EditContext> {
      const payload = await request("/api/context", { method: "GET" });
      const components = (payload.context?.components ?? [])
        .map((entry) => entry.document)
        .filter((document): document is ComponentDocument => Boolean(document));
      // The studio context exposes resolved tokens, not raw documents, so load
      // the raw token/theme files (the same ones the CLI build scans) directly.
      const tokenFiles = (payload.context?.files ?? []).filter(
        (file) => file.kind === "token" || file.kind === "theme"
      );
      const tokenDocuments: TokenDocument[] = [];
      for (const file of tokenFiles) {
        const filePayload = await request(`/api/files?path=${encodeURIComponent(file.path)}`, {
          method: "GET",
        });
        if (filePayload.contents) {
          try {
            tokenDocuments.push(JSON.parse(filePayload.contents) as TokenDocument);
          } catch {
            // Skip files that are not valid JSON; the validation gate reports them.
          }
        }
      }
      const pages = payload.context?.pages ?? [];
      return { tokenDocuments, components, pages, capabilities };
    },
    async saveToken(input: SaveTokenInput): Promise<SaveResult> {
      await request(
        "/api/tokens/override",
        jsonInit("POST", {
          path: input.path,
          type: input.type,
          value: input.value,
          dryRun: input.dryRun,
          force: input.force,
        })
      );
      return { ok: true, ...(input.dryRun ? { dryRun: true } : {}), path: input.path };
    },
    async saveTokenDocuments(
      documents: TokenDocument[],
      opts: SaveOptions = {}
    ): Promise<SaveResult> {
      // Write each editor token document to a deterministic .podo/tokens file so
      // the CLI build (which scans .podo/tokens) reflects the edits. A single
      // document maps to the canonical editor override file.
      const results: SaveResult[] = [];
      for (let index = 0; index < documents.length; index += 1) {
        const name = documents.length === 1 ? "editor" : `editor-${index}`;
        const path = `.podo/tokens/${name}.tokens.json`;
        const contents = `${JSON.stringify(documents[index], null, 2)}\n`;
        results.push(await putFile(path, contents, opts));
      }
      return { ok: true, ...(opts.dryRun ? { dryRun: true } : {}) };
    },
    async saveComponent(component: ComponentDocument, opts: SaveOptions = {}): Promise<SaveResult> {
      const path = `.podo/components/local/${component.id}.component.json`;
      const contents = `${JSON.stringify(component, null, 2)}\n`;
      return putFile(path, contents, opts);
    },
    async savePage(page: PageDocument, opts: SaveOptions = {}): Promise<SaveResult> {
      const path = `.podo/pages/${page.id}.page.json`;
      const contents = `${JSON.stringify(page, null, 2)}\n`;
      return putFile(path, contents, opts);
    },
    async saveIconManifest(manifest: IconManifest, opts: SaveOptions = {}): Promise<SaveResult> {
      // Must match the single filename the studio server validates and reads
      // (studio/src/index.ts: loadIconManifest / validateWritableFile), the MCP
      // loader, CLI build, and migration — otherwise edits write to an orphan
      // path and silently vanish on reload.
      const path = `.podo/icons/manifest.json`;
      const contents = `${JSON.stringify(manifest, null, 2)}\n`;
      return putFile(path, contents, opts);
    },
    async validate(): Promise<ValidationIssue[]> {
      // A validation failure returns HTTP 422 WITH a report; that is a normal
      // result, not a transport error. But a real server/transport error (e.g.
      // 500 with no report) must throw rather than masquerade as "no issues".
      const response = await doFetch(`${baseUrl}/api/validate`, jsonInit("POST", {}));
      let payload: { report?: { issues?: ValidationIssue[] } } | undefined;
      try {
        payload = (await response.json()) as { report?: { issues?: ValidationIssue[] } };
      } catch {
        payload = undefined;
      }
      if (payload?.report) {
        return payload.report.issues ?? [];
      }
      if (!response.ok) {
        throw new PodoEditError(
          "editCore.studioValidateFailed",
          `Studio validate failed (${response.status}).`,
          { status: response.status }
        );
      }
      return [];
    },
    async build(opts: SaveOptions = {}) {
      return request("/api/build", jsonInit("POST", { dryRun: opts.dryRun, force: opts.force }));
    },
  };
}

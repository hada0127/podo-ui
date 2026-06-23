import type {
  ComponentDocument,
  DesignToken,
  IconManifest,
  PageDocument,
  TokenDocument,
  ValidationIssue,
} from "@podo/spec";

/**
 * Where a host persists edits. The repo host writes design-system source specs;
 * the installed-project host writes `.podo` overrides. See report.md §5.
 */
export type SaveTarget = "repo" | "overrides";

/**
 * Feature gating for a host. Page design is only available inside an installed
 * project; the in-repo development editor edits tokens and components only.
 */
export interface EditorCapabilities {
  pageDesign: boolean;
  writeMode: SaveTarget;
  iconEditing?: boolean;
  /** tldraw production license key, supplied by the installed project config. */
  tldrawLicenseKey?: string;
}

export interface EditContext {
  tokenDocuments: TokenDocument[];
  components: ComponentDocument[];
  /** Page documents (installed-project hosts with page design only). */
  pages?: PageDocument[];
  iconManifest?: IconManifest;
  capabilities: EditorCapabilities;
}

export interface SaveResult {
  ok: boolean;
  /** repo- or project-relative path that was (or would be) written. */
  path?: string;
  dryRun?: boolean;
  issues?: ValidationIssue[];
}

export interface SaveTokenInput {
  path: string;
  type: DesignToken["$type"];
  value: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface SaveOptions {
  dryRun?: boolean;
  force?: boolean;
}

/**
 * The single outbound port the editing engine depends on. Hosts inject a
 * concrete adapter (repo filesystem, studio HTTP, or in-memory) so the same UI
 * runs in every context with only the save target changing (plan.md §10).
 */
export interface PodoSaveAdapter {
  loadContext(): Promise<EditContext>;
  saveToken(input: SaveTokenInput): Promise<SaveResult>;
  saveComponent(component: ComponentDocument, options?: SaveOptions): Promise<SaveResult>;
  /** Optional: persist a page document (installed-project page design only). */
  savePage?(page: PageDocument, options?: SaveOptions): Promise<SaveResult>;
  validate(): Promise<ValidationIssue[]>;
  /**
   * Optional bulk token persistence. The editor commits whole token documents
   * at once, so hosts that prefer document-level writes (e.g. writing a full
   * `.podo/themes/*.tokens.json`) implement this; `saveToken` remains for
   * granular, single-token hosts (e.g. studio's per-token override route).
   */
  saveTokenDocuments?(documents: TokenDocument[], options?: SaveOptions): Promise<SaveResult>;
  /** Optional: remove a token at a path (hosts that support deletion). */
  deleteToken?(documentIndex: number, path: string, options?: SaveOptions): Promise<SaveResult>;
  /**
   * Optional: persist the icon manifest (icon-editing hosts only). The manifest
   * carries the always-woff2 build artifact inline (`fontAsset`), so hosts store
   * the validated JSON; they must not rebuild a divergent font.
   */
  saveIconManifest?(manifest: IconManifest, options?: SaveOptions): Promise<SaveResult>;
  /** Optional: trigger a design-system build (installed-project hosts only). */
  build?(options?: SaveOptions): Promise<unknown>;
}

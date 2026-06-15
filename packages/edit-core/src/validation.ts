import {
  collectTokenPaths,
  issue,
  parseComponentDocument,
  parseTokenDocument,
  validateComponentTokenBindings,
  type ComponentDocument,
  type TokenDocument,
  type ValidationIssue,
} from "@podo/spec";
import { mergeTokenDocuments, validateTokenBuild, type TokenSource } from "@podo/tokens";

export interface WorkspaceDocuments {
  tokenDocuments: TokenDocument[];
  components: ComponentDocument[];
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toSources(documents: TokenDocument[]): TokenSource[] {
  return documents.map((document, index) => ({
    document,
    filePath: `tokenDocuments[${index}]`,
    tier: "project" as const,
  }));
}

/**
 * The validation gate. Runs the @podo/spec parsers plus the WORKSPACE-LEVEL
 * token/binding checks the individual mutation helpers do not perform:
 *  - token references are validated against the MERGED document so legitimate
 *    cross-document references are not reported as missing, and circular
 *    references are detected on the merged graph (via @podo/tokens);
 *  - component bindings are validated against the merged token path set.
 *
 * Invalid documents are excluded from the merge so this function never throws;
 * it always returns the issue list. Codes ending in `.invalid` are blocking
 * (schema-broken state); `.missing`/`.circular`/`.duplicate` are warnings that
 * may be legitimately transient while editing. See report.md §5.
 */
export function validateWorkspace(workspace: WorkspaceDocuments): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const validTokenDocuments: TokenDocument[] = [];
  workspace.tokenDocuments.forEach((document, index) => {
    try {
      validTokenDocuments.push(parseTokenDocument(document));
    } catch (error) {
      issues.push(issue("token.schema.invalid", `tokenDocuments[${index}]`, describeError(error)));
    }
  });

  let availableTokenPaths = new Set<string>();
  try {
    const sources = toSources(validTokenDocuments);
    issues.push(...validateTokenBuild(sources));
    availableTokenPaths = new Set(collectTokenPaths(mergeTokenDocuments(sources).tokens));
  } catch (error) {
    issues.push(issue("token.workspace.invalid", "tokenDocuments", describeError(error)));
  }

  for (const component of workspace.components) {
    const componentId = component.id || "(unknown)";
    try {
      const parsed = parseComponentDocument(component);
      issues.push(...validateComponentTokenBindings(parsed, availableTokenPaths));
    } catch (error) {
      issues.push(issue("component.schema.invalid", componentId, describeError(error)));
    }
  }

  return issues;
}

/** Union of every token path available across all valid token documents (merged). */
export function collectAvailableTokenPaths(documents: TokenDocument[]): Set<string> {
  const valid: TokenDocument[] = [];
  for (const document of documents) {
    try {
      valid.push(parseTokenDocument(document));
    } catch {
      // Skip invalid documents so callers never throw.
    }
  }
  try {
    return new Set(collectTokenPaths(mergeTokenDocuments(toSources(valid)).tokens));
  } catch {
    return new Set();
  }
}

/** Issues that must block a commit (schema-broken state), as opposed to warnings. */
export function blockingIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.filter((item) => item.code.endsWith(".invalid"));
}

/** Error thrown when a mutation would commit a schema-broken workspace state. */
export class EditValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues.map((item) => item.message).join("; ") || "Validation failed.");
    this.name = "EditValidationError";
    this.issues = issues;
  }
}

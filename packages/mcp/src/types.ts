import type {
  ComponentDocument,
  IconManifest,
  PodoConfig,
  PodoLock,
  ValidationIssue,
} from "@podo/spec";
import type { ResolvedToken, ResolvedTokenBundle, TokenSource } from "@podo/tokens";

export interface McpTokenMetadata {
  roles: string[];
  description?: string;
}

export interface McpProjectContext {
  root: string;
  version: string;
  schemaVersion: string;
  config?: PodoConfig;
  lock?: PodoLock;
  tokenSources: TokenSource[];
  tokens: ResolvedToken[];
  tokenBundle?: ResolvedTokenBundle;
  tokenMetadata: Record<string, McpTokenMetadata>;
  tokenPaths: string[];
  components: ComponentDocument[];
  icons: IconManifest;
  issues: ValidationIssue[];
}

export interface McpToolContext {
  load: () => Promise<McpProjectContext>;
}

export interface ToolResponse<T = unknown> {
  ok: boolean;
  data?: T;
  issues?: ValidationIssue[];
  message?: string;
}

export interface ComponentSuggestionInput {
  id: string;
  name?: string | undefined;
  category?: ComponentDocument["category"] | undefined;
  slots?: string[] | undefined;
  props?: string[] | undefined;
}

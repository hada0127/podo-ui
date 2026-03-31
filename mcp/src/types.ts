export interface AiIndex {
  name: string;
  version: string;
  description: string;
  philosophy: string;
  install: string;
  baseUrl: string;
  documentation: string;
  repository: string;
  modules: {
    overview: string;
    components: Record<string, string>;
    systems: Record<string, string>;
  };
}

export interface Overview {
  name: string;
  tagline: string;
  documentation: string;
  repository: string;
  philosophy: { core: string; principle: string; approach: string };
  techStack: Record<string, unknown>;
  installation: Record<string, string>;
  imports: Record<string, Record<string, string>>;
  structure: Record<string, Record<string, string[] | string>>;
  themes: Record<string, Record<string, string>>;
  breakpoints: Record<string, string>;
}

export interface ComponentProp {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string;
}

export interface CssClassEntry {
  class: string;
  description: string;
}

export interface Example {
  title: string;
  code: string;
}

export interface ComponentData {
  name: string;
  category: string;
  description: string;
  documentation: string;
  import: Record<string, string>;
  props: ComponentProp[];
  cssClasses: CssClassEntry[];
  htmlUsage?: Record<string, string>;
  examples: Example[];
  related: string[];
}

export interface SystemData {
  name: string;
  description: string;
  documentation?: string;
  import: Record<string, string>;
  examples?: Example[];
  [key: string]: unknown;
}

export interface CssClassIndexEntry {
  sourceName: string;
  sourceType: "component" | "system";
  class: string;
  description: string;
}

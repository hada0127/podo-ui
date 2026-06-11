import type { ComponentDocument } from "@podo/spec";

export type PodoTarget = "web" | "react" | "hono" | "native";

export interface ComponentRegistryEntry {
  id: string;
  name: string;
  category: ComponentDocument["category"];
  spec: ComponentDocument;
  supportedTargets: PodoTarget[];
}

export interface ComponentRegistry {
  all(): ComponentRegistryEntry[];
  byId(id: string): ComponentRegistryEntry | undefined;
  byName(name: string): ComponentRegistryEntry | undefined;
  byCategory(category: ComponentDocument["category"]): ComponentRegistryEntry[];
  byTarget(target: PodoTarget): ComponentRegistryEntry[];
}

export interface RendererContext<TTokens = unknown> {
  target: PodoTarget;
  theme: string;
  colorScheme: "light" | "dark";
  tokens?: TTokens;
}

export interface RendererContract<TInput = unknown, TOutput = unknown> {
  target: PodoTarget;
  componentId: string;
  render(input: TInput, context: RendererContext): TOutput;
}

export interface PodoFieldIds {
  rootId: string;
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
}

export interface FieldA11yOptions {
  id?: string | undefined;
  describedBy?: string | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  hasDescription?: boolean | undefined;
  hasError?: boolean | undefined;
}

export interface FieldA11yResult {
  ids: PodoFieldIds;
  control: Record<string, string | boolean>;
  label: Record<string, string>;
  description: Record<string, string>;
  error: Record<string, string>;
}

export interface ButtonBehaviorInput {
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  type?: "button" | "submit" | "reset" | undefined;
}

export interface ButtonBehavior {
  disabled: boolean;
  loading: boolean;
  pressable: boolean;
  root: {
    type: "button" | "submit" | "reset";
    disabled: boolean;
    ariaDisabled?: "true";
    ariaBusy?: "true";
    tabIndex?: number;
  };
  dataState: Record<string, string>;
}

export interface InputBehaviorInput {
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
}

export interface InputBehavior {
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  controlled: boolean;
  root: Record<string, string | boolean>;
  dataState: Record<string, string>;
}

export interface FieldBehaviorInput {
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
}

export interface FieldBehavior {
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  dataState: Record<string, string>;
}

export function createComponentRegistry(specs: ComponentDocument[]): ComponentRegistry {
  const entries = specs.map(toRegistryEntry).sort((a, b) => a.id.localeCompare(b.id));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const byName = new Map(entries.map((entry) => [entry.name.toLowerCase(), entry]));

  return {
    all: () => [...entries],
    byId: (id) => byId.get(id),
    byName: (name) => byName.get(name.toLowerCase()),
    byCategory: (category) => entries.filter((entry) => entry.category === category),
    byTarget: (target) => entries.filter((entry) => entry.supportedTargets.includes(target)),
  };
}

export function createPodoId(prefix: string, seed: string | number): string {
  return `${prefix}-${String(seed)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

export function joinIds(...ids: Array<string | false | null | undefined>): string | undefined {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export function createFieldA11y(options: FieldA11yOptions = {}): FieldA11yResult {
  const rootId = options.id ?? createPodoId("podo-field", "control");
  const ids: PodoFieldIds = {
    rootId,
    controlId: `${rootId}-control`,
    labelId: `${rootId}-label`,
    descriptionId: `${rootId}-description`,
    errorId: `${rootId}-error`,
  };
  const describedBy = joinIds(
    options.describedBy,
    options.hasDescription && ids.descriptionId,
    options.invalid && options.hasError && ids.errorId
  );

  const control: Record<string, string | boolean> = {
    id: ids.controlId,
    "aria-labelledby": ids.labelId,
  };
  if (describedBy) {
    control["aria-describedby"] = describedBy;
  }
  if (options.invalid) {
    control["aria-invalid"] = "true";
  }
  if (options.required) {
    control["aria-required"] = "true";
    control.required = true;
  }

  return {
    ids,
    control,
    label: { id: ids.labelId, for: ids.controlId },
    description: { id: ids.descriptionId },
    error: { id: ids.errorId },
  };
}

export function createButtonBehavior(input: ButtonBehaviorInput = {}): ButtonBehavior {
  const disabled = Boolean(input.disabled);
  const loading = Boolean(input.loading);
  const unavailable = disabled || loading;
  const root: ButtonBehavior["root"] = {
    type: input.type ?? "button",
    disabled: unavailable,
  };
  if (disabled) {
    root.ariaDisabled = "true";
  }
  if (loading) {
    root.ariaBusy = "true";
  }
  if (unavailable) {
    root.tabIndex = -1;
  }

  return {
    disabled,
    loading,
    pressable: !unavailable,
    root,
    dataState: stateAttributes({ disabled, loading }),
  };
}

export function createInputBehavior(input: InputBehaviorInput = {}): InputBehavior {
  const disabled = Boolean(input.disabled);
  const invalid = Boolean(input.invalid);
  const required = Boolean(input.required);
  const root: Record<string, string | boolean> = {};
  if (disabled) {
    root.disabled = true;
  }
  if (invalid) {
    root["aria-invalid"] = "true";
  }
  if (required) {
    root["aria-required"] = "true";
    root.required = true;
  }

  return {
    disabled,
    invalid,
    required,
    controlled: typeof input.value === "string",
    root,
    dataState: stateAttributes({ disabled, invalid, required }),
  };
}

export function createFieldBehavior(input: FieldBehaviorInput = {}): FieldBehavior {
  const disabled = Boolean(input.disabled);
  const invalid = Boolean(input.invalid);
  const required = Boolean(input.required);

  return {
    disabled,
    invalid,
    required,
    dataState: stateAttributes({ disabled, invalid, required }),
  };
}

export function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

export function partClass(component: string, part?: string): string {
  return part ? `podo-${component}__${part}` : `podo-${component}`;
}

export function stateAttributes(states: Record<string, boolean>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(states)
      .filter(([, enabled]) => enabled)
      .map(([state]) => [`data-${state}`, "true"])
  );
}

export function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, child]) => typeof child !== "undefined")
  ) as T;
}

function toRegistryEntry(spec: ComponentDocument): ComponentRegistryEntry {
  const supportedTargets = Object.entries(spec.targets)
    .filter(([, target]) => target.supported)
    .map(([target]) => target as PodoTarget)
    .sort((a, b) => a.localeCompare(b));

  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    spec,
    supportedTargets,
  };
}

/** @jsxImportSource hono/jsx */

import { cloneElement, isValidElement } from "hono/jsx";
import type { Child } from "hono/jsx";
import type { JSX } from "hono/jsx/jsx-runtime";
import { raw } from "hono/html";
import { createButtonBehavior, createFieldA11y, createInputBehavior } from "@podo/core";

export interface HonoButtonProps {
  children: Child;
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  class?: string;
}

export interface HonoInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  class?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: string;
  "aria-required"?: string;
}

export interface HonoFieldProps {
  children: Child;
  id?: string;
  label: Child;
  description?: Child;
  error?: Child;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export interface HonoCriticalCssOptions {
  theme?: string;
  colorScheme?: "light" | "dark";
  css?: string;
}

export function Button({
  children,
  variant = "solid",
  size = "md",
  disabled,
  loading,
  type,
  class: className,
}: HonoButtonProps): JSX.Element {
  const behavior = createButtonBehavior({ disabled, loading, type });

  return (
    <button
      class={joinClass("podo-button", className)}
      type={behavior.root.type}
      disabled={behavior.root.disabled}
      aria-busy={behavior.root.ariaBusy}
      aria-disabled={behavior.root.ariaDisabled}
      tabIndex={behavior.root.tabIndex}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
    >
      {children}
    </button>
  );
}

export function Input({
  id,
  name,
  value,
  defaultValue,
  placeholder,
  invalid,
  disabled,
  required,
  class: className,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: HonoInputProps): JSX.Element {
  const behavior = createInputBehavior({ value, defaultValue, invalid, disabled, required });

  return (
    <input
      id={id}
      class={joinClass("podo-input", className)}
      name={name}
      value={value ?? defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid ?? (behavior.invalid ? "true" : undefined)}
      aria-required={ariaRequired ?? (behavior.required ? "true" : undefined)}
      data-invalid={invalid ? "true" : undefined}
    />
  );
}

export function Field({
  id = "podo-field",
  label,
  description,
  error,
  invalid,
  required,
  disabled,
  children,
}: HonoFieldProps): JSX.Element {
  const a11y = createFieldA11y({
    id,
    invalid,
    required,
    hasDescription: Boolean(description),
    hasError: Boolean(error),
  });

  return (
    <div
      class="podo-field"
      data-invalid={invalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-required={required ? "true" : undefined}
    >
      <label class="podo-field__label" id={a11y.ids.labelId} for={a11y.ids.controlId}>
        {label}
      </label>
      <div class="podo-field__control">{wireHonoControl(children, a11y.control)}</div>
      {description ? (
        <div class="podo-field__description" id={a11y.ids.descriptionId}>
          {description}
        </div>
      ) : null}
      {error ? (
        <div class="podo-field__error" id={a11y.ids.errorId}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

export function Icon({ name }: { name: string }): JSX.Element {
  return <i class={`podo-icon podo-icon-${name}`} aria-hidden="true" />;
}

export function Typography({
  as = "p",
  variant = as === "h1" ? "h1" : "body",
  children,
}: {
  as?: "span" | "p" | "h1";
  variant?: "body" | "h1";
  children: Child;
}): JSX.Element {
  const Tag = as;
  return <Tag class={`podo-text podo-text--${variant}`}>{children}</Tag>;
}

export function renderCriticalCss({
  theme = "landing",
  colorScheme = "light",
  css = "",
}: HonoCriticalCssOptions = {}): JSX.Element {
  return (
    <>
      <style data-podo-critical>{raw(css)}</style>
      <script data-podo-theme>
        {raw(
          `document.documentElement.dataset.podoTheme=${JSON.stringify(
            theme
          )};document.documentElement.dataset.colorScheme=${JSON.stringify(colorScheme)};`
        )}
      </script>
    </>
  );
}

export const honoRendererScope =
  "Hono components render static SSR HTML. Interactive behavior is emitted as attributes and delegated to a future client entry.";

function joinClass(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function wireHonoControl(child: Child, controlAttributes: Record<string, string | boolean>): Child {
  if (Array.isArray(child)) {
    return child.map((item) => wireHonoControl(item, controlAttributes));
  }

  if (!isValidElement(child)) {
    return child;
  }

  return cloneElement(child, Object.fromEntries(Object.entries(controlAttributes)));
}

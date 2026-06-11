import React, {
  createContext,
  createElement,
  cloneElement,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { createButtonBehavior, createFieldA11y, createInputBehavior } from "@podo/core";

export interface PodoThemeContextValue {
  theme: string;
  colorScheme: "light" | "dark";
}

export interface PodoThemeProviderProps extends PodoThemeContextValue {
  children: ReactNode;
}

export interface PodoPressEvent {
  source: "button";
  originalEvent: React.MouseEvent<HTMLButtonElement>;
}

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled" | "onClick"
> {
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  onPress?: (event: PodoPressEvent) => void;
}

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "disabled" | "onChange"
> {
  invalid?: boolean;
  disabled?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export interface IconProps extends HTMLAttributes<HTMLElement> {
  name: string;
}

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: "span" | "p" | "h1";
  variant?: "body" | "h1";
}

export const PodoThemeContext = createContext<PodoThemeContextValue>({
  theme: "landing",
  colorScheme: "light",
});

export function PodoThemeProvider({
  theme,
  colorScheme,
  children,
}: PodoThemeProviderProps): React.ReactElement {
  return (
    <PodoThemeContext.Provider value={{ theme, colorScheme }}>
      <div data-podo-theme={theme} data-color-scheme={colorScheme}>
        {children}
      </div>
    </PodoThemeContext.Provider>
  );
}

export function usePodoTheme(): PodoThemeContextValue {
  return useContext(PodoThemeContext);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    size = "md",
    disabled,
    loading,
    leftIcon,
    rightIcon,
    children,
    className,
    type = "button",
    onClick,
    onPress,
    ...props
  },
  ref
) {
  const behavior = createButtonBehavior({ disabled, loading, type });
  const classes = joinClass("podo-button", className);

  return (
    <button
      {...props}
      {...behavior.dataState}
      ref={ref}
      type={behavior.root.type}
      disabled={behavior.root.disabled}
      aria-busy={behavior.root.ariaBusy}
      aria-disabled={behavior.root.ariaDisabled}
      tabIndex={behavior.root.tabIndex}
      className={classes}
      data-size={size}
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event);
        if (!behavior.pressable || event.defaultPrevented) {
          return;
        }
        onPress?.({ source: "button", originalEvent: event });
      }}
    >
      {leftIcon ? <span className="podo-button__icon">{leftIcon}</span> : null}
      <span className="podo-button__label">{children}</span>
      {rightIcon ? <span className="podo-button__icon">{rightIcon}</span> : null}
    </button>
  );
});

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, disabled, required, className, onChange, onValueChange, ...props },
  ref
) {
  const behavior = createInputBehavior({
    disabled,
    invalid,
    required,
    value: typeof props.value === "string" ? props.value : undefined,
    defaultValue: typeof props.defaultValue === "string" ? props.defaultValue : undefined,
  });

  return (
    <input
      {...props}
      {...behavior.dataState}
      {...behavior.root}
      ref={ref}
      className={joinClass("podo-input", className)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.currentTarget.value, event);
      }}
    />
  );
});

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    id = "podo-field",
    label,
    description,
    error,
    invalid,
    required,
    disabled,
    children,
    className,
    ...props
  },
  ref
) {
  const generatedId = useId().replaceAll(":", "podo");
  const fieldId = id === "podo-field" ? generatedId : id;
  const a11y = createFieldA11y({
    id: fieldId,
    invalid,
    required,
    hasDescription: Boolean(description),
    hasError: Boolean(error),
  });
  const wiredChildren = wireReactControl(children, a11y.control);

  return (
    <div
      {...props}
      ref={ref}
      className={joinClass("podo-field", className)}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-required={required ? "true" : undefined}
    >
      <label className="podo-field__label" id={a11y.ids.labelId} htmlFor={a11y.ids.controlId}>
        {label}
      </label>
      <div className="podo-field__control">{wiredChildren}</div>
      {description ? (
        <div className="podo-field__description" id={a11y.ids.descriptionId}>
          {description}
        </div>
      ) : null}
      {error ? (
        <div className="podo-field__error" id={a11y.ids.errorId}>
          {error}
        </div>
      ) : null}
    </div>
  );
});

export function Icon({ name, className, ...props }: IconProps): React.ReactElement {
  return (
    <i
      {...props}
      aria-hidden="true"
      className={joinClass("podo-icon", `podo-icon-${name}`, className)}
    />
  );
}

export function Typography({
  as = "p",
  variant = as === "h1" ? "h1" : "body",
  className,
  ...props
}: TypographyProps): React.ReactElement {
  return createElement(as, {
    ...props,
    className: joinClass("podo-text", `podo-text--${variant}`, className),
  });
}

function joinClass(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function wireReactControl(
  children: ReactNode,
  controlProps: Record<string, string | boolean>
): ReactNode {
  return React.Children.map(children, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) {
      return child;
    }

    const existing = child.props;
    return cloneElement(child, {
      ...controlProps,
      id: existing.id ?? controlProps.id,
      "aria-describedby": joinClass(
        existing["aria-describedby"] as string | undefined,
        controlProps["aria-describedby"] as string | undefined
      ),
    });
  });
}

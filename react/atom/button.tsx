import { forwardRef } from 'react';

export type ButtonTheme =
  | 'default'
  | 'primary'
  | 'default-deep'
  | 'info'
  | 'link'
  | 'success'
  | 'warning'
  | 'danger';

export type ButtonVariant = 'solid' | 'fill' | 'border' | 'text';

export type ButtonSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ComponentProps<'button'> {
  /** Theme color */
  theme?: ButtonTheme;
  /** Style variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** Left icon class name */
  icon?: string;
  /** Right icon class name */
  rightIcon?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Additional class name */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      theme = 'default',
      variant = 'solid',
      size = 'sm',
      icon,
      rightIcon,
      loading,
      disabled,
      textAlign,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const buttonClass = [
      theme !== 'default' && theme,
      variant !== 'solid' && variant,
      size !== 'sm' && size,
      textAlign === 'left' && 'text-left',
      textAlign === 'right' && 'text-right',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={buttonClass || undefined}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <i className="icon-loading" />
        ) : (
          icon && <i className={icon} />
        )}
        {children}
        {rightIcon && !loading && <i className={rightIcon} />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

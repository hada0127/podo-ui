<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type ButtonTheme =
    | 'default'
    | 'primary'
    | 'default-deep'
    | 'info'
    | 'link'
    | 'success'
    | 'warning'
    | 'danger';

  type ButtonVariant = 'solid' | 'fill' | 'border' | 'text';

  type ButtonSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

  interface Props extends HTMLButtonAttributes {
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
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right';
    /** Children content */
    children?: Snippet;
  }

  let {
    theme = 'default',
    variant = 'solid',
    size = 'sm',
    icon,
    rightIcon,
    loading = false,
    disabled = false,
    textAlign,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  let buttonClass = $derived(
    [
      theme !== 'default' && theme,
      variant !== 'solid' && variant,
      size !== 'sm' && size,
      textAlign === 'left' && 'text-left',
      textAlign === 'right' && 'text-right',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<button
  class={buttonClass || undefined}
  disabled={disabled || loading}
  aria-busy={loading ? true : undefined}
  aria-disabled={disabled ? true : undefined}
  {...rest}
>
  {#if loading}
    <i class="icon-loading"></i>
  {:else if icon}
    <i class={icon}></i>
  {/if}

  {#if children}
    {@render children()}
  {/if}

  {#if rightIcon && !loading}
    <i class={rightIcon}></i>
  {/if}
</button>

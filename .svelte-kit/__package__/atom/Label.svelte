<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLLabelAttributes } from 'svelte/elements';

  interface Props extends HTMLLabelAttributes {
    /** Label text content */
    children: Snippet;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Semibold font weight */
    semibold?: boolean;
    /** Show required indicator (*) */
    required?: boolean;
    /** Disabled style */
    disabled?: boolean;
    /** Associated input id */
    for?: string;
  }

  let {
    children,
    size = 'md',
    semibold = false,
    required = false,
    disabled = false,
    for: htmlFor,
    class: className = '',
    ...rest
  }: Props = $props();

  let labelClass = $derived(
    [size !== 'md' && size, semibold && 'semibold', disabled && 'disabled', className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<label for={htmlFor} class={labelClass || undefined} {...rest}>
  {@render children()}
  {#if required}
    <span class="required">*</span>
  {/if}
</label>

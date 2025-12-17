<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Accepted file types (e.g., "image/*", ".pdf") */
    accept?: string;
    /** Allow multiple file selection */
    multiple?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
  }

  let {
    accept,
    multiple = false,
    disabled = false,
    class: className,
    element = $bindable(),
    ...rest
  }: Props = $props();
</script>

<input
  bind:this={element}
  type="file"
  {accept}
  {multiple}
  {disabled}
  class={className}
  {...rest}
/>

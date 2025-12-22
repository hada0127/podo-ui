<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Checked state */
    checked?: boolean;
    /** Indeterminate state (for select all pattern) */
    indeterminate?: boolean;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
    label,
    disabled = false,
    class: className,
    element = $bindable(),
    ...rest
  }: Props = $props();

  // Handle indeterminate state (DOM property only, not HTML attribute)
  $effect(() => {
    if (element) {
      element.indeterminate = indeterminate;
    }
  });
</script>

{#if label}
  <label>
    <input
      bind:this={element}
      type="checkbox"
      bind:checked
      {disabled}
      class={className}
      {...rest}
    />
    <span>{label}</span>
  </label>
{:else}
  <input
    bind:this={element}
    type="checkbox"
    bind:checked
    {disabled}
    class={className}
    {...rest}
  />
{/if}

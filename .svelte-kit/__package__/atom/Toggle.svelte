<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Checked state */
    checked?: boolean;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
  }

  let {
    checked = $bindable(false),
    label,
    disabled = false,
    class: className = '',
    element = $bindable(),
    ...rest
  }: Props = $props();

  let toggleClass = $derived(['toggle', className].filter(Boolean).join(' '));
</script>

{#if label}
  <label>
    <input
      bind:this={element}
      type="checkbox"
      class={toggleClass}
      bind:checked
      {disabled}
      {...rest}
    />
    <span>{label}</span>
  </label>
{:else}
  <input
    bind:this={element}
    type="checkbox"
    class={toggleClass}
    bind:checked
    {disabled}
    {...rest}
  />
{/if}

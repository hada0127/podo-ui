<script lang="ts" module>
  export interface RadioGroupOption {
    /** Option value */
    value: string;
    /** Option label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'type' | 'name' | 'value'> {
    /** Checked state */
    checked?: boolean;
    /** Group name (required for grouping) */
    name: string;
    /** Radio value */
    value: string;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
  }

  let {
    checked = $bindable(false),
    name,
    value,
    label,
    disabled = false,
    class: className,
    element = $bindable(),
    ...rest
  }: Props = $props();
</script>

{#if label}
  <label>
    <input
      bind:this={element}
      type="radio"
      {name}
      {value}
      {checked}
      onchange={(e) => checked = e.currentTarget.checked}
      {disabled}
      class={className}
      {...rest}
    />
    <span>{label}</span>
  </label>
{:else}
  <input
    bind:this={element}
    type="radio"
    {name}
    {value}
    {checked}
    onchange={(e) => checked = e.currentTarget.checked}
    {disabled}
    class={className}
    {...rest}
  />
{/if}

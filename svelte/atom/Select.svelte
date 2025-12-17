<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  export interface SelectOption {
    /** Option value */
    value: string;
    /** Option label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
  }

  interface Props extends Omit<HTMLSelectAttributes, 'children'> {
    /** Current value */
    value?: string;
    /** Option list */
    options: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Left icon class name */
    withIcon?: string;
    /** Element reference for bind:this */
    element?: HTMLSelectElement;
  }

  let {
    value = $bindable(''),
    options,
    placeholder,
    disabled = false,
    withIcon,
    class: className,
    element = $bindable(),
    ...rest
  }: Props = $props();
</script>

{#if withIcon}
  <div class="with-icon">
    <i class={withIcon}></i>
    <select bind:this={element} bind:value {disabled} class={className} {...rest}>
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}
      {#each options as option (option.value)}
        <option value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      {/each}
    </select>
  </div>
{:else}
  <select bind:this={element} bind:value {disabled} class={className} {...rest}>
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>
{/if}

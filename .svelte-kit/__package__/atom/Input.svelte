<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { z } from 'zod';
  import { createValidation } from '../stores/validation';
  import styles from './input.module.scss';

  interface Props extends HTMLInputAttributes {
    /** Input value */
    value?: string | number;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Left icon class name */
    withIcon?: string;
    /** Right icon class name */
    withRightIcon?: string;
    /** Unit text (e.g., "원", "kg") */
    unit?: string;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
  }

  let {
    validator,
    value = $bindable(''),
    class: className = '',
    withIcon,
    withRightIcon,
    unit,
    type = 'text',
    id,
    element = $bindable(),
    ...rest
  }: Props = $props();

  const { message, statusClass, validate } = createValidation(validator);

  let inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  let errorId = `${inputId}-error`;

  $effect(() => {
    validate(value);
  });

  let wrapperClass = $derived(
    [className, withIcon && 'with-icon', withRightIcon && 'with-right-icon']
      .filter(Boolean)
      .join(' ')
  );

  let inputClass = $derived([$statusClass, className].filter(Boolean).join(' '));
</script>

<div class="{styles.style} {className}">
  <div class={wrapperClass}>
    {#if withIcon}
      <i class={withIcon}></i>
    {/if}
    <input
      bind:this={element}
      id={inputId}
      {type}
      bind:value
      class={inputClass}
      aria-invalid={$statusClass === 'danger' ? true : undefined}
      aria-describedby={$message ? errorId : rest['aria-describedby']}
      {...rest}
    />
    {#if withRightIcon}
      <i class={withRightIcon}></i>
    {/if}
    {#if unit}
      <span class="unit">{unit}</span>
    {/if}
  </div>
  {#if validator && $message !== ''}
    <div id={errorId} class="validator" role="alert">
      {$message}
    </div>
  {/if}
</div>

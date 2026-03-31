<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';
  import { ZodError } from 'zod';
  import styles from './field.module.scss';

  interface Props {
    /** Label text */
    label?: string;
    /** Label additional class */
    labelClass?: string;
    /** Show required indicator (*) */
    required?: boolean;
    /** Helper text or snippet */
    helper?: string | Snippet;
    /** Helper additional class */
    helperClass?: string;
    /** Error message (displays in danger color with danger border) */
    error?: string;
    /** Field children (input, select, etc.) */
    children?: Snippet;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Value to validate */
    value?: string;
    /** Additional class name */
    class?: string;
  }

  let {
    label,
    labelClass = '',
    required = false,
    helper,
    helperClass = '',
    error,
    children,
    validator,
    value = '',
    class: className = '',
    ...rest
  }: Props & Record<string, unknown> = $props();

  let message = $state('');
  let statusClass = $state('');

  $effect(() => {
    message = '';
    statusClass = '';

    if (validator && value && value.length > 0) {
      try {
        validator.parse(value);
        statusClass = 'success';
      } catch (e) {
        if (e instanceof ZodError) {
          message = e.errors[0].message;
          statusClass = 'danger';
        }
      }
    }
  });

  let hasError = $derived(!!error || (!!validator && message !== ''));
  let errorOrMessage = $derived(error || message);
  let isHelperSnippet = $derived(typeof helper === 'function');
  let showHelper = $derived(!!errorOrMessage || !!helper);
</script>

<div class="{styles.style} {hasError ? 'has-error' : ''} {className}" {...rest}>
  {#if label}
    <label class={labelClass}>
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}
  <div class="child">
    {#if children}
      {@render children()}
    {/if}
    {#if showHelper}
      <div class="helper {hasError ? 'error' : ''} {helperClass}">
        {#if errorOrMessage}
          {errorOrMessage}
        {:else if isHelperSnippet}
          {@render helper()}
        {:else}
          {helper}
        {/if}
      </div>
    {/if}
  </div>
</div>

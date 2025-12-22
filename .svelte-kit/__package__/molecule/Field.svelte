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
    /** Helper text */
    helper?: string;
    /** Helper additional class */
    helperClass?: string;
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
</script>

<div class="{styles.style} {className}" {...rest}>
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
  </div>
  {#if helper || (validator && message !== '')}
    <div class="helper {helperClass}">
      {message || helper}
    </div>
  {/if}
</div>

<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { z } from 'zod';
  import { createValidation } from '../stores/validation';
  import styles from './textarea.module.scss';

  interface Props extends HTMLTextareaAttributes {
    /** Textarea value */
    value?: string;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Element reference for bind:this */
    element?: HTMLTextAreaElement;
  }

  let {
    validator,
    value = $bindable(''),
    class: className = '',
    id,
    element = $bindable(),
    ...rest
  }: Props = $props();

  const { message, statusClass, validate } = createValidation(validator);

  let textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  let errorId = `${textareaId}-error`;

  function handleKeyup() {
    validate(value);
  }

  let textareaClass = $derived([$statusClass, className].filter(Boolean).join(' '));
</script>

<div class="{styles.style} {className}">
  <textarea
    bind:this={element}
    id={textareaId}
    bind:value
    class={textareaClass}
    onkeyup={handleKeyup}
    aria-invalid={$statusClass === 'danger' ? true : undefined}
    aria-describedby={$message ? errorId : rest['aria-describedby']}
    {...rest}
  ></textarea>
  {#if validator && $message !== ''}
    <div id={errorId} class="validator" role="alert">
      {$message}
    </div>
  {/if}
</div>

<script lang="ts">
  import type { RadioGroupOption } from './Radio.svelte';
  import Radio from './Radio.svelte';

  interface Props {
    /** Group name */
    name: string;
    /** Current selected value */
    value?: string;
    /** Option list */
    options: RadioGroupOption[];
    /** Vertical layout */
    vertical?: boolean;
    /** Additional class name */
    class?: string;
  }

  let {
    name,
    value = $bindable(''),
    options,
    vertical = false,
    class: className = '',
  }: Props = $props();

  let groupClass = $derived(
    ['radio-group', vertical && 'vertical', className].filter(Boolean).join(' ')
  );

  function handleChange(optionValue: string) {
    value = optionValue;
  }
</script>

<div class={groupClass || undefined}>
  {#each options as option (option.value)}
    <Radio
      {name}
      value={option.value}
      label={option.label}
      checked={value === option.value}
      disabled={option.disabled}
      onchange={() => handleChange(option.value)}
    />
  {/each}
</div>

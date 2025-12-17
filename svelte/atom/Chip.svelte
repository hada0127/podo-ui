<script lang="ts">
  import type { Snippet } from 'svelte';

  type ChipTheme = 'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'red';
  type ChipType = 'default' | 'fill' | 'border';

  interface Props {
    /** Chip content */
    children: Snippet;
    /** Theme color */
    theme?: ChipTheme;
    /** Style type */
    type?: ChipType;
    /** Size */
    size?: 'sm' | 'md';
    /** Round corners */
    round?: boolean;
    /** Icon class name */
    icon?: string;
    /** Delete button handler */
    ondelete?: () => void;
    /** Additional class name */
    class?: string;
  }

  let {
    children,
    theme = 'default',
    type = 'default',
    size = 'md',
    round = false,
    icon,
    ondelete,
    class: className = '',
  }: Props = $props();

  let chipClasses = $derived(
    [
      'chip',
      theme !== 'default' && theme,
      type !== 'default' && type,
      size !== 'md' && size,
      round && 'round',
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={chipClasses}>
  {#if icon}
    <i class="icon {icon}"></i>
  {/if}
  {@render children()}
  {#if ondelete}
    <button aria-label="삭제" onclick={ondelete}></button>
  {/if}
</div>

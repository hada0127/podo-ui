<script lang="ts">
  import type { Snippet } from 'svelte';
  import styles from './tooltip.module.scss';

  type TooltipVariant = 'default' | 'info';

  type TooltipPosition =
    | 'top'
    | 'topLeft'
    | 'topRight'
    | 'bottom'
    | 'bottomLeft'
    | 'bottomRight'
    | 'left'
    | 'leftTop'
    | 'leftBottom'
    | 'right'
    | 'rightTop'
    | 'rightBottom';

  interface Props {
    /** Trigger element (button, icon, etc.) */
    children: Snippet;
    /** Tooltip content (can include any JSX) */
    content: Snippet;
    /** Tooltip visual variant */
    variant?: TooltipVariant;
    /** Arrow position */
    position?: TooltipPosition;
    /** Distance from trigger element in pixels */
    offset?: number;
    /** Control visibility externally (overrides hover state) */
    isVisible?: boolean;
    /** Additional CSS class */
    class?: string;
  }

  let {
    children,
    content,
    variant = 'default',
    position = 'top',
    offset = 8,
    isVisible: controlledIsVisible,
    class: className = '',
  }: Props = $props();

  let hoverIsVisible = $state(false);

  let variantClass = $derived(
    variant === 'default' ? styles.variantDefault : styles.variantInfo
  );

  let tooltipClassNames = $derived(
    [styles.tooltipBox, variantClass, styles[position], className]
      .filter(Boolean)
      .join(' ')
  );

  // Show tooltip if controlled visibility is true OR hover state is true
  let shouldShowTooltip = $derived(controlledIsVisible === true || hoverIsVisible);
</script>

<div
  class={styles.tooltipWrapper}
  onmouseenter={() => (hoverIsVisible = true)}
  onmouseleave={() => (hoverIsVisible = false)}
  role="presentation"
>
  {@render children()}
  {#if shouldShowTooltip}
    <div class={tooltipClassNames} style="--tooltip-offset: {offset}px;">
      {@render content()}
    </div>
  {/if}
</div>

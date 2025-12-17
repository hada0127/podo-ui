<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** Tab key (must match Tab item key) */
    tabKey: string;
    /** Current active key */
    activeKey?: string;
    /** Panel content */
    children: Snippet;
    /** Additional class name */
    class?: string;
  }

  let { tabKey, activeKey, children, class: className }: Props = $props();

  let isActive = $derived(tabKey === activeKey);
</script>

{#if isActive}
  <div class={className}>
    {@render children()}
  </div>
{/if}

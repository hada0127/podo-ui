<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import {
    createToastContext,
    type ToastPosition,
  } from '../stores/toast';
  import Toast from './Toast.svelte';
  import { portal } from '../actions/portal';
  import styles from './toast-container.module.scss';

  interface Props {
    /** Children content */
    children?: Snippet;
  }

  let { children }: Props = $props();

  const { toasts, hideToast } = createToastContext();

  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  let isMounted = $state(false);

  onMount(() => {
    isMounted = true;
    return () => {
      isMounted = false;
    };
  });

  function getToastsByPosition(position: ToastPosition) {
    return $toasts.filter((t) => t.position === position);
  }
</script>

{#if children}
  {@render children()}
{/if}

{#if isMounted}
  <div class={styles.toastPortal} use:portal={'body'}>
    {#each positions as position (position)}
      {@const positionToasts = getToastsByPosition(position)}
      {#if positionToasts.length > 0}
        <div class="{styles.toastContainer} {styles[position]}">
          {#each positionToasts as toast (toast.id)}
            <Toast
              id={toast.id}
              header={toast.header}
              message={toast.message}
              theme={toast.theme}
              border={toast.border}
              long={toast.long}
              duration={toast.duration}
              width={toast.width}
              onclose={() => hideToast(toast.id)}
            />
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/if}

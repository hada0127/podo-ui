<script lang="ts">
  import { onMount } from 'svelte';
  import styles from './toast.module.scss';

  type ToastTheme = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

  interface Props {
    /** Toast ID */
    id: string;
    /** Toast header */
    header?: string;
    /** Toast message */
    message: string;
    /** Toast theme */
    theme?: ToastTheme;
    /** Show border */
    border?: boolean;
    /** Long style (no header) */
    long?: boolean;
    /** Auto close duration in ms (0 = no auto close) */
    duration?: number;
    /** Toast width */
    width?: string | number;
    /** Close callback */
    onclose: (id: string) => void;
  }

  let {
    id,
    header,
    message,
    theme = 'default',
    border = false,
    long = false,
    duration = 3000,
    width,
    onclose,
    ...rest
  }: Props & Record<string, unknown> = $props();

  let isVisible = $state(false);
  let isClosing = $state(false);

  onMount(() => {
    // Fade in
    requestAnimationFrame(() => {
      isVisible = true;
    });

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  function handleClose() {
    isClosing = true;
    setTimeout(() => {
      onclose(id);
    }, 200); // 0.2s fade out
  }

  let toastClasses = $derived(
    [
      'toast',
      theme,
      border ? 'border' : '',
      long ? 'long' : '',
      styles.toastAnimation,
      isVisible && !isClosing ? styles.fadeIn : '',
      isClosing ? styles.fadeOut : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  let toastStyle = $derived(
    width ? `width: ${typeof width === 'number' ? `${width}px` : width};` : ''
  );

  function getIcon(): string {
    switch (theme) {
      case 'success':
        return 'icon-check';
      case 'warning':
        return 'icon-warning';
      case 'danger':
        return 'icon-danger';
      case 'primary':
      case 'info':
      case 'default':
      default:
        return 'icon-info';
    }
  }
</script>

<div class={toastClasses} style={toastStyle} {...rest}>
  <i class={getIcon()}></i>
  <div class="toast-content">
    {#if header && !long}
      <div class="toast-header">{header}</div>
    {/if}
    <div class="toast-body">{message}</div>
  </div>
  <button onclick={handleClose} aria-label="닫기"></button>
</div>

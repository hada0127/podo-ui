<script lang="ts">
  import styles from './avatar.module.scss';

  type AvatarType = 'image' | 'icon' | 'text';
  type AvatarSize = 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56;

  interface Props {
    /**
     * Avatar type
     * - image: Display user uploaded image
     * - icon: Display system provided icon with background
     * - text: Display user name or initials with background
     */
    type?: AvatarType;
    /** Image source URL (for type='image') */
    src?: string;
    /** Icon class name (for type='icon') */
    icon?: string;
    /** Text content (for type='text') */
    text?: string;
    /** Avatar size in pixels */
    size?: AvatarSize;
    /** Show activity ring */
    activityRing?: boolean;
    /** Additional CSS class names */
    class?: string;
    /** Alt text for image */
    alt?: string;
    /** Click handler */
    onclick?: () => void;
  }

  let {
    type = 'icon',
    src,
    icon = 'icon-user',
    text,
    size = 56,
    activityRing = false,
    class: className = '',
    alt = 'Avatar',
    onclick,
    ...rest
  }: Props & Record<string, unknown> = $props();

  let wrapperClasses = $derived(
    [styles.wrapper, activityRing && styles.activityRing, className]
      .filter(Boolean)
      .join(' ')
  );

  let avatarClasses = $derived(
    [styles.avatar, styles[`size-${size}`], styles[`type-${type}`]]
      .filter(Boolean)
      .join(' ')
  );

  let wrapperSize = $derived(activityRing ? size + 10 : size);
  let displayText = $derived(text ? text.slice(0, 2) : '');

  function getFontSize(contentType: 'icon' | 'text') {
    if (contentType === 'icon') {
      const iconRatio = 0.785;
      return Math.round(size * iconRatio);
    } else {
      const textRatio = 0.43;
      return Math.round(size * textRatio);
    }
  }
</script>

<div
  class={wrapperClasses}
  style="width: {wrapperSize}px; height: {wrapperSize}px;"
  onclick={onclick}
  onkeydown={onclick ? (e) => e.key === 'Enter' && onclick() : undefined}
  role={onclick ? 'button' : undefined}
  tabindex={onclick ? 0 : undefined}
  {...rest}
>
  <div
    class={avatarClasses}
    style="width: {size}px; height: {size}px; font-size: {type === 'text'
      ? getFontSize('text')
      : getFontSize('icon')}px;"
  >
    {#if type === 'image' && src}
      <img {src} {alt} class={styles.image} />
    {:else if type === 'icon'}
      <i class={icon} style="font-size: {getFontSize('icon')}px;"></i>
    {:else if type === 'text' && displayText}
      <span style="font-size: {getFontSize('text')}px;">{displayText}</span>
    {:else}
      <i class={icon} style="font-size: {getFontSize('icon')}px;"></i>
    {/if}
  </div>
</div>

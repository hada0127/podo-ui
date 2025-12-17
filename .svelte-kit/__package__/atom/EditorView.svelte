<script lang="ts">
  import styles from './editor-view.module.scss';

  interface Props {
    /** HTML content to render */
    value: string;
    /** Additional class name */
    class?: string;
  }

  let { value, class: className = '' }: Props = $props();
</script>

<div class="{styles.editorView} {className}">
  {@html value}
</div>

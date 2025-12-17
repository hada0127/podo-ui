<script lang="ts" module>
  export interface TabItem {
    /** Tab key */
    key: string;
    /** Tab label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  interface Props {
    /** Tab items */
    items: TabItem[];
    /** Active tab key (controlled) */
    activeKey?: string;
    /** Default active tab key (uncontrolled) */
    defaultActiveKey?: string;
    /** Equal width tabs */
    fill?: boolean;
    /** Tab change callback */
    onchange?: (key: string) => void;
    /** Additional class name */
    class?: string;
  }

  let {
    items,
    activeKey: controlledActiveKey,
    defaultActiveKey,
    fill = false,
    onchange,
    class: className = '',
  }: Props = $props();

  let internalActiveKey = $state(defaultActiveKey || items[0]?.key);

  let activeKey = $derived(controlledActiveKey ?? internalActiveKey);

  function handleClick(key: string, disabled?: boolean) {
    if (disabled) return;
    internalActiveKey = key;
    onchange?.(key);
  }

  let tabsClass = $derived(
    ['tabs', fill && 'fill', className].filter(Boolean).join(' ')
  );
</script>

<ul class={tabsClass}>
  {#each items as item (item.key)}
    <li class={activeKey === item.key ? 'on' : undefined}>
      <a
        href="#{item.key}"
        onclick={(e) => {
          e.preventDefault();
          handleClick(item.key, item.disabled);
        }}
        aria-disabled={item.disabled}
        tabindex={item.disabled ? -1 : 0}
      >
        {item.label}
      </a>
    </li>
  {/each}
</ul>

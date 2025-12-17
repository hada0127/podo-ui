<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export interface TableColumn<T> {
    /** Column key */
    key: string;
    /** Header text */
    title: string;
    /** Custom render function */
    render?: (value: unknown, record: T, index: number) => Snippet;
    /** Column width */
    width?: string | number;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
  }
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  interface Props {
    /** Column definitions */
    columns: TableColumn<T>[];
    /** Data source */
    dataSource: T[];
    /** Row key extractor */
    rowKey: keyof T | ((record: T) => string);
    /** Clickable rows (hover effect) */
    list?: boolean;
    /** Row border */
    border?: boolean;
    /** Filled background */
    fill?: boolean;
    /** Row click callback */
    onrowclick?: (record: T, index: number) => void;
    /** Additional class name */
    class?: string;
  }

  let {
    columns,
    dataSource,
    rowKey,
    list = false,
    border = false,
    fill = false,
    onrowclick,
    class: className = '',
  }: Props = $props();

  function getRowKey(record: T, index: number): string {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  }

  function handleRowClick(record: T, index: number) {
    onrowclick?.(record, index);
  }

  function handleKeyDown(e: KeyboardEvent, record: T, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onrowclick?.(record, index);
    }
  }

  let tableClass = $derived(
    [list && 'list', border && 'border', fill && 'fill', className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<table class={tableClass || undefined}>
  <thead>
    <tr>
      {#each columns as col (col.key)}
        <th
          scope="col"
          style="width: {col.width}; text-align: {col.align};"
        >
          {col.title}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each dataSource as record, index (getRowKey(record, index))}
      <tr
        onclick={() => handleRowClick(record, index)}
        onkeydown={onrowclick ? (e) => handleKeyDown(e, record, index) : undefined}
        style={onrowclick ? 'cursor: pointer;' : undefined}
        role={onrowclick ? 'button' : undefined}
        tabindex={onrowclick ? 0 : undefined}
      >
        {#each columns as col (col.key)}
          <td style="text-align: {col.align};">
            {#if col.render}
              {@render col.render(record[col.key], record, index)}
            {:else}
              {record[col.key]}
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

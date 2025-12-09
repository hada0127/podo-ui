import React from 'react';

export interface TableColumn<T> {
  /** Column key */
  key: string;
  /** Header text */
  title: React.ReactNode;
  /** Custom render function */
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T extends Record<string, unknown>> {
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
  onRowClick?: (record: T, index: number) => void;
  /** Additional class name */
  className?: string;
}

function Table<T extends Record<string, unknown>>({
  columns,
  dataSource,
  rowKey,
  list,
  border,
  fill,
  onRowClick,
  className,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  const tableClass = [list && 'list', border && 'border', fill && 'fill', className]
    .filter(Boolean)
    .join(' ');

  return (
    <table className={tableClass || undefined}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                width: col.width,
                textAlign: col.align,
              }}
            >
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataSource.map((record, index) => (
          <tr
            key={getRowKey(record, index)}
            onClick={() => onRowClick?.(record, index)}
            style={onRowClick ? { cursor: 'pointer' } : undefined}
          >
            {columns.map((col) => (
              <td key={col.key} style={{ textAlign: col.align }}>
                {col.render
                  ? col.render(record[col.key], record, index)
                  : (record[col.key] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.displayName = 'Table';

export default Table;

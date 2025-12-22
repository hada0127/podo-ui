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
declare function $$render<T extends Record<string, unknown>>(): {
    props: {
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
    } & Record<string, unknown>;
    exports: {};
    bindings: "";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T extends Record<string, unknown>> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T extends Record<string, unknown>>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T extends Record<string, unknown>>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const Table: $$IsomorphicComponent;
type Table<T extends Record<string, unknown>> = InstanceType<typeof Table<T>>;
export default Table;

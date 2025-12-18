interface Props {
    /** Current page number */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Page change callback */
    onpagechange: (page: number) => void;
    /** Maximum visible page numbers */
    maxVisiblePages?: number;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Pagination: import("svelte").Component<$$ComponentProps, {}, "currentPage">;
type Pagination = ReturnType<typeof Pagination>;
export default Pagination;

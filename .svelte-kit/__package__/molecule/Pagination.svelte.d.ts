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
declare const Pagination: import("svelte").Component<Props, {}, "currentPage">;
type Pagination = ReturnType<typeof Pagination>;
export default Pagination;

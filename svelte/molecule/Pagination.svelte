<script lang="ts">
  import styles from './pagination.module.scss';

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

  let {
    currentPage = $bindable(1),
    totalPages,
    onpagechange,
    maxVisiblePages = 5,
  }: Props = $props();

  function getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage =
      Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  let pageNumbers = $derived(getPageNumbers());

  function handlePrevious() {
    if (currentPage > 1) {
      currentPage = currentPage - 1;
      onpagechange(currentPage);
    }
  }

  function handleNext() {
    if (currentPage < totalPages) {
      currentPage = currentPage + 1;
      onpagechange(currentPage);
    }
  }

  function handlePageClick(pageNum: number) {
    currentPage = pageNum;
    onpagechange(pageNum);
  }
</script>

{#if totalPages > 0}
  <div class={styles.pagination}>
    {#if currentPage > 1}
      <button
        onclick={handlePrevious}
        class={styles.pageButton}
        aria-label="이전 페이지"
      >
        <i class="icon-arrow-left"></i>
      </button>
    {:else}
      <div class={styles.pageButtonPlaceholder}></div>
    {/if}

    {#each pageNumbers as pageNum (pageNum)}
      <button
        onclick={() => handlePageClick(pageNum)}
        class="{styles.pageButton} {currentPage === pageNum ? styles.active : ''}"
        aria-label="{pageNum}페이지"
        aria-current={currentPage === pageNum ? 'page' : undefined}
      >
        {pageNum}
      </button>
    {/each}

    {#if currentPage < totalPages}
      <button
        onclick={handleNext}
        class={styles.pageButton}
        aria-label="다음 페이지"
      >
        <i class="icon-arrow-right"></i>
      </button>
    {:else}
      <div class={styles.pageButtonPlaceholder}></div>
    {/if}
  </div>
{/if}

<script lang="ts">
	/**
	 * @title Datatables Pagination
	 * @description Datatables pagination to replace the default one
	 **/

	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	const pageNumber = handler.getPageNumber();
	const pageCount = handler.getPageCount();
	const pages = handler.getPages({ ellipsis: true });
</script>

<!-- Desktop buttons -->
<section class="text-white font-semibold font-monster btn-group border-none h-10 hidden lg:block">
	<button
		type="button"
		class="bg-surface-600 border border-primary-200 rounded-md"
		class:disabled={$pageNumber === 1}
		on:click={() => handler.setPage('previous')}
	>
		←
	</button>
	{#each $pages as page}
		<button
			type="button"
			class="bg-surface-400/50 rounded-md"
			class:active={$pageNumber === page}
			class:ellipse={page === null}
			on:click={() => handler.setPage(page)}
		>
			{page ?? '...'}
		</button>
	{/each}
	<button
		type="button"
		class="bg-surface-600 border border-primary-200 rounded-md"
		class:disabled={$pageNumber === $pageCount}
		on:click={() => handler.setPage('next')}
	>
		→
	</button>
</section>

<!-- Mobile buttons -->
<section class="lg:hidden">
	<button
		type="button"
		class="btn variant-ghost-surface mr-2 mb-2 hover:variant-soft-primary"
		class:disabled={$pageNumber === 1}
		on:click={() => handler.setPage('previous')}
	>
		←
	</button>
	<button
		type="button"
		class="btn variant-ghost-surface mb-2 hover:variant-soft-primary"
		class:disabled={$pageNumber === $pageCount}
		on:click={() => handler.setPage('next')}
	>
		→
	</button>
</section>

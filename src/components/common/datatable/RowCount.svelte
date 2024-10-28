<script lang="ts">
	/**
	 * @title Datatables RowCount
	 * @description Datatables row count tooltip to replace the default one
	 **/

	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	const rowCount = handler.getRowCount();
</script>

<aside class="text-sm font-semibold font-monster text-white leading-8 mr-6">
	{#if $rowCount.total > 0}
		<b>{$rowCount.start}</b>
		- <b>{$rowCount.end}</b>
		/ <b>{$rowCount.total}</b>
	{:else}
		No entries found
	{/if}
</aside>

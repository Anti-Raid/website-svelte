<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	const rowsPerPage = handler.getRowsPerPage();
	const options = [5, 10, 20, 50, 100];
</script>

<aside class="font-semibold font-monster text-white flex place-items-center">
	Show
	<select
		class="bg-surface-600 rounded-md text-white font-semibold font-monster border border-primary-200 text-base focus:outline-none ml-2"
		bind:value={$rowsPerPage}
	>
		{#each options as option}
			<option value={option}>
				{option}
			</option>
		{/each}
	</select>
</aside>

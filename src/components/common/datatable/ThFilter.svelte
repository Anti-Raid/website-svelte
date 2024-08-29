<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	export let filterBy: string;
	export let what: string;
	let value: string;
</script>

<th>
	<input
		class="w-full text-xs flex transition duration-200 hover:bg-surface-700 bg-surface-600 bg-opacity-100 text-white font-semibold font-monster rounded-md border border-primary-200 focus:outline-none py-3 px-3"
		type="text"
		placeholder="Filter by {what}"
		bind:value
		on:input={() => {
			if (filterBy) handler.filter(value, filterBy);
		}}
	/>
</th>

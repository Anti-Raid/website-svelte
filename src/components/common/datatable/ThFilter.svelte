<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	export let filterBy: string;
	let value: string;
</script>

<th>
	<input
		class="bg-slate-700 rounded-md text-white font-semibold border-none text-base focus:outline-none w-full"
		type="text"
		placeholder="Filter"
		bind:value
		on:input={() => {
			if (filterBy) handler.filter(value, filterBy);
		}}
	/>
</th>

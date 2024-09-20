<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	export let category: string | null = null;
	let value: string;
</script>

<input
	class="mt-2 w-[30%] flex transition duration-200 hover:bg-surface-700 bg-surface-600 bg-opacity-100 text-white font-semibold font-monster rounded-l-full rounded-r-none border border-primary-200 focus:outline-none py-3 px-3"
	type="search"
	placeholder={category ? `Search in ${category}!` : 'Search'}
	bind:value
	on:input={() => handler.search(value)}
/>

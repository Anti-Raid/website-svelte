<script lang="ts">
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	let value: string;
</script>

<input
	class="bg-slate-700 rounded-md text-white font-semibold border-none text-base focus:outline-none sm:w-64 w-36"
	type="search"
	placeholder="Search..."
	bind:value
	on:input={() => handler.search(value)}
/>

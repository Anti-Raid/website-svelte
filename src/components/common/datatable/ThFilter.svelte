<script lang="ts">
	/**
	 * @title Datatables ThFilter
	 * @description Datatables ThFilter to replace the default one
	 **/

	import { title } from '$lib/strings';
	import type { DataHandler } from '@vincjo/datatables';
	export let handler: DataHandler;
	export let filterBy: string;
	export let what: string | null = null;
	let value: string;
</script>

<th>
	<input
		class="w-full text-xs flex transition duration-200 hover:bg-surface-700 bg-surface-600 bg-opacity-100 text-white font-semibold font-monster rounded-md border border-primary-200 focus:outline-none py-3 px-3"
		type="text"
		placeholder={what ? `Filter by ${what}` : `Filter by ${title(filterBy)}`}
		bind:value
		on:input={() => {
			if (filterBy) handler.filter(value, filterBy);
		}}
	/>
</th>

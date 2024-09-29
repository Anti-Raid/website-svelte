<script lang="ts">
	import Developer from './Developer.svelte';

	export let data: any;
	$: i = JSON.stringify(data, null, 4);
</script>

<Developer>
	<details>
		<summary class="hover:cursor-pointer">Debug</summary>
		<textarea
			id="editor"
			rows="8"
			class="block w-full px-2 text-sm rounded-md text-white bg-slate-600 font-cabin font-semibold border-0 focus:ring-0"
			placeholder="Sorry, no data was recieved from the server."
			contenteditable="false"
			bind:textContent={i}
			required
		/>
	</details>
</Developer>

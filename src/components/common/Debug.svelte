<script lang="ts">
	import Developer from './Developer.svelte';

	export let data: any;
</script>

<Developer>
	<details>
		<summary class="hover:cursor-pointer">Debug</summary>
		<code class="text-white whitespace-pre-wrap">{JSON.stringify(data, null, 4)}</code>
	</details>
</Developer>

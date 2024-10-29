<script lang="ts">
	export let onClick: (e: MouseEvent) => void;
</script>

<button
	class="inline-flex items-center px-3 py-2 text-md font-monster font-bold text-center text-white bg-surface-800 hover:bg-surface-800/65 rounded-lg focus:ring-2 focus:outline-none focus:ring-surface-600"
	on:click={onClick}
>
	<slot />
</button>

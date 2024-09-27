<script lang="ts">
	import Icon from '@iconify/svelte';

	export let onclick: () => void;
	export let icon: string | undefined = undefined;
	export let name: string;
	export let description: string;
</script>

<button
	on:click|preventDefault={() => onclick()}
	class="block top-0 text-left items-start index-page-button p-4 border rounded-tl-none rounded-br-lg bg-slate-800 hover:bg-transparent shadow"
>
	<div class="h-full text-white">
		{#if icon}
			<Icon {icon} class="block text-4xl m-auto" />
		{/if}
		<span class="block font-monster font-semibold m-auto text-center">{name}</span>
		<small class="mt-0.5 block font-cabin font-semibold opacity-80 text-center">
			{@html description}
		</small>
	</div>
</button>

<style>
	.index-page-button {
		transition: all 0.1s;
		box-shadow: 0 4px 8px 0 #23272a, 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

	.index-page-button:hover {
		transform: translate(0px, -1px);
	}
</style>

<script lang="ts">
	interface ButtonType {
		name: String;
		click: () => void;
	}

	export let name: string;
	export let title: string;
	export let image: string | null;
	export let button: ButtonType | null;
</script>

<div
	id={name}
	class="p-6 max-w-sm bg-white rounded-md border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
>
	<div class="flex">
		<img class="h-8 rounded-full" src={image} height="32px" width="32px" alt="Server Card" />
		<h2 class="ml-2 text-2xl font-bold tracking-light text-white">{title}</h2>
	</div>

	{#if button}
		<button
			on:click={button.click}
			class="mt-2 inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-emerald-700 rounded-md focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-700 dark:focus:ring-emerald-800"
			>{button.name}</button
		>
	{/if}
</div>

<div class="p-3" />

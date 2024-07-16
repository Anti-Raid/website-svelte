<script lang="ts">
	import Icon from '@iconify/svelte';

	export let big = false;
	export let type: 'loading' | 'info' | 'error' | 'success';
</script>

{#if type == 'loading'}
	{#if big}
		<div class="text-white text-4xl text-center">
			<Icon icon="mdi:loading" class="animate-spin block text-center m-auto" />
			<slot />
		</div>
	{:else}
		<div class="text-white text-2xl">
			<Icon icon="mdi:loading" class="animate-spin inline-block text-2xl" />
			<slot />
		</div>
	{/if}
{:else if type == 'info'}
	{#if big}
		<div class="text-blue-500 text-4xl text-center">
			<Icon icon="mdi:information" class="inline-block text-2xl" />
			<slot />
		</div>
	{:else}
		<div class="text-blue-500 text-2xl">
			<Icon icon="mdi:information" class="inline-block text-3xl align-top" />
			<slot />
		</div>
	{/if}
{:else if type == 'error'}
	{#if big}
		<div class="text-red-500 text-4xl text-center">
			<Icon icon="mdi:alert" class="inline-block text-2xl" />
			<slot />
		</div>
	{:else}
		<div class="text-red-500 text-2xl">
			<Icon icon="mdi:alert" class="inline-block text-3xl align-top" />
			<slot />
		</div>
	{/if}
{:else if type == 'success'}
	{#if big}
		<div class="text-green-500 text-4xl text-center">
			<Icon icon="mdi:check" class="inline-block text-2xl" />
			<slot />
		</div>
	{:else}
		<div class="text-green-500 text-2xl">
			<Icon icon="mdi:check" class="inline-block text-3xl align-top" />
			<slot />
		</div>
	{/if}
{/if}

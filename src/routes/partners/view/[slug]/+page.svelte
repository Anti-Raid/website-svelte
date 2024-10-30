<script lang="ts">
	import Meta from '../../../../components/Meta.svelte';
	import type { PageData } from './$types';

	const ImageLoadError = (err: any) => {
		err.target.src = '/logo.png';
	};

	export let data: PageData;
</script>

<Meta
	title="{data.partner?.name || 'Unknown Partner'} - AntiRaid"
	description={data.partner?.description || 'Unknown Partner'}
	image={data.partner?.logo}
/>

{#if data.partner}
	<div class="flex">
		<img
			class="h-10 rounded-full"
			src={data.partner.logo}
			height="40px"
			width="40px"
			alt={data.partner.name}
			on:error={ImageLoadError}
		/>

		<h2 class="ml-2 text-primary-400 font-bold font-monster text-4xl">{data.partner.name}</h2>
	</div>

	<h6 class="mt-2 text-primary-400 font-bold font-cabin text-lg">
		{data.partner.description}
	</h6>

	<div class="p-3" />

	<div class="links">
		<p class="font-bold text-white font-monster">
			If you wish to support <span class="underline">{data.partner.name}</span>, you may click on
			one of their provided links down below!
		</p>

		{#each data.partner.links as button}
			<button
				class="w-full mt-2 rounded-md px-3 py-2 text-sm font-semibold bg-surface-800 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
				on:click={() => {
					window.location.href = button.link;
				}}
			>
				{#if button.emoji.startsWith('fa')}
					<i class="{button.emoji} text-white" />
				{:else}
					<span>{button.emoji}</span>
				{/if}

				<span class="ml-1">{button.name}</span>
			</button>
		{/each}
	</div>
{/if}

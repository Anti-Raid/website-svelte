<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const TENOR_CLIENT: string = 'boxwood-builder-373100';
	const TENOR_KEY: string = 'AIzaSyAjs3Rq6O1g45-Cxo8wkgTQ8nsCwaIfTw0';
	const TENOR_REGION: string = 'en-US';
	const TENOR_LIMIT: number = 12;

	let searchQuery: string = '';
	let Categories: any = null;

	const limit = (value: any, max_chars: any) => {
		let i;

		if (value.length > max_chars) i = value.substr(0, max_chars);
		else i = value;

		return i;
	};

	onMount(async () => {
		Categories = await fetch(
			`https://tenor.googleapis.com/v2/categories?key=${TENOR_KEY}&client_key=${TENOR_CLIENT}&locale=${TENOR_REGION}&limit=${String(
				TENOR_LIMIT
			)}`
		).then(async (res) => {
			if (res.ok) return limit(await res.json(), TENOR_LIMIT);
			else
				return {
					error: true,
					status: res.status
				};
		});
	});

	let GIFs: any = null;

	const CategorySelect = async (path: string) => {
		const categoriesDOM = document.getElementById('tenor_categories') as HTMLDivElement;
		categoriesDOM.remove();

		GIFs = await fetch(
			`https://tenor.googleapis.com${path}&key=${TENOR_KEY}&client_key=${TENOR_CLIENT}&limit=${String(
				TENOR_LIMIT
			)}`
		).then((res) => limit(res.json(), TENOR_LIMIT));
	};

	const GIFSelect = (url: string) => {
		const gifsDOM = document.getElementById('tenor_gifs') as HTMLDivElement;
		const searchBar = document.getElementById('tenor_search') as HTMLDivElement;
		const tenorSep = document.getElementById('tenor_sep') as HTMLDivElement;

		gifsDOM.remove();
		searchBar.remove();
		tenorSep.remove();

		dispatch('selected', {
			gif: url
		});
	};

	const searchTenor = async () => {
		const categoriesDOM = document.getElementById('tenor_categories') as HTMLDivElement;
		if (categoriesDOM) categoriesDOM.remove();

		const url = `https://tenor.googleapis.com/v2/search?q=${searchQuery}&key=${TENOR_KEY}&client_key=${TENOR_CLIENT}&limit=${String(
			TENOR_LIMIT
		)}`;
		GIFs = await fetch(url).then((res) => limit(res.json(), TENOR_LIMIT));
	};
</script>

<div id="tenor_sep" class="p-3" />

<div id="tenor_search">
	<div class="flex">
		<input
			type="text"
			class="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 bg-surface-800 text-primary-600 font-bold placeholder-primary-400 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-surface-500 sm:text-sm"
			placeholder="Search Tenor"
			bind:value={searchQuery}
		/>

		<button
			class="bg-surface-800 text-primary-400 font-bold text-base p-3 ml-3 rounded-full border border-white"
			type="button"
			on:click={searchTenor}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="w-6 h-6"
			>
				<path
					fill-rule="evenodd"
					d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

	<div class="p-3" />
</div>

{#if Categories && !Categories.error}
	<div id="tenor_categories" class="grid gap-4 grid-cols-3 grid-rows-3">
		{#each Categories.tags as tag}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				id="tag_{tag.searchterm}"
				class="inline-grid"
				on:click={() => CategorySelect(tag.path)}
			>
				<div class="relative overflow-hidden rounded-md shadow-md cursor-pointer">
					<img loading="lazy" class="object-cover w-full h-20" src={tag.image} alt={tag.name} />

					<div class="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gray-800 opacity-70">
						<h3 class="text-sm text-center text-white font-bold overflow-none">
							{tag.name.replace('#', '')}
						</h3>
					</div>
				</div>
			</button>
		{/each}
	</div>
{/if}

{#if GIFs && !GIFs.error}
	<div id="tenor_gifs" class="grid gap-4 grid-cols-3 grid-rows-3">
		{#each GIFs.results as gif}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				id="gif_{gif.id}"
				class="inline-grid"
				on:click={() => GIFSelect(gif.media_formats['gif'].url)}
			>
				<div class="relative overflow-hidden rounded-md shadow-md cursor-pointer">
					<img
						loading="lazy"
						class="object-cover w-full h-20"
						src={gif.media_formats['tinygif'].url}
						alt={gif.content_description}
					/>
				</div>
			</button>
		{/each}
	</div>
{/if}

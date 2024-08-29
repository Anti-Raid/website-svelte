<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean = false;

	const themes = [
		{ id: 'rocket', color: 'rocket', label: 'Rocket' },
		{ id: 'skeleton', color: 'skeleton', label: 'Skeleton' },
		{ id: 'wintry', color: 'wintry', label: 'Wintry' },
		{ id: 'modern', color: 'modern', label: 'Modern' },
		{ id: 'seafoam', color: 'seafoam', label: 'Seafoam' },
		{ id: 'vintage', color: 'vintage', label: 'Vintage' },
		{ id: 'sahara', color: 'sahara', label: 'Sahara' },
		{ id: 'hamlindigo', color: 'hamlindigo', label: 'Hamlindigo' },
		{ id: 'gold-nouveau', color: 'gold-nouveau', label: 'Gold Nouveau' },
		{ id: 'crimson', color: 'crimson', label: 'Crimson' }
	];

	// Temporary
	let theme: string = 'gold-nouveau';
	const changeColor = (th: string) => {
		theme = th;
		document.querySelector('#antiraid')?.setAttribute('data-theme', th);
		localStorage.setItem('theme->antiraid', th);
	};

	$: {
		if (browser) {
			theme = localStorage.getItem('theme->antiraid') || 'gold-nouveau';
			document.querySelector('#antiraid')?.setAttribute('data-theme', theme);
		}
	}
</script>

{#if isOpen}
	<div
		class="absolute z-50 transition transform translate-y-0 opacity-100 w-56 lg:w-72 -right-5 md:right-0 sm:px-0"
	>
		<div
			class="overflow-x-hidden overflow-y-scroll bg-black rounded-lg shadow-lg dropdown-container ring-1 ring-black ring-opacity-5"
		>
			<div class="px-1 py-2 space-y-1">
				{#each themes as th}
					<button
						on:click={() => {
							changeColor(th.id);
						}}
						class={`group flex rounded-md items-center w-full px-3 py-2 transition-all duration-150 ${
							theme === th.id
								? `text-white bg-primary-500 shadow-md shadow-violet-500/10 hover:bg-primary-500`
								: 'text-white/75 hover:text-white/100 hover:bg-gray-800/20'
						} `}
					>
						<div data-theme={th.color} class="flex items-center justify-between w-full">
							<span
								class={`text-white font-bold font-cabin tracking-tight hover:bg-${String(
									th.color
								)}-500`}
							>
								{th.label}
							</span>
							<Icon
								icon="ic:round-circle"
								class={`${
									theme === th.id ? 'border-white dark:border-black' : 'border-black/0'
								} border-2 rounded-full bg-primary-500/80 mr-1`}
							/>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

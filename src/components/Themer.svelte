<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean = false;

	const themes = [
		{ id: 'amber', color: 'amber', label: 'Amber', class: 'text-amber', new: false },
		{ id: 'amethyst', color: 'amethyst', label: 'Amethyst', class: 'text-amethyst', new: false },
		{ id: 'blackout', color: 'blackout', label: 'Blackout', class: 'text-blackout', new: true },
		{ id: 'cyberpunk', color: 'cyberpunk', label: 'Cyberpunk', class: 'text-cyberpunk', new: true },
		{ id: 'sandstorm', color: 'sandstorm', label: 'Sandstorm', class: 'text-sandstorm', new: true },
		{ id: 'emerald', color: 'emerald', label: 'Emerald', class: 'text-emerald', new: false },
		{ id: 'forest', color: 'forest', label: 'Forest', class: 'text-forest', new: true },
		{ id: 'midnight', color: 'midnight', label: 'Midnight', class: 'text-midnight', new: true },
		{ id: 'ocean', color: 'ocean', label: 'Ocean', class: 'text-ocean', new: true },
		{ id: 'quartz', color: 'ocean', label: 'Quartz', class: 'text-quartz', new: true },
		{ id: 'rose', color: 'rose', label: 'Rose', class: 'text-rose', new: false },
		{ id: 'skyline', color: 'skyline', label: 'Skyline', class: 'text-skyline', new: false },
		{ id: 'tropical', color: 'tropical', label: 'Tropical', class: 'text-tropical', new: true },
		{ id: 'wine', color: 'wine', label: 'Wine', class: 'text-wine', new: true }
	];

	// Temporary
	let theme: string = 'amber';
	const changeColor = (th: string) => {
		theme = th;
		document.documentElement.setAttribute('data-theme', th);
		localStorage.setItem('theme->antiraid', th);
	};

	$: {
		if (browser) {
			theme = localStorage.getItem('theme->antiraid') || 'amber';
			document.documentElement.setAttribute('data-theme', theme);
		}
	}
</script>

{#if isOpen}
	<div
		class="absolute z-50 transition transform translate-y-0 opacity-100 lg:w-72 -right-5 md:right-0 sm:px-0"
	>
		<div
			class="overflow-x-hidden overflow-y-scroll bg-black rounded-lg shadow-lg dropdown-container ring-1 ring-black ring-opacity-5"
		>
			<div class="px-1 py-2 space-y-1">
				{#each themes as th}
					<button
						name="some_button3"
						on:click={() => {
							changeColor(th.id);
						}}
						class={`group flex rounded-md items-center w-full px-3 py-2 transition-all duration-150 ${
							theme === th.id
								? `text-white bg-themable-500 shadow-md shadow-violet-500/10 hover:bg-themable-500`
								: 'text-white/75 hover:text-white/100 hover:bg-gray-800/20'
						} `}
					>
						<div class="flex items-center justify-between w-full">
							<span class={`hover:bg-${String(th.color)}-500`}>
								{th.label}
								{#if th.new}
									<span
										class={`ml-2 text-xs font-semibold ${th.class} bg-dark px-1.5 py-0.5 rounded-full`}
									>
										NEW
									</span>
								{/if}
							</span>
							<Icon
								icon="ic:round-circle"
								class={`${
									theme === th.id ? 'border-white dark:border-black' : 'border-black/0'
								} border-2 rounded-full ${th.class} mr-1`}
							/>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

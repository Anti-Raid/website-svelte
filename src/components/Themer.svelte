<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean = false;

	const themes = [{ id: 'rocket', color: 'rocket', label: 'Rocket', class: 'text-primary-500' }];

	// Temporary
	let theme: string = 'amber';
	const changeColor = (th: string) => {
		//theme = th;
		//document.documentElement.setAttribute('data-theme', th);
		//localStorage.setItem('theme->antiraid', th);
	};

	$: {
		if (browser) {
			//theme = localStorage.getItem('theme->antiraid') || 'amber';
			//document.documentElement.setAttribute('data-theme', theme);
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
								? `text-white bg-primary-500 shadow-md shadow-violet-500/10 hover:bg-primary-500`
								: 'text-white/75 hover:text-white/100 hover:bg-gray-800/20'
						} `}
					>
						<div class="flex items-center justify-between w-full">
							<span class={`hover:bg-${String(th.color)}-500`}>
								{th.label}
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

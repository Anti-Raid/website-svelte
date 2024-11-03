<script lang="ts">
	import { PageData } from './$types';
	import Breadcrumb from '@components/Breadcrumb.svelte';
	import Meta from '@components/Meta.svelte';

	const ImageLoadError = (err: any) => {
		err.target.src = '/logo.webp';
	};

	export let data: PageData;
</script>

<Meta
	title="Partners - AntiRaid"
	description="Take a look at our amazing partners, that help us stand where we are today!"
/>

<section id="partners">
	<Breadcrumb
		Title="Partners"
		Description="Take a look at our amazing partners, that help us stand where we are today!"
	/>

	<div class="p-3" />

	<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
		{#each data.partners as partner}
			<div class="self-auto">
				<div
					class="block max-w-sm p-4 border rounded-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700 text-primary-400"
				>
					<div class="partner">
						<h2 class="flex">
							<img
								class="h-8 w-8 rounded-full"
								src={partner.logo}
								height="32px"
								width="32px"
								alt={partner.name}
								on:error={ImageLoadError}
							/>
							<p class="ml-2 mt-1 mb-1 font-bold font-monster">{partner.name}</p>
						</h2>

						<h2 class="mt-1 text-base font-semibold font-cabin overflow-x-auto">
							{partner.description}
						</h2>

						<a
							class="mt-1 inline-flex items-center bg-surface-600 rounded-full h-[40px] pr-2"
							href={partner.owner_website || '#'}
						>
							<img
								class="h-[40px] rounded-full"
								src={partner.owner_image}
								height="40px"
								width="40px"
								alt={partner.owner}
								on:error={ImageLoadError}
							/>

							<p class="ml-2 font-bold text-md font-cabin hover:underline">
								{partner.owner}
							</p>
						</a>

						<div class="partner-buttons">
							<div class="view">
								<button
									class="mt-2 w-full rounded-md px-3 py-2 text-sm font-semibold bg-surface-500 text-white font-monster shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
									on:click={() => {
										window.location.href = '/partners/view/' + partner.name.replaceAll(' ', '%20');
									}}>View More...</button
								>
							</div>

							<div class="links">
								{#each partner.links as button}
									<button
										class="mt-2 first:ml-0 ml-2 rounded-md px-3 py-2 text-sm font-semibold bg-surface-500 text-white font-monster shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

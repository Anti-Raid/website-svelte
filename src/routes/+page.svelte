<script lang="ts">
	import Meta from '@components/Meta.svelte';
	import Breadcrumb from '@components/Breadcrumb.svelte';
	import Icon from '@iconify/svelte';
	import { Benefits } from '@components/common/BotFeatures.svelte';
	import Benefit from '@components/Benefit.svelte';

	let serverCount: String = '11,620';
	let elemCarousel: HTMLDivElement;

	const carouselLeft = (): void => {
		const x =
			elemCarousel.scrollLeft === 0
				? elemCarousel.clientWidth * elemCarousel.childElementCount
				: elemCarousel.scrollLeft - elemCarousel.clientWidth;
		elemCarousel.scroll(x, 0);
	};

	const carouselRight = (): void => {
		const x =
			elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
				? 0 // loop
				: elemCarousel.scrollLeft + elemCarousel.clientWidth;
		elemCarousel.scroll(x, 0);
	};
</script>

<Meta
	title="Home"
	description="This website is extremely experimental, and should not be used by the public at this time."
/>

<section class="mt-6 text-center">
	<h1 class="text-4xl font-cabin font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
		<span class="inline text-white">Protect your</span>
		<a
			href="/invite"
			class="block xl:inline hover:underline bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-400"
			>Discord Server</a
		>
	</h1>

	<p class="block mx-auto text-xl font-monster font-bold text-white mt-5 max-w-full">
		Join the other <span
			class="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-400"
			>{serverCount}</span
		>
		servers that use
		<img
			class="inline-flex mb-1 h-8 w-8 bg-surface-400/40 rounded-full"
			src="/logo.webp"
			alt="AntiRaid Logo"
		/>
		AntiRaid and protect your server today!
	</p>

	<div class="mt-5 sm:mt-8 flex justify-center items-center">
		<div class="rounded-md shadow">
			<a
				href="/invite"
				class="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-bold font-monster text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
			>
				<Icon icon="mdi:plus" /> Invite
			</a>
		</div>

		<div class="ml-2">
			<a
				href="https://docs.antiraid.xyz"
				class="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-bold font-monster text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg"
				>User Guide <Icon icon="fa-solid:arrow-right" class="pl-1 inline-block w-5" />
			</a>
		</div>
	</div>
</section>

<div class="m-8" />

<section id="features">
	<Breadcrumb Title="Features" Description="What do we have to offer?" />
	<div class="p-3" />

        {#each Benefits as benefit}
	    <Benefit icon={benefit.Icon} title={benefit.Title}>
		<p class="text-xs/4 md:text-sm lg:text-base font-medium font-monster tracking-tight">
		   {@html benefit.Description}
		</p>
	    </Benefit>
            <div class="p-3" />
	{/each}

	<!--<div class="card p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
		<button type="button" class="btn-icon variant-filled" on:click={carouselLeft}>
			<i class="fa-solid fa-arrow-left" />
		</button>

		<div bind:this={elemCarousel} class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto">
		</div>

		<button type="button" class="btn-icon variant-filled" on:click={carouselRight}>
			<i class="fa-solid fa-arrow-right" />
		</button>
	</div>-->
</section>

<div class="p-3" />

<section id="climateclock">
	<Breadcrumb
		Title="Climate Clock"
		Description="Time is running out for our planet! Climate Change is threatening to cause irreversible damage! At AntiRaid, we contribute 0.5% of our revenue to initiatives focused on reducing emissions. Join us in creating a positive change for a better future!"
	/>
	<div class="mt-3" />

	<button
		on:click={() => (window.location.href = 'https://climate.purrquinox.com/')}
		class="ml-2 flex items-center w-half justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-bold font-monster text-white hover:bg-indigo-700 md:py-3 md:px-4 md:text-lg"
	>
		Learn More <Icon icon="fa-solid:arrow-right" class="pl-2 inline-block w-5" />
	</button>

	<div class="mt-5" />

	<center>
		<climate-clock />
	</center>
</section>

<div class="p-3" />

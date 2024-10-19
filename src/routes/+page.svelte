<script>
	import Meta from '../components/Meta.svelte';
	import Breadcrumb from '../components/Breadcrumb.svelte';
	import Icon from '@iconify/svelte';
	import BotFeatures from '../components/common/BotFeatures.svelte';
</script>

<Meta
	title="Home"
	description="This website is extremely experimental, and should not be used by the public at this time."
/>

<section class="mt-6 text-center">
	<h1 class="text-4xl font-cabin font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
		<span class="inline text-white">Protect your</span>
		<a href="/invite" class="block text-indigo-400 xl:inline hover:text-red-600">Discord Server</a>
	</h1>

	<p class="block mx-auto text-xl font-monster font-medium text-white mt-5 max-w-full">
		With <img
			class="inline-flex mb-1 h-8 w-8 bg-surface-400/40 rounded-full"
			src="/logo.webp"
			alt="AntiRaid Logo"
		/>
		AntiRaid, you can easily protect your
		<a href="/invite" class="font-bold tracking-tight text-primary-400 hover:text-red-600"
			>Discord Server</a
		> in a matter of seconds!
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
				href="/about"
				class="flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-bold font-monster text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg"
				>Learn More <Icon icon="fa-solid:arrow-right" class="pl-1 inline-block w-5" />
			</a>
		</div>
	</div>
</section>

<div class="m-8" />

<section id="features">
	<Breadcrumb Title="Features" Description="What do we have to offer?" />
	<div class="mt-5" />

	<center>
		<dl class="mx-2.5 space-y-4 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
			<BotFeatures />
		</dl>
	</center>
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

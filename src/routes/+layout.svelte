<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import Header from '@components/Header.svelte';
	import Footer from '@components/Footer.svelte';
	import ForumHeader from '@components/forums/Header.svelte';
	import Loading from '@components/Loading.svelte';
	import { page } from '$app/stores';

	let loaded: boolean = false;
	if ($page.url.pathname != '/') loaded = true;

	let headerBeShowed: boolean = true;
	$: headerBeShowed = !$page.url.pathname.startsWith('/forums');
</script>

<section id="content">
	{#if loaded}
		<div class="min-h-screen bg-gradient-to-b from-surface-800 to-surface-500">
			{#if headerBeShowed}
				<Header />
			{:else}
				<ForumHeader />
			{/if}

			<article class="min-h-screen flex-col justify-between overflow-x-hidden">
				<main class="mt-9 p-1 w-full md:max-w-7xl mx-auto h-full min-h-screen">
					<slot />
				</main>

				<Footer />
			</article>
		</div>
	{:else}
		<Loading on:close={() => (loaded = true)} />
	{/if}
</section>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<script lang="ts">
	import '../app.postcss';
	import Header from '../components/Header.svelte';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { getVersion } from '$lib/configs/functions/versioner';
</script>

<Header />

<article class="min-h-screen flex-col justify-between overflow-x-hidden">
	<main class="mt-9 p-3 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full min-h-screen">
		<slot />
		<SvelteToast options={{}} />
	</main>

	<footer class="mb-auto border-white border-t-2">
		<p class="text-center text-white text-md font-semibold">&copy; 2024 Anti-Raid Development</p>
		<small class="text-center text-white text-sm font-semibold">
			{getVersion()}
		</small>
	</footer>
</article>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>

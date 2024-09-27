<script lang="ts">
	import '../app.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import Header from '../../components/Header.svelte';
	import Popup from '../../components/forums/Popup.svelte';
	import { PUBLIC_ENVIRONMENT } from '$env/static/public';
	import type { PageData } from './$types';

	const MainButton = {
		Name: 'Continue',
		Function: () => {
			const popup = document.getElementById('popup') as HTMLDivElement;
			popup.innerHTML = '';
		}
	};

	const SecondaryButton = {
		Name: 'Redirect to Production',
		Function: () => {
			window.location.href = 'https://antiraid.xyz/forums';
		}
	};

	export let data: PageData;
</script>

<section id="content">
	<header>
		<Header />
	</header>

	<div class="p-3" />

	<main class="m-4">
		{#if PUBLIC_ENVIRONMENT === 'development'}
			<Popup
				Title="⚠️ Warning"
				Description="This version is under development and may be unstable. The production environment is recommended for public use!"
				{MainButton}
				{SecondaryButton}
			/>
		{/if}

		<slot />
	</main>
</section>
<script>
	import '../app.css';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import Header from '../components/Header.svelte';
	import Nightmare from '../components/Nightmare.svelte';

	onMount(async () => {
		// Sentry
		const Sentry = await import('@sentry/browser');

		Sentry.init({
			dsn: 'https://77411f26652c6ae892ae07782d762b74@trace.select-list.xyz/6',
			replaysSessionSampleRate: 0.3,
			tracesSampleRate: 0.4,
			replaysOnErrorSampleRate: 1.0,
			integrations: [new Sentry.Replay()],
			release: `ar_web@0877309`
		});
	});

	export let data;
</script>

<Header user={data.user || null} />

<Nightmare
	Title="Home"
	Description="This website is extremely experimental, and should not be used by the public at this time."
/>

<div class="m-4">
	<slot />
</div>

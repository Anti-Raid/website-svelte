<script>
	import '../app.css';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import Header from '../components/Header.svelte';

    import Nightmare from '../components/Nightmare.svelte';

	export let data;
</script>

<Header user={data.user || null} />

<Nightmare
    Title="Home"
    Description="Nightmare"
/>

<div class="m-4">
	<slot />
</div>

<script>
	import '../app.css';
	import Header from "../components/Header.svelte";

	export let data;
</script>

<Header user={data.user || null} />

<div class="m-4">
	<slot />
</div>
<script>
	import { page } from '$app/stores';
</script>

<div class="items-center content-center" id="error">
	<h1 class="text-6xl text-center font-bold tracking-tight text-indigo-600">{$page.status}</h1>
	<p class="text-3xl text-center text-white">{$page.error.message}</p>
</div>

<script>
    import { page } from "$app/stores";
</script>

<div id="error">
    <h1 class="text-4xl font-bold tracking-tight text-indigo-600">{$page.status}</h1>
    <p class="text-2xl text-gray-900">{$page.error.message}</p>
</div>